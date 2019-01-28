using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DAL.Core.Interfaces;
using DAL.Models;
using DAL.Models.RulesetTileModels;
using DAL.Services.RulesetTileServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RPGSmithApp.Helpers;
using RPGSmithApp.ViewModels.CreateModels;
using RPGSmithApp.ViewModels.EditModels;
using Enum = RPGSmithApp.Helpers.Enum;

namespace RPGSmithApp.Controllers
{
    [Route("api/[controller]")]
    public class RulesetTileController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        private readonly IRulesetTileService _tileService;
        private readonly IRulesetCharacterStatTileService _characterStatTileService;
        private readonly IRulesetCommandTileService _commandTileService;
        private readonly IRulesetCounterTileService _counterTileService;
        private readonly IRulesetImageTileService _imageTileService;
        private readonly IRulesetTextTileService _textTileService;
        private readonly IRulesetNoteTileService _noteTileService;
        private readonly IRulesetTileColorService _colorService;
        private const int heightWidth = 144;

        public RulesetTileController(IHttpContextAccessor httpContextAccessor, IAccountManager accountManager,
            IRulesetTileService tileService,
            IRulesetCharacterStatTileService characterStatTileService,
            IRulesetCommandTileService commandTileService,
            IRulesetCounterTileService counterTileService,
            IRulesetImageTileService imageTileService,
            IRulesetTextTileService textTileService,
            IRulesetNoteTileService noteTileService,
            IRulesetTileColorService colorService)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._accountManager = accountManager;
            this._tileService = tileService;
            this._characterStatTileService = characterStatTileService;
            this._commandTileService = commandTileService;
            this._counterTileService = counterTileService;
            this._imageTileService = imageTileService;
            this._textTileService = textTileService;
            this._noteTileService = noteTileService;
            this._colorService = colorService;
        }

        [HttpGet("GetById")]
        public RulesetTile GetById(int Id)
        {
            return _tileService.GetById(Id);
        }

        [HttpGet("getByPageIdRulesetId")]
        public IEnumerable<RulesetTile> GetByPageIdRulesetId(int pageId, int RulesetId)
        {
            return _tileService.GetByPageIdRulesetId(pageId, RulesetId);
        }
        [HttpGet("getByPageIdRulesetId_sp")]
        public IEnumerable<RulesetTile> GetByPageIdRulesetId_sp(int pageId, int RulesetId)
        {
            return _tileService.GetByPageIdRulesetId_sp(pageId, RulesetId);
        }

        [HttpGet("getCountByPageIdRulesetId")]
        public async Task<IActionResult> GetCountByPageIdRulesetId(int pageId, int RulesetId)
        {
            var _items = _tileService.GetCountByPageIdRulesetId(pageId, RulesetId);
            if (_items == 0) return Ok(0);
            return Ok(_items);
        }

        [HttpGet("getRecentColors")]
        public IEnumerable<RulesetTileColor> getRecentColors()
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
        public async Task<IActionResult> Create([FromBody] RulesetTileCreateModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    List<RulesetTile> tilesList = null;
                    model.LocationX = model.LocationX == 0 ? heightWidth : model.LocationX;
                    model.LocationY = model.LocationY == 0 ? heightWidth : model.LocationY;
                    model.Width = model.Width == 0 ? heightWidth : model.Width;
                    model.Height = model.Height == 0 ? heightWidth : model.Height;

                    var Tile = Mapper.Map<RulesetTile>(model);                                       

                    switch (Tile.TileTypeId)
                    {
                        case (int)Enum.TILES.NOTE:
                            //Add Note Tile 
                            if (model.NoteTile == null)
                                return BadRequest("NoteTile missing in request");

                            await _tileService.Create(Tile);
                            RulesetNoteTile noteTile = model.NoteTile;
                            noteTile.RulesetTileId = Tile.RulesetTileId;
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
                            imageTile.RulesetTileId = Tile.RulesetTileId;
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
                            counterTile.RulesetTileId = Tile.RulesetTileId;
                            //counterTile.Color = Tile.Color;
                            counterTile.Shape = Tile.Shape;
                            Tile.CounterTiles = await _counterTileService.Create(counterTile);
                            SaveColorsAsync(Tile);
                            break;
                        case (int)Enum.TILES.CHARACTERSTAT:
                            //Add Character Stat Tiles 
                            if (model.CharacterStatTile == null)
                                return BadRequest("CharacterStatTile missing in request");
                            else if (model.MultiCharacterStats == null)
                                return BadRequest("Character Stat Tile is missing in request");
                            else if (model.MultiCharacterStats.Count == 0)
                                return BadRequest("Character Stat Tile is missing in request");

                            foreach (var cStat in model.MultiCharacterStats)
                            {
                                var _newTile = Mapper.Map<RulesetTile>(model);
                                _newTile.Shape = cStat.CharacterStatTypeId == 2 ? (_newTile.Shape == 100 ? 0 : _newTile.Shape) : _newTile.Shape;

                                await _tileService.Create(_newTile);

                                var characterStatTile = model.CharacterStatTile;
                                _newTile.CharacterStatTiles = await _characterStatTileService.Create(new RulesetCharacterStatTile
                                {
                                    RulesetTileId = _newTile.RulesetTileId,
                                    CharacterStatId = cStat.CharacterStatId,
                                    Shape = cStat.CharacterStatTypeId == 2 ? (_newTile.Shape == 100 ? 0 : _newTile.Shape) : _newTile.Shape,
                                    titleBgColor = characterStatTile.titleBgColor,
                                    titleTextColor = characterStatTile.titleTextColor,
                                    bodyBgColor = characterStatTile.bodyBgColor,
                                    bodyTextColor = characterStatTile.bodyTextColor,
                                    ShowTitle = characterStatTile.ShowTitle
                                });

                                SaveColorsAsync(_newTile);
                                if (tilesList == null)
                                {
                                    tilesList = new List<RulesetTile>();
                                }
                                tilesList.Add(_newTile);
                            }
                            
                            break;
                        case (int)Enum.TILES.LINK:
                            //Add Link Tiles                             
                            break;
                        case (int)Enum.TILES.EXECUTE:
                            //Add Execute Tiles
                            break;
                        case (int)Enum.TILES.COMMAND:
                            //Add Command Tile 
                            if (model.CommandTile == null)
                                return BadRequest("CommandTile missing in request");

                            await _tileService.Create(Tile);

                            var commandTile = model.CommandTile;
                            commandTile.RulesetTileId = Tile.RulesetTileId;
                            //commandTile.Color = Tile.Color;
                            commandTile.Shape = Tile.Shape;
                            Tile.CommandTiles = await _commandTileService.Create(commandTile);
                            SaveColorsAsync(Tile);
                            break;
                        case (int)Enum.TILES.TEXT:
                            //Add Image Tile 
                            if (model.TextTile == null)
                                return BadRequest("ImageTile missing in request");

                            await _tileService.Create(Tile);

                            var textTile = model.TextTile;
                            textTile.RulesetTileId = Tile.RulesetTileId;
                            //imageTile.Color = Tile.Color;
                            textTile.Shape = Tile.Shape;
                            Tile.TextTiles = await _textTileService.Create(textTile);
                            SaveColorsAsync(Tile);
                            break;
                        default:
                            break;
                    }               
                    if (tilesList == null)
                    {
                        tilesList = new List<RulesetTile>();
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
        public async Task<IActionResult> Update([FromBody] RulesetTileEditModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var Tile = Mapper.Map<RulesetTile>(model);

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
                            noteTile.RulesetTileId = Tile.RulesetTileId;
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
                            imageTile.RulesetTileId = Tile.RulesetTileId;
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
                            counterTile.RulesetTileId = Tile.RulesetTileId;
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
                            characterStatTile.RulesetTileId = Tile.RulesetTileId;
                            //characterStatTile.Color = Tile.Color;
                            characterStatTile.Shape = Tile.Shape;
                            Tile.CharacterStatTiles = await _characterStatTileService.Update(characterStatTile);
                            SaveColorsAsync(Tile);
                            break;
                        case (int)Enum.TILES.LINK:
                            //Update  Link Tiles 
                            break;
                        case (int)Enum.TILES.EXECUTE:
                            //Add Execute iles
                            break;
                        case (int)Enum.TILES.COMMAND:
                            //Update Command Tile 
                            if (model.CommandTile == null)
                                return BadRequest("CommandTile missing in request");
                            else if (model.CommandTile.CommandTileId == 0)
                                return BadRequest("CommandTileId field is required for Command Tile");

                            await _tileService.Update(Tile);

                            var commandTile = model.CommandTile;
                            commandTile.RulesetTileId = Tile.RulesetTileId;
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

                            var TextTile = model.TextTile;
                            TextTile.RulesetTileId = Tile.RulesetTileId;
                            TextTile.Shape = Tile.Shape;
                            Tile.TextTiles = await _textTileService.Update(TextTile);
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

        private async void SaveColorsAsync(RulesetTile Tile)
        {
            try
            {
                RulesetTileColor _tileColor = new RulesetTileColor();
                _tileColor.CreatedBy = GetUserId();
                _tileColor.CreatedDate = DateTime.Now;
                _tileColor.RulesetTileId = Tile.RulesetTileId;

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
                        //_tileColor.BodyBgColor = Tile.LinkTiles.BodyBgColor;
                        //_tileColor.BodyTextColor = Tile.LinkTiles.BodyTextColor;
                        //_tileColor.TitleBgColor = Tile.LinkTiles.TitleBgColor;
                        //_tileColor.TitleTextColor = Tile.LinkTiles.TitleTextColor;
                        break;
                    case (int)Enum.TILES.EXECUTE:
                        //_tileColor.BodyBgColor = Tile.ExecuteTiles.BodyBgColor;
                        //_tileColor.BodyTextColor = Tile.ExecuteTiles.BodyTextColor;
                        //_tileColor.TitleBgColor = Tile.ExecuteTiles.TitleBgColor;
                        //_tileColor.TitleTextColor = Tile.ExecuteTiles.TitleTextColor;
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