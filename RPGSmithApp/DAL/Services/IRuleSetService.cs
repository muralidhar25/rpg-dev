using DAL.Models;
using DAL.Models.SPModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface IRuleSetService
    {
        Task<RuleSet> Insert(RuleSet RuleSetDomain);
        Task<List<RuleSet>> GetRuleSets(int page, int pageSize);
        Task<List<RuleSet>> GetRuleSets();
        Task<RuleSet> GetRuleSetById(int Id);
        Task<List<RuleSet>> GetRuleSetByUserId(string UserId);
        Task<bool> DeleteRuleSet(int id);
        Task<RuleSet> UdateRuleSet(RuleSet RuleSetDomain);
        Task<bool> AssignRuleSetToUser(UserRuleSet UserRuleSetDomain);
        Task<bool> IsRuleSetExist(string value, string userId, int? ruleSetId = 0);
        Task<int> GetRuleSetsCount();
        Task<int> GetRuleSetsCountByUserId(string userId);
        List<RuleSet> GetRuleSetsByUserId(string UserId);
        Task<List<RuleSet>> GetRuleSetByUserId(string UserId,int page, int pageSize);
        Task<RuleSet> ImportRuleSetByCode(string code);
        Task<List<RuleSet>> GetCoreRuleSets(string UserId);
        Task<RuleSet> duplicateRuleset(RuleSet model,int RuleSetId, string userid);
        Task<RuleSet> AddCoreRuleset(RuleSet model,int RuleSetId, string userid);
        bool Core_RuleSetWithParentIDExists(int ruleSetId = 0);
        Task<RuleSet> Core_RuleSetWithParentIDUserID(int rulesetID, string userID);
        SP_RulesetRecordCount GetRulesetRecordCounts(int RulesetID);
        Task<RuleSet> GetRuleSetBySharecode(Guid rulesetSharecode);
        Task<RuleSet> duplicateAddedRuleset(RuleSet ruleSetDomain, int ruleSetId, string userId);
        List<CustomDice> AddCustomDice(List<CustomDice> diceList, int rulesetID);
        void removeAllDice(int rulesetID);
        List<CustomDice> GetCustomDice(int rulesetID);
        void CopyCustomDiceToNewRuleSet(int copyFromRulesetID, int copyToRulesetID);
        List<DiceTray> GetDiceTray(int ruleSetId);
        List<DefaultDice> GetDefaultDices();
        List<DiceTray> addEditDiceTray(List<CustomDice> customDices, List<DiceTray> diceTrays,int rulesetID);
        void removeDiceTray(int rulesetID);
        List<RuleSet> GetRuleSetToCreateCharacterByUserId(string UserId, int page, int pageSize);
        string GetUserImageFromRulesetID(int ruleSetId);
        List<CharacterAbility> SearchCharacterAbilities(SearchModel searchModel);
        List<Ability> SearchRulesetAbilities(SearchModel searchModel);
        List<CharacterSpell> SearchCharacterSpells(SearchModel searchModel);
        List<Spell> SearchRulesetSpells(SearchModel searchModel);
        List<Item> SearchCharacterItems(SearchModel searchModel);
        List<ItemMaster> SearchRulesetItems(SearchModel searchModel);
        void SaveLastSearchFilters(SearchModel searchModel);
    }
}
