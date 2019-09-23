using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
   public class Combat
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int? CampaignId { get; set; }
        public virtual RuleSet Campaign { get; set; }

        public bool IsStarted { get; set; }
        public int Round { get; set; }

        public bool IsDeleted { get; set; }

        [DefaultValue(false)]
        public bool HasCharacterChangedTurn { get; set; }

        public virtual ICollection<CombatantList> CombatantLists { get; set; }
       // public virtual CombatSetting CombatSettings { get; set; }
    }
}
