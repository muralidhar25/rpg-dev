using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmith.Web.Models
{
    public class Counter
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int CharacterId { get; set; }
        public int UserId { get; set; }
        [Required]
        [StringLength(128)]
        public string Name { get; set; }
        [StringLength(64)]
        public string Mask { get; set; }
        public decimal DefaultValue { get; set; }
        public decimal Value { get; set; }
        public Nullable<decimal> Min { get; set; }
        public Nullable<decimal> Max { get; set; }
        public decimal Step { get; set; }

        public virtual CharacterProfile Character { get; set; }
    }
}
