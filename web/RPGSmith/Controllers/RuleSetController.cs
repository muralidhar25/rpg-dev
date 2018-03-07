using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using RPGSmith.DomainServices;
using RPGSmith.Web.ViewModels;
using RPGSmith.Data;
using System.Configuration;
using Microsoft.AspNet.Identity;
using RPGSmith.Web.Utilities;
using System.IO;
using Newtonsoft.Json;

namespace RPGSmith.Controllers
{

    [Authorize]
   
    public class RuleSetController : Controller
    {
        ServiceResponseModel _serviceResponseModel = new ServiceResponseModel();
        RuleSetService _rulesetService;
        ResponseViewModel _response;
        public RuleSetController()//, ApplicationUserManager userManager) : base(userManager)
        {
            _rulesetService = new RuleSetService();
            _response = new ResponseViewModel();
        }
        #region RuleSet
        [HttpGet]
        // GET: Rule Set
        public JsonResult Get()
        {
            try
            {
                List<RuleSetViewModel> _rulesetViewModel = new List<RuleSetViewModel>();

                List<RuleSetProperty> _rulesetProperty = new List<RuleSetProperty>();

                _rulesetViewModel = _rulesetService.GetRuleSetsByUserID(User.Identity.GetUserId()).Select(x =>
                    new RuleSetViewModel
                    {
                        Id = x.RulesetID,
                        Name = x.Name,
                        UserId = x.UserId,
                        Rulesetproperty = new RuleSetService().GetRuleSetPropertyByRuleSetId(x.RulesetID)//_rulesetProperty 
                    }).ToList();

                _response.PayLoad = _rulesetViewModel;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);

        }
        public ActionResult GetNewRuleset()
        {
            try
            {
                RuleSetViewModel _rulesetViewModel = new RuleSetViewModel();
                _rulesetViewModel = _rulesetService.GetNewRuleset(User.Identity.GetUserId());
                _response.PayLoad = _rulesetViewModel;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            // var jsonResponse = Json(_response);
            //    jsonResponse.MaxJsonLength = (ConfigurationManager.GetSection("system.web.extensions/scripting/webServices/jsonSerialization") as System.Web.Configuration.ScriptingJsonSerializationSection).MaxJsonLength;
            return Json(_response, JsonRequestBehavior.AllowGet);

        }
        [HttpGet]
        public JsonResult GetRulesetByRuleSetId(int? RuleSetId)
        {
            try
            {
                RuleSetViewModel _rulesetViewModel = new RuleSetViewModel();
                _rulesetViewModel = _rulesetService.GetRuleSetByRuleSetId(RuleSetId);
                _response.PayLoad = _rulesetViewModel;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);

        }
        public ActionResult GetRulesetProperties()
        {
            try
            {
                var Properties = _rulesetService.GetRuleSetProperty();
                _response.PayLoad = Properties;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);

        }
        [HttpPost, ValidateInput(false)]
        public ActionResult Create(List<HttpPostedFileBase> clientImages)
        {
            try
            {
                string userId = User.Identity.GetUserId();
                //Deserializing RuleSetViewModel form data
                var model = JsonConvert.DeserializeObject<RuleSetViewModel>(Request.Form["ruleSetViewModel"]);
                model.UserId = userId;
                //Setting Ruleset Items , Spells , Abilities Images   
                //new RuleSetService().SetRuleSetContentImages(model, itemfiles, spellfiles, abilityfiles, ruleSetImage);

                _serviceResponseModel = _rulesetService.AddOrCopyRuleset(model, clientImages, userId, false);


                switch (_serviceResponseModel.StatusCode)
                {
                    case 200:
                        _response.StatusCode = 200;
                        _response.PayLoad = _serviceResponseModel.Result;
                        _response.ShowToUser = false;
                        break;
                    case 400:
                        _response.StatusCode = 400;
                        _response.ErrorMessage = _serviceResponseModel.ErrorMessage;
                        _response.ShowToUser = true;
                        break;
                    case 500:
                        _response.StatusCode = 400;
                        _response.ShowToUser = false;
                        break;
                }

            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);

        }
        [HttpPost]
        public ActionResult Delete(int? RuleSetID)
        {

            try
            {
                string userId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.DeleteRuleSet(RuleSetID, userId);

                if (_serviceResponseModel.StatusCode == 200)
                {
                    _response.StatusCode = 200;
                    _response.PayLoad = _serviceResponseModel.Result;
                    _response.ShowToUser = false;
                }
                else if (_serviceResponseModel.StatusCode == 400)
                {
                    _response.StatusCode = 400;
                    _response.ErrorMessage = _serviceResponseModel.ErrorMessage;
                    _response.ShowToUser = true;
                }
                else if (_serviceResponseModel.StatusCode == 500)
                {
                    _response.StatusCode = 400;
                    _response.ShowToUser = false;
                }
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);

        }
        [HttpPost, ValidateInput(false)]
        public ActionResult Update(List<HttpPostedFileBase> clientImages)
        {

            try
            {
                string userId = User.Identity.GetUserId();
                //Deserializing RuleSetViewModel form data
                var model = JsonConvert.DeserializeObject<RuleSetViewModel>(Request.Form["ruleSetViewModel"]);
                model.UserId = userId;
                //Setting Ruleset Items , Spells , Abilities Images   
                //new RuleSetService().SetRuleSetContentImages(model, itemfiles, spellfiles, abilityfiles, ruleSetImage);
                _serviceResponseModel = _rulesetService.UpdateRuleset(model, clientImages, userId);

                if (_serviceResponseModel.StatusCode == 200)
                {
                    _response.StatusCode = 200;
                    _response.PayLoad = _serviceResponseModel.Result;
                    _response.ShowToUser = false;
                }
                else if (_serviceResponseModel.StatusCode == 400)
                {
                    _response.StatusCode = 400;
                    _response.ErrorMessage = _serviceResponseModel.ErrorMessage;
                    _response.ShowToUser = true;
                }
                else if (_serviceResponseModel.StatusCode == 500)
                {
                    _response.StatusCode = 400;
                    _response.ErrorMessage = _serviceResponseModel.ErrorMessage;
                    _response.ShowToUser = false;
                }
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        [HttpPost, ValidateInput(false)]
        public ActionResult Copy(List<HttpPostedFileBase> clientImages)
        {
            try
            {
                string userId = User.Identity.GetUserId();
                //Deserializing RuleSetViewModel form data
                var model = JsonConvert.DeserializeObject<RuleSetViewModel>(Request.Form["ruleSetViewModel"]);
                model.UserId = userId;
                _serviceResponseModel = _rulesetService.AddOrCopyRuleset(model, clientImages, userId, true);
                if (_serviceResponseModel.StatusCode == 200)
                {
                    _response.StatusCode = 200;
                    _response.PayLoad = _serviceResponseModel.Result;
                    _response.ShowToUser = false;
                }
                else if (_serviceResponseModel.StatusCode == 400)
                {
                    _response.StatusCode = 400;
                    _response.ErrorMessage = _serviceResponseModel.ErrorMessage;
                    _response.ShowToUser = true;
                }
                else if (_serviceResponseModel.StatusCode == 500)
                {
                    _response.StatusCode = 400;
                    _response.ShowToUser = false;
                }
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);

        }
        public ActionResult GetRuleSetByCharacterProfileId(int? CharacterProfileId)
        {
            try
            {
                if (CharacterProfileId == null) CharacterProfileId = 7;
                RuleSetViewModel _rulesetViewModel = new RuleSetViewModel();
                _rulesetViewModel = _rulesetService.GetRuleSetDetailsByCharacterProfileId(CharacterProfileId);
                _response.PayLoad = _rulesetViewModel;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetRuleSetItemsByCharacterProfileId(int? CharacterProfileId)
        {
            try
            {
                if (CharacterProfileId == null) CharacterProfileId = 7;
                RuleSetViewModel _rulesetViewModel = new RuleSetViewModel();
                _rulesetViewModel = _rulesetService.GetRuleSetItemDetailsByCharacterProfileId(CharacterProfileId);
                _response.PayLoad = _rulesetViewModel;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetRuleSetSpellsByCharacterProfileId(int? CharacterProfileId)
        {
            try
            {
                if (CharacterProfileId == null) CharacterProfileId = 7;
                RuleSetViewModel _rulesetViewModel = new RuleSetViewModel();
                _rulesetViewModel = _rulesetService.GetRuleSetSpellDetailsByCharacterProfileId(CharacterProfileId);
                _response.PayLoad = _rulesetViewModel;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetRuleSetAbilitiesByCharacterProfileId(int? CharacterProfileId)
        {
            try
            {
                if (CharacterProfileId == null) CharacterProfileId = 7;
                RuleSetViewModel _rulesetViewModel = new RuleSetViewModel();
                _rulesetViewModel = _rulesetService.GetRuleSetAbilityDetailsByCharacterProfileId(CharacterProfileId);
                _response.PayLoad = _rulesetViewModel;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        #endregion
        #region Corestats
        [HttpPost]
        public JsonResult GetCoreStatsByCoreStatId(int? CoreStatID)
        {
            try
            {
                Corestats _coreSetViewModel = new Corestats();
                _coreSetViewModel = _rulesetService.GetCoreStatByCoreStatId(CoreStatID);
                _response.PayLoad = _coreSetViewModel;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);

        }
        [HttpPost]
        public ActionResult DeleteCoreStat(int? CoreStatID)
        {
            try
            {
                var delete = _rulesetService.DeleteCoreStat(CoreStatID);
                _response.PayLoad = delete;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return View(_response);
        }
        #endregion
        //Commented code
        //public ActionResult GetSmithTypes()
        //{
        //    try
        //    {
        //        var Types = _rulesetService.GetAllTypes();
        //        _response.PayLoad = Types;
        //        _response.StatusCode = 200;
        //    }

        //    catch (Exception ex)
        //    {
        //        _response.StatusCode = 400;
        //        _response.ErrorMessage = ex.Message;
        //        _response.ShowToUser = false;
        //    }
        //    return View(_response);
        //}
        //public ActionResult GetAllCorestats()
        //{
        //    try
        //    {
        //        var allcorestats = _rulesetService.GetCorestats();
        //        _response.PayLoad = allcorestats;
        //        _response.StatusCode = 200;

        //    }
        //    catch (Exception ex)
        //    {
        //        _response.StatusCode = 400;
        //        _response.ErrorMessage = ex.Message;
        //        _response.ShowToUser = false;
        //    }
        //    return View(_response);
        //}
        //[HttpPost]
        //public ActionResult Create1(RuleSetViewModel RulesetModel)
        //{
        //    try
        //    {
        //        RulesetModel.UserId = User.Identity.GetUserId();
        //        if (RulesetModel.UserId != null && RulesetModel.UserId != "")
        //        {
        //            if (RulesetModel.Rulesetproperty.Count > 0)
        //            {
        //                var ResultList = RulesetModel.Rulesetproperty;
        //                string Errorstr = "";

        //                // Errorstr = Errorstr + Utility.RuleSetValidation(RulesetModel);

        //                if (Errorstr == "")
        //                {
        //                    //var AddRuleset = _rulesetService.AddRuleset(RulesetModel);
        //                    //_response.PayLoad = AddRuleset;
        //                    //_response.StatusCode = 200;
        //                }
        //                else
        //                {
        //                    _response.StatusCode = 400;
        //                    _response.ErrorMessage = "Please Fill " + Errorstr;
        //                    _response.ShowToUser = true;
        //                }

        //            }

        //        }

        //    }
        //    catch (Exception ex)
        //    {
        //        _response.StatusCode = 400;
        //        _response.ErrorMessage = ex.Message;
        //        _response.ShowToUser = false;
        //    }
        //    return Json(_response, JsonRequestBehavior.AllowGet);

        //}
        //[HttpPost]
        //public ActionResult Update1(RuleSetViewModel UpdateModel)
        //{
        //    try
        //    {
        //        //var EditRuleset = _rulesetService.UpdateRuleset(UpdateModel);
        //        //_response.PayLoad = EditRuleset;
        //        //_response.StatusCode = 200;
        //    }
        //    catch (Exception ex)
        //    {
        //        _response.StatusCode = 400;
        //        _response.ErrorMessage = ex.Message;
        //        _response.ShowToUser = false;
        //    }
        //    return Json(_response, JsonRequestBehavior.AllowGet);
        //}
        //[HttpPost]
        //public ActionResult Copy1(RuleSetViewModel CopyModel)
        //{
        //    try
        //    {
        //        //var CopyRuleset = _rulesetService.AddRuleset(CopyModel);
        //        //_response.PayLoad = CopyRuleset;
        //        //_response.StatusCode = 200;
        //    }
        //    catch (Exception ex)
        //    {
        //        _response.StatusCode = 400;
        //        _response.ErrorMessage = ex.Message;
        //        _response.ShowToUser = false;
        //    }
        //    return Json(_response, JsonRequestBehavior.AllowGet);
        //}
        //[HttpPost]
        //public ActionResult Delete1(int? RuleSetID)
        //{
        //    try
        //    {
        //        //var delete = _rulesetService.DeleteRuleSet(RuleSetID);
        //        //_response.PayLoad = delete;
        //        //_response.StatusCode = 200;
        //    }
        //    catch (Exception ex)
        //    {
        //        _response.StatusCode = 400;
        //        _response.ErrorMessage = ex.Message;
        //        _response.ShowToUser = false;
        //    }
        //    return Json(_response, JsonRequestBehavior.AllowGet);
        //}
        //private void SetRuleSetContentImages(RuleSetViewModel model, List<HttpPostedFileBase> itemfiles, List<HttpPostedFileBase> spellfiles, List<HttpPostedFileBase> abilityfiles, HttpPostedFileBase ruleSetImage)
        //{
        //    //Ignoring null Exception Issue
        //    itemfiles = itemfiles == null ? new List<HttpPostedFileBase>() : itemfiles;
        //    spellfiles = spellfiles == null ? new List<HttpPostedFileBase>() : spellfiles;
        //    abilityfiles = abilityfiles == null ? new List<HttpPostedFileBase>() : abilityfiles;
        //    //Setting RuleSet Image
        //    if (ruleSetImage != null)
        //    {
        //        HttpPostedFileBase file = ruleSetImage;
        //        if (file != null)
        //        {
        //            var uniqueString = Guid.NewGuid();
        //            var VirtualPath = string.Empty;
        //            if (file.ContentLength > 0)
        //            {
        //                var fullfilename = Path.GetFileName(file.FileName);
        //                var templocation = Path.Combine(
        //                   Server.MapPath("~/wwwroot/images/rulesetimages/"), fullfilename);
        //                string filename = templocation.Substring(templocation.LastIndexOf(((char)92)) + 1);
        //                int index = filename.LastIndexOf('.');
        //                var realFilename = filename.Substring(0, index);
        //                var fileExentation = filename.Substring(index + 1);
        //                var itemFileLocation = Path.Combine(
        //                 Server.MapPath("~/wwwroot/images/RuleSetImages/"), realFilename + "_" + uniqueString + "." + fileExentation);
        //                file.SaveAs(itemFileLocation);
        //                VirtualPath = "/wwwroot/images/RuleSetImages/" + realFilename + "_" + uniqueString + "." + fileExentation;
        //            }
        //            for (var j = 0; j < model.Rulesetproperty.Count; j++)
        //            {
        //                if (j == 2)
        //                {
        //                    model.Rulesetproperty[j].Value.Image.image = VirtualPath;
        //                    break;
        //                }

        //            }
        //        }
        //    }
        //    //Setting Ruleset Item Images 
        //    if (itemfiles.Count > 0)
        //    {
        //        for (var i = 0; i < itemfiles.Count; i++)
        //        {
        //            HttpPostedFileBase file = itemfiles[i];
        //            if (file != null)
        //            {
        //                var uniqueString = Guid.NewGuid();
        //                var VirtualPath = string.Empty;
        //                if (file.ContentLength > 0)
        //                {
        //                    var fullFileName = Path.GetFileName(file.FileName);
        //                    var TempLocation = Path.Combine(
        //                       Server.MapPath("~/wwwroot/images/RuleSetItemImages/"), fullFileName);
        //                    string fileName = TempLocation.Substring(TempLocation.LastIndexOf(((char)92)) + 1);
        //                    int index = fileName.LastIndexOf('.');
        //                    var realFileName = fileName.Substring(0, index);
        //                    var fileExentation = fileName.Substring(index + 1);
        //                    var itemFileLocation = Path.Combine(
        //                     Server.MapPath("~/wwwroot/images/RuleSetItemImages/"), realFileName + "_" + uniqueString + "." + fileExentation);
        //                    file.SaveAs(itemFileLocation);
        //                    VirtualPath = "/wwwroot/images/RuleSetItemImages/" + realFileName + "_" + uniqueString + "." + fileExentation;
        //                }
        //                for (var j = 0; j < model.Items[i].ItemProperties.Count; j++)
        //                {
        //                    if (j == 1)
        //                    {
        //                        model.Items[i].ItemProperties[j].Value.Image.image = VirtualPath;
        //                        break;
        //                    }
        //                }
        //            }

        //        }
        //    }
        //    //Setting Ruleset Spell Images 
        //    if (spellfiles.Count > 0)
        //    {
        //        for (var i = 0; i < spellfiles.Count; i++)
        //        {
        //            HttpPostedFileBase file = spellfiles[i];
        //            if (file != null)
        //            {
        //                var uniqueString = Guid.NewGuid();
        //                var VirtualPath = string.Empty;
        //                if (file.ContentLength > 0)
        //                {
        //                    var fullFileName = Path.GetFileName(file.FileName);
        //                    var TempLocation = Path.Combine(
        //                      Server.MapPath("~/wwwroot/images/RuleSetSpellsImages/"), fullFileName);
        //                    string fileName = TempLocation.Substring(TempLocation.LastIndexOf(((char)92)) + 1);
        //                    int index = fileName.LastIndexOf('.');
        //                    var realFileName = fileName.Substring(0, index);
        //                    var fileExentation = fileName.Substring(index + 1);
        //                    var spellFileLocation = Path.Combine(
        //                     Server.MapPath("~/wwwroot/images/RuleSetSpellsImages/"), realFileName + "_" + uniqueString + "." + fileExentation);
        //                    file.SaveAs(spellFileLocation);
        //                    VirtualPath = "/wwwroot/images/RuleSetSpellsImages/" + realFileName + "_" + uniqueString + "." + fileExentation;
        //                }
        //                for (var j = 0; j < model.Spells[i].SpellProperties.Count; j++)
        //                {
        //                    if (j == 1)
        //                    {
        //                        model.Spells[i].SpellProperties[j].Value.Image.image = VirtualPath;
        //                        break;
        //                    }
        //                }
        //            }
        //        }
        //    }
        //    //Setting Ruleset Ability Images 
        //    if (abilityfiles.Count > 0)
        //    {
        //        for (var i = 0; i < abilityfiles.Count; i++)
        //        {
        //            HttpPostedFileBase file = abilityfiles[i];
        //            if (file != null)
        //            {
        //                var uniqueString = Guid.NewGuid();
        //                var VirtualPath = string.Empty;
        //                if (file.ContentLength > 0)
        //                {
        //                    var fullFileName = Path.GetFileName(file.FileName);
        //                    var TempLocation = Path.Combine(
        //                      Server.MapPath("~/wwwroot/images/RuleSetAbilitiesImages/"), fullFileName);
        //                    string fileName = TempLocation.Substring(TempLocation.LastIndexOf(((char)92)) + 1);
        //                    int index = fileName.LastIndexOf('.');
        //                    var realFileName = fileName.Substring(0, index);
        //                    var fileExentation = fileName.Substring(index + 1);
        //                    var abilityFileLocation = Path.Combine(
        //                     Server.MapPath("~/wwwroot/images/RuleSetAbilitiesImages/"), realFileName + "_" + uniqueString + "." + fileExentation);
        //                    file.SaveAs(abilityFileLocation);
        //                    VirtualPath = "/wwwroot/images/RuleSetAbilitiesImages/" + realFileName + "_" + uniqueString + "." + fileExentation;
        //                }
        //                for (var j = 0; j < model.Abilities[i].AbilityProperties.Count; j++)
        //                {
        //                    if (j == 1)
        //                    {
        //                        model.Abilities[i].AbilityProperties[j].Value.Image.image = VirtualPath;
        //                        break;
        //                    }
        //                }
        //            }
        //        }
        //    }
        //}
















        #region Ruleset
        public ActionResult GetRulesetsByUserId()
        {
            try
            {
                var UserId = User.Identity.GetUserId();
                var _rulesetViewModel = _rulesetService.GetRulesetsByUserId(UserId);
                _response.PayLoad = _rulesetViewModel;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        public ActionResult CopyRulesetByRulesetId(int? RulesetId, string Name)
        {
            try
            {
                var UserId = User.Identity.GetUserId();
                var Copyruleset = _rulesetService.CopyRulesetByRulesetId(Convert.ToInt32(RulesetId), UserId, Name);
                _response.PayLoad = Copyruleset;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        public ActionResult DeleteRulesetByRulesetId(int RulesetId)
        {
            try
            {
                string userId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.DeleteRuleSet(RulesetId, userId);

                if (_serviceResponseModel.StatusCode == 200)
                {
                    _response.StatusCode = 200;
                    _response.PayLoad = _serviceResponseModel.Result;
                    _response.ShowToUser = false;
                }
                else if (_serviceResponseModel.StatusCode == 400)
                {
                    _response.StatusCode = 400;
                    _response.ErrorMessage = _serviceResponseModel.ErrorMessage;
                    _response.ShowToUser = true;
                }
                else if (_serviceResponseModel.StatusCode == 500)
                {
                    _response.StatusCode = 400;
                    _response.ShowToUser = false;
                }
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        #endregion
        #region Ruleset General Settings
        public ActionResult GetRulesetGeneralSettingsByRulesetId(int RulesetId)
        {
            try
            {
                var UserId = User.Identity.GetUserId();
                var _rulesetGeneralSettings = _rulesetService.GetRulesetGeneralSettingsByRulesetId(RulesetId);
                _response.PayLoad = _rulesetGeneralSettings;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetGeneralSettingsMetaData()
        {
            try
            {
                var UserId = User.Identity.GetUserId();
                var _rulesetGeneralSettings = _rulesetService.GetGeneralSettingsMetaData();
                _response.PayLoad = _rulesetGeneralSettings;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }

        public ActionResult CreateRulesetGeneralSettings(List<HttpPostedFileBase> clientImages)
        {      
            try
            {
                var model = JsonConvert.DeserializeObject<List<RuleSetProperty>>(Request.Form["_rulesetProperty"]);
                var UserId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.CreateRulesetGeneralSettings(model, clientImages, UserId);


                switch (_serviceResponseModel.StatusCode)
                {
                    case 200:
                        _response.StatusCode = 200;
                        _response.PayLoad = _serviceResponseModel.Result;
                        _response.ShowToUser = false;
                        break;
                    case 400:
                        _response.StatusCode = 400;
                        _response.ErrorMessage = _serviceResponseModel.ErrorMessage;
                        _response.ShowToUser = true;
                        break;
                    case 500:
                        _response.StatusCode = 400;
                        _response.ShowToUser = false;
                        break;
                }

            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);

        }
        public ActionResult UpdateRulesetGeneralSettings(List<HttpPostedFileBase> clientImages)
        {
            
            try
            {
                //Deserializing RuleSetViewModel form data
                var model = JsonConvert.DeserializeObject<List<RuleSetProperty>>(Request.Form["_updateGeneralSettings"]);
                string userId = User.Identity.GetUserId();
                //Setting Ruleset Items , Spells , Abilities Images   
                //new RuleSetService().SetRuleSetContentImages(model, itemfiles, spellfiles, abilityfiles, ruleSetImage);
                _serviceResponseModel = _rulesetService.UpdateRulesetGeneralSettings(model, clientImages, userId);
                //var UserId = User.Identity.GetUserId();
                //var _rulesetGeneralSettings = _rulesetService.UpdateRulesetGeneralSettings(_updateGeneralSettings, clientImages, UserId);
                //_response.PayLoad = _serviceResponseModel;
                //_response.StatusCode = 200;

                switch (_serviceResponseModel.StatusCode)
                {
                    case 200:
                        _response.StatusCode = 200;
                        _response.PayLoad = _serviceResponseModel.Result;
                        _response.ShowToUser = false;
                        break;
                    case 400:
                        _response.StatusCode = 400;
                        _response.ErrorMessage = _serviceResponseModel.ErrorMessage;
                        _response.ShowToUser = true;
                        break;
                    case 500:
                        _response.StatusCode = 400;
                        _response.ShowToUser = false;
                        break;
                }

            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);


        }

        public ActionResult CreateRulesetGeneralSettings_Bkp(List<HttpPostedFileBase> clientImages)
        {
            try
            {

                var model = JsonConvert.DeserializeObject<List<RuleSetProperty>>(Request.Form["_rulesetProperty"]);
                var UserId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.CreateRulesetGeneralSettings(model, clientImages, UserId);


                //var _rulesetGeneralSettings = _rulesetService.CreateRulesetGeneralSettings(_rulesetProperty, clientImages, UserId);
                _response.PayLoad = _serviceResponseModel;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        public ActionResult UpdateRulesetGeneralSettings_Bkp(List<HttpPostedFileBase> clientImages)
        {
            try
            {

                //Deserializing RuleSetViewModel form data
                var model = JsonConvert.DeserializeObject<List<RuleSetProperty>>(Request.Form["_updateGeneralSettings"]);
                string userId = User.Identity.GetUserId();
                //Setting Ruleset Items , Spells , Abilities Images   
                //new RuleSetService().SetRuleSetContentImages(model, itemfiles, spellfiles, abilityfiles, ruleSetImage);
                _serviceResponseModel = _rulesetService.UpdateRulesetGeneralSettings(model, clientImages, userId);
                //var UserId = User.Identity.GetUserId();
                //var _rulesetGeneralSettings = _rulesetService.UpdateRulesetGeneralSettings(_updateGeneralSettings, clientImages, UserId);
                _response.PayLoad = _serviceResponseModel;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }

        #endregion
        #region Ruleset Corestats
        public ActionResult GetCorestatsByRulesetId(int RulesetId)
        {
            try
            {
                var UserId = User.Identity.GetUserId();
                var _rulesetGeneralSettings = _rulesetService.GetCorestatsByRulesetId(RulesetId);
                _response.PayLoad = _rulesetGeneralSettings;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetCorestatsMetadata()
        {
            try
            {
                var UserId = User.Identity.GetUserId();
                var _rulesetGeneralSettings = _rulesetService.GetCorestatsMetadata();
                _response.PayLoad = _rulesetGeneralSettings;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }


        public ActionResult CreateCorestats(List<Corestats> _rulesetCorestats)
        {
            try
            {

                var userId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.CreateCorestats(_rulesetCorestats, userId);
                //_response.PayLoad = _rulesetGeneralSettings;
                // _response.StatusCode = 200;

                switch (_serviceResponseModel.StatusCode)
                {
                    case 200:
                        _response.StatusCode = 200;
                        _response.PayLoad = _serviceResponseModel.Result;
                        _response.ShowToUser = true;
                        break;
                    case 400:
                        _response.StatusCode = 400;
                        _response.ErrorMessage = _serviceResponseModel.ErrorMessage;
                        _response.ShowToUser = true;
                        break;
                    case 500:
                        _response.StatusCode = 400;
                        _response.ShowToUser = false;
                        break;
                }

            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);

        }
        public ActionResult UpdateCorestats(List<Corestats> _updateCorestats)
        {
            
            try
            {

                var userId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.UpdateCorestats(_updateCorestats, userId);
                //_response.PayLoad = _rulesetGeneralSettings;
                //_response.StatusCode = 200;

                switch (_serviceResponseModel.StatusCode)
                {
                    case 200:
                        _response.StatusCode = 200;
                        _response.PayLoad = _serviceResponseModel.Result;
                        _response.ShowToUser = true;
                        break;
                    case 400:
                        _response.StatusCode = 400;
                        _response.ErrorMessage = _serviceResponseModel.ErrorMessage;
                        _response.ShowToUser = true;
                        break;
                    case 500:
                        _response.StatusCode = 400;
                        _response.ShowToUser = false;
                        break;
                }

            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);

        }
        public ActionResult CopyCorestats(List<Corestats> _copyCorestats)
        {
            try
            {
                var userId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.CopyCorestats(_copyCorestats, userId);
                //response.PayLoad = _rulesetGeneralSettings;
                //_response.StatusCode = 200;

                switch (_serviceResponseModel.StatusCode)
                {
                    case 200:
                        _response.StatusCode = 200;
                        _response.PayLoad = _serviceResponseModel.Result;
                        _response.ShowToUser = true;
                        break;
                    case 400:
                        _response.StatusCode = 400;
                        _response.ErrorMessage = _serviceResponseModel.ErrorMessage;
                        _response.ShowToUser = true;
                        break;
                    case 500:
                        _response.StatusCode = 400;
                        _response.ShowToUser = false;
                        break;
                }

            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);

        }
        public ActionResult DeleteCorestats(List<Corestats> deletecorestats)
        { 
            try
            {
                var userId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.DeleteCorestat(deletecorestats, userId);
                //_response.PayLoad = _rulesetGeneralSettings;
                //_response.StatusCode = 200;

                switch (_serviceResponseModel.StatusCode)
                {
                    case 200:
                        _response.StatusCode = 200;
                        _response.PayLoad = _serviceResponseModel.Result;
                        _response.ShowToUser = true;
                        break;
                    case 400:
                        _response.StatusCode = 400;
                        _response.ErrorMessage = _serviceResponseModel.ErrorMessage;
                        _response.ShowToUser = true;
                        break;
                    case 500:
                        _response.StatusCode = 400;
                        _response.ShowToUser = false;
                        break;
                }

            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);






        }


        // Backup Corestats
        public ActionResult CreateCorestats_Bkp(List<Corestats> _rulesetCorestats)
        {
            //try
            //{
            //    var UserId = User.Identity.GetUserId();
            //    var _rulesetGeneralSettings = _rulesetService.CreateCorestats(_rulesetCorestats);
            //    _response.PayLoad = _rulesetGeneralSettings;
            //    _response.StatusCode = 200;
            //}
            //catch (Exception ex)
            //{
            //    _response.StatusCode = 400;
            //    _response.ErrorMessage = ex.Message;
            //    _response.ShowToUser = false;
            //}

            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        public ActionResult UpdateCorestats_Bkp(List<Corestats> _updateCorestats)
        {
            //try
            //{
            //    var UserId = User.Identity.GetUserId();
            //    var _rulesetGeneralSettings = _rulesetService.UpdateCorestats(_updateCorestats);
            //    _response.PayLoad = _rulesetGeneralSettings;
            //    _response.StatusCode = 200;
            //}
            //catch (Exception ex)
            //{
            //    _response.StatusCode = 400;
            //    _response.ErrorMessage = ex.Message;
            //    _response.ShowToUser = false;
            //}

            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        public ActionResult CopyCorestats_Bkp(List<Corestats> _copyCorestats)
        {
        //    try
        //    {
        //        var UserId = User.Identity.GetUserId();
        //        var _rulesetGeneralSettings = _rulesetService.CopyCorestats(_copyCorestats);
        //        _response.PayLoad = _rulesetGeneralSettings;
        //        _response.StatusCode = 200;
        //    }
        //    catch (Exception ex)
        //    {
        //        _response.StatusCode = 400;
        //        _response.ErrorMessage = ex.Message;
        //        _response.ShowToUser = false;
        //    }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        public ActionResult DeleteCorestats_Bkp(List<Corestats> deletecorestats)
        {
            //try
            //{
            //    var UserId = User.Identity.GetUserId();
            //    var _rulesetGeneralSettings = _rulesetService.DeleteCorestat(deletecorestats);
            //    _response.PayLoad = _rulesetGeneralSettings;
            //    _response.StatusCode = 200;
            //}
            //catch (Exception ex)
            //{
            //    _response.StatusCode = 400;
            //    _response.ErrorMessage = ex.Message;
            //    _response.ShowToUser = false;
            //}

            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        #endregion
        #region Ruleset Items
        [HttpGet]
        public ActionResult GetRulesetItemsByRulesetId(int? RUlesetId)
        {
            try
            {
                var UserId = User.Identity.GetUserId();
                var _rulesetGeneralSettings = _rulesetService.GetRulesetItemsByRulesetId(Convert.ToInt32(RUlesetId));
                _response.PayLoad = _rulesetGeneralSettings;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetRulesetItemsMetadata(int? RulesetId)
        {
            try
            {
                var UserId = User.Identity.GetUserId();
                var _rulesetGeneralSettings = _rulesetService.GetRulesetItemsMetadata(Convert.ToInt32(RulesetId));
                _response.PayLoad = _rulesetGeneralSettings;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }

        [HttpPost, ValidateInput(false)]
        public ActionResult CreateRulesetItems(List<HttpPostedFileBase> clientImages)
        {

            try
            {

                var model = JsonConvert.DeserializeObject<List<Items>>(Request.Form["_rulesetItems"]);
                var UserId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.CreateRulesetItems(model, clientImages, UserId);
                
                switch (_serviceResponseModel.StatusCode)
                {
                    case 200:
                        _response.StatusCode = 200;
                        _response.PayLoad = _serviceResponseModel.Result;
                        _response.ShowToUser = true;
                        break;
                    case 400:
                        _response.StatusCode = 400;
                        _response.ErrorMessage = _serviceResponseModel.ErrorMessage;
                        _response.ShowToUser = true;
                        break;
                    case 500:
                        _response.StatusCode = 400;
                        _response.ShowToUser = false;
                        break;
                }

            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);


        }

        [HttpPost, ValidateInput(false)]
        public ActionResult UpdateRulesetItems(List<HttpPostedFileBase> clientImages)
        {
            try
            {

                //var UserId = User.Identity.GetUserId();
                //var _rulesetGeneralSettings = _rulesetService.UpdateRulesetItems(_updateItems, clientImages, UserId);
                var model = JsonConvert.DeserializeObject<List<Items>>(Request.Form["_updateItems"]);
                string userId = User.Identity.GetUserId();
                //Setting Ruleset Items , Spells , Abilities Images   
                //new RuleSetService().SetRuleSetContentImages(model, itemfiles, spellfiles, abilityfiles, ruleSetImage);
                _serviceResponseModel = _rulesetService.UpdateRulesetItems(model, clientImages, userId);
                //_response.PayLoad = _serviceResponseModel;
                //_response.StatusCode = 200;
                

                switch (_serviceResponseModel.StatusCode)
                {
                    case 200:
                        _response.StatusCode = 200;
                        _response.PayLoad = _serviceResponseModel.Result;
                        _response.ShowToUser = true;
                        break;
                    case 400:
                        _response.StatusCode = 400;
                        _response.ErrorMessage = _serviceResponseModel.ErrorMessage;
                        _response.ShowToUser = true;
                        break;
                    case 500:
                        _response.StatusCode = 400;
                        _response.ShowToUser = false;
                        break;
                }

            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);




        }

        [HttpPost,ValidateInput(false)]
        public ActionResult CopyRulesetItems( List<HttpPostedFileBase> clientImages)
        {
            

            try
            {

                //var UserId = User.Identity.GetUserId();
                //var _rulesetGeneralSettings = _rulesetService.CopyRulesetItems(_copyItems, clientImages, UserId);

                //Deserializing RuleSetViewModel form data
                var model = JsonConvert.DeserializeObject<List<Items>>(Request.Form["_copyItems"]);
                string userId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.CopyRulesetItems(model, clientImages, userId);
                //_response.PayLoad = _serviceResponseModel;
                //_response.StatusCode = 200;


                switch (_serviceResponseModel.StatusCode)
                {
                    case 200:
                        _response.StatusCode = 200;
                        _response.PayLoad = _serviceResponseModel.Result;
                        _response.ShowToUser = true;
                        break;
                    case 400:
                        _response.StatusCode = 400;
                        _response.ErrorMessage = _serviceResponseModel.ErrorMessage;
                        _response.ShowToUser = true;
                        break;
                    case 500:
                        _response.StatusCode = 400;
                        _response.ShowToUser = false;
                        break;
                }

            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);



        }

        public ActionResult DeleteItem(List<Items> deleteitem)
        {
            try
            {

                var userId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.DeleteItem(deleteitem, userId);
                //_response.PayLoad = _rulesetGeneralSettings;
                //_response.StatusCode = 200;

                switch (_serviceResponseModel.StatusCode)
                {
                    case 200:
                        _response.StatusCode = 200;
                        _response.PayLoad = _serviceResponseModel.Result;
                        _response.ShowToUser = true;
                        break;
                    case 400:
                        _response.StatusCode = 400;
                        _response.ErrorMessage = _serviceResponseModel.ErrorMessage;
                        _response.ShowToUser = true;
                        break;
                    case 500:
                        _response.StatusCode = 400;
                        _response.ShowToUser = false;
                        break;
                }

            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);

        }


        // Backup for Ruleset Items
        [HttpPost, ValidateInput(false)]
        public ActionResult CreateRulesetItems_Bkp(List<HttpPostedFileBase> clientImages)
        {

            try
            {

                var model = JsonConvert.DeserializeObject<List<Items>>(Request.Form["_rulesetItems"]);
                var UserId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.CreateRulesetItems(model, clientImages, UserId);


                //var UserId = User.Identity.GetUserId();
                //var _rulesetGeneralSettings = _rulesetService.CreateRulesetItems(_rulesetItems, clientImages, UserId);
                _response.PayLoad = _serviceResponseModel;
                _response.StatusCode = 200;


            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);

        }

        [HttpPost, ValidateInput(false)]
        public ActionResult UpdateRulesetItems_Bkp(List<HttpPostedFileBase> clientImages)
        {
            try
            {
                //var UserId = User.Identity.GetUserId();
                //var _rulesetGeneralSettings = _rulesetService.UpdateRulesetItems(_updateItems, clientImages, UserId);
                var model = JsonConvert.DeserializeObject<List<Items>>(Request.Form["_updateItems"]);
                string userId = User.Identity.GetUserId();
                //Setting Ruleset Items , Spells , Abilities Images   
                //new RuleSetService().SetRuleSetContentImages(model, itemfiles, spellfiles, abilityfiles, ruleSetImage);
                _serviceResponseModel = _rulesetService.UpdateRulesetItems(model, clientImages, userId);
                _response.PayLoad = _serviceResponseModel;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }

        [HttpPost, ValidateInput(false)]
        public ActionResult CopyRulesetItems_bkp(List<HttpPostedFileBase> clientImages)
        {
            try
            {
                //var UserId = User.Identity.GetUserId();
                //var _rulesetGeneralSettings = _rulesetService.CopyRulesetItems(_copyItems, clientImages, UserId);

                //Deserializing RuleSetViewModel form data
                var model = JsonConvert.DeserializeObject<List<Items>>(Request.Form["_copyItems"]);
                string userId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.CopyRulesetItems(model, clientImages, userId);
                _response.PayLoad = _serviceResponseModel;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }

        public ActionResult DeleteItem_Bkp(List<Items> deleteitem)
        {
            //try
            //{
            //    var UserId = User.Identity.GetUserId();
            //    var _rulesetGeneralSettings = _rulesetService.DeleteItem(deleteitem);
            //    _response.PayLoad = _rulesetGeneralSettings;
            //    _response.StatusCode = 200;
            //}
            //catch (Exception ex)
            //{
            //    _response.StatusCode = 400;
            //    _response.ErrorMessage = ex.Message;
            //    _response.ShowToUser = false;
            //}

            return Json(_response, JsonRequestBehavior.AllowGet);
        }

        #endregion
        #region Ruleset Spells
        public ActionResult GetRulesetSpellsByRulesetId(int RUlesetId)
        {
            try
            {
                var UserId = User.Identity.GetUserId();
                var _rulesetGeneralSettings = _rulesetService.GetRulesetSpellsByRulesetId(RUlesetId);
                _response.PayLoad = _rulesetGeneralSettings;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public ActionResult GetRulesetSpellsMetadata(int? RulesetId)
        {
            try
            {
                var UserId = User.Identity.GetUserId();
                var _rulesetGeneralSettings = _rulesetService.GetRulesetSpellsMetadata(Convert.ToInt32(RulesetId));
                _response.PayLoad = _rulesetGeneralSettings;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }


        [HttpPost, ValidateInput(false)]
        public ActionResult CreateRulesetSpells(List<HttpPostedFileBase> clientImages)
        {
            try
            {              
                var a = Request.Form["_rulesetItems"];
                var model = JsonConvert.DeserializeObject<List<Spells>>(Request.Form["_rulesetSpells"]);
                var userId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.CreateRulesetSpells(model, clientImages, userId);
                //var UserId = User.Identity.GetUserId();
                //var _rulesetGeneralSettings = _rulesetService.CreateRulesetSpells(_rulesetSpells, clientImages, UserId);
                //_response.PayLoad = _serviceResponseModel;
                //_response.StatusCode = 200;
         
                switch (_serviceResponseModel.StatusCode)
                {
                    case 200:
                        _response.StatusCode = 200;
                        _response.PayLoad = _serviceResponseModel.Result;
                        _response.ShowToUser = true;
                        break;
                    case 400:
                        _response.StatusCode = 400;
                        _response.ErrorMessage = _serviceResponseModel.ErrorMessage;
                        _response.ShowToUser = true;
                        break;
                    case 500:
                        _response.StatusCode = 400;
                        _response.ShowToUser = false;
                        break;
                }

            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);
        }

        [HttpPost, ValidateInput(false)]
        public ActionResult UpdateRulesetSpells(List<HttpPostedFileBase> clientImages)
        {
            try
            {
                //var UserId = User.Identity.GetUserId();
                //var _rulesetGeneralSettings = _rulesetService.UpdateRulesetSpells(_updateSpells, clientImages, UserId);
                var model = JsonConvert.DeserializeObject<List<Spells>>(Request.Form["_updateSpells"]);
                string userId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.UpdateRulesetSpells(model, clientImages, userId);
                //_response.PayLoad = _serviceResponseModel;
                //_response.StatusCode = 200;

                switch (_serviceResponseModel.StatusCode)
                {
                    case 200:
                        _response.StatusCode = 200;
                        _response.PayLoad = _serviceResponseModel.Result;
                        _response.ShowToUser = false;
                        break;
                    case 400:
                        _response.StatusCode = 400;
                        _response.ErrorMessage = _serviceResponseModel.ErrorMessage;
                        _response.ShowToUser = true;
                        break;
                    case 500:
                        _response.StatusCode = 400;
                        _response.ShowToUser = false;
                        break;
                }

            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);

        }

        [HttpPost, ValidateInput(false)]
        public ActionResult CopyRulesetSpells(List<HttpPostedFileBase> clientImages)
        {
            try
            {
                //var UserId = User.Identity.GetUserId();
                //var _rulesetGeneralSettings = _rulesetService.CopyRulesetSpells(_copySpells, clientImages, UserId);
                var model = JsonConvert.DeserializeObject<List<Spells>>(Request.Form["_copySpells"]);
                string userId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.CopyRulesetSpells(model, clientImages, userId);
                // _response.PayLoad = _serviceResponseModel;
                //_response.StatusCode = 200;

                switch (_serviceResponseModel.StatusCode)
                {
                    case 200:
                        _response.StatusCode = 200;
                        _response.PayLoad = _serviceResponseModel.Result;
                        _response.ShowToUser = false;
                        break;
                    case 400:
                        _response.StatusCode = 400;
                        _response.ErrorMessage = _serviceResponseModel.ErrorMessage;
                        _response.ShowToUser = true;
                        break;
                    case 500:
                        _response.StatusCode = 400;
                        _response.ShowToUser = false;
                        break;
                }

            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);
            
        }

        public ActionResult DeleteSpell(List<Spells> deletespell)
        {
            try
            {
                var userId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.DeleteSpell(deletespell, userId);
                //_response.PayLoad = _rulesetGeneralSettings;
                //_response.StatusCode = 200;

                switch (_serviceResponseModel.StatusCode)
                {
                    case 200:
                        _response.StatusCode = 200;
                        _response.PayLoad = _serviceResponseModel.Result;
                        _response.ShowToUser = false;
                        break;
                    case 400:
                        _response.StatusCode = 400;
                        _response.ErrorMessage = _serviceResponseModel.ErrorMessage;
                        _response.ShowToUser = true;
                        break;
                    case 500:
                        _response.StatusCode = 400;
                        _response.ShowToUser = false;
                        break;
                }

            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);

        }

        //Backup for Seplls
        [HttpPost, ValidateInput(false)]
        public ActionResult CreateRulesetSpells_Bkp(List<HttpPostedFileBase> clientImages)
        {
            try
            {
                var a = Request.Form["_rulesetItems"];
                var model = JsonConvert.DeserializeObject<List<Spells>>(Request.Form["_rulesetSpells"]);
                var UserId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.CreateRulesetSpells(model, clientImages, UserId);
                //var UserId = User.Identity.GetUserId();
                //var _rulesetGeneralSettings = _rulesetService.CreateRulesetSpells(_rulesetSpells, clientImages, UserId);
                _response.PayLoad = _serviceResponseModel;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        [HttpPost, ValidateInput(false)]
        public ActionResult UpdateRulesetSpells_Bkp(List<HttpPostedFileBase> clientImages)
        {
            try
            {
                //var UserId = User.Identity.GetUserId();
                //var _rulesetGeneralSettings = _rulesetService.UpdateRulesetSpells(_updateSpells, clientImages, UserId);
                var model = JsonConvert.DeserializeObject<List<Spells>>(Request.Form["_updateSpells"]);
                string userId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.UpdateRulesetSpells(model, clientImages, userId);
                _response.PayLoad = _serviceResponseModel;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        [HttpPost, ValidateInput(false)]
        public ActionResult CopyRulesetSpells_Bkp(List<HttpPostedFileBase> clientImages)
        {
            try
            {
                //var UserId = User.Identity.GetUserId();
                //var _rulesetGeneralSettings = _rulesetService.CopyRulesetSpells(_copySpells, clientImages, UserId);
                var model = JsonConvert.DeserializeObject<List<Spells>>(Request.Form["_copySpells"]);
                string userId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.CopyRulesetSpells(model, clientImages, userId);
                _response.PayLoad = _serviceResponseModel;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        public ActionResult DeleteSpell_Bkp(List<Spells> deletespell)
        {
            try
            {
                var userId = User.Identity.GetUserId();
                var _rulesetGeneralSettings = _rulesetService.DeleteSpell(deletespell, userId);
                _response.PayLoad = _rulesetGeneralSettings;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        #endregion

        #region Ruleset Abilities
        public ActionResult GetRulesetAbilitiesByRulesetId(int RUlesetId)
        {
            try
            {
                var UserId = User.Identity.GetUserId();
                var _rulesetGeneralSettings = _rulesetService.GetRulesetAbilitiesByRulesetId(RUlesetId);
                _response.PayLoad = _rulesetGeneralSettings;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetRulesetAbilitiesMetadata(int? RulesetId)
        {
            try
            {
                var UserId = User.Identity.GetUserId();
                var _rulesetGeneralSettings = _rulesetService.GetRulesetAbilitiesMetadata(Convert.ToInt32(RulesetId));
                _response.PayLoad = _rulesetGeneralSettings;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }

        [HttpPost, ValidateInput(false)]
        public ActionResult CreateRulesetAbilities(List<HttpPostedFileBase> clientImages)
        {
            try
            {
                //var UserId = User.Identity.GetUserId();
                //var _rulesetGeneralSettings = _rulesetService.CreateRulesetAbilities(_rulesetAbilities, clientImages, UserId);
                var model = JsonConvert.DeserializeObject<List<Abilities>>(Request.Form["_rulesetAbilities"]);
                var UserId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.CreateRulesetAbilities(model, clientImages, UserId);
                //_response.PayLoad = _serviceResponseModel;
                //_response.StatusCode = 200;

                switch (_serviceResponseModel.StatusCode)
                {
                    case 200:
                        _response.StatusCode = 200;
                        _response.PayLoad = _serviceResponseModel.Result;
                        _response.ShowToUser = true;
                        break;
                    case 400:
                        _response.StatusCode = 400;
                        _response.ErrorMessage = _serviceResponseModel.ErrorMessage;
                        _response.ShowToUser = true;
                        break;
                    case 500:
                        _response.StatusCode = 400;
                        _response.ShowToUser = false;
                        break;
                }

            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);
        }

        [HttpPost, ValidateInput(false)]
        public ActionResult UpdateRulesetAbilities(List<HttpPostedFileBase> clientImages)
        {
            try
            {

                //var UserId = User.Identity.GetUserId();
                //var _rulesetGeneralSettings = _rulesetService.UpdateRulesetAbilities(_updateAbilities, clientImages, UserId);
                var model = JsonConvert.DeserializeObject<List<Abilities>>(Request.Form["_updateAbilities"]);
                var UserId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.UpdateRulesetAbilities(model, clientImages, UserId);
                 //_response.PayLoad = _serviceResponseModel;
                //_response.StatusCode = 200;
                

                switch (_serviceResponseModel.StatusCode)
                {
                    case 200:
                        _response.StatusCode = 200;
                        _response.PayLoad = _serviceResponseModel.Result;
                        _response.ShowToUser = true;
                        break;
                    case 400:
                        _response.StatusCode = 400;
                        _response.ErrorMessage = _serviceResponseModel.ErrorMessage;
                        _response.ShowToUser = true;
                        break;
                    case 500:
                        _response.StatusCode = 400;
                        _response.ShowToUser = false;
                        break;
                }

            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);
        }

        [HttpPost, ValidateInput(false)]
        public ActionResult CopyRulesetAbilities(List<HttpPostedFileBase> clientImages)
        {
            try
            {
                //var UserId = User.Identity.GetUserId();
                //var _rulesetGeneralSettings = _rulesetService.CopyRulesetAbilities(_copyAbilities, clientImages, UserId);
                var model = JsonConvert.DeserializeObject<List<Abilities>>(Request.Form["_copyAbilities"]);
                var UserId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.CopyRulesetAbilities(model, clientImages, UserId);
                //_response.PayLoad = _serviceResponseModel;
                //_response.StatusCode = 200;

                switch (_serviceResponseModel.StatusCode)
                {
                    case 200:
                        _response.StatusCode = 200;
                        _response.PayLoad = _serviceResponseModel.Result;
                        _response.ShowToUser = true;
                        break;
                    case 400:
                        _response.StatusCode = 400;
                        _response.ErrorMessage = _serviceResponseModel.ErrorMessage;
                        _response.ShowToUser = true;
                        break;
                    case 500:
                        _response.StatusCode = 400;
                        _response.ShowToUser = false;
                        break;
                }

            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);
        }

        public ActionResult DeleteAbility(List<Abilities> deleteability)
        {
            try
            {
                var userId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.DeleteAbility(deleteability, userId);
                //_response.PayLoad = _rulesetGeneralSettings;
                //_response.StatusCode = 200;

                switch (_serviceResponseModel.StatusCode)
                {
                    case 200:
                        _response.StatusCode = 200;
                        _response.PayLoad = _serviceResponseModel.Result;
                        _response.ShowToUser = true;
                        break;
                    case 400:
                        _response.StatusCode = 400;
                        _response.ErrorMessage = _serviceResponseModel.ErrorMessage;
                        _response.ShowToUser = true;
                        break;
                    case 500:
                        _response.StatusCode = 400;
                        _response.ShowToUser = false;
                        break;
                }

            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);
        }


        //Backup for Ability
        [HttpPost, ValidateInput(false)]
        public ActionResult CreateRulesetAbilities_Bkp(List<HttpPostedFileBase> clientImages)
        {
            try
            {
                //var UserId = User.Identity.GetUserId();
                //var _rulesetGeneralSettings = _rulesetService.CreateRulesetAbilities(_rulesetAbilities, clientImages, UserId);
                var model = JsonConvert.DeserializeObject<List<Abilities>>(Request.Form["_rulesetAbilities"]);
                var UserId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.CreateRulesetAbilities(model, clientImages, UserId);
                _response.PayLoad = _serviceResponseModel;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        [HttpPost, ValidateInput(false)]
        public ActionResult UpdateRulesetAbilities_Bkp(List<HttpPostedFileBase> clientImages)
        {
            try
            {
                //var UserId = User.Identity.GetUserId();
                //var _rulesetGeneralSettings = _rulesetService.UpdateRulesetAbilities(_updateAbilities, clientImages, UserId);
                var model = JsonConvert.DeserializeObject<List<Abilities>>(Request.Form["_updateAbilities"]);
                var UserId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.UpdateRulesetAbilities(model, clientImages, UserId);
                _response.PayLoad = _serviceResponseModel;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        [HttpPost, ValidateInput(false)]
        public ActionResult CopyRulesetAbilities_Bkp(List<HttpPostedFileBase> clientImages)
        {
            try
            {
                //var UserId = User.Identity.GetUserId();
                //var _rulesetGeneralSettings = _rulesetService.CopyRulesetAbilities(_copyAbilities, clientImages, UserId);
                var model = JsonConvert.DeserializeObject<List<Abilities>>(Request.Form["_copyAbilities"]);
                var UserId = User.Identity.GetUserId();
                _serviceResponseModel = _rulesetService.CopyRulesetAbilities(model, clientImages, UserId);
                _response.PayLoad = _serviceResponseModel;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        public ActionResult DeleteAbility_Bkp(List<Abilities> deleteability)
        {
        //    try
        //    {
        //        var UserId = User.Identity.GetUserId();
        //        var _rulesetGeneralSettings = _rulesetService.DeleteAbility(deleteability);
        //        _response.PayLoad = _rulesetGeneralSettings;
        //        _response.StatusCode = 200;
        //    }
        //    catch (Exception ex)
        //    {
        //        _response.StatusCode = 400;
        //        _response.ErrorMessage = ex.Message;
        //        _response.ShowToUser = false;
        //    }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }

        #endregion
        #region
        public ActionResult GetTilesMetadataForRuleset()
        {
            try
            {
                var UserId = User.Identity.GetUserId();
                var _rulesetGeneralSettings = _rulesetService.GetTilesMetadataForRuleset();
                _response.PayLoad = _rulesetGeneralSettings;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        public ActionResult SaveOrUpdateRulesetContentTiles(RulesetContentForTiles _rulesetContent)
        {
            try
            {
                var UserId = User.Identity.GetUserId();
                var _rulesetGeneralSettings = _rulesetService.SaveOrUpdateRulesetTiles(_rulesetContent, UserId);
                _response.PayLoad = _rulesetGeneralSettings;
                _response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }

            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        #endregion
    }
}
