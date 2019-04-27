using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DAL.Core.Interfaces;
using DAL.Models;
using DAL.Models.SPModels;
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
    public class ItemMasterController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        private readonly IItemMasterService _itemMasterService;
        private readonly IItemService _itemService;
        private readonly IItemCommandService _itemCommandService;
        private readonly IItemMasterCommandService _iItemMasterCommandService;
        private readonly IRuleSetService _ruleSetService;
        private readonly ICharacterService _characterService;
        private readonly ICoreRuleset _coreRulesetService;

        public ItemMasterController(IHttpContextAccessor httpContextAccessor, IAccountManager accountManager, IItemCommandService itemCommandService,
            IItemMasterService itemMasterService, IItemService itemService, IRuleSetService ruleSetService,
            IItemMasterCommandService iItemMasterCommandService, ICharacterService characterService, ICoreRuleset coreRulesetService)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._accountManager = accountManager;
            this._itemMasterService = itemMasterService;
            this._itemService = itemService;
            this._iItemMasterCommandService = iItemMasterCommandService;
            this._ruleSetService = ruleSetService;
            this._itemCommandService = itemCommandService;
            this._characterService = characterService;
            _coreRulesetService = coreRulesetService;
        }

        [HttpGet("getAll")]
        public IEnumerable<ItemMaster> GetAllItemMasters()
        {
            return _itemMasterService.GetItemMasters();
        }

        [HttpGet("getItemsCount")]
        public async Task<IActionResult> getItemsCount(int rulesetId)
        {
            if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetId))
            {
                int _items = _coreRulesetService.GetItemCountByRuleSetId(rulesetId);

                return Ok(_items);
            }
            else
            {
                int _items = _itemMasterService.GetCountByRuleSetId(rulesetId);

                return Ok(_items);
            }
        }

        [HttpGet("getById")]
        public ItemMaster GetItemById(int id)
        {
            return _itemMasterService.GetItemMasterById(id);
        }

        [HttpGet("getByRuleSetId")]
        public async Task<IActionResult> getByRuleSetId(int rulesetId)
        {            
            if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetId))
            {
                dynamic Response = new ExpandoObject();
                var ItemList = _coreRulesetService.GetItemMastersByRuleSetId(rulesetId);
                foreach (var item in ItemList)
                {
                    item.RuleSet.ItemMasters = null;
                }
                Response.ItemMaster = Utilities.CleanModel<ItemMaster>(ItemList);
                Response.RuleSet = Utilities.CleanModel<RuleSet>(_ruleSetService.GetRuleSetById(rulesetId).Result);
                return Ok(Response);
            }
            else
            {
                dynamic Response = new ExpandoObject();
                var ItemList = _itemMasterService.GetItemMastersByRuleSetId(rulesetId);
                foreach (var item in ItemList)
                {
                    item.RuleSet.ItemMasters = null;
                }
                Response.ItemMaster = Utilities.CleanModel<ItemMaster>(ItemList);
                Response.RuleSet = Utilities.CleanModel<RuleSet>(_ruleSetService.GetRuleSetById(rulesetId).Result);
                return Ok(Response);
            }
        }
        [HttpGet("getByRuleSetId_add")]
        public async Task<IActionResult> getByRuleSetId_add(int rulesetId, bool includeBundles = false)
        {

            dynamic Response = new ExpandoObject();
            var ItemList = _coreRulesetService.GetItemMastersByRuleSetId_add(rulesetId, includeBundles);

            Response.ItemMaster = Utilities.CleanModel<ItemMaster_Bundle>(ItemList);
            Response.RuleSet = Utilities.CleanModel<RuleSet>(_ruleSetService.GetRuleSetById(rulesetId).Result);
            return Ok(Response);

        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateItemMaster([FromBody] CreateItemMasterModel itemDomain)
        {
            if (ModelState.IsValid)
            {
                var ItemMasterModel = _itemMasterService.GetDuplicateItemMaster(itemDomain.ItemName, itemDomain.RuleSetId).Result;
                var result = new ItemMaster();
                var itemMaster = Mapper.Map<ItemMaster>(itemDomain);
                if (ItemMasterModel != null)
                {
                    result = ItemMasterModel;
                    //return BadRequest("The Item Master Name " + itemDomain.ItemName + " had already been used in this Rule Set. Please select another name.");
                }
                else
                {
                    result = await _itemMasterService.CreateItemMaster(itemMaster, itemDomain.itemMasterSpellVM, itemDomain.itemMasterAbilityVM);
                }


                if (itemDomain.itemMasterCommandVM != null && itemDomain.itemMasterCommandVM.Count > 0)
                {
                    foreach (var imcViewModels in itemDomain.itemMasterCommandVM)
                    {
                        await _iItemMasterCommandService.InsertItemMasterCommand(new ItemMasterCommand()
                        {
                            Command = imcViewModels.Command,
                            Name = imcViewModels.Name,
                            ItemMasterId = result.ItemMasterId
                        });
                    }
                }

                try
                {
                    //when creating item from character
                    if (itemDomain.IsFromCharacter && itemDomain.IsFromCharacterId > 0
                        && itemDomain.Item != null)
                    {
                        var ItemAbilities = new List<ItemAbility>();
                        foreach (var ability in itemDomain.itemMasterAbilityVM)
                        {
                            ItemAbilities.Add(new ItemAbility
                            {
                                AbilityId = ability.AbilityId
                            });
                        }
                        var ItemSpells = new List<ItemSpell>();
                        foreach (var spell in itemDomain.itemMasterSpellVM)
                        {
                            ItemSpells.Add(new ItemSpell
                            {
                                SpellId = spell.SpellId
                            });
                        }

                        var _itemInsert = await _itemService.InsertItem(new Item
                        {
                            Name = itemDomain.ItemName,
                            Description = itemDomain.ItemVisibleDesc,
                            ItemImage = itemDomain.ItemImage,
                            ItemMasterId = result.ItemMasterId,
                            CharacterId = itemDomain.Item.CharacterId,
                            ContainedIn = itemDomain.Item.ContainerItemId, //container
                            Quantity = itemDomain.Item.Quantity,
                            TotalWeight = (itemDomain.Item.Quantity) * (itemDomain.Weight ?? 0),
                            IsIdentified = itemDomain.Item.IsIdentified,
                            IsVisible = itemDomain.Item.IsVisible,
                            IsEquipped = itemDomain.Item.IsEquipped,

                            IsContainer = (bool)itemDomain.IsContainer,
                            IsConsumable = (bool)itemDomain.IsConsumable,
                            IsMagical = (bool)itemDomain.IsMagical,
                            ItemCalculation = itemDomain.ItemCalculation,
                            Metatags = itemDomain.Metatags,
                            Rarity = itemDomain.Rarity,
                            Value = itemDomain.Value != null ? (decimal)itemDomain.Value : 0,
                            Volume = itemDomain.Volume != null ? (decimal)itemDomain.Volume : 0,
                            Weight = itemDomain.Weight != null ? (decimal)itemDomain.Weight : 0,
                            Command = itemDomain.Command,

                            ItemStats = itemDomain.ItemStats,
                            ContainerWeightMax = itemDomain.ContainerWeightMax,
                            ContainerVolumeMax = itemDomain.ContainerVolumeMax,
                            PercentReduced = itemDomain.PercentReduced,
                            TotalWeightWithContents = itemDomain.TotalWeightWithContents,
                            ContainerWeightModifier = itemDomain.ContainerWeightModifier,
                            CommandName = itemDomain.CommandName
                        },
                        ItemSpells,
                        ItemAbilities);

                        if (itemDomain.itemMasterCommandVM != null)
                        {
                            foreach (var command in itemDomain.itemMasterCommandVM)
                            {
                                await _itemCommandService.InsertItemCommand(new ItemCommand()
                                {
                                    Command = command.Command,
                                    Name = command.Name,
                                    ItemId = _itemInsert.ItemId
                                });
                            }
                        }

                        if (itemDomain.ContainerItems != null)
                        {
                            //remove all contains item
                            await _itemService.DeleteContainer(_itemInsert.ItemId);
                            foreach (var itm in itemDomain.ContainerItems)
                            {
                                await _itemService.UpdateContainer(itm.ItemId, _itemInsert.ItemId);
                            }
                        }

                        if (itemDomain.IsContainer == true)
                        {
                            decimal TotalWeight = CalculateTotalWeight(itemDomain);
                            await _itemService.UpdateWeight(_itemInsert.ItemId, TotalWeight);
                        }
                        else
                        {
                            ///////if non-conatiner item remove/update its container
                            if (_itemInsert.ContainedIn > 0 && !_itemInsert.IsContainer)
                            {
                                var containerItem = _itemService.GetById(_itemInsert.ContainedIn);
                                var _itemContainer = Mapper.Map<ItemEditModel>(containerItem);

                                List<ViewModels.EditModels.containerItemIds> _containerItemIds = new List<ViewModels.EditModels.containerItemIds>();
                                foreach (var itm in _itemService.GetByContainerId(containerItem.ItemId))
                                {
                                    if (itm.ItemId != _itemInsert.ItemId)
                                    {
                                        ViewModels.EditModels.containerItemIds __containerItemIds = new ViewModels.EditModels.containerItemIds();
                                        __containerItemIds.ItemId = itm.ItemId;
                                        _containerItemIds.Add(__containerItemIds);
                                    }
                                }
                                if (_itemInsert.ContainedIn > 0)
                                {
                                    ViewModels.EditModels.containerItemIds __containerItemIds = new ViewModels.EditModels.containerItemIds();
                                    __containerItemIds.ItemId = _itemInsert.ItemId;
                                    _containerItemIds.Add(__containerItemIds);
                                }
                                _itemContainer.ContainerItems = _containerItemIds;

                                decimal TotalWeight = CalculateTotalWeightItem(_itemContainer);
                                await _itemService.UpdateWeight(_itemContainer.ItemId, TotalWeight);
                            }
                            ///////////
                        }

                        await this._characterService.UpdateCharacterInventoryWeight(_itemInsert.CharacterId ?? 0);

                        var ruleset = _ruleSetService.GetRuleSetById((int)(itemDomain.RuleSetId));
                        //return Ok("A new " + itemDomain.Item.Name + " Item Template has been created in the "
                        //    + ruleset.Result.RuleSetName + " Rule Set for this Item. Any future updates to the Item will not affect the Item Template."
                        //    + " If you wish to update the Item Template you may do so from the Rule Sets interface.");
                        return Ok("An Item Template has been created for this at the Rule Set.");
                    }
                }
                catch (Exception ex)
                { return BadRequest(ex.Message); }


                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpPost("update")]
        public async Task<IActionResult> UpdateItemMaster([FromBody] EditItemMasterModel model)
        {

            if (ModelState.IsValid)
            {
                int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
                if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
                {

                    return await Core_UpdateItemMaster(model);
                }
                else
                {
                    return await UpdateItemMasterCommon(model);
                }
            }
            return BadRequest(Utilities.ModelStateError(ModelState));

        }

        private async Task<IActionResult> UpdateItemMasterCommon(EditItemMasterModel model)
        {
            if (_itemMasterService.CheckDuplicateItemMaster(model.ItemName, model.RuleSetId, model.ItemMasterId).Result)
                return BadRequest("The Item Master Name " + model.ItemName + " had already been used in this Rule Set. Please select another name.");

            var itemmasterobj = _itemMasterService.GetItemMasterById(model.ItemMasterId);
            var imcIds = new List<int>();

            if (itemmasterobj.ItemMasterCommand.Count > 0)
                imcIds.AddRange(itemmasterobj.ItemMasterCommand.Select(x => x.ItemMasterCommandId).ToList());

            if (itemmasterobj == null)
                return Ok("Item Master not found");


            var itemMaster = Mapper.Map<ItemMaster>(model);
            var result = await _itemMasterService.UpdateItemMaster(itemMaster, model.ItemMasterSpellVM, model.ItemMasterAbilityVM);

            if (model.ItemMasterCommandVM != null && model.ItemMasterCommandVM.Count > 0)
            {
                if (imcIds.Count > 0)
                {
                    foreach (var id in imcIds)
                    {
                        if (model.ItemMasterCommandVM.Where(x => x.ItemMasterCommandId == id).FirstOrDefault() == null)
                            await _iItemMasterCommandService.DeleteItemMasterCommand(id);
                    }
                }

                foreach (var imcViewModels in model.ItemMasterCommandVM)
                {
                    if (imcViewModels.ItemMasterCommandId > 0)
                    {
                        await _iItemMasterCommandService.UdateItemMasterCommand(new ItemMasterCommand()
                        {
                            ItemMasterCommandId = imcViewModels.ItemMasterCommandId,
                            Command = imcViewModels.Command,
                            Name = imcViewModels.Name,
                            ItemMasterId = imcViewModels.ItemMasterId
                        });
                    }
                    else
                    {
                        await _iItemMasterCommandService.InsertItemMasterCommand(new ItemMasterCommand()
                        {
                            Command = imcViewModels.Command,
                            Name = imcViewModels.Name,
                            ItemMasterId = result.ItemMasterId
                        });
                    }
                }
            }
            else
            {
                if (imcIds.Count > 0)
                {
                    foreach (var id in imcIds)
                    {
                        await _iItemMasterCommandService.DeleteItemMasterCommand(id);
                    }
                }
            }
            return Ok();
        }

        private async Task<IActionResult> Core_UpdateItemMaster(EditItemMasterModel model)
        {
            try
            {
                int ItemMasterID = model.ItemMasterId == null ? 0 : (int)model.ItemMasterId;
                if (_coreRulesetService.IsItemCopiedFromCoreRuleset(ItemMasterID, (int)model.RuleSetId))
                {
                    return await UpdateItemMasterCommon(model);
                }
                else
                {
                    return await CreateItemMasterForCopiedRuleset(model);

                }

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private async Task<IActionResult> CreateItemMasterForCopiedRuleset(EditItemMasterModel model, bool? IsDeleted = null)
        {
            //CreateItemMasterModel itemModel = Mapper.Map<CreateItemMasterModel>(model);
            ItemMaster itemMaster = new ItemMaster();
            itemMaster.ItemMasterId = model.ItemMasterId == null ? 0 : (int)model.ItemMasterId;
            itemMaster.Command = model.Command;
            itemMaster.ContainerVolumeMax = model.ContainerVolumeMax;
            itemMaster.ContainerWeightMax = model.ContainerWeightMax;
            itemMaster.ContainerWeightModifier = model.ContainerWeightModifier;
            itemMaster.IsConsumable = model.IsConsumable == null ? false : (bool)model.IsConsumable;
            itemMaster.IsContainer = model.IsContainer == null ? false : (bool)model.IsContainer;
            itemMaster.IsMagical = model.IsMagical == null ? false : (bool)model.IsMagical;
            itemMaster.ItemCalculation = model.ItemCalculation;
            itemMaster.ItemImage = model.ItemImage;
            itemMaster.ItemMasterId = model.ItemMasterId == null ? 0 : (int)model.ItemMasterId;
            itemMaster.ItemName = model.ItemName;
            itemMaster.ItemStats = model.ItemStats;
            itemMaster.ItemVisibleDesc = model.ItemVisibleDesc;
            itemMaster.Metatags = model.Metatags;
            itemMaster.PercentReduced = model.PercentReduced;
            itemMaster.Rarity = model.Rarity;
            itemMaster.RuleSetId = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
            itemMaster.TotalWeightWithContents = model.TotalWeightWithContents;
            itemMaster.Value = model.Value == null ? 0 : (decimal)model.Value;
            itemMaster.Volume = model.Volume == null ? 0 : (decimal)model.Volume;
            itemMaster.Weight = model.Weight == null ? 0 : (decimal)model.Weight;
            itemMaster.IsDeleted = IsDeleted;


            ItemMaster result = await _coreRulesetService.CreateItemMaster(itemMaster, model.ItemMasterSpellVM, model.ItemMasterAbilityVM);

            if (model.ItemMasterCommandVM != null && model.ItemMasterCommandVM.Count > 0)
            {
                foreach (var imcViewModels in model.ItemMasterCommandVM)
                {
                    await _iItemMasterCommandService.InsertItemMasterCommand(new ItemMasterCommand()
                    {
                        Command = imcViewModels.Command,
                        Name = imcViewModels.Name,
                        ItemMasterId = result.ItemMasterId,
                        IsDeleted = IsDeleted
                    });
                }
            }
            //try
            //{
            //    var itemDomain = model;
            //    //when creating item from character
            //    if (itemDomain.IsFromCharacter && itemDomain.IsFromCharacterId > 0
            //        && itemDomain.Item != null)
            //    {
            //        var ItemAbilities = new List<ItemAbility>();
            //        foreach (var ability in itemDomain.itemMasterAbilityVM)
            //        {
            //            ItemAbilities.Add(new ItemAbility
            //            {
            //                AbilityId = ability.AbilityId
            //            });
            //        }
            //        var ItemSpells = new List<ItemSpell>();
            //        foreach (var spell in itemDomain.itemMasterSpellVM)
            //        {
            //            ItemSpells.Add(new ItemSpell
            //            {
            //                SpellId = spell.SpellId
            //            });
            //        }

            //        var _itemInsert = await _itemService.InsertItem(new Item
            //        {
            //            Name = itemDomain.ItemName,
            //            Description = itemDomain.ItemVisibleDesc,
            //            ItemImage = itemDomain.ItemImage,
            //            ItemMasterId = result.ItemMasterId,
            //            CharacterId = itemDomain.Item.CharacterId,
            //            ContainedIn = itemDomain.Item.ContainerItemId, //container
            //            Quantity = itemDomain.Item.Quantity,
            //            TotalWeight = itemDomain.Item.TotalWeight,
            //            IsIdentified = itemDomain.Item.IsIdentified,
            //            IsVisible = itemDomain.Item.IsVisible,
            //            IsEquipped = itemDomain.Item.IsEquipped,

            //            IsContainer = (bool)itemDomain.IsContainer,
            //            IsConsumable = (bool)itemDomain.IsConsumable,
            //            IsMagical = (bool)itemDomain.IsMagical,
            //            ItemCalculation = itemDomain.ItemCalculation,
            //            Metatags = itemDomain.Metatags,
            //            Rarity = itemDomain.Rarity,
            //            Value = itemDomain.Value != null ? (decimal)itemDomain.Value : 0,
            //            Volume = itemDomain.Volume != null ? (decimal)itemDomain.Volume : 0,
            //            Weight = itemDomain.Weight != null ? (decimal)itemDomain.Weight : 0,
            //            Command = itemDomain.Command,

            //            ItemStats = itemDomain.ItemStats,
            //            ContainerWeightMax = itemDomain.ContainerWeightMax,
            //            ContainerVolumeMax = itemDomain.ContainerVolumeMax,
            //            PercentReduced = itemDomain.PercentReduced,
            //            TotalWeightWithContents = itemDomain.TotalWeightWithContents,
            //            ContainerWeightModifier = itemDomain.ContainerWeightModifier
            //        },
            //        ItemSpells,
            //        ItemAbilities);

            //        if (itemDomain.itemMasterCommandVM != null)
            //        {
            //            foreach (var command in itemDomain.itemMasterCommandVM)
            //            {
            //                await _itemCommandService.InsertItemCommand(new ItemCommand()
            //                {
            //                    Command = command.Command,
            //                    Name = command.Name,
            //                    ItemId = _itemInsert.ItemId
            //                });
            //            }
            //        }

            //        if (itemDomain.ContainerItems != null)
            //        {
            //            //remove all contains item
            //            await _itemService.DeleteContainer(_itemInsert.ItemId);
            //            foreach (var itm in itemDomain.ContainerItems)
            //            {
            //                await _itemService.UpdateContainer(itm.ItemId, _itemInsert.ItemId);
            //            }
            //        }

            //        if (itemDomain.IsContainer == true)
            //        {
            //            decimal TotalWeight = CalculateTotalWeight(itemDomain);
            //            await _itemService.UpdateWeight(_itemInsert.ItemId, TotalWeight);

            //        }

            //        await this._characterService.UpdateCharacterInventoryWeight(new Character
            //        {
            //            CharacterId = _itemInsert.CharacterId ?? 0,
            //            InventoryWeight = _itemInsert.TotalWeight
            //        });

            //        var ruleset = _ruleSetService.GetRuleSetById((int)(itemDomain.RuleSetId));
            //        //return Ok("A new " + itemDomain.Item.Name + " Item Template has been created in the "
            //        //    + ruleset.Result.RuleSetName + " Rule Set for this Item. Any future updates to the Item will not affect the Item Template."
            //        //    + " If you wish to update the Item Template you may do so from the Rule Sets interface.");
            //        return Ok("An Item Template has been created for this at the Rule Set.");
            //    }
            //}
            //catch (Exception ex)
            //{ return BadRequest(ex.Message); }
            return Ok(result.ItemMasterId);
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteItemMaster(int Id)
        {
            //int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
            //if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
            //{
            //    int ItemMasterID = model.ItemMasterId == null ? 0 : (int)model.ItemMasterId;
            //    if (!_coreRulesetService.IsItemCopiedFromCoreRuleset(ItemMasterID, rulesetID))
            //    {
            //        await CreateItemMasterForCopiedRuleset(model,true);
            //        return Ok();
            //        // await UpdateItemMasterCommon(model);
            //    }
            //}           
            await _itemMasterService.DeleteItemMaster(Id);
            return Ok();
        }

        [HttpPost("delete_up")]
        public async Task<IActionResult> DeleteItemMaster([FromBody] EditItemMasterModel model)
        {
            int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
            if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
            {
                int ItemMasterID = model.ItemMasterId == null ? 0 : (int)model.ItemMasterId;
                if (!_coreRulesetService.IsItemCopiedFromCoreRuleset(ItemMasterID, rulesetID))
                {
                    await CreateItemMasterForCopiedRuleset(model, true);
                    //return Ok();
                    // await UpdateItemMasterCommon(model);
                }
            }
            await _itemMasterService.DeleteItemMaster((int)model.ItemMasterId);
            return Ok();
        }
        [HttpPost("uploadItemTemplateImage")]
        public async Task<IActionResult> uploadItemTemplateImage()
        {

            if (_httpContextAccessor.HttpContext.Request.Form.Files.Any())
            {
                // Get the uploaded image from the Files collection
                var httpPostedFile = _httpContextAccessor.HttpContext.Request.Form.Files["UploadedImage"];

                if (httpPostedFile != null)
                {
                    try
                    {
                        BlobService bs = new BlobService(_httpContextAccessor, _accountManager);
                        var container = bs.GetCloudBlobContainer().Result;
                        string imageName = Guid.NewGuid().ToString();
                        dynamic Response = new ExpandoObject();
                        Response.ImageUrl = bs.UploadImages(httpPostedFile, imageName, container).Result;
                        Response.ThumbnailUrl = Response.ImageUrl; // bs.UploadThumbnail(httpPostedFile, imageName, container).Result;

                        return Ok(Response);
                    }
                    catch (Exception ex)
                    {
                        return BadRequest(ex.Message);
                    }
                }

                return BadRequest();
            }
            return BadRequest("No Image Selected");

        }

        [AllowAnonymous]
        [HttpPost("DuplicateItemMaster")]
        public async Task<IActionResult> DuplicateItemMaster([FromBody] CreateItemMasterModel model)
        {
            if (ModelState.IsValid)
            {
                if (_itemMasterService.CheckDuplicateItemMaster(model.ItemName.Trim(), model.RuleSetId).Result)
                    return BadRequest("The Item Master Name " + model.ItemName + " had already been used. Please select another name.");

                var itemmaster = _itemMasterService.GetItemMasterById(model.ItemMasterId);

                model.ItemMasterId = 0;
                var itemMasterModel = Mapper.Map<ItemMaster>(model);
                var result = await _itemMasterService.CreateItemMaster(itemMasterModel, itemmaster.ItemMasterSpell.ToList(), itemmaster.ItemMasterAbilities.ToList());

                foreach (var imcViewModels in itemmaster.ItemMasterCommand)
                {
                    await _iItemMasterCommandService.InsertItemMasterCommand(new ItemMasterCommand()
                    {
                        Command = imcViewModels.Command,
                        Name = imcViewModels.Name,
                        ItemMasterId = result.ItemMasterId
                    });
                }

                try
                {
                    //when duplicating item from character
                    if (model.IsFromCharacter && model.IsFromCharacterId > 0
                        && model.Item != null)
                    {
                        var ItemAbilities = new List<ItemAbility>();
                        foreach (var ability in model.itemMasterAbilityVM)
                        {
                            ItemAbilities.Add(new ItemAbility
                            {
                                AbilityId = ability.AbilityId
                            });
                        }
                        var ItemSpells = new List<ItemSpell>();
                        foreach (var spell in model.itemMasterSpellVM)
                        {
                            ItemSpells.Add(new ItemSpell
                            {
                                SpellId = spell.SpellId
                            });
                        }

                        var _itemInsert = await _itemService.InsertItem(new Item
                        {
                            Name = result.ItemName,
                            Description = result.ItemVisibleDesc,
                            ItemImage = result.ItemImage,
                            ItemMasterId = result.ItemMasterId,
                            CharacterId = model.Item.CharacterId,
                            //ContainerId = _container.ContainerId,
                            ContainedIn = model.Item.ContainerItemId, //container
                            Quantity = model.Item.Quantity,
                            TotalWeight = model.Item.TotalWeight,
                            IsIdentified = model.Item.IsIdentified,
                            IsVisible = model.Item.IsVisible,
                            IsEquipped = model.Item.IsEquipped,

                            IsContainer = result.IsContainer,
                            IsConsumable = result.IsConsumable,
                            IsMagical = result.IsMagical,
                            ItemCalculation = result.ItemCalculation,
                            Metatags = result.Metatags,
                            Rarity = result.Rarity,
                            Value = result.Value,
                            Volume = result.Volume,
                            Weight = result.Weight,
                            Command = result.Command,

                            ItemStats = result.ItemStats,
                            ContainerWeightMax = result.ContainerWeightMax,
                            ContainerVolumeMax = result.ContainerVolumeMax,
                            PercentReduced = result.PercentReduced,
                            TotalWeightWithContents = result.TotalWeightWithContents,
                            ContainerWeightModifier = result.ContainerWeightModifier
                        },
                        ItemSpells,
                        ItemAbilities);

                        if (itemmaster.ItemMasterCommand != null)
                        {
                            foreach (var command in itemmaster.ItemMasterCommand)
                            {
                                await _itemCommandService.InsertItemCommand(new ItemCommand()
                                {
                                    Command = command.Command,
                                    Name = command.Name,
                                    ItemId = _itemInsert.ItemId
                                });
                            }
                        }

                        var ruleset = _ruleSetService.GetRuleSetById(result.RuleSetId);
                        //return Ok("A new " + result.ItemName + " Item Template has been created in the "
                        //    + ruleset.Result.RuleSetName + " Rule Set for this Item. Any future updates to the Item will not affect the Item Template."
                        //    + " If you wish to update the Item Template you may do so from the Rule Sets interface.");
                        return Ok("An Item Template has been created for this at the Rule Set.");
                    }
                }
                catch (Exception ex)
                { return BadRequest(ex.Message); }


                return Ok();
            }

            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        //get user id methods
        private string GetUserId()
        {
            string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
            ApplicationUser appUser = _accountManager.GetUserByUserNameAsync(userName).Result;
            return appUser.Id;
        }

        private decimal CalculateTotalWeight(CreateItemMasterModel itemDomain)
        {
            decimal TotalWeight = itemDomain.Item.TotalWeight;
            decimal ContainedItemWeight = 0;
            foreach (var itm in itemDomain.ContainerItems)
            {
                ContainedItemWeight += _itemService.GetContainedItemWeight(itm.ItemId);
            }

            if (itemDomain.ContainerWeightModifier == "Percent of Contents")
            {
                TotalWeight += (ContainedItemWeight - (ContainedItemWeight * (itemDomain.PercentReduced / 100)));
            }
            else if (itemDomain.ContainerWeightModifier == "Maximum Weight of")
            {
                TotalWeight += ContainedItemWeight;
                if (TotalWeight >= itemDomain.TotalWeightWithContents)
                    return itemDomain.TotalWeightWithContents;
            }
            else
            {
                TotalWeight += ContainedItemWeight;
            }
            return TotalWeight;
        }

        private decimal CalculateTotalWeightItem(ItemEditModel itemDomain)
        {
            decimal TotalWeight = itemDomain.Weight * itemDomain.Quantity;
            decimal ContainedItemWeight = 0;
            foreach (var itm in itemDomain.ContainerItems)
            {
                ContainedItemWeight += _itemService.GetContainedItemWeight(itm.ItemId);
            }

            if (itemDomain.ContainerWeightModifier == "Percent of Contents")
            {
                TotalWeight += (ContainedItemWeight - (ContainedItemWeight * (itemDomain.PercentReduced / 100)));
            }
            else if (itemDomain.ContainerWeightModifier == "Maximum Weight of")
            {
                TotalWeight += ContainedItemWeight;
                if (TotalWeight >= itemDomain.TotalWeightWithContents)
                    return itemDomain.TotalWeightWithContents;
            }
            else
            {
                TotalWeight += ContainedItemWeight;
            }
            return TotalWeight;
        }

        #region API_UsingSP
        [HttpGet("getByRuleSetId_sp")]
        public async Task<IActionResult> getByRuleSetId_sp(int rulesetId, int page = 1, int pageSize = 30)
        {
            //await AddItemMastersToLoot(null);
            //await GetItemMasterLoots(rulesetId);
            dynamic Response = new ExpandoObject();
            var ItemList = _itemMasterService.SP_GetItemMastersByRuleSetId(rulesetId, page, pageSize);
            Response.ItemMaster = ItemList; // Utilities.CleanModel<ItemMaster>(ItemList);
            if (ItemList.Any())
            {
                Response.RuleSet = ItemList.FirstOrDefault().RuleSet;
            }
            else
            {
                Response.RuleSet = _ruleSetService.GetRuleSetById(rulesetId).Result;
            }
            return Ok(Response);
        }

        [HttpGet("AbilitySpellForItemsByRuleset_sp")]
        public async Task<IActionResult> AbilitySpellForItemsByRuleset_sp(int rulesetId, int itemMasterId)
        {
            return Ok(_itemMasterService.AbilitySpellForItemsByRuleset_sp(rulesetId, itemMasterId));
        }
        #endregion
        #region Loot
        [HttpPost("AddItemMastersToLoot")]
        public async Task<IActionResult> AddItemMastersToLoot([FromBody] List<CommonID> ItemList)
        {
            //ItemList = new List<CommonID>();
            //ItemList.Add(new CommonID() { ID = 8499 });
            //ItemList.Add(new CommonID() { ID = 8500 });
            try
            {
                await _itemMasterService._AddItemsToLoot(ItemList);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok();
        }
        [HttpGet("GetItemMasterLoots")]
        public async Task<IActionResult> GetItemMasterLoots(int rulesetID, int page = 1, int pageSize = 30)
        {
            //rulesetID = 222;
           // var res 
            dynamic Response = new ExpandoObject();
            var ItemList = await _itemMasterService.GetItemMasterLoots(rulesetID, page, pageSize);
            //List<ItemMasterLoot_ViewModel> ItemList = res.Select(x => new ItemMasterLoot_ViewModel() {
            //    Command=x.ItemMaster.Command,
            //    CommandName= x.ItemMaster.CommandName,
            //    ContainedIn= x.ContainedIn,
            //    ContainerVolumeMax= x.ItemMaster.ContainerVolumeMax,
            //    ContainerWeightMax= x.ItemMaster.ContainerWeightMax,
            //    ContainerWeightModifier= x.ItemMaster.ContainerWeightModifier,
            //    IsConsumable= x.ItemMaster.IsConsumable,
            //    IsContainer= x.ItemMaster.IsContainer,
            //    IsDeleted= x.ItemMaster.IsDeleted,
            //    IsIdentified= x.IsIdentified,
            //    IsMagical= x.ItemMaster.IsMagical,
            //    IsShow=x.IsShow,
            //    IsVisible= x.IsVisible,
            //    ItemCalculation= x.ItemMaster.ItemCalculation,
            //    ItemImage= x.ItemMaster.ItemImage,
            //    ItemMasterAbilities= x.ItemMaster.ItemMasterAbilities,
            //    ItemMasterCommand= x.ItemMaster.ItemMasterCommand,
            //    ItemMasterId= x.ItemMaster.ItemMasterId,
            //    ItemMasterPlayers= x.ItemMaster.ItemMasterPlayers,
            //   ItemMasterSpell = x.ItemMaster.ItemMasterSpell,
            //    ItemName= x.ItemMaster.ItemName,
            //    Items= x.ItemMaster.Items,
            //    ItemStats= x.ItemMaster.ItemStats,
            //    LootId= x.LootId,
            //    ItemVisibleDesc= x.ItemMaster.ItemVisibleDesc,
            //    ParentItemMasterId= x.ItemMaster.ParentItemMasterId,
            //    Metatags= x.ItemMaster.Metatags,
            //    PercentReduced= x.ItemMaster.PercentReduced,
            //    Quantity= x.Quantity,
            //    Rarity= x.ItemMaster.Rarity,
            //    RuleSetId= x.ItemMaster.RuleSetId,
            //    TotalWeight= x.TotalWeight,
            //    TotalWeightWithContents= x.ItemMaster.TotalWeightWithContents,
            //    Value= x.ItemMaster.Value,
            //    Volume= x.ItemMaster.Volume,
            //    Weight= x.ItemMaster.Weight,
            //}).ToList();
            Response.ItemMaster = ItemList; // Utilities.CleanModel<ItemMaster>(ItemList);
            if (ItemList.Any())
            {
                Response.RuleSet = _ruleSetService.GetRuleSetById(rulesetID).Result;//ItemList.FirstOrDefault().RuleSet;
            }
            else
            {
                Response.RuleSet = _ruleSetService.GetRuleSetById(rulesetID).Result;
            }
            return Ok(Response);
           // return Ok(res);
        }
        [HttpGet("GetLootItemsForPlayers")]
        public async Task<IActionResult> GetLootItemsForPlayers(int rulesetID)
        {
            //rulesetID = 222;
            var res = await _itemMasterService.GetLootItemsForPlayers(rulesetID);
            return Ok(res);
        }
        [HttpPost("CreateItemMasterLoot")]
        public async Task<IActionResult> CreateItemMasterLoot([FromBody] CreateItemMasterLootModel itemDomain)
        {
            if (ModelState.IsValid)
            {
                var ItemMasterModel = _itemMasterService.GetDuplicateItemMaster(itemDomain.ItemName, itemDomain.RuleSetId).Result;
                var result = new ItemMaster();
                var itemMaster = Mapper.Map<ItemMaster>(itemDomain);
                if (ItemMasterModel != null)
                {
                    result = ItemMasterModel;
                    //return BadRequest("The Item Master Name " + itemDomain.ItemName + " had already been used in this Rule Set. Please select another name.");
                }
                else
                {
                    result = await _itemMasterService.CreateItemMaster(itemMaster, itemDomain.itemMasterSpellVM, itemDomain.itemMasterAbilityVM);
                }


                if (itemDomain.itemMasterCommandVM != null && itemDomain.itemMasterCommandVM.Count > 0)
                {
                    foreach (var imcViewModels in itemDomain.itemMasterCommandVM)
                    {
                        await _iItemMasterCommandService.InsertItemMasterCommand(new ItemMasterCommand()
                        {
                            Command = imcViewModels.Command,
                            Name = imcViewModels.Name,
                            ItemMasterId = result.ItemMasterId
                        });
                    }
                }
                var ruleset = _ruleSetService.GetRuleSetById((int)(itemDomain.RuleSetId));
                ItemMasterLoot loot = new ItemMasterLoot()
                {
                    ContainedIn = itemDomain.ContainedIn,
                    IsIdentified = itemDomain.IsIdentified,
                    IsShow = itemDomain.IsShow,
                    IsVisible = itemDomain.IsVisible,
                    Quantity = itemDomain.Quantity,
                    ItemMasterId = itemDomain.ItemMasterId,
                };

                await _itemMasterService.CreateItemMasterLoot(result, loot);
                try
                {

                    ///////if non-conatiner item remove/update its container
                    if (itemDomain.ContainedIn > 0 && !itemDomain.IsContainer==null?false:true)
                    {
                        var containerItem = _itemMasterService.GetItemMasterById(itemDomain.ContainedIn);
                        var _itemContainer = itemDomain;// containerItem;//Mapper.Map<ItemEditModel>(containerItem)

                        List<ViewModels.CreateModels.containerItemIds> _containerItemIds = new List<ViewModels.CreateModels.containerItemIds>();
                        var _item = itemDomain;
                        foreach (var itm in await _itemMasterService.GetByContainerId(containerItem.ItemMasterId))
                        {
                            if (itm.ItemMasterId != _item.ItemMasterId)
                            {
                                ViewModels.CreateModels.containerItemIds __containerItemIds = new ViewModels.CreateModels.containerItemIds();
                                __containerItemIds.ItemId = itm.ItemMasterId;
                                _containerItemIds.Add(__containerItemIds);
                            }
                        }
                        if (_item.ContainedIn > 0)
                        {
                            ViewModels.CreateModels.containerItemIds __containerItemIds = new ViewModels.CreateModels.containerItemIds();
                            __containerItemIds.ItemId = _item.ItemMasterId;
                            _containerItemIds.Add(__containerItemIds);
                        }
                        _itemContainer.ContainerItems = _containerItemIds;

                        decimal TotalWeight = CalculateTotalWeightItem(new ItemEditModel() {
                            Weight= _itemContainer.Weight==null?0 : (decimal)_itemContainer.Weight,
                            Quantity= _itemContainer.Quantity,
                            ContainerItems= _itemContainer.ContainerItems.Select(x=> new ViewModels.EditModels.containerItemIds() {
                                ItemId=x.ItemId,
                            }).ToList(),
                            ContainerWeightModifier= _itemContainer.ContainerWeightModifier,
                            PercentReduced= _itemContainer.PercentReduced,
                            TotalWeightWithContents= _itemContainer.TotalWeightWithContents,
                        } );
                        await _itemMasterService.UpdateWeight(_itemContainer.ItemMasterId, TotalWeight);
                    }
                    ///////////

                    if (itemDomain.ContainerItems != null)
                    {
                        //remove all contains item
                        await _itemMasterService.DeleteContainer(itemDomain.ItemMasterId);
                        foreach (var itm in itemDomain.ContainerItems)
                        {
                            await _itemMasterService.UpdateContainer(itm.ItemId, itemDomain.ItemMasterId);
                        }
                    }

                    //await this._characterService.UpdateCharacterInventoryWeight(_itemInsert.CharacterId ?? 0);

                        
                        //return Ok("A new " + itemDomain.Item.Name + " Item Template has been created in the "
                        //    + ruleset.Result.RuleSetName + " Rule Set for this Item. Any future updates to the Item will not affect the Item Template."
                        //    + " If you wish to update the Item Template you may do so from the Rule Sets interface.");
                        //return Ok("An Item Template has been created for this at the Rule Set.");
                    
                }
                catch (Exception ex)
                { return BadRequest(ex.Message); }


                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }
        [HttpPost("UpdateItemMasterLoot")]
        public async Task<IActionResult> UpdateItemMasterLoot([FromBody] EditItemMasterLootModel model)
        {

            if (ModelState.IsValid)
            {
                int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
                if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
                {
                    await Core_UpdateItemMaster(model);
                }
                else
                {
                    await UpdateItemMasterCommon(model);
                }
                ItemMasterLoot OldLoot =await _itemMasterService.getLootDetails(model.LootId);
                ItemMasterLoot loot = new ItemMasterLoot()
                {
                    LootId=model.LootId,
                    //ContainedIn = model.ContainedIn,
                    IsIdentified = model.IsIdentified,
                    IsShow = model.IsShow,
                    IsVisible = model.IsVisible,
                    Quantity = model.Quantity,
                    ItemMasterId = model.ItemMasterId==null?0:(int)model.ItemMasterId,
                };
               var result= await _itemMasterService.UpdateItemMasterLoot(loot);


                var item = OldLoot;
                ///////if non-conatiner item remove/update its container
                if (((item.ContainedIn > 0 && result.ContainedIn == 0)
                    || (item.ContainedIn == 0 && result.ContainedIn > 0)
                    || (item.ContainedIn == result.ContainedIn && result.ContainedIn > 0)) && model.IsContainer!=true)
                {
                    int __itemContainerId = (item.ContainedIn > 0 && result.ContainedIn == 0) ? item.ContainedIn ?? 0
                         : ((item.ContainedIn == 0 && result.ContainedIn > 0) ? result.ContainedIn ?? 0
                         : ((result.ContainedIn > 0) ? result.ContainedIn ?? 0 : 0));

                    var containerItem = _itemMasterService.GetItemMasterById(__itemContainerId);
                    var _itemContainer = model;//Mapper.Map<ItemEditModel>(containerItem);

                    List<ViewModels.EditModels.containerItemIds> _containerItemIds = new List<ViewModels.EditModels.containerItemIds>();
                    foreach (var itm in await _itemMasterService.GetByContainerId(containerItem.ItemMasterId))
                    {
                        if (itm.ItemMasterId != result.ItemMasterId)
                        {
                            ViewModels.EditModels.containerItemIds __containerItemIds = new ViewModels.EditModels.containerItemIds();
                            __containerItemIds.ItemId = itm.ItemMasterId;
                            _containerItemIds.Add(__containerItemIds);
                        }
                    }
                    if ((item.ContainedIn == 0 && result.ContainedIn > 0) || (item.ContainedIn == result.ContainedIn))
                    {
                        ViewModels.EditModels.containerItemIds __containerItemIds = new ViewModels.EditModels.containerItemIds();
                        __containerItemIds.ItemId = result.ItemMasterId;
                        _containerItemIds.Add(__containerItemIds);
                    }
                    _itemContainer.ContainerItems = _containerItemIds;

                    decimal TotalWeight = CalculateTotalWeightItem(new ItemEditModel()
                    {
                        Weight = _itemContainer.Weight == null ? 0 : (decimal)_itemContainer.Weight,
                        Quantity = _itemContainer.Quantity,
                        ContainerItems = _itemContainer.ContainerItems.Select(x => new ViewModels.EditModels.containerItemIds()
                        {
                            ItemId = x.ItemId,
                        }).ToList(),
                        ContainerWeightModifier = _itemContainer.ContainerWeightModifier,
                        PercentReduced = _itemContainer.PercentReduced,
                        TotalWeightWithContents = _itemContainer.TotalWeightWithContents,
                    });
                    await _itemService.UpdateWeight(_itemContainer.ItemMasterId==null?0:(int)_itemContainer.ItemMasterId, TotalWeight);
                }
                ///////////
                                
                if (model.ContainerItems != null)
                {
                    //remove all contains item
                    await _itemMasterService.DeleteContainer(OldLoot.ItemMasterId);
                    foreach (var itm in model.ContainerItems)
                    {
                        await _itemMasterService.UpdateContainer(itm.ItemId, OldLoot.ItemMasterId);
                    }
                    //_itemService.ManageContainer(model.ItemId, model.ContainerItems.Select(q => new CommonID { ID=q.ItemId }).ToList());
                }
                if (model.IsContainer == true)
                {
                    decimal TotalWeight = CalculateTotalWeightItem(new ItemEditModel()
                    {
                        Weight = model.Weight == null ? 0 : (decimal)model.Weight,
                        Quantity = model.Quantity,
                        ContainerItems = model.ContainerItems.Select(x => new ViewModels.EditModels.containerItemIds()
                        {
                            ItemId = x.ItemId,
                        }).ToList(),
                        ContainerWeightModifier = model.ContainerWeightModifier,
                        PercentReduced = model.PercentReduced,
                        TotalWeightWithContents = model.TotalWeightWithContents,
                    });
                    await _itemMasterService.UpdateWeight(OldLoot.ItemMasterId, TotalWeight);
                }
                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));

        }
        [HttpPost("giveItemsToCharacters")]
        public async Task<IActionResult> giveItemsToCharacters([FromBody] List<CommonID> CharacterIds,int LootID)
        {          
            try
            {
                foreach (var charID in CharacterIds)
                {
                   // foreach (var item in model.MultiLootIds)
                    //{
                        ItemMasterLoot loot = await _itemMasterService.getLootDetails(LootID);
                        if (loot != null)
                        {
                            await AddItemToCharacter(charID.ID, new ItemMasterIds() { ItemMasterId = loot.ItemMasterId }, loot);
                        }

                    //}
                    await this._characterService.UpdateCharacterInventoryWeight(charID.ID);
                    return Ok();
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
            return Ok();
        }
        private async Task AddItemToCharacter(int charID, ItemMasterIds item, ItemMasterLoot Loot = null)
        {
            ItemViewModel model = new ItemViewModel();
            model.CharacterId = charID;
            //count += 1;
            var ItemTemplate = _itemMasterService.GetItemMasterById(item.ItemMasterId);
            if (Loot != null)
            {
                model.ItemMasterId = Loot.ItemMasterId;
                model.Quantity = Loot.Quantity;
                model.IsIdentified = Loot.IsIdentified;
                model.IsVisible = Loot.IsVisible;
                //model.cont = Loot.Quantity; ContainedIn is pending
            }
            var _ItemName = ItemTemplate.ItemName;
            var existingNameItems = _itemService.getDuplicateItems(model.CharacterId, ItemTemplate.ItemMasterId);
            //if (await _itemService.CheckDuplicateItem(ItemTemplate.ItemName, model.CharacterId))
            //    _ItemName = ItemTemplate.ItemName + "_" + count;


            if (existingNameItems != null)
            {
                int count = 0;
                if (existingNameItems.Where(p => p.Name == ItemTemplate.ItemName).Any())
                {

                    foreach (var rec in existingNameItems)
                    {
                        count++;
                        if (count > 0 && existingNameItems.Count != 0)
                        {
                            if (!existingNameItems.Where(p => p.Name == ItemTemplate.ItemName + "_" + count).Any())
                                _ItemName = ItemTemplate.ItemName + "_" + count;
                        }

                    }
                }
                //int count = existingNameItems.Count;
                //if (count > 0)
                //    _ItemName = ItemTemplate.ItemName + "_" + count;
            }

            var ItemAbilities = new List<ItemAbility>();
            foreach (var ability in ItemTemplate.ItemMasterAbilities)
            {
                ItemAbilities.Add(new ItemAbility
                {
                    AbilityId = ability.AbilityId
                });
            }
            var ItemSpells = new List<ItemSpell>();
            foreach (var spell in ItemTemplate.ItemMasterSpell)
            {
                ItemSpells.Add(new ItemSpell
                {
                    SpellId = spell.SpellId
                });
            }
            var ItemCommands = new List<ItemCommand>();
            foreach (var command in ItemTemplate.ItemMasterCommand)
            {
                ItemCommands.Add(new ItemCommand
                {
                    Command = command.Command,
                    Name = command.Name,
                });
            }
            //no container whiling adding item master
            var result = await _itemService.InsertItem(new Item
            {
                Name = _ItemName,
                Description = ItemTemplate.ItemVisibleDesc,
                ItemImage = ItemTemplate.ItemImage,
                CharacterId = model.CharacterId,
                ItemMasterId = ItemTemplate.ItemMasterId,
                //ContainerId = _container.ContainerId,
                IsIdentified = model.IsIdentified,
                IsVisible = model.IsVisible,
                IsEquipped = model.IsEquipped,
                ParentItemId = item.ItemMasterId,
                Command = ItemTemplate.Command,
                IsContainer = ItemTemplate.IsContainer,
                IsConsumable = ItemTemplate.IsConsumable,
                IsMagical = ItemTemplate.IsMagical,
                ItemCalculation = ItemTemplate.ItemCalculation,
                Metatags = ItemTemplate.Metatags,
                Rarity = ItemTemplate.Rarity,
                Value = ItemTemplate.Value,
                Volume = ItemTemplate.Volume,
                Weight = ItemTemplate.Weight,
                Quantity = model.Quantity == 0 ? 1 : model.Quantity,
                TotalWeight = ItemTemplate.Weight * (model.Quantity == 0 ? 1 : model.Quantity),

                ItemStats = ItemTemplate.ItemStats,
                ContainerWeightMax = ItemTemplate.ContainerWeightMax,
                ContainerVolumeMax = ItemTemplate.ContainerVolumeMax,
                PercentReduced = ItemTemplate.PercentReduced,
                TotalWeightWithContents = ItemTemplate.TotalWeightWithContents,
                ContainerWeightModifier = ItemTemplate.ContainerWeightModifier,
                CommandName = ItemTemplate.CommandName
            },
            ItemSpells,
            ItemAbilities, ItemCommands);
        }
        [HttpPost("delete_up")]
        public async Task<IActionResult> DeleteItemMaster([FromBody] EditItemMasterLootModel model)
        {
            int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
            if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
            {
                int ItemMasterID = model.ItemMasterId == null ? 0 : (int)model.ItemMasterId;
                if (!_coreRulesetService.IsItemCopiedFromCoreRuleset(ItemMasterID, rulesetID))
                {
                    await CreateItemMasterForCopiedRuleset(model, true);
                    //return Ok();
                    // await UpdateItemMasterCommon(model);
                }
            }
            await _itemMasterService.DeleteItemMasterLoot(model.LootId);
            return Ok();
        }
        #endregion
    }
}
