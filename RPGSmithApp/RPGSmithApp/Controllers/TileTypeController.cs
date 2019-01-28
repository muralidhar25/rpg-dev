using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RPGSmithApp.Helpers;

namespace RPGSmithApp.Controllers
{
    [Route("api/[controller]")]
    public class TileTypeController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ITileTypeService _tileTypeService;


        public TileTypeController(IHttpContextAccessor httpContextAccessor, ITileTypeService tileTypeService)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._tileTypeService = tileTypeService;
        }

        [HttpGet("getall")]
        public IEnumerable<TileType> GetAll()
        {
            return _tileTypeService.GetAll();
        }

        [HttpPost("create")]
        [ProducesResponseType(200, Type = typeof(string))]
        public async Task<IActionResult> Create([FromBody] TileType model)
        {
            if (ModelState.IsValid)
            {
                if (_tileTypeService.CheckDuplicate(model.Name.Trim()).Result)
                    return BadRequest("Duplicate Tile Type Name");


                try
                {

                
                    await _tileTypeService.Create(model);
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
        [ProducesResponseType(200, Type = typeof(string))]
        public async Task<IActionResult> Update([FromBody] TileType model)
        {
            if (ModelState.IsValid)
            {
                if (_tileTypeService.CheckDuplicate(model.Name.Trim(), model.TileTypeId).Result)
                    return BadRequest("Duplicate Tile Type Name");

                try
                {
                    await _tileTypeService.Update(model);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }

                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpGet("GetById")]
        public TileType GetById(int Id)
        {
            return _tileTypeService.GetById(Id);
        }

        [HttpGet("GetCount")]
        public async Task<IActionResult> GetCount(int characterId)
        {
            var _items = _tileTypeService.GetCount();

            if (_items == 0)
                return Ok(0);

            return Ok(_items);
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> Delete(int id)
        {
            if (id == 0)
                return BadRequest("Please provide valid id");


            try
            {
                await _tileTypeService.Delete(id);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok();

        }
    }
}