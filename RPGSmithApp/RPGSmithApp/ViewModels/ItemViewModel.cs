using DAL.Models;
using DAL.Models.SPModels;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class ItemViewModel
    {
        //[Required]
        public string Name { get; set; }

        public string Description { get; set; }

        public string ItemImage { get; set; }

        [Required]
        public int? CharacterId { get; set; }

        [Required]
        public int? ItemMasterId { get; set; }

        public int ContainerItemId { get; set; }

        public decimal Quantity { get; set; }

        public decimal TotalWeight { get; set; }

        public bool? IsIdentified { get; set; }

        public bool? IsVisible { get; set; }

        public bool? IsEquipped { get; set; }
        
        public int? ParentItemId { get; set; }

        public decimal Value { get; set; }
        public decimal Volume { get; set; }
        public decimal Weight { get; set; }
        public bool IsContainer { get; set; }
        public bool IsMagical { get; set; }
        public bool IsConsumable { get; set; }
        public string ItemCalculation { get; set; }
        public string Metatags { get; set; }
        public string Rarity { get; set; }
        public string Command { get; set; }

        public string ItemStats { get; set; }
        public decimal ContainerWeightMax { get; set; }
        public decimal ContainerVolumeMax { get; set; }
        public string ContainerWeightModifier { get; set; }
        public decimal PercentReduced { get; set; }
        public decimal TotalWeightWithContents { get; set; }

        public List<ItemMasterIds> MultiItemMasters { get; set; }
        public List<LootIds> MultiLootIds { get; set; }
        public List<ItemMasterBundleIds> MultiItemMasterBundles { get; set; }

        public virtual Character Character { get; set; }
        public virtual ItemMaster ItemMaster { get; set; }

        public virtual ICollection<ItemCommand> ItemCommandVM { get; set; }
        public virtual ICollection<ItemAbility> ItemAbilities { get; set; }
        public virtual ICollection<ItemSpell> ItemSpells { get; set; }
    }

    public class ItemViewModel_AddItems_With_Qty
    {
       
        [Required]
        public int? CharacterId { get; set; }

        public List<ItemMasterIds_With_Qty> MultiItemMasters { get; set; }
        public List<ItemMasterBundleIds> MultiItemMasterBundles { get; set; }

        public virtual Character Character { get; set; }
    }
    //public class LootIds
    //{
    //    public int LootId { get; set; }
    //    public string Name { get; set; }

    //}

}
