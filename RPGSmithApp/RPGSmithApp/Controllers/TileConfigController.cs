using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DAL.Models;
using DAL.Services.CharacterTileServices;
using Microsoft.AspNetCore.Mvc;
using RPGSmithApp.Helpers;
using RPGSmithApp.ViewModels.CreateModels;

namespace RPGSmithApp.Controllers
{
    [Route("api/[controller]")]
    public class TileConfigController : Controller
    {
        private readonly ITileConfigService _tileConfigService;
        public TileConfigController(ITileConfigService tileConfigService)
        {
            _tileConfigService = tileConfigService;
        }
        [HttpGet("getall")]
        public IEnumerable<TileConfig> GetAll()
        {
            return _tileConfigService.GetAll();
        }
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] TileConfig model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    //if (!_tileConfigService.alreadyExists(model.CharacterTileId))
                    //{
                    //    await _tileConfigService.CreateAsync(model);
                    //}
                    List<TileConfig> list = new List<TileConfig>();
                    list.Add(model);
                    _tileConfigService.createList(list);
                    return Ok();
                }
                catch (Exception ex)
                {
                    //return BadRequest(ex.Message);
                    return Ok();
                }
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }
        [HttpPost("createList")]
        public async Task<IActionResult> Create([FromBody] List<TileConfig> list)
        {
            if (ModelState.IsValid)
            {
                //foreach (var model in list)
                //{
                //    try
                //    {
                //        if (!_tileConfigService.alreadyExists(model.CharacterTileId))
                //        {
                //            await _tileConfigService.CreateAsync(model);
                //        }

                //    }
                //    catch (Exception ex)
                //    {
                //        return BadRequest(ex.Message);
                //    }
                //}
                try
                {
                    _tileConfigService.createList(list);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }
        [HttpPost("update")]
        public async Task<IActionResult> Update([FromBody] TileConfig model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    // await _tileConfigService.UpdateAsync(model);
                    List<TileConfig> list = new List<TileConfig>();
                    list.Add(model);
                    _tileConfigService.UpdateList(list);
                    return Ok();
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }
        [HttpPost("updateList")]
        public async Task<IActionResult> Update([FromBody] List<TileConfig> list)
        {
            if (ModelState.IsValid)
            {
                //foreach (var model in list)
                //{
                //    try
                //    {
                //        await _tileConfigService.UpdateAsync(model);

                //    }
                //    catch (Exception ex)
                //    {
                //        return BadRequest(ex.Message);
                //    }
                //}
                try
                {
                    _tileConfigService.UpdateList(list);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }
        [HttpDelete("delete")]
        public async Task<IActionResult> Delete(int id)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    await _tileConfigService.DeleteAsync(id);
                    return Ok();
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }
    }
}