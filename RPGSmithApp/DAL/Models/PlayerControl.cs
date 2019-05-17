using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class PlayerControl
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int CampaignID { get; set; }
        public virtual RuleSet Campaign { get; set; }
        public int? PlayerCharacterID { get; set; }
        public virtual Character PlayerCharacter { get; set; }
        public bool PauseGame { get; set; }
        public bool PauseItemCreate { get; set; }
        public bool PauseItemAdd { get; set; }
        public bool PauseSpellCreate { get; set; }
        public bool PauseSpellAdd { get; set; }
        public bool PauseAbilityCreate { get; set; }
        public bool PauseAbilityAdd { get; set; }
    }
    public class PlayerControlModel : PlayerControl {
        public bool IsPlayerCharacter { get; set; }
        public bool IsCurrentCampaignPlayerCharacter { get; set; }
    }
}
