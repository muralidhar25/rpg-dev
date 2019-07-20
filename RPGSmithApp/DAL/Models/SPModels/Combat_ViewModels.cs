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


        public bool isCharacterItemEnabled { get; set; }
        public bool isCharacterSpellEnabled { get; set; }
        public bool isCharacterAbilityEnabled { get; set; }
        public bool isCharacterBuffAndEffectEnabled { get; set; }

        public List<Combatant_ViewModel> CombatantList { get; set; }
        public CombatSetting CombatSettings { get; set; }
    }
    public class Character_Combat_VM_ForCharCharStats : Character
    {
        public DiceRollViewModel DiceRollViewModel { get; set; }
    }
    public class Combatant_ViewModel
    {
        public int Id { get; set; }

        public int? CombatId { get; set; }
        public Combat Combat { get; set; }

        public string Type { get; set; }

        public int? CharacterId { get; set; }
        public Character_Combat_VM_ForCharCharStats Character { get; set; }

        public int? MonsterId { get; set; }
        public Monster Monster { get; set; }

        public int SortOrder { get; set; }

        public string InitiativeCommand { get; set; }

        public decimal? Initiative { get; set; }

        public bool IsDeleted { get; set; }

        public bool VisibleToPc { get; set; }

        public string VisibilityColor { get; set; }

        public bool IsCurrentTurn { get; set; }

        public int TargetId { get; set; }

        public string TargetType { get; set; }

        public bool DelayTurn { get; set; }

        public bool IsCurrentSelected { get; set; }

    }
    public class CombatAllTypeMonsters : MonsterTemplate
    {
        public bool IsBundle { get; set; }
        public bool IsMonster { get; set; }
        public int? MonsterId { get; set; }

        public List<MonsterTemplate_BundleItemsWithRandomItems> BundleItems { get; set; }
        public List<RandomizationEngine> RandomizationEngine { get; set; }
    }
    public class MonsterIds
    {
        public int MonsterId { get; set; }
    }
    //public class CombatantList_ViewModel
    //{
    //    public int Id { get; set; }

    //    public int? CombatId { get; set; }

    //    public string Type { get; set; }

    //    public int? CharacterId { get; set; }

    //    public int? MonsterId { get; set; }

    //    public int SortOrder { get; set; }

    //    public decimal? InitiativeValue { get; set; }

    //    public bool IsDeleted { get; set; }
    //}
    public class Combatant_DTModel
    {
        public int RowNum { get; set; }

        public int Id { get; set; }

        public int? CombatId { get; set; }

        public string Type { get; set; }

        public int? CharacterId { get; set; }

        public int? MonsterId { get; set; }

        public int SortOrder { get; set; }

        public decimal? Initiative { get; set; }

        public bool IsDeleted { get; set; }

        public string VisibilityColor { get; set; }

        public bool VisibleToPc { get; set; }

        public bool IsCurrentTurn { get; set; }

    }
    public class CharacterHealthModel
    {
        public int healthCurrent { get; set; }
        public int healthMax { get; set; }
        public int healthStatId { get; set; }
    }
}
