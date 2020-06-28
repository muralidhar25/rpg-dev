using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class UserRegistraionViewModel
    {
        public string Id { get; set; }

        [Required(ErrorMessage = "Username is required"), StringLength(200, MinimumLength = 2, ErrorMessage = "Username must be between 2 and 200 characters")]
        public string UserName { get; set; }

        public string FullName { get; set; }

        [Required(ErrorMessage = "Email is required"), StringLength(200, ErrorMessage = "Email must be at most 200 characters"), EmailAddress(ErrorMessage = "Invalid email address")]
        public string Email { get; set; }

        public string JobTitle { get; set; }

        public string PhoneNumber { get; set; }

        public string Configuration { get; set; }

        public bool IsEnabled { get; set; }
        public bool IsSocialLogin { get; set; }
        public bool HasSubscribedNewsletter { get; set; }
        public bool IsDeleted { get; set; }

        public bool IsLockedOut { get; set; }

        [Required]
        [DataType(DataType.Password)]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 8)]
        [Display(Name = "Password")]
        [RegularExpression("^(" +
            "(?=.*?[A-Z])(?=.*?[a-z])|" +
             "(?=.*?[A-Z])(?=.*?[0-9])|" +
              "(?=.*?[A-Z])(?=.*?[^a-zA-Z0-9])|" +
            "(?=.*?[a-z])(?=.*?[^a-zA-Z0-9])|" +
              "(?=.*?[a-z])(?=.*?[0-9])|" +
              "(?=.*?[a-z])(?=.*?[A-Z])|" +
            "(?=.*?[0-9])(?=.*?[^a-zA-Z0-9])|" +
              "(?=.*?[0-9])(?=.*?[A-Z])|" +
              "(?=.*?[0-9])(?=.*?[a-z])|" +
            "(?=.*?[^a-zA-Z0-9])(?=.*?[0-9])" +
             "(?=.*?[^a-zA-Z0-9])(?=.*?[A-Z])" +
             "(?=.*?[^a-zA-Z0-9])(?=.*?[a-z])" +
            ").{8,}$", ErrorMessage = "Passwords must contain at least 1 character from at least 2 of 4 of the following: upper case (A-Z), lower case (a-z), " +
            "number (0-9) or special character (!@#$%^&*), and be at least 8 characters long.")]
        public string Password { get; set; }
        public string RoleName { get; set; }

        public string ProfileImage { get; set; }

        public string TempUserName { get; set; }
    }
}
