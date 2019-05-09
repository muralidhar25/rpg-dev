// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using RPGSmithApp.ViewModels;
using AutoMapper;
using DAL.Models;
using DAL.Core.Interfaces;
using RPGSmithApp.Authorization;
using RPGSmithApp.Helpers;
using Microsoft.AspNetCore.JsonPatch;
using DAL.Core;
using System.Net.Http;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Http;
using System.Net;
using System.IO;
using System.Dynamic;
using Microsoft.Extensions.Logging;
using DAL;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using DAL.Repositories.Interfaces;
using System.Linq;
using DAL.Services;

namespace RPGSmithApp.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    public class AccountController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        private readonly IAuthorizationService _authorizationService;
        private readonly UserManager<ApplicationUser> _userManager;
        private const string GetUserByIdActionName = "GetUserById";
        private const string GetRoleByIdActionName = "GetRoleById";
        private readonly IEmailer _emailer;
        private readonly ILogger _logger;
        private readonly IRuleSetService _ruleSetService;
        private readonly ICharacterService _characterService;


        public AccountController(IAccountManager accountManager, IAuthorizationService authorizationService,
            ILogger<AccountController> logger, IEmailer emailer, IHttpContextAccessor httpContextAccessor,
            UserManager<ApplicationUser> userManager,
            IRuleSetService ruleSetService, ICharacterService characterService)
        {
            _accountManager = accountManager;
            _authorizationService = authorizationService;
            _emailer = emailer;
            _httpContextAccessor = httpContextAccessor;
            _userManager = userManager;
            _logger = logger;
            _ruleSetService = ruleSetService;
            _characterService = characterService;

        }

        [HttpGet("users/me")]
        [Produces(typeof(UserViewModel))]
        public async Task<IActionResult> GetCurrentUser()
        {
            return await GetUserByUserName(this.User.Identity.Name);
        }

        [HttpGet("users/{id}", Name = GetUserByIdActionName)]
        [Produces(typeof(UserViewModel))]
        public async Task<IActionResult> GetUserById(string id)
        {
            if (!(await _authorizationService.AuthorizeAsync(this.User, id, AccountManagementOperations.Read)).Succeeded)
                return new ChallengeResult();


            UserViewModel userVM = await GetUserViewModelHelper(id);

            if (userVM != null)
                return Ok(userVM);
            else
                return NotFound(id);
        }

        [HttpGet("users/username/{userName}")]
        [Produces(typeof(UserViewModel))]
        public async Task<IActionResult> GetUserByUserName(string userName)
        {
            ApplicationUser appUser = await _accountManager.GetUserByUserNameAsync(userName);

            if (!(await _authorizationService.AuthorizeAsync(this.User, appUser?.Id ?? "", AccountManagementOperations.Read)).Succeeded)
                return new ChallengeResult();

            if (appUser == null)
                return NotFound(userName);

            return await GetUserById(appUser.Id);
        }

        [HttpGet("users")]
        [Produces(typeof(List<UserViewModel>))]
        [Authorize(Authorization.Policies.ViewAllUsersPolicy)]
        public async Task<IActionResult> GetUsers()
        {
            return await GetUsers(-1, -1);
        }

        [HttpGet("users/{page:int}/{pageSize:int}")]
        [Produces(typeof(List<UserViewModel>))]
        [Authorize(Authorization.Policies.ViewAllUsersPolicy)]
        public async Task<IActionResult> GetUsers(int page, int pageSize)
        {
            var usersAndRoles = await _accountManager.GetUsersAndRolesAsync(page, pageSize);

            List<UserViewModel> usersVM = new List<UserViewModel>();

            foreach (var item in usersAndRoles)
            {
                var userVM = Mapper.Map<UserViewModel>(item.Item1);
                userVM.Roles = item.Item2;

                usersVM.Add(userVM);
            }

            return Ok(usersVM);
        }

        [HttpPut("users/me")]
        public async Task<IActionResult> UpdateCurrentUser([FromBody] UserEditViewModel user)
        {
            return await UpdateUser(Utilities.GetUserId(this.User), user);
        }

        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UserEditViewModel user)
        {
            ApplicationUser appUser = await _accountManager.GetUserByIdAsync(id);
            string[] currentRoles = appUser != null ? (await _accountManager.GetUserRolesAsync(appUser)).ToArray() : null;

            var manageUsersPolicy = _authorizationService.AuthorizeAsync(this.User, id, AccountManagementOperations.Update);
            var assignRolePolicy = _authorizationService.AuthorizeAsync(this.User, Tuple.Create(user.Roles, currentRoles), Authorization.Policies.AssignAllowedRolesPolicy);


            if ((await Task.WhenAll(manageUsersPolicy, assignRolePolicy)).Any(r => !r.Succeeded))
                return new ChallengeResult();


            if (ModelState.IsValid)
            {
                if (user == null)
                    return BadRequest($"{nameof(user)} cannot be null");

                if (!string.IsNullOrWhiteSpace(user.Id) && id != user.Id)
                    return BadRequest("Conflicting user id in parameter and model data");

                if (appUser == null)
                    return NotFound(id);


                if (Utilities.GetUserId(this.User) == id && string.IsNullOrWhiteSpace(user.CurrentPassword))
                {
                    if (!string.IsNullOrWhiteSpace(user.NewPassword))
                        return BadRequest("Current password is required when changing your own password");

                    if (appUser.UserName != user.UserName)
                        return BadRequest("Current password is required when changing your own username");
                }


                bool isValid = true;

                if (Utilities.GetUserId(this.User) == id && (appUser.UserName != user.UserName || !string.IsNullOrWhiteSpace(user.NewPassword)))
                {
                    if (!await _accountManager.CheckPasswordAsync(appUser, user.CurrentPassword))
                    {
                        isValid = false;
                        AddErrors(new string[] { "The username/password couple is invalid." });
                    }
                }

                if (isValid)
                {
                    Mapper.Map<UserViewModel, ApplicationUser>(user, appUser);

                    var result = await _accountManager.UpdateUserAsync(appUser, user.Roles);
                    if (result.Item1)
                    {
                        if (!string.IsNullOrWhiteSpace(user.NewPassword))
                        {
                            if (!string.IsNullOrWhiteSpace(user.CurrentPassword))
                                result = await _accountManager.UpdatePasswordAsync(appUser, user.CurrentPassword, user.NewPassword);
                            else
                                result = await _accountManager.ResetPasswordAsync(appUser, user.NewPassword);
                        }
                        if (result.Item1)
                            return NoContent();
                    }

                    AddErrors(result.Item2);
                }
            }

            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpPatch("users/me")]
        public async Task<IActionResult> UpdateCurrentUser([FromBody] JsonPatchDocument<UserPatchViewModel> patch)
        {
            return await UpdateUser(Utilities.GetUserId(this.User), patch);
        }

        [HttpPatch("users/{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] JsonPatchDocument<UserPatchViewModel> patch)
        {
            if (!(await _authorizationService.AuthorizeAsync(this.User, id, AccountManagementOperations.Update)).Succeeded)
                return new ChallengeResult();


            if (ModelState.IsValid)
            {
                if (patch == null)
                    return BadRequest($"{nameof(patch)} cannot be null");


                ApplicationUser appUser = await _accountManager.GetUserByIdAsync(id);

                if (appUser == null)
                    return NotFound(id);


                UserPatchViewModel userPVM = Mapper.Map<UserPatchViewModel>(appUser);
                patch.ApplyTo(userPVM, ModelState);


                if (ModelState.IsValid)
                {
                    Mapper.Map<UserPatchViewModel, ApplicationUser>(userPVM, appUser);

                    var result = await _accountManager.UpdateUserAsync(appUser);
                    if (result.Item1)
                        return NoContent();


                    AddErrors(result.Item2);
                }
            }

            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [AllowAnonymous]
        [HttpPost("Registration")]
        public async Task<IActionResult> Registration([FromBody]  UserRegistraionViewModel model, string emailSubject, string emailConfirmationContent, string url)
        {
            if (ModelState.IsValid)
            {
                var users = await _accountManager.GetUsersAndRolesAsync(-1, -1);

                if (users.Where(x => x.Item1.UserName.ToLower().Trim() == model.UserName.ToLower().Trim() && x.Item1.IsDeleted != true
                    && ((x.Item1.EmailConfirmed == true && x.Item1.IsSocialLogin == false) || (x.Item1.EmailConfirmed == false && x.Item1.IsSocialLogin == true))
                    ).Count() > 0)
                {
                    return BadRequest("UserName already exists");
                }

                model.IsEnabled = false;
                var user = Mapper.Map<ApplicationUser>(model);

                user.TempUserName = user.UserName;
                user.UserName = Guid.NewGuid().ToString();

                var role = new List<string> { model.RoleName };
                (bool success, string[] errorMsg) = await _accountManager.CreateUserAsync(user, role, model.Password);

                if (success)
                {
                    //  var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                    //var callbackUrl = $"{HttpContext.Request.Scheme}://{HttpContext.Request.Host.ToUriComponent()}{HttpContext.Request.PathBase.ToUriComponent()}/" + "email-confirmation?id=" + user.Id;// + "&code=" + WebUtility.UrlEncode(code);
                    //await _emailer.SendEmailAsync(user.FullName, user.Email, "Confirm your account", $"Please confirm your account by clicking this link: <a href='{callbackUrl}'>link</a>");


                    var mailTemplatePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/mail-templates/account-verification.html");
                    var EmailContent = System.IO.File.ReadAllText(mailTemplatePath);
                    EmailContent = EmailContent.Replace("#CONFIRM-URL", $"{url}/" + "email-confirmation-success?id=" + user.Id);

                    var callbackUrl = $"{url}/" + "email-confirmation?id=" + user.Id;// + "&code=" + WebUtility.UrlEncode(code);
                    (bool successMail, string errorMail) = await _emailer.SendEmailAsync(user.FullName, user.Email, emailSubject, EmailContent, isHtml: true);

                    if (!successMail)
                        _logger.LogWarning("Confirmation mail has not been send for " + user.Email + ". " + errorMail);
                    Utilities.AddDefaultCoreRuleset(user.Id, _ruleSetService);
                    return Ok("Please confirm your account");
                }
                else
                {
                    return BadRequest(string.Join(" ", errorMsg));
                }
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpPost("ActiveUserByConfirmEmail")]
        [AllowAnonymous]
        public async Task<IActionResult> ActiveUserByConfirmEmail([FromBody]ConfirmEmailFromAppViewModel ConfirmEmailModel)
        {
            //  var co = WebUtility.UrlDecode(ConfirmEmailModel.userId);



            ApplicationUser appUser = await _accountManager.GetUserByIdAsync(ConfirmEmailModel.userId);
            //var code = await _userManager.GenerateEmailConfirmationTokenAsync(appUser);

            if (appUser == null)
            {
                return BadRequest("User not available please do the registration");
            }
            else if (appUser.EmailConfirmed)
            {
                return Ok("Your Account Has Been Confirmed.");
            }

            var users = await _accountManager.GetUsersAndRolesAsync(-1, -1);

            if (users.Where(x => x.Item1.UserName == appUser.TempUserName && x.Item1.EmailConfirmed == true && x.Item1.IsDeleted != true).Count() > 0)
            {
                await _accountManager.DeleteUserAsync(appUser);
                return BadRequest("The username <" + appUser.TempUserName + "> selected is no longer available please start the registration process again and select a new username");
            }

            //await _userManager.ConfirmEmailAsync(appUser,  code);
            appUser.UserName = appUser.TempUserName;
            appUser.IsEnabled = true;
            appUser.EmailConfirmed = true;
            await _accountManager.UpdateUserAsync(appUser);
            return Ok("Your Account Has Been Confirmed.");
        }

        [HttpGet("~/api/account/resetpassword/{userId}")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPasswordGet(string userId)
        {

            ApplicationUser appUser = await _accountManager.GetUserByIdAsync(userId);
            return Ok(appUser.Email);

        }

        [HttpPost("ResetPassword")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody]  ForgotPasswordViewModel model)
        {
            if (ModelState.IsValid)
            {
                ApplicationUser appUser = await _accountManager.GetUserByIdAsync(model.UserId);
                await _accountManager.ResetPasswordAsync(appUser, model.NewPassword);
                return Ok();

            }

            // If we got this far, something failed, redisplay form
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpPost("ForgotPassword")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody]  ForgotPasswordEmailViewModel model)
        {
            if (ModelState.IsValid)
            {

                ApplicationUser appUser = await _accountManager.GetUserByEmailAsync(model.Email);

                if (appUser == null)
                {
                    return BadRequest("No User Exist For This Email Account");
                }

                var request = _httpContextAccessor.HttpContext.Request;
                var host = request.Host.ToUriComponent();
                var pathBase = request.PathBase.ToUriComponent();

                // var code = await _userManager.GeneratePasswordResetTokenAsync(appUser);

                //var baseUrlOfApp = $"{request.Scheme}://{host}{pathBase}/" + "forgot-password-email?id=" + appUser.Id;// + "&code=" + WebUtility.UrlEncode(code);
                //(bool success, string errorMsg) response = await _emailer.SendEmailAsync(appUser.FullName, appUser.Email, "Reset Your Password", "Please <a href=\"" + baseUrlOfApp + "\">click here</a> to reset your password.", isHtml: true);

                var mailTemplatePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/mail-templates/reset-password.html");
                var EmailContent = System.IO.File.ReadAllText(mailTemplatePath);

                var reset_url = $"{request.Scheme}://{host}{pathBase}/" + "resetpassword?userid=" + appUser.Id;
                EmailContent = EmailContent.Replace("#RESET-URL", reset_url);

                (bool success, string errorMsg) response = await _emailer.SendEmailAsync(appUser.FullName, appUser.Email, "Reset Your Password", EmailContent, isHtml: true);

                if (response.success) return Ok();
                else return BadRequest(response.errorMsg + " Please try again.");
            }

            // If we got this far, something failed, redisplay form
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpPost("users")]
        [Authorize(Authorization.Policies.ManageAllUsersPolicy)]
        public async Task<IActionResult> Register([FromBody] UserEditViewModel user)
        {
            if (!(await _authorizationService.AuthorizeAsync(this.User, Tuple.Create(user.Roles, new string[] { }), Authorization.Policies.AssignAllowedRolesPolicy)).Succeeded)
                return new ChallengeResult();


            if (ModelState.IsValid)
            {
                if (user == null)
                    return BadRequest($"{nameof(user)} cannot be null");


                ApplicationUser appUser = Mapper.Map<ApplicationUser>(user);

                var result = await _accountManager.CreateUserAsync(appUser, user.Roles, user.NewPassword);
                if (result.Item1)
                {
                    UserViewModel userVM = await GetUserViewModelHelper(appUser.Id);
                    return CreatedAtAction(GetUserByIdActionName, new { id = userVM.Id }, userVM);
                }

                AddErrors(result.Item2);
            }

            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        //delete user
        [HttpDelete("users/{id}")]
        [Produces(typeof(UserViewModel))]
        public async Task<IActionResult> Delete(string id)
        {
            if (!(await _authorizationService.AuthorizeAsync(this.User, id, AccountManagementOperations.Delete)).Succeeded)
                return new ChallengeResult();

            if (!await _accountManager.TestCanDeleteUserAsync(id))
                return BadRequest("User cannot be deleted. Delete all orders associated with this user and try again");


            UserViewModel userVM = null;
            ApplicationUser appUser = await this._accountManager.GetUserByIdAsync(id);

            if (appUser != null)
                userVM = await GetUserViewModelHelper(appUser.Id);


            if (userVM == null)
                return NotFound(id);

            var result = await this._accountManager.DeleteUserAsync(appUser);
            if (!result.Item1)
                throw new Exception("The following errors occurred whilst deleting user: " + string.Join(", ", result.Item2));


            return Ok(userVM);
        }

        [HttpPut("users/unblock/{id}")]
        [Authorize(Authorization.Policies.ManageAllUsersPolicy)]
        public async Task<IActionResult> UnblockUser(string id)
        {
            ApplicationUser appUser = await this._accountManager.GetUserByIdAsync(id);

            if (appUser == null)
                return NotFound(id);

            appUser.LockoutEnd = null;
            var result = await _accountManager.UpdateUserAsync(appUser);
            if (!result.Item1)
                throw new Exception("The following errors occurred whilst unblocking user: " + string.Join(", ", result.Item2));


            return NoContent();
        }

        [HttpGet("users/me/preferences")]
        [Produces(typeof(string))]
        public async Task<IActionResult> UserPreferences()
        {
            var userId = Utilities.GetUserId(this.User);
            ApplicationUser appUser = await this._accountManager.GetUserByIdAsync(userId);

            if (appUser != null)
                return Ok(appUser.Configuration);
            else
                return NotFound(userId);
        }

        [HttpPut("users/me/preferences")]
        public async Task<IActionResult> UserPreferences([FromBody] string data)
        {
            var userId = Utilities.GetUserId(this.User);
            ApplicationUser appUser = await this._accountManager.GetUserByIdAsync(userId);

            if (appUser == null)
                return NotFound(userId);

            appUser.Configuration = data;
            var result = await _accountManager.UpdateUserAsync(appUser);
            if (!result.Item1)
                throw new Exception("The following errors occurred whilst updating User Configurations: " + string.Join(", ", result.Item2));


            return NoContent();
        }

        [HttpGet("roles/{id}", Name = GetRoleByIdActionName)]
        [Produces(typeof(RoleViewModel))]
        public async Task<IActionResult> GetRoleById(string id)
        {
            var appRole = await _accountManager.GetRoleByIdAsync(id);

            if (!(await _authorizationService.AuthorizeAsync(this.User, appRole?.Name ?? "", Authorization.Policies.ViewRoleByRoleNamePolicy)).Succeeded)
                return new ChallengeResult();

            if (appRole == null)
                return NotFound(id);

            return await GetRoleByName(appRole.Name);
        }

        [HttpGet("roles/name/{name}")]
        [Produces(typeof(RoleViewModel))]
        public async Task<IActionResult> GetRoleByName(string name)
        {
            if (!(await _authorizationService.AuthorizeAsync(this.User, name, Authorization.Policies.ViewRoleByRoleNamePolicy)).Succeeded)
                return new ChallengeResult();


            RoleViewModel roleVM = await GetRoleViewModelHelper(name);

            if (roleVM == null)
                return NotFound(name);

            return Ok(roleVM);
        }

        [HttpGet("roles")]
        [Produces(typeof(List<RoleViewModel>))]
        [Authorize(Authorization.Policies.ViewAllRolesPolicy)]
        public async Task<IActionResult> GetRoles()
        {
            return await GetRoles(-1, -1);
        }

        [HttpGet("roles/{page:int}/{pageSize:int}")]
        [Produces(typeof(List<RoleViewModel>))]
        [Authorize(Authorization.Policies.ViewAllRolesPolicy)]
        public async Task<IActionResult> GetRoles(int page, int pageSize)
        {
            var roles = await _accountManager.GetRolesLoadRelatedAsync(page, pageSize);
            return Ok(Mapper.Map<List<RoleViewModel>>(roles));
        }

        [HttpPut("roles/{id}")]
        [Authorize(Authorization.Policies.ManageAllRolesPolicy)]
        public async Task<IActionResult> UpdateRole(string id, [FromBody] RoleViewModel role)
        {
            if (ModelState.IsValid)
            {
                if (role == null)
                    return BadRequest($"{nameof(role)} cannot be null");

                if (!string.IsNullOrWhiteSpace(role.Id) && id != role.Id)
                    return BadRequest("Conflicting role id in parameter and model data");



                ApplicationRole appRole = await _accountManager.GetRoleByIdAsync(id);

                if (appRole == null)
                    return NotFound(id);


                Mapper.Map<RoleViewModel, ApplicationRole>(role, appRole);

                var result = await _accountManager.UpdateRoleAsync(appRole, role.Permissions?.Select(p => p.Value).ToArray());
                if (result.Item1)
                    return NoContent();

                AddErrors(result.Item2);

            }

            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpPost("roles")]
        [Authorize(Authorization.Policies.ManageAllRolesPolicy)]
        public async Task<IActionResult> CreateRole([FromBody] RoleViewModel role)
        {
            if (ModelState.IsValid)
            {
                if (role == null)
                    return BadRequest($"{nameof(role)} cannot be null");


                ApplicationRole appRole = Mapper.Map<ApplicationRole>(role);

                var result = await _accountManager.CreateRoleAsync(appRole, role.Permissions?.Select(p => p.Value).ToArray());
                if (result.Item1)
                {
                    RoleViewModel roleVM = await GetRoleViewModelHelper(appRole.Name);
                    return CreatedAtAction(GetRoleByIdActionName, new { id = roleVM.Id }, roleVM);
                }

                AddErrors(result.Item2);
            }

            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpDelete("roles/{id}")]
        [Produces(typeof(RoleViewModel))]
        [Authorize(Authorization.Policies.ManageAllRolesPolicy)]
        public async Task<IActionResult> DeleteRole(string id)
        {
            if (!await _accountManager.TestCanDeleteRoleAsync(id))
                return BadRequest("Role cannot be deleted. Remove all users from this role and try again");


            RoleViewModel roleVM = null;
            ApplicationRole appRole = await this._accountManager.GetRoleByIdAsync(id);

            if (appRole != null)
                roleVM = await GetRoleViewModelHelper(appRole.Name);


            if (roleVM == null)
                return NotFound(id);

            var result = await this._accountManager.DeleteRoleAsync(appRole);
            if (!result.Item1)
                throw new Exception("The following errors occurred whilst deleting role: " + string.Join(", ", result.Item2));


            return Ok(roleVM);
        }

        [HttpGet("permissions")]
        [Produces(typeof(List<PermissionViewModel>))]
        [Authorize(Authorization.Policies.ViewAllRolesPolicy)]
        public IActionResult GetAllPermissions()
        {
            return Ok(Mapper.Map<List<PermissionViewModel>>(ApplicationPermissions.AllPermissions));
        }

        private async Task<UserViewModel> GetUserViewModelHelper(string userId)
        {
            var userAndRoles = await _accountManager.GetUserAndRolesAsync(userId);
            if (userAndRoles == null)
                return null;

            var userVM = Mapper.Map<UserViewModel>(userAndRoles.Item1);
            userVM.Roles = userAndRoles.Item2;
            if (string.Join("", userVM.Roles).Contains("administrator"))
            {
                userVM.IsAdmin = true;
            }

            UserSubscription userSubscription = await _accountManager.userSubscriptions(userId);

            userVM.CampaignSlot = userSubscription.CampaignCount;
            userVM.CharacterSlot = userSubscription.CharacterCount;
            userVM.PlayerSlot = userSubscription.PlayerCount;
            userVM.RulesetSlot = userSubscription.RulesetCount;
            userVM.StorageSpace = userSubscription.StorageSpaceInMB;



            return userVM;
        }

        private async Task<RoleViewModel> GetRoleViewModelHelper(string roleName)
        {
            var role = await _accountManager.GetRoleLoadRelatedAsync(roleName);
            if (role != null)
                return Mapper.Map<RoleViewModel>(role);


            return null;
        }

        private void AddErrors(IEnumerable<string> errors)
        {
            foreach (var error in errors)
            {
                ModelState.AddModelError(string.Empty, error);
            }
        }

        [HttpPost("CheckPassword")]
        [AllowAnonymous]
        public async Task<IActionResult> CheckPassword([FromBody]  ChangePasswordViewModel model)
        {
            if (ModelState.IsValid)
            {

                ApplicationUser appUser = await _accountManager.GetUserByIdAsync(model.UserId);
                if (appUser == null)
                    return BadRequest("No User Exist");
                //else if(appUser.pass)

                var result = await _userManager.CheckPasswordAsync(appUser, model.OldPassword);

                if (result) return Ok();
                else return BadRequest("Please enter a valid old password.");
            }

            // If we got this far, something failed, redisplay form
            return BadRequest(Utilities.ModelStateError(ModelState));
        }


        //delete user
        [HttpDelete("delete/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> DeleteUser(string id)
        {

            ApplicationUser appUser = await _accountManager.GetUserByIdAsync(id);
            if (appUser == null)
                return BadRequest("Session has been expired. Please login again.");


            var rulesetList = this._ruleSetService.GetRuleSetByUserId(id).Result;
            foreach (var ruleset in rulesetList)
            {
                this._ruleSetService.DeleteRuleSet(ruleset.RuleSetId);
            }

            var characterList = this._characterService.GetCharacterUserId(id);
            foreach (var character in characterList)
            {
                this._characterService.DeleteCharacter(character.CharacterId);
            }

            //appUser.IsEnabled = false;
            appUser.IsDeleted = true;
            appUser.Email = "X-" + appUser.Email;
            appUser.UserName = "X-" + appUser.UserName;

            (bool success, string[] errorMsg) = await _accountManager.UpdateUserAsync(appUser);
            if (errorMsg.Count() > 1)
                return BadRequest(errorMsg[0].ToString());

            //    return BadRequest("User cannot be deleted. Delete all orders associated with this user and try again");
            return Ok();
        }

        [HttpGet("UserById/{id}")]
        [Produces(typeof(UserViewModel))]
        [AllowAnonymous]
        [Authorize(Authorization.Policies.ManageAllUsersPolicy)]
        public async Task<IActionResult> UserById(string id)
        {
            UserViewModel userVM = await GetUserViewModelHelper(id);

            if (userVM != null)
                return Ok(userVM);
            else
                return NotFound(id);
        }

        [HttpPost("ChangePassword")]
        [AllowAnonymous]
        public async Task<IActionResult> ChangePassword([FromBody]  ChangePasswordViewModel model)
        {
            if (ModelState.IsValid)
            {

                ApplicationUser appUser = await _accountManager.GetUserByIdAsync(model.UserId);

                if (appUser == null)
                    return BadRequest("No User Exist");

                var result = await _userManager.ChangePasswordAsync(appUser, model.OldPassword, model.NewPassword);

                if (result.Succeeded)
                    return Ok("Password has been changed successfully.");
                else
                    return BadRequest("Please enter a valid old password.");
            }

            // If we got this far, something failed, redisplay form
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpPost("IsUserExist")]
        [AllowAnonymous]
        [Produces(typeof(UserExistViewModel))]
        [Authorize(Authorization.Policies.ViewAllUsersPolicy)]
        public async Task<IActionResult> UserExist([FromBody]  UserViewModel model)
        {
            UserExistViewModel UserExistVM = new UserExistViewModel();
            UserExistVM.IsUserExist = CheckUserExist(model).Result;
            return Ok(UserExistVM);
        }

        private async Task<bool> CheckUserExist(UserViewModel model)
        {
            bool _isUserExist = false;
            var usersAndRoles = await _accountManager.GetUsersAndRolesAsync(-1, -1);

            foreach (var user in usersAndRoles)
            {
                if (user.Item1.UserName == null) continue;
                else if (user.Item1.UserName == null && user.Item1.Id != model.Id
                     && user.Item1.IsDeleted != true)
                {
                    _isUserExist = false;
                    break;
                }
                else if (user.Item1.UserName.Trim().ToLower() == model.UserName.Trim().ToLower()
                    && user.Item1.Id != model.Id && user.Item1.IsDeleted != true)
                {
                    _isUserExist = true;
                    break;
                }
            }
            return _isUserExist;
        }

        private async Task<bool> CheckEmailExist(UserViewModel model)
        {
            bool _isUserExist = false;
            var usersAndRoles = await _accountManager.GetUsersAndRolesAsync(-1, -1);

            foreach (var user in usersAndRoles)
            {
                if (user.Item1.Email == null) continue;
                else if (user.Item1.Email == null && user.Item1.Id != model.Id
                     && user.Item1.IsDeleted != true)
                {
                    _isUserExist = false;
                    break;
                }
                else if (user.Item1.Email.Trim().ToLower() == model.Email.Trim().ToLower()
                    && user.Item1.Id != model.Id && user.Item1.IsDeleted != true)
                {
                    _isUserExist = true;
                    break;
                }
            }
            return _isUserExist;
        }

        [HttpPost("UpdateAccountSetting")]
        [AllowAnonymous]
        [Authorize(Authorization.Policies.ManageAllUsersPolicy)]
        public async Task<IActionResult> UpdateAccountSetting([FromBody] UserViewModel model)
        {
            //TODO
            if (ModelState.IsValid)
            {

                //var _user = Mapper.Map<ApplicationUser>(model);
                //_user.IsEnabled = false;
                //_user.EmailConfirmed = false;

                ApplicationUser appUser = await _accountManager.GetUserByIdAsync(model.Id);
                if (appUser == null)
                    return BadRequest("Session has been expired. Please login again.");

                if (CheckUserExist(model).Result)
                    return BadRequest("Username already exists.");

                bool _isEmailChanged = appUser.Email == null ? true : model.Email.Trim().ToLower() == appUser.Email.Trim().ToLower() ? false : true;

                if (_isEmailChanged)
                    if (CheckEmailExist(model).Result)
                        return BadRequest("Email already exists.");

                model.UserName = model.UserName.Trim();
                Mapper.Map<UserViewModel, ApplicationUser>(model, appUser);
                if (_isEmailChanged)
                {
                    //appUser.IsEnabled = false;
                    appUser.EmailConfirmed = false;
                }
                dynamic Response = new ExpandoObject();

                (bool success, string[] errorMsg) = await _accountManager.UpdateUserAsync(appUser);
                if (success && _isEmailChanged)
                {

                    var mailTemplatePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/mail-templates/account-verification.html");
                    var EmailContent = System.IO.File.ReadAllText(mailTemplatePath);
                    EmailContent = EmailContent.Replace("#CONFIRM-URL", $"{model.Url}/" + "email-confirmation-success?id=" + appUser.Id);

                    await _emailer.SendEmailAsync(appUser.FullName, appUser.Email, "Confirm your email account", EmailContent, isHtml: true);

                    UserViewModel userVM = await GetUserViewModelHelper(model.Id);
                    Response.message = "Please confirm your email account.";
                    Response.data = userVM;
                    return Ok(Response);
                }
                else if (success && errorMsg.Count() == 0)
                {
                    UserViewModel userVM = await GetUserViewModelHelper(model.Id);
                    Response.message = "Account Setting has been updated successfully.";
                    Response.data = userVM;
                    return Ok(Response);
                }
                else if (errorMsg.Count() > 1)
                {
                    return BadRequest(errorMsg[0].ToString());
                }
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [AllowAnonymous]
        [HttpPost("UploadProfileImageBlob")]
        public async Task<IActionResult> UploadProfileImageBlob()
        {
            if (_httpContextAccessor.HttpContext.Request.Form.Files.Any())
            {
                try
                {
                    // Get the uploaded image from the Files collection
                    var httpPostedFile = _httpContextAccessor.HttpContext.Request.Form.Files["UploadedImage"];
                    if (httpPostedFile != null)
                    {
                        //var dirPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/UploadedFiles/Profile");
                        //try
                        //{
                        //    if (!Directory.Exists(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/UploadedFiles")))
                        //    {
                        //        Directory.CreateDirectory(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/UploadedFiles"));
                        //        Directory.CreateDirectory(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/UploadedFiles/Profile"));
                        //    }
                        //    else if (!Directory.Exists(dirPath)) Directory.CreateDirectory(dirPath);
                        //}
                        //catch { }

                        //var path = Path.Combine(dirPath, httpPostedFile.FileName);
                        //using (var stream = new FileStream(path, FileMode.Create))
                        //{
                        //    await httpPostedFile.CopyToAsync(stream);
                        //}
                        //return Ok(httpPostedFile.FileName + " uploaded successfully.");


                        BlobService bs = new BlobService(_httpContextAccessor, _accountManager,_ruleSetService);
                        var container = bs.GetCloudBlobContainer().Result;
                        string imageName = Guid.NewGuid().ToString();

                        dynamic Response = new ExpandoObject();
                        Response.ProfileImage = bs.UploadThumbnail(httpPostedFile, imageName, container).Result;

                        return Ok(Response);

                    }
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }
            return BadRequest("No Image Selected");
        }

        //get user id methods
        private string GetUserId()
        {
            string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
            ApplicationUser appUser = _accountManager.GetUserByUserNameAsync(userName).Result;
            return appUser.Id;
        }        
    }
}
