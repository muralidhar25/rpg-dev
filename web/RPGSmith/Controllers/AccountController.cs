using System;
using System.Globalization;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using RPGSmith.Data;
using RPGSmith.Models;
using System.Web.Security;
using RPGSmith.Web.ViewModels;
using System.Security.Cryptography;
using System.Net.Mail;
using System.Net;
using System.Configuration;
using System.IO;
using Facebook;

namespace RPGSmith.Controllers
{

    public class AccountController : Controller
    {
        RPGSmithContext Context = new RPGSmithContext();
        ResponseViewModel response = new ResponseViewModel();
        private ApplicationSignInManager _signInManager;
        private ApplicationUserManager _userManager;

        public AccountController()
        {
        }

        public AccountController(ApplicationUserManager userManager, ApplicationSignInManager signInManager)
        {
            UserManager = userManager;
            SignInManager = signInManager;
        }

        [Route("api/account/FacebookLogin")]
        public ActionResult FacebookLogin(FacebookLoginModel model)
        {
            try
            {
                Data.Models.AspNetUser objuser = Context.AspNetUsers.Find(model.uid);
                if (objuser != null)
                {
                    FormsAuthentication.SetAuthCookie(objuser.Id, false);
                    var authTicket = new FormsAuthenticationTicket(1, objuser.Email, DateTime.Now, DateTime.Now.AddMinutes(20), false, objuser.Id);
                    string encryptedTicket = FormsAuthentication.Encrypt(authTicket);
                    var authCookie = new HttpCookie(FormsAuthentication.FormsCookieName, encryptedTicket);
                    HttpContext.Response.Cookies.Add(authCookie);

                    var ident = new ClaimsIdentity(
                                new[] {
                                         new Claim(ClaimTypes.NameIdentifier, objuser.Id),
                                         new Claim("http://schemas.microsoft.com/accesscontrolservice/2010/07/claims/identityprovider", "ASP.NET Identity", "http://www.w3.org/2001/XMLSchema#string"),
                                         new Claim(ClaimTypes.Name,objuser.Email)
                                      },
                                DefaultAuthenticationTypes.ApplicationCookie);
                    HttpContext.GetOwinContext().Authentication.SignIn(
                       new AuthenticationProperties { IsPersistent = false }, ident);
                    response.PayLoad = objuser;
                    response.StatusCode = 200;

                }
                else
                {
                    var fb = new FacebookClient();
                    fb.AccessToken = model.accessToken;
                    dynamic me = fb.Get("me?fields=link,first_name,currency,last_name,email,gender,age_range");
                    string Email = me.email;
                    Data.Models.AspNetUser objinsert = new Data.Models.AspNetUser();
                    objinsert.Email = model.uid;
                    objinsert.UserName = model.uid;
                    objinsert.Id = model.uid;
                    objinsert.SecurityStamp = model.accessToken;
                    objinsert.PasswordHash = "Facebook";
                    Context.AspNetUsers.Add(objinsert);
                    Context.SaveChanges();

                    objuser = Context.AspNetUsers.Where(p => p.Email == Email).SingleOrDefault();

                    FormsAuthentication.SetAuthCookie(objuser.Id != null ? objuser.Id : objinsert.Id, false);
                    var authTicket = new FormsAuthenticationTicket(1, objuser.Email != null ? objuser.Email : objinsert.Email, DateTime.Now, DateTime.Now.AddMinutes(20), false, objuser.Id != null ? objuser.Id : objinsert.Id);
                    string encryptedTicket = FormsAuthentication.Encrypt(authTicket);
                    var authCookie = new HttpCookie(FormsAuthentication.FormsCookieName, encryptedTicket);
                    HttpContext.Response.Cookies.Add(authCookie);

                    var ident = new ClaimsIdentity(
                                new[] {
                                         new Claim(ClaimTypes.NameIdentifier, objuser.Id != null ? objuser.Id : objinsert.Id),
                                         new Claim("http://schemas.microsoft.com/accesscontrolservice/2010/07/claims/identityprovider", "ASP.NET Identity", "http://www.w3.org/2001/XMLSchema#string"),
                                         new Claim(ClaimTypes.Name,objuser.Email != null ? objuser.Email : objinsert.Email)
                                      },
                                DefaultAuthenticationTypes.ApplicationCookie);
                    HttpContext.GetOwinContext().Authentication.SignIn(
                       new AuthenticationProperties { IsPersistent = false }, ident);
                    response.PayLoad = objinsert;
                    response.StatusCode = 200;


                }
            }
            catch (Exception ex)
            {
                return null;
            }
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [Route("api/account/GoogleLogin")]
        public ActionResult GoogleLogin(string Email, string AccesKey, string AccountType)
        {
            try
            {

                Data.Models.AspNetUser objuser = Context.AspNetUsers.Where(p => p.Email == Email).SingleOrDefault();
                if (objuser != null)
                {
                    FormsAuthentication.SetAuthCookie(objuser.Id, false);
                    var authTicket = new FormsAuthenticationTicket(1, objuser.Email, DateTime.Now, DateTime.Now.AddMinutes(20), false, objuser.Id);
                    string encryptedTicket = FormsAuthentication.Encrypt(authTicket);
                    var authCookie = new HttpCookie(FormsAuthentication.FormsCookieName, encryptedTicket);
                    HttpContext.Response.Cookies.Add(authCookie);

                    var ident = new ClaimsIdentity(
                                new[] {
                                         new Claim(ClaimTypes.NameIdentifier, objuser.Id),
                                         new Claim("http://schemas.microsoft.com/accesscontrolservice/2010/07/claims/identityprovider", "ASP.NET Identity", "http://www.w3.org/2001/XMLSchema#string"),
                                         new Claim(ClaimTypes.Name,objuser.Email)
                                      },
                                DefaultAuthenticationTypes.ApplicationCookie);
                    HttpContext.GetOwinContext().Authentication.SignIn(
                       new AuthenticationProperties { IsPersistent = false }, ident);

                    response.PayLoad = objuser;
                    response.StatusCode = 200;

                }
                else
                {
                    Data.Models.AspNetUser objinsert = new Data.Models.AspNetUser();
                    objinsert.Email = Email;
                    objinsert.UserName = Email;
                    objinsert.Id = AccesKey;
                    objinsert.Name = Email;
                    objinsert.PasswordHash = AccountType;
                    Context.AspNetUsers.Add(objinsert);
                    Context.SaveChanges();

                    objuser = Context.AspNetUsers.Where(p => p.Email == Email).SingleOrDefault();

                    FormsAuthentication.SetAuthCookie(objuser.Id, false);
                    var authTicket = new FormsAuthenticationTicket(1, objuser.Email, DateTime.Now, DateTime.Now.AddMinutes(20), false, objuser.Id);
                    string encryptedTicket = FormsAuthentication.Encrypt(authTicket);
                    var authCookie = new HttpCookie(FormsAuthentication.FormsCookieName, encryptedTicket);
                    HttpContext.Response.Cookies.Add(authCookie);


                    var ident = new ClaimsIdentity(
                                new[] {
                                         new Claim(ClaimTypes.NameIdentifier, objuser.Id),
                                         new Claim("http://schemas.microsoft.com/accesscontrolservice/2010/07/claims/identityprovider", "ASP.NET Identity", "http://www.w3.org/2001/XMLSchema#string"),
                                         new Claim(ClaimTypes.Name,objuser.Email)
                                      },
                                DefaultAuthenticationTypes.ApplicationCookie);
                    HttpContext.GetOwinContext().Authentication.SignIn(
                       new AuthenticationProperties { IsPersistent = false }, ident);
                    response.PayLoad = objinsert;
                    response.StatusCode = 200;

                }
            }
            catch (Exception ex)
            {
                return null;
            }
            return Json(response, JsonRequestBehavior.AllowGet);
        }


        public ApplicationSignInManager SignInManager
        {
            get
            {
                return _signInManager ?? HttpContext.GetOwinContext().Get<ApplicationSignInManager>();
            }
            private set
            {
                _signInManager = value;
            }
        }

        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? HttpContext.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }

        //
        // GET: /Account/Login
        [AllowAnonymous]
        public ActionResult Login(string returnUrl)
        {
            ViewBag.ReturnUrl = returnUrl;
            return View();
        }



        [ActionName("GetData")]
        public string GetData()
        {
            return "Ravi";
        }
        //
        // POST: /Account/Login
        [HttpPost]
        [AllowAnonymous]
        // [Route("api/account/login")]
        public async Task<ActionResult> Login(LoginViewModel model)
        {
            try
            {
                 var loginresult = Context.AspNetUsers.Where(e => e.Email == model.Email || e.Email == model.Email).FirstOrDefault();
				var result = await SignInManager.PasswordSignInAsync(loginresult.UserName, model.Password, model.RememberMe, shouldLockout: false);

				if (result.ToString() == "Success" && loginresult.EmailConfirmed)
                {
                    loginresult.PasswordHash = model.Password;
                    //Session["UserId"] = loginresult.Id;
                    response.PayLoad = loginresult;
                    response.StatusCode = 200;
                }
                else if (loginresult.EmailConfirmed == false)
                {
                    response.PayLoad = "Please Verify your Email Id.";
                    response.StatusCode = 400;
                }
                else
                {
                    response.PayLoad = "Invalid Email /password";
                    response.StatusCode = 400;
                }
            }
            catch (Exception ex)
            {
                response.StatusCode = 400;
                response.ErrorMessage = ex.Message;
                response.ShowToUser = false;
            }
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        //
        // GET: /Account/VerifyCode
        [AllowAnonymous]
        public async Task<ActionResult> VerifyCode(string provider, string returnUrl, bool rememberMe)
        {
            // Require that the user has already logged in via username/password or external login
            if (!await SignInManager.HasBeenVerifiedAsync())
            {
                return View("Error");
            }
            return View(new VerifyCodeViewModel { Provider = provider, ReturnUrl = returnUrl, RememberMe = rememberMe });
        }

        //
        // POST: /Account/VerifyCode
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> VerifyCode(VerifyCodeViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            // The following code protects for brute force attacks against the two factor codes. 
            // If a user enters incorrect codes for a specified amount of time then the user account 
            // will be locked out for a specified amount of time. 
            // You can configure the account lockout settings in IdentityConfig
            var result = await SignInManager.TwoFactorSignInAsync(model.Provider, model.Code, isPersistent: model.RememberMe, rememberBrowser: model.RememberBrowser);
            switch (result)
            {
                case SignInStatus.Success:
                    return RedirectToLocal(model.ReturnUrl);
                case SignInStatus.LockedOut:
                    return View("Lockout");
                case SignInStatus.Failure:
                default:
                    ModelState.AddModelError("", "Invalid code.");
                    return View(model);
            }
        }

        //
        // GET: /Account/Register
        [AllowAnonymous]
        // [Route("api/account/Register")]
        public ActionResult Register()
        {
            return View();
        }

        //
        // POST: /Account/Register

        //
        // POST: /Account/Register
        [HttpPost]
        [AllowAnonymous]

        public async Task<ActionResult> Register(RegisterViewModel model)
        {
            if (ModelState.IsValid)
            {
                var user = new ApplicationUser { UserName = model.username, Email = model.Email };
                try
                {
					
					var result = UserManager.Create(user, model.Password);
					if (!result.Succeeded)
					{
						if (result.Errors.First().ToString().IndexOf("already taken") > 0 && result.Errors.First().ToString().IndexOf("Name") == 0)
						{
							int i = 0;
							while (!result.Succeeded)
							{
								
								user.UserName = model.username + "_"+i;

								result = UserManager.Create(user, model.Password);
								if ((result.Errors.First().ToString().IndexOf("already taken") > 0 && result.Errors.First().ToString().IndexOf("Email") >= 0))
								{
									var userByEmail = UserManager.FindByEmail(user.Email);
									if (!userByEmail.EmailConfirmed)
									{
										//Per David, if email is not confirmed then we should be able to create another account with the same email
										
										if (userByEmail != null)
										{
											try
											{
												UserManager.Delete(userByEmail);
												result = UserManager.Create(user, model.Password);
												break;
											}
											catch (Exception exc)
											{
												//do nothing
											}
										}

									}
									else
									{
										break;
									}
									
								}
								if (result.Succeeded)
								{
									break;
								}
								i++;
							}


							
						}
					}
					
					if (result.Succeeded)
                    {
                        string characterimagephysicalmappath = null;
                        string virtualPath = null;
                        if (model.ProfileImage != null && model.ProfileImage != "")
                        {
                            model.ProfileImage = model.ProfileImage.Replace("data:image/png;base64,", "").Replace("data:image/jpg;base64,", "").Replace("data:image/jpeg;base64,", "");
                            byte[] profileimagewByte = Convert.FromBase64String(model.ProfileImage);
                            string virtualPathForFolder = "~/wwwroot/images/ProfileImages/" + model.username + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                            virtualPath = "/wwwroot/images/ProfileImages/" + model.username + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                            characterimagephysicalmappath = model.ProfileImage;
                            string characterimagephysicalmappathForFolder = Server.MapPath(virtualPathForFolder);
                            characterimagephysicalmappath = Server.MapPath(virtualPath);
                            System.IO.File.WriteAllBytes(characterimagephysicalmappathForFolder, profileimagewByte);
                        }
                        RPGSmithContext objContext = new RPGSmithContext();
                        RPGSmith.Data.Models.AspNetUser obj = objContext.AspNetUsers.Where(x => x.Id == user.Id).FirstOrDefault();
                        obj.ProfileImage = virtualPath;
                        obj.Name = model.username;
                        objContext.SaveChanges();


                        var data = Context.AspNetUsers.Where(e => e.Email == model.Email).FirstOrDefault();
                        await SignInManager.SignInAsync(user, isPersistent: false, rememberBrowser: false);
                        data.PasswordHash = model.Password;
                        response.PayLoad = data;
                        response.StatusCode = 200;
                        string confirmationToken = UserManager.GenerateEmailConfirmationTokenAsync(user.Id).Result;
                        string confirmationLink = Url.Action("ConfirmEmail", "Account", new { userid = user.Id, token = confirmationToken }, protocol: HttpContext.Request.Url.Scheme);
                        string Path = "~/wwwroot/views/EmailTemplates/EmailConfirmationTemplate.html";
                        string body = string.Empty;
                        using (StreamReader reader = new StreamReader(Server.MapPath(Path)))
                        {
                            body = reader.ReadToEnd();
                        }
                        body = body.Replace("{#ConfirmationLink}", confirmationLink);
                        await UserManager.SendEmailAsync(user.Id, "Confirm your account", "Please confirm your account by clicking <a href=\"" + confirmationLink + "\">here</a>");
                        using (MailMessage mailMessage = new MailMessage())
                        {
                            mailMessage.From = new MailAddress(ConfigurationManager.AppSettings["UserName"]);
                            mailMessage.Subject = "Confirmation Email";
                            mailMessage.Body = body;
                            mailMessage.IsBodyHtml = true;
                            mailMessage.To.Add(new MailAddress(model.Email));
                            mailMessage.CC.Add(new MailAddress(ConfigurationManager.AppSettings["TestEmail"]));
                            SmtpClient smtp = new SmtpClient();
                            smtp.Host = ConfigurationManager.AppSettings["mailServer"]; // "smtp.gmail.com";
                            smtp.EnableSsl = true;
                            NetworkCredential NetworkCred = new NetworkCredential(
                                       ConfigurationManager.AppSettings["mailAccount"],
                                       ConfigurationManager.AppSettings["mailPassword"]
                                       );
                            smtp.UseDefaultCredentials = true;
                            smtp.Credentials = NetworkCred;
                            smtp.Port = 587;
                            smtp.Send(mailMessage);
                        }
						//return View("ResetPasswordSuccess");
					}
                    else
                    {
                        response.PayLoad = "";
						foreach (var s in result.Errors)
						{
							
							response.ErrorMessage += s + " ";
						}
						response.StatusCode = 400;
						
					}
                }
                catch (Exception ex)
                {
					//Delete the user if any saved
					if (ex.Message == "Sequence contains no elements" || ex.Message == "Failure sending mail.")
					{
						response.StatusCode = 200;
						response.ErrorMessage = null;
					}
					else
					{
						UserManager.Delete(user);
						response.StatusCode = 400;
						response.ErrorMessage = ex.Message;
						response.ShowToUser = false;
					}
                }
            }
            // If we got this far, something failed, redisplay form
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        //
        // GET: /Account/ConfirmEmail
        [AllowAnonymous]
        public async Task<ActionResult> ConfirmEmail(string userId, string token)
        {
            if (userId == null || token == null)
            {
                return View("Error");
            }
            var result = await UserManager.ConfirmEmailAsync(userId, token);
            if (result.Succeeded)
            {
                ViewBag.Message = "Email confirmed successfully!";
                return View("EmailConfirmationSuccess");
            }
            else
            {
                ViewBag.Message = "Error while confirming your email!";
                return View("Error");
            }
            //return View(result.Succeeded ? "ConfirmEmail" : "Error");
        }

        //
        // GET: /Account/ForgotPassword
        [AllowAnonymous]
        public ActionResult ForgotPassword()
        {
            return View();
        }

        //
        // POST: /Account/ForgotPassword
        [HttpPost]
        [AllowAnonymous]
        //[ValidateAntiForgeryToken]
        public async Task<ActionResult> ForgotPassword(ForgotPasswordViewModel model)
        {
            if (ModelState.IsValid)
            {
                var user = await UserManager.FindByEmailAsync(model.Email);
                if (user == null || !(await UserManager.IsEmailConfirmedAsync(user.Id)))
                {
                    // Don't reveal that the user does not exist or is not confirmed
                    return View("ResetPasswordSuccess");
                }

                // For more information on how to enable account confirmation and password reset please visit https://go.microsoft.com/fwlink/?LinkID=320771
                // Send an email with this link
                response.StatusCode = 200;
                string confirmationToken = UserManager.GenerateEmailConfirmationTokenAsync(user.Id).Result;
                string confirmationLink = Url.Action("ResetPassword", "Account", new { userid = user.Id, token = confirmationToken }, protocol: HttpContext.Request.Url.Scheme);
                await UserManager.SendEmailAsync(user.Id, "Reset Password", "Please reset your password by clicking <a href=\"" + confirmationLink + "\">here</a>");
                string Path = "~/wwwroot/views/EmailTemplates/ForgotPasswordEmailTemplate.html";
                string body = string.Empty;
                using (StreamReader reader = new StreamReader(Server.MapPath(Path)))
                {
                    body = reader.ReadToEnd();
                }

                body = body.Replace("{#ForgotLink}", confirmationLink);
                using (MailMessage mailMessage = new MailMessage())
                {
                    mailMessage.From = new MailAddress(ConfigurationManager.AppSettings["UserName"]);
                    mailMessage.Subject = "Forgot Password";
                    mailMessage.Body = body;
                    mailMessage.IsBodyHtml = true;
                    mailMessage.To.Add(new MailAddress(user.Email));
                    mailMessage.CC.Add(new MailAddress(ConfigurationManager.AppSettings["TestEmail"]));
                    SmtpClient smtp = new SmtpClient();
                    smtp.Host = ConfigurationManager.AppSettings["mailServer"];
                    smtp.EnableSsl = true;
                    NetworkCredential NetworkCred = new NetworkCredential(
                               ConfigurationManager.AppSettings["mailAccount"],
                               ConfigurationManager.AppSettings["mailPassword"]
                               );
                    smtp.UseDefaultCredentials = true;
                    smtp.Credentials = NetworkCred;
                    smtp.Port = 587;
                    smtp.Send(mailMessage);
                }

                // return RedirectToAction("CloseForgotPassword", "Account");
            }

            // If we got this far, something failed, redisplay form
            return View(model);
        }


        //
        // GET: /Account/ForgotPasswordConfirmation
        [AllowAnonymous]
        public ActionResult ForgotPasswordConfirmation()
        {
            return View();
        }

        //
        // GET: /Account/ResetPassword
        [AllowAnonymous]

        public ActionResult ResetPassword(string token)
        {
            return token == null ? View("Error") : View("ResetPasswordSuccess");

        }


        //
        // POST: /Account/ResetPassword

        //
        // GET: /Account/ResetPasswordConfirmation
        [AllowAnonymous]
        public ActionResult ResetPasswordConfirmation()
        {
            return View();
        }

        //
        // POST: /Account/ExternalLogin
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public ActionResult ExternalLogin(string provider, string returnUrl)
        {
            // Request a redirect to the external login provider
            return new ChallengeResult(provider, Url.Action("ExternalLoginCallback", "Account", new { ReturnUrl = returnUrl }));
        }

        //
        // GET: /Account/SendCode
        [AllowAnonymous]
        public async Task<ActionResult> SendCode(string returnUrl, bool rememberMe)
        {
            var userId = await SignInManager.GetVerifiedUserIdAsync();
            if (userId == null)
            {
                return View("Error");
            }
            var userFactors = await UserManager.GetValidTwoFactorProvidersAsync(userId);
            var factorOptions = userFactors.Select(purpose => new SelectListItem { Text = purpose, Value = purpose }).ToList();
            return View(new SendCodeViewModel { Providers = factorOptions, ReturnUrl = returnUrl, RememberMe = rememberMe });
        }

        //
        // POST: /Account/SendCode
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> SendCode(SendCodeViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View();
            }

            // Generate the token and send it
            if (!await SignInManager.SendTwoFactorCodeAsync(model.SelectedProvider))
            {
                return View("Error");
            }
            return RedirectToAction("VerifyCode", new { Provider = model.SelectedProvider, ReturnUrl = model.ReturnUrl, RememberMe = model.RememberMe });
        }

        //
        // GET: /Account/ExternalLoginCallback
        [AllowAnonymous]
        public async Task<ActionResult> ExternalLoginCallback(string returnUrl)
        {
            var loginInfo = await AuthenticationManager.GetExternalLoginInfoAsync();
            if (loginInfo == null)
            {
                return RedirectToAction("Login");
            }

            // Sign in the user with this external login provider if the user already has a login
            var result = await SignInManager.ExternalSignInAsync(loginInfo, isPersistent: false);
            switch (result)
            {
                case SignInStatus.Success:
                    return RedirectToLocal(returnUrl);
                case SignInStatus.LockedOut:
                    return View("Lockout");
                case SignInStatus.RequiresVerification:
                    return RedirectToAction("SendCode", new { ReturnUrl = returnUrl, RememberMe = false });
                case SignInStatus.Failure:
                default:
                    // If the user does not have an account, then prompt the user to create an account
                    ViewBag.ReturnUrl = returnUrl;
                    ViewBag.LoginProvider = loginInfo.Login.LoginProvider;
                    return View("ExternalLoginConfirmation", new ExternalLoginConfirmationViewModel { Email = loginInfo.Email });
            }
        }

        //
        // POST: /Account/ExternalLoginConfirmation
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> ExternalLoginConfirmation(ExternalLoginConfirmationViewModel model, string returnUrl)
        {
            if (User.Identity.IsAuthenticated)
            {
                return RedirectToAction("Index", "Manage");
            }

            if (ModelState.IsValid)
            {
                // Get the information about the user from the external login provider
                var info = await AuthenticationManager.GetExternalLoginInfoAsync();
                if (info == null)
                {
                    return View("ExternalLoginFailure");
                }
                var user = new ApplicationUser { UserName = model.Email, Email = model.Email };
                var result = await UserManager.CreateAsync(user);
                if (result.Succeeded)
                {
                    result = await UserManager.AddLoginAsync(user.Id, info.Login);
                    if (result.Succeeded)
                    {
                        await SignInManager.SignInAsync(user, isPersistent: false, rememberBrowser: false);
                        return RedirectToLocal(returnUrl);
                    }
                }
                AddErrors(result);
            }

            ViewBag.ReturnUrl = returnUrl;
            return View(model);
        }

        //
        // POST: /Account/LogOff
        [HttpPost]
        //[ValidateAntiForgeryToken]
        public ActionResult LogOff()
        {
            try
            {
                AuthenticationManager.SignOut(DefaultAuthenticationTypes.ApplicationCookie);
                Session.Clear();
                Session.Abandon();
                response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                response.StatusCode = 400;
                response.ErrorMessage = ex.Message;
                response.ShowToUser = false;
            }

            return Json(response, JsonRequestBehavior.AllowGet);
        }

        //
        // GET: /Account/ExternalLoginFailure
        [AllowAnonymous]
        public ActionResult ExternalLoginFailure()
        {
            return View();
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (_userManager != null)
                {
                    _userManager.Dispose();
                    _userManager = null;
                }

                if (_signInManager != null)
                {
                    _signInManager.Dispose();
                    _signInManager = null;
                }
            }

            base.Dispose(disposing);
        }

        #region Helpers
        // Used for XSRF protection when adding external logins
        private const string XsrfKey = "XsrfId";

        private IAuthenticationManager AuthenticationManager
        {
            get
            {
                return HttpContext.GetOwinContext().Authentication;
            }
        }

        private void AddErrors(IdentityResult result)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("", error);
            }
        }

        private ActionResult RedirectToLocal(string returnUrl)
        {
            if (Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }
            return RedirectToAction("Index", "Home");
        }

        internal class ChallengeResult : HttpUnauthorizedResult
        {
            public ChallengeResult(string provider, string redirectUri)
                : this(provider, redirectUri, null)
            {
            }

            public ChallengeResult(string provider, string redirectUri, string userId)
            {
                LoginProvider = provider;
                RedirectUri = redirectUri;
                UserId = userId;
            }

            public string LoginProvider { get; set; }
            public string RedirectUri { get; set; }
            public string UserId { get; set; }

            public override void ExecuteResult(ControllerContext context)
            {
                var properties = new AuthenticationProperties { RedirectUri = RedirectUri };
                if (UserId != null)
                {
                    properties.Dictionary[XsrfKey] = UserId;
                }
                context.HttpContext.GetOwinContext().Authentication.Challenge(properties, LoginProvider);
            }
        }

        #endregion
    }
}