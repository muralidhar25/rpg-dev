using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using RPGSmith.DomainServices;
using RPGSmith.Web.ViewModels;

namespace RPGSmith.Controllers
{
    [Authorize]
    public class RPGSmithTypeController : Controller
    {
        RPGSmithTypeService _rpgSmithTypeService;
        ResponseViewModel _response;
        #region RPGSmith Types
        public RPGSmithTypeController()
        {
            _rpgSmithTypeService = new RPGSmithTypeService();
            _response = new ResponseViewModel();
        }
        // GET: RPGSmithType
        public JsonResult Get()
        {
            try
            {
                List<RPGSmithTypeViewModel> _rpgSmithTypeViewModel = new List<RPGSmithTypeViewModel>();

                _rpgSmithTypeViewModel = _rpgSmithTypeService.GetRPGSmithTypes().Select(x =>
                new RPGSmithTypeViewModel
                {
                    TypeId = x.TypeId,
                    Name = x.Name,
                    AllowedValues = x.AllowedValues,
                    Units = x.Units,
					Description = x.Description,
					Examples = x.Examples
                }).ToList();

                _response.PayLoad = _rpgSmithTypeViewModel;
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
        public JsonResult GetRPGSmithTypeForCoreStat()
        {
            try
            {
                List<RPGSmithTypeViewModel> _rpgSmithTypeViewModel = new List<RPGSmithTypeViewModel>();

                _rpgSmithTypeViewModel = _rpgSmithTypeService.GetRPGSmithTypesForCoreStat().Select(x =>
                    new RPGSmithTypeViewModel
                    {
                        TypeId = x.TypeId,
                        Name = x.Name,
                        AllowedValues = x.AllowedValues,
                        Units = x.Units,
						Description = x.Description,
						Examples = x.Examples
                    }).ToList();

                _response.PayLoad = _rpgSmithTypeViewModel;
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