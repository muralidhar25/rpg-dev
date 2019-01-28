using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DAL.Models
{
    public class CharacterCustomToggle
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CustomToggleId { get; set; }

        public String ToggleText { get; set; }
        public String Image { get; set; }
        public bool IsDeleted { get; set; }

        public int CharactersCharacterStatId { get; set; }
        public virtual CharactersCharacterStat CharactersCharacterStat { get; set; }
    }
}
