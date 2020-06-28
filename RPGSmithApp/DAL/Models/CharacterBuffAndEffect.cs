using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class CharacterBuffAndEffect
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CharacterBuffAandEffectId { get; set; }

        [Required]
        public int? CharacterId { get; set; }

        [Required]
        public int? BuffAndEffectID { get; set; }
        public bool IsDeleted { get; set; }
        
        public virtual BuffAndEffect BuffAndEffect { get; set; }
        public virtual Character Character { get; set; }
    }
}
