using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class MonsterTemplateBundleItem
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BundleItemId { get; set; }

        public int? BundleId { get; set; }
        public int? MonsterTemplateId { get; set; }

        [Column(TypeName = "decimal(18, 3)")]
        public decimal Quantity { get; set; }   


        public virtual MonsterTemplateBundle MonsterTemplateBundle { get; set; }
        public virtual MonsterTemplate MonsterTemplate { get; set; }

    }
}
