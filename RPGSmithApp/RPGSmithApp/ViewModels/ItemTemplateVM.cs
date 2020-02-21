using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class ItemTemplateVM
    {
        public int ItemMasterId { get; set; }
        public int RuleSetId { get; set; }

        [Required(ErrorMessage="Please insert ItemName")]
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
        public string Command1 { get; set; }
        public string CommandName1 { get; set; }
        public string Command2 { get; set; }
        public string CommandName2 { get; set; }
        public string Command3 { get; set; }
        public string CommandName3 { get; set; }
        public string Command4 { get; set; }
        public string CommandName4 { get; set; }
        public string Command5 { get; set; }
        public string CommandName5 { get; set; }
        public string Command6 { get; set; }
        public string CommandName6 { get; set; }
        public string Command7 { get; set; }
        public string CommandName7 { get; set; }
        public string Command8 { get; set; }
        public string CommandName8 { get; set; }
        public string Command9 { get; set; }
        public string CommandName9 { get; set; }
        public string Command10 { get; set; }
        public string CommandName10 { get; set; }

    }
}
