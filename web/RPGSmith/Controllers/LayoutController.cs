using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using RPGSmith.DomainServices;
using RPGSmith.Web.ViewModels;
using RPGSmith.ViewModels;
using RPGSmith.Data.Models;
using Microsoft.AspNet.Identity;
using RPGSmith.Web.Utilities;

namespace RPGSmith.Controllers
{
    [Authorize]
    public class LayoutController : Controller
    {
        ServiceResponseModel _serviceResponseModel = new ServiceResponseModel();
        LayoutService _layoutService;
        ResponseViewModel _response;
        public LayoutController()//, ApplicationUserManager userManager) : base(userManager)
        {
            _layoutService = new LayoutService();
            _response = new ResponseViewModel();
        }
        #region Layout
        // GET: Layout
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult GetNewLayout()
        {
            try
            {
                LayoutViewModel _layoutViewModel = new LayoutViewModel();
                _layoutViewModel = _layoutService.GetNewLayout();
                _response.PayLoad = _layoutViewModel;
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
        [HttpGet]
        // GET: Character
        public JsonResult Get(int? CharacterProfileId)
        {
            try
            {
                //Session["UserId"] = User.Identity.GetUserId();
                List<LayoutViewModel> _lstlayoutViewModel = new List<LayoutViewModel>();
                if (CharacterProfileId != null)
                {
                    //Getting Layout dbResult Values
                    var LayoutResult = _layoutService.GetLayoutByCharacterProfileID(CharacterProfileId).ToList();
                    //Setting Layout dbResult Values
                    _lstlayoutViewModel = _layoutService.SetLayoutListViewModel(LayoutResult);
                    _response.PayLoad = _lstlayoutViewModel;
                    _response.StatusCode = 200;
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

        public ActionResult GetLayouByLayoutId(int? LayoutId)
        {
            try
            {
                LayoutViewModel _layoutViewModel = new LayoutViewModel();
                if (LayoutId > 0)
                {
                    var LayoutDetails = _layoutService.GetLayoutByLayoutId(LayoutId);
                    _layoutViewModel = new LayoutService().SetLayoutViewModel(LayoutDetails);
                    _response.PayLoad = _layoutViewModel;
                    _response.StatusCode = 200;
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
        public ActionResult Create(LayoutViewModel layoutmodel)
        {
            try
            {
                string userId = User.Identity.GetUserId();
                layoutmodel.UserId = User.Identity.GetUserId();
                _serviceResponseModel = _layoutService.AddOrUpdateLayout(layoutmodel, userId,false);

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
        public ActionResult Update(LayoutViewModel layoutmodel)
         {
            try
            {
                string userId = User.Identity.GetUserId();
                _serviceResponseModel = _layoutService.AddOrUpdateLayout(layoutmodel, userId,true);

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
        public ActionResult Copy(LayoutViewModel layoutmodel)
        {
            try
            {
                string userId = User.Identity.GetUserId();
                layoutmodel.UserId = User.Identity.GetUserId();

                //_serviceResponseModel = _layoutService.CopyLayout(layoutmodel, userId);
                _serviceResponseModel = _layoutService.AddOrUpdateLayout(layoutmodel, userId,false);

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
        public ActionResult DeleteLayout(LayoutViewModel  deleteLayout)
        {
            try
            {
                string userId = User.Identity.GetUserId();
                _serviceResponseModel = _layoutService.DeleteLayout(deleteLayout, userId);  

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

        //[HttpPost]
        //public ActionResult Create1(LayoutViewModel layoutmodel)
        //{
        //   try
        //    {
        //        layoutmodel.UserId = User.Identity.GetUserId();//UserID;
        //        if (layoutmodel.UserId != null && layoutmodel.UserId != "")
        //        {
        //            //var LayoutModel = _layoutService.CopyLayout(layoutmodel);
        //            //_response.PayLoad = LayoutModel;
        //            //_response.StatusCode = 200;
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
        //public ActionResult Update1(LayoutViewModel layoutmodel)
        //{

        //    try
        //    {
        //        layoutmodel.UserId = User.Identity.GetUserId();//UserID;
        //        if (layoutmodel.UserId != null && layoutmodel.UserId != "" && layoutmodel.LayoutId != 0)
        //        {
        //            //string UpdateLayout = _layoutService.AddOrUpdateLayout(layoutmodel);
        //            //_response.PayLoad = UpdateLayout;
        //            //_response.StatusCode = 200;
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
        //public ActionResult Copy1(LayoutViewModel layoutmodel)
        //{
        //    try
        //    {   string userId = User.Identity.GetUserId();
        //        layoutmodel.UserId = User.Identity.GetUserId();//UserID;
        //        if (layoutmodel.UserId != null && layoutmodel.UserId != "")
        //        {
        //            //LayoutViewModel CopyLayout = _layoutService.CopyLayout(layoutmodel);
        //            //_response.PayLoad = CopyLayout;
        //            //_response.StatusCode = 200;
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
        //public ActionResult DeleteLayout(int? LayoutID)
        //{
        //    try
        //    {
        //        var deleteLayout = _layoutService.DeleteLayout(LayoutID);
        //        _response.PayLoad = deleteLayout;
        //        _response.StatusCode = 200;
        //    }
        //    catch (Exception ex)
        //    {
        //        _response.StatusCode = 400;
        //        _response.ErrorMessage = ex.Message;
        //        _response.ShowToUser = false;
        //    }
        //    return Json(_response, JsonRequestBehavior.AllowGet);
        //}
        #endregion
        #region Dice
        public ActionResult GetDiceList(int characterProfileId)
        {
            try
            {
                var dicelst = _layoutService.GetDiceNames(characterProfileId);
                _response.PayLoad = dicelst;
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
        public ActionResult SaveVirtualDice(UserDiceSelection dice)
        {
            try
            {
                dice.UserId = User.Identity.GetUserId();
                dice.LastRunTime = Convert.ToDateTime(DateTime.Now.ToString());
                if (dice.UserId != null)
                {
                    var dicesave = _layoutService.SaveUserVirtualDice(dice);
                    _response.PayLoad = dicesave;
                    _response.StatusCode = 200;
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
        public ActionResult GetDefaultDiceByCharacter(int CharacterProfileID)
        {
            try
            {
                //dice.UserId = User.Identity.GetUserId();
                //dice.LastRunTime = Convert.ToDateTime(DateTime.Now.ToString());
                //if (dice.UserId != null)
                //{
                var diceCommand = _layoutService.GetCharacterDefaultDice(CharacterProfileID);
                _response.PayLoad = diceCommand;
                _response.StatusCode = 200;
                //}

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