using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using System.Data;
using RPGSmith.Data;
using RPGSmith.Web.ViewModels;
using RPGSmith.Data.Models;
using System.IO;
using System.Text;
using RPGSmith.Web.Utilities;
using RPGSmith.DomainServices;
using Microsoft.AspNet.Identity;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net;
using Ionic.Zip;

namespace RPGSmith.Controllers
{
    public class RuleSetImportExportController : Controller
    {
        RPGSmithContext _context = new RPGSmithContext();
        ResponseViewModel _response;
        ServiceResponseModel _serviceResponseModel = new ServiceResponseModel();
        RuleSetService _rulesetService;

        public RuleSetImportExportController()
        {
            _response = new ResponseViewModel();
            _rulesetService = new RuleSetService();

        }

        // GET: RuleSetImportExport
        public ActionResult Index()
        {
            return View();
        }


        [HttpPost]
        public ActionResult Import(FormCollection fc)
        {
            ResponseViewModel response = new ResponseViewModel();
            try
            {
                string filedata = "";
                int rulesetId = 0;
                string filename = "";
                string RuleSetName = "";
                foreach (var key in fc.AllKeys)
                {
                    switch (key)
                    {
                        case "filedata":
                            filedata = fc[key];
                            break;
                        case "rulesetId":
                            rulesetId = Convert.ToInt32(fc[key]);
                            break;
                        case "RuleSetName":
                            RuleSetName = fc[key];
                            break;

                        case "filename":

                            if (fc[key] != "")
                            {
                                filename = fc[key];
                            }
                            else
                            {
                                filename = "";
                            }

                            break;

                    }

                }

                // Note: Validation
                string Error = "";
                Error = ValidateFileName(filename);

                if (Error == "")
                {
                    _serviceResponseModel = _rulesetService.Import(filedata, RuleSetName, User.Identity.GetUserId());
                    switch (_serviceResponseModel.StatusCode)
                    {
                        case 200:
                            _response.PayLoad = _serviceResponseModel.Result;
                            _response.StatusCode = 200;
                            _response.ErrorMessage = "";
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
                else
                {
                    _response.PayLoad = "";
                    _response.StatusCode = 400;
                    _response.ErrorMessage = Error;
                    _response.ShowToUser = true;

                    return Json(_response, JsonRequestBehavior.AllowGet);
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

        //[HttpGet]
        //public ActionResult Export2(int? RuleSetID)
        //{

        //    byte[] data= System.IO.File.ReadAllBytes(@"C:\Users\Ramana\Desktop\Character.zip");
        //    return File(data, "application/zip", "test.zip");

        //}


        [HttpGet]
        //public ActionResult Export(int? RuleSetID)
        //public FileContentResult Export(int? RuleSetID)
        public string Export(int? RuleSetID)
        {
            StringBuilder sb = new StringBuilder();
            MemoryStream obj = null;
            try
            {
                int Id = Convert.ToInt32(RuleSetID);

                if (RuleSetID > 0)
                {
                    // int RuleSetId = 5160;
                    int RuleSetId = Convert.ToInt32(RuleSetID);

                    string userId = User.Identity.GetUserId();
                    _serviceResponseModel = _rulesetService.Export(RuleSetId, userId);


                    switch (_serviceResponseModel.StatusCode)
                    {
                        case 200:

                            // byte[] s = (byte[])_serviceResponseModel.Result;
                            // obj = new MemoryStream(s);


                            //obj = (MemoryStream)_serviceResponseModel.Result;

                            //byte[] bytes = obj.GetBuffer();
                            //Response.Buffer = true;
                            //Response.Clear();
                            //Response.ContentType = "application/zip";
                            //Response.AddHeader("content-disposition", "attachment; filename=report.zip");
                            //Response.BinaryWrite(bytes);
                            //Response.Flush();


                            //public FileResult Download()
                            //{
                            //    byte[] fileBytes = System.IO.File.ReadAllBytes(@"c:\folder\myfile.ext");
                            //    string fileName = "myfile.ext";
                            //    return File(fileBytes, System.Net.Mime.MediaTypeNames.Application.Octet, fileName);
                            //}

                            // obj.Close();
                            //object obj= _serviceResponseModel.Result;

                            //sb = (StringBuilder)_serviceResponseModel.Result; 

                            _response.PayLoad = _serviceResponseModel.Result;
                            _response.StatusCode = 200;
                            _response.ErrorMessage = "";
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

            }
            catch (Exception ex)
            {
                _response.StatusCode = 400;
                _response.ErrorMessage = ex.Message;
                _response.ShowToUser = false;
            }



            return _serviceResponseModel.Result.ToString();
        }




        [HttpGet]
        public FileContentResult Export1(int? RuleSetID)
        {
            StringBuilder sb = new StringBuilder();

            try
            {
                int Id = Convert.ToInt32(RuleSetID);

                if (RuleSetID > 0)
                {
                    // int RuleSetId = 5160;
                    int RuleSetId = Convert.ToInt32(RuleSetID);

                    DataTable dtRuleset = new DataTable();
                    dtRuleset.Columns.Add("Type", typeof(string));
                    dtRuleset.Columns.Add("RulesetId", typeof(string));
                    dtRuleset.Columns.Add("RulesetName", typeof(string));
                    dtRuleset.Columns.Add("UserName", typeof(string));
                    dtRuleset.Columns.Add("CreatedDate", typeof(string));

                    DataTable dtGenralsettings = new DataTable();
                    dtGenralsettings.Columns.Add("Type", typeof(string));
                    dtGenralsettings.Columns.Add("PropertyId", typeof(string));
                    dtGenralsettings.Columns.Add("Value", typeof(string));

                    DataTable dtCorestats = new DataTable();
                    dtCorestats.Columns.Add("Type", typeof(string));
                    dtCorestats.Columns.Add("TypeId", typeof(string));
                    dtCorestats.Columns.Add("Name", typeof(string));
                    dtCorestats.Columns.Add("Description", typeof(string));
                    dtCorestats.Columns.Add("Metadata", typeof(string));


                    DataTable dtContents = new DataTable();
                    dtContents.Columns.Add("Type", typeof(string));
                    dtContents.Columns.Add("ContentId", typeof(string));
                    //dtContents.Columns.Add("ItemId", typeof(string));
                    dtContents.Columns.Add("ContentTypeId", typeof(string));
                    dtContents.Columns.Add("Value", typeof(string));
                    //dtContents.Columns.Add("NewItemId", typeof(string));

                    DataTable dtItemSpells = new DataTable();
                    dtItemSpells.Columns.Add("Type", typeof(string));
                    dtItemSpells.Columns.Add("ItemId", typeof(string));
                    dtItemSpells.Columns.Add("SpellId", typeof(string));
                    dtItemSpells.Columns.Add("Value", typeof(string));
                    dtItemSpells.Columns.Add("NewItemId", typeof(string));
                    //dtItemSpells.Columns.Add("NewSpellId", typeof(string));


                    DataTable dtCharacterProfile = new DataTable();
                    dtCharacterProfile.Columns.Add("Type", typeof(string));
                    dtCharacterProfile.Columns.Add("CharacterProfileId", typeof(string));
                    dtCharacterProfile.Columns.Add("RulesetId", typeof(string));
                    dtCharacterProfile.Columns.Add("Name", typeof(string));


                    DataTable dtCharacterISA = new DataTable();
                    dtCharacterISA.Columns.Add("Type", typeof(string));
                    dtCharacterISA.Columns.Add("CharacterItemId", typeof(string));
                    dtCharacterISA.Columns.Add("CharacterProfileId", typeof(string));


                    DataTable dtCharacterISAProperties = new DataTable();
                    dtCharacterISAProperties.Columns.Add("Type", typeof(string));
                    dtCharacterISAProperties.Columns.Add("CharacterItemId", typeof(string));
                    dtCharacterISAProperties.Columns.Add("TypeId", typeof(string));
                    dtCharacterISAProperties.Columns.Add("Value", typeof(string));


                    DataTable dtLayout = new DataTable();
                    dtLayout.Columns.Add("Type", typeof(string));
                    dtLayout.Columns.Add("LayoutId", typeof(string));
                    dtLayout.Columns.Add("CharacterProfileId", typeof(string));
                    dtLayout.Columns.Add("LayoutName", typeof(string));

                    DataTable dtTab = new DataTable();
                    dtTab.Columns.Add("Type", typeof(string));
                    dtTab.Columns.Add("TabId", typeof(string));
                    dtTab.Columns.Add("LayoutId", typeof(string));
                    dtTab.Columns.Add("TabName", typeof(string));


                    DataTable dtTile = new DataTable();
                    dtTile.Columns.Add("Type", typeof(string));
                    dtTile.Columns.Add("TileId", typeof(string));
                    dtTile.Columns.Add("TileContentId", typeof(string));
                    dtTile.Columns.Add("TileTypeId", typeof(string));
                    dtTile.Columns.Add("EntityId", typeof(string));
                    dtTile.Columns.Add("Style", typeof(string));
                    dtTile.Columns.Add("X", typeof(string));
                    dtTile.Columns.Add("Y", typeof(string));
                    dtTile.Columns.Add("Width", typeof(string));
                    dtTile.Columns.Add("Height", typeof(string));
                    dtTile.Columns.Add("TileLocationId", typeof(string));


                    DataTable dtCounterTile = new DataTable();
                    dtCounterTile.Columns.Add("Type", typeof(string));
                    dtCounterTile.Columns.Add("CounterId", typeof(string));
                    dtCounterTile.Columns.Add("CharacterProfileId", typeof(string));
                    dtCounterTile.Columns.Add("Name", typeof(string));
                    dtCounterTile.Columns.Add("Value", typeof(string));
                    dtCounterTile.Columns.Add("Min", typeof(string));
                    dtCounterTile.Columns.Add("Max", typeof(string));
                    dtCounterTile.Columns.Add("Step", typeof(string));
                    // CounterId CharacterProfileId Name Value Min Max Step


                    DataTable dtAttributeTile = new DataTable();
                    dtAttributeTile.Columns.Add("Type", typeof(string));
                    dtAttributeTile.Columns.Add("AttributeId", typeof(string));
                    dtAttributeTile.Columns.Add("CharacterProfileId", typeof(string));
                    dtAttributeTile.Columns.Add("Name", typeof(string));
                    dtAttributeTile.Columns.Add("CorestatValue", typeof(string));
                    // AttributeId  CharacterProfileId Name CorestatValue

                    DataTable dtLinkTile = new DataTable();
                    dtLinkTile.Columns.Add("Type", typeof(string));
                    dtLinkTile.Columns.Add("LinkId", typeof(string));
                    dtLinkTile.Columns.Add("CharacterProfileId", typeof(string));
                    dtLinkTile.Columns.Add("Name", typeof(string));
                    dtLinkTile.Columns.Add("SelectedProperty", typeof(string));
                    dtLinkTile.Columns.Add("SelectedPropertyValue", typeof(string));
                    //LinkId CharacterProfileId Name SelectedProperty SelectedPropertyValue


                    DataTable dtExecuteTile = new DataTable();
                    dtExecuteTile.Columns.Add("Type", typeof(string));
                    dtExecuteTile.Columns.Add("ExecuteId", typeof(string));
                    dtExecuteTile.Columns.Add("CharacterProfileId", typeof(string));
                    dtExecuteTile.Columns.Add("Name", typeof(string));
                    dtExecuteTile.Columns.Add("SelectedProperty", typeof(string));
                    dtExecuteTile.Columns.Add("SelectedPropertyValue", typeof(string));
                    //ExecuteId CharacterProfileId Name SelectedProperty SelectedPropertyValue


                    DataTable dtCommandTile = new DataTable();
                    dtCommandTile.Columns.Add("Type", typeof(string));
                    dtCommandTile.Columns.Add("CommandId", typeof(string));
                    dtCommandTile.Columns.Add("CharacterProfileId", typeof(string));
                    dtCommandTile.Columns.Add("Name", typeof(string));
                    dtCommandTile.Columns.Add("Command", typeof(string));
                    dtCommandTile.Columns.Add("CommandLastResult", typeof(string));
                    //CommandId CharacterProfileId Name Command CommandLastResult


                    DataTable dtImageTile = new DataTable();
                    dtImageTile.Columns.Add("Type", typeof(string));
                    dtImageTile.Columns.Add("ImageId", typeof(string));
                    dtImageTile.Columns.Add("CharacterProfileId", typeof(string));
                    dtImageTile.Columns.Add("Name", typeof(string));
                    dtImageTile.Columns.Add("ImagePath", typeof(string));
                    //ImageId CharacterProfileId Name ImagePath



                    var _dataQueryRuleSet = _context.RuleSets.Where(p => p.RulesetID == RuleSetId).SingleOrDefault();
                    //_ruleSetViewModel.Id = _dataQueryRuleSet.RulesetID;
                    //_ruleSetViewModel.UserId = _dataQueryRuleSet.UserId;
                    //_ruleSetViewModel.Name = _dataQueryRuleSet.Name;

                    var userDetaisls = (from rulesetprop in _context.AspNetUsers
                                        where rulesetprop.Id == _dataQueryRuleSet.UserId
                                        select rulesetprop
                                           ).FirstOrDefault();

                    string RecordType = "\"R\"";
                    string RulesetIdNum = "\"" + RuleSetId + "\"";
                    string RulesetName = "\"" + _dataQueryRuleSet.Name + "\"";
                    string UserName = "\"" + userDetaisls.Name + "\"";
                    string CreatedDate = "\"" + DateTime.Now + "\"";

                    // dtRuleset.Rows.Add("R", RuleSetId, _dataQueryRuleSet.Name, _dataQueryRuleSet.UserId,DateTime.Now);
                    dtRuleset.Rows.Add(RecordType, RulesetIdNum, RulesetName, UserName, CreatedDate);


                    // Note:- General Settings
                    var generalSettings = _context.RulesetPropertyValues.Where(p => p.RulesetID == RuleSetId).ToList();

                    if (generalSettings != null && generalSettings.Count > 0)
                    {
                        foreach (var _generalSettings in generalSettings)
                        {
                            string PropertyId = "\"" + _generalSettings.PropertyId + "\"";
                            string Value = "\"" + _generalSettings.Value + "\"";

                            dtGenralsettings.Rows.Add("\"G\"", PropertyId, Value);

                        }

                    }

                    // Note:- CoreStats
                    List<Corestats> corestats = new List<Corestats>();
                    var _dataQueryCoreStat = _context.CoreStats.Where(x => x.RulesetID == RuleSetId).ToList();
                    if (_dataQueryCoreStat != null && _dataQueryCoreStat.Count > 0)
                    {
                        foreach (var type in _dataQueryCoreStat.ToList())
                        {
                            string TypeId;
                            string Name;
                            string Description;
                            string Metadata;

                            Corestats stats = new Corestats();
                            //stats.Id = type.CorestatID;
                            TypeId = "\"" + type.TypeId.ToString() + "\"";
                            Name = type.Name;
                            Description = type.Description;
                            Metadata = type.Metadata;

                            dtCorestats.Rows.Add("\"CO\"", "\"" + type.TypeId.ToString() + "\"", "\"" + type.Name + "\"", "\"" + type.Description + "\"", "\"" + type.Metadata + "\"");

                        }
                    }


                    var _ruleSetItems = _context.RuleSetItemsContents.Where(p => p.RulesetID == RuleSetId && p.Type == 1).ToList();
                    var _ruleSetSpells = _context.RuleSetItemsContents.Where(p => p.RulesetID == RuleSetId && p.Type == 2).ToList();
                    var _ruleSetAbilitys = _context.RuleSetItemsContents.Where(p => p.RulesetID == RuleSetId && p.Type == 3).ToList();

                    if (_ruleSetAbilitys != null && _ruleSetAbilitys.Count > 0)
                    {
                        dtContents = getRuleSetContentsData(dtContents, dtItemSpells, _ruleSetAbilitys, 3);
                    }
                    if (_ruleSetSpells != null && _ruleSetSpells.Count > 0)
                    {
                        dtContents = getRuleSetContentsData(dtContents, dtItemSpells, _ruleSetSpells, 2);
                    }
                    if (_ruleSetItems != null && _ruleSetItems.Count > 0)
                    {
                        dtContents = getRuleSetContentsData(dtContents, dtItemSpells, _ruleSetItems, 1);
                    }

                    if (_ruleSetItems != null)
                    {
                        dtItemSpells = getItemSpellData(Convert.ToInt32(RuleSetID), dtItemSpells);
                    }



                    // Charecter Data Binding

                    var _CharacterProfileList = (from _CharacterProfiles in _context.CharacterProfiles
                                                 where _CharacterProfiles.RulesetId == RuleSetId
                                                 select _CharacterProfiles).ToList();

                    var _CharacterItemsList = (from _CharacterItems in _context.CharacterItems
                                               join _CharacterProfiles in _context.CharacterProfiles
                                               on _CharacterItems.CharacterProfileId equals _CharacterProfiles.CharacterProfileId
                                               where _CharacterProfiles.RulesetId == RuleSetId
                                               select _CharacterItems).ToList();


                    var _CharacterItemsPropertysList = (from _CharacterItemProperties in _context.CharacterItemProperties
                                                        from _CharacterItems in _context.CharacterItems
                                                        .Where(mapping => mapping.CharacterItemId == _CharacterItemProperties.CharacterItemId)
                                                        join _CharacterProfiles in _context.CharacterProfiles
                                                        on _CharacterItems.CharacterProfileId equals _CharacterProfiles.CharacterProfileId
                                                        where _CharacterProfiles.RulesetId == RuleSetId
                                                        select _CharacterItemProperties).ToList();

                    var _CharacterSpellsList = (from _CharacterSpells in _context.CharacterSpells
                                                join _CharacterProfiles in _context.CharacterProfiles
                                                on _CharacterSpells.CharacterProfileId equals _CharacterProfiles.CharacterProfileId
                                                where _CharacterProfiles.RulesetId == RuleSetId
                                                select _CharacterSpells).ToList();



                    var _CharacterSpellsPropertysList = (from _CharacterSpellProperties in _context.CharacterSpellProperties
                                                         from _CharacterSpells in _context.CharacterSpells
                                                         .Where(mapping => mapping.CharacterSpellId == _CharacterSpellProperties.CharacterSpellId)
                                                         join _CharacterProfiles in _context.CharacterProfiles
                                                         on _CharacterSpells.CharacterProfileId equals _CharacterProfiles.CharacterProfileId
                                                         where _CharacterProfiles.RulesetId == RuleSetId
                                                         select _CharacterSpellProperties).ToList();


                    var _CharacterAbilityList = (from _CharacterAbilities in _context.CharacterAbilities
                                                 join _CharacterProfiles in _context.CharacterProfiles
                                                 on _CharacterAbilities.CharacterProfileId equals _CharacterProfiles.CharacterProfileId
                                                 where _CharacterProfiles.RulesetId == RuleSetId
                                                 select _CharacterAbilities).ToList();



                    var _CharacterAbilityPropertysList = (from _CharacterAbilityProperties in _context.CharacterAbilityProperties
                                                          from _CharacterAbilities in _context.CharacterAbilities
                                                          .Where(mapping => mapping.CharacterAbilityId == _CharacterAbilityProperties.CharacterAbilityId)
                                                          join _CharacterProfiles in _context.CharacterProfiles
                                                          on _CharacterAbilities.CharacterProfileId equals _CharacterProfiles.CharacterProfileId
                                                          where _CharacterProfiles.RulesetId == RuleSetId
                                                          select _CharacterAbilityProperties).ToList();


                    var _LayoutList = (from _Layouts in _context.Layouts
                                       join _CharacterProfiles in _context.CharacterProfiles
                                       on _Layouts.CharacterProfileId equals _CharacterProfiles.CharacterProfileId
                                       where _CharacterProfiles.RulesetId == RuleSetId
                                       select _Layouts).ToList();


                    var _TabList = (from _Tabs in _context.Tabs
                                    join _Layouts in _context.Layouts
                                    on _Tabs.LayoutId equals _Layouts.LayoutId
                                    join _CharacterProfiles in _context.CharacterProfiles
                                    on _Layouts.CharacterProfileId equals _CharacterProfiles.CharacterProfileId
                                    where _CharacterProfiles.RulesetId == RuleSetId
                                    select _Tabs).ToList();

                    var _TileList = (from _Tiles in _context.Tiles
                                     join _Tabs in _context.Tabs on _Tiles.TileContentId equals _Tabs.TabId
                                     join _Layouts in _context.Layouts on _Tabs.LayoutId equals _Layouts.LayoutId
                                     join _CharacterProfiles in _context.CharacterProfiles
                                     on _Layouts.CharacterProfileId equals _CharacterProfiles.CharacterProfileId
                                     where _CharacterProfiles.RulesetId == RuleSetId
                                     select _Tiles).ToList();





                    var _CounterTileList = (from _CounterTiles in _context.CounterTiles
                                            join _CharacterProfiles in _context.CharacterProfiles
                                            on _CounterTiles.CharacterProfileId equals _CharacterProfiles.CharacterProfileId
                                            where _CharacterProfiles.RulesetId == RuleSetId
                                            select _CounterTiles).ToList();

                    var _AttributeTilesList = (from _AttributeTiles in _context.AttributeTiles
                                               join _CharacterProfiles in _context.CharacterProfiles
                                                on _AttributeTiles.CharacterProfileId equals _CharacterProfiles.CharacterProfileId
                                               where _CharacterProfiles.RulesetId == RuleSetId
                                               select _AttributeTiles).ToList();

                    var _LinkTilesList = (from _LinkTiles in _context.LinkTiles
                                          join _CharacterProfiles in _context.CharacterProfiles
                                           on _LinkTiles.CharacterProfileId equals _CharacterProfiles.CharacterProfileId
                                          where _CharacterProfiles.RulesetId == RuleSetId
                                          select _LinkTiles).ToList();



                    var _ExecuteTilesList = (from _ExecuteTiles in _context.ExecuteTiles
                                             join _CharacterProfiles in _context.CharacterProfiles
                                              on _ExecuteTiles.CharacterProfileId equals _CharacterProfiles.CharacterProfileId
                                             where _CharacterProfiles.RulesetId == RuleSetId
                                             select _ExecuteTiles).ToList();


                    var _CommandTilesList = (from _CommandTiles in _context.CommandTiles
                                             join _CharacterProfiles in _context.CharacterProfiles
                                              on _CommandTiles.CharacterProfileId equals _CharacterProfiles.CharacterProfileId
                                             where _CharacterProfiles.RulesetId == RuleSetId
                                             select _CommandTiles).ToList();


                    var _ImageTilesList = (from _ImageTiles in _context.ImageTiles
                                           join _CharacterProfiles in _context.CharacterProfiles
                                            on _ImageTiles.CharacterProfileId equals _CharacterProfiles.CharacterProfileId
                                           where _CharacterProfiles.RulesetId == RuleSetId
                                           select _ImageTiles).ToList();


                    foreach (var _CharacterProfile in _CharacterProfileList)
                    {
                        dtCharacterProfile.Rows.Add("\"CP\"", "\"" + _CharacterProfile.CharacterProfileId.ToString() + "\"", "\"" + _CharacterProfile.RulesetId.ToString() + "\"", "\"" + _CharacterProfile.Name.ToString() + "\"");
                    }


                    // Character Items,Spells,Abilitys
                    foreach (var _CharacterItems in _CharacterItemsList)
                    {
                        dtCharacterISA.Rows.Add("\"CI\"", "\"" + _CharacterItems.CharacterItemId.ToString() + "\"", "\"" + _CharacterItems.CharacterProfileId.ToString() + "\"");
                    }

                    foreach (var _CharacterSpells in _CharacterSpellsList)
                    {
                        dtCharacterISA.Rows.Add("\"CS\"", "\"" + _CharacterSpells.CharacterSpellId.ToString() + "\"", "\"" + _CharacterSpells.CharacterProfileId.ToString() + "\"");
                    }

                    foreach (var _CharacterAbility in _CharacterAbilityList)
                    {
                        dtCharacterISA.Rows.Add("\"CA\"", "\"" + _CharacterAbility.CharacterAbilityId.ToString() + "\"", "\"" + _CharacterAbility.CharacterProfileId.ToString() + "\"");
                    }


                    // Character ISA Propertiys
                    foreach (var _CharacterItemsProperty in _CharacterItemsPropertysList)
                    {
                        dtCharacterISAProperties.Rows.Add("\"CIP\"", "\"" + _CharacterItemsProperty.CharacterItemId.ToString() + "\"", "\"" + _CharacterItemsProperty.Id.ToString() + "\"", "\"" + _CharacterItemsProperty.Value.ToString() + "\"");
                    }

                    foreach (var _CharacterSpellsProperty in _CharacterSpellsPropertysList)
                    {
                        dtCharacterISAProperties.Rows.Add("\"CSP\"", "\"" + _CharacterSpellsProperty.CharacterSpellId.ToString() + "\"", "\"" + _CharacterSpellsProperty.Id.ToString() + "\"", "\"" + _CharacterSpellsProperty.Value.ToString() + "\"");
                    }

                    foreach (var _CharacterAbilityPropertys in _CharacterAbilityPropertysList)
                    {
                        dtCharacterISAProperties.Rows.Add("\"CAP\"", "\"" + _CharacterAbilityPropertys.CharacterAbilityId.ToString() + "\"", "\"" + _CharacterAbilityPropertys.Id.ToString() + "\"", "\"" + _CharacterAbilityPropertys.Value.ToString() + "\"");
                    }


                    // Character Layout 
                    foreach (var _Layout in _LayoutList)
                    {
                        dtLayout.Rows.Add("\"CL\"", "\"" + _Layout.LayoutId.ToString() + "\"", "\"" + _Layout.CharacterProfileId.ToString() + "\"", "\"" + _Layout.LayoutName.ToString() + "\"");
                    }

                    // Character Tab 
                    foreach (var _Tab in _TabList)
                    {
                        dtTab.Rows.Add("\"CTB\"", "\"" + _Tab.TabId.ToString() + "\"", "\"" + _Tab.LayoutId.ToString() + "\"", "\"" + _Tab.TabName.ToString() + "\"");
                    }

                    // Character Tile 
                    foreach (var _Tile in _TileList)
                    {
                        dtTile.Rows.Add("\"CT\"", "\"" + _Tile.TileId.ToString() + "\"", "\"" + _Tile.TileContentId.ToString() + "\"", "\"" + _Tile.TileTypeId.ToString() + "\"", "\"" + _Tile.EntityId.ToString() + "\"", "\"" + _Tile.Style.ToString() + "\"", "\"" + _Tile.X.ToString() + "\"", "\"" + _Tile.Y.ToString() + "\"", "\"" + _Tile.Width.ToString() + "\"", "\"" + _Tile.Height.ToString() + "\"", "\"" + _Tile.TileLocationId.ToString() + "\"");
                    }



                    //DataTable dtTile = new DataTable();
                    //dtTile.Columns.Add("Type", typeof(string));
                    //dtTile.Columns.Add("TileId", typeof(string));
                    //dtTile.Columns.Add("TileContentId", typeof(string));
                    //dtTile.Columns.Add("TileTypeId", typeof(string));
                    //dtTile.Columns.Add("EntityId", typeof(string));
                    //dtTile.Columns.Add("Style", typeof(string));
                    //dtTile.Columns.Add("X", typeof(string));
                    //dtTile.Columns.Add("Y", typeof(string));
                    //dtTile.Columns.Add("Width", typeof(string));
                    //dtTile.Columns.Add("Height", typeof(string));
                    //dtTile.Columns.Add("TileLocationId", typeof(string));

                    //   _CounterTileList _AttributeTilesList    _LinkTilesList _ExecuteTilesList    _CommandTilesList _ImageTilesList


                    // Counter Tile 
                    foreach (var _CounterTile in _CounterTileList)
                    {
                        dtCounterTile.Rows.Add("\"COT\"", "\"" + _CounterTile.CounterId.ToString() + "\"", "\"" + _CounterTile.CharacterProfileId.ToString() + "\"", "\"" + _CounterTile.Name.ToString() + "\"", "\"" + _CounterTile.Value.ToString() + "\"", "\"" + _CounterTile.Min.ToString() + "\"", "\"" + _CounterTile.Max.ToString() + "\"", "\"" + _CounterTile.Step.ToString() + "\"");
                    }

                    // Attribute Tiles 
                    foreach (var _AttributeTiles in _AttributeTilesList)
                    {
                        dtAttributeTile.Rows.Add("\"CAT\"", "\"" + _AttributeTiles.AttributeId.ToString() + "\"", "\"" + _AttributeTiles.CharacterProfileId.ToString() + "\"", "\"" + _AttributeTiles.Name.ToString() + "\"", "\"" + _AttributeTiles.CorestatValue.ToString() + "\"");
                    }

                    // Link Tiles 
                    foreach (var _LinkTiles in _LinkTilesList)
                    {
                        dtLinkTile.Rows.Add("\"CLT\"", "\"" + _LinkTiles.LinkId.ToString() + "\"", "\"" + _LinkTiles.CharacterProfileId.ToString() + "\"", "\"" + _LinkTiles.Name.ToString() + "\"", "\"" + _LinkTiles.SelectedProperty.ToString() + "\"", "\"" + _LinkTiles.SelectedPropertyValue.ToString() + "\"");
                    }

                    // Execute Tiles
                    foreach (var _ExecuteTiles in _ExecuteTilesList)
                    {
                        dtExecuteTile.Rows.Add("\"CET\"", "\"" + _ExecuteTiles.ExecuteId.ToString() + "\"", "\"" + _ExecuteTiles.CharacterProfileId.ToString() + "\"", "\"" + _ExecuteTiles.Name.ToString() + "\"", "\"" + _ExecuteTiles.SelectedProperty.ToString() + "\"", "\"" + _ExecuteTiles.SelectedPropertyValue.ToString() + "\"");
                    }

                    // Command Tile
                    foreach (var _CommandTiles in _CommandTilesList)
                    {
                        dtCommandTile.Rows.Add("\"CCT\"", "\"" + _CommandTiles.CommandId.ToString() + "\"", "\"" + _CommandTiles.CharacterProfileId.ToString() + "\"", "\"" + _CommandTiles.Name.ToString() + "\"", "\"" + _CommandTiles.Command.ToString() + "\"", "\"" + _CommandTiles.CommandLastResult.ToString() + "\"");
                    }

                    // Image Tile
                    foreach (var _ImageTiles in _ImageTilesList)
                    {
                        dtImageTile.Rows.Add("\"CIM\"", "\"" + _ImageTiles.ImageId.ToString() + "\"", "\"" + _ImageTiles.CharacterProfileId.ToString() + "\"", "\"" + _ImageTiles.Name.ToString() + "\"", "\"" + _ImageTiles.ImagePath.ToString() + "\"");
                    }




                    if (dtRuleset.Rows.Count > 0)
                    {
                        foreach (DataRow dr in dtRuleset.Rows)
                        {
                            foreach (DataColumn dc in dtRuleset.Columns)
                                sb.Append(dr[dc.ColumnName].ToString() + ",");
                            sb.Remove(sb.Length - 1, 1);
                            sb.AppendLine();
                        }
                    }


                    if (dtGenralsettings.Rows.Count > 0)
                    {
                        foreach (DataRow dr in dtGenralsettings.Rows)
                        {
                            foreach (DataColumn dc in dtGenralsettings.Columns)
                                sb.Append(dr[dc.ColumnName].ToString() + ",");
                            sb.Remove(sb.Length - 1, 1);
                            sb.AppendLine();
                        }
                    }


                    if (dtCorestats.Rows.Count > 0)
                    {
                        foreach (DataRow dr in dtCorestats.Rows)
                        {
                            foreach (DataColumn dc in dtCorestats.Columns)
                                sb.Append(dr[dc.ColumnName].ToString() + ",");
                            sb.Remove(sb.Length - 1, 1);
                            sb.AppendLine();
                        }

                    }

                    if (dtContents.Rows.Count > 0)
                    {

                        foreach (DataRow dr in dtContents.Rows)
                        {
                            foreach (DataColumn dc in dtContents.Columns)
                                sb.Append(dr[dc.ColumnName].ToString() + ",");
                            sb.Remove(sb.Length - 1, 1);
                            sb.AppendLine();
                        }

                        if (dtItemSpells.Rows.Count > 0)
                        {
                            foreach (DataRow dr in dtItemSpells.Rows)
                            {
                                foreach (DataColumn dc in dtItemSpells.Columns)
                                    sb.Append(dr[dc.ColumnName].ToString() + ",");
                                sb.Remove(sb.Length - 1, 1);
                                sb.AppendLine();
                            }

                        }

                    }


                    // charecter Profile

                    if (dtCharacterProfile.Rows.Count > 0)
                    {

                        foreach (DataRow dr in dtCharacterProfile.Rows)
                        {
                            foreach (DataColumn dc in dtCharacterProfile.Columns)
                                sb.Append(dr[dc.ColumnName].ToString() + ",");
                            sb.Remove(sb.Length - 1, 1);
                            sb.AppendLine();
                        }

                    }
                    if (dtCharacterISA.Rows.Count > 0)
                    {
                        foreach (DataRow dr in dtCharacterISA.Rows)
                        {
                            foreach (DataColumn dc in dtCharacterISA.Columns)
                                sb.Append(dr[dc.ColumnName].ToString() + ",");
                            sb.Remove(sb.Length - 1, 1);
                            sb.AppendLine();
                        }

                    }
                    if (dtCharacterISAProperties.Rows.Count > 0)
                    {
                        foreach (DataRow dr in dtCharacterISAProperties.Rows)
                        {
                            foreach (DataColumn dc in dtCharacterISAProperties.Columns)
                                sb.Append(dr[dc.ColumnName].ToString() + ",");
                            sb.Remove(sb.Length - 1, 1);
                            sb.AppendLine();
                        }
                    }


                    if (dtLayout.Rows.Count > 0)
                    {
                        foreach (DataRow dr in dtLayout.Rows)
                        {
                            foreach (DataColumn dc in dtLayout.Columns)
                                sb.Append(dr[dc.ColumnName].ToString() + ",");
                            sb.Remove(sb.Length - 1, 1);
                            sb.AppendLine();
                        }
                    }

                    if (dtTab.Rows.Count > 0)
                    {
                        foreach (DataRow dr in dtTab.Rows)
                        {
                            foreach (DataColumn dc in dtTab.Columns)
                                sb.Append(dr[dc.ColumnName].ToString() + ",");
                            sb.Remove(sb.Length - 1, 1);
                            sb.AppendLine();
                        }
                    }

                    if (dtTile.Rows.Count > 0)
                    {
                        foreach (DataRow dr in dtTile.Rows)
                        {
                            foreach (DataColumn dc in dtTile.Columns)
                                sb.Append(dr[dc.ColumnName].ToString() + ",");
                            sb.Remove(sb.Length - 1, 1);
                            sb.AppendLine();
                        }
                    }

                    if (dtCounterTile.Rows.Count > 0)
                    {
                        foreach (DataRow dr in dtCounterTile.Rows)
                        {
                            foreach (DataColumn dc in dtCounterTile.Columns)
                                sb.Append(dr[dc.ColumnName].ToString() + ",");
                            sb.Remove(sb.Length - 1, 1);
                            sb.AppendLine();
                        }
                    }

                    if (dtAttributeTile.Rows.Count > 0)
                    {
                        foreach (DataRow dr in dtAttributeTile.Rows)
                        {
                            foreach (DataColumn dc in dtAttributeTile.Columns)
                                sb.Append(dr[dc.ColumnName].ToString() + ",");
                            sb.Remove(sb.Length - 1, 1);
                            sb.AppendLine();
                        }
                    }

                    if (dtLinkTile.Rows.Count > 0)
                    {
                        foreach (DataRow dr in dtLinkTile.Rows)
                        {
                            foreach (DataColumn dc in dtLinkTile.Columns)
                                sb.Append(dr[dc.ColumnName].ToString() + ",");
                            sb.Remove(sb.Length - 1, 1);
                            sb.AppendLine();
                        }
                    }

                    if (dtExecuteTile.Rows.Count > 0)
                    {
                        foreach (DataRow dr in dtExecuteTile.Rows)
                        {
                            foreach (DataColumn dc in dtExecuteTile.Columns)
                                sb.Append(dr[dc.ColumnName].ToString() + ",");
                            sb.Remove(sb.Length - 1, 1);
                            sb.AppendLine();
                        }
                    }

                    if (dtCommandTile.Rows.Count > 0)
                    {
                        foreach (DataRow dr in dtCommandTile.Rows)
                        {
                            foreach (DataColumn dc in dtCommandTile.Columns)
                                sb.Append(dr[dc.ColumnName].ToString() + ",");
                            sb.Remove(sb.Length - 1, 1);
                            sb.AppendLine();
                        }
                    }

                    if (dtImageTile.Rows.Count > 0)
                    {
                        foreach (DataRow dr in dtImageTile.Rows)
                        {
                            foreach (DataColumn dc in dtImageTile.Columns)
                                sb.Append(dr[dc.ColumnName].ToString() + ",");
                            sb.Remove(sb.Length - 1, 1);
                            sb.AppendLine();
                        }
                    }


                    //DataTable dtCounterTile = new DataTable();
                    //DataTable dtAttributeTile = new DataTable();
                    //DataTable dtLinkTile = new DataTable();
                    //DataTable dtExecuteTile = new DataTable();
                    //DataTable dtCommandTile = new DataTable();
                    //DataTable dtImageTile = new DataTable();


                }
                else
                {

                }

            }
            catch (Exception ex)
            {
                //_response.StatusCode = 400;
                //_response.ErrorMessage = ex.Message;
                //_response.ShowToUser = false;
                throw;
            }

            //string csv = "Charlie, Chaplin, Chuckles";
            //return File(new System.Text.UTF8Encoding().GetBytes(csv), "text/csv", "Report123.csv");
            // string csv = "Charlie, Chaplin, Chuckles";
            // return "";

            char[] dest = new char[sb.Length];
            sb.CopyTo(0, dest, 0, sb.Length);
            return File(new System.Text.UTF8Encoding().GetBytes(dest), "text/csv", "Report123.csv");
            //FileContentResult


            // FileResult
            //// Compose a string that consists of three lines.
            //string lines = "First line.\r\nSecond line.\r\nThird line.";
            //string Path = "D:\\Srinivas Vadla\\Example_Practice";

            //// Write the string to a file.
            //System.IO.StreamWriter file = new System.IO.StreamWriter(Path + "\\test.csv");
            //file.WriteLine(sb);
            //file.Close();



            //var stream = new MemoryStream();
            ////... add content to the stream.
            //string FilePath = "D:\\Srinivas Vadla\\Example_Practice\\test.csv";


            ////FileContentResult
            ////return File(stream.GetBuffer(), "application/csv", FilePath);

            //string ContentType = "application/csv";

            //return new FilePathResult(FilePath, ContentType);


        }

        static string base64String = null;
        public string ImageToBase64()
        {
            string path = "D:\\SampleImage.jpg";
            using (System.Drawing.Image image = System.Drawing.Image.FromFile(path))
            {
                using (MemoryStream m = new MemoryStream())
                {
                    image.Save(m, image.RawFormat);
                    byte[] imageBytes = m.ToArray();
                    base64String = Convert.ToBase64String(imageBytes);
                    return base64String;
                }
            }
        }
        public System.Drawing.Image Base64ToImage()
        {
            byte[] imageBytes = Convert.FromBase64String(base64String);
            MemoryStream ms = new MemoryStream(imageBytes, 0, imageBytes.Length);
            ms.Write(imageBytes, 0, imageBytes.Length);
            System.Drawing.Image image = System.Drawing.Image.FromStream(ms, true);
            return image;
        }
        protected void ImageToBase_Click(object sender, EventArgs e)
        {
            // TextBox1.Text = ImageToBase64();




        }
        protected void BaseToImage_Click(object sender, EventArgs e)
        {
            // Base64ToImage().Save(Server.MapPath("~/Images/Hello.jpg"));
            // Image1.ImageUrl = "~/Images/Hello.jpg";

        }


        public string Image_convert(string ImagePath)
        {
            // string path = "D:\\SampleImage.jpg";
            string path = ImagePath;
            string path2 = Server.MapPath(@"~/" + path);


            using (System.Drawing.Image image = System.Drawing.Image.FromFile(path2))
            {
                using (MemoryStream m = new MemoryStream())
                {
                    image.Save(m, image.RawFormat);
                    byte[] imageBytes = m.ToArray();
                    base64String = Convert.ToBase64String(imageBytes);
                    return base64String;
                }
            }

        }


        public string verifyForDupliacte(string val, int caseId, int RuleSetId)
        {

            var Result = _context.CoreStats.Where(p => p.RulesetID == RuleSetId && p.Name == val).FirstOrDefault();

            if (Result != null)
            {
                val = val + "_1";
            }

            return val;
        }


        public DataTable getGeneralSettingsData(DataTable dtGenralsettings)
        {


            return dtGenralsettings;
        }


        public DataTable getCharacterConvertedData(DataTable dtTable, int TransactionType)
        {

            switch (TransactionType)
            {
                case 1:
                    // Character Profile



                    break;

            }

            return dtTable;
        }


        public DataTable getRuleSetContentsData(DataTable dtContents, DataTable dtItemSpells, List<Data.Models.RuleSetItemsContent> _ruleSetContentsList, int Type)
        {

            string RecordType = "";
            string ContentId = "";
            ///string ItemId = "";
            string ContentTypeId = "";
            string Value = "";


            if (Type == 3)
            {
                RecordType = "\"AP\"";

                foreach (var _ruleSetItem in _ruleSetContentsList)
                {
                    var _ruleSetAbilityProperties = (from _abilityProperties in _context.RulesetContentTypes
                                                     join rpgType in _context.RPGSmithTypes on _abilityProperties.TypeId equals rpgType.TypeID
                                                     join _abilityPropertyValue in _context.Abilities on _abilityProperties.Id equals _abilityPropertyValue.ContentTypeId into ps
                                                     from _abilityPropertyValue in ps.DefaultIfEmpty()
                                                     where _abilityPropertyValue.ContentId == _ruleSetItem.ContentId
                                                     select new
                                                     {
                                                         Id = _abilityPropertyValue.AbilityId,
                                                         ContentTypeId = _abilityPropertyValue.ContentTypeId,
                                                         TypeId = _abilityProperties.TypeId,
                                                         Name = _abilityProperties.Name,
                                                         Description = _abilityProperties.Description,
                                                         Value = _abilityPropertyValue.value,
                                                         Units = rpgType.Units
                                                     }).ToList();

                    if (_ruleSetAbilityProperties != null)
                    {
                        dtContents.Rows.Add("\"A\"", "\"" + _ruleSetItem.ContentId.ToString() + "\"", "\"3\"", "\"Start\"");

                        foreach (var _ruleSetAbilityPropertie in _ruleSetAbilityProperties)
                        {
                            if (_ruleSetItem.ContentId.ToString() != null || _ruleSetItem.ContentId.ToString() != "")
                            {
                                ContentId = "\"" + _ruleSetItem.ContentId.ToString() + "\"";
                            }
                            else
                            {
                                ContentId = "";
                            }

                            if (_ruleSetAbilityPropertie.ContentTypeId.ToString() != null || _ruleSetAbilityPropertie.ContentTypeId.ToString() != "")
                            {
                                ContentTypeId = "\"" + _ruleSetAbilityPropertie.ContentTypeId.ToString() + "\"";


                            }
                            else
                            {
                                ContentTypeId = "\"\"";
                            }

                            if (_ruleSetAbilityPropertie.Value == null)
                            {
                                Value = "\"\"";
                            }
                            else
                            {
                                Value = "\"" + _ruleSetAbilityPropertie.Value.ToString() + "\"";
                            }
                            dtContents.Rows.Add(RecordType, ContentId, ContentTypeId, Value);
                        }

                        dtContents.Rows.Add("\"A\"", "\"" + _ruleSetItem.ContentId.ToString() + "\"", "\"3\"", "\"End\"");
                    }

                }
            }
            else if (Type == 2)
            {
                RecordType = "\"SP\"";

                foreach (var _ruleSetItem in _ruleSetContentsList)
                {
                    Items _ruleSetItemVM = new Items();
                    _ruleSetItemVM.ItemProperties = new List<ItemProperties>();
                    var _ruleSetSpellProperties = (from _spellProperties in _context.RulesetContentTypes
                                                   join rpgType in _context.RPGSmithTypes on _spellProperties.TypeId equals rpgType.TypeID
                                                   join _spellPropertyValue in _context.Spells on _spellProperties.Id equals _spellPropertyValue.ContentTypeId into ps
                                                   from _spellPropertyValue in ps.DefaultIfEmpty()
                                                   where _spellPropertyValue.ContentId == _ruleSetItem.ContentId
                                                   select new
                                                   {
                                                       Id = _spellPropertyValue.SpellId,
                                                       ContentTypeId = _spellPropertyValue.ContentTypeId,
                                                       TypeId = _spellProperties.TypeId,
                                                       Name = _spellProperties.Name,
                                                       Description = _spellProperties.Description,
                                                       Value = _spellPropertyValue.value,
                                                       Units = rpgType.Units
                                                   }).ToList();

                    if (_ruleSetSpellProperties != null)
                    {

                        dtContents.Rows.Add("\"S\"", "\"" + _ruleSetItem.ContentId.ToString() + "\"", "\"2\"", "\"Start\"");

                        foreach (var _ruleSetSpellPropertie in _ruleSetSpellProperties)
                        {
                            if (_ruleSetItem.ContentId.ToString() != null || _ruleSetItem.ContentId.ToString() != "")
                            {
                                ContentId = "\"" + _ruleSetItem.ContentId.ToString() + "\"";

                            }
                            else
                            {
                                ContentId = "";
                            }

                            if (_ruleSetSpellPropertie.ContentTypeId.ToString() != null || _ruleSetSpellPropertie.ContentTypeId.ToString() != "")
                            {
                                ContentTypeId = "\"" + _ruleSetSpellPropertie.ContentTypeId.ToString() + "\"";
                            }
                            else
                            {
                                ContentTypeId = "\"\"";
                            }


                            if (_ruleSetSpellPropertie.Value == null)
                            {
                                Value = "\"\"";
                            }
                            else
                            {
                                Value = "\"" + _ruleSetSpellPropertie.Value.ToString() + "\"";
                            }
                            dtContents.Rows.Add(RecordType, ContentId, ContentTypeId, Value);
                        }

                        dtContents.Rows.Add("\"S\"", "\"" + _ruleSetItem.ContentId.ToString() + "\"", "\"2\"", "\"End\"");
                    }
                }

            }

            else if (Type == 1)
            {
                RecordType = "\"IP\"";
                foreach (var _ruleSetItem in _ruleSetContentsList)
                {
                    Items _ruleSetItemVM = new Items();
                    _ruleSetItemVM.ItemProperties = new List<ItemProperties>();
                    var _ruleSetItemProperties = (from _itemProperties in _context.RulesetContentTypes
                                                  join rpgType in _context.RPGSmithTypes on _itemProperties.TypeId equals rpgType.TypeID
                                                  join _itemPropertyValue in _context.Items on _itemProperties.Id equals _itemPropertyValue.ContentTypeId into ps
                                                  from _itemPropertyValue in ps.DefaultIfEmpty()
                                                  where _itemPropertyValue.ContentId == _ruleSetItem.ContentId
                                                  select new
                                                  {
                                                      Id = _itemPropertyValue.ItemId,
                                                      ContentTypeId = _itemPropertyValue.ContentTypeId,
                                                      TypeId = _itemProperties.TypeId,
                                                      Name = _itemProperties.Name,
                                                      Description = _itemProperties.Description,
                                                      Value = _itemPropertyValue.value,
                                                      Units = rpgType.Units
                                                  }).ToList();

                    if (_ruleSetItemProperties != null)
                    {
                        dtContents.Rows.Add("\"I\"", "\"" + _ruleSetItem.ContentId.ToString() + "\"", "\"1\"", "\"Start\"");

                        foreach (var _ruleSetItemProperty in _ruleSetItemProperties)
                        {

                            if (_ruleSetItem.ContentId.ToString() != null || _ruleSetItem.ContentId.ToString() != "")
                            {
                                ContentId = "\"" + _ruleSetItem.ContentId.ToString() + "\"";
                            }
                            else
                            {
                                ContentId = "";
                            }

                            if (_ruleSetItemProperty.ContentTypeId.ToString() != null || _ruleSetItemProperty.ContentTypeId.ToString() != "")
                            {
                                ContentTypeId = "\"" + _ruleSetItemProperty.ContentTypeId.ToString() + "\"";

                            }
                            else
                            {
                                ContentTypeId = "\"\"";
                            }



                            if (_ruleSetItemProperty.Value == null)
                            {
                                Value = "\"\"";
                            }
                            else
                            {
                                //if(_ruleSetItemProperty.TypeId==8)
                                //{
                                //    string ImageTilePath = _ruleSetItemProperty.Value;

                                //    var AllPropertyUnitsList = (from _RPGSmithTypes in _context.RPGSmithTypes
                                //               select _RPGSmithTypes
                                //              ).ToList();



                                //    int resultValue;
                                //    string PropertyUnits = "";

                                //    var Res = AllPropertyUnitsList.Where(x => x.TypeID == _ruleSetItemProperty.TypeId);                                   
                                //    foreach (var R in Res)
                                //    {
                                //        PropertyUnits = R.Units;                                     
                                //    }

                                //    string ResultofXML = validate_XmlValue(1, Convert.ToInt32(_ruleSetItemProperty.TypeId), _ruleSetItemProperty.Value.ToString(), PropertyUnits, out resultValue);
                                //    if (resultValue == 1)
                                //    {
                                //        //resultStatus = 1;
                                //        //_serviceResponseModel.ErrorMessage = "Invalid Data at Ability Properties XML data";
                                //        //_serviceResponseModel.StatusCode = 400;

                                //        break;
                                //    }
                                //    else
                                //    {                                   
                                //       string ImagePagth = ResultofXML;

                                //       string  ImageBase64 = Image_convert(ImagePagth);

                                //        if(ImageBase64 != "")
                                //        {
                                //            Value = "\"" + ImageBase64 + "\"";
                                //        }
                                //        else
                                //        {
                                //            Value = "\"" + "" + "\"";
                                //        }


                                //    }

                                //}
                                //else
                                //{
                                //    Value = "\"" + _ruleSetItemProperty.Value.ToString() + "\"";
                                //}

                                Value = "\"" + _ruleSetItemProperty.Value.ToString() + "\"";


                            }

                            dtContents.Rows.Add(RecordType, ContentId, ContentTypeId, Value);

                        }

                        dtContents.Rows.Add("\"I\"", "\"" + _ruleSetItem.ContentId.ToString() + "\"", "\"1\"", "\"End\"");
                        // dt.Rows.Add("\"I\"", "\"" + _ruleSetItem.ContentId.ToString() + "\"", "\"" + "" + "\"", "\"End\"");

                    }



                }

            }

            return dtContents;
        }

        public string validate_XmlValue(int Case, int TypeId, string Value, string PropertyUnits, out int resultValue)
        {
            string Result = "";
            resultValue = 0;

            try
            {
                // case =1  Items
                // case =2  Spells
                // case =3  Abilitys

                switch (Case)
                {
                    case 1:
                        ItemProperties _rulesetItemProperties = new ItemProperties();
                        _rulesetItemProperties.Value = Utility.ConvertTypeValueXMLtoClass(TypeId, Value, PropertyUnits);

                        if (TypeId == 8)
                        {
                            Result = _rulesetItemProperties.Value.Image.image.ToString();
                        }


                        break;
                    case 2:

                        SpellProperties _rulesetSpellProperties = new SpellProperties();
                        _rulesetSpellProperties.Value = Utility.ConvertTypeValueXMLtoClass(TypeId, Value, PropertyUnits);

                        if (TypeId == 8)
                        {
                            Result = _rulesetSpellProperties.Value.Image.image.ToString();
                        }

                        break;
                    case 3:

                        AbilityProperties _rulesetAbilityPropertie = new AbilityProperties();
                        _rulesetAbilityPropertie.Value = Utility.ConvertTypeValueXMLtoClass(TypeId, Value, PropertyUnits);

                        if (TypeId == 8)
                        {
                            Result = _rulesetAbilityPropertie.Value.Image.image.ToString();
                        }

                        break;

                }

                return Result;

            }
            catch (Exception ex)
            {
                resultValue = 1;
                // Error = Error + "Invalid Data Xml data";
                return Result;
            }



        }



        public static string FormatCSV(string input)
        {
            try
            {
                string Find = "";
                string Replace = "";

                //Source = input;
                Find = "\"";
                Replace = "";

                input = ReplaceFirstOccurrence(input, Find, Replace);
                input = ReplaceLastOccurrence(input, Find, Replace);

                return input;
            }
            catch
            {
                throw;
            }
        }

        public static string ReplaceFirstOccurrence(string Source, string Find, string Replace)
        {
            int Place = Source.IndexOf(Find);
            string result = Source.Remove(Place, Find.Length).Insert(Place, Replace);
            return result;
        }
        public static string ReplaceLastOccurrence(string Source, string Find, string Replace)
        {
            int Place = Source.LastIndexOf(Find);
            string result = Source.Remove(Place, Find.Length).Insert(Place, Replace);
            return result;
        }





        public void saveRulesetContentData(DataTable dtRuleset, DataTable dtCorestats, DataTable dtContents, DataTable dtItemSpells, int RulesetId)
        {
            try
            {

                if (dtCorestats.Rows.Count > 0)
                {
                    List<CoreStat> objCoreStatList = new List<CoreStat>();


                    for (int j = 0; j < dtCorestats.Rows.Count; j++)
                    {
                        CoreStat objCoreStat = new CoreStat();
                        objCoreStat.RulesetID = RulesetId;
                        objCoreStat.TypeId = Convert.ToInt32((dtCorestats.Rows[j]["TypeId"].ToString()));
                        objCoreStat.Name = dtCorestats.Rows[j]["Name"].ToString();
                        objCoreStat.Description = dtCorestats.Rows[j]["Description"].ToString();
                        objCoreStat.Metadata = dtCorestats.Rows[j]["Metadata"].ToString();

                        objCoreStatList.Add(objCoreStat);


                    }

                    foreach (var CoreStat in objCoreStatList)
                    {
                        _context.CoreStats.Add(CoreStat);
                    }

                    _context.SaveChanges();

                }

                if (dtContents.Rows.Count > 0)
                {
                    int NewItemContentId = 0;
                    int NewSpellContentId = 0;
                    int NewAbilityContentId = 0;

                    string ItemContentId = "";
                    string SpellContentId = "";
                    string AbilityContentId = "";


                    for (int j = 0; j < dtContents.Rows.Count; j++)
                    {
                        int value = 0;


                        if ((dtContents.Rows[j]["Type"].ToString()) == "A" || (dtContents.Rows[j]["Type"].ToString() == "AP"))
                        {
                            value = 3;
                        }
                        else if ((dtContents.Rows[j]["Type"].ToString()) == "S" || (dtContents.Rows[j]["Type"].ToString() == "SP"))
                        {
                            value = 2;
                        }
                        else if ((dtContents.Rows[j]["Type"].ToString()) == "I" || (dtContents.Rows[j]["Type"].ToString() == "IP"))
                        {
                            value = 1;
                        }

                        //int value = 5;
                        switch (value)
                        {
                            case 1:
                                if (((dtContents.Rows[j]["Type"].ToString()) == "I") && ((dtContents.Rows[j]["Value"].ToString()) == "Start"))
                                {
                                    if (NewItemContentId == 0)
                                    {
                                        RuleSetItemsContent objRuleSetItemsContent = new RuleSetItemsContent();
                                        objRuleSetItemsContent.RulesetID = RulesetId;
                                        objRuleSetItemsContent.Type = Convert.ToInt32((dtContents.Rows[j]["ContentTypeId"].ToString()));
                                        _context.RuleSetItemsContents.Add(objRuleSetItemsContent);
                                        _context.SaveChanges();

                                        NewItemContentId = objRuleSetItemsContent.ContentId;
                                        ItemContentId = (dtContents.Rows[j]["ContentId"].ToString());


                                        //dtContents.Rows[j]["NewItemId"] = objItem.ItemId;
                                        DataRow[] foundRows;
                                        string filter = "ItemId =" + ItemContentId;
                                        foundRows = dtItemSpells.Select(filter);

                                        foreach (DataRow dr in foundRows)
                                        {
                                            dtItemSpells.Rows[dr.Table.Rows.IndexOf(dr)]["NewItemId"] = NewItemContentId;
                                        }

                                    }
                                }
                                else if ((dtContents.Rows[j]["Type"].ToString() == "I") && (dtContents.Rows[j]["ContentId"].ToString() == ItemContentId) && (dtContents.Rows[j]["Value"].ToString() == "End"))
                                {
                                    NewItemContentId = 0;
                                    break;
                                }
                                else
                                {
                                    if ((dtContents.Rows[j]["Type"].ToString()) == "IP")
                                    {
                                        if (NewItemContentId != 0)
                                        {
                                            Item objItem = new Item();
                                            objItem.ContentId = NewItemContentId;
                                            objItem.ContentTypeId = Convert.ToInt32((dtContents.Rows[j]["ContentTypeId"].ToString()));
                                            objItem.value = (dtContents.Rows[j]["Value"].ToString());
                                            _context.Items.Add(objItem);
                                            _context.SaveChanges();

                                        }

                                    }

                                }

                                break;
                            case 2:

                                if (((dtContents.Rows[j]["Type"].ToString()) == "S") && ((dtContents.Rows[j]["Value"].ToString()) == "Start"))
                                {
                                    if (NewSpellContentId == 0)
                                    {
                                        RuleSetItemsContent objRuleSetItemsContent = new RuleSetItemsContent();
                                        objRuleSetItemsContent.RulesetID = RulesetId;
                                        objRuleSetItemsContent.Type = Convert.ToInt32((dtContents.Rows[j]["ContentTypeId"].ToString()));
                                        _context.RuleSetItemsContents.Add(objRuleSetItemsContent);
                                        _context.SaveChanges();

                                        NewSpellContentId = objRuleSetItemsContent.ContentId;
                                        SpellContentId = (dtContents.Rows[j]["ContentId"].ToString());

                                        DataRow[] foundRows;
                                        string filter = "SpellId =" + SpellContentId;
                                        foundRows = dtItemSpells.Select(filter);

                                        foreach (DataRow dr in foundRows)
                                        {
                                            dtItemSpells.Rows[dr.Table.Rows.IndexOf(dr)]["NewSpellId"] = NewSpellContentId;
                                        }

                                    }
                                }
                                else if ((dtContents.Rows[j]["Type"].ToString() == "S") && (dtContents.Rows[j]["ContentId"].ToString() == SpellContentId) && (dtContents.Rows[j]["Value"].ToString() == "End"))
                                {
                                    NewSpellContentId = 0;
                                    break;
                                }
                                else
                                {
                                    if ((dtContents.Rows[j]["Type"].ToString()) == "SP")
                                    {
                                        if (NewSpellContentId != 0)
                                        {
                                            Spell objSpell = new Spell();
                                            objSpell.ContentId = NewSpellContentId;
                                            objSpell.ContentTypeId = Convert.ToInt32((dtContents.Rows[j]["ContentTypeId"].ToString()));
                                            objSpell.value = (dtContents.Rows[j]["Value"].ToString());
                                            _context.Spells.Add(objSpell);
                                            _context.SaveChanges();

                                        }
                                    }
                                }

                                break;
                            case 3:

                                if (((dtContents.Rows[j]["Type"].ToString()) == "A") && ((dtContents.Rows[j]["Value"].ToString()) == "Start"))
                                {
                                    if (NewAbilityContentId == 0)
                                    {

                                        RuleSetItemsContent objRuleSetItemsContent = new RuleSetItemsContent();
                                        objRuleSetItemsContent.RulesetID = RulesetId;
                                        objRuleSetItemsContent.Type = Convert.ToInt32((dtContents.Rows[j]["ContentTypeId"].ToString()));
                                        _context.RuleSetItemsContents.Add(objRuleSetItemsContent);
                                        _context.SaveChanges();

                                        NewAbilityContentId = objRuleSetItemsContent.ContentId;
                                        AbilityContentId = (dtContents.Rows[j]["ContentId"].ToString());

                                    }
                                }
                                else if ((dtContents.Rows[j]["Type"].ToString() == "A") && (dtContents.Rows[j]["ContentId"].ToString() == AbilityContentId) && (dtContents.Rows[j]["Value"].ToString() == "End"))
                                {
                                    NewAbilityContentId = 0;
                                    break;
                                }
                                else
                                {
                                    if ((dtContents.Rows[j]["Type"].ToString()) == "AP")
                                    {
                                        if (NewAbilityContentId != 0)
                                        {
                                            Ability objAbility = new Ability();
                                            objAbility.ContentId = NewAbilityContentId;
                                            objAbility.ContentTypeId = Convert.ToInt32((dtContents.Rows[j]["ContentTypeId"].ToString()));
                                            objAbility.value = (dtContents.Rows[j]["Value"].ToString());
                                            _context.Abilities.Add(objAbility);
                                            _context.SaveChanges();
                                        }

                                    }

                                }

                                break;
                            default: /* Optional */

                                break;
                        }

                    }

                    if (dtItemSpells.Rows.Count > 0)
                    {
                        for (int j = 0; j < dtItemSpells.Rows.Count; j++)
                        {
                            if (dtItemSpells.Rows[j]["NewItemId"].ToString() != "" && dtItemSpells.Rows[j]["NewSpellId"].ToString() != "")
                            {
                                ItemSpell objItemSpell = new ItemSpell();
                                objItemSpell.ItemId = Convert.ToInt32((dtItemSpells.Rows[j]["NewItemId"].ToString()));
                                objItemSpell.SpellId = Convert.ToInt32((dtItemSpells.Rows[j]["NewSpellId"].ToString()));
                                _context.ItemSpells.Add(objItemSpell);
                                _context.SaveChanges();
                            }
                        }
                    }

                }
                else
                {
                    return;
                }



            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public DataTable getItemSpellData(int _rulesertId, DataTable dtItemSpells)
        {
            try
            {
                dtItemSpells.Rows.Add("\"IS\"", "\"ItemId\"", "\"SpellId\"", "\"Start\"");

                var _itemSpellsList = (from _itemspells in _context.ItemSpells
                                       join _ruleSetItemsContents in _context.RuleSetItemsContents
                                       on _itemspells.ItemId equals _ruleSetItemsContents.ContentId
                                       where _ruleSetItemsContents.RulesetID == _rulesertId
                                       select new
                                       {
                                           ItemId = _itemspells.ItemId,
                                           SpellId = _itemspells.SpellId
                                       }).ToList();

                if (_itemSpellsList != null)
                {
                    foreach (var _itemSpells in _itemSpellsList)
                    {
                        dtItemSpells.Rows.Add("\"ISP\"", "\"" + _itemSpells.ItemId + "\"", "\"" + _itemSpells.SpellId + "\"", "\"\"");
                    }
                }

                dtItemSpells.Rows.Add("\"IS\"", "\"ItemId\"", "\"SpellId\"", "\"End\"");

            }
            catch (Exception ex)
            {
                throw ex;
            }

            return dtItemSpells;
        }

        // public string Validate(string filename, string filedata, int rulesetId)
        public string ValidateFileName(string filename)
        {
            string ErrorMessage = "";
            return ErrorMessage;
        }




    }
}