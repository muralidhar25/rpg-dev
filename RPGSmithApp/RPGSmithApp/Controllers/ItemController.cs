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
        private readonly IItemMasterBundleService _itemMasterBundleService;
        private readonly ICampaignService _campaignService;
        private readonly IRuleSetService _rulesetService;
        private readonly IMonsterTemplateService _monsterTemplateService;


        public ItemController(IHttpContextAccessor httpContextAccessor, IAccountManager accountManager,
            IItemService itemService, IItemCommandService itemCommandService,
            IItemMasterService itemMasterService, ICharacterService characterService, ICoreRuleset coreRulesetService,
            IItemMasterBundleService itemMasterBundleService, ICampaignService campaignService, IRuleSetService rulesetService,
            IMonsterTemplateService monsterTemplateService)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._accountManager = accountManager;
            this._itemService = itemService;
            this._itemMasterService = itemMasterService;
            this._characterService = characterService;
            this._itemCommandService = itemCommandService;
            this._coreRulesetService = coreRulesetService;
            this._itemMasterBundleService = itemMasterBundleService;
            this._campaignService = campaignService;
            this._rulesetService = rulesetService;
            this._monsterTemplateService = monsterTemplateService;
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
        [HttpGet("getItemByCharacterId")] //to bind listing of records on Link/execute records on tile and character stat screen 
        public IEnumerable<ItemListViewModel> getItemByCharacterId(int characterId)
        {
            var items = _itemService.getItemByCharacterId(characterId);

            if (items == null || items.Count == 0)
                return new List<ItemListViewModel>();

            List<ItemListViewModel> itemlist = new List<ItemListViewModel>();
            itemlist = Mapper.Map<List<ItemListViewModel>>(items);
            //foreach (Item item in items)
            //{
            //    var listobj = new ItemListViewModel();
            //    listobj = Mapper.Map<ItemListViewModel>(item);  
            //    itemlist.Add(listobj);
            //}
          
            return itemlist;
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
                else if (item.ContainedIn == null || item.ContainedIn == 0 || item.ContainedIn== itemId)
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
        [HttpGet("getAvailableMonsterContainerItems")]
        public IEnumerable<ItemMasterMonsterItem> getAvailableMonsterContainerItems(int rulesetId, int itemId)
        {
            List<ItemMasterMonsterItem> items = _itemService.getAvailableMonsterContainerItems(rulesetId, itemId);

            if (items == null || items.Count == 0)
                return new List<ItemMasterMonsterItem>();

            return items;
        }

        [HttpPost("add")]
        public async Task<IActionResult> Add([FromBody] ItemViewModel_AddItems_With_Qty model)
        {
            if (ModelState.IsValid)
            {
                await _itemService.AddItemsSP(model.MultiItemMasters, model.MultiItemMasterBundles, model.CharacterId == null ? 0 : (int)model.CharacterId,false);
                //foreach (var item in model.MultiItemMasters)
                //{
                //    await AddItemToCharacter(model, item);
                //}
                //List<ItemMasterBundleItem> itemMastersListInBundles =_itemMasterBundleService.GetItemMasterIdsFromBundles(model.MultiItemMasterBundles);
                //foreach (var item in itemMastersListInBundles)
                //{                    
                //    if (item.ItemMasterId!=null)
                //    {
                //        model.Quantity = item.Quantity;
                //        await AddItemToCharacter(model, (new ItemMasterIds() { ItemMasterId = (int)item.ItemMasterId }));
                //    }
                
                //}
                await this._characterService.UpdateCharacterInventoryWeight(model.CharacterId ?? 0);
                return Ok();
            }

            return BadRequest(Utilities.ModelStateError(ModelState));

        }

        [HttpPost("addLootItems")]
        public async Task<IActionResult> AddLootItems([FromBody] ItemViewModel model)
        {
            //if (ModelState.IsValid)
            //{
                List<ItemMasterIds> itemMasterIds = new List<ItemMasterIds>();
                string itemNames = string.Empty;
                List<ItemMasterLoot> loots = await _itemMasterService.getMultipleLootDetails(model.MultiLootIds.Select(x=>x.LootId).ToList());
                foreach (var item in loots)
                {
                    ItemMasterLoot loot = item;
                    //if (loot != null)
                    //{
                        if (loot.IsShow)
                        {
                            itemMasterIds.Add(new ItemMasterIds() { ItemMasterId = loot.LootId });
                            //await AddItemToCharacter(model, new ItemMasterIds() { ItemMasterId = loot.ItemMasterId }, loot);
                            //await _itemMasterService.DeleteItemMasterLoot(loot.LootId);
                        }
                        else
                        {
                            itemNames += loot.ItemMaster.ItemName + ", ";
                        }
                    //}
                    //else {
                    //    if (model.MultiLootIds.Where(x => x.LootId == item.LootId).Any())
                    //    {
                    //        itemNames += model.MultiLootIds.Where(x => x.LootId == item.LootId).FirstOrDefault().Name + ", ";
                    //    }                        
                    //}                    
                }
                foreach (var item in model.MultiLootIds)
                {
                    if (!loots.Where(x=>x.LootId==item.LootId).Any())
                    {
                        itemNames += item.Name + ", ";
                    }
                }

                if (itemMasterIds.Any())
                {
                var item_with_qty = itemMasterIds.Select(x => new ItemMasterIds_With_Qty() { ItemMasterId = x.ItemMasterId, Qty = 1 }).ToList();
                    await _itemService.AddItemsSP(item_with_qty, new List<ItemMasterBundleIds>(), model.CharacterId == null ? 0 : (int)model.CharacterId, true);
                }
                

                await this._characterService.UpdateCharacterInventoryWeight(model.CharacterId ?? 0);
                if (!string.IsNullOrEmpty(itemNames))
                {
                    itemNames = itemNames.Substring(0, itemNames.Length - 2);
                    if (itemNames.Contains(","))
                    {
                        return Ok(new {success=true,message= "The " + itemNames + " items are no longer available" });
                    }
                    else {
                        return Ok(new { success = true, message = "The " + itemNames + " item is no longer available" });
                    }
                }
                
                return Ok(new { success = true, message = string.Empty});
            //}

            //return BadRequest(Utilities.ModelStateError(ModelState));

        }

        private async Task AddItemToCharacter(ItemViewModel model, ItemMasterIds item, ItemMasterLoot Loot=null)
        {
            //count += 1;
            var ItemTemplate = _itemMasterService.GetItemMasterById(item.ItemMasterId);
            if (Loot!=null)
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
            var ItemBuffAndEffects = new List<ItemBuffAndEffect>();
            foreach (var be in ItemTemplate.itemMasterBuffAndEffects)
            {
                ItemBuffAndEffects.Add(new ItemBuffAndEffect
                {
                    BuffAndEffectId = be.BuffAndEffectId
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
            ItemAbilities, ItemBuffAndEffects, ItemCommands);
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

                var result = await _itemService.InsertItem(_item, model.ItemSpells, model.ItemAbilities,model.ItemBuffAndEffects);

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
        [HttpPost("updateMonster")]
        public async Task<IActionResult> updateMonster([FromBody] ItemEditModel model)
        {
            if (ModelState.IsValid)
            {

                var item = _monsterTemplateService.GetMonsterItemDetailByItemId(model.ItemId);
                if (item == null) return BadRequest("Item not found");

                model.TotalWeight = model.Quantity * model.Weight;
                var _item = new ItemMasterMonsterItem()
                {ItemId=model.ItemId,
                    ContainedIn = model.ContainedIn,
                    Quantity = model.Quantity,
                    TotalWeight = model.TotalWeight,
                    IsIdentified = model.IsIdentified,
                    IsEquipped = model.IsEquipped,
                    IsVisible = model.IsVisible,

                    ItemName = model.Name,
                    ItemVisibleDesc = model.Description,
                    ItemImage = model.ItemImage,


                    IsContainer = model.IsContainer,

                    IsConsumable = model.IsConsumable,
                    IsMagical = model.IsMagical,
                    ItemCalculation = model.ItemCalculation,
                    Metatags = model.Metatags,
                    Rarity = model.Rarity,
                    Value = model.Value,
                    Volume = model.Volume,
                    Weight = model.Weight,
                    Command = model.Command,

                    ItemStats = model.ItemStats,
                    ContainerWeightMax = model.ContainerWeightMax,
                    ContainerVolumeMax = model.ContainerVolumeMax,
                    PercentReduced = model.PercentReduced,
                    TotalWeightWithContents = model.TotalWeightWithContents,
                    ContainerWeightModifier = model.ContainerWeightModifier,
                    CommandName = model.CommandName,
                };
                var result = _itemService.UpdateMonsterItem(_item, model.ItemSpells, model.ItemAbilities, model.ItemBuffAndEffects, model.ItemCommandVM);

                /////////if non-conatiner item remove/update its container
                //if (((item.ContainedIn > 0 && result.ContainedIn == 0)
                //    || (item.ContainedIn == 0 && result.ContainedIn > 0)
                //    || (item.ContainedIn == result.ContainedIn && result.ContainedIn > 0)) && !model.IsContainer)
                //{
                //    int __itemContainerId = (item.ContainedIn > 0 && result.ContainedIn == 0) ? item.ContainedIn ?? 0
                //         : ((item.ContainedIn == 0 && result.ContainedIn > 0) ? result.ContainedIn ?? 0
                //         : ((result.ContainedIn > 0) ? result.ContainedIn ?? 0 : 0));

                //    var containerItem = _itemMasterService.getMonsterItemById(__itemContainerId);
                //    var _itemContainer = Mapper.Map<ItemEditModel>(containerItem);

                //    List<ViewModels.EditModels.containerItemIds> _containerItemIds = new List<ViewModels.EditModels.containerItemIds>();
                //    foreach (var itm in _itemService.GetByContainerId(containerItem.ItemId))
                //    {
                //        if (itm.ItemId != result.ItemId)
                //        {
                //            ViewModels.EditModels.containerItemIds __containerItemIds = new ViewModels.EditModels.containerItemIds();
                //            __containerItemIds.ItemId = itm.ItemId;
                //            _containerItemIds.Add(__containerItemIds);
                //        }
                //    }
                //    if ((item.ContainedIn == 0 && result.ContainedIn > 0) || (item.ContainedIn == result.ContainedIn))
                //    {
                //        ViewModels.EditModels.containerItemIds __containerItemIds = new ViewModels.EditModels.containerItemIds();
                //        __containerItemIds.ItemId = result.ItemId;
                //        _containerItemIds.Add(__containerItemIds);
                //    }
                //    _itemContainer.ContainerItems = _containerItemIds;

                //    decimal TotalWeight = CalculateTotalWeight(_itemContainer);
                //    await _itemService.UpdateWeight(_itemContainer.ItemId, TotalWeight);
                //}
                /////////////

                //if (model.ItemCommandVM != null)
                //{
                //    //remove all commands
                //    await _itemCommandService.DeleteItemCommandByItemId(model.ItemId);
                //    foreach (var command in model.ItemCommandVM)
                //    {
                //        await _itemCommandService.InsertItemCommand(new ItemCommand()
                //        {
                //            Command = command.Command,
                //            Name = command.Name,
                //            ItemId = model.ItemId
                //        });
                //    }
                //}
                //if (model.ContainerItems != null)
                //{
                //    //remove all contains item
                //    await _itemService.DeleteContainer(model.ItemId);
                //    foreach (var itm in model.ContainerItems)
                //    {
                //        await _itemService.UpdateContainer(itm.ItemId, model.ItemId);
                //    }
                //    //_itemService.ManageContainer(model.ItemId, model.ContainerItems.Select(q => new CommonID { ID=q.ItemId }).ToList());
                //}
                //if (model.IsContainer == true)
                //{
                //    decimal TotalWeight = CalculateTotalWeight(model);
                //    await _itemService.UpdateWeight(model.ItemId, TotalWeight);
                //}
                //await this._characterService.UpdateCharacterInventoryWeight(model.CharacterId ?? 0);

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
            var result = await _itemService.UpdateItem(_item, model.ItemSpells, model.ItemAbilities, model.ItemBuffAndEffects);

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

                LootPileViewModel characterLootPile = _itemMasterService.getCharacterLootPile(model.CharacterId==null?0:(int)model.CharacterId);

                var currentUser = GetUser();
                if (currentUser.IsGm || currentUser.IsGmPermanent)
                {
                    _itemService.AddItemToLoot(model.ItemId, characterLootPile.LootId);
                }
                else if (await _campaignService.isInvitedPlayerCharacter((int)model.CharacterId))
                {
                    _itemService.AddItemToLoot(model.ItemId, characterLootPile.LootId);
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
                    //var currentUser = GetUser();
                    if (currentUser.IsGm || currentUser.IsGmPermanent)
                    {
                        _itemService.AddItemToLoot(modelF.ItemId, characterLootPile.LootId);
                    }
                    else if (await _campaignService.isInvitedPlayerCharacter((int)modelF.CharacterId))
                    {
                        _itemService.AddItemToLoot(modelF.ItemId, characterLootPile.LootId);
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
                    await _itemService.UpdateItem(item, new List<ItemSpell>(), new List<ItemAbility>(),new List<ItemBuffAndEffect>());
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

        [HttpPost("Toggle_Show_Hide_Item")]
        public async Task<IActionResult> Toggle_Show_Hide_Item(int id)
        {
            _itemService.Toggle_Show_Hide_Item(id);

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
                        BlobService bs = new BlobService(_httpContextAccessor, _accountManager,_rulesetService);
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
            var result = await _itemService.InsertItem(itemModel, model.ItemSpells, model.ItemAbilities,model.ItemBuffAndEffects);

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
            _item.gmOnly = original.gmOnly;
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
        private ApplicationUser GetUser()
        {
            string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
            ApplicationUser appUser = _accountManager.GetUserByUserNameAsync(userName).Result;
            return appUser;
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
        public async Task<IActionResult> getByCharacterId_sp(int characterId, int rulesetId, int page = 1, int pageSize = 30,int sortType=1)
        {
            dynamic Response = new ExpandoObject();
            (CharacterItemWithFilterCount result, Character _character, RuleSet _ruleSet) = _itemService.SP_Items_GetByCharacterId(characterId, rulesetId, page, pageSize, sortType);
            var itemsList = result.items;


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
            Response.FilterAplhabetCount = result.FilterAplhabetCount;
            Response.FilterUnContainedCount = result.FilterUnContainedCount;
            Response.FilterEquippedCount = result.FilterEquippedCount;
            Response.FilterVisibleCount = result.FilterVisibleCount;

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
        [HttpPost("DropMultipleItems")]
        public async Task<IActionResult> DropMultiItems([FromBody] List<Item> model, int DropToLootPileId, int rulesetId, int CharacterId)
        {
            try
            {
                _itemService.DropMultiItems(model, DropToLootPileId, rulesetId,CharacterId,GetUser());
                await this._characterService.UpdateCharacterInventoryWeight(CharacterId);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("ReduceItemQty")]
        public async Task<IActionResult> ReduceItemQty(int ItemId)
        {
            try
            {
                decimal qty = _itemService.ReduceItemQty(ItemId);
                return Ok(qty);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }



        [HttpPost("GivePlayerItems")]
        public async Task<IActionResult> GivePlayerItems([FromBody] GiveItemsFromPlayerCombat model, int givenByPlayerID, int ruleSetId)
        {
            try
            {
                _itemService.GivePlayerItems(model, givenByPlayerID, ruleSetId);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        #endregion
    }
}