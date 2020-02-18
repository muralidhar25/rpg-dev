using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.ViewModelProc
{
    public class Monster_Randomization_ItemMasterSP
    {
        public int RandomizationEngineId { get; set; }
        public decimal Percentage { get; set; }
        public string Qty { get; set; }
        public int SortOrder { get; set; }
        public int ItemMasterId { get; set; }
        public bool IsOr { get; set; }
        public bool IsDeleted { get; set; }
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
        public string CommandName { get; set; }
        public string gmOnly { get; set; }
        public int Id { get; set; }
        public int MonsterTemplateId { get; set; }
    }
}
