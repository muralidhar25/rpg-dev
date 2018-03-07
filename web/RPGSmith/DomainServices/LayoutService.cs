using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using RPGSmith.ViewModels;
using RPGSmith.Data;
using RPGSmith.Data.Models;
using RPGSmith.Web.Utilities;
using Microsoft.AspNet.Identity;
using System.Net.Http;
using RPGSmith.Web.ViewModels;

namespace RPGSmith.DomainServices
{
    public class LayoutService
    {
        ServiceResponseModel _serviceResponseModel = new ServiceResponseModel();
        private readonly RPGSmithContext _context;
        public LayoutService()
        {
            RPGSmithContext dbContext = new RPGSmithContext();
            _context = dbContext;

        }
        #region Layout
        public LayoutViewModel GetNewLayout()
        {
            //Getting new Empty Layout Model
            LayoutViewModel model = new LayoutViewModel();
            var TileTypes = new RPGSmith.Utilities.TileTypes();
            var _dataQuery = _context.TileTypes.ToList();
            model.TabList = new List<TabViewModel>();
            model.TabList.Add(new TabViewModel() { });
            foreach (var _tab in model.TabList)
            {
                _tab.TileList = new List<TileViewModel>();
                _tab.TileList.Add(new TileViewModel()
                {
                    Value = TileTypes,
                    Styles = new Style()
                });
            }
            model.LayoutMetaData = new LayoutMetaData();
            model.LayoutMetaData.TileTypes = new List<TileTypes>();
            model.LayoutMetaData.Tab = new TabViewModel();
            model.LayoutMetaData.Tile = new TileViewModel();
            foreach (var TileType in _dataQuery)
            {
                model.LayoutMetaData.TileTypes.Add(new TileTypes()
                {
                    TileId = TileType.TileTypeId,
                    TileType = TileType.TileTypeName,
                    Value = Utility.GetTileTypeClassMetaData(TileType.TileTypeId)
                });
            }
            return model;
        }
        public IEnumerable<Layout> GetLayoutByCharacterProfileID(int? CharacterProfileId)
        {
            if (CharacterProfileId != null)
            {
                IEnumerable<Layout> _layouts = _context.Layouts.Where(x => x.CharacterProfileId == CharacterProfileId).ToList();
                if (_layouts.Count() > 0)
                {
                    foreach (var _layout in _layouts)
                    {
                        _layout.Tabs = new TabService().GetTabListByLayoutId(_layout.LayoutId).ToList();
                    }

                }
                return _layouts;
            }
            return null;
        }
        public Layout GetLayoutByLayoutId(int? LayoutId)
        {
            if (LayoutId != null)
            {
                //Getting Layout List and Setting TabList and Tile List
                Layout _layout = _context.Layouts.Where(x => x.LayoutId == LayoutId).SingleOrDefault();
                _layout.Tabs = new TabService().GetTabListByLayoutId(LayoutId).ToList();
                return _layout;
            }
            return null;
        }
        public ServiceResponseModel AddLayout(LayoutViewModel layoutmodel, string userId)
        {
            try
            {
                if (userId != null || userId != "")
                {
                    int resultStatus;
                    string Errors = "";
                    Errors = ValidationForAddingNewLayout(layoutmodel, userId, out resultStatus);
                    //Checking Error/Validations Exists or Not
                    if (resultStatus == 1)
                    {
                        _serviceResponseModel.ErrorMessage = Errors;
                        _serviceResponseModel.StatusCode = 400;
                    }
                    else
                    {
                        var _layoutDetails = _context.Layouts.Where(p => p.LayoutId == layoutmodel.LayoutId).SingleOrDefault();
                        var Message = string.Empty;
                        Layout layout = new Layout();
                        Tab tab = new Tab();
                        List<Tile> TileList = new List<Tile>();
                        if (_layoutDetails == null)
                        {
                            //Checking Character Default Layout or Not
                            if (layoutmodel.IsDefault == true)
                            {
                                layout.Authored = Convert.ToDateTime(DateTime.Now.ToString());
                                layout.Edited = Convert.ToDateTime(DateTime.Now.ToString());
                                layout.LayoutName = layoutmodel.Name;
                                layout.UserId = layoutmodel.UserId;
                                layout.CharacterProfileId = layoutmodel.CharacterProfileId;
                                _context.Layouts.Add(layout);
                                _context.SaveChanges();
                                for (var l = 0; l < layoutmodel.TabList.Count; l++)
                                {
                                    var _layoutTab = layoutmodel.TabList[l];
                                    _layoutTab.TabOrder = l;
                                    tab = new Tab()
                                    {
                                        UserId = _layoutTab.UserId,
                                        Authored = DateTime.Now,
                                        Edited = DateTime.Now,
                                        TabName = _layoutTab.TabName,
                                        LayoutId = layout.LayoutId,
                                        TabOrder = (short)_layoutTab.TabOrder,
                                        //Tiles = TileList
                                    };
                                    _context.Tabs.Add(tab);
                                    _context.SaveChanges();
                                    if (_layoutTab.TileList != null)
                                    {
                                        for (var i = 0; i < _layoutTab.TileList.Count; i++)
                                        {
                                            var data = _layoutTab.TileList[i];
                                            TileList.Add(new Tile()
                                            {
                                                Authored = DateTime.Now,
                                                Edited = DateTime.Now,
                                                Height = data.Height,
                                                Width = data.Width,
                                                Style = Utility.ConvertStyleValueClasstoXML(data.Styles).OuterXml,
                                                X = data.X,
                                                Y = data.Y,
                                                TileContentId = tab.TabId,
                                                UserId = data.UserId,
                                                EntityId = data.EntityId,
                                                TileTypeId = data.TileTypeId,
                                                TileLocationId = 1,//For Dashboard level
                                                IsEditable = true
                                            });
                                            _context.Tiles.AddRange(TileList);
                                            _context.SaveChanges();
                                        }
                                    }
                                }
                                //After Adding or Updating Getting Layout View Model using LayoutId
                                var LayoutDetails = GetLayoutByLayoutId(layout.LayoutId == 0 ? _layoutDetails.LayoutId : layout.LayoutId);
                                _serviceResponseModel.Result = SetLayoutViewModel(LayoutDetails);
                                //_serviceResponseModel.Result = "Layout Inserted Successfully";
                                _serviceResponseModel.StatusCode = 200;
                            }
                            else
                            {
                                layout.Authored = Convert.ToDateTime(DateTime.Now.ToString());
                                layout.Edited = Convert.ToDateTime(DateTime.Now.ToString());
                                layout.LayoutName = layoutmodel.Name;
                                layout.UserId = layoutmodel.UserId;
                                layout.CharacterProfileId = layoutmodel.CharacterProfileId;
                                _context.Layouts.Add(layout);
                                _context.SaveChanges();
                                layoutmodel.LayoutId = layout.LayoutId;
                                foreach (var _tab in layoutmodel.TabList)
                                {
                                    _tab.LayoutId = layout.LayoutId;
                                    _tab.UserId = layoutmodel.UserId;
                                    var TabDetails = new TabService().AddOrUpdateTab(_tab, userId).Result;
                                    if (_tab.TileList != null)
                                    {
                                        foreach (var _tabTile in _tab.TileList)
                                        {
                                            _tabTile.TabId = ((TabViewModel)(TabDetails)).TabId;
                                            _tabTile.UserId = layoutmodel.UserId;
                                            _tabTile.CharacterProfileId = layoutmodel.CharacterProfileId;
                                            new TileService().AddOrUpdateTile(_tabTile, userId);

                                        }
                                    }
                                }
                                //After Adding or Updating Getting Layout View Model using LayoutId
                                var LayoutDetails = GetLayoutByLayoutId(layout.LayoutId == 0 ? _layoutDetails.LayoutId : layout.LayoutId);
                                _serviceResponseModel.Result = SetLayoutViewModel(LayoutDetails);
                                _serviceResponseModel.StatusCode = 200;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _serviceResponseModel.ErrorMessage = ex.Message;
                _serviceResponseModel.StatusCode = 500;
            }
            return _serviceResponseModel;
        }
        public ServiceResponseModel AddOrUpdateLayout(LayoutViewModel layoutmodel, string userId, bool IsUpdate)
        {
            try
            {
                if (userId != null || userId != "")
                {
                    int resultStatus = 0;
                    string Errors = "";
                    //Checking Errors/Validations For The Layout
                    Errors = (IsUpdate == true) ? ValidationForUpdatingLayout(layoutmodel, userId, out resultStatus) : ValidationForCopyLayout(layoutmodel, userId, out resultStatus);
                    if (resultStatus == 1)
                    {
                        _serviceResponseModel.ErrorMessage = Errors;
                        _serviceResponseModel.StatusCode = 400;
                    }
                    else
                    {

                        //Getting All Tile Types
                        var _dataQuery = new TileService().GetAllTileTypes();
                        layoutmodel.LayoutMetaData.TileTypes = new List<TileTypes>();
                        //Filling Tile Types in Layout Metadata
                        foreach (var TileType in _dataQuery)
                        {
                            layoutmodel.LayoutMetaData.TileTypes.Add(new TileTypes()
                            {
                                TileId = TileType.TileTypeId,
                                TileType = TileType.TileTypeName,
                                Value = Utility.GetTileTypeClassMetaData(TileType.TileTypeId)
                            });
                        }

                        //Checking Layout Record Exists or Not
                        List<TabViewModel> newTabList = new List<TabViewModel>();
                        var _layoutDetails = _context.Layouts.Where(p => p.LayoutId == layoutmodel.LayoutId).SingleOrDefault();

                        if (_layoutDetails == null)
                        {
                            Layout layout = new Layout();
                            layout.Authored = Convert.ToDateTime(DateTime.Now.ToString());
                            layout.Edited = Convert.ToDateTime(DateTime.Now.ToString());
                            layout.LayoutName = layoutmodel.Name;
                            layout.UserId = userId;
                            layout.CharacterProfileId = layoutmodel.CharacterProfileId;
                            _context.Layouts.Add(layout);
                            int _rowsEffected = _context.SaveChanges();
                            if (_rowsEffected > 0)
                            {
                                layoutmodel.LayoutId = layout.LayoutId;
                                if (layoutmodel.TabList.Count == 0)
                                {
                                    TabViewModel tab = new TabViewModel();
                                    tab.LayoutId = layout.LayoutId;
                                    tab.TabName = "Default";
                                    ServiceResponseModel _tabServiceResponseModel = new TabService().AddOrUpdateTab(tab, userId);
                                    layoutmodel.TabList.Add(tab);
                                }
                                if (layoutmodel.TabList != null)
                                {
                                    foreach (var _tab in layoutmodel.TabList)
                                    {
                                        _tab.LayoutId = layout.LayoutId;
                                        ServiceResponseModel _tabServiceResponseModel = new TabService().AddOrUpdateTab(_tab, userId);
                                        if (_tabServiceResponseModel.StatusCode == 200)
                                        {
                                            newTabList.Add((TabViewModel)_tabServiceResponseModel.Result);
                                        }
                                        else
                                        {
                                            if (_tabServiceResponseModel.StatusCode == 400)
                                            {

                                                newTabList.Add(_tab);
                                            }
                                        }
                                    }
                                }


                                layoutmodel.TabList = newTabList;
                                _serviceResponseModel.StatusCode = 200;
                                _serviceResponseModel.Result = layoutmodel;
                            }
                            else
                            {
                                _serviceResponseModel.StatusCode = 400;
                                _serviceResponseModel.Result = layoutmodel;
                            }
                        }
                        else
                        {
                            _layoutDetails.LayoutId = layoutmodel.LayoutId;
                            _layoutDetails.Edited = Convert.ToDateTime(DateTime.Now.ToString());
                            _layoutDetails.LayoutName = layoutmodel.Name;
                            _layoutDetails.UserId = layoutmodel.UserId;
                            _layoutDetails.CharacterProfileId = layoutmodel.CharacterProfileId;
                            int _rowsEffected = _context.SaveChanges();
                            if (layoutmodel.TabList != null)
                            {
                                foreach (var _tab in layoutmodel.TabList)
                                {
                                    _tab.LayoutId = _layoutDetails.LayoutId;

                                    ServiceResponseModel _tabServiceResponseModel = new TabService().AddOrUpdateTab(_tab, userId);
                                    if (_tabServiceResponseModel.StatusCode == 200)
                                    {
                                        newTabList.Add((TabViewModel)_tabServiceResponseModel.Result);

                                    }
                                    else
                                    {
                                        if (_tabServiceResponseModel.StatusCode == 400)
                                        {

                                            newTabList.Add(_tab);
                                        }
                                    }
                                }
                            }
                            _serviceResponseModel.StatusCode = 200;
                            layoutmodel.TabList = newTabList;
                            _serviceResponseModel.Result = layoutmodel;
                        }

                    }

                }
            }
            catch (Exception ex)
            {
                _serviceResponseModel.ErrorMessage = ex.Message;
                _serviceResponseModel.StatusCode = 500;
            }

            return _serviceResponseModel;
        }
        public ServiceResponseModel CopyLayout(LayoutViewModel layoutmodel, string userId)
        {
            try
            {
                if (userId != null || userId != "")
                {
                    int resultStatus;
                    string Errors = "";
                    //Checking Errors/Validations are Exists or Not
                    Errors = ValidationForCopyLayout(layoutmodel, userId, out resultStatus);
                    if (resultStatus == 1)
                    {
                        _serviceResponseModel.ErrorMessage = Errors;
                        _serviceResponseModel.StatusCode = 400;
                    }
                    else
                    {
                        //Checking Layout Record Exists or Not
                        var _layoutDetails = _context.Layouts.Where(p => p.LayoutId == layoutmodel.LayoutId).SingleOrDefault();
                        Layout layout = new Layout();
                        layout.Authored = Convert.ToDateTime(DateTime.Now.ToString());
                        layout.Edited = Convert.ToDateTime(DateTime.Now.ToString());
                        layout.LayoutName = layoutmodel.Name;
                        layout.UserId = layoutmodel.UserId;
                        layout.CharacterProfileId = layoutmodel.CharacterProfileId;
                        _context.Layouts.Add(layout);
                        _context.SaveChanges();
                        layoutmodel.LayoutId = layout.LayoutId;
                        foreach (var _tab in layoutmodel.TabList)
                        {
                            _tab.LayoutId = layout.LayoutId;
                            _tab.UserId = layoutmodel.UserId;
                            //Adding or Updating Tabs and Getting TabId
                            var TabDetails = new TabService().AddOrUpdateTab(_tab, userId);
                            if (_tab.TileList != null)
                            {
                                foreach (var _tabTile in _tab.TileList)
                                {
                                    _tabTile.TabId = ((TabViewModel)TabDetails.Result).TabId;
                                    _tabTile.UserId = layoutmodel.UserId;
                                    _tabTile.CharacterProfileId = layoutmodel.CharacterProfileId;
                                    //Adding or Updating Tiles
                                    new TileService().AddOrUpdateTile(_tabTile, userId);

                                }
                            }
                        }
                        layout.Tabs = _context.Tabs.Where(p => p.LayoutId == _layoutDetails.LayoutId).ToList();
                        _serviceResponseModel.Result = SetLayoutViewModel(layout);
                        //_serviceResponseModel.Result = "Layout Inserted Successfully";
                        _serviceResponseModel.StatusCode = 200;
                    }
                }
                else
                {
                    _serviceResponseModel.ErrorMessage = "Not valid User";
                    _serviceResponseModel.StatusCode = 500;
                }
            }
            catch (Exception ex)
            {
                _serviceResponseModel.ErrorMessage = ex.Message;
                _serviceResponseModel.StatusCode = 500;
            }

            return _serviceResponseModel;
        }
        public ServiceResponseModel DeleteLayout(LayoutViewModel deleteLayout, string userId)
        {
            try
            {
                LayoutViewModel layoutViewModel = new LayoutViewModel();
                //layoutViewModel.LayoutId = Convert.ToInt32(LayoutID);

                if (userId != null || userId != "")
                {
                    int resultStatus;
                    string Errors = "";
                    Errors = ValidationForDeleteLayout(deleteLayout, userId, out resultStatus);

                    if (resultStatus == 1)
                    {
                        _serviceResponseModel.ErrorMessage = Errors;
                        _serviceResponseModel.StatusCode = 400;
                    }
                    else
                    {
                        if (deleteLayout.TabList != null)
                        {
                            foreach (var _tab in deleteLayout.TabList)
                            {
                                if (_tab.TileList != null)
                                {
                                    foreach (var tile in _tab.TileList)
                                    {
                                        var EntityId = _context.Tiles.Where(c => c.TileId == tile.TileId).FirstOrDefault().EntityId;
                                        //Delete Note Tile
                                        var NoteTileDetails = _context.NoteTiles.Where(p => p.NoteId == EntityId).SingleOrDefault();
                                        if (NoteTileDetails != null)
                                        {
                                            _context.NoteTiles.Remove(NoteTileDetails);
                                            _context.SaveChanges();
                                        }
                                        //Delete Counter Tile
                                        var CounterTileDetails = _context.CounterTiles.Where(p => p.CounterId == EntityId).SingleOrDefault();
                                        if (CounterTileDetails != null)
                                        {
                                            _context.CounterTiles.Remove(CounterTileDetails);
                                            _context.SaveChanges();
                                        }

                                        //Delete Attribute Tile
                                        var AttributeileDetails = _context.AttributeTiles.Where(p => p.AttributeId == EntityId).SingleOrDefault();
                                        if (AttributeileDetails != null)
                                        {
                                            _context.AttributeTiles.Remove(AttributeileDetails);
                                            _context.SaveChanges();
                                        }
                                        //Delete Link Tile
                                        var LinkTileDetails = _context.LinkTiles.Where(p => p.LinkId == EntityId).SingleOrDefault();
                                        if (LinkTileDetails != null)
                                        {
                                            _context.LinkTiles.Remove(LinkTileDetails);
                                            _context.SaveChanges();
                                        }
                                        //Delete Execute Tile
                                        var ExecuteTileDetails = _context.ExecuteTiles.Where(p => p.ExecuteId == EntityId).SingleOrDefault();
                                        if (ExecuteTileDetails != null)
                                        {
                                            _context.ExecuteTiles.Remove(ExecuteTileDetails);
                                            _context.SaveChanges();
                                        }
                                        //Delete Command Tile
                                        var CommandTileDetails = _context.CommandTiles.Where(p => p.CommandId == EntityId).SingleOrDefault();
                                        if (CommandTileDetails != null)
                                        {
                                            _context.CommandTiles.Remove(CommandTileDetails);
                                            _context.SaveChanges();
                                        }
                                        //Deleting Tile
                                        var deleteTileId = _context.Tiles.Where(c => c.TileId == tile.TileId).FirstOrDefault();
                                        _context.Tiles.Remove(deleteTileId);
                                        _context.SaveChanges();

                                    }
                                }

                                var deletetab = _context.Tabs.Where(c => c.TabId == _tab.TabId).FirstOrDefault();
                                _context.Tabs.Remove(deletetab);
                                _context.SaveChanges();
                            }
                        }


                        var deleteLayoutId = _context.Layouts.Where(c => c.LayoutId == deleteLayout.LayoutId && c.UserId == userId).FirstOrDefault();
                        _context.Layouts.Remove(deleteLayoutId);
                        _context.SaveChanges();
                        //Adding New Layout If all Layouts Deleted.
                        var characterId = _context.Layouts.Where(c => c.CharacterProfileId == deleteLayout.CharacterProfileId).ToList();
                        if (characterId.Count == 0)
                        {
                            Layout _layout = new Layout()
                            {
                                UserId = userId,
                                CharacterProfileId = deleteLayoutId.CharacterProfileId,
                                Authored = DateTime.Now,
                                Edited = DateTime.Now,
                                LayoutName = "Default",
                            };
                            _context.Layouts.Add(_layout);
                            _context.SaveChanges();
                        }
                        // return "Layout Deleted Successfully";

                        _serviceResponseModel.Result = deleteLayout;
                        _serviceResponseModel.StatusCode = 200;

                    }
                }
                else
                {
                    _serviceResponseModel.ErrorMessage = "Not valid User";
                    _serviceResponseModel.StatusCode = 500;
                }
            }
            catch (Exception ex)
            {
                _serviceResponseModel.ErrorMessage = ex.Message;
                _serviceResponseModel.StatusCode = 500;
            }
            return _serviceResponseModel;

        }
        #endregion
        #region Layout Server Validations
        public string ValidationForAddingNewLayout(LayoutViewModel layoutmodel, string userId, out int resultStatus)
        {
            string Errors = "";
            resultStatus = 0; // 0-NoError   1-Error

            if (layoutmodel.Name != null && layoutmodel.Name != "")
            {

                IEnumerable<Layout> _layout = _context.Layouts.Where(x => x.UserId == userId && x.CharacterProfileId == layoutmodel.CharacterProfileId && x.LayoutName.ToLower() == layoutmodel.Name.ToLower()).ToList();
                if (_layout.Count() > 0)
                {
                    Errors = Errors + " Layout Name Already Exist <br/>";
                    resultStatus = 1;
                }
            }
            else
            {
                Errors = Errors + "Please Enter LayoutName <br/>";
                resultStatus = 1;
            }

            return Errors;
        }
        public string ValidationForUpdatingLayout(LayoutViewModel layoutmodel, string userId, out int resultStatus)
        {
            string Errors = "";
            resultStatus = 0; // 0-NoError   1-Error

            if (layoutmodel.Name != null && layoutmodel.Name != "")
            {
                IEnumerable<Layout> _layout = _context.Layouts.Where(x => x.UserId == userId && x.CharacterProfileId == layoutmodel.CharacterProfileId && x.LayoutId == layoutmodel.LayoutId).ToList();
                if (_layout.Count() == 0)
                {
                    Errors = Errors + " please select valid Layout";
                    resultStatus = 1;
                }
            }

            return Errors;
        }
        public string ValidationForCopyLayout(LayoutViewModel layoutmodel, string userId, out int resultStatus)
        {
            string Errors = "";
            resultStatus = 0; // 0-NoError   1-Error

            if (layoutmodel.Name != null && layoutmodel.Name != "")
            {

                IEnumerable<Layout> _layout = _context.Layouts.Where(x => x.UserId == userId && x.CharacterProfileId == layoutmodel.CharacterProfileId && x.LayoutName.ToLower() == layoutmodel.Name.ToLower()).ToList();
                if (_layout.Count() > 0)
                {
                    Errors = Errors + " Layout Name Already Exist";
                    resultStatus = 1;
                }
            }
            else
            {
                Errors = Errors + "Please Enter LayoutName <br/>";
                resultStatus = 1;
            }

            return Errors;
        }
        public string ValidationForDeleteLayout(LayoutViewModel layoutmodel, string userId, out int resultStatus)
        {
            string Errors = "";
            resultStatus = 0;

            IEnumerable<Layout> _ruleSet;
            _ruleSet = _context.Layouts.Where(c => c.LayoutId == layoutmodel.LayoutId && c.UserId == userId).ToList();
            if (_ruleSet.Count() == 0)
            {
                Errors = Errors + " Please Select Valid Layout <br/>";
                resultStatus = 1;
            }

            return Errors;
        }
        #endregion
        #region Dice
        public IEnumerable<UserDiceSelection> GetDiceNames(int characterProfileId)
        {
            List<UserDiceSelection> dicelst = new List<UserDiceSelection>();
            var dbdice = _context.UserVirtualDices.Where(c => c.CharacterProfileId == characterProfileId).ToList();
            if (dbdice != null)
            {
                foreach (var item in dbdice)
                {
                    dicelst.Add(new UserDiceSelection()
                    {
                        CharacterId = Convert.ToInt32(item.CharacterProfileId),
                        Name = item.Name,
                        Command = item.Command,
                        LastRunResult = item.LastRunResult

                    });
                }
            }
            return dicelst;
        }
        public string SaveUserVirtualDice(UserDiceSelection dice)
        {
            UserVirtualDice dbdice = new UserVirtualDice();
            if (dice != null)
            {
                dbdice.UserId = dice.UserId;
                dbdice.Name = dice.Name;
                dbdice.CharacterProfileId = dice.CharacterId;
                dbdice.Command = dice.Command;
                dbdice.LastRunResult = dice.LastRunResult;
                dbdice.LastRunTime = dice.LastRunTime;
                _context.UserVirtualDices.Add(dbdice);
                _context.SaveChanges();
            }
            return "Dice Saved Successfully";
        }
        public string GetCharacterDefaultDice(int CharacterProfileID)
        {

            var dbresult = (from ruleset in _context.CharacterProfiles
                            join dice in _context.RulesetPropertyValues on ruleset.RulesetId equals dice.RulesetID
                            join rulesetproperty in _context.RulesetProperties on dice.PropertyId equals rulesetproperty.PropertyId
                            where ruleset.CharacterProfileId == CharacterProfileID && rulesetproperty.TypeId == 15
                            select new { RulesetID = ruleset.RulesetId, Value = dice.Value, PropertyId = dice.PropertyId, Id = dice.Id, TypeId = rulesetproperty.TypeId }).FirstOrDefault();
            var Value = Utility.ConvertTypeValueXMLtoClass(dbresult.TypeId, dbresult.Value, "");
            return Value.DefaultDice.value.ToString();
        }
        #endregion
        #region Setting  LayoutView Model Values
        //Setting LayoutView Model Values
        public LayoutViewModel SetLayoutViewModel(Layout LayoutdbResult)
        {
            //Declare Model
            LayoutViewModel _layoutViewModel = new LayoutViewModel();
            LayoutMetaData _layouMetaData = new LayoutMetaData();
            //Checking empty Model Validation
            if (LayoutdbResult == null)
            {
                _layoutViewModel = new LayoutService().GetNewLayout();
                return _layoutViewModel;
            }
            //Getting All Tile Types
            var _dataQuery = new TileService().GetAllTileTypes();
            _layouMetaData.TileTypes = new List<TileTypes>();
            //Filling Tile Types in Layout Metadata
            foreach (var TileType in _dataQuery)
            {
                _layouMetaData.TileTypes.Add(new TileTypes()
                {
                    TileId = TileType.TileTypeId,
                    TileType = TileType.TileTypeName,
                    Value = Utility.GetTileTypeClassMetaData(TileType.TileTypeId)
                });
            }
            //Declare Tab View Model
            List<TabViewModel> _lsttabViewModel = new List<TabViewModel>();
            //Setting Layout Tabs Values
            foreach (var _tab in LayoutdbResult.Tabs)
            {
                List<TileViewModel> _lsttileViewModel = new List<TileViewModel>();
                var Tiles = new TileService().GetTileListByTabId(_tab.TabId).ToList();
                if (Tiles.Count > 0)
                {
                    foreach (var _tile in Tiles)
                    {
                        var TileType = new RPGSmith.Utilities.TileTypes();
                        /*
                         1: Note Tile
                         2: Counter Tile
                         3: Attribute Tile
                         4: Link Tile
                         5: Execute Tile
                         6: Command Tile
                         7: Image Tile
                         */
                        if (_tile.EntityId > 0 && _tile.TileTypeId > 0)
                        {
                            switch (_tile.TileTypeId)
                            {
                                case 1:
                                    RPGSmith.Utilities.RPGSmithTileTypes.Note note = new Utilities.RPGSmithTileTypes.Note();
                                    var dbNoteTileDetails = new TileService().GetNoteTilesByEntityId(_tile.EntityId);
                                    note.NoteId = dbNoteTileDetails.NoteId;
                                    note.CharacterProfileId = dbNoteTileDetails.CharacterProfileId;
                                    note.UserId = dbNoteTileDetails.UserId;
                                    note.Name = dbNoteTileDetails.Name;
                                    note.Text = dbNoteTileDetails.Text;
                                    TileType.Note = note;
                                    break;
                                case 2:
                                    RPGSmith.Utilities.RPGSmithTileTypes.Counter counter = new Utilities.RPGSmithTileTypes.Counter();
                                    var dbCounterTileDetails = new TileService().GetCounterTilesByEntityId(_tile.EntityId);
                                    counter.CounterId = dbCounterTileDetails.CounterId;
                                    counter.CharacterProfileId = dbCounterTileDetails.CharacterProfileId;
                                    counter.UserId = dbCounterTileDetails.UserId;
                                    counter.Name = dbCounterTileDetails.Name;
                                    counter.Mask = dbCounterTileDetails.Mask;
                                    counter.DefaultValue = dbCounterTileDetails.DefaultValue;
                                    counter.Max = dbCounterTileDetails.Max;
                                    counter.Min = dbCounterTileDetails.Min;
                                    counter.Step = dbCounterTileDetails.Step;
                                    counter.Value = dbCounterTileDetails.Value;
                                    TileType.Counter = counter;
                                    break;
                                case 3:
                                    RPGSmith.Utilities.RPGSmithTileTypes.Attributes attributes = new Utilities.RPGSmithTileTypes.Attributes();
                                    var dbAtributeTileDetails = new TileService().GetAtributeTilesByEntityId(_tile.EntityId);
                                    attributes.AttributeId = dbAtributeTileDetails.AttributeId;
                                    attributes.CharacterProfileId = dbAtributeTileDetails.CharacterProfileId;
                                    attributes.UserId = dbAtributeTileDetails.UserId;
                                    attributes.Title = dbAtributeTileDetails.Name;
                                    attributes.Name = dbAtributeTileDetails.CoreStatName;
                                    attributes.SelectedCorestatValue = dbAtributeTileDetails.CoreStatName;
                                    attributes.TypeId = dbAtributeTileDetails.TypeId == null ? 0 : dbAtributeTileDetails.TypeId;
                                    attributes.CoreStatValue = Utility.ConvertTypeValueXMLtoClass(dbAtributeTileDetails.TypeId, dbAtributeTileDetails.CorestatValue, "");
                                    attributes.CoreStatValueId = dbAtributeTileDetails.CorestatValueID;
                                    TileType.Attribute = attributes;
                                    break;
                                case 4:
                                    RPGSmith.Utilities.RPGSmithTileTypes.Link link = new Utilities.RPGSmithTileTypes.Link();
                                    var dbLinkTileDetails = new TileService().GetLinkTilesByEntityId(_tile.EntityId);
                                    if (dbLinkTileDetails != null)
                                    {
                                        link.LinkId = dbLinkTileDetails.LinkId;
                                        link.CharacterProfileId = dbLinkTileDetails.CharacterProfileId;
                                        link.UserId = dbLinkTileDetails.UserId;
                                        link.Title = dbLinkTileDetails.Name;
                                        link.SelectedProperty = dbLinkTileDetails.SelectedProperty;
                                        //var a = dbLinkTileDetails.SelectedPropertyValue.Split('/');
                                        link.SelectedPropertyValue = dbLinkTileDetails.SelectedPropertyValue != null ? dbLinkTileDetails.SelectedPropertyValue.Split('/')[0] : "";
                                        link.SelectedPropertyValueImage = dbLinkTileDetails.SelectedPropertyValue == null ? "" : dbLinkTileDetails.SelectedPropertyValue.Substring(link.SelectedPropertyValue.Length, dbLinkTileDetails.SelectedPropertyValue.Length - link.SelectedPropertyValue.Length);
                                    }
                                    TileType.Link = link;
                                    break;
                                case 5:
                                    RPGSmith.Utilities.RPGSmithTileTypes.Execute execute = new Utilities.RPGSmithTileTypes.Execute();
                                    var dbExecuteTileDetails = new TileService().GetExecuteTilesByEntityId(_tile.EntityId);
                                    execute.ExecuteId = dbExecuteTileDetails.ExecuteId;
                                    execute.CharacterProfileId = dbExecuteTileDetails.CharacterProfileId;
                                    execute.UserId = dbExecuteTileDetails.UserId;
                                    execute.Name = dbExecuteTileDetails.Name;
                                    execute.Command = dbExecuteTileDetails.Command;
                                    execute.CommandLastResult = dbExecuteTileDetails.CommandLastResult;
                                    execute.CommandLastRunDate = dbExecuteTileDetails.CommandLastRunDate;
                                    execute.ContentId = dbExecuteTileDetails.ContentId;
                                    execute.ContentTypeId = dbExecuteTileDetails.ContentTypeId;
                                    execute.SelectedPropertyValue = dbExecuteTileDetails.SelectedPropertyValue != null ? dbExecuteTileDetails.SelectedPropertyValue.Split('/')[0] : "";
                                    execute.SelectedPropertyValueImage = dbExecuteTileDetails.SelectedPropertyValue == null ? "" : dbExecuteTileDetails.SelectedPropertyValue.Substring(execute.SelectedPropertyValue.Length, dbExecuteTileDetails.SelectedPropertyValue.Length - execute.SelectedPropertyValue.Length);
                                    TileType.Execute = execute;
                                    break;
                                case 6:
                                    RPGSmith.Utilities.RPGSmithTileTypes.Command command = new Utilities.RPGSmithTileTypes.Command();
                                    var dbCommandTileDetails = new TileService().GetCommandTilesByEntityId(_tile.EntityId);
                                    command.CommandId = dbCommandTileDetails.CommandId;
                                    command.CharacterProfileId = dbCommandTileDetails.CharacterProfileId;
                                    command.UserId = dbCommandTileDetails.UserId;
                                    command.Name = dbCommandTileDetails.Name;
                                    command.command = dbCommandTileDetails.Command;
                                    command.commandLastResult = dbCommandTileDetails.CommandLastResult;
                                    command.commandLastRunDate = dbCommandTileDetails.CommandLastRunDate;
                                    command.ImagePath = dbCommandTileDetails.ImagePath;
                                    TileType.Command = command;
                                    break;
                                case 7:
                                    RPGSmith.Utilities.RPGSmithTileTypes.ImageTile image = new Utilities.RPGSmithTileTypes.ImageTile();
                                    var dbImageTileDetails = new TileService().GetImageTilesByEntityId(_tile.EntityId);
                                    image.CharacterProfileId = dbImageTileDetails.CharacterProfileId;
                                    image.ImageId = dbImageTileDetails.ImageId;
                                    image.Name = dbImageTileDetails.Name == null ? "" : dbImageTileDetails.Name;
                                    image.UserId = dbImageTileDetails.UserId;
                                    image.Imagepath = dbImageTileDetails.ImagePath == null ? "" : dbImageTileDetails.ImagePath;
                                    TileType.Imagetile = image;
                                    break;
                            }

                        }
                        //Setting Tile View Model
                        _lsttileViewModel.Add(new TileViewModel()
                        {
                            EntityId = _tile.EntityId,
                            Height = _tile.Height,
                            Style = _tile.Style,
                            Styles = (_tile.Style != null && _tile.Style != "") ? Utility.ConvertStyleValueXMLtoClass(_tile.Style) : new Style(),
                            TabId = _tile.TileContentId,
                            TileId = _tile.TileId,
                            TileTypeId = _tile.TileTypeId,
                            UserId = _tile.UserId,
                            X = _tile.X,
                            Y = _tile.Y,
                            Width = _tile.Width,
                            Value = TileType,
                            TileTypeName = (_layouMetaData.TileTypes.Count > 0 && _tile.TileTypeId > 0) ? _layouMetaData.TileTypes.Where(p => p.TileId == _tile.TileTypeId).SingleOrDefault().TileType : "",
                            Mode = "Use"
                        });
                    }
                }
                //Setting Tab View Model
                _lsttabViewModel.Add(new TabViewModel()
                {
                    LayoutId = _tab.LayoutId,
                    TabId = _tab.TabId,
                    TabName = _tab.TabName,
                    TabOrder = _tab.TabOrder,
                    UserId = _tab.UserId,
                    TileList = _lsttileViewModel
                });
            }
            //Setting Layout View Model Values
            _layoutViewModel.LayoutId = LayoutdbResult.LayoutId;
            _layoutViewModel.Name = LayoutdbResult.LayoutName;
            _layoutViewModel.UserId = LayoutdbResult.UserId;
            _layoutViewModel.CharacterProfileId = LayoutdbResult.CharacterProfileId;
            _layoutViewModel.TabList = _lsttabViewModel;
            _layoutViewModel.CorestatValues = new CorestatService().GetCorestatsByCharacter(LayoutdbResult.CharacterProfileId).CorestatValues;
            _layoutViewModel.CharacterName = (LayoutdbResult.CharacterProfileId > 0) ? new CharacterService().GetCharactersByUserID(LayoutdbResult.UserId).Where(p => p.CharacterProfileId == LayoutdbResult.CharacterProfileId).SingleOrDefault().Name : "";
            _layoutViewModel.LayoutMetaData = _layouMetaData;
            _layoutViewModel.RulesetViewModel = new RuleSetService().GetRuleSetDetailsByCharacterProfileId(LayoutdbResult.CharacterProfileId);
            return _layoutViewModel;
        }
        public List<LayoutViewModel> SetLayoutListViewModel(List<Layout> LayoutdbResult)
        {
            List<LayoutViewModel> _lstlayoutViewModel = new List<LayoutViewModel>();
            LayoutMetaData _layouMetaData = new LayoutMetaData();
            if (LayoutdbResult == null || LayoutdbResult.Count == 0)
            {
                _lstlayoutViewModel.Add(GetNewLayout());
                return _lstlayoutViewModel;
            }
            var _dataQuery = new TileService().GetAllTileTypes();
            _layouMetaData.TileTypes = new List<TileTypes>();
            foreach (var TileType in _dataQuery)
            {
                _layouMetaData.TileTypes.Add(new TileTypes()
                {
                    TileId = TileType.TileTypeId,
                    TileType = TileType.TileTypeName,
                    Value = Utility.GetTileTypeClassMetaData(TileType.TileTypeId)
                });
            }
            _layouMetaData.Tile = new TileViewModel()
            {
                Styles = new Style(),
            };

            foreach (var _layout in LayoutdbResult)
            {
                List<TabViewModel> _lsttabViewModel = new List<TabViewModel>();
                foreach (var _tab in _layout.Tabs)
                {
                    List<TileViewModel> _lsttileViewModel = new List<TileViewModel>();
                    var Tiles = new TileService().GetTileListByTabId(_tab.TabId).ToList();
                    if (Tiles.Count > 0)
                    {
                        foreach (var _tile in Tiles)
                        {
                            var TileType = new RPGSmith.Utilities.TileTypes();
                            /*
                              1: Note Tile
                              2: Counter Tile
                              3: Attribute Tile
                              4: Link Tile
                              5: Execute Tile
                              6: Command Tile
                              7: Image Tile
                              */
                            if (_tile.EntityId > 0 && _tile.TileTypeId > 0)
                            {
                                switch (_tile.TileTypeId)
                                {
                                    case 1:
                                        RPGSmith.Utilities.RPGSmithTileTypes.Note note = new Utilities.RPGSmithTileTypes.Note();
                                        var dbNoteTileDetails = new TileService().GetNoteTilesByEntityId(_tile.EntityId);
                                        if (dbNoteTileDetails != null)
                                        {
                                            note.NoteId = dbNoteTileDetails.NoteId;
                                            note.CharacterProfileId = dbNoteTileDetails.CharacterProfileId;
                                            note.UserId = dbNoteTileDetails.UserId;
                                            note.Name = dbNoteTileDetails.Name;
                                            note.Text = dbNoteTileDetails.Text;
                                        }
                                        TileType.Note = note;
                                        break;
                                    case 2:
                                        RPGSmith.Utilities.RPGSmithTileTypes.Counter counter = new Utilities.RPGSmithTileTypes.Counter();
                                        var dbCounterTileDetails = new TileService().GetCounterTilesByEntityId(_tile.EntityId);
                                        if (dbCounterTileDetails != null)
                                        {
                                            counter.CounterId = dbCounterTileDetails.CounterId;
                                            counter.CharacterProfileId = dbCounterTileDetails.CharacterProfileId;
                                            counter.UserId = dbCounterTileDetails.UserId;
                                            counter.Name = dbCounterTileDetails.Name;
                                            counter.Mask = dbCounterTileDetails.Mask;
                                            counter.DefaultValue = dbCounterTileDetails.DefaultValue;
                                            counter.Max = dbCounterTileDetails.Max;
                                            counter.Min = dbCounterTileDetails.Min;
                                            counter.Step = dbCounterTileDetails.Step;
                                            counter.Value = dbCounterTileDetails.Value;
                                        }
                                        TileType.Counter = counter;
                                        break;
                                    case 3:
                                        RPGSmith.Utilities.RPGSmithTileTypes.Attributes attributes = new Utilities.RPGSmithTileTypes.Attributes();
                                        var dbAtributeTileDetails = new TileService().GetAtributeTilesByEntityId(_tile.EntityId);
                                        if (dbAtributeTileDetails != null)
                                        {
                                            attributes.AttributeId = dbAtributeTileDetails.AttributeId;
                                            attributes.CharacterProfileId = dbAtributeTileDetails.CharacterProfileId;
                                            attributes.UserId = dbAtributeTileDetails.UserId;
                                            attributes.Name = dbAtributeTileDetails.CoreStatName;
                                            attributes.Title = dbAtributeTileDetails.Name;
                                            attributes.SelectedCorestatValue = dbAtributeTileDetails.CoreStatName;
                                            attributes.TypeId = dbAtributeTileDetails.TypeId == null ? 0 : dbAtributeTileDetails.TypeId;
                                            attributes.CoreStatValue = Utility.ConvertTypeValueXMLtoClass(dbAtributeTileDetails.TypeId, dbAtributeTileDetails.CorestatValue, "");
                                            attributes.CoreStatValueId = dbAtributeTileDetails.CorestatValueID;
                                        }
                                        TileType.Attribute = attributes;
                                        break;
                                    case 4:
                                        RPGSmith.Utilities.RPGSmithTileTypes.Link link = new Utilities.RPGSmithTileTypes.Link();
                                        var dbLinkTileDetails = new TileService().GetLinkTilesByEntityId(_tile.EntityId);
                                        if (dbLinkTileDetails != null)
                                        {
                                            link.LinkId = dbLinkTileDetails.LinkId;
                                            link.CharacterProfileId = dbLinkTileDetails.CharacterProfileId;
                                            link.UserId = dbLinkTileDetails.UserId;
                                            link.Title = dbLinkTileDetails.Name;
                                            link.SelectedProperty = dbLinkTileDetails.SelectedProperty;
                                            link.SelectedPropertyValue = dbLinkTileDetails.SelectedPropertyValue != null ? dbLinkTileDetails.SelectedPropertyValue.Split('/')[0] : "";
                                            link.SelectedPropertyValueImage = dbLinkTileDetails.SelectedPropertyValue == null ? "" : dbLinkTileDetails.SelectedPropertyValue.Substring(link.SelectedPropertyValue.Length, dbLinkTileDetails.SelectedPropertyValue.Length - link.SelectedPropertyValue.Length);
                                        }
                                        TileType.Link = link;
                                        break;
                                    case 5:
                                        RPGSmith.Utilities.RPGSmithTileTypes.Execute execute = new Utilities.RPGSmithTileTypes.Execute();
                                        var dbExecuteTileDetails = new TileService().GetExecuteTilesByEntityId(_tile.EntityId);
                                        if (dbExecuteTileDetails != null)
                                        {
                                            execute.ExecuteId = dbExecuteTileDetails.ExecuteId;
                                            execute.CharacterProfileId = dbExecuteTileDetails.CharacterProfileId;
                                            execute.UserId = dbExecuteTileDetails.UserId;
                                            execute.Name = dbExecuteTileDetails.Name;
                                            execute.Title = dbExecuteTileDetails.Name;
                                            execute.Command = dbExecuteTileDetails.Command;
                                            execute.CommandLastResult = dbExecuteTileDetails.CommandLastResult;
                                            execute.CommandLastRunDate = dbExecuteTileDetails.CommandLastRunDate;
                                            execute.ContentId = dbExecuteTileDetails.ContentId;
                                            execute.ContentTypeId = dbExecuteTileDetails.ContentTypeId;
                                            execute.SelectedProperty = dbExecuteTileDetails.SelectedProperty;
                                            execute.SelectedPropertyValue = dbExecuteTileDetails.SelectedPropertyValue != null ? dbExecuteTileDetails.SelectedPropertyValue.Split('/')[0] : "";
                                            execute.SelectedPropertyValueImage = dbExecuteTileDetails.SelectedPropertyValue == null ? "" : dbExecuteTileDetails.SelectedPropertyValue.Substring(execute.SelectedPropertyValue.Length, dbExecuteTileDetails.SelectedPropertyValue.Length - execute.SelectedPropertyValue.Length);
                                        }
                                        TileType.Execute = execute;
                                        break;
                                    case 6:
                                        RPGSmith.Utilities.RPGSmithTileTypes.Command command = new Utilities.RPGSmithTileTypes.Command();
                                        var dbCommandTileDetails = new TileService().GetCommandTilesByEntityId(_tile.EntityId);
                                        if (dbCommandTileDetails != null)
                                        {
                                            command.CommandId = dbCommandTileDetails.CommandId;
                                            command.CharacterProfileId = dbCommandTileDetails.CharacterProfileId;
                                            command.UserId = dbCommandTileDetails.UserId;
                                            command.Name = dbCommandTileDetails.Name;
                                            command.command = dbCommandTileDetails.Command;
                                            command.commandLastResult = dbCommandTileDetails.CommandLastResult;
                                            command.commandLastRunDate = dbCommandTileDetails.CommandLastRunDate;
                                            command.ImagePath = dbCommandTileDetails.ImagePath;
                                        }
                                        TileType.Command = command;
                                        break;
                                    case 7:
                                        RPGSmith.Utilities.RPGSmithTileTypes.ImageTile image = new Utilities.RPGSmithTileTypes.ImageTile();
                                        var dbImageTileDetails = new TileService().GetImageTilesByEntityId(_tile.EntityId);
                                        if (dbImageTileDetails != null)
                                        {
                                            image.CharacterProfileId = dbImageTileDetails.CharacterProfileId;
                                            image.ImageId = dbImageTileDetails.ImageId;
                                            image.Name = dbImageTileDetails.Name == null ? "" : dbImageTileDetails.Name;
                                            image.UserId = dbImageTileDetails.UserId;
                                            image.Imagepath = dbImageTileDetails.ImagePath == null ? "" : dbImageTileDetails.ImagePath;
                                            TileType.Imagetile = image;
                                        }
                                        break;
                                }

                            }
                            //Setting Tile View Model
                            _lsttileViewModel.Add(new TileViewModel()
                            {
                                EntityId = _tile.EntityId,
                                Height = _tile.Height,
                                Style = _tile.Style,
                                Styles = (_tile.Style != null && _tile.Style != "") ? Utility.ConvertStyleValueXMLtoClass(_tile.Style) : new Style(),
                                TabId = _tile.TileContentId,
                                TileId = _tile.TileId,
                                TileTypeId = _tile.TileTypeId,
                                UserId = _tile.UserId,
                                X = _tile.X,
                                Y = _tile.Y,
                                Width = _tile.Width,
                                Value = TileType,
                                TileTypeName = (_layouMetaData.TileTypes.Count > 0 && _tile.TileTypeId > 0) ? _layouMetaData.TileTypes.Where(p => p.TileId == _tile.TileTypeId).SingleOrDefault().TileType : "",
                                Mode = "Use"
                            });
                        }
                    }
                    _lsttabViewModel.Add(new TabViewModel()
                    {
                        LayoutId = _tab.LayoutId,
                        TabId = _tab.TabId,
                        TabName = _tab.TabName,
                        TabOrder = _tab.TabOrder,
                        UserId = _tab.UserId,
                        TileList = _lsttileViewModel,
                    });
                }

                _lstlayoutViewModel.Add(new LayoutViewModel()
                {
                    LayoutId = _layout.LayoutId,
                    Name = _layout.LayoutName,
                    UserId = _layout.UserId,
                    CharacterProfileId = _layout.CharacterProfileId,
                    CharacterName = (_layout.CharacterProfileId > 0) ? new CharacterService().GetCharactersByUserID(_layout.UserId).Where(p => p.CharacterProfileId == _layout.CharacterProfileId).SingleOrDefault().Name : "",
                    TabList = _lsttabViewModel,
                    CorestatValues = new CorestatService().GetCorestatsByCharacter(_layout.CharacterProfileId).CorestatValues,
                    LayoutMetaData = _layouMetaData,
                    RulesetViewModel = new RuleSetService().GetRuleSetDetailsByCharacterProfileId(_layout.CharacterProfileId),
                });
            }

            return _lstlayoutViewModel;
        }
        #endregion

    }
}