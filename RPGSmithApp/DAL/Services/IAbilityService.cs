using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface IAbilityService
    {
        Ability GetById(int? id);
        List<Ability> GetAll();
        Task<Ability> Create(Ability item);
        Task<Ability> Update(Ability item, bool IsFromCharacter = false);
        Task<bool> Delete(int id);
        List<Ability> GetAbilitiesByRuleSetId(int ruleSetId);
        int GetCountByRuleSetId(int ruleSetId);
        int Core_GetCountByRuleSetId(int ruleSetId, int parentID);
        Task<bool> CheckDuplicateAbility(string value, int? ruleSetId, int? abilityId = 0);
        void ToggleEnableAbility(int Id);
        List<Ability> Core_GetAbilitiesByRuleSetId(int ruleSetId, int parentID);
        bool Core_AbilityWithParentIDExists(int abilityId, int RulesetID);
        Task<Ability> Core_CreateAbility(Ability ability);
        List<Ability> SP_GetAbilityByRuleSetId(int rulesetId, int page, int pageSize);
        List<AbilityCommand> SP_GetAbilityCommands(int abilityId);
        List<Ability> GetAbilitiesByRuleSetId_add(int rulesetId);
    }
}
