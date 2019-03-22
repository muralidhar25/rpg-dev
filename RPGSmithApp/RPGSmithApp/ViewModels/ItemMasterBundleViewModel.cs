using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class ItemMasterBundleViewModel
    {
         public int BundleId { get; set; }

        [Required]
        public int? RuleSetId { get; set; }

        [Required]
        [MaxLength(255, ErrorMessage = "The field Name must be string with maximum length of 255 characters")]
        public string BundleName { get; set; }
        
        public string BundleImage { get; set; }
       
        public string BundleVisibleDesc { get; set; }    
        
        public decimal Value { get; set; }        
        
        public decimal Volume { get; set; }       
        
        public decimal TotalWeight { get; set; }   
       
        public string Metatags { get; set; }
       
        public string Rarity { get; set; }
    }
}
