using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DAL.Core.Interfaces;
using DAL.Models;
using DAL.Models.CharacterTileModels;
using DAL.Models.SPModels;
using DAL.Services;
using DAL.Services.CharacterTileServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RPGSmithApp.Helpers;
using RPGSmithApp.ViewModels.CreateModels;
using RPGSmithApp.ViewModels.EditModels;
using Enum = RPGSmithApp.Helpers.Enum;

namespace RPGSmithApp.Controllers
{
    [Route("api/[controller]")]
    public class CharatcerTileController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        private readonly ICharacterTileService _tileService;
        private readonly ICharacterStatTileService _characterStatTileService;
        private readonly ICommandTileService _commandTileService;
        private readonly ICounterTileService _counterTileService;
        private readonly IExecuteTileService _executeTileService;
        private readonly IImageTileService _imageTileService;
        private readonly ITextTileService _textTileService;
        private readonly ILinkTileService _linkTileService;
        private readonly INoteTileService _noteTileService;
        private readonly IColorService _colorService;
        private readonly ICharactersCharacterStatService _charactersCharacterStatService;
        private const int heightWidth = 144;

        public CharatcerTileController(IHttpContextAccessor httpContextAccessor, IAccountManager accountManager, 
            ICharacterTileService tileService,
            ICharacterStatTileService characterStatTileService, 
            ICommandTileService commandTileService,
            ICounterTileService counterTileService, 
            IExecuteTileService executeTileService, 
            IImageTileService imageTileService,
            ITextTileService textTileService, 
            ILinkTileService linkTileService, 
            INoteTileService noteTileService, 
            IColorService colorService,
            ICharactersCharacterStatService charactersCharacterStatService)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._accountManager = accountManager;
            this._tileService = tileService;
            this._characterStatTileService = characterStatTileService;
            this._commandTileService = commandTileService;
            this._counterTileService = counterTileService;
            this._executeTileService = executeTileService;
            this._textTileService = textTileService;
            this._linkTileService = linkTileService;
            this._noteTileService = noteTileService;
            this._colorService = colorService;
            this._charactersCharacterStatService = charactersCharacterStatService;
        }

        [HttpGet("GetById")]
        public CharacterTile GetById(int Id)
        {
            return _tileService.GetById(Id);
        }

        [HttpGet("getByPageIdCharacterId")]
        public IEnumerable<CharacterTile> GetByPageIdCharacterId(int pageId, int characterId)
        {
            var result= _tileService.GetByPageIdCharacterId(pageId, characterId);
            foreach (var item in result)
            {
                item.Character.CharacterTiles = null;
                //item.CharacterDashboardPage.Tiles = null;
                //item.CharacterDashboardPage.Character = null;
                //item.Config.CharacterTile.Character = null;
                //item.Config.CharacterTile.CharacterDashboardPage = null;
                //item.Config.CharacterTile.Config = null;
                //item.Character.CharacterDashboardPages = null;
                //item.Character.CharacterSpells = null;
                //item.Character.CharactersCharacterStats = null;
            }
            //var list= Utilities.CleanModel<CharacterTile>(result);
            //return list;
            return result;
        }
        [HttpGet("getByPageIdCharacterId_sp")]
        public object getByPageIdCharacterId_sp(int pageId, int characterId)
        {
            List<CharacterTile> result = _tileService.GetByPageIdCharacterId_sp(pageId, characterId);            
            return new { data = result, characterStatsValues = _tileService.GetCharactersCharacterStats_sp(characterId), statLinkRecords= _charactersCharacterStatService.getLinkTypeRecords(characterId) };
        }
        [HttpGet("getCountByPageIdCharacterId")]
        public async Task<IActionResult> GetCountByPageIdCharacterId(int pageId, int characterId)
        {
            var _items = _tileService.GetCountByPageIdCharacterId(pageId, characterId);
            if (_items == 0) return Ok(0);
            return Ok(_items);
        }

        [HttpGet("getRecentColors")]
        public IEnumerable<TileColor> getRecentColors()
        {
            string userId = GetUserId();
            return _colorService.GetByUserId(userId);
        }
        
        [HttpGet("getRPGCoreColors")]
        public IEnumerable<RPGCoreColor> getRPGCoreColors()
        {
            return _colorService.getRPGCoreColors();
        }

        [HttpPost("create")]
        [ProducesResponseType(200, Type = typeof(string))]
        public async Task<IActionResult> Create([FromBody] CharacterTileCreateModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    List<CharacterTile> tilesList = null;
                    model.LocationX = model.LocationX == 0 ? heightWidth : model.LocationX;
                    model.LocationY = model.LocationY == 0 ? heightWidth : model.LocationY;
                    model.Width = model.Width == 0 ? heightWidth : model.Width;
                    model.Height = model.Height == 0 ? heightWidth : model.Height;

                    var Tile = Mapper.Map<CharacterTile>(model);                                       

                    switch (Tile.TileTypeId)
                    {
                        case (int)Enum.TILES.NOTE:
                            //Add Note Tile 
                            if (model.NoteTile == null)
                                return BadRequest("NoteTile missing in request");

                            await _tileService.Create(Tile);
                            CharacterNoteTile noteTile = model.NoteTile;
                            noteTile.CharacterTileId = Tile.CharacterTileId;
                            //noteTile.Color = Tile.Color;
                            noteTile.Shape = Tile.Shape;
                            Tile.NoteTiles = await _noteTileService.Create(noteTile);
                            SaveColorsAsync(Tile);
                            break;
                        case (int)Enum.TILES.IMAGE:
                            //Add Image Tile 
                            if (model.ImageTile == null)
                                return BadRequest("ImageTile missing in request");

                            await _tileService.Create(Tile);

                            var imageTile = model.ImageTile;
                            imageTile.CharacterTileId = Tile.CharacterTileId;
                            //imageTile.Color = Tile.Color;
                            imageTile.Shape = Tile.Shape;
                            Tile.ImageTiles = await _imageTileService.Create(imageTile);
                            SaveColorsAsync(Tile);
                            break;
                        case (int)Enum.TILES.COUNTER:
                            //Add Counter Tile 
                            if (model.CounterTile == null)
                                return BadRequest("CounterTile missing in request");

                            await _tileService.Create(Tile);

                            var counterTile = model.CounterTile;
                            counterTile.CharacterTileId = Tile.CharacterTileId;
                            //counterTile.Color = Tile.Color;
                            counterTile.Shape = Tile.Shape;
                            Tile.CounterTiles = await _counterTileService.Create(counterTile);
                            SaveColorsAsync(Tile);
                            break;
                        case (int)Enum.TILES.CHARACTERSTAT:
                            //Add Character Stat Tiles 
                            if (model.CharacterStatTile == null)
                                return BadRequest("Character Stat Tile is missing in request");
                            else if (model.MultiCharacterStats == null)
                                return BadRequest("Character Stat Tile is missing in request");
                            else if (model.MultiCharacterStats.Count == 0)
                                return BadRequest("Character Stat Tile is missing in request");

                            foreach(var cStat in model.MultiCharacterStats)
                            {
                                var _newTile = Mapper.Map<CharacterTile>(model);
                                _newTile.Shape = cStat.CharacterStatTypeId == 2 ? (_newTile.Shape == 100 ? 0 : _newTile.Shape) : _newTile.Shape;

                                await _tileService.Create(_newTile);

                                var characterStatTile = model.CharacterStatTile;
                                _newTile.CharacterStatTiles = await _characterStatTileService.Create(new CharacterCharacterStatTile
                                {
                                    CharacterTileId = _newTile.CharacterTileId,
                                    CharactersCharacterStatId = cStat.CharacterStatId,
                                    Shape = cStat.CharacterStatTypeId == 2 ? (_newTile.Shape == 100 ? 0 : _newTile.Shape) : _newTile.Shape,
                                    titleBgColor = characterStatTile.titleBgColor,
                                    titleTextColor = characterStatTile.titleTextColor,
                                    bodyBgColor = characterStatTile.bodyBgColor,
                                    bodyTextColor = characterStatTile.bodyTextColor,
                                    ShowTitle = characterStatTile.ShowTitle
                                });

                                SaveColorsAsync(_newTile);
                                if (tilesList==null)
                                {
                                    tilesList = new List<CharacterTile>();
                                }
                                tilesList.Add(_newTile);
                            }                            
                            
                            break;
                        case (int)Enum.TILES.LINK:                                               
                            List<multiRecord> recList = new List<multiRecord>();
                            if (model.itemIDS.Length > 0)
                            {
                                foreach (var item in model.itemIDS)
                                {
                                    recList.Add(new multiRecord { recId = item, recType = "Item" });
                                }
                            }
                            if (model.spellIDS.Length > 0)
                            {                                
                                foreach (var spell in model.spellIDS)
                                {
                                    recList.Add(new multiRecord { recId = spell, recType = "Spell" });
                                }
                            }
                            if (model.abilityIDS.Length > 0)
                            {
                                foreach (var ability in model.abilityIDS)
                                {
                                    recList.Add(new multiRecord { recId = ability, recType = "Ability" });
                                }
                            }
                            //int[] collectionList = new int[] { };
                            //if (model.LinkTile.LinkType.ToLower() == Enum.LinkType.spell.ToString())
                            //{
                            //    collectionList = model.spellIDS;
                            //}
                            //else if (model.LinkTile.LinkType.ToLower() == Enum.LinkType.ability.ToString()) // "ability")
                            //{
                            //    collectionList = model.abilityIDS;
                            //}
                            //else if (model.LinkTile.LinkType.ToLower() == Enum.LinkType.item.ToString()) // "item")
                            //{
                            //    collectionList = model.itemIDS;
                            //}
                            //collectionList = collectionList.Distinct().ToArray();
                            foreach (var item in recList)
                            {
                                model.LinkTile.LinkType = item.recType;
                                var _newTile = Mapper.Map<CharacterTile>(model);

                                //Add Link Tiles 
                                if (model.LinkTile == null)
                                    return BadRequest("LinkTile missing in request");

                                if (model.LinkTile.LinkType.ToLower() == Enum.LinkType.spell.ToString())
                                {
                                    model.LinkTile.SpellId = item.recId;
                                    if (model.LinkTile.SpellId == null)
                                        return BadRequest("SpellId field is required for LinkTile of Spell type");
                                    model.LinkTile.AbilityId = null;
                                    model.LinkTile.ItemId = null;
                                }
                                else if (model.LinkTile.LinkType.ToLower() == Enum.LinkType.ability.ToString()) // "ability")
                                {
                                    model.LinkTile.AbilityId = item.recId;
                                    if (model.LinkTile.AbilityId == null)
                                        return BadRequest("AbilityId field is required for LinkTile of Ability type");
                                    model.LinkTile.ItemId = null;
                                    model.LinkTile.SpellId = null;
                                }
                                else if (model.LinkTile.LinkType.ToLower() == Enum.LinkType.item.ToString()) // "item")
                                {
                                    model.LinkTile.ItemId = item.recId;
                                    if (model.LinkTile.ItemId == null || model.LinkTile.LinkType == string.Empty)
                                        return BadRequest("ItemId field is required for LinkTile of Item type");
                                    model.LinkTile.AbilityId = null;
                                    model.LinkTile.SpellId = null;
                                }

                                await _tileService.Create(_newTile);

                                var _LinkTile = new CharacterLinkTile()
                                {
                                    AbilityId = model.LinkTile.AbilityId,
                                    BodyBgColor = model.LinkTile.BodyBgColor,
                                    BodyTextColor = model.LinkTile.BodyTextColor,
                                    CharacterTileId = model.LinkTile.CharacterTileId,
                                    ItemId = model.LinkTile.ItemId,
                                    LinkType = model.LinkTile.LinkType,
                                    Shape = model.LinkTile.Shape,
                                    ShowTitle = model.LinkTile.ShowTitle,
                                    SortOrder = model.LinkTile.SortOrder,
                                    SpellId = model.LinkTile.SpellId,
                                    TitleBgColor = model.LinkTile.TitleBgColor,
                                    TitleTextColor = model.LinkTile.TitleTextColor,
                                };

                                var linkTile = _LinkTile;
                                linkTile.CharacterTileId = _newTile.CharacterTileId;
                                //linkTile.Color = Tile.Color;
                                linkTile.Shape = _newTile.Shape;
                                //linkTile.LinkTileId = (int)(model.TileTypeId);
                                _newTile.LinkTiles = await _linkTileService.Create(linkTile);
                                SaveColorsAsync(_newTile);

                                if (tilesList == null)
                                {
                                    tilesList = new List<CharacterTile>();
                                }
                                tilesList.Add(_newTile);
                            }
                            break;
                        case (int)Enum.TILES.EXECUTE:
                            List<multiRecord> recListExe = new List<multiRecord>();
                            if (model.itemIDS.Length > 0)
                            {
                                foreach (var item in model.itemIDS)
                                {
                                    recListExe.Add(new multiRecord { recId = item, recType = "Item" });
                                }
                            }
                            if (model.spellIDS.Length > 0)
                            {
                                foreach (var spell in model.spellIDS)
                                {
                                    recListExe.Add(new multiRecord { recId = spell, recType = "Spell" });
                                }
                            }
                            if (model.abilityIDS.Length > 0)
                            {
                                foreach (var ability in model.abilityIDS)
                                {
                                    recListExe.Add(new multiRecord { recId = ability, recType = "Ability" });
                                }
                            }
                            //int[] EcollectionList = new int[] { };
                            //if (model.ExecuteTile.LinkType.ToLower() == Enum.LinkType.spell.ToString())
                            //{
                            //    EcollectionList = model.spellIDS;
                            //}
                            //else if (model.ExecuteTile.LinkType.ToLower() == Enum.LinkType.ability.ToString()) // "ability")
                            //{
                            //    EcollectionList = model.abilityIDS;
                            //}
                            //else if (model.ExecuteTile.LinkType.ToLower() == Enum.LinkType.item.ToString()) // "item")
                            //{
                            //    EcollectionList = model.itemIDS;
                            //}
                            //EcollectionList = EcollectionList.Distinct().ToArray();
                            foreach (var item in recListExe)
                            {
                                model.ExecuteTile.LinkType = item.recType;
                                var _newTile = Mapper.Map<CharacterTile>(model);

                                //Add Execute Tiles
                                if (model.ExecuteTile == null)
                                    return BadRequest("ExecuteTile missing in request");

                                if (model.ExecuteTile.LinkType.ToLower() == Enum.LinkType.spell.ToString())
                                {
                                    model.ExecuteTile.SpellId = item.recId;
                                    if (model.ExecuteTile.SpellId == null)
                                        return BadRequest("SpellId field is required for ExecuteTile of Spell type");
                                    model.ExecuteTile.AbilityId = null;
                                    model.ExecuteTile.ItemId = null;
                                }
                                else if (model.ExecuteTile.LinkType.ToLower() == Enum.LinkType.ability.ToString())
                                {
                                    model.ExecuteTile.AbilityId = item.recId;
                                    if (model.ExecuteTile.AbilityId == null)
                                        return BadRequest("AbilityId field is required for ExecuteTile of ability type");
                                    model.ExecuteTile.ItemId = null;
                                    model.ExecuteTile.SpellId = null;
                                }
                                else if (model.ExecuteTile.LinkType.ToLower() == Enum.LinkType.item.ToString())
                                {
                                    model.ExecuteTile.ItemId = item.recId;
                                    if (model.ExecuteTile.ItemId == null)
                                        return BadRequest("ItemId field is required for ExecuteTile of Item type");
                                    model.ExecuteTile.AbilityId = null;
                                    model.ExecuteTile.SpellId = null;
                                }

                                if (model.ExecuteTile.CommandId == null)
                                    return BadRequest("CommandId field is required for ExecuteTile");


                                await _tileService.Create(_newTile);

                                var _ExecuteTile = new CharacterExecuteTile()
                                {
                                    AbilityId = model.ExecuteTile.AbilityId,
                                    BodyBgColor = model.ExecuteTile.BodyBgColor,
                                    BodyTextColor = model.ExecuteTile.BodyTextColor,
                                    CharacterTileId = model.ExecuteTile.CharacterTileId,
                                    ItemId = model.ExecuteTile.ItemId,
                                    LinkType = model.ExecuteTile.LinkType,
                                    Shape = model.ExecuteTile.Shape,
                                    ShowTitle = model.ExecuteTile.ShowTitle,
                                    SortOrder = model.ExecuteTile.SortOrder,
                                    SpellId = model.ExecuteTile.SpellId,
                                    TitleBgColor = model.ExecuteTile.TitleBgColor,
                                    TitleTextColor = model.ExecuteTile.TitleTextColor,
                                    CommandId= model.ExecuteTile.CommandId,
                                    
                                };

                                var executeTile = _ExecuteTile;
                                executeTile.CharacterTileId = _newTile.CharacterTileId;
                                //executeTile.Color = Tile.Color;
                                executeTile.Shape = _newTile.Shape;
                                _newTile.ExecuteTiles = await _executeTileService.Create(executeTile);
                                SaveColorsAsync(_newTile);
                                if (tilesList == null)
                                {
                                    tilesList = new List<CharacterTile>();
                                }
                                tilesList.Add(_newTile);
                            }                            
                            break;
                        case (int)Enum.TILES.COMMAND:
                            //Add Command Tile 
                            if (model.CommandTile == null)
                                return BadRequest("CommandTile missing in request");

                            await _tileService.Create(Tile);

                            var commandTile = model.CommandTile;
                            commandTile.CharacterTileId = Tile.CharacterTileId;
                            //commandTile.Color = Tile.Color;
                            commandTile.Shape = Tile.Shape;
                            Tile.CommandTiles = await _commandTileService.Create(commandTile);
                            SaveColorsAsync(Tile);
                            break;
                        case (int)Enum.TILES.TEXT:
                            //Add Text Tile 
                            if (model.TextTile == null)
                                return BadRequest("TextTile missing in request");

                            await _tileService.Create(Tile);

                            var textTile = model.TextTile;
                            textTile.CharacterTileId = Tile.CharacterTileId;
                           
                            textTile.Shape = Tile.Shape;
                            Tile.TextTiles = await _textTileService.Create(textTile);
                            SaveColorsAsync(Tile);
                            break;
                        default:
                            break;
                    }
                    if (tilesList == null)
                    {
                        tilesList = new List<CharacterTile>();
                        tilesList.Add(Tile);
                        return Ok(tilesList);
                    }
                    else
                    {
                        return Ok(tilesList);
                    }                    
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }


            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpPost("update")]
        [ProducesResponseType(200, Type = typeof(string))]
        public async Task<IActionResult> Update([FromBody] CharacterTileEditModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var Tile = Mapper.Map<CharacterTile>(model);

                    switch (Tile.TileTypeId)
                    {
                        case (int)Enum.TILES.NOTE:
                            //Update Note Tile 

                            if (model.NoteTile == null)
                                return BadRequest("NoteTile missing in request");
                            else if (model.NoteTile.NoteTileId == 0)
                                return BadRequest("NoteTileId field is required for NoteTile");

                            await _tileService.Update(Tile);

                            var noteTile = model.NoteTile;
                            noteTile.CharacterTileId = Tile.CharacterTileId;
                            //noteTile.Color = Tile.Color;
                            noteTile.Shape = Tile.Shape;
                            Tile.NoteTiles = await _noteTileService.Update(noteTile);
                            SaveColorsAsync(Tile);
                            break;

                        case (int)Enum.TILES.IMAGE:
                            //Update Image Tile 
                            if (model.ImageTile == null)
                                return BadRequest("ImageTile missing in request");
                            else if (model.ImageTile.ImageTileId == 0)
                                return BadRequest("ImageTileId field is required for ImageTile");

                            await _tileService.Update(Tile);

                            var imageTile = model.ImageTile;
                            imageTile.CharacterTileId = Tile.CharacterTileId;
                            //imageTile.Color = Tile.Color;
                            imageTile.Shape = Tile.Shape;
                            Tile.ImageTiles = await _imageTileService.Update(imageTile);
                            SaveColorsAsync(Tile);
                            break;
                        case (int)Enum.TILES.COUNTER:
                            //Update Counter Tile 
                            if (model.CounterTile == null)
                                return BadRequest("CounterTile missing in request");
                            else if (model.CounterTile.CounterTileId == 0)
                                return BadRequest("CounterTileId field is required for CounterTile");

                            await _tileService.Update(Tile);

                            var counterTile = model.CounterTile;
                            counterTile.CharacterTileId = Tile.CharacterTileId;
                            //counterTile.Color = Tile.Color;
                            counterTile.Shape = Tile.Shape;
                            Tile.CounterTiles = await _counterTileService.Update(counterTile);
                            SaveColorsAsync(Tile);
                            break;
                        case (int)Enum.TILES.CHARACTERSTAT:
                            //Update Character Stat Tiles
                            if (model.CharacterStatTile == null)
                                return BadRequest("CharacterStatTile missing in request");
                            else if (model.CharacterStatTile.CharacterStatTileId == 0)
                                return BadRequest("CharacterStatTileId field is required for CharacterStatTile");

                            await _tileService.Update(Tile);

                            var characterStatTile = model.CharacterStatTile;
                            characterStatTile.CharacterTileId = Tile.CharacterTileId;
                            //characterStatTile.Color = Tile.Color;
                            characterStatTile.Shape = Tile.Shape;
                            Tile.CharacterStatTiles = await _characterStatTileService.Update(characterStatTile);
                            SaveColorsAsync(Tile);
                            break;
                        case (int)Enum.TILES.LINK:
                            //Update  Link Tiles 

                            if (model.LinkTile == null)
                                return BadRequest("LinkTile missing in request");
                            else if (model.LinkTile.LinkTileId == 0)
                                return BadRequest("LinkTileId field is required for LinkTile");
                            else if (model.LinkTile.LinkType == null || model.LinkTile.LinkType == string.Empty)
                                return BadRequest("LinkType field is required for LinkTile");

                            if (model.LinkTile.LinkType.ToLower() == Enum.LinkType.spell.ToString())
                            {
                                if (model.LinkTile.SpellId == null)
                                    return BadRequest("SpellId field is required for LinkTile of Spell type");
                                model.LinkTile.AbilityId = null;
                                model.LinkTile.ItemId = null;
                            }
                            else if (model.LinkTile.LinkType.ToLower() == Enum.LinkType.ability.ToString()) // "ability")
                            {
                                if (model.LinkTile.AbilityId == null)
                                    return BadRequest("AbilityId field is required for LinkTile of Ability type");
                                model.LinkTile.ItemId = null;
                                model.LinkTile.SpellId = null;
                            }
                            else if (model.LinkTile.LinkType.ToLower() == Enum.LinkType.item.ToString()) // "item")
                            {
                                if (model.LinkTile.ItemId == null || model.LinkTile.LinkType == string.Empty)
                                    return BadRequest("ItemId field is required for LinkTile of Item type");
                                model.LinkTile.AbilityId = null;
                                model.LinkTile.SpellId = null;
                            }

                            await _tileService.Update(Tile);

                            var linkTile = model.LinkTile;
                            linkTile.CharacterTileId = Tile.CharacterTileId;
                            //linkTile.Color = Tile.Color;
                            linkTile.Shape = Tile.Shape;
                            Tile.LinkTiles = await _linkTileService.Update(linkTile);
                            SaveColorsAsync(Tile);
                            break;
                        case (int)Enum.TILES.EXECUTE:
                            //Add Execute iles

                            if (model.ExecuteTile == null)
                                return BadRequest("ExecuteTile missing in request");
                            else if (model.ExecuteTile.ExecuteTileId == 0)
                                return BadRequest("ExecuteTileId field is required for ExecuteTile");
                            else if (model.ExecuteTile.LinkType == null || model.ExecuteTile.LinkType == string.Empty)
                                return BadRequest("LinkType field is required for ExecuteTile");

                            if (model.ExecuteTile.LinkType.ToLower() == Enum.LinkType.spell.ToString())
                            {
                                if (model.ExecuteTile.SpellId == null)
                                    return BadRequest("SpellId field is required for ExecuteTile of Spell type");
                                model.ExecuteTile.AbilityId = null;
                                model.ExecuteTile.ItemId = null;
                            }
                            else if (model.ExecuteTile.LinkType.ToLower() == Enum.LinkType.ability.ToString())
                            {
                                if (model.ExecuteTile.AbilityId == null)
                                    return BadRequest("AbilityId field is required for ExecuteTile of ability type");
                                model.ExecuteTile.ItemId = null;
                                model.ExecuteTile.SpellId = null;
                            }
                            else if (model.ExecuteTile.LinkType.ToLower() == Enum.LinkType.item.ToString())
                            {
                                if (model.ExecuteTile.ItemId == null)
                                    return BadRequest("ItemId field is required for ExecuteTile of Item type");
                                model.ExecuteTile.AbilityId = null;
                                model.ExecuteTile.SpellId = null;
                            }

                            if (model.ExecuteTile.CommandId == null)
                                return BadRequest("CommandId field is required for ExecuteTile");

                            await _tileService.Update(Tile);

                            var executeTile = model.ExecuteTile;
                            executeTile.CharacterTileId = Tile.CharacterTileId;
                            //executeTile.Color = Tile.Color;
                            executeTile.Shape = Tile.Shape;
                            Tile.ExecuteTiles = await _executeTileService.Update(executeTile);
                            SaveColorsAsync(Tile);
                            break;
                        case (int)Enum.TILES.COMMAND:
                            //Update Command Tile 
                            if (model.CommandTile == null)
                                return BadRequest("CommandTile missing in request");
                            else if (model.CommandTile.CommandTileId == 0)
                                return BadRequest("CommandTileId field is required for Command Tile");

                            await _tileService.Update(Tile);

                            var commandTile = model.CommandTile;
                            commandTile.CharacterTileId = Tile.CharacterTileId;
                           // commandTile.Color = Tile.Color;
                            commandTile.Shape = Tile.Shape;
                            Tile.CommandTiles = await _commandTileService.Update(commandTile);
                            SaveColorsAsync(Tile);
                            break;
                        case (int)Enum.TILES.TEXT:
                            //Update Text Tile 
                            if (model.TextTile == null)
                                return BadRequest("TextTile missing in request");
                            else if (model.TextTile.TextTileId == 0)
                                return BadRequest("TextTileId field is required for TextTile");

                            await _tileService.Update(Tile);

                            var textTile = model.TextTile;
                            textTile.CharacterTileId = Tile.CharacterTileId;
                            textTile.Shape = Tile.Shape;
                            Tile.TextTiles = await _textTileService.Update(textTile);
                            SaveColorsAsync(Tile);
                            break;
                        default:
                            break;
                    }
                    return Ok(Tile);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }

            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> Delete(int id)
        {
            if (id == 0)
                return BadRequest("Please provide valid id");

            try
            {
                await _tileService.Delete(id);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok();

        }

        private async void SaveColorsAsync(CharacterTile Tile)
        {
            try
            {
                TileColor _tileColor = new TileColor();
                _tileColor.CreatedBy = GetUserId();
                _tileColor.CreatedDate = DateTime.Now;
                _tileColor.CharacterTileId = Tile.CharacterTileId;

                switch (Tile.TileTypeId)
                {
                    case (int)Enum.TILES.NOTE:                       
                        _tileColor.BodyBgColor = Tile.NoteTiles.BodyBgColor;
                        _tileColor.BodyTextColor = Tile.NoteTiles.BodyTextColor;
                        _tileColor.TitleBgColor= Tile.NoteTiles.TitleBgColor;
                        _tileColor.TitleTextColor= Tile.NoteTiles.TitleTextColor;
                        break;
                    case (int)Enum.TILES.IMAGE:
                        _tileColor.BodyBgColor = Tile.ImageTiles.BodyBgColor;
                        _tileColor.BodyTextColor = Tile.ImageTiles.BodyTextColor;
                        _tileColor.TitleBgColor = Tile.ImageTiles.TitleBgColor;
                        _tileColor.TitleTextColor = Tile.ImageTiles.TitleTextColor;
                        break;
                    case (int)Enum.TILES.COUNTER:
                        _tileColor.BodyBgColor = Tile.CounterTiles.BodyBgColor;
                        _tileColor.BodyTextColor = Tile.CounterTiles.BodyTextColor;
                        _tileColor.TitleBgColor = Tile.CounterTiles.TitleBgColor;
                        _tileColor.TitleTextColor = Tile.CounterTiles.TitleTextColor;
                        break;
                    case (int)Enum.TILES.CHARACTERSTAT:
                        _tileColor.BodyBgColor = Tile.CharacterStatTiles.bodyBgColor;
                        _tileColor.BodyTextColor = Tile.CharacterStatTiles.bodyTextColor;
                        _tileColor.TitleBgColor = Tile.CharacterStatTiles.titleBgColor;
                        _tileColor.TitleTextColor = Tile.CharacterStatTiles.titleTextColor;
                        break;
                    case (int)Enum.TILES.LINK:
                        _tileColor.BodyBgColor = Tile.LinkTiles.BodyBgColor;
                        _tileColor.BodyTextColor = Tile.LinkTiles.BodyTextColor;
                        _tileColor.TitleBgColor = Tile.LinkTiles.TitleBgColor;
                        _tileColor.TitleTextColor = Tile.LinkTiles.TitleTextColor;
                        break;
                    case (int)Enum.TILES.EXECUTE:
                        _tileColor.BodyBgColor = Tile.ExecuteTiles.BodyBgColor;
                        _tileColor.BodyTextColor = Tile.ExecuteTiles.BodyTextColor;
                        _tileColor.TitleBgColor = Tile.ExecuteTiles.TitleBgColor;
                        _tileColor.TitleTextColor = Tile.ExecuteTiles.TitleTextColor;
                        break;
                    case (int)Enum.TILES.COMMAND:
                        _tileColor.BodyBgColor = Tile.CommandTiles.BodyBgColor;
                        _tileColor.BodyTextColor = Tile.CommandTiles.BodyTextColor;
                        _tileColor.TitleBgColor = Tile.CommandTiles.TitleBgColor;
                        _tileColor.TitleTextColor = Tile.CommandTiles.TitleTextColor;
                        break;
                    case (int)Enum.TILES.TEXT:
                        _tileColor.BodyBgColor = Tile.TextTiles.BodyBgColor;
                        _tileColor.BodyTextColor = Tile.TextTiles.BodyTextColor;
                        _tileColor.TitleBgColor = Tile.TextTiles.TitleBgColor;
                        _tileColor.TitleTextColor = Tile.TextTiles.TitleTextColor;
                        break;
                    default: break;
                }

                //save colors
                if (_tileColor.TitleTextColor != null && _tileColor.BodyTextColor != null)
                   await _colorService.Create(_tileColor);
            }
            catch (Exception ex)
            { }
        }

        private string GetUserId()
        {
            string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
            ApplicationUser appUser = _accountManager.GetUserByUserNameAsync(userName).Result;
            return appUser.Id;
        }
        [HttpGet("allReadyHaveColor")]
        public Boolean allReadyHaveColor(string userId)
        {
          return  _colorService.ColorExixtsForUser(userId);
        }
        //[HttpGet("GetCharactersCharacterStats_sp")]
        //public SP_CharactersCharacterStat GetCharactersCharacterStats_sp(int characterId)
        //{
        //    SP_CharactersCharacterStat model = _tileService.GetCharactersCharacterStats_sp(characterId);
        //    //return result;
        //    return model;
        //}

        [HttpPost("deleteTileList")]
        [ProducesResponseType(200, Type = typeof(string))]
        public async Task<IActionResult> deleteTileList([FromBody] List<int> tileIds)
        {
            foreach (var id in tileIds)
            {
                await Delete(id);
            }
            return Ok();
        }
    }
}