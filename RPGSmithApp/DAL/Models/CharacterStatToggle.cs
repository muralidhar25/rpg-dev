using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DAL.Models
{
    public class CharacterStatToggle
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CharacterStatToggleId { get; set; }

        public Boolean YesNo { get; set; }
        public Boolean OnOff { get; set; }
        public Boolean Display { get; set; }
        public Boolean ShowCheckbox { get; set; }
        public Boolean IsCustom { get; set; }
        public Boolean IsDeleted { get; set; }

        //public int CustomToggleId { get; set; }

        public int CharacterStatId { get; set; }

        public virtual CharacterStat CharacterStat { get; set; }
        public virtual ICollection<CustomToggle> CustomToggles { get; set; }
    }
}
