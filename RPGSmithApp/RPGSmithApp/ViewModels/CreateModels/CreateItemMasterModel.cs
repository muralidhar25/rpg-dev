using DAL.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels.CreateModels
{
    public class CreateItemMasterModel
    {
        public int ItemMasterId { get; set; }

        [Required]
        public int? RuleSetId { get; set; }

        [Required]
        [MaxLength(255, ErrorMessage = "The field Name must be string with maximum length of 255 characters")]
        public string ItemName { get; set; }

        public string ItemImage { get; set; }

//        [MaxLength(1024, ErrorMessage = "The field Stats must be string with maximum length of 1024 characters")]
        public string ItemStats { get; set; }

//        [MaxLength(4000, ErrorMessage = "The field Visible Description must be string with maximum length of 1024 characters")]
        public string ItemVisibleDesc { get; set; }
        public string gmOnly { get; set; }


        public string Command { get; set; }

        public string ItemCalculation { get; set; }
        
        public decimal? Value { get; set; }
        
        public decimal? Volume { get; set; }
        
        public decimal? Weight { get; set; }
        
        public bool? IsContainer { get; set; }
        //public int ContainerId { get; set; }

        public decimal ContainerWeightMax { get; set; }

        public string ContainerWeightModifier { get; set; }

        public decimal ContainerVolumeMax { get; set; }

        public decimal PercentReduced { get; set; }
        public decimal TotalWeightWithContents { get; set; }

        public bool? IsMagical { get; set; }
        
        public bool? IsConsumable { get; set; }

        public string Metatags { get; set; }

        public string Rarity { get; set; }

        public bool IsFromCharacter { get; set; }
        public int IsFromCharacterId { get; set; }
        public string CommandName { get; set; }
        public ItemViewModel Item { get; set; }

        public List<ItemMasterAbility> itemMasterAbilityVM { get; set; }

        public List<ItemMasterSpell> itemMasterSpellVM { get; set; }

        public List<ItemMasterPlayer> itemMasterPlayerVM { get; set; }

        public List<ItemMasterCommand> itemMasterCommandVM { get; set; }

        public virtual List<containerItemIds> ContainerItems { get; set; }

        public List<ItemMasterBuffAndEffect> itemMasterBuffAndEffectVM { get; set; }
    }

    public class CreateItemMasterLootModel : CreateItemMasterModel {
       
        public int LootId { get; set; }
        public int ParentLootId { get; set; }
        public bool IsShow { get; set; }
        public int? ContainedIn { get; set; }        
        public decimal Quantity { get; set; }
        public bool? IsIdentified { get; set; }
        public bool? IsVisible { get; set; }
        public List<ItemMasterLootCurrency> ItemMasterLootCurrency { get; set; }
    }

    
}
