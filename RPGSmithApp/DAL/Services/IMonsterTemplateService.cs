using DAL.Models;
using DAL.Models.SPModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface IMonsterTemplateService
    {
        Task<MonsterTemplate> Create(MonsterTemplate item);
        Task<MonsterTemplate> Update(MonsterTemplate item,
            List<MonsterTemplateAbility> MonsterTemplateAbilityVM,
            List<MonsterTemplateMonster> MonsterTemplateMonsterVM,
            List<MonsterTemplateBuffAndEffect> MonsterTemplateBuffAndEffectVM,
            List<MonsterTemplateItemMaster> MonsterTemplateItemMasterVM,
            List<MonsterTemplateSpell> MonsterTemplateSpellVM,
            List<RandomizationEngine> RandomizationEngine,
            bool IsFromMonsterTemplateScreen = true
            );
        Task<bool> Delete(int id);
        MonsterTemplate GetById(int? id);
        Monster GetMonsterById(int? id, bool IsGettingDetailsForDetailScreenAPI);
        int GetCountByRuleSetId(int ruleSetId);
        int Core_GetCountByRuleSetId(int ruleSetId, int parentID);
        Task<bool> CheckDuplicateMonsterTemplate(string value, int? ruleSetId, int? MonsterTemplateId = 0);
        bool Core_MonsterTemplateWithParentIDExists(int monsterTemplateId, int RulesetID);
        MonsterTemplateWithFilterCount SP_GetMonsterTemplateByRuleSetId(int rulesetId, int page, int pageSize, int sortType = 1);
        List<MonsterTemplateCommand> SP_GetMonsterTemplateCommands(int MonsterTemplateId);
        SP_AssociateForMonsterTemplate SP_GetAssociateRecords(int monsterTemplateId, int rulesetId, int MonsterID);
        Task<MonsterTemplate> Core_CreateMonsterTemplate(MonsterTemplate MonsterTemplate);

        List<MonsterTemplateAbility> insertAssociateAbilities(List<MonsterTemplateAbility> MonsterTemplateAbilityVM);
        Task<List<Monster>> GetMonstersByRulesetIdExport(int ruleSetId);
        List<MonsterTemplateSpell> insertAssociateSpells(List<MonsterTemplateSpell> MonsterTemplateSpellVM);
        List<MonsterTemplateBuffAndEffect> insertAssociateBuffAndEffects(List<MonsterTemplateBuffAndEffect> MonsterTemplateBuffAndEffectVM);
        List<MonsterTemplateMonster> insertAssociateMonsterTemplates(List<MonsterTemplateMonster> MonsterTemplateMonsterVM);
        List<MonsterTemplateItemMaster> insertAssociateItemMasters(List<MonsterTemplateItemMaster> MonsterTemplateItemMasterVM);
        List<RandomizationEngine> insertRandomizationEngines(List<RandomizationEngine> RandomizationEngine, int MonsterTemplateId);
        Task<List<RandomizationSearch_ViewModel>> AddUpdateRandomizationSearchInfo(List<RandomizationSearch_ViewModel> RandomizationSearchInfoList, int lootTemplateId);

        List<int> deployMonster(DeployMonsterTemplate model);
        //List<Monster> SP_GetMonstersByRuleSetId(int rulesetId, int page, int pageSize, int sortType = 1);

        MonstersWithFilterCount SP_GetMonstersByRuleSetId(int rulesetId, int page, int pageSize, int sortType = 1, int? characterId=null);
        Task enableCombatTracker(int monsterId, bool enableCombatTracker);
        Task<MonsterTemplate> Core_CreateMonsterTemplateUsingMonster(int monsterTemplateId, int rulesetID);
        List<ItemMasterForMonsterTemplate> getMonsterItemsToDrop(int monsterId);
        Task<int> DropItemsToLoot(List<ItemMasterForMonsterTemplate> list, int monsterId, List<MonsterCurrency> MonsterCurrency = null);
        Task<Monster> UpdateMonster(Monster model, 
            List<MonsterTemplateAbility> monsterTemplateAbilityVM, 
            List<MonsterTemplateMonster> monsterTemplateAssociateMonsterTemplateVM, 
            List<MonsterTemplateBuffAndEffect> monsterTemplateBuffAndEffectVM,            
            List<MonsterTemplateSpell> monsterTemplateSpellVM, 
            List<MonsterTemplateCommand> monsterTemplateCommandVM,
            List<ItemMasterForMonsterTemplate> monsterTemplateItemVM);
        Task<bool> DeleteMonster(int monsterId);
        List<MonsterTemplate_Bundle> GetMonsterTemplatesByRuleSetId_add(int rulesetId, bool includeBundles = false);
        void addRemoveMonsterRecords(List<AddRemoveRecords> model, int monsterId, string type);
        bool Core_BundleWithParentIDExists(int bundleId, int rulesetID);
        SP_AssociateForMonsterTemplate SP_GetMonsterAssociateRecords(int monsterID, int rulesetId);
        void AddMonsters(List<DeployMonsterTemplate> model);
        ItemMasterMonsterItem GetMonsterItemDetailByItemId(int itemId);
        List<MonsterCommand> SP_GetMonsterCommands(int monsterId);
        void DeleteMultiMonsterTemplates(List<MonsterTemplate_Bundle> model, int rulesetId);
        void DeleteMultiMonsters(List<Monster> model, int rulesetId);
        int Core_GetMonsterCountByRuleSetId(int rulesetId, int parentID);
        int GetMonsterCountByRuleSetId(int rulesetId);
        Task AssignMonsterTocharacter(AssociateMonsterToCharacter model);
        Task<bool> CheckDuplicateMonster(string name, int? ruleSetId, int? MonsterId = 0);
        Task<Monster> duplicateMonster(Monster monsterModel);
        List<Monster> GetMonstersByRulesetId(int ruleSetId);
        // List<MonsterTemplate> GetByRuleSetId_add(int rulesetId);
        Task<string> GetMonsterUniqueName(string MonsterName, int RuleSetId);
        Task<List<MonsterTemplate>> GetMonsterTemplatesByRulesetIdExport(int ruleSetId, int parentRuleSetId);
    }
}
