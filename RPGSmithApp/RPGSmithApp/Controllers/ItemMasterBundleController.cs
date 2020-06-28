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
    public class ItemMasterBundleController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        private readonly IItemMasterBundleService _itemMasterBundleService;
        private readonly IRuleSetService _ruleSetService;
        private readonly ICoreRuleset _coreRulesetService;

        public ItemMasterBundleController(IHttpContextAccessor httpContextAccessor, IAccountManager accountManager,
            IItemMasterBundleService itemMasterBundleService , IRuleSetService ruleSetService,
               ICoreRuleset coreRulesetService)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._accountManager = accountManager;
            this._itemMasterBundleService = itemMasterBundleService;          
            this._ruleSetService = ruleSetService;         
            _coreRulesetService = coreRulesetService;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateItemMasterBundle([FromBody] ItemMasterBundleViewModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    ItemMasterBundle DuplicateBundleModel = _itemMasterBundleService.GetDuplicateItemMasterBundle(model.BundleName, model.RuleSetId).Result;
                    ItemMasterBundle result = new ItemMasterBundle();
                    ItemMasterBundle Bundle = Mapper.Map<ItemMasterBundle>(model);
                    if (DuplicateBundleModel != null)
                    {
                        //result = DuplicateBundleModel;
                        return BadRequest("The Bundle Name " + model.BundleName + " had already been used in this Rule Set. Please select another name.");
                    }
                    else
                    {
                        result = await _itemMasterBundleService.CreateBundle(Bundle, model.BundleItems);
                    }
                }
                catch (Exception ex)
                { return BadRequest(ex.Message); }


                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }
        [HttpPost("update")]
        public async Task<IActionResult> UpdateItemMasterBundle([FromBody] ItemMasterBundleViewModel model)
        {

            if (ModelState.IsValid)
            {
                //int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
               
                //    return await UpdateItemMasterCommon(model);

                int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
                if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
                {
                    return await Core_UpdateItemMasterBundle(model);
                }
                else
                {
                    return await UpdateItemMasterBundleCommon(model);
                }

            }
            return BadRequest(Utilities.ModelStateError(ModelState));

        }

        private async Task<IActionResult> UpdateItemMasterBundleCommon(ItemMasterBundleViewModel model)
        {
            try {
                if (_itemMasterBundleService.CheckDuplicateItemMasterBundle(model.BundleName, model.RuleSetId, model.BundleId).Result)
                    return BadRequest("The Bundle Name " + model.BundleName + " had already been used in this Rule Set. Please select another name.");

                var itemmasterobj = _itemMasterBundleService.GetBundleById(model.BundleId);

                if (itemmasterobj == null)
                    return BadRequest("Bundle not found");

                var bundle = Mapper.Map<ItemMasterBundle>(model);
                var result = await _itemMasterBundleService.UpdateBundle(bundle, model.BundleItems);
            } catch (Exception ex) {
                return BadRequest(ex.Message);
            }
           
            
            return Ok();
        }
        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteItemMaster(int Id)
        {
            await _itemMasterBundleService.DeleteBundle(Id);
            return Ok();
        }
        [HttpPost("delete_up")]
        public async Task<IActionResult> DeleteItemMaster([FromBody] ItemMasterBundleViewModel model)
        {
            int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
            if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
            {
                int bundleID = model.BundleId;
                if (!_coreRulesetService.IsBundleCopiedFromCoreRuleset(bundleID, rulesetID))
                {
                    await CreateItemMasterBundleForCopiedRuleset(model, true);
                    return Ok();
                    // await UpdateItemMasterCommon(model);
                }
            }
            await _itemMasterBundleService.DeleteBundle((int)model.BundleId);
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
        public async Task<IActionResult> DuplicateItemMaster([FromBody] ItemMasterBundleViewModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    if (_itemMasterBundleService.CheckDuplicateItemMasterBundle(model.BundleName.Trim(), model.RuleSetId).Result)
                        return BadRequest("The Item Master Name " + model.BundleName + " had already been used. Please select another name.");

                    ItemMasterBundle bundle = _itemMasterBundleService.GetBundleById(model.BundleId);

                    model.BundleId = 0;
                    ItemMasterBundle bundleModel = Mapper.Map<ItemMasterBundle>(model);
                    var result = await _itemMasterBundleService.CreateBundle(bundleModel, model.BundleItems);
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
            return Ok(_itemMasterBundleService.getItemsByBundleID(bundleId));
        }
        
             [HttpGet("getDetailById")]
        public async Task<IActionResult> getDetailById(int id)
        {
            //ItemMasterBundle obj = _itemMasterBundleService.getBundleByBundleID(id);
            //ItemMasterBundleViewModel model = new ItemMasterBundleViewModel();
            //if (obj != null)
            //{
            //    model = new ItemMasterBundleViewModel() {
            //        BundleId=obj.BundleId,
            //        BundleImage=obj.BundleImage,
            //        BundleName=obj.BundleName,
            //        BundleVisibleDesc=obj.BundleVisibleDesc,
            //        BundleItems=obj.ItemMasterBundleItems,
            //        Metatags=obj.Metatags,
            //        Rarity=obj.Rarity,
            //        RuleSetId=obj.RuleSetId,
            //        TotalWeight=obj.TotalWeight,
            //        Value=obj.Value,
            //        Volume=obj.Volume                    
            //    };
            //    if (model.BundleItems.Count>0)
            //    {
            //        foreach (var item in model.BundleItems)
            //        {
            //            ItemMasterBundleItemDetailsViewModel det = new ItemMasterBundleItemDetailsViewModel() {
            //                BundleId=obj.,
            //                BundleItemId=obj.,
            //                =obj.,
            //                =obj.,
            //                =obj.,
            //                =obj.,
            //                =obj.,
            //                =obj.,
            //                =obj.,
            //            };
                        
            //        }
            //    }
                
               


            //}
            

            return Ok(_itemMasterBundleService.getBundleByBundleID(id));
        }

        //[HttpDelete("delete")]
        //public async Task<IActionResult> DeleteBundle(int Id)
        //{
        //    //int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
        //    //if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
        //    //{
        //    //    int ItemMasterID = model.ItemMasterId == null ? 0 : (int)model.ItemMasterId;
        //    //    if (!_coreRulesetService.IsItemCopiedFromCoreRuleset(ItemMasterID, rulesetID))
        //    //    {
        //    //        await CreateItemMasterForCopiedRuleset(model,true);
        //    //        return Ok();
        //    //        // await UpdateItemMasterCommon(model);
        //    //    }
        //    //}           
        //    await _itemMasterBundleService.DeleteBundle(Id);
        //    return Ok();
        //}
        private async Task<IActionResult> Core_UpdateItemMasterBundle(ItemMasterBundleViewModel model)
        {
            try
            {                
                if (_coreRulesetService.IsBundleCopiedFromCoreRuleset(model.BundleId, (int)model.RuleSetId))
                {
                    return await UpdateItemMasterBundleCommon(model);
                }
                else
                {
                    return await CreateItemMasterBundleForCopiedRuleset(model);

                }

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        private async Task<IActionResult> CreateItemMasterBundleForCopiedRuleset(ItemMasterBundleViewModel model, bool? IsDeleted = null)
        {
            //CreateItemMasterModel itemModel = Mapper.Map<CreateItemMasterModel>(model);
            ItemMasterBundle bundle = new ItemMasterBundle();
            bundle.BundleId = model.BundleId;
            
            
            bundle.BundleImage = model.BundleImage;
           
            bundle.BundleName = model.BundleName;
           
            bundle.BundleVisibleDesc = model.BundleVisibleDesc;
            bundle.gmOnly = model.gmOnly;
            bundle.Metatags = model.Metatags;
           
            bundle.Rarity = model.Rarity;
            bundle.RuleSetId = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
            
            bundle.Value = model.Value;
            bundle.Volume = model.Volume;
            bundle.TotalWeight = model.TotalWeight;
            bundle.IsDeleted = IsDeleted;
            model.BundleItems = _itemMasterBundleService.getItemsByBundleID(model.BundleId);


            ItemMasterBundle result = await _coreRulesetService.CreateItemMasterBundle(bundle,model.BundleItems.ToList());

            
            return Ok(result.BundleId);
        }
    }
}
