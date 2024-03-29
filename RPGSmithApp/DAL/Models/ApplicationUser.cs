﻿// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using DAL.Models.Interfaces;

namespace DAL.Models
{
    public class ApplicationUser : IdentityUser, IAuditableEntity
    {
        public virtual string FriendlyName
        {
            get
            {
                string friendlyName = string.IsNullOrWhiteSpace(FullName) ? UserName : FullName;

                if (!string.IsNullOrWhiteSpace(JobTitle))
                    friendlyName = $"{JobTitle} {friendlyName}";

                return friendlyName;
            }
        }


        public string JobTitle { get; set; }
        public string FullName { get; set; }
        public string Configuration { get; set; }
        public bool IsEnabled { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsSocialLogin { get; set; }
        public bool HasSubscribedNewsletter { get; set; }
        public bool IsLockedOut => this.LockoutEnabled && this.LockoutEnd >= DateTimeOffset.UtcNow;

        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public string ProfileImage { get; set; }
        public string TempUserName { get; set; }

        public bool IsGm { get; set; }
        public DateTime GmEndDate { get; set; }
        public bool IsGmPermanent { get; set; }
        public bool RemoveAds { get; set; }
        public string StripeCustomerId { get; set; }
        public string StripeSubscriptionID { get; set; }


        /// <summary>
        /// Navigation property for the roles this user belongs to.
        /// </summary>
        public virtual ICollection<IdentityUserRole<string>> Roles { get; set; }

        /// <summary>
        /// Navigation property for the claims this user possesses.
        /// </summary>
        public virtual ICollection<IdentityUserClaim<string>> Claims { get; set; }

        /// <summary>
        /// Demo Navigation property for orders this user has processed
        /// </summary>
        //public ICollection<Order> Orders { get; set; }

        public ICollection<UserRuleSet> UserRuleSets { get; set; }

        public virtual ICollection<RuleSet> RuleSets { get; set; }
        public virtual ICollection<RuleSet> RuleSets1 { get; set; }
        public virtual ICollection<RuleSet> RuleSets2 { get; set; }

        public virtual ICollection<CharacterStat> CharacterStat { get; set; }
        public virtual ICollection<CharacterStat> CharacterStat1 { get; set; }
        public virtual ICollection<CharacterStat> CharacterStat2 { get; set; }

        public ICollection<Character> Characters { get; set; }

        public virtual ICollection<ItemMasterPlayer> ItemMasterPlayers { get; set; }
    }
}
