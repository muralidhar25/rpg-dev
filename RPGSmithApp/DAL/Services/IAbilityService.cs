using DAL.Models;
using DAL.Models.SPModels;
using DAL.ViewModelProc;
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
        Task<Ability> Create(Ability item,List<AbilityBuffAndEffect> AbilityBuffAndEffectVM);
        Task<Ability> Update(Ability item, List<AbilityBuffAndEffect> AbilityBuffAndEffectVM, bool IsFromCharacter = false);
        Task<bool> Delete(int id);
        List<Ability> GetAbilitiesByRuleSetId(int ruleSetId);
        int GetCountByRuleSetId(int ruleSetId);
        int Core_GetCountByRuleSetId(int ruleSetId, int parentID);
        Task<bool> CheckDuplicateAbility(string value, int? ruleSetId, int? abilityId = 0);
        void ToggleEnableAbility(int Id);
        List<Ability> Core_GetAbilitiesByRuleSetId(int ruleSetId, int parentID);
        bool Core_AbilityWithParentIDExists(int abilityId, int RulesetID);
        Task<Ability> Core_CreateAbility(Ability ability,List<AbilityBuffAndEffect> AbilityBuffAndEffectVM);
        //List<Ability> SP_GetAbilityByRuleSetId_Old(int rulesetId, int page, int pageSize);
        List<AbilitySP> SP_GetAbilityByRuleSetId(int rulesetId, int page, int pageSize);
        AbilityAssociatedRecords SP_GetAbilityCommands(int abilityId, int RuleSetID);
        //List<Ability> GetAbilitiesByRuleSetId_add_Old(int rulesetId);
        List<AbilitySP> GetAbilitiesByRuleSetId_add(int rulesetId);
        void DeleteMultiAbilities(List<Ability> model, int rulesetId);
    }
}
