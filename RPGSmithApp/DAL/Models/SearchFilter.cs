using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class SearchFilter
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

       
        public int? CharacterId { get; set; }

        
        public int? RulesetId { get; set; }

        public bool IsRuleSet { get; set; }
        public bool IsCharacter { get; set; }

        public bool IsItem { get; set; }
        public bool IsSpell { get; set; }
        public bool IsAbility { get; set; }
        public bool IsBuffEffect { get; set; }
        public bool IsMonster { get; set; }
        public bool IsMonsterTemplate { get; set; }
        public bool IsLoot { get; set; }
        public bool IsLootTemplate { get; set; }
        public bool IsHandout { get; set; }

        public bool IsName { get; set; }
        public bool IsTags { get; set; }
        public bool IsStats { get; set; }
        public bool IsDesc { get; set; }
        public bool IsRarity { get; set; }
        public bool IsAssociatedSpell { get; set; }
        public bool IsAssociatedAbility { get; set; }
        public bool IsLevel { get; set; }
        public bool IsClass { get; set; }
        public bool IsSchool { get; set; }
        public bool IsCastingTime { get; set; }
        public bool IsEffectDesc { get; set; }
        public bool IsHitEffect { get; set; }
        public bool IsMissEffect { get; set; }

        public bool IsChallengeRating { get; set; }
        public bool IsXPValue { get; set; }
        public bool IsAssociatedBE { get; set; }
        public bool IsAssociatedItem { get; set; }
        public bool IsHealth { get; set; }
        public bool IsAC { get; set; }
        public bool IsFileType { get; set; }


        




        public virtual Character Character { get; set; }
        public virtual RuleSet RuleSet { get; set; }
        

    }
}
