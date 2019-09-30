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
    public class MonsterTemplateBundleController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        private readonly IMonsterTemplateBundleService _MonsterTemplateBundleService;
        private readonly IRuleSetService _ruleSetService;
        private readonly ICoreRuleset _coreRulesetService;

        public MonsterTemplateBundleController(IHttpContextAccessor httpContextAccessor, IAccountManager accountManager,
            IMonsterTemplateBundleService MonsterTemplateBundleService , IRuleSetService ruleSetService,
               ICoreRuleset coreRulesetService)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._accountManager = accountManager;
            this._MonsterTemplateBundleService = MonsterTemplateBundleService;          
            this._ruleSetService = ruleSetService;         
            _coreRulesetService = coreRulesetService;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateMonsterTemplateBundle([FromBody] MonsterTemplateBundleViewModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    MonsterTemplateBundle DuplicateBundleModel = _MonsterTemplateBundleService.GetDuplicateMonsterTemplateBundle(model.BundleName, model.RuleSetId).Result;
                    MonsterTemplateBundle result = new MonsterTemplateBundle();
                    MonsterTemplateBundle Bundle = Mapper.Map<MonsterTemplateBundle>(model);
                    if (DuplicateBundleModel != null)
                    {
                        //result = DuplicateBundleModel;
                        return BadRequest("The Bundle Name " + model.BundleName + " had already been used in this Rule Set. Please select another name.");
                    }
                    else
                    {
                        result = await _MonsterTemplateBundleService.CreateBundle(Bundle, model.BundleItems);
                    }
                }
                catch (Exception ex)
                { return BadRequest(ex.Message); }


                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }
        [HttpPost("update")]
        public async Task<IActionResult> UpdateMonsterTemplateBundle([FromBody] MonsterTemplateBundleViewModel model)
        {

            if (ModelState.IsValid)
            {
                //int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
               
                //    return await UpdateMonsterTemplateCommon(model);

                int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
                if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
                {
                    return await Core_UpdateMonsterTemplateBundle(model);
                }
                else
                {
                    return await UpdateMonsterTemplateBundleCommon(model);
                }

            }
            return BadRequest(Utilities.ModelStateError(ModelState));

        }

        private async Task<IActionResult> UpdateMonsterTemplateBundleCommon(MonsterTemplateBundleViewModel model)
        {
            try {
                if (_MonsterTemplateBundleService.CheckDuplicateMonsterTemplateBundle(model.BundleName, model.RuleSetId, model.BundleId).Result)
                    return BadRequest("The Bundle Name " + model.BundleName + " had already been used in this Rule Set. Please select another name.");

                var itemmasterobj = _MonsterTemplateBundleService.GetBundleById(model.BundleId);

                if (itemmasterobj == null)
                    return BadRequest("Bundle not found");

                var bundle = Mapper.Map<MonsterTemplateBundle>(model);
                var result = await _MonsterTemplateBundleService.UpdateBundle(bundle, model.BundleItems);
            } catch (Exception ex) {
                return BadRequest(ex.Message);
            }
           
            
            return Ok();
        }
        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteMonsterTemplate(int Id)
        {
            await _MonsterTemplateBundleService.DeleteBundle(Id);
            return Ok();
        }
        [HttpPost("delete_up")]
        public async Task<IActionResult> DeleteMonsterTemplate([FromBody] MonsterTemplateBundleViewModel model)
        {
            int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
            if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
            {
                int bundleID = model.BundleId;
                if (!_coreRulesetService.IsMonsterBundleCopiedFromCoreRuleset(bundleID, rulesetID))
                {
                    await CreateMonsterTemplateBundleForCopiedRuleset(model, true);
                    return Ok();
                    // await UpdateMonsterTemplateCommon(model);
                }
            }
            await _MonsterTemplateBundleService.DeleteBundle((int)model.BundleId);
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
                        BlobService bs = new BlobService(_httpContextAccessor, _accountManager,_ruleSetService);
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


        [HttpPost("DuplicateBundle")]
        public async Task<IActionResult> DuplicateMonsterTemplate([FromBody] MonsterTemplateBundleViewModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    if (_MonsterTemplateBundleService.CheckDuplicateMonsterTemplateBundle(model.BundleName.Trim(), model.RuleSetId).Result)
                        return BadRequest("The Item Master Name " + model.BundleName + " had already been used. Please select another name.");

                    MonsterTemplateBundle bundle = _MonsterTemplateBundleService.GetBundleById(model.BundleId);

                    model.BundleId = 0;
                    MonsterTemplateBundle bundleModel = Mapper.Map<MonsterTemplateBundle>(model);
                    var result = await _MonsterTemplateBundleService.CreateBundle(bundleModel, model.BundleItems);
                }
                catch (Exception ex)
                { return BadRequest(ex.Message); }


                return Ok();
            }

            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        
            [HttpGet("getItemsByBundleId")]
        public async Task<IActionResult> getItemsByBundleId(int bundleId)
        {
            return Ok(_MonsterTemplateBundleService.getItemsByBundleID(bundleId));
        }
        
             [HttpGet("getDetailById")]
        public async Task<IActionResult> getDetailById(int id)
        {
            
            

            return Ok(_MonsterTemplateBundleService.getBundleByBundleID(id));
        }

      
        private async Task<IActionResult> Core_UpdateMonsterTemplateBundle(MonsterTemplateBundleViewModel model)
        {
            try
            {                
                if (_coreRulesetService.IsMonsterBundleCopiedFromCoreRuleset(model.BundleId, (int)model.RuleSetId))
                {
                    return await UpdateMonsterTemplateBundleCommon(model);
                }
                else
                {
                    return await CreateMonsterTemplateBundleForCopiedRuleset(model);

                }

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        private async Task<IActionResult> CreateMonsterTemplateBundleForCopiedRuleset(MonsterTemplateBundleViewModel model, bool? IsDeleted = null)
        {
            //CreateMonsterTemplateModel itemModel = Mapper.Map<CreateMonsterTemplateModel>(model);
            MonsterTemplateBundle bundle = new MonsterTemplateBundle();
            bundle.BundleId = model.BundleId;
            
            
            bundle.BundleImage = model.BundleImage;
           
            bundle.BundleName = model.BundleName;
           
            bundle.BundleVisibleDesc = model.BundleVisibleDesc;
            bundle.gmOnly = model.gmOnly;
            bundle.Metatags = model.Metatags;
            bundle.AddToCombat = model.AddToCombat;
            


            bundle.RuleSetId = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
            
          
            bundle.IsDeleted = IsDeleted;
            model.BundleItems = _MonsterTemplateBundleService.getItemsByBundleID(model.BundleId);


            MonsterTemplateBundle result = await _coreRulesetService.CreateMonsterTemplateBundle(bundle,model.BundleItems.ToList());

            
            return Ok(result.BundleId);
        }
    }
}
