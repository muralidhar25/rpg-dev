using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DAL.Models;

namespace RPGSmithApp.ViewModels
{
    public class CharacterSpellViewModel
    {
        [Required]
        public int? CharacterId { get; set; }

        [Required]
        public bool? IsMemorized { get; set; }

        [Required]
        public int? SpellId { get; set; }

        public List<SpellIds> MultiSpells { get; set; }

        public virtual Character Character { get; set; }
        public virtual Spell Spell { get; set; }
    }

    public class SpellIds
    {
        public int SpellId { get; set; }
    }
}
