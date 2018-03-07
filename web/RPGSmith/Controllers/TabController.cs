using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using RPGSmith.DomainServices;
using RPGSmith.Web.ViewModels;
using RPGSmith.ViewModels;
using Microsoft.AspNet.Identity;

namespace RPGSmith.Controllers
{
    [Authorize]
    public class TabController : Controller
    {

        TabService _tabService;
        ResponseViewModel _response;
        ServiceResponseModel _serviceResponseModel = new ServiceResponseModel();
        public TabController()//, ApplicationUserManager userManager) : base(userManager)
        {
            _tabService = new TabService();
            _response = new ResponseViewModel();
        }
        #region Tab
        [HttpGet]
        // GET: Tab
        public JsonResult GetTabListByLayoutId(int? LayoutId)
        {
            try
            {
                List<TabViewModel> _tabViewModel = new List<TabViewModel>();
                _tabViewModel = _tabService.GetTabListByLayoutId(LayoutId).Select(x =>
                     new TabViewModel
                     {
                         LayoutId = x.LayoutId,
                         TabName = x.TabName,
                         UserId = Convert.ToString(x.UserId),
                         TabId = x.TabId,
                         TabOrder = x.TabOrder
                     }).ToList();
                _response.PayLoad = _tabViewModel;
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
        public ActionResult GetTabByTabId(int? TabId)
        {
            try
            {
                TabViewModel _tabViewModel = new TabViewModel();
                if (TabId > 0)
                {
                    var TabDetails = _tabService.GetTabByTabId(TabId);
                    _tabViewModel.TabId = TabDetails.TabId;
                    _tabViewModel.LayoutId = TabDetails.LayoutId;
                    _tabViewModel.UserId = Convert.ToString(TabDetails.UserId);
                    _tabViewModel.TabName = TabDetails.TabName;
                    _tabViewModel.TabOrder = TabDetails.TabOrder;
                    //_tabViewModel.Authored = TabDetails.Authored;
                    //_tabViewModel.Edited = TabDetails.Edited;
                    _response.PayLoad = _tabViewModel;
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
        public ActionResult Create(TabViewModel tabmodel)
        {
            try
            {
                string UserId = User.Identity.GetUserId();
                if (UserId != null && UserId != "" && tabmodel.LayoutId != 0)
                {
                    _serviceResponseModel = _tabService.AddOrUpdateTab(tabmodel, UserId);
                    _response.PayLoad = tabmodel;
                    _response.StatusCode = 200;
                }
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
        public ActionResult Update(TabViewModel tabmodel)
        {
            try
            {
                string UserId = User.Identity.GetUserId();
                if (UserId != null && UserId != "" && tabmodel.LayoutId != 0)
                {
                    _serviceResponseModel = _tabService.AddOrUpdateTab(tabmodel, UserId);
                    _response.PayLoad = tabmodel;
                    _response.StatusCode = 200;
                }
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
        public ActionResult DeleteTab(TabViewModel deleteTab)
        {
            try
            {
                string userId = User.Identity.GetUserId();

                var deletedTab = _tabService.DeleteTab(deleteTab, userId);
                _response.PayLoad = deleteTab;
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