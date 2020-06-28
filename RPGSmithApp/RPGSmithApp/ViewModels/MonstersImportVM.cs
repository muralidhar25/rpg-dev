using DAL.Models;
using DAL.Models.SPModels;
using System.Collections.Generic;

namespace RPGSmithApp.ViewModels
{
    public class MonstersImportVM
    {
        public int MonsterTemplateId { get; set; }
        
        public int RuleSetId { get; set; }
        public string Name { get; set; }
        public string ImageUrl { get; set; }
        public string Metatags { get; set; }
        public string Health { get; set; }
        public string ArmorClass { get; set; }
        public string XPValue { get; set; }
        public string ChallangeRating { get; set; }
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

        public string Command1 { get; set; }
        public string CommandName1 { get; set; }
        public string Command2 { get; set; }
        public string CommandName2 { get; set; }
        public string Command3 { get; set; }
        public string CommandName3 { get; set; }
        public string Command4 { get; set; }
        public string CommandName4 { get; set; }
        public string Command5 { get; set; }
        public string CommandName5 { get; set; }
        public string Command6 { get; set; }
        public string CommandName6 { get; set; }
        public string Command7 { get; set; }
        public string CommandName7 { get; set; }
        public string Command8 { get; set; }
        public string CommandName8 { get; set; }
        public string Command9 { get; set; }
        public string CommandName9 { get; set; }
        public string Command10 { get; set; }
        public string CommandName10 { get; set; }

        //public List<MultipleCommands> MultipleCommands { get; set; }
    
        public List<MonsterTemplateCommand> MonsterTemplateCommandVM { get; set; }
        public List<MonsterTemplateBuffAndEffect> MonsterTemplateBuffAndEffectVM { get; set; }
        public List<MonsterTemplateAbility> MonsterTemplateAbilityVM { get; set; }
        public List<MonsterTemplateSpell> MonsterTemplateSpellVM { get; set; }
        public List<MonsterTemplateMonster> MonsterTemplateAssociateMonsterTemplateVM { get; set; }
        public List<MonsterTemplateItemMaster> MonsterTemplateItemMasterVM { get; set; }
        public List<RandomizationEngine> RandomizationEngine { get; set; }
        public List<REItems> REItems { get; set; }
        public List<MonsterTemplateCurrency> MonsterTemplateCurrency { get; set; }
    }

    //public class MultipleCommands
    //{
    //    public string Command0 { get; set; }
    //    public string CommandName0 { get; set; }
    //    public string Command1 { get; set; }
    //    public string CommandName1 { get; set; }
    //    public string Command2 { get; set; }
    //    public string CommandName2 { get; set; }
    //    public string Command3 { get; set; }
    //    public string CommandName3 { get; set; }
    //    public string Command4 { get; set; }
    //    public string CommandName4 { get; set; }
    //    public string Command5 { get; set; }
    //    public string CommandName5 { get; set; }
    //    public string Command6 { get; set; }
    //    public string CommandName6 { get; set; }
    //    public string Command7 { get; set; }
    //    public string CommandName7 { get; set; }
    //    public string Command8 { get; set; }
    //    public string CommandName8 { get; set; }
    //    public string Command9 { get; set; }
    //    public string CommandName9 { get; set; }
    //    public string Command10 { get; set; }
    //    public string CommandName10 { get; set; }
    //}

}