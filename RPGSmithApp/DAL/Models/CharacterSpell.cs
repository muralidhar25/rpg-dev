using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class CharacterSpell
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CharacterSpellId { get; set; }

        [Required]
        public int? CharacterId { get; set; }

        [Required]
        public bool? IsMemorized { get; set; }

        [Required]
        public int? SpellId { get; set; }

        public bool? IsDeleted { get; set; }

        public virtual Character Character { get; set; }
        public virtual Spell Spell { get; set; }
    }
}
