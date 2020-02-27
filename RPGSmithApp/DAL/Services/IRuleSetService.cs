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
        Task<List<RuleSet>> GetRuleSetByUserId(string UserId, int page, int pageSize);
        Task<RuleSet> ImportRuleSetByCode(string code);
        Task<List<RuleSet>> GetCoreRuleSets(string UserId);
        Task<RuleSet> duplicateRuleset(RuleSet model, int RuleSetId, string userid);
        Task<RuleSet> AddCoreRuleset(RuleSet model, int RuleSetId, string userid);
        bool Core_RuleSetWithParentIDExists(int ruleSetId = 0);
        Task<RuleSet> Core_RuleSetWithParentIDUserID(int rulesetID, string userID);
        SP_RulesetRecordCount GetRulesetRecordCounts(int RulesetID);
        Task<RuleSet> GetRuleSetBySharecode(Guid rulesetSharecode);
        Task<RuleSet> duplicateAddedRuleset(RuleSet ruleSetDomain, int ruleSetId, string userId);
        List<CustomDice> AddCustomDice(List<CustomDice> diceList, int rulesetID);
        void removeAllDice(int rulesetID);
        void RemoveCurrency(int rulesetID);
        List<CustomDice> GetCustomDice(int rulesetID);
        void CopyCustomDiceToNewRuleSet(int copyFromRulesetID, int copyToRulesetID);
        List<DiceTray> GetDiceTray(int ruleSetId);
        List<DefaultDice> GetDefaultDices();
        List<DiceTray> addEditDiceTray(List<CustomDice> customDices, List<DiceTray> diceTrays, int rulesetID);
        void removeDiceTray(int rulesetID);
        List<RuleSet> GetRuleSetToCreateCharacterByUserId(string UserId, int page, int pageSize);
        string GetUserImageFromRulesetID(int ruleSetId);
        List<CharacterAbility> SearchCharacterAbilities(SearchModel searchModel, int[] idsToSearch = null);
        List<Ability> SearchRulesetAbilities(SearchModel searchModel, int[] idsToSearch = null);
        List<CharacterSpell> SearchCharacterSpells(SearchModel searchModel, int[] idsToSearch = null);
        List<Spell> SearchRulesetSpells(SearchModel searchModel, int[] idsToSearch = null);
        List<Item> SearchCharacterItems(SearchModel searchModel, int[] idsToSearch = null);
        List<ItemMaster_Bundle> SearchRulesetItems(SearchModel searchModel, int[] idsToSearch = null);

        void SaveLastSearchFilters(SearchModel searchModel);
        List<SearchEverything> bindEveryThingModel(
            List<CharacterAbility> characterAbilities,
            List<Ability> abilities,
            List<CharacterSpell> characterSpells,
            List<Spell> spells,
            List<Item> items,
            List<ItemMaster_Bundle> itemMasters,

            List<BuffAndEffectVM> buffAndEffects,
            List<CharacterBuffAndEffect> characterBuffAndEffects,
            List<ItemMasterLoot> loots,
            List<LootTemplate> lootTemplates,
            List<Monster> monsters,
            List<MonsterTemplate_Bundle> monsterTemplates,
            List<HandoutViewModel> handouts, int CharacterID, 
            List<ItemMasterLoot> characterLoots, 
            List<Item> rulesetCharacteritems);
        List<SearchEverything> SearchEveryThing(SearchModel searchModel,int CharacterID);
        bool IsRulesetAlreadyPurchased(int ruleSetId, string userID);
        Task updateUserPurchasedRuleset(int ruleSetId, string userID);
        Task<DiceRollModel> GetDiceRollModelAsync(int RulesetID, int CharacterID, ApplicationUser User);

        Task<RuleSet> UpdateLastCommand(int rulesetId, string lastcommand, string lastcommandresult, string lastCommandValues, int lastCommandTotal, string lastcommandresultcolor);
        Task<bool> CheckDuplicateRulesetCommand(string value, int? rulesetId, int? rulesetCommandId = 0);
        Task<RulesetCommand> Create(RulesetCommand item);
        Task<RuleSet> UpdateRulesetLastCommand(RuleSet _ruleSet);
        Task<RulesetCommand> Update(RulesetCommand item);
        Task<bool> Delete(int id);
        bool IsCombatStarted(int RuleSetId);

        List<ItemMasterLoot> SearchRulesetLoots(SearchModel searchModel, int[] idsToSearch = null, string UserID = "");
        List<LootTemplate> SearchRulesetLootTemplates(SearchModel searchModel, int[]idsToSearch = null, string UserID = "");
        List<MonsterTemplate_Bundle> SearchRulesetMonsterTemplates(SearchModel searchModel, int[]idsToSearch = null, string UserID = "");
        List<Monster> SearchRulesetMonsters(SearchModel searchModel, int[]idsToSearch = null, string UserID = "");
        List<BuffAndEffectVM> SearchRulesetBuffAndEffects(SearchModel searchModel, int[]idsToSearch = null, string UserID = "");
        List<CharacterBuffAndEffect> SearchCharacterBuffAandEffects(SearchModel searchModel, int[]idsToSearch = null, string UserID = "");
        List<ItemMasterLoot> SearchCharacterLoots(SearchModel searchModel, int[] idsToSearch = null, string UserID = "");
        List<Item> SearchRulesetCharacteritems(SearchModel searchModel, int[] idsToSearch = null, string UserID = "");
        bool IsItemEnabled(int rulesetID);
        bool IsSpellEnabled(int rulesetID);
        bool IsAbilityEnabled(int rulesetID);
        bool IsBuffAndEffectEnabled(int rulesetID);

        //CurrencyType #889
        Task<List<CurrencyType>> addCurrencyTypes(List<CurrencyType> currencyTypes, int rulesetId);
        Task<List<CurrencyType>> updateCurrencyTypes(List<CurrencyType> currencyTypes, int rulesetId);
        Task<List<CurrencyType>> GetCurrencyTypes(int ruleSetId);
        Task<CurrencyType> GetDefaultCurrencyType(int ruleSetId);
        Task<List<CurrencyType>> GetCurrencyTypesWithDefault(int ruleSetId);
        Task removeCurrencyTypes(int ruleSetId);
        Task<CurrencyType> GetCurrencyTypeById(int CurrencyTypeId);
        Task<bool> AddCharacterCurrency(int CharacterId, int RuleSetId);
    }
}
