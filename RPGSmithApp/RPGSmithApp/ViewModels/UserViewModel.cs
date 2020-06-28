// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

using DAL.Models;
using FluentValidation;
using RPGSmithApp.Helpers;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;


namespace RPGSmithApp.ViewModels
{
    public class UserViewModel
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

        public bool IsLockedOut { get; set; }
        public bool IsSocialLogin { get; set; }
        public bool HasSubscribedNewsletter { get; set; }
        public bool IsDeleted { get; set; }

        [MinimumCount(1, ErrorMessage = "Roles cannot be empty")]
        public string[] Roles { get; set; }
        public DateTime CreatedDate { get; set; }

        public string ProfileImage { get; set; }
        public string Url { get; set; }
        public bool IsAdmin { get; set; }
        public bool IsGm { get; set; }
        public bool IsGmPermanent { get; set; }
        public bool IsSubscriptionAutoRenew { get; set; }
        public bool RemoveAds { get; set; }
        public int RulesetSlot { get; set; }
        public int PlayerSlot { get; set; }
        public int CharacterSlot { get; set; }
        public int CampaignSlot { get; set; }
        public int StorageSpace { get; set; }
        public DateTime? AutoRenewDate { get; set; }
    }




    ////Todo: ***Using DataAnnotations for validations until Swashbuckle supports FluentValidation***
    //public class UserViewModelValidator : AbstractValidator<UserViewModel>
    //{
    //    public UserViewModelValidator()
    //    {
    //        //Validation logic here
    //        RuleFor(user => user.UserName).NotEmpty().WithMessage("Username cannot be empty");
    //        RuleFor(user => user.Email).EmailAddress().NotEmpty();
    //        RuleFor(user => user.Password).NotEmpty().WithMessage("Password cannot be empty").Length(4, 20);
    //    }
    //}
}
