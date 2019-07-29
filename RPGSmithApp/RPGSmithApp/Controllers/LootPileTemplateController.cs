using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DAL.Core.Interfaces;
using DAL.Models;
using DAL.Models.SPModels;
using DAL.Models.ViewModel;
using DAL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RPGSmithApp.Helpers;
using RPGSmithApp.Helpers.CoreRuleset;
using RPGSmithApp.ViewModels;
using RPGSmithApp.ViewModels.CreateModels;
using RPGSmithApp.ViewModels.EditModels;

namespace RPGSmithApp.Controllers
{
    [Route("api/[controller]")]
    public class LootPileTemplateController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;        
        private readonly IRuleSetService _ruleSetService;
        private readonly ILootPileTemplateService _lootPileTemplateService;

        public LootPileTemplateController(IHttpContextAccessor httpContextAccessor, IAccountManager accountManager, IRuleSetService ruleSetService,
            ILootPileTemplateService lootPileTemplateService)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._accountManager = accountManager;
            this._ruleSetService = ruleSetService;
            this._lootPileTemplateService = lootPileTemplateService;
        }

        //[HttpPost("CreateLootPile")]
        //public async Task<IActionResult> CreateLootPile([FromBody] CreateLootPileModel model)
        //{
        //    if (ModelState.IsValid)
        //    {
        //        try
        //        {
        //            var ItemMasterModel = _lootPileService.GetDuplicateLootPile(model.Name, model.RuleSetId).Result;
        //            var result = new LootPile();
        //            var lootPile = Mapper.Map<LootPile>(model);
        //            if (ItemMasterModel != null)
        //            {
        //                //result = lootPile;
        //                return BadRequest("The Loot Pile Name " + model.Name + " had already been used in this Campaign. Please select another name.");
        //            }
        //            else
        //            {
        //                await _lootPileService.Create(lootPile, model.ItemList);
        //            }
        //            return Ok();
        //        }
        //        catch (Exception ex)
        //        {
        //            return BadRequest(ex.Message);
        //        }
        //    }
        //    return BadRequest(Utilities.ModelStateError(ModelState));
        //}




        //[HttpPost("UpdateItemMasterLoot")]
        //public async Task<IActionResult> UpdateItemMasterLoot([FromBody] EditItemMasterLootModel model)
        //{

        //    if (ModelState.IsValid)
        //    {
        //        int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
        //        if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
        //        {
        //            await Core_UpdateItemMasterLoot(model);
        //        }
        //        else
        //        {
        //            await UpdateItemMasterLootCommon(model);
        //        }

        //        return Ok();
        //    }
        //    return BadRequest(Utilities.ModelStateError(ModelState));

        //}
        //private async Task<IActionResult> UpdateItemMasterLootCommon(EditItemMasterLootModel model)
        //{
        //    ItemMasterLoot OldLoot = await _itemMasterService.getLootDetails(model.LootId);
        //    if (OldLoot == null) return BadRequest("Loot not found");

        //    model.TotalWeight = model.Quantity * (model.Weight == null ? 0 : (decimal)model.Weight);





        //    ItemMasterLoot loot = new ItemMasterLoot()
        //    {
        //        LootId = OldLoot.LootId,
        //        ContainedIn = model.ContainedIn,
        //        IsIdentified = model.IsIdentified,
        //        IsShow = model.IsShow,
        //        IsVisible = model.IsVisible,
        //        Quantity = model.Quantity,
        //        ItemMasterId = OldLoot.ItemMasterId,
        //        Command = model.Command,
        //        CommandName = model.CommandName,
        //        ContainerVolumeMax = model.ContainerVolumeMax,
        //        ContainerWeightMax = model.ContainerWeightMax,
        //        ContainerWeightModifier = model.ContainerWeightModifier,
        //        IsConsumable = model.IsConsumable == null ? false : (bool)model.IsConsumable,
        //        IsContainer = model.IsContainer == null ? false : (bool)model.IsContainer,
        //        IsMagical = model.IsMagical == null ? false : (bool)model.IsMagical,
        //        ItemCalculation = model.ItemCalculation,
        //        ItemImage = model.ItemImage,
        //        ItemName = model.ItemName,
        //        ItemStats = model.ItemStats,
        //        ItemVisibleDesc = model.ItemVisibleDesc,
        //        Metatags = model.Metatags,
        //        PercentReduced = model.PercentReduced,
        //        Rarity = model.Rarity,
        //        RuleSetId = model.RuleSetId,
        //        // TotalWeight = model.to,
        //        Value = model.Value == null ? 0 : (decimal)model.Value,
        //        TotalWeightWithContents = model.TotalWeightWithContents,
        //        Volume = model.Volume == null ? 0 : (decimal)model.Volume,
        //        Weight = model.Weight == null ? 0 : (decimal)model.Weight,
        //        TotalWeight = model.TotalWeight
        //    };

        //    var ItemMasterAbilities = new List<ItemMasterLootAbility>();
        //    var ItemMasterSpell = new List<ItemMasterLootSpell>();
        //    var itemMasterBuffAndEffects = new List<ItemMasterLootBuffAndEffect>();
        //    var ItemMasterCommand = new List<ItemMasterLootCommand>();
        //    if (model.ItemMasterSpellVM != null)
        //    {
        //        ItemMasterSpell = model.ItemMasterSpellVM.Select(x => new ItemMasterLootSpell()
        //        {
        //            SpellId = x.SpellId,
        //        }).ToList();
        //    }
        //    if (model.ItemMasterAbilityVM != null)
        //    {
        //        ItemMasterAbilities = model.ItemMasterAbilityVM.Select(x => new ItemMasterLootAbility()
        //        {
        //            AbilityId = x.AbilityId,
        //        }).ToList();
        //    }
        //    if (model.ItemMasterBuffAndEffectVM != null)
        //    {
        //        itemMasterBuffAndEffects = model.ItemMasterBuffAndEffectVM.Select(x => new ItemMasterLootBuffAndEffect()
        //        {
        //            BuffAndEffectId = x.BuffAndEffectId,
        //        }).ToList();
        //    }
        //    if (model.ItemMasterCommandVM != null)
        //    {
        //        ItemMasterCommand = model.ItemMasterCommandVM.Select(x => new ItemMasterLootCommand()
        //        {
        //            Command = x.Command,
        //            Name = x.Name
        //        }).ToList();
        //    }

        //    var result = await _itemMasterService.UpdateItemMasterLoot(loot, ItemMasterSpell, ItemMasterAbilities, itemMasterBuffAndEffects, ItemMasterCommand);


        //    var item = OldLoot;
        //    ///////if non-conatiner item remove/update its container
        //    if (((item.ContainedIn > 0 && result.ContainedIn == 0)
        //        || (item.ContainedIn == 0 && result.ContainedIn > 0)
        //        || (item.ContainedIn == result.ContainedIn && result.ContainedIn > 0)) && model.IsContainer != true)
        //    {
        //        int __itemContainerId = (item.ContainedIn > 0 && result.ContainedIn == 0) ? item.ContainedIn ?? 0
        //             : ((item.ContainedIn == 0 && result.ContainedIn > 0) ? result.ContainedIn ?? 0
        //             : ((result.ContainedIn > 0) ? result.ContainedIn ?? 0 : 0));

        //        var containerItem = _itemMasterService.getLootDetails(__itemContainerId).Result;
        //        var _itemContainer = model;//Mapper.Map<ItemEditModel>(containerItem);

        //        List<ViewModels.EditModels.containerItemIds> _containerItemIds = new List<ViewModels.EditModels.containerItemIds>();
        //        foreach (var itm in await _itemMasterService.GetByContainerId(containerItem.LootId))
        //        {
        //            if (itm.LootId != result.LootId)
        //            {
        //                ViewModels.EditModels.containerItemIds __containerItemIds = new ViewModels.EditModels.containerItemIds();
        //                __containerItemIds.ItemId = itm.LootId;
        //                _containerItemIds.Add(__containerItemIds);
        //            }
        //        }
        //        if ((item.ContainedIn == 0 && result.ContainedIn > 0) || (item.ContainedIn == result.ContainedIn))
        //        {
        //            ViewModels.EditModels.containerItemIds __containerItemIds = new ViewModels.EditModels.containerItemIds();
        //            __containerItemIds.ItemId = result.LootId;
        //            _containerItemIds.Add(__containerItemIds);
        //        }
        //        _itemContainer.ContainerItems = _containerItemIds;

        //        decimal TotalWeight = CalculateTotalWeightItem(new ItemEditModel()
        //        {
        //            Weight = _itemContainer.Weight == null ? 0 : (decimal)_itemContainer.Weight,
        //            Quantity = _itemContainer.Quantity,
        //            ContainerItems = model.ContainerItems == null ? new List<ViewModels.EditModels.containerItemIds>() : model.ContainerItems.Select(x => new ViewModels.EditModels.containerItemIds()
        //            {
        //                ItemId = x.ItemId,
        //            }).ToList(),
        //            ContainerWeightModifier = _itemContainer.ContainerWeightModifier,
        //            PercentReduced = _itemContainer.PercentReduced,
        //            TotalWeightWithContents = _itemContainer.TotalWeightWithContents,
        //        });
        //        await _itemMasterService.UpdateWeight(_itemContainer.ItemMasterId == null ? 0 : (int)_itemContainer.ItemMasterId, TotalWeight);
        //    }
        //    ///////////

        //    if (model.ContainerItems != null && model.ContainerItems.Count > 0)
        //    {
        //        //remove all contains item
        //        await _itemMasterService.DeleteContainer(OldLoot.LootId);
        //        foreach (var itm in model.ContainerItems)
        //        {
        //            await _itemMasterService.UpdateContainer(itm.ItemId, OldLoot.LootId);
        //        }
        //        //_itemService.ManageContainer(model.ItemId, model.ContainerItems.Select(q => new CommonID { ID=q.ItemId }).ToList());
        //    }
        //    if (model.IsContainer == true)
        //    {
        //        decimal TotalWeight = CalculateTotalWeightItem(new ItemEditModel()
        //        {
        //            Weight = model.Weight == null ? 0 : (decimal)model.Weight,
        //            Quantity = model.Quantity,
        //            ContainerItems = model.ContainerItems == null ? new List<ViewModels.EditModels.containerItemIds>() : model.ContainerItems.Select(x => new ViewModels.EditModels.containerItemIds()
        //            {
        //                ItemId = x.ItemId,
        //            }).ToList(),
        //            ContainerWeightModifier = model.ContainerWeightModifier,
        //            PercentReduced = model.PercentReduced,
        //            TotalWeightWithContents = model.TotalWeightWithContents,
        //        });
        //        await _itemMasterService.UpdateWeight(OldLoot.ItemMasterId, TotalWeight);
        //    }


        //    return Ok();
        //}
        //private async Task<IActionResult> Core_UpdateItemMasterLoot(EditItemMasterLootModel model)
        //{
        //    try
        //    {
        //        await CheckCoreRuleset(model);
        //        return await UpdateItemMasterLootCommon(model);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(ex.Message);
        //    }
        //}
        //private async Task<int> CheckCoreRuleset(EditItemMasterLootModel model)
        //{
        //    int ItemMasterID = model.ItemMasterId == null ? 0 : (int)model.ItemMasterId;
        //    if (!_coreRulesetService.IsItemCopiedFromCoreRuleset(ItemMasterID, (int)model.RuleSetId))
        //    {
        //        int OldParentItemMasterID = ItemMasterID;
        //        int ItemMasterIDInserted = CreateItemMasterForCopiedRuleset((int)model.ItemMasterId, (int)model.RuleSetId).Result.ItemMasterId;
        //        model.ItemMasterId = ItemMasterIDInserted;
        //        model.ParentLootId = ItemMasterIDInserted;
        //        return await _coreRulesetService._updateParentIDForAllRelatedItems((int)model.RuleSetId, OldParentItemMasterID, ItemMasterIDInserted, 'L');
        //    }
        //    return 0;


        //    //int LootId = model.LootId;
        //    //if (!_coreRulesetService.IsItemLootCopiedFromCoreRuleset(LootId, (int)model.RuleSetId))
        //    //{
        //    //    int OldParentLootID = LootId;
        //    //    int LootIDInserted = CreateItemMasterForCopiedRuleset((int)model.ItemMasterId,(int)model.RuleSetId).Result.ItemMasterId;
        //    //    model.LootId = LootIDInserted;
        //    //    model.ParentLootId = LootIDInserted;
        //    //    return await _coreRulesetService._updateParentIDForAllRelatedItems((int)model.RuleSetId, OldParentLootID, LootIDInserted, 'L');
        //    //}
        //    //return 0;
        //}

        //private async Task<ItemMaster> CreateItemMasterForCopiedRuleset(int ItemMasterId, int RuleSetId)
        //{
        //    return await _coreRulesetService.CreateItemMasterUsingItem(ItemMasterId, RuleSetId);
        //}
    }
}
