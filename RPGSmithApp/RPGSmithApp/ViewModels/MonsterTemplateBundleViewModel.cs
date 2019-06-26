using DAL.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class MonsterTemplateBundleViewModel
    {
         public int BundleId { get; set; }

        [Required]
        public int? RuleSetId { get; set; }

        [Required]
        [MaxLength(255, ErrorMessage = "The field Name must be string with maximum length of 255 characters")]
        public string BundleName { get; set; }
        
        public string BundleImage { get; set; }
       
        public string BundleVisibleDesc { get; set; }    
        
      
       
        public string Metatags { get; set; }
        public bool AddToCombat { get; set; }



        public ICollection<MonsterTemplateBundleItem> BundleItems { get; set; }
        public ICollection<ItemMasterBundleItemDetailsViewModel> BundleItemDetails { get; set; }
    }
    public class MonsterTemplateBundleItemDetailsViewModel : MonsterTemplateBundleItem
    {
        public string MonsterTemplateName { get; set; }
        public string MonsterTemplateImage { get; set; }
    }
}
