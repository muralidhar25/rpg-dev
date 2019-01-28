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
    public class ItemController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        private readonly IItemService _itemService;
        private readonly IItemMasterService _itemMasterService;
        private readonly IItemCommandService _itemCommandService;
        private readonly ICharacterService _characterService;
        private readonly ICoreRuleset _coreRulesetService;

        public ItemController(IHttpContextAccessor httpContextAccessor, IAccountManager accountManager,
            IItemService itemService, IItemCommandService itemCommandService,
            IItemMasterService itemMasterService, ICharacterService characterService, ICoreRuleset coreRulesetService)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._accountManager = accountManager;
            this._itemService = itemService;
            this._itemMasterService = itemMasterService;
            this._characterService = characterService;
            this._itemCommandService = itemCommandService;
            this._coreRulesetService = coreRulesetService;
        }

        [HttpGet("getall")]
        public IEnumerable<ItemListViewModel> GetAll()
        {
            var items = _itemService.GetAll();

            List<ItemListViewModel> itemlist = new List<ItemListViewModel>();

            ItemListViewModel listobj;

            foreach (Item item in items)
            {
                listobj = new ItemListViewModel();
                listobj = Mapper.Map<ItemListViewModel>(item);

                if (item.ContainedIn != null)
                    listobj.Container = _itemService.GetContainer(item.ContainedIn);
                listobj.ContainerItems = _itemService.GetByContainerId(item.ItemId);

                itemlist.Add(listobj);
            }

            if (items == null || items.Count == 0)
                return new List<ItemListViewModel>();

            return itemlist;
        }

        [HttpGet("GetById")]
        public async Task<ItemListViewModel> GetById(int id)
        {
            var item = _itemService.GetById(id);

            if (item == null)
                return new ItemListViewModel();

            ItemListViewModel listobj = new ItemListViewModel();
            listobj = Mapper.Map<ItemListViewModel>(item);

            if (item.ContainedIn != null)
                listobj.Container = _itemService.GetContainer(item.ContainedIn);
            listobj.ContainerItems = _itemService.GetByContainerId(item.ItemId);
            listobj.RuleSet = item.Character == null ? null : item.Character.RuleSet;

            return listobj;
        }
        
            [HttpGet("GetCharSpellIDUrl")]
        public CharacterSpell GetCharSpellIDUrl(int RulesetSpellID,int characterId)
        {
            return _itemService.GetCharSpellIDUrl(RulesetSpellID, characterId);
        }
        [HttpGet("GetCharAbilityIDUrl")]
        public CharacterAbility GetCharAbilityIDUrl(int RulesetAbilityID, int characterId)
        {
            return _itemService.GetCharAbilityIDUrl(RulesetAbilityID, characterId);
        }
        [HttpGet("getByCharacterId")]
        public IEnumerable<ItemListViewModel> GetByCharacterId(int characterId)
        {
            var items = _itemService.GetByCharacterId(characterId);

            if (items == null || items.Count == 0)
                return new List<ItemListViewModel>();

            List<ItemListViewModel> itemlist = new List<ItemListViewModel>();

            foreach (Item item in items)
            {
                var listobj = new ItemListViewModel();
                listobj = Mapper.Map<ItemListViewModel>(item);
                if (item.ContainedIn != null)
                    listobj.Container = _itemService.GetContainer(item.ContainedIn);
                listobj.ContainerItems = _itemService.GetByContainerId(item.ItemId);
                listobj.RuleSet = item.Character == null ? null : item.Character.RuleSet;

                itemlist.Add(listobj);
            }
            foreach (var item in itemlist)
            {
                item.Character.Items = null;
            }
            return Utilities.CleanModel<ItemListViewModel>(itemlist);
            // return itemlist;
        }

        [HttpGet("getAllByCharacterId")]
        public IEnumerable<ItemListViewModel> GetAllByCharacterId(int characterId, int page = 1, int pageSize = 6)
        {
            var items = _itemService.GetByCharacterId(characterId, page, pageSize);

            if (items == null || items.Count == 0)
                return new List<ItemListViewModel>();

            List<ItemListViewModel> itemlist = new List<ItemListViewModel>();

            ItemListViewModel listobj;

            foreach (Item item in items)
            {
                listobj = new ItemListViewModel();
                listobj = Mapper.Map<ItemListViewModel>(item);
                //var container = _containerService.GetContainerbyItemId(item.ItemId);
                //if (container != null)
                //    listobj.ContainerItems = _itemService.GetByContainerId(container.ContainerId).ToList();
                listobj.RuleSet = item.Character == null ? null : item.Character.RuleSet;
                itemlist.Add(listobj);
            }

            return Utilities.CleanModel<ItemListViewModel>(itemlist);
        }

        [HttpGet("GetAvailableItems")]
        public IEnumerable<ItemListViewModel> GetAvailableItems(int characterId, int itemId, int containerItemId)
        {
            //var items = _itemService.GetAll();
            List<Item> items = _itemService.GetAvailableItems(characterId);

            if (items == null || items.Count == 0)
                return new List<ItemListViewModel>();

            List<ItemListViewModel> itemlist = new List<ItemListViewModel>();

            /*To get those character items which are not contained yet.*/
            foreach (Item item in items.Where(w => w.CharacterId == characterId).ToList())
            {
                if (item.ItemId == itemId) continue;
                else if (item.ItemId == containerItemId) continue; //cannot contain item which is selected above(ui) as container
                else if (item.ContainedIn == null || item.ContainedIn == 0)
                {
                    var listobj = new ItemListViewModel();
                    listobj = Mapper.Map<ItemListViewModel>(item);
                    itemlist.Add(listobj);
                }
            }

            return itemlist;// Utilities.CleanModel<ItemListViewModel>(itemlist);
        }

        [HttpGet("GetAvailableContainerItems")]
        public IEnumerable<Item> GetAvailableContainerItems(int characterId, int itemId)
        {
            var items = _itemService.GetAvailableContainerItems(characterId, itemId);

            if (items == null || items.Count == 0)
                return new List<Item>();

            return items;
        }

        [HttpPost("add")]
        public async Task<IActionResult> Add([FromBody] ItemViewModel model)
        {
            if (ModelState.IsValid)
            {                
                foreach (var item in model.MultiItemMasters)
                {
                    //count += 1;
                    var ItemTemplate = _itemMasterService.GetItemMasterById(item.ItemMasterId);
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
                            Name=command.Name,
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
                        Command= ItemTemplate.Command,
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
                        CommandName= ItemTemplate.CommandName
                    },
                    ItemSpells,
                    ItemAbilities, ItemCommands);
                }

                await this._characterService.UpdateCharacterInventoryWeight(model.CharacterId ?? 0);
                return Ok();
            }

            return BadRequest(Utilities.ModelStateError(ModelState));

        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreateItemModel model)
        {
            if (ModelState.IsValid)
            {
                if (_itemService.CheckDuplicateItem(model.Name, model.CharacterId).Result)
                    return BadRequest("The Item Name " + model.Name + " had already been used. Please select another name.");

                model.TotalWeight = model.Quantity * model.Weight;
                var _item = Mapper.Map<Item>(model);

                var result = await _itemService.InsertItem(_item, model.ItemSpells, model.ItemAbilities);

                ///////if non-conatiner item remove/update its container
                if (_item.ContainedIn > 0 && !model.IsContainer)
                {
                    var containerItem = _itemService.GetById(_item.ContainedIn);
                    var _itemContainer = Mapper.Map<ItemEditModel>(containerItem);

                    List<ViewModels.EditModels.containerItemIds> _containerItemIds = new List<ViewModels.EditModels.containerItemIds>();
                    foreach (var itm in _itemService.GetByContainerId(containerItem.ItemId))
                    {
                        if (itm.ItemId != _item.ItemId)
                        {
                            ViewModels.EditModels.containerItemIds __containerItemIds = new ViewModels.EditModels.containerItemIds();
                            __containerItemIds.ItemId = itm.ItemId;
                            _containerItemIds.Add(__containerItemIds);
                        }
                    }
                    if (_item.ContainedIn > 0)
                    {
                        ViewModels.EditModels.containerItemIds __containerItemIds = new ViewModels.EditModels.containerItemIds();
                        __containerItemIds.ItemId = _item.ItemId;
                        _containerItemIds.Add(__containerItemIds);
                    }
                    _itemContainer.ContainerItems = _containerItemIds;

                    decimal TotalWeight = CalculateTotalWeight(_itemContainer);
                    await _itemService.UpdateWeight(_itemContainer.ItemId, TotalWeight);
                }
                ///////////

                if (model.ContainerItems != null)
                {
                    //remove all contains item
                    await _itemService.DeleteContainer(model.ItemId);
                    foreach (var itm in model.ContainerItems)
                    {
                        await _itemService.UpdateContainer(itm.ItemId, model.ItemId);
                    }
                }
                //if (model.IsContainer == true)
                //{
                //    decimal TotalWeight = CalculateTotalWeight(model);
                //    await _itemService.UpdateWeight(model.ItemId, TotalWeight);
                //}

                await this._characterService.UpdateCharacterInventoryWeight(model.CharacterId ?? 0);

                return Ok();
            }

            return BadRequest(Utilities.ModelStateError(ModelState));

        }

        [HttpPost("update")]
        public async Task<IActionResult> Update([FromBody] ItemEditModel model)
        {
            if (ModelState.IsValid)
            {
                int rulesetID = model.Character.RuleSetId == null ? 0 : (int)model.Character.RuleSetId;
                if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
                {
                    return await Core_UpdateItem(model);
                }
                else
                {
                    return await Update_Item_Common(model);
                }                
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        private async Task<IActionResult> Core_UpdateItem(ItemEditModel model)
        {
            try
            {
                await CheckCoreRuleset(model);
                return await Update_Item_Common(model);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private async Task<ItemMaster> CreateItemMasterForCopiedRuleset(ItemEditModel model)
        {            
            return await _coreRulesetService.CreateItemMasterUsingItem((int)model.ItemMasterId,(int)model.Character.RuleSetId);
        }

        private async Task<IActionResult> Update_Item_Common(ItemEditModel model)
        {
            var item = _itemService.GetById(model.ItemId);
            if (item == null) return BadRequest("Item not found");

            model.TotalWeight = model.Quantity * model.Weight;
            var _item = Mapper.Map<Item>(model);            
            var result = await _itemService.UpdateItem(_item, model.ItemSpells, model.ItemAbilities);

            ///////if non-conatiner item remove/update its container
            if (((item.ContainedIn > 0 && result.ContainedIn == 0)
                || (item.ContainedIn == 0 && result.ContainedIn > 0)
                || (item.ContainedIn == result.ContainedIn && result.ContainedIn > 0)) && !model.IsContainer)
            {
                int __itemContainerId = (item.ContainedIn > 0 && result.ContainedIn == 0) ? item.ContainedIn ?? 0
                     : ((item.ContainedIn == 0 && result.ContainedIn > 0) ? result.ContainedIn ?? 0
                     : ((result.ContainedIn > 0) ? result.ContainedIn ?? 0 : 0));

                var containerItem = _itemService.GetById(__itemContainerId);
                var _itemContainer = Mapper.Map<ItemEditModel>(containerItem);

                List<ViewModels.EditModels.containerItemIds> _containerItemIds = new List<ViewModels.EditModels.containerItemIds>();
                foreach (var itm in _itemService.GetByContainerId(containerItem.ItemId))
                {
                    if (itm.ItemId != result.ItemId)
                    {
                        ViewModels.EditModels.containerItemIds __containerItemIds = new ViewModels.EditModels.containerItemIds();
                        __containerItemIds.ItemId = itm.ItemId;
                        _containerItemIds.Add(__containerItemIds);
                    }
                }
                if ((item.ContainedIn == 0 && result.ContainedIn > 0) || (item.ContainedIn == result.ContainedIn))
                {
                    ViewModels.EditModels.containerItemIds __containerItemIds = new ViewModels.EditModels.containerItemIds();
                    __containerItemIds.ItemId = result.ItemId;
                    _containerItemIds.Add(__containerItemIds);
                }
                _itemContainer.ContainerItems = _containerItemIds;

                decimal TotalWeight = CalculateTotalWeight(_itemContainer);
                await _itemService.UpdateWeight(_itemContainer.ItemId, TotalWeight);
            }
            ///////////

            if (model.ItemCommandVM != null)
            {
                //remove all commands
                await _itemCommandService.DeleteItemCommandByItemId(model.ItemId);
                foreach (var command in model.ItemCommandVM)
                {
                    await _itemCommandService.InsertItemCommand(new ItemCommand()
                    {
                        Command = command.Command,
                        Name = command.Name,
                        ItemId = model.ItemId
                    });
                }
            }
            if (model.ContainerItems != null)
            {
                //remove all contains item
                await _itemService.DeleteContainer(model.ItemId);
                foreach (var itm in model.ContainerItems)
                {
                    await _itemService.UpdateContainer(itm.ItemId, model.ItemId);
                }
                //_itemService.ManageContainer(model.ItemId, model.ContainerItems.Select(q => new CommonID { ID=q.ItemId }).ToList());
            }
            if (model.IsContainer == true)
            {
                decimal TotalWeight = CalculateTotalWeight(model);
                await _itemService.UpdateWeight(model.ItemId, TotalWeight);
            }
            await this._characterService.UpdateCharacterInventoryWeight(model.CharacterId ?? 0);

            return Ok();
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> Delete(int id)
        {
            return await DeleteItemCommon(id);
        }

        [HttpPost("delete_up")]
        public async Task<IActionResult> Delete([FromBody] ItemsToDelete data)
        {
            try
            {
                // data.ContainedItemsList.Add(data.item);
                var model = data.item;
                int rulesetID = model.Character.RuleSetId == null ? 0 : (int)model.Character.RuleSetId;
                if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
                {
                    await Core_DeleteItem(model);
                }
                else
                {
                    await DeleteItemCommon(model.ItemId, (int)model.CharacterId);
                }
                foreach (var item in data.ContainedItemsList)
                {
                    var modelF = item;
                    modelF.Character = model.Character;
                    modelF.CharacterId = model.CharacterId;
                    int rulesetIDF = modelF.Character.RuleSetId == null ? 0 : (int)modelF.Character.RuleSetId;
                    if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
                    {
                        await Core_DeleteItem(modelF);
                    }
                    else
                    {
                        await DeleteItemCommon(modelF.ItemId, (int)modelF.CharacterId);
                    }                   
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private async Task<IActionResult> Core_DeleteItem(ItemEditModel model)
        {
            try
            {
                await CheckCoreRuleset(model);
                return await DeleteItemCommon(model.ItemId, (int)model.CharacterId);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private async Task<IActionResult> DeleteItemCommon(int id,int CharacterId=0)
        {
            List<Item> items=null;
            if (CharacterId != 0)
            {
                items = _itemService.GetItemsByCharacterId(CharacterId);
            }
            else
            {
                items = _itemService.GetAll();
            }
               
            foreach (Item item in items)
            {
                if (item.ContainedIn == null) continue;
                else if (item.ContainedIn == id)
                {
                    item.ContainedIn = null;
                    await _itemService.UpdateItem(item, new List<ItemSpell>(), new List<ItemAbility>());
                }
            }
            await _itemService.DeleteItem(id);

            await this._characterService.UpdateCharacterInventoryWeight(CharacterId);

            return Ok();
        }

        [HttpGet("getCountByCharacterId")]
        public async Task<IActionResult> GetCountByCharacterId(int characterId)
        {
            var _items = _itemService.GetCountByCharacterId(characterId);

            if (_items == 0)
                return Ok(0);

            return Ok(_items);
        }
        [HttpGet("GetNestedContainerItems")]
        public async Task<IActionResult> GetNestedContainerItems(int itemid)
        {
           List<Item> items=  _itemService.GetNestedContainerItems(itemid);
            return Ok(items);
        }

        [HttpPost("toggleEquippedItem")]
        public async Task<IActionResult> ToggleEquippedItem(int id)
        {
            _itemService.ToggleEquippedItem(id);

            return Ok();
        }

        [HttpPost("uploadItemImage")]
        public async Task<IActionResult> uploadItemImage()
        {

            if (_httpContextAccessor.HttpContext.Request.Form.Files.Any())
            {
                // Get the uploaded image from the Files collection
                var httpPostedFile = _httpContextAccessor.HttpContext.Request.Form.Files["UploadedImage"];

                if (httpPostedFile != null)
                {
                    try
                    {
                        BlobService bs = new BlobService();
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

        [HttpPost("DuplicateItem")]
        public async Task<IActionResult> DuplicateItem([FromBody] ItemEditModel model)
        {
            if (ModelState.IsValid)
            {
                await CheckCoreRuleset(model);
                return await DuplicateItemCommon(model);
            }

            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        private async Task<int> CheckCoreRuleset(ItemEditModel model)
        {
            int ItemMasterID = model.ItemMasterId == null ? 0 : (int)model.ItemMasterId;
            if (!_coreRulesetService.IsItemCopiedFromCoreRuleset(ItemMasterID, (int)model.Character.RuleSetId))
            {
                int OldParentItemMasterID = ItemMasterID;
                int ItemMasterIDInserted = CreateItemMasterForCopiedRuleset(model).Result.ItemMasterId;
                model.ItemMasterId = ItemMasterIDInserted;
                model.ParentItemId = ItemMasterIDInserted;
              return await _coreRulesetService._updateParentIDForAllRelatedItems((int)model.CharacterId, OldParentItemMasterID, ItemMasterIDInserted, 'I');
            }
            return 0;
        }

        private async Task<IActionResult> DuplicateItemCommon(ItemEditModel model)
        {
            if (_itemService.CheckDuplicateItem(model.Name.Trim(), model.CharacterId).Result)
                return BadRequest("The Item Name " + model.Name + " had already been used. Please select another name.");

            var item = _itemService.GetById(model.ItemId);

            model.ItemId = 0;
            var itemModel = Mapper.Map<Item>(model);
            var result = await _itemService.InsertItem(itemModel, model.ItemSpells, model.ItemAbilities);

            if (model.ItemCommandVM != null)
            {
                foreach (var command in model.ItemCommandVM)
                {
                    if (command.ItemCommandId > 0)
                    {
                        await _itemCommandService.UpdateItemCommand(new ItemCommand()
                        {
                            ItemCommandId = command.ItemCommandId,
                            Command = command.Command,
                            Name = command.Name,
                            ItemId = result.ItemId
                        });
                    }
                    else
                    {
                        await _itemCommandService.InsertItemCommand(new ItemCommand()
                        {
                            Command = command.Command,
                            Name = command.Name,
                            ItemId = result.ItemId
                        });
                    }
                }
            }
            if (model.ContainerItems != null)
            {
                //remove all contains item
                await _itemService.DeleteContainer(result.ItemId);
                foreach (var itm in model.ContainerItems)
                {
                    await _itemService.UpdateContainer(itm.ItemId, result.ItemId);
                }
            }
            await this._characterService.UpdateCharacterInventoryWeight(model.CharacterId ?? 0);

            return Ok();
        }

        [HttpPost("reset")]
        public async Task<ItemListViewModel> Reset([FromBody] ItemEditModel model)
        {

            ItemMaster original = _itemMasterService.GetItemMasterById(model.ItemMasterId);
            //if (original == null) return BadRequest("No original item found");
            //var item = _itemService.GetById(id);

            ItemListViewModel _item = new ItemListViewModel();
            // _item = Mapper.Map<ItemListViewModel>(original);
            _item.ItemId = model.ItemId;
            _item.Name = original.ItemName;
            _item.Description = original.ItemVisibleDesc;
            _item.ItemImage = original.ItemImage;
            _item.ItemMasterId = original.ItemMasterId;
            _item.ItemMaster = original;

            _item.CharacterId = model.CharacterId;
            _item.Quantity = model.Quantity == 0 ? 1 : model.Quantity;
            _item.TotalWeight = model.TotalWeight;
            _item.IsIdentified = model.IsIdentified;
            _item.IsVisible = model.IsVisible;
            _item.IsEquipped = model.IsEquipped;
            _item.ParentItemId = model.ParentItemId;
            _item.IsDeleted = model.IsDeleted;
            _item.ContainedIn = model.ContainedIn;

            _item.IsConsumable = original.IsConsumable;
            _item.IsContainer = original.IsContainer;
            _item.IsMagical = original.IsMagical;
            _item.ItemCalculation = original.ItemCalculation;
            _item.Metatags = original.Metatags;
            _item.Rarity = original.Rarity;
            _item.Value = original.Value;
            _item.Volume = original.Volume;
            _item.Weight = original.Weight;
            _item.Command = original.Command;
            _item.ContainerVolumeMax = original.ContainerVolumeMax;
            _item.ContainerWeightMax = original.ContainerWeightMax;
            _item.ContainerWeightModifier = original.ContainerWeightModifier;
            _item.ItemStats = original.ItemStats;
            _item.PercentReduced = original.PercentReduced;
            _item.TotalWeightWithContents = original.TotalWeightWithContents;

            _item.ItemSpells = model.ItemSpells;
            _item.ItemAbilities = model.ItemAbilities;
            _item.ItemCommandVM = model.ItemCommandVM;

            _item.RuleSet = original.RuleSet;
            return _item;
        }


        //get user id methods
        private string GetUserId()
        {
            string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
            ApplicationUser appUser = _accountManager.GetUserByUserNameAsync(userName).Result;
            return appUser.Id;
        }

        private decimal CalculateTotalWeight(ItemEditModel itemDomain)
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

        [HttpGet("getByCharacterId_sp")]
        public async Task<IActionResult> getByCharacterId_sp(int characterId, int rulesetId, int page = 1, int pageSize = 30)
        {
            dynamic Response = new ExpandoObject();
            (List<Item> itemsList, Character _character, RuleSet _ruleSet) = _itemService.SP_Items_GetByCharacterId(characterId, rulesetId, page, pageSize);

            
            List<ItemListViewModel> ___itemlist = new List<ItemListViewModel>();

            foreach (Item item in itemsList)
            {
                var listobj = new ItemListViewModel();
                listobj = Mapper.Map<ItemListViewModel>(item);
                if (item.ContainedIn != null)
                    listobj.Container = _itemService.GetContainer(item.ContainedIn);
                listobj.ContainerItems = _itemService.GetByContainerId(item.ItemId);
                listobj.RuleSet = item.Character == null ? null : item.Character.RuleSet;

                ___itemlist.Add(listobj);
            }
            
            Response.ItemsList = ___itemlist;
            Response.Character = _character;
            Response.RuleSet = _ruleSet;

            return Ok(Response);
        }

        [HttpGet("AbilitySpellForItemsByRuleset_sp")]
        public async Task<IActionResult> AbilitySpellForItemsByRuleset_sp(int characterId, int rulesetId, int itemId)
        {
            return Ok(_itemService.AbilitySpellForItemsByRuleset_sp(characterId, rulesetId, itemId));
        }

        [HttpGet("getItemCommands_sp")]
        public async Task<IActionResult> getItemCommands_sp(int itemId)
        {
            return Ok(_itemService.SP_GetItemCommands(itemId));
        }

        #endregion
    }
}