using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.Models.SPModels
{
    public class Combat_ViewModel
    {
        public int Id { get; set; }

        public int? CampaignId { get; set; }
        public RuleSet Campaign { get; set; }

        public bool IsStarted { get; set; }
        public int Round { get; set; }

        public bool IsDeleted { get; set; }

        public List<Combatant_ViewModel> CombatantList { get; set; }
        public CombatSetting CombatSettings { get; set; }
    }
    public class Combatant_ViewModel
    {
        public int Id { get; set; }

        public int? CombatId { get; set; }
        public Combat Combat { get; set; }

        public string Type { get; set; }

        public int? CharacterId { get; set; }
        public Character Character { get; set; }

        public int? MonsterId { get; set; }
        public Monster Monster { get; set; }

        public int SortOrder { get; set; }

        public string InitiativeCommand { get; set; }

        public decimal? Initiative { get; set; }

        public bool IsDeleted { get; set; }
    }
}
