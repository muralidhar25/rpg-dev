using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.ViewModelProc
{
    public class ItemMasterSP
    {
        public int ItemMasterId { get; set; }
        public int RuleSetId { get; set; }
        public string ItemName { get; set; }
        public string ItemImage { get; set; }
        public string ItemStats { get; set; }
        public string ItemVisibleDesc { get; set; }
        public string Command { get; set; }
        public string ItemCalculation { get; set; }
        public decimal Value { get; set; }
        public decimal Volume { get; set; }
        public decimal Weight { get; set; }
        public bool IsContainer { get; set; }
        public decimal ContainerWeightMax { get; set; }
        public decimal ContainerVolumeMax { get; set; }
        public string ContainerWeightModifier { get; set; }
        public decimal PercentReduced { get; set; }
        public decimal TotalWeightWithContents { get; set; }
        public bool IsMagical { get; set; }
        public bool IsConsumable { get; set; }
        public string Metatags { get; set; }
        public string Rarity { get; set; }
        public int? ParentItemMasterId { get; set; }
        public bool? IsDeleted { get; set; }
        public string CommandName { get; set; }
        public string gmOnly { get; set; }
        public RuleSet RuleSet { get; set; }
        public ItemMasterSP ItemMasters1 { get; set; }
        public ItemMaterAbitlitySP ItemMasterAbilities { get; set; }
        public List<ItemMasterBuffAndEffect> itemMasterBuffAndEffects { get; set; }
        public ItemMasterSpellSP ItemMasterSpell { get; set; }
        public ItemMasterCommand ItemMasterCommand { get; set; }
        public  ItemMasterLoot ItemMasterLoot { get; set; }
        public ItemsSP Items { get; set; }
    }
}
