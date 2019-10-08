namespace DAL.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public class LogStatUpdate
    {        
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int? CharacterStatId { get; set; }
        public int? CharacterId { get; set; }
        public int? RuleSetId { get; set; }
        public bool AlertToGM { get; set; }
        public bool AlertToPlayer { get; set; }

        public virtual CharacterStat CharacterStat { get; set; }
        public virtual Character Character { get; set; }
        public virtual RuleSet RuleSet { get; set; }

    }
}
