using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using RPGSmith.DomainServices;
using RPGSmith.Web.ViewModels;
using RPGSmith.Data;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
namespace RPGSmith.Controllers
{
   [Authorize]
    public class CharacterController : Controller
    {
        CharacterService _characterService;
        CorestatService _corestatService;
        ResponseViewModel _response;
        ServiceResponseModel _serviceResponseModel = new ServiceResponseModel();

        public CharacterController()//, ApplicationUserManager userManager) : base(userManager)
        {
            _characterService = new CharacterService();
            _response = new ResponseViewModel();
            _corestatService = new CorestatService();
        }
        #region Character
        [HttpGet]
        // GET: Character

        public JsonResult GetHeaderContentsCounts()
        {
            try
            {
               HeaderContentCounts _HeaderContentCountsViewModel = new  HeaderContentCounts();
                _HeaderContentCountsViewModel = _characterService.GetHeaderContentsCounts(User.Identity.GetUserId());
                _response.PayLoad = _HeaderContentCountsViewModel;
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
        public JsonResult Get()
        {
            try
            {
                List<CharacterViewModel> _characterViewModel = new List<CharacterViewModel>();
                _characterViewModel = _characterService.GetCharactersByUserID(User.Identity.GetUserId()).Select(x =>
                     new CharacterViewModel
                     {
                         Id = x.CharacterProfileId,
                         CampaignId = x.CampaignId,
                         Name = x.Name,
                         Portrait = x.Portrait,
                         RulesetId = Convert.ToInt32(x.RulesetId)

                     }).ToList();

                _response.PayLoad = _characterViewModel;
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
        public ActionResult Create(CharacterViewModel charactermodel)
        {
            try
            {
                string userId = User.Identity.GetUserId();
                charactermodel.UserId= User.Identity.GetUserId();
                _serviceResponseModel = _characterService.AddCharacter(charactermodel, userId);

                if(_serviceResponseModel.StatusCode==200)
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
        public ActionResult DeleteCharacter(int? UserID)
        {
            try
            {
                int CharecterId = Convert.ToInt32(UserID);
                string userId = User.Identity.GetUserId();
                _serviceResponseModel = _characterService.DeleteCharacter(CharecterId, userId);

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
        [HttpPost]
        public ActionResult Edit(CharacterViewModel UpdateModel)
        {
            try
            {
                string userId = User.Identity.GetUserId();
                _serviceResponseModel = _characterService.EditCharacter(UpdateModel, userId);

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
        public ActionResult Copy(CharacterViewModel UpdateModel)
        {
            try
            {
                string userId = User.Identity.GetUserId();
                _serviceResponseModel = _characterService.CopyCharacter(UpdateModel, userId);

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
        public ActionResult GetCorestatsByCharacter(int CharacterId)
        {
            try
            {
                var corestatsValue = _corestatService.GetCorestatsByCharacter(CharacterId);
                _response.PayLoad = corestatsValue;
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
        public ActionResult GetCharacterContentsByCharacterProfileId(int? CharacterProfileId)
        {
            try
            {
                var CharacterContentsValues = _characterService.GetCharacterContentsByCharacterProfileId(CharacterProfileId);
                _response.PayLoad = CharacterContentsValues;
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
        public ActionResult GetCharacterInventoryByCharacterProfileId(int? CharacterProfileId)
        {
            try
            {
                var CharacterContentsValues = _characterService.GetInventoryByCharacterProfileId(CharacterProfileId);
                _response.PayLoad = CharacterContentsValues;
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
        public ActionResult GetCharacterItemInventoryByCharacterProfileId(int? CharacterProfileId)
        {
            try
            {
                var CharacterContentsValues = _characterService.GetItemInventoryByCharacterProfileId(CharacterProfileId);
                _response.PayLoad = CharacterContentsValues;
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
        public ActionResult GetCharacterSpellInventoryByCharacterProfileId(int? CharacterProfileId)
        {
            try
            {
                var CharacterContentsValues = _characterService.GetSpellInventoryByCharacterProfileId(CharacterProfileId);
                _response.PayLoad = CharacterContentsValues;
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
        public ActionResult GetCharacterAbilityInventoryByCharacterProfileId(int? CharacterProfileId)
        {
            try
            {
                var CharacterContentsValues = _characterService.GetAbilityInventoryByCharacterProfileId(CharacterProfileId);
                _response.PayLoad = CharacterContentsValues;
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
        public ActionResult CreateCharacterInventoryItems(List<CharacterItems> _characterInventoryItems)
        {
            try
            {
                string userId = User.Identity.GetUserId();

                _serviceResponseModel = _characterService.CreateCharacterInventoryItems(_characterInventoryItems, userId);

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
        public ActionResult CreateCharacterInventorySpells(List<CharacterSpells> _characterInventorySpells)
        {

            try
            {
                string userId = User.Identity.GetUserId();

                _serviceResponseModel = _characterService.CreateCharacterInventorySpells(_characterInventorySpells, userId);

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
        public ActionResult CreateCharacterInventoryAbility(List<CharacterAbilities> _characterInventoryAbility)
        {

            try
            {
                string userId = User.Identity.GetUserId();

                _serviceResponseModel = _characterService.CreateCharacterInventoryAbility(_characterInventoryAbility, userId);

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
        public ActionResult EditCharacterContentValues(CharacterContent charactercontentvalues)
        {

            try
            {

                string userId = User.Identity.GetUserId();
                _serviceResponseModel = _characterService.EditCharacterContentValues(charactercontentvalues, userId);

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
        public ActionResult CopyCharacterContentValues(CharacterContent _characterContent)
        {
            try
            {
                string userId = User.Identity.GetUserId();
                _serviceResponseModel = _characterService.CopyCharacterContentValues(_characterContent, userId);

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

        public ActionResult DeleteCharacterContentValues(int CharacterItemId)
        {
            try
            {
                string userId = User.Identity.GetUserId();
                _serviceResponseModel = _characterService.DeleteCharacterItemContentValues(CharacterItemId, userId);

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
        public ActionResult DeleteCharacterSpellContentValues(int CharacterSpellId)
        {
            try
            {
                string userId = User.Identity.GetUserId();
                _serviceResponseModel = _characterService.DeleteCharacterSpellContentValues(CharacterSpellId, userId);

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
        public ActionResult DeleteCharacterAbilityContentValues(int CharacterAbilityId)
        {
            try
            {
                string userId = User.Identity.GetUserId();
                _serviceResponseModel = _characterService.DeleteCharacterAbilityContentValues(CharacterAbilityId, userId);

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
        public ActionResult CreateCharacterInventoryItems1(List<CharacterItems> _characterInventoryItems)
        {
            try
            {
                //var UserId = User.Identity.GetUserId();
                //var CharacterContentsValues = _characterService.CreateCharacterInventoryItems(_characterInventoryItems, UserId);
                //_response.PayLoad = CharacterContentsValues;
                //_response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        public ActionResult CreateCharacterInventorySpells1(List<CharacterSpells> _characterInventorySpells)
        {
            try
            {
                //var UserId = User.Identity.GetUserId();
                //var CharacterContentsValues = _characterService.CreateCharacterInventorySpells(_characterInventorySpells, UserId);
                //_response.PayLoad = CharacterContentsValues;
                //_response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        public ActionResult CreateCharacterInventoryAbility1(List<CharacterAbilities> _characterInventoryAbility)
        {
            try
            {
                //var UserId = User.Identity.GetUserId();
                //var CharacterContentsValues = _characterService.CreateCharacterInventoryAbility(_characterInventoryAbility, UserId);
                //_response.PayLoad = CharacterContentsValues;
                //_response.StatusCode = 200;
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
        public ActionResult EditCharacterContentValues1(CharacterContent charactercontentvalues)
        {
            try
            {
                //var characterContents = _characterService.EditCharacterContentValues(charactercontentvalues);
                //_response.PayLoad = characterContents;
                //_response.StatusCode = 200;
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
        public ActionResult CopyCharacterContentValues1(CharacterContent _characterContent)
        {
            try
            {
                //var characterContents = _characterService.CopyCharacterContentValues(_characterContent);
                //_response.PayLoad = characterContents;
                //_response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        public ActionResult DeleteCharacterContentValues1(int CharacterItemId)
        {
            try
            {
                //var characterContents = _characterService.DeleteCharacterItemContentValues(CharacterItemId);
                //_response.PayLoad = characterContents;
                //_response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        public ActionResult DeleteCharacterSpellContentValues1(int CharacterSpellId)
        {
            try
            {
                //var characterContents = _characterService.DeleteCharacterSpellContentValues(CharacterSpellId);
                //_response.PayLoad = characterContents;
                //_response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);
        }
        public ActionResult DeleteCharacterAbilityContentValues1(int CharacterAbilityId)
        {
            try
            {
                //var characterContents = _characterService.DeleteCharacterAbilityContentValues(CharacterAbilityId);
                //_response.PayLoad = characterContents;
                //_response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }
            return Json(_response, JsonRequestBehavior.AllowGet);
        }

        public ActionResult UpdateItemEquipContent(CharacterItemsProperties _CharacterItemsValues)
        {
            try
            {
                var characterContents = _characterService.UpdateItemEquipContent(_CharacterItemsValues);
                _response.PayLoad = characterContents;
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
        public ActionResult UpdateSpellMemorizeContent(CharacterSpellsProperties _CharacterSpellValues)
        {
            try
            {
                var characterContents = _characterService.UpdateSpellMemorizeContent(_CharacterSpellValues);
                _response.PayLoad = characterContents;
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
        public ActionResult UpdateAbilityEnabledContent(CharacterAbilitiesProperties _CharacterabilityValues)
        {
            try
            {
                var characterContents = _characterService.UpdateAbilityEnabledContent(_CharacterabilityValues);
                _response.PayLoad = characterContents;
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
        public ActionResult CreateCharacterInventoryItemTiles(List<CharacterItems> _characterInventoryItems)
        {
            try
            {
                string userId = User.Identity.GetUserId();

                _serviceResponseModel = _characterService.CreateInventoryItemTiles(_characterInventoryItems, userId);

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
        public ActionResult CreateCharacterInventorySpellTiles(List<CharacterSpells> _characterInventorySpells)
        {
            try
            {
                string userId = User.Identity.GetUserId();

                _serviceResponseModel = _characterService.CreateInventorySpellTiles(_characterInventorySpells, userId);

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
        public ActionResult CreateCharacterInventoryAbilityTiles(List<CharacterAbilities> _characterInventoryAbilities)
        {
            try
            {
                string userId = User.Identity.GetUserId();

                _serviceResponseModel = _characterService.CreateInventoryAbilityTiles(_characterInventoryAbilities, userId);

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

        #endregion
        #region CoreStats
        [HttpPost]
        public ActionResult CreateCorestatsValues(CharacterViewModel model)
        {
            try
            {
                var corestats = _corestatService.AddOrUpdateCoreStatValues(model);
                _response.PayLoad = corestats;
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
        public ActionResult UpdateCorestatsValues(CharacterViewModel model)
        {
            try
            {
                var corestatsValue = _corestatService.AddOrUpdateCoreStatValues(model);
                _response.PayLoad = corestatsValue;
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
