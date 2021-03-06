﻿using DAL.Models;
using DAL.Models.SPModels;
using DAL.Services;
using DAL.Services.RulesetTileServices;
using DAL.ViewModelProc;
using Microsoft.AspNetCore.Mvc;
using RPGSmithApp.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.Helpers.CoreRuleset
{
    public interface ICoreRuleset
    {
        bool IsCopiedFromCoreRuleset(int RulesetID);
        bool IsItemCopiedFromCoreRuleset(int ItemMasterID, int rulesetID);
        bool IsItemLootCopiedFromCoreRuleset(int LootID, int rulesetID);
        bool IsBundleCopiedFromCoreRuleset(int bundleId, int rulesetID);
        bool IsMonsterBundleCopiedFromCoreRuleset(int bundleId, int rulesetID);
        RulesetRecordCount GetRulesetRecordCounts(int RulesetID);
        List<CharacterStat> Character_GetCharacterStatByRuleSetId(int RulesetID);
        List<ItemMaster> GetItemMastersByRuleSetId(int RulesetID);
        List<Spell> GetSpellsByRuleSetId(int RulesetID);
        List<Ability> GetAbilitiesByRuleSetId(int rulesetId);
        int GetSpellCountByRuleSetId(int rulesetId);
        int GetAbilityCountByRuleSetId(int rulesetId);
        int GetBuffAndEffectCountByRuleSetId(int rulesetId);
        int GetMonsterTemplateCountByRuleSetId(int rulesetId);
        Task<ItemMaster> CreateItemMaster(ItemMaster itemMaster, List<ItemMasterSpell> itemMasterSpellVM, List<ItemMasterAbility> itemMasterAbilityVM, List<ItemMasterBuffAndEffect> itemMasterBuffAndEffectVM);
        Task<int> GetCopiedRuleSetIdFromRulesetAndUser(int RulesetID, string UserID);
        Task<Spell> CreateSpell(Spell spell, List<SpellBuffAndEffect> SpellBuffAndEffectVM);
        bool IsSpellCopiedFromCoreRuleset(int spellID, int RulesetID);
        bool IsAbilityCopiedFromCoreRuleset(int abilityId, int RulesetID);
        bool IsBuffAndEffectCopiedFromCoreRuleset(int buffAndEffectId, int RulesetID);
        bool IsMonsterTemplateCopiedFromCoreRuleset(int MonsterTemplateId, int RulesetID);
        Task<BuffAndEffect> CreateBuffAndEffect(BuffAndEffect buffAndEffect);
        Task<MonsterTemplate> CreateMonsterTemplate(MonsterTemplate MonsterTemplate);
        Task<Ability> CreateAbility(Ability ability, List<AbilityBuffAndEffect> AbilityBuffAndEffectVM);
        bool IsCharacterstatCopiedFromCoreRuleset(int abilityId, int RulesetID);
        Task<CharacterStat> InsertCharacterStat(CharacterStat characterStat);
        Task<ItemMaster> CreateItemMasterUsingItem(int ItemMasterId, int RulesetID);
        Task<MonsterTemplate> CreateMonsterTemplateUsingMonster(int MonsterTemplateId, int RulesetID);
        Task<int> _updateParentIDForAllRelatedItems(int characterId, int oldParentItemMasterID, int itemMasterIDInserted, char Type);
        Task<List<Character>> GetCharactersByRulesetID(int ruleSetId);
        int GetItemCountByRuleSetId(int rulesetId);
        ItemsAndLootTemplates GetItemMastersByRuleSetId_add(int rulesetId, bool includeBundles = false, bool includeLootTemplates = false);
        List<Spell> GetSpellsByRuleSetId_add(int rulesetId);
        //List<Ability> GetAbilitiesByRuleSetId_add(int rulesetId);
        List<AbilitySP> GetAbilitiesByRuleSetId_add(int rulesetId);
        Task<ItemMasterBundle> CreateItemMasterBundle(ItemMasterBundle bundle, List<ItemMasterBundleItem> bundleItems);
        Task<MonsterTemplateBundle> CreateMonsterTemplateBundle(MonsterTemplateBundle bundle, List<MonsterTemplateBundleItem> bundleItems);
        int GetLootCountByRuleSetId(int rulesetId);
        int GetMonsterCountByRuleSetId(int rulesetId);
    }

    public class CoreRuleset : ICoreRuleset
    {
        private readonly IRuleSetService _ruleSetService;
        private readonly IAbilityService _abilityService;
        private readonly IBuffAndEffectService _buffAndEffectService;
        private readonly IMonsterTemplateService _monsterTemplateService;
        private readonly IItemMasterService _itemMasterService;
        private readonly IItemMasterBundleService _itemMasterBundleService;
        private readonly ISpellService _spellService;
        private readonly ICharacterStatService _characterStatService;
        private readonly IRulesetDashboardLayoutService _rulesetDashboardLayoutService;
        private readonly IItemService _itemService;
        private readonly ICharactersCharacterStatService _charactersCharacterStatService;
        private readonly ICharacterService _CharacterService;
        private readonly IMonsterTemplateBundleService _monsterTemplateBundleService;


        public CoreRuleset(IRuleSetService ruleSetService,
            ICharacterStatService characterStatService,
            IAbilityService abilityService,
            IItemMasterService itemMasterService,
            IItemMasterBundleService itemMasterBundleService,
            ISpellService spellService,
            IRulesetDashboardLayoutService rulesetDashboardLayoutService,
            IItemService itemService,
            ICharactersCharacterStatService charactersCharacterStatService,
            ICharacterService CharacterService, IBuffAndEffectService buffAndEffectService,
            IMonsterTemplateService monsterTemplateService, IMonsterTemplateBundleService monsterTemplateBundleService
        )
        {
            _ruleSetService = ruleSetService;
            _characterStatService = characterStatService;
            _abilityService = abilityService;
            _itemMasterService = itemMasterService;
            _itemMasterBundleService = itemMasterBundleService;
            _spellService = spellService;
            _rulesetDashboardLayoutService = rulesetDashboardLayoutService;
            _itemService = itemService;
            _charactersCharacterStatService = charactersCharacterStatService;
            _CharacterService = CharacterService;
            _buffAndEffectService = buffAndEffectService;
            _monsterTemplateService = monsterTemplateService;
            _monsterTemplateBundleService = monsterTemplateBundleService;
        }
        public bool IsCopiedFromCoreRuleset(int RulesetID)
        {
            return _ruleSetService.Core_RuleSetWithParentIDExists(RulesetID);
        }
        public bool IsItemCopiedFromCoreRuleset(int ItemMasterID, int rulesetID)
        {
            return _itemMasterService.Core_ItemMasterWithParentIDExists(ItemMasterID, rulesetID);
        }
        public bool IsItemLootCopiedFromCoreRuleset(int LootID, int rulesetID)
        {
            return _itemMasterService.Core_ItemMasterLootWithParentIDExists(LootID, rulesetID);
        }
        public bool IsBundleCopiedFromCoreRuleset(int bundleId, int rulesetID)
        {
            return _itemMasterService.Core_BundleWithParentIDExists(bundleId, rulesetID);
        }
        public bool IsMonsterBundleCopiedFromCoreRuleset(int bundleId, int rulesetID)
        {
            return _monsterTemplateService.Core_BundleWithParentIDExists(bundleId, rulesetID);
        }
        public bool IsSpellCopiedFromCoreRuleset(int spellID, int RulesetID)
        {
            return _spellService.Core_SpellWithParentIDExists(spellID, RulesetID);
        }
        public bool IsAbilityCopiedFromCoreRuleset(int abilityId, int RulesetID)
        {
            return _abilityService.Core_AbilityWithParentIDExists(abilityId, RulesetID);
        }
        public bool IsBuffAndEffectCopiedFromCoreRuleset(int buffAndEffectId, int RulesetID)
        {
            return _buffAndEffectService.Core_BuffAndEffectWithParentIDExists(buffAndEffectId, RulesetID);
        }
        public bool IsMonsterTemplateCopiedFromCoreRuleset(int monsterTemplatId, int RulesetID)
        {
            return _monsterTemplateService.Core_MonsterTemplateWithParentIDExists(monsterTemplatId, RulesetID);
        }
        public bool IsCharacterstatCopiedFromCoreRuleset(int abilityId, int RulesetID)
        {
            return _characterStatService.Core_CharacterStatWithParentIDExists(abilityId, RulesetID);
        }
        public RulesetRecordCount GetRulesetRecordCounts(int RulesetID)
        {
            try
            {
                //int? parentID = _ruleSetService.GetRuleSetById(RulesetID).Result.ParentRuleSetId;
                //if (parentID == null)
                //{
                //    parentID = RulesetID;
                //}
                //int spellcount = _spellService.Core_GetCountByRuleSetId(RulesetID, (int)parentID);
                //int abilitycount = _abilityService.Core_GetCountByRuleSetId(RulesetID, (int)parentID);
                //int itemmastercount = _itemMasterService.Core_GetCountByRuleSetId(RulesetID, (int)parentID);
                //int characterstatcount = _characterStatService.Core_GetCountByRuleSetId(RulesetID, (int)parentID);
                //int layoutcount = _rulesetDashboardLayoutService.GetCountByRuleSetId(RulesetID);
                SP_RulesetRecordCount res = _ruleSetService.GetRulesetRecordCounts(RulesetID);

                return new RulesetRecordCount()
                {
                    SpellCount = res.SpellCount,
                    AbilityCount = res.AbilityCount,
                    ItemMasterCount = res.ItemMasterCount,
                    CharacterStatCount = res.CharacterStatCount,
                    LayoutCount = res.LayoutCount,
                    LootCount = res.LootCount,
                    BuffAndEffectCount = res.BuffAndEffectCount,
                    MonsterCount = res.MonsterCount,
                    MonsterTemplateCount = res.MonsterTemplateCount,
                    LootTemplateCount = res.LootTemplateCount
                };
            }
            catch (Exception ex)
            {
                return new RulesetRecordCount();
            }
        }
        public List<CharacterStat> Character_GetCharacterStatByRuleSetId(int RulesetID)
        {
            int? parentID = _ruleSetService.GetRuleSetById(RulesetID).Result.ParentRuleSetId;
            if (parentID == null)
            {
                parentID = RulesetID;
            }
            var characterStats = _characterStatService.Core_GetCharacterStatRuleSetId(RulesetID, (int)parentID);

            return characterStats;
        }

        public List<ItemMaster> GetItemMastersByRuleSetId(int RulesetID)
        {
            int? parentID = _ruleSetService.GetRuleSetById(RulesetID).Result.ParentRuleSetId;
            if (parentID == null)
            {
                parentID = RulesetID;
            }
            return _itemMasterService.Core_GetItemMastersByRuleSetId(RulesetID, (int)parentID);
        }

        public List<Spell> GetSpellsByRuleSetId(int RulesetID)
        {
            int? parentID = _ruleSetService.GetRuleSetById(RulesetID).Result.ParentRuleSetId;
            if (parentID == null)
            {
                parentID = RulesetID;
            }
            return _spellService.Core_GetSpellsByRuleSetId(RulesetID, (int)parentID);
        }

        public List<Ability> GetAbilitiesByRuleSetId(int RulesetID)
        {
            int? parentID = _ruleSetService.GetRuleSetById(RulesetID).Result.ParentRuleSetId;
            if (parentID == null)
            {
                parentID = RulesetID;
            }
            return _abilityService.Core_GetAbilitiesByRuleSetId(RulesetID, (int)parentID);

        }
        public int GetItemCountByRuleSetId(int rulesetId)
        {
            int? parentID = _ruleSetService.GetRuleSetById(rulesetId).Result.ParentRuleSetId;
            if (parentID == null)
            {
                parentID = rulesetId;
            }
            return _itemMasterService.Core_GetCountByRuleSetId(rulesetId, (int)parentID);
        }
        public int GetLootCountByRuleSetId(int rulesetId)
        {
            int? parentID = _ruleSetService.GetRuleSetById(rulesetId).Result.ParentRuleSetId;
            if (parentID == null)
            {
                parentID = rulesetId;
            }
            return _itemMasterService.Core_GetLootCountByRuleSetId(rulesetId, (int)parentID);
        }
        public int GetSpellCountByRuleSetId(int RulesetID)
        {
            int? parentID = _ruleSetService.GetRuleSetById(RulesetID).Result.ParentRuleSetId;
            if (parentID == null)
            {
                parentID = RulesetID;
            }
            return _spellService.Core_GetCountByRuleSetId(RulesetID, (int)parentID);
        }

        public int GetAbilityCountByRuleSetId(int RulesetID)
        {
            int? parentID = _ruleSetService.GetRuleSetById(RulesetID).Result.ParentRuleSetId;
            if (parentID == null)
            {
                parentID = RulesetID;
            }
            return _abilityService.Core_GetCountByRuleSetId(RulesetID, (int)parentID);
        }
        public int GetBuffAndEffectCountByRuleSetId(int rulesetId)
        {
            int? parentID = _ruleSetService.GetRuleSetById(rulesetId).Result.ParentRuleSetId;
            if (parentID == null)
            {
                parentID = rulesetId;
            }
            return _buffAndEffectService.Core_GetCountByRuleSetId(rulesetId, (int)parentID);
        }
        public int GetMonsterTemplateCountByRuleSetId(int rulesetId)
        {
            int? parentID = _ruleSetService.GetRuleSetById(rulesetId).Result.ParentRuleSetId;
            if (parentID == null)
            {
                parentID = rulesetId;
            }
            return _monsterTemplateService.Core_GetCountByRuleSetId(rulesetId, (int)parentID);
        }
        public int GetMonsterCountByRuleSetId(int rulesetId)
        {
            int? parentID = _ruleSetService.GetRuleSetById(rulesetId).Result.ParentRuleSetId;
            if (parentID == null)
            {
                parentID = rulesetId;
            }
            return _monsterTemplateService.Core_GetMonsterCountByRuleSetId(rulesetId, (int)parentID);
        }
        public async Task<ItemMaster> CreateItemMaster(ItemMaster itemMaster, List<ItemMasterSpell> itemMasterSpellVM, List<ItemMasterAbility> itemMasterAbilityVM, List<ItemMasterBuffAndEffect> itemMasterBuffAndEffectVM)
        {
            return await _itemMasterService.Core_CreateItemMaster(itemMaster, itemMasterSpellVM, itemMasterAbilityVM, itemMasterBuffAndEffectVM);
            //return _abilityService.Core_GetCountByRuleSetId(RulesetID, (int)parentID);
        }
        public async Task<ItemMasterBundle> CreateItemMasterBundle(ItemMasterBundle bundle, List<ItemMasterBundleItem> bundleItems)
        {
            return await _itemMasterBundleService.Core_CreateItemMasterBundle(bundle, bundleItems);
        }
        public async Task<MonsterTemplateBundle> CreateMonsterTemplateBundle(MonsterTemplateBundle bundle, List<MonsterTemplateBundleItem> bundleItems)
        {
            return await _monsterTemplateBundleService.Core_CreateMonsterTemplateBundle(bundle, bundleItems);
        }
        public async Task<ItemMaster> CreateItemMasterUsingItem(int ItemMasterId, int RulesetID)
        {
            return await _itemService.Core_CreateItemMasterUsingItem(ItemMasterId, RulesetID);
        }
        public async Task<MonsterTemplate> CreateMonsterTemplateUsingMonster(int MonsterTemplateId, int RulesetID)
        {
            return await _monsterTemplateService.Core_CreateMonsterTemplateUsingMonster(MonsterTemplateId, RulesetID);
        }
        public async Task<int> GetCopiedRuleSetIdFromRulesetAndUser(int RulesetID, string UserID)
        {
            RuleSet ruleset = await _ruleSetService.Core_RuleSetWithParentIDUserID(RulesetID, UserID);
            if (ruleset == null)
            {
                return RulesetID;
            }
            return ruleset.RuleSetId;
        }
        public async Task<Spell> CreateSpell(Spell spell, List<SpellBuffAndEffect> SpellBuffAndEffectVM)
        {
            return await _spellService.Core_CreateSpell(spell, SpellBuffAndEffectVM);
            //return _abilityService.Core_GetCountByRuleSetId(RulesetID, (int)parentID);
        }

        public async Task<Ability> CreateAbility(Ability ability, List<AbilityBuffAndEffect> AbilityBuffAndEffectVM)
        {
            return await _abilityService.Core_CreateAbility(ability, AbilityBuffAndEffectVM);
        }
        public async Task<BuffAndEffect> CreateBuffAndEffect(BuffAndEffect buffAndEffect)
        {
            return await _buffAndEffectService.Core_CreateBuffAndEffect(buffAndEffect);
        }
        public async Task<MonsterTemplate> CreateMonsterTemplate(MonsterTemplate MonsterTemplate)
        {
            return await _monsterTemplateService.Core_CreateMonsterTemplate(MonsterTemplate);
        }
        public async Task<CharacterStat> InsertCharacterStat(CharacterStat characterStat)
        {
            return await _characterStatService.Core_CharacterStat(characterStat);
        }

        public async Task<int> _updateParentIDForAllRelatedItems(int characterId, int oldParentItemMasterID, int itemMasterIDInserted, char Type)
        {
            return await _itemService.Core_updateParentIDForAllRelatedItems(characterId, oldParentItemMasterID, itemMasterIDInserted, Type);
        }
        public async Task<List<Character>> GetCharactersByRulesetID(int ruleSetId)
        {
            return await _CharacterService.GetOnlyCharactersByRulesetID(ruleSetId);
        }
        public ItemsAndLootTemplates GetItemMastersByRuleSetId_add(int rulesetId, bool includeBundles = false, bool includeLootTemplates = false)
        {
            return _itemMasterService.GetItemMastersByRuleSetId_add(rulesetId, includeBundles, includeLootTemplates);
        }
        public List<Spell> GetSpellsByRuleSetId_add(int rulesetId)
        {
            return _spellService.GetSpellsByRuleSetId_add(rulesetId);
        }
        //public List<Ability> GetAbilitiesByRuleSetId_add(int rulesetId)
        //{
        //    return _abilityService.GetAbilitiesByRuleSetId_add(rulesetId);
        //} 
        public List<AbilitySP> GetAbilitiesByRuleSetId_add(int rulesetId)
        {
            return _abilityService.GetAbilitiesByRuleSetId_add(rulesetId);
        }
    }
}
