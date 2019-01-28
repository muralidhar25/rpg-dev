using System;
using System.Collections.Generic;

using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DAL.Models;
using DAL.Models.RulesetTileModels;
using DAL.Services.RulesetTileServices;
using Microsoft.AspNetCore.Mvc;
using RPGSmithApp.Helpers;
using RPGSmithApp.ViewModels.CreateModels;

namespace RPGSmithApp.Controllers
{
    [Route("api/[controller]")]
    public class RulesetTileConfigController : Controller
    {
        private readonly IRulesetTileConfigService _tileConfigService;
        public RulesetTileConfigController(IRulesetTileConfigService tileConfigService)
        {
            _tileConfigService = tileConfigService;
        }

        [HttpGet("getall")]
        public IEnumerable<RulesetTileConfig> GetAll()
        {
            return _tileConfigService.GetAll();
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] RulesetTileConfig model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    List<RulesetTileConfig> list = new List<RulesetTileConfig>();
                    list.Add(model);
                    _tileConfigService.CreateList_sp(list);
                    //if (!_tileConfigService.alreadyExists(model.RulesetTileId))
                    //{
                    //    //  await _tileConfigService.CreateAsync(model);
                    //    await _tileConfigService.CreateAsync(new RulesetTileConfig()
                    //    {
                    //        Col = model.Col,
                    //        Row = model.Row,
                    //        RulesetTileId = model.RulesetTileId,
                    //        Payload = model.Payload,
                    //        SizeX = model.SizeX,
                    //        SizeY = model.SizeY,
                    //        SortOrder = model.SortOrder,
                    //        UniqueId = model.UniqueId,
                    //        IsDeleted = false
                    //    });
                    //}
                }
                catch (Exception ex)
                {                    
                }
                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }
        
        [HttpPost("createlist")]
        public async Task<IActionResult> createlist([FromBody] List<RulesetTileConfig> list)
        {
            if (ModelState.IsValid)
            {
                try
                {   
                    _tileConfigService.CreateList_sp(list);
                    //foreach (var model in list)
                    //{
                    //    if (!_tileConfigService.alreadyExists(model.RulesetTileId))
                    //    {
                    //        //  await _tileConfigService.CreateAsync(model);
                    //        await _tileConfigService.CreateAsync(new RulesetTileConfig()
                    //        {
                    //            Col = model.Col,
                    //            Row = model.Row,
                    //            RulesetTileId = model.RulesetTileId,
                    //            Payload = model.Payload,
                    //            SizeX = model.SizeX,
                    //            SizeY = model.SizeY,
                    //            SortOrder = model.SortOrder,
                    //            UniqueId = model.UniqueId,
                    //            IsDeleted = false
                    //        });
                    //    }
                    //}

                    
                }
                catch (Exception ex)
                { 
                }
                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }
        [HttpPost("update")]
        public async Task<IActionResult> Update([FromBody] RulesetTileConfig model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    List<RulesetTileConfig> list = new List<RulesetTileConfig>();
                    list.Add(model);
                    _tileConfigService.UpdateList_sp(list);
                    //await _tileConfigService.UpdateAsync(model);
                    return Ok();
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }
        
        [HttpPost("updatelist")]
        public async Task<IActionResult> updatelist([FromBody] List<RulesetTileConfig> list)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    _tileConfigService.UpdateList_sp(list);
                    //foreach (var model in list)
                    //{
                    //    await _tileConfigService.UpdateAsync(model);
                    //}
                    return Ok();
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