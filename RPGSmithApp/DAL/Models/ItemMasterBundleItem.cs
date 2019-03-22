using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class ItemMasterBundleItem
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BundleItemId { get; set; }

        public int? BundleId { get; set; }
        public int? ItemMasterId { get; set; }

        [Column(TypeName = "decimal(18, 3)")]
        public decimal Quantity { get; set; }   


        public virtual ItemMasterBundle ItemMasterBundle { get; set; }
        public virtual ItemMaster ItemMaster { get; set; }

    }
}
