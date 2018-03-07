using RPGSmith.Data;
using RPGSmith.Models;
using RPGSmith.Web.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Web;
using System.Web.Mvc;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System.Data.Entity.Validation;

namespace RPGSmith.Controllers
{
    public class ProfileController : Controller
    {
        RPGSmithContext Context = new RPGSmithContext();
        ResponseViewModel response = new ResponseViewModel();
        #region User Profile
        // GET: Profile
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult UpdateProfile(RegisterViewModel model)
        {
            string characterimagephysicalmappath = null;
            string virtualPath = null;
            var userID = User.Identity.GetUserId();
            try
            {
                if (userID != null || userID != "")
                {
                    var result = Context.AspNetUsers.Where(e => e.Id == userID).FirstOrDefault();
                    if (result != null)
                    {
                        //result.Name = model.username;
                        //result.UserName = model.Email;
                        //result.Email = model.Email;
                        if (result.ProfileImage == model.ProfileImage)
                        {
                            result.ProfileImage = model.ProfileImage;
                        }
                        else
                        {
                            model.ProfileImage = model.ProfileImage.Replace("data:image/png;base64,", "").Replace("data:image/jpg;base64,", "").Replace("data:image/jpeg;base64,", "");
                            byte[] profileimagewByte = Convert.FromBase64String(model.ProfileImage);
                            string virtualPathForFolder = "~/wwwroot/images/ProfileImages/" + result.UserName + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                            virtualPath = "/wwwroot/images/ProfileImages/" + result.UserName + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                            characterimagephysicalmappath = model.ProfileImage;
                            string characterimagephysicalmappathForFolder = Server.MapPath(virtualPathForFolder);
                            characterimagephysicalmappath = Server.MapPath(virtualPath);
                            System.IO.File.WriteAllBytes(characterimagephysicalmappathForFolder, profileimagewByte);
                            result.ProfileImage = virtualPath;
                        }
                    }
                    Context.SaveChanges();
                    response.PayLoad = result;
                    response.StatusCode = 200;
                }
            }
            catch (DbEntityValidationException e)
            {
                foreach (var eve in e.EntityValidationErrors)
                {
                    Console.WriteLine("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                        eve.Entry.Entity.GetType().Name, eve.Entry.State);
                    foreach (var ve in eve.ValidationErrors)
                    {
                        Console.WriteLine("- Property: \"{0}\", Error: \"{1}\"",
                            ve.PropertyName, ve.ErrorMessage);
                    }
                }
                throw;
            }
            catch (Exception ex)
            {
                response.StatusCode = 400;
                response.ErrorMessage = ex.Message;
                response.ShowToUser = false;
            }
            return Json(response, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        [AllowAnonymous]
        //[ValidateAntiForgeryToken]
        public ActionResult ResetPassword(ResetPasswordViewModel model)
        {
			var rawQuery = this.Request.UrlReferrer.Query;
			var UserId = rawQuery.Substring(8, rawQuery.ToLower().IndexOf("&to")-8); //User.Identity.GetUserId();
            try
            {
                var password = Context.AspNetUsers.Where(e => e.Id == UserId).FirstOrDefault();
                if (password != null)
                {
                    password.PasswordHash = HashPassword(model.Password);
                    Context.SaveChanges();
                    response.PayLoad = password;
                    response.StatusCode = 200;
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
        public static string HashPassword(string password)
        {
            byte[] salt;
            byte[] buffer2;
            if (password == null)
            {
                throw new ArgumentNullException("password");
            }
            using (Rfc2898DeriveBytes bytes = new Rfc2898DeriveBytes(password, 0x10, 0x3e8))
            {
                salt = bytes.Salt;
                buffer2 = bytes.GetBytes(0x20);
            }
            byte[] dst = new byte[0x31];
            Buffer.BlockCopy(salt, 0, dst, 1, 0x10);
            Buffer.BlockCopy(buffer2, 0, dst, 0x11, 0x20);
            return Convert.ToBase64String(dst);
        }
        #endregion
    }
}