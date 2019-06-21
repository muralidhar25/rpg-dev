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
            List<MonsterTemplateSpell> MonsterTemplateSpellVM
            );
        Task<bool> Delete(int id);
        MonsterTemplate GetById(int? id);
        int GetCountByRuleSetId(int ruleSetId);
        int Core_GetCountByRuleSetId(int ruleSetId, int parentID);
        Task<bool> CheckDuplicateMonsterTemplate(string value, int? ruleSetId, int? MonsterTemplateId = 0);
        bool Core_MonsterTemplateWithParentIDExists(int monsterTemplateId, int RulesetID);
        List<MonsterTemplate> SP_GetMonsterTemplateByRuleSetId(int rulesetId, int page, int pageSize);
        List<MonsterTemplateCommand> SP_GetMonsterTemplateCommands(int MonsterTemplateId);
        SP_AssociateForMonsterTemplate SP_GetAssociateRecords(int monsterTemplateId, int rulesetId);
        Task<MonsterTemplate> Core_CreateMonsterTemplate(MonsterTemplate MonsterTemplate);

        List<MonsterTemplateAbility> insertAssociateAbilities(List<MonsterTemplateAbility> MonsterTemplateAbilityVM);
        List<MonsterTemplateSpell> insertAssociateSpells(List<MonsterTemplateSpell> MonsterTemplateSpellVM);
        List<MonsterTemplateBuffAndEffect> insertAssociateBuffAndEffects(List<MonsterTemplateBuffAndEffect> MonsterTemplateBuffAndEffectVM);
        List<MonsterTemplateMonster> insertAssociateMonsterTemplates(List<MonsterTemplateMonster> MonsterTemplateMonsterVM);
        List<MonsterTemplateItemMaster> insertAssociateItemMasters(List<MonsterTemplateItemMaster> MonsterTemplateItemMasterVM);
void deployMonster(int qty, int monsterTemplateId, int RulesetId);
        // List<MonsterTemplate> GetByRuleSetId_add(int rulesetId);

    }
}
