using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DAL.Models
{
    public class CharacterStatCombo
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CharacterStatComboId { get; set; }

        public Nullable<int> Maximum { get; set; }

        public Nullable<int> Minimum { get; set; }

        public int DefaultValue { get; set; }

        public int CharacterStatId { get; set; }

        public bool IsDeleted { get; set; }

        public virtual CharacterStat CharacterStat { get; set; }
    }
}
