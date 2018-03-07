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
    public class TileController : Controller
    {
        TileService _tileService;
        ResponseViewModel _response;
        public TileController()//, ApplicationUserManager userManager) : base(userManager)
        {
            _tileService = new TileService();
            _response = new ResponseViewModel();
        }
        #region Tile
        [HttpGet]
        public ActionResult GetTileTypes()
        {
            try
            {
                var AddTile = _tileService.GetTileTypes();
                _response.PayLoad = AddTile;
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
        // GET: Tile
        public JsonResult GetTileListByTabId(int? TabId)
        {
            try
            {
                List<TileViewModel> _tileViewModel = new List<TileViewModel>();
                _tileViewModel = _tileService.GetTileListByTabId(TabId).Select(x =>
                     new TileViewModel
                     {
                         EntityId = x.EntityId,
                         Height = x.Height,
                         Width = x.Width,
                         Style = x.Style,
                         TabId = x.TileContentId,
                         TileId = x.TileId,
                         TileTypeId = x.TileTypeId,
                         UserId = Convert.ToString(x.UserId),
                         X = x.X,
                         Y = x.Y
                     }).ToList();
                _response.PayLoad = _tileViewModel;
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
        public ActionResult GetTileByTileId(int? TileId)
        {
            try
            {
                TileViewModel _tileViewModel = new TileViewModel();
                if (TileId > 0)
                {
                    var TileDetails = _tileService.GetTileByTileId(TileId);
                    //_tileViewModel.Authored = TileDetails.Authored;
                    _tileViewModel.EntityId = TileDetails.EntityId;
                    _tileViewModel.Height = TileDetails.Height;
                    _tileViewModel.Width = TileDetails.Width;
                    _tileViewModel.Style = TileDetails.Style;
                    _tileViewModel.TabId = TileDetails.TileContentId;
                    _tileViewModel.TileId = TileDetails.TileId;
                    _tileViewModel.TileTypeId = TileDetails.TileTypeId;
                    _tileViewModel.UserId = Convert.ToString(TileDetails.UserId);
                    _tileViewModel.X = TileDetails.X;
                    _tileViewModel.Y = TileDetails.Y;
                    //_tileViewModel.Edited = TileDetails.Edited;
                    _response.PayLoad = _tileViewModel;
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
        public ActionResult Create(TileViewModel tilemodel)
        {
            try
            {
                //tilemodel.UserId = "5a30d199-f47f-44a4-a6b6-c38062356ba3";//UserID;
                string UserId = User.Identity.GetUserId();
                if (tilemodel.UserId != null && tilemodel.UserId != "" && tilemodel.TabId > 0)
                {
                    int AddTile = (int)((TileViewModel)_tileService.AddOrUpdateTile(tilemodel, UserId).Result).TileId;
                    _response.PayLoad = tilemodel;
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
        public ActionResult Update(TileViewModel tilemodel)
        {
            try
            {
                string UserId = User.Identity.GetUserId();//UserID;
                if (tilemodel.UserId != null && tilemodel.UserId != "" && tilemodel.TabId > 0)
                {
                    TileViewModel tilemodelresult = (TileViewModel)_tileService.AddOrUpdateTile(tilemodel, UserId).Result;
                    _response.PayLoad = tilemodelresult;
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
        public ActionResult DeleteTile(TileViewModel Tile)
        {
            try
            {
                var deleteTile = _tileService.DeleteTile(Tile);
                _response.PayLoad = deleteTile;
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
        #region Tile Types
        public ActionResult GetAllTileTypesRelatedCharacter(int? CharacterProfileID)
        {
            try
            {
                if (CharacterProfileID != null && CharacterProfileID > 0)
                {
                    var TileTypelst = _tileService.GetAllTileTypesRelatedCharacter(CharacterProfileID);
                    _response.PayLoad = TileTypelst;
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
        #endregion
    }
}