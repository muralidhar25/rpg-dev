﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class BuffAndEffect
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BuffAndEffectId { get; set; }

        public int RuleSetId { get; set; }

        [Required]
        [Column(TypeName = "nvarchar(255)")]
        public string Name { get; set; }

        public string Command { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Description { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Stats { get; set; }

        [MaxLength(2048, ErrorMessage = "The field must be string with maximum length of 2048 characters")]
        [Column(TypeName = "nvarchar(2048)")]
        public string ImageUrl { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Metatags { get; set; }

        public int? ParentBuffAndEffectId { get; set; }

        public bool? IsDeleted { get; set; }

        [Column(TypeName = "nvarchar(100)")]
        public string CommandName { get; set; }

        

        public virtual BuffAndEffect ParentBuffAndEffect { get; set; }

        public virtual RuleSet RuleSet { get; set; }

        //public virtual ICollection<ItemMasterAbility> ItemMasterAbilities { get; set; }
        public virtual ICollection<BuffAndEffectCommand> BuffAndEffectCommand { get; set; }
    }
    public class BuffAndEffectVM : BuffAndEffect
    {
        public bool IsAssignedToAnyCharacter { get; set; }
    }
}

//UPDATE BuffAndEffects set ImageUrl='../assets/images/BnE/Def_BnE.jpg' where ImageUrl='../assets/images/BnE/Def_BnE.png'
