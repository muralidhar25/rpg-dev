using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class MonstersImportVM
    {
        public int MonsterId { get; set; }
        
        public int RuleSetId { get; set; }
        public string Name { get; set; }
        public string ImageUrl { get; set; }
        public string Metatags { get; set; }
        public int HealthCurrent { get; set; }
        public int HealthMax { get; set; }
        public int ArmorClass { get; set; }
        public int XPValue { get; set; }
        public int ChallangeRating { get; set; }
        public bool AddToCombatTracker { get; set; }
        public string Command { get; set; }
        public string CommandName { get; set; }
        public string Description { get; set; }
        public string Stats { get; set; }
        public int? ParentMonsterId { get; set; }
        public string InitiativeCommand { get; set; }
        public bool IsRandomizationEngine { get; set; }
        public int? CharacterId { get; set; }
        public string gmOnly { get; set; }
    }
}