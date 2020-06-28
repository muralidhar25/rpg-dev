using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DAL.Core.Interfaces;
using DAL.Models;
using DAL.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RPGSmithApp.Helpers;

namespace RPGSmithApp.Controllers
{
    [Route("api/[controller]")]
    public class PageLastViewController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IPageLastViewService _pageLastViewService;
        private readonly IAccountManager _accountManager;

        public PageLastViewController(IHttpContextAccessor httpContextAccessor, IPageLastViewService pageLastViewService
            , IAccountManager accountManager)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._pageLastViewService = pageLastViewService;
            this._accountManager = accountManager;

        }

        [HttpGet("GetAllByUserId")]
        public IEnumerable<PageLastView> GetAllByUserId(string userId)
        {
            return _pageLastViewService.GetAllByUserId(userId);
        }

        [HttpGet("GetByUserIdPageName")]
        public PageLastView GetByUserIdPageName(string userId,string pageName)
        {
            return _pageLastViewService.GetByUserIdPageName(userId, pageName);
        }


        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] PageLastView model)
        {

            if (ModelState.IsValid)
            {
                model.UserId =  GetUserId();

                if (_pageLastViewService.CheckDuplicatePageLastView(model.PageName.Trim(), model.UserId).Result)
                    return BadRequest("Duplicate PageName");
          
                var result = await _pageLastViewService.Create(model);
                  
                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpPost("update")]
        public async Task<IActionResult> Update([FromBody] PageLastView model)
        {

            if (ModelState.IsValid)
            {
                model.UserId = GetUserId();

                if (_pageLastViewService.CheckDuplicatePageLastView(model.PageName.Trim(), model.UserId, model.PageLastViewId).Result)
                    return BadRequest("Duplicate PageName");
            
                var result = await _pageLastViewService.Update(model);

                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpPost("CreateOrUpdate")]
        public async Task<IActionResult> CreateOrUpdate([FromBody] PageLastView model)
        {

            if (ModelState.IsValid)
            {
                model.UserId = GetUserId();

                if (_pageLastViewService.CheckDuplicatePageLastView(model.PageName.Trim(), model.UserId).Result)
                {
                    var resultUpdate = await _pageLastViewService.UpdateByPage(model);
                    return Ok(resultUpdate);
                }

                var resultCreate = await _pageLastViewService.Create(model);
                return Ok(resultCreate);
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        //private methods
        private string GetUserId()
        {
            string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
            ApplicationUser appUser = _accountManager.GetUserByUserNameAsync(userName).Result;
            return appUser.Id;
        }
    }
}