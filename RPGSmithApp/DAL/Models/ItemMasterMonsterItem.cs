using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class ItemMasterMonsterItem
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ItemId { get; set; }

        [Required]
        public int ItemMasterId { get; set; }

        [Required]
        public int MonsterId { get; set; }

        [Column(TypeName = "decimal(18, 3)")]
        public decimal Quantity { get; set; }

        public bool IsDeleted { get; set; }

        public virtual ItemMaster ItemMaster { get; set; } 
        public virtual Monster Monster { get; set; } 
    }
}
