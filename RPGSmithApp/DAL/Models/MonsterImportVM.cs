using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.Models
{
   public class MonsterImportVM
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
        public List<MonsterBuffAndEffects> MonsterBuffAndEffects { get; set; }
        public List<MonsterSpells> MonsterSpells { get; set; }
        public List<MonsterAbilitys> MonsterAbilitys { get; set; }
        public List<MonsterCommands> MonsterCommands { get; set; }
        public List<ItemMasterMonsterItems> ItemMasterMonsterItems { get; set; }


    }

    public class MonsterBuffAndEffects
    {
        public int id { get; set; }

        public int monsterId { get; set; }

        public int buffAndEffectId { get; set; }

        public bool isDeleted { get; set; }

    }
    public class MonsterSpells
    {
        public int id { get; set; }

        public int monsterId { get; set; }

        public int spellId { get; set; }

        public bool isDeleted { get; set; }

    }
    public class MonsterAbilitys
    {
        public int Id { get; set; }
        public int MonsterTemplateId { get; set; }
        public int AbilityId { get; set; }
        public bool IsDeleted { get; set; }

    }

    public class ItemMasterMonsterItems
    {

        public int Id { get; set; }
        public int MonsterTemplateId { get; set; }
        public int ItemMasterId { get; set; }
        public int Qty { get; set; }
        public bool IsDeleted { get; set; }
    }

    public class MonsterCommands
    {

        public int monsterCommandId { get; set; }
        public string command { get; set; }
        public string name { get; set; }
        public int monsterId { get; set; }
        public bool IsDeleted { get; set; }
    }


}