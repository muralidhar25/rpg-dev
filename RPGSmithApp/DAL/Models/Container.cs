using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class Container
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int? ContainerId { get; set; }
        
        [Required]
        //[ForeignKey("Item")]
        public int? ItemId { get; set; }

        [Required]
        public int? CharacterId { get; set; }

        public bool? IsDeleted { get; set; }
        //public virtual Item Item { get; set; }
    }
}
