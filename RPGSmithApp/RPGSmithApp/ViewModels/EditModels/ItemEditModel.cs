using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels.EditModels
{
    public class ItemEditModel
    {
        public int ItemId { get; set; }

        public string Name { get; set; }
        public string Description { get; set; }
        public string ItemImage { get; set; }

        public int? CharacterId { get; set; }
        public int? ItemMasterId { get; set; }

        public string Command { get; set; }
        public string CommandName { get; set; }
        public Nullable<int> ContainedIn { get; set; }

        public decimal Quantity { get; set; }
        public decimal TotalWeight { get; set; }

        public decimal Value { get; set; }
        public decimal Volume { get; set; }
        public decimal Weight { get; set; }

        public bool IsContainer { get; set; }
        
        public string ItemStats { get; set; }
        public decimal ContainerWeightMax { get; set; }
        public decimal ContainerVolumeMax { get; set; }
        public string ContainerWeightModifier { get; set; }
        public decimal PercentReduced { get; set; }
        public decimal TotalWeightWithContents { get; set; }
        
        public bool? IsIdentified { get; set; }
        public bool? IsVisible { get; set; }
        public bool? IsEquipped { get; set; }
        public bool IsMagical { get; set; }
        public bool IsConsumable { get; set; }

        public string ItemCalculation { get; set; }

        public string Metatags { get; set; }
        public string Rarity { get; set; }
        
        public int? ParentItemId { get; set; }
        public bool? IsDeleted { get; set; }

        public virtual Character Character { get; set; }
        public virtual ItemMaster ItemMaster { get; set; }

        public virtual List<ItemCommand> ItemCommandVM { get; set; }
        public virtual List<ItemAbility> ItemAbilities { get; set; }
        public virtual List<ItemSpell> ItemSpells { get; set; }

        public virtual List<containerItemIds> ContainerItems { get; set; }
    }

    public class containerItemIds
    {
        public int ItemId { get; set; }
    }
    public class ItemsToDelete {
        public ItemEditModel item { get; set; }
        public List<ItemEditModel> ContainedItemsList { get; set; }
    }
}
