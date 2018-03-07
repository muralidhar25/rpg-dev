using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using RPGSmith.ViewModels;
using RPGSmith.Data;
using RPGSmith.Data.Models;
using RPGSmith.Models;
using RPGSmith.Web.ViewModels;
namespace RPGSmith.DomainServices
{
    public class TabService
    {
        private readonly RPGSmithContext _context;
        ServiceResponseModel _serviceResponseModel = new ServiceResponseModel();
        public TabService()
        {
            RPGSmithContext dbContext = new RPGSmithContext();
            _context = dbContext;

        }
        #region Tab
        public List<Tab> GetTabListByLayoutId(int? LayoutId)
        {
            if (LayoutId != null)
            {
                List<Tab> TabList = new List<Tab>();
                List<Tab> _tabs = _context.Tabs.Where(x => x.LayoutId == LayoutId).ToList();
                for (var i = 0; i < _tabs.Count; i++)
                {
                    TabList.Add(new Tab()
                    {
                        AspNetUser = _tabs[i].AspNetUser,
                        Authored = _tabs[i].Authored,
                        Edited = _tabs[i].Edited,
                        LayoutId = _tabs[i].LayoutId,
                        TabId = _tabs[i].TabId,
                        TabName = _tabs[i].TabName,
                        TabOrder = _tabs[i].TabOrder,
                        UserId = _tabs[i].UserId,
                        //Tiles = new TileService().GetTileListByTabId(_tabs[i].TabId).ToList(),
                    });
                }
                return TabList;
            }
            return null;
        }
        public Tab GetTabByTabId(int? TabId)
        {
            if (TabId != null)
            {
                Tab _tab = _context.Tabs.Where(x => x.TabId == TabId).SingleOrDefault();
               // _tab.Tiles = new TileService().GetTileListByTabId(TabId).ToList();
                return _tab;
            }
            return null;
        }
        public ServiceResponseModel AddOrUpdateTab(TabViewModel tabmodel, string userId)
        {
            //TabViewModel tabmodelResult = tabmodel;
            List< TileViewModel> newTileList = new List<TileViewModel>();
            //Getting Tab Details by LayoutId
          
                var _tabDetails = _context.Tabs.Where(p => p.TabId == tabmodel.TabId).SingleOrDefault();
                var Message = string.Empty;

                //Tile _tile = new Tile();
                if (_tabDetails == null)
                {
                    Tab tab = new Tab();
                    tab.Authored = Convert.ToDateTime(DateTime.Now.ToString());
                    tab.Edited = Convert.ToDateTime(DateTime.Now.ToString());
                    tab.TabName = tabmodel.TabName;
                    tab.UserId = userId;
                    tab.LayoutId = tabmodel.LayoutId;
                    tab.TabOrder = 1;
                    _context.Tabs.Add(tab);
                    int _rowseffected = _context.SaveChanges();
                    if (_rowseffected > 0)
                    {
                        tabmodel.TabId = tab.TabId;
                        if (tabmodel.TileList != null)
                        {
                            foreach (var _tabTile in tabmodel.TileList)
                            {
                                _tabTile.TabId = tab.TabId;
                                _tabTile.UserId = tab.UserId;
                                _tabTile.TileLocationId = 1;
                                ServiceResponseModel _tileServiceResponseModel = new TileService().AddOrUpdateTile(_tabTile, userId);

                                if (_tileServiceResponseModel.StatusCode == 200)
                                {
                                    newTileList.Add((TileViewModel)_tileServiceResponseModel.Result);
                                }
                                else
                                {
                                    newTileList.Add(_tabTile);
                                    tabmodel.TileList = newTileList;
                                }
                            }
                        }


                        _serviceResponseModel.StatusCode = 200;
                        _serviceResponseModel.Result = tabmodel;
                    }
                    else
                    {
                        _serviceResponseModel.StatusCode = 400;
                        _serviceResponseModel.Result = tabmodel;
                    }

                }
                else
                {
                    //Updating Tab
                    _tabDetails.Edited = Convert.ToDateTime(DateTime.Now.ToString());
                    _tabDetails.TabName = tabmodel.TabName;
                    _tabDetails.UserId = userId;
                    _tabDetails.LayoutId = tabmodel.LayoutId;
                    _tabDetails.TabOrder = (short)tabmodel.TabOrder;
                    _tabDetails.TabId = tabmodel.TabId;

                    int _rowseffected = _context.SaveChanges();
                    //_tabDetails.Tiles = new TileService().GetTileListByTabId(_tabDetails.TabId).ToList();
                    //Setting new model updated tile list data in to dbTileList data
                    if (tabmodel.TileList != null)
                    {
                        foreach (var _tabTile in tabmodel.TileList)
                        {
                            _tabTile.TabId = _tabDetails.TabId;
                            _tabTile.TileLocationId = 1;
                            ServiceResponseModel _tileServiceResponseModel = new TileService().AddOrUpdateTile(_tabTile, userId);
                            if (_tileServiceResponseModel.StatusCode == 200)
                            {
                                newTileList.Add((TileViewModel)_tileServiceResponseModel.Result);
                            }
                            else
                            {
                                newTileList.Add(_tabTile);
                            }
                        }
                    }


                    tabmodel.TabId = _tabDetails.TabId;
                    _serviceResponseModel.StatusCode = 200;
                    _serviceResponseModel.Result = tabmodel;

                }
            
            return _serviceResponseModel;
            //return TabId;
        }
        public ServiceResponseModel DeleteTab(TabViewModel deleteTab,string userId)
        {
            //Getting Layout Id  from db using TabId
            var layoutId = _context.Tabs.Where(c => c.TabId == deleteTab.TabId).Select(x=>x.LayoutId).FirstOrDefault();
            //Getting Tab Record from db using TabId
            var deleteTabId = _context.Tabs.Where(c => c.TabId == deleteTab.TabId).FirstOrDefault();
            _context.Tabs.Remove(deleteTabId);
            _context.SaveChanges();

            if (_context.Tabs.Where(x => x.LayoutId == layoutId).Count() <= 0)
            {
                Tab tab = new Tab()
                {
                    UserId = userId,
                    Authored = DateTime.Now,
                    Edited = DateTime.Now,
                    TabName = "Default",
                    LayoutId = layoutId,
                    TabOrder = 1,
                };
                _context.Tabs.Add(tab);
                _context.SaveChanges();
            }
            _serviceResponseModel.Result = deleteTab;
            return _serviceResponseModel;
        }
        #endregion
        #region Server Validation
        public string ValidationForAddOrUpdateTab(TabViewModel tabViewModel, string userId, out int resultStatus)
        {
            string Errors = "";
            resultStatus = 0; // 0-NoError   1-Error

            if (tabViewModel.TabName != null && tabViewModel.TabName != "")
            {
                IEnumerable<Tab> _tab = _context.Tabs.Where(x => x.UserId == userId && x.LayoutId == tabViewModel.LayoutId && x.LayoutId == tabViewModel.LayoutId && x.TabName == tabViewModel.TabName).ToList();
                if (_tab.Count() > 0)
                {
                    Errors = Errors + "Tab Name Already Exist.";
                    resultStatus = 1;
                }
            }
            else
            {
                Errors = Errors + "Please Enter Tab Name.";
                resultStatus = 1;
            }

            return Errors;
        }
        #endregion
    }
}