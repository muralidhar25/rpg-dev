using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;

namespace RPGSmith.Controllers
{
    public class BaseController : Controller
    {
        private string _userId;

        protected ApplicationUserManager UserManager { get; private set; }

        protected string UserID
        {
            get
            {
                return _userId;
            }
        }

        public BaseController()//ApplicationUserManager userManager)
        {
            //UserManager = userManager;
            //_userId = User.Identity.GetUserId();
            _userId = "5a30d199-f47f-44a4-a6b6-c38062356ba3";

        }
    }
}