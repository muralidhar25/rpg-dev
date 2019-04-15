// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AspNet.Security.OpenIdConnect.Extensions;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication;
using AspNet.Security.OpenIdConnect.Server;
using OpenIddict.Core;
using AspNet.Security.OpenIdConnect.Primitives;
using DAL.Models;
using DAL.Core;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using Newtonsoft.Json;
using System.Net.Http;
using Microsoft.AspNetCore.Authorization;
using RPGSmithApp.ViewModels;
using DAL.Core.Interfaces;
using RPGSmithApp.Helpers;
using Microsoft.WindowsAzure.Storage.Blob;
using DAL.Services;


// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860


namespace RPGSmithApp.Controllers
{
    public class AuthorizationController : Controller
    {
        private readonly IOptions<IdentityOptions> _identityOptions;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IAccountManager _accountManager;
        private readonly BlobService _blobService = new BlobService(null,null);
        private readonly IRuleSetService _ruleSetService;

        public AuthorizationController(
            IOptions<IdentityOptions> identityOptions,
            SignInManager<ApplicationUser> signInManager,
            UserManager<ApplicationUser> userManager, IAccountManager accountManager,
            IRuleSetService ruleSetService)
        {
            _identityOptions = identityOptions;
            _signInManager = signInManager;
            _userManager = userManager;
            _accountManager = accountManager;
            _ruleSetService = ruleSetService;
        }


        [HttpPost("~/connect/token")]
        [Produces("application/json")]
        public async Task<IActionResult> Exchange(OpenIdConnectRequest request)
        {
            if (request.IsPasswordGrantType())
            {
                var user = await _userManager.FindByEmailAsync(request.Username) ?? await _userManager.FindByNameAsync(request.Username);
               
                if (user == null)
                {
                    var users = await _accountManager.GetUsersAndRolesAsync(-1, -1);
                    if (users.Where(x => x.Item1.TempUserName == request.Username && x.Item1.EmailConfirmed != true).Count() > 0)
                    {
                        return BadRequest(new OpenIdConnectResponse
                        {
                            Error = OpenIdConnectConstants.Errors.InvalidGrant,
                            ErrorDescription = "The specified user account is either disabled or has not yet been confirmed."
                        });
                    }

                    return BadRequest(new OpenIdConnectResponse
                    {
                        Error = OpenIdConnectConstants.Errors.InvalidGrant,
                        ErrorDescription = "Please check that your email and password is correct"
                    });
                }

                if (user.IsDeleted)
                {
                    return BadRequest(new OpenIdConnectResponse
                    {
                        Error = OpenIdConnectConstants.Errors.InvalidGrant,
                        ErrorDescription = "Please check that your email and password is correct"
                    });
                }

                // Ensure the user is enabled.
                if (!user.IsEnabled)
                {
                    return BadRequest(new OpenIdConnectResponse
                    {
                        Error = OpenIdConnectConstants.Errors.InvalidGrant,
                        ErrorDescription = "The specified user account is either disabled or has not yet been confirmed."
                    });
                }
                
                // Validate the username/password parameters and ensure the account is not locked out.
                var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, true);
                
                // Ensure the user is not already locked out.
                if (result.IsLockedOut)
                {
                    return BadRequest(new OpenIdConnectResponse
                    {
                        Error = OpenIdConnectConstants.Errors.InvalidGrant,
                        ErrorDescription = "The specified user account has been suspended for 1 minute."
                    });
                }

                // Reject the token request if two-factor authentication has been enabled by the user.
                if (result.RequiresTwoFactor)
                {
                    return BadRequest(new OpenIdConnectResponse
                    {
                        Error = OpenIdConnectConstants.Errors.InvalidGrant,
                        ErrorDescription = "Invalid login procedure"
                    });
                }

                // Ensure the user is allowed to sign in.
                if (result.IsNotAllowed)
                {
                    return BadRequest(new OpenIdConnectResponse
                    {
                        Error = OpenIdConnectConstants.Errors.InvalidGrant,
                        ErrorDescription = "The specified user is not allowed to sign in"
                    });
                }

                if (!result.Succeeded)
                {
                    return BadRequest(new OpenIdConnectResponse
                    {
                        Error = OpenIdConnectConstants.Errors.InvalidGrant,
                        ErrorDescription = "Please check that your email and password is correct"
                    });
                }

                //create blob storage for user if not exist
                if (user != null) await CreateBlobIfNotExistsAsync("user-" + user.Id);

                // Create a new authentication ticket.
                var ticket = await CreateTicketAsync(request, user);
                return SignIn(ticket.Principal, ticket.Properties, ticket.AuthenticationScheme);
            }
            else if (request.GrantType == "urn:ietf:params:oauth:grant-type:facebook_identity_token")
            {

                // Reject the request if the "assertion" parameter is missing.
                if (string.IsNullOrEmpty(request.Assertion))
                {
                    return BadRequest(new OpenIdConnectResponse
                    {
                        Error = OpenIdConnectConstants.Errors.InvalidRequest,
                        ErrorDescription = "The mandatory 'assertion' parameter was missing."
                    });
                }

                var httpClient = new HttpClient { BaseAddress = new Uri("https://graph.facebook.com/v2.9/") };
                var response = await httpClient.GetAsync($"me?access_token={request.Assertion}&fields=id,name,email,first_name,last_name,age_range,birthday,gender,locale,picture");
                if (!response.IsSuccessStatusCode) return BadRequest();
                var result = await response.Content.ReadAsStringAsync();
                var facebookAccount = JsonConvert.DeserializeObject<FacebookRespondViewModel>(result);

                if (facebookAccount.email == null)
                    return BadRequest(new OpenIdConnectResponse
                    {
                        Error = OpenIdConnectConstants.Errors.RegistrationNotSupported,
                        ErrorDescription = "Registration not supported. Please confirm your email address."
                    });

                var user = await _userManager.FindByEmailAsync(facebookAccount.email);
                if (user == null)
                {
                    var appUser = new ApplicationUser
                    {
                        Email = facebookAccount.email,
                        UserName = facebookAccount.email,
                        FullName = facebookAccount.first_name + " " + facebookAccount.last_name,
                        CreatedDate = DateTime.UtcNow,
                        UpdatedDate = DateTime.UtcNow,
                        IsEnabled = true,
                        IsDeleted = false,
                        IsSocialLogin = true
                    };

                    await _userManager.CreateAsync(appUser);
                    var usercreateresult = await _userManager.AddToRoleAsync(appUser, "User");
                    if (!usercreateresult.Succeeded)
                    {
                        return BadRequest();
                    }
                    else {
                        user = await _userManager.FindByEmailAsync(facebookAccount.email);
                        Utilities.AddDefaultCoreRuleset(user.Id, _ruleSetService);
                        await _accountManager.CreateUserSlotsAndUpdateInvites(user);
                    }
                }

                //create blob storage for user if not exist
                if (user != null) await CreateBlobIfNotExistsAsync("user-" + user.Id);

                var ticket = await CreateTicketAsync(request, user);

                return SignIn(ticket.Principal, ticket.Properties, ticket.AuthenticationScheme);
            }
            else if (request.GrantType == "urn:ietf:params:oauth:grant-type:google_identity_token")
            {

                // Reject the request if the "assertion" parameter is missing.
                if (string.IsNullOrEmpty(request.Assertion))
                {
                    return BadRequest(new OpenIdConnectResponse
                    {
                        Error = OpenIdConnectConstants.Errors.InvalidRequest,
                        ErrorDescription = "The mandatory 'assertion' parameter was missing."
                    });
                }

                var httpClient = new HttpClient { BaseAddress = new Uri("https://www.googleapis.com/plus/v1/people/") };
                var response = await httpClient.GetAsync($"me?access_token={request.Assertion}");
                if (!response.IsSuccessStatusCode) return BadRequest();
                var result = await response.Content.ReadAsStringAsync();
                var googleAccount = JsonConvert.DeserializeObject<GoogleResponseViewModel>(result);

                var user = await _userManager.FindByEmailAsync(googleAccount.emails.FirstOrDefault().value);

                if (user == null)
                {

                    var appUser = new ApplicationUser
                    {
                        Email = googleAccount.emails.FirstOrDefault().value,
                        UserName = googleAccount.emails.FirstOrDefault().value,
                        FullName = googleAccount.displayName,
                        CreatedDate = DateTime.UtcNow,
                        UpdatedDate = DateTime.UtcNow,
                        IsEnabled = true,
                        IsDeleted = false,
                        IsSocialLogin = true
                    };

                    await _userManager.CreateAsync(appUser);
                    var usercreateresult = await _userManager.AddToRoleAsync(appUser, "User");
                    if (!usercreateresult.Succeeded)
                    {
                        return BadRequest();
                    }
                    else
                    {
                        user = await _userManager.FindByEmailAsync(googleAccount.emails.FirstOrDefault().value);
                        Utilities.AddDefaultCoreRuleset(user.Id, _ruleSetService);
                        await _accountManager.CreateUserSlotsAndUpdateInvites(user);
                    }
                }

                //create blob storage for user if not exist
                if (user != null) await CreateBlobIfNotExistsAsync("user-" + user.Id);

                var ticket = await CreateTicketAsync(request, user);

                return SignIn(ticket.Principal, ticket.Properties, ticket.AuthenticationScheme);
            }
            else if (request.IsRefreshTokenGrantType())
            {
                // Retrieve the claims principal stored in the refresh token.
                var info = await HttpContext.AuthenticateAsync(OpenIdConnectServerDefaults.AuthenticationScheme);

                // Retrieve the user profile corresponding to the refresh token.
                // Note: if you want to automatically invalidate the refresh token
                // when the user password/roles change, use the following line instead:
                // var user = _signInManager.ValidateSecurityStampAsync(info.Principal);
                var user = await _userManager.GetUserAsync(info.Principal);
                if (user == null)
                {
                    return BadRequest(new OpenIdConnectResponse
                    {
                        Error = OpenIdConnectConstants.Errors.InvalidGrant,
                        ErrorDescription = "The refresh token is no longer valid"
                    });
                }

                // Ensure the user is still allowed to sign in.
                if (!await _signInManager.CanSignInAsync(user))
                {
                    return BadRequest(new OpenIdConnectResponse
                    {
                        Error = OpenIdConnectConstants.Errors.InvalidGrant,
                        ErrorDescription = "The user is no longer allowed to sign in"
                    });
                }

                // Create a new authentication ticket, but reuse the properties stored
                // in the refresh token, including the scopes originally granted.
                var ticket = await CreateTicketAsync(request, user);

                return SignIn(ticket.Principal, ticket.Properties, ticket.AuthenticationScheme);
            }
            return BadRequest(new OpenIdConnectResponse
            {
                Error = OpenIdConnectConstants.Errors.UnsupportedGrantType,
                ErrorDescription = "The specified grant type is not supported"
            });
        }

        private async Task<AuthenticationTicket> CreateTicketAsync(OpenIdConnectRequest request, ApplicationUser user)
        {
            // Create a new ClaimsPrincipal containing the claims that
            // will be used to create an id_token, a token or a code.
            var principal = await _signInManager.CreateUserPrincipalAsync(user);

            // Create a new authentication ticket holding the user identity.
            var ticket = new AuthenticationTicket(principal, new AuthenticationProperties(), OpenIdConnectServerDefaults.AuthenticationScheme);


            //if (!request.IsRefreshTokenGrantType())
            //{
            // Set the list of scopes granted to the client application.
            // Note: the offline_access scope must be granted
            // to allow OpenIddict to return a refresh token.
            ticket.SetScopes(new[]
            {
                    OpenIdConnectConstants.Scopes.OpenId,
                    OpenIdConnectConstants.Scopes.Email,
                    OpenIdConnectConstants.Scopes.Phone,
                    OpenIdConnectConstants.Scopes.Profile,
                    OpenIdConnectConstants.Scopes.OfflineAccess,
                    OpenIddictConstants.Scopes.Roles
            }.Intersect(request.GetScopes()));
            //}

            ticket.SetResources(request.GetResources());

            // Note: by default, claims are NOT automatically included in the access and identity tokens.
            // To allow OpenIddict to serialize them, you must attach them a destination, that specifies
            // whether they should be included in access tokens, in identity tokens or in both.

            foreach (var claim in ticket.Principal.Claims)
            {
                // Never include the security stamp in the access and identity tokens, as it's a secret value.
                if (claim.Type == _identityOptions.Value.ClaimsIdentity.SecurityStampClaimType)
                    continue;


                var destinations = new List<string> { OpenIdConnectConstants.Destinations.AccessToken };

                // Only add the iterated claim to the id_token if the corresponding scope was granted to the client application.
                // The other claims will only be added to the access_token, which is encrypted when using the default format.
                if ((claim.Type == OpenIdConnectConstants.Claims.Subject && ticket.HasScope(OpenIdConnectConstants.Scopes.OpenId)) ||
                    (claim.Type == OpenIdConnectConstants.Claims.Name && ticket.HasScope(OpenIdConnectConstants.Scopes.Profile)) ||
                    (claim.Type == OpenIdConnectConstants.Claims.Role && ticket.HasScope(OpenIddictConstants.Claims.Roles)) ||
                    (claim.Type == CustomClaimTypes.Permission && ticket.HasScope(OpenIddictConstants.Claims.Roles)))
                {
                    destinations.Add(OpenIdConnectConstants.Destinations.IdentityToken);
                }


                claim.SetDestinations(destinations);
            }


            var identity = principal.Identity as ClaimsIdentity;


            if (ticket.HasScope(OpenIdConnectConstants.Scopes.Profile))
            {
                if (!string.IsNullOrWhiteSpace(user.JobTitle))
                    identity.AddClaim(CustomClaimTypes.JobTitle, user.JobTitle, OpenIdConnectConstants.Destinations.IdentityToken);

                if (!string.IsNullOrWhiteSpace(user.FullName))
                    identity.AddClaim(CustomClaimTypes.FullName, user.FullName, OpenIdConnectConstants.Destinations.IdentityToken);

                if (!string.IsNullOrWhiteSpace(user.Configuration))
                    identity.AddClaim(CustomClaimTypes.Configuration, user.Configuration, OpenIdConnectConstants.Destinations.IdentityToken);

                if (!string.IsNullOrWhiteSpace(user.ProfileImage))
                    identity.AddClaim(CustomClaimTypes.ProfileImage, user.ProfileImage, OpenIdConnectConstants.Destinations.IdentityToken);
            }

            if (ticket.HasScope(OpenIdConnectConstants.Scopes.Email))
            {
                if (!string.IsNullOrWhiteSpace(user.Email))
                    identity.AddClaim(CustomClaimTypes.Email, user.Email, OpenIdConnectConstants.Destinations.IdentityToken);
            }

            if (ticket.HasScope(OpenIdConnectConstants.Scopes.Phone))
            {
                if (!string.IsNullOrWhiteSpace(user.PhoneNumber))
                    identity.AddClaim(CustomClaimTypes.Phone, user.PhoneNumber, OpenIdConnectConstants.Destinations.IdentityToken);
            }
            identity.AddClaim(CustomClaimTypes.IsGm, user.IsGm.ToString(), OpenIdConnectConstants.Destinations.IdentityToken);
            identity.AddClaim(CustomClaimTypes.RemoveAds, user.RemoveAds.ToString(), OpenIdConnectConstants.Destinations.IdentityToken);

            UserSubscription userSubscription = await _accountManager.userSubscriptions(user.Id);
            if (userSubscription != null)
            {
                identity.AddClaim(CustomClaimTypes.CampaignSlot, userSubscription.CampaignCount.ToString(), OpenIdConnectConstants.Destinations.IdentityToken);
                identity.AddClaim(CustomClaimTypes.RulesetSlot, userSubscription.RulesetCount.ToString(), OpenIdConnectConstants.Destinations.IdentityToken);
                identity.AddClaim(CustomClaimTypes.CharacterSlot, userSubscription.CharacterCount.ToString(), OpenIdConnectConstants.Destinations.IdentityToken);
                identity.AddClaim(CustomClaimTypes.PlayerSlot, userSubscription.PlayerCount.ToString(), OpenIdConnectConstants.Destinations.IdentityToken);
                identity.AddClaim(CustomClaimTypes.StorageSpaceInMB, userSubscription.StorageSpaceInMB.ToString(), OpenIdConnectConstants.Destinations.IdentityToken);
            }
            else
            {
                identity.AddClaim(CustomClaimTypes.CampaignSlot, string.Empty, OpenIdConnectConstants.Destinations.IdentityToken);
                identity.AddClaim(CustomClaimTypes.RulesetSlot, string.Empty, OpenIdConnectConstants.Destinations.IdentityToken);
                identity.AddClaim(CustomClaimTypes.CharacterSlot, string.Empty, OpenIdConnectConstants.Destinations.IdentityToken);
                identity.AddClaim(CustomClaimTypes.PlayerSlot, string.Empty, OpenIdConnectConstants.Destinations.IdentityToken);
                identity.AddClaim(CustomClaimTypes.StorageSpaceInMB, string.Empty, OpenIdConnectConstants.Destinations.IdentityToken);
            }

            return ticket;
        }

        private async Task<CloudBlobContainer> CreateBlobIfNotExistsAsync(string UserIdAsContainer)
        {
            if (!HttpContext.Request.Host.ToUriComponent().ToLower().Contains("localhost"))
                return await _blobService.GetCloudBlobContainer(UserIdAsContainer);
            else return null;
        }
                   
    }
}
