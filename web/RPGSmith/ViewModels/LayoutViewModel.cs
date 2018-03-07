using RPGSmith.Web.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RPGSmith.ViewModels
{

    //Rule Set metadata.
    public class LayoutMetaData
    {
        public TabViewModel Tab = new TabViewModel();
        public TileViewModel Tile = new TileViewModel();
        public List<TileTypes> TileTypes = new List<TileTypes>();

    }

    public class TileTypes
    {
        public int TileId { get; set; }
        public string TileType { get; set; }
        public RPGSmith.Utilities.TileTypes Value { get; set; }
    }

    public class LayoutViewModel
    {
        public int LayoutId { get; set; }
        public int ClientObjectId { get; set; }
        public int CharacterProfileId { get; set; }
        public string CharacterName { get; set; }
        public string UserId { get; set; }
        public string Name { get; set; }
        public string DeviceName { get; set; }
        public bool IsDefault { get; set; }
        public List<TabViewModel> TabList { get; set; }
        public List<CorestatValues> CorestatValues { get; set; }
        public LayoutMetaData LayoutMetaData = new LayoutMetaData();
        public RuleSetViewModel RulesetViewModel { get; set; }
    }

    public class TabViewModel
    {
        public int TabId { get; set; }
        public int ClientObjectId { get; set; }
        public int LayoutId { get; set; }
        public string UserId { get; set; }
        public string TabName { get; set; }
        public int TabOrder { get; set; }
        public bool IsSync { get; set; }
        public DateTime UpdateDate { get; set; }
        public List<TileViewModel> TileList { get; set; }
    }

    public class TileViewModel
    {
        public long TileId { get; set; }
        public int TileLocationId { get; set; }
        public int ClientObjectId { get; set; }
        public Int64 EditClientId { get; set; }
        public int TabId { get; set; }
        public string UserId { get; set; }
        public int TileTypeId { get; set; }
        public string TileTypeName { get; set; }
        public string Mode { get; set; }
        public Nullable<int> EntityId { get; set; }
        public Style Styles { get; set; }
        public string Style { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public bool IsSync { get; set; }
        //public DateTime UpdateDate { get; set; }
        public bool ShowEditMode { get; set; }
        public int CharacterProfileId { get; set; }

        public bool ShowUseMode = true;
        public RPGSmith.Utilities.TileTypes Value { get; set; }
        //public TileTypes Value { get; set; }
    }
    public class UserDiceSelection
    {
        public int id { get; set; }
        public string UserId { get; set; }
        public int CharacterId { get; set; }
        public string Name { get; set; }
        public string Command { get; set; }
        public string LastRunResult { get; set; }
        public DateTime LastRunTime { get; set; }
    }
    //Tile Style Region
    public class Style
    {
        public List<style> StyleList
        {
            get
            {
                var styleList = new List<ViewModels.style>();
                styleList.Add(new ViewModels.style() { Id = "Use Default", Name = "Use Default" });
                styleList.Add(new ViewModels.style() { Id = "None", Name = "None" });
                styleList.Add(new ViewModels.style() { Id = "Dotted", Name = "Dotted" });
                styleList.Add(new ViewModels.style() { Id = "Double", Name = "Double" });
                styleList.Add(new ViewModels.style() { Id = "Dashed", Name = "Dashed" });
                styleList.Add(new ViewModels.style() { Id = "Groove", Name = "Groove" });
                styleList.Add(new ViewModels.style() { Id = "Inset", Name = "Inset" });
                styleList.Add(new ViewModels.style() { Id = "Outset", Name = "Outset" });
                styleList.Add(new ViewModels.style() { Id = "Ridge", Name = "Ridge" });
                styleList.Add(new ViewModels.style() { Id = "Solid", Name = "Solid" });
                return styleList;
            }
        }
        public List<width> WidthList
        {
            get
            {
                var widthList = new List<ViewModels.width>();
                widthList.Add(new ViewModels.width() { Id = "1px", Name = "1px" });
                widthList.Add(new ViewModels.width() { Id = "2px", Name = "2px" });
                widthList.Add(new ViewModels.width() { Id = "3px", Name = "3px" });
                widthList.Add(new ViewModels.width() { Id = "4px", Name = "4px" });
                widthList.Add(new ViewModels.width() { Id = "5px", Name = "5px" });
                widthList.Add(new ViewModels.width() { Id = "6px", Name = "6px" });
                widthList.Add(new ViewModels.width() { Id = "7px", Name = "7px" });
                widthList.Add(new ViewModels.width() { Id = "8px", Name = "8px" });
                widthList.Add(new ViewModels.width() { Id = "9px", Name = "9px" });
                widthList.Add(new ViewModels.width() { Id = "10px", Name = "10px" });
                return widthList;
            }
        }
        public List<radius> RadiusList
        {
            get
            {
                var radiusList = new List<ViewModels.radius>();
                radiusList.Add(new ViewModels.radius() { Id = "1px", Name = "1px" });
                radiusList.Add(new ViewModels.radius() { Id = "2px", Name = "2px" });
                radiusList.Add(new ViewModels.radius() { Id = "3px", Name = "3px" });
                radiusList.Add(new ViewModels.radius() { Id = "4px", Name = "4px" });
                radiusList.Add(new ViewModels.radius() { Id = "5px", Name = "5px" });
                radiusList.Add(new ViewModels.radius() { Id = "6px", Name = "6px" });
                radiusList.Add(new ViewModels.radius() { Id = "7px", Name = "7px" });
                radiusList.Add(new ViewModels.radius() { Id = "8px", Name = "8px" });
                radiusList.Add(new ViewModels.radius() { Id = "9px", Name = "9px" });
                radiusList.Add(new ViewModels.radius() { Id = "10px", Name = "10px" });
                return radiusList;
            }
        }
        public List<Shadow> ShadowList
        {
            get
            {
                var shadowList = new List<ViewModels.Shadow>();
                shadowList.Add(new ViewModels.Shadow() { Id = "Use default", Name = "Use default" });
                shadowList.Add(new ViewModels.Shadow() { Id = "Yes", Name = "Yes" });
                shadowList.Add(new ViewModels.Shadow() { Id = "No", Name = "No" });
                return shadowList;
            }
        }
        public string color { get; set; }
        public string bodybackgroundColor { get; set; }
        public string titletextcolor { get; set; }
        public string titlebackgroundcolor { get; set; }
        public string bodytextcolor { get; set; }
        public string style { get; set; }
        public string width { get; set; }
        public string radius { get; set; }
        public string shadow { get; set; }
    }
    public class style
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }
    public class width
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }
    public class radius
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }
    public class Shadow
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }
}