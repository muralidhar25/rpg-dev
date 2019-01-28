using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class CharacterAbility
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CharacterAbilityId { get; set; }

        [Required]
        public int? CharacterId { get; set; }

        [Required]
        public bool? IsEnabled { get; set; }

        [Required]
        public int? AbilityId { get; set; }

        public int? CurrentNumberOfUses { get; set; }

        public int? MaxNumberOfUses { get; set; }

        public bool? IsDeleted { get; set; }

        public virtual Ability Ability { get; set; }
        public virtual Character Character { get; set; }
    }
}
