using DAL.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels.EditModels
{
    public class EditItemMasterModel
    {
        [Required]
        public int? ItemMasterId { get; set; }

        [Required]
        public int? RuleSetId { get; set; }

        [Required]
        [MaxLength(255, ErrorMessage = "The field Name must be string with maximum length of 255 characters")]
        public string ItemName { get; set; }

        public string ItemImage { get; set; }

  //     [MaxLength(1024,ErrorMessage = "The field Stats must be string with maximum length of 1024 characters")]
        public string ItemStats { get; set; }

//        [MaxLength(4000,ErrorMessage = "The field Visible Description must be string with maximum length of 1024 characters")]
        public string ItemVisibleDesc { get; set; }

        public string Command { get; set; }
        public string CommandName { get; set; }

        public string ItemCalculation { get; set; }
              
        public decimal? Value { get; set; }
               
        public decimal? Volume { get; set; }
               
        public decimal? Weight { get; set; }
              
        public bool? IsContainer { get; set; }

        public decimal ContainerWeightMax { get; set; }

        public string ContainerWeightModifier { get; set; }

        public decimal ContainerVolumeMax { get; set; }

        public decimal PercentReduced { get; set; }
        public decimal TotalWeightWithContents { get; set; }

        public bool? IsMagical { get; set; }

       
        public bool? IsConsumable { get; set; }

        public string Metatags { get; set; }

        public string Rarity { get; set; }
       // public string UserID { get; set; }

        public List<ItemMasterAbility> ItemMasterAbilityVM { get; set; }
        public List<ItemMasterBuffAndEffect> ItemMasterBuffAndEffectVM { get; set; }

        public List<ItemMasterSpell> ItemMasterSpellVM { get; set; }

        public List<ItemMasterPlayer> ItemMasterPlayerVM { get; set; }

        public List<ItemMasterCommand> ItemMasterCommandVM { get; set; }
        public virtual List<containerItemIds> ContainerItems { get; set; }
    }
    public class EditItemMasterLootModel : EditItemMasterModel
    {

        public int LootId { get; set; }
        public int ParentLootId { get; set; }

        public bool IsShow { get; set; }

        public int? ContainedIn { get; set; }


        public decimal Quantity { get; set; }
        public decimal TotalWeight { get; set; }

        public bool? IsIdentified { get; set; }
        public bool? IsVisible { get; set; }
    }
}
