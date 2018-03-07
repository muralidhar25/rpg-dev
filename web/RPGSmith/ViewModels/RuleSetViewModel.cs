using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RPGSmith.Utilities.RPGSmithTypes;
using RPGSmith.Utilities;
using RPGSmith.ViewModels;
using System.Web;

namespace RPGSmith.Web.ViewModels
{
    public class RuleSetViewModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string UserId { get; set; }
        public List<RuleSetProperty> Rulesetproperty { get; set; }
        public List<Corestats> Corestats { get; set; }
        public List<Items> Items { get; set; }
        public List<Spells> Spells { get; set; }
        public List<Abilities> Abilities { get; set; }

        //Rule Set metadata.
        public RuleSetMetaData RuleSetMetaData = new RuleSetMetaData();

    }

    //Rule Set metadata.
    public class RuleSetMetaData
    {
        public Corestats Corestats = new Corestats();

        public List<ItemProperties> ItemProperties = new List<ItemProperties>();

        public List<SpellProperties> SpellProperties = new List<SpellProperties>();

        public List<AbilityProperties> AbilityProperties = new List<AbilityProperties>();

        public List<RPGSmith.ViewModels.TileTypes> TileTypes = new List<RPGSmith.ViewModels.TileTypes>();

        public ItemProperties ItemProperty = new ItemProperties();

        public SpellProperties SpellProperty = new SpellProperties();

        public AbilityProperties AbilityProperty = new AbilityProperties();

        public InventoryTileViewModel Tile = new InventoryTileViewModel();
    }
    //RuleSet Contents
    public class RuleSetContents
    {
        public ItemProperties ItemProperty = new ItemProperties();
        public SpellProperties SpellProperty = new SpellProperties();
        public AbilityProperties AbilityProperty = new AbilityProperties();
    }

    public class RuleSetProperty
    {
        public int Id { get; set; }
        public int PropertyValueId { get; set; }
        public string Name { get; set; }
        public int? TypeId { get; set; }
        public bool? IsMandotary { get; set; }
        public CustomTypes Value { get; set; }
        public Units Units { get; set; }
        public int RulesetId { get; set; }
        public string RulesetName { get; set; }
		public int Sequence { get; set; }
    }

    public class Corestats
    {
        public int Id { get; set; }
        public int? TypeId { get; set; }
        public string Name { get; set; }
        public string TypeName { get; set; }
        public string Description { get; set; }
        public CustomTypes Value { get; set; }
        public int RulesetId { get; set; }
    }

    public class Items
    {
        public List<ItemProperties> ItemProperties { get; set; }
        public List<Spells> AssociatedSpells { get; set; }
        public List<Abilities> AssociatedAbilities { get; set; }
        public int RulesetId { get; set; }
        //public List<RuleSetProperty> Rulesetproperty { get; set; }
    }

    public class ItemProperties
    {
        public int Id { get; set; }
        public int? ContentTypeId { get; set; }
        public int? ContentId { get; set; }
        public int? TypeId { get; set; }
        public int ClientObjectId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string XmlValue { get; set; }
        public bool? IsMandatory { get; set; }
        public CustomTypes Value { get; set; }
        public bool IsStatic { get; set; }
        public TileViewModel tile { get; set; }
    }

    public class Spells
    {
        public List<SpellProperties> SpellProperties { get; set; }
        public int RulesetId { get; set; }
        //public List<RuleSetProperty> Rulesetproperty { get; set; }
    }
    public class SpellProperties
    {
        public int Id { get; set; }
        public int? ContentTypeId { get; set; }
        public int? ContentId { get; set; }
        public int? TypeId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool? IsMandatory { get; set; }
        public CustomTypes Value { get; set; }
        public bool IsStatic { get; set; }
        public TileViewModel tile { get; set; }
    }

    public class Abilities
    {
        public List<AbilityProperties> AbilityProperties { get; set; }
        public int RulesetID { get; set; }
        //public List<RuleSetProperty> Rulesetproperty { get; set; }
    }
    public class AbilityProperties
    {
        public int Id { get; set; }
        public int? ContentTypeId { get; set; }
        public int? ContentId { get; set; }
        public int? TypeId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool? IsMandatory { get; set; }
        public CustomTypes Value { get; set; }
        public string XmlValue { get; set; }
        public TileViewModel tile { get; set; }
        // public InventoryTileViewModel Tile { get; set; }
    }

    public class RuleSetPropertyValue
    {
        public int ContentIds { get; set; }
        public int TypeIds { get; set; }
    }

    public class InventoryTileViewModel
    {
        public long TileId { get; set; }
        public int ClientObjectId { get; set; }
        public int TabId { get; set; }
        public bool IsEditable { get; set; }
        public int ContentTileId { get; set; }
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
        public DateTime UpdateDate { get; set; }
        public int CharacterProfileId { get; set; }
        public RPGSmith.Utilities.TileTypes Value { get; set; }
        //public TileTypes Value { get; set; }
    }
    public class RulesetContentForTiles
    {
        public List<ItemProperties> ItemProperties { get; set; }
        public List<SpellProperties> SpellProperties { get; set; }
        public List<AbilityProperties> AbilityProperties { get; set; }
    }

}
