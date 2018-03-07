using RPGSmith.Utilities;
using RPGSmith.Utilities.RPGSmithTypes;
using RPGSmith.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmith.Web.ViewModels
{
    public class CharacterViewModel
    {
        public int Id { get; set; }
        public int CampaignId { get; set; }
        public string CampaignName { get; set; }
        public string Name { get; set; }
        public string Portrait { get; set; }
        public string UserId { get; set; }
        public int? RulesetId { get; set; }
        public DateTime Authored { get; set; }
        public DateTime Edited { get; set; }
        public List<CorestatValues> CorestatValues { get; set; }
       
    }
    public class HeaderContentCounts
    {
        public int TotalRuleSetCount { get; set; }
        public int TotalCharactersCount { get; set; }
        public int TotalInventoryCount { get; set; }
    }
    public class CorestatValues
    {
        public int Id { get; set; }
        public int CharacterId { get; set; }
        public int CorestatId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int TypeId { get; set; }
        // public string Value { get; set; }
        public CustomTypes Value { get; set; }
        public Units Units { get; set; }
    }
    public class ChaacterContents
    {
        public List<CharacterItems> CharacterItems { get; set; }
        public List<CharacterSpells> CharacterSpells { get; set; }
        public List<CharacterAbilities> CharacterAbilities { get; set; }
    }
    public class CharacterItems
    {
        public int CharacterItemId { get; set; }
        public int CharacterProfileId { get; set; }
        public string UserId { get; set; }
        public int ContentId { get; set; }
        public DateTime? Authored { get; set; }
        public DateTime? Edited { get; set; }
        public bool IsDeleted { get; set; }
        public List<CharacterSpells> AssociatedSpells { get; set; }
        public List<CharacterAbilities> AssociatedAbilities { get; set; }
        public List<CharacterItemsProperties> CharacterItemsProperties { get; set; }
    }
   
    public class CharacterSpells
    {
        public int CharacterSpellId { get; set; }
        public int CharacterProfileId { get; set; }
        public string UserId { get; set; }
        public int ContentId { get; set; }
        public DateTime? Authored { get; set; }
        public DateTime? Edited { get; set; }
        public bool IsDeleted { get; set; }
        public List<CharacterSpellsProperties> CharacterSpellsProperties { get; set; }
    }

    public class CharacterAbilities
    {
        public int CharacterAbilityId { get; set; }
        public int CharacterProfileId { get; set; }
        public string UserId { get; set; }
        public int ContentId { get; set; }
        public DateTime? Authored { get; set; }
        public DateTime? Edited { get; set; }
        public bool IsDeleted { get; set; }
        public List<CharacterAbilitiesProperties> CharacterAbilitiesProperties { get; set; }
    }



    public class CharacterContentsValues
    {
        public List<CharacterItems> CharacterItems { get; set; }
        public List<CharacterSpells> CharacterSpells { get; set; }
        public List<CharacterAbilities> CharacterAbilities { get; set; }
        //public List<CharacterItemsValues> CharacterItemsValues { get; set; }
        //public List<CharacterSpellsValues> CharacterSpellsValues { get; set; }
        //public List<CharacterAbilitiesValues> CharacterAbilitiesValues { get; set; }
    }
    public class CharacterInventoriesContents
    {
        public CharacterItemsProperties CharacterItemsProperties { get; set; }
        public CharacterSpellsProperties CharacterSpellsProperties { get; set; }
        public CharacterAbilitiesProperties CharacterAbilitiesProperties { get; set; }
    }
    public class CharacterContent
    {
        public CharacterItems CharacterItem { get; set; }
        public CharacterSpells CharacterSpell { get; set; }
        public CharacterAbilities CharacterAbility { get; set; }
    }
    public class CharacterItemsProperties
    {
        public int CharacterItemValueId { get; set; }
        public int CharacterItemId { get; set; }
        public int? ContentId { get; set; }
        public int TypeId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int ItemId { get; set; }
        public bool? IsAction { get; set; }
        public bool? IsMandatory { get; set; }
        public CustomTypes Value { get; set; }
        public string XmlValue { get; set; }
        public TileViewModel tile { get; set; }
    }
    public class CharacterSpellsProperties
    {
        public int CharacterSpellValueId { get; set; }
        public int CharacterSpellId { get; set; }
        public int CharacterProfileId { get; set; }
        public int TypeId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int ItemId { get; set; }
        public bool? IsAction { get; set; }
        public bool? IsMandatory { get; set; }
        public string UserId { get; set; }
        public int ContentId { get; set; }
        public CustomTypes Value { get; set; }
        public string XmlValue { get; set; }
        public TileViewModel tile { get; set; }
    }
    public class CharacterAbilitiesProperties
    {
        public int CharacterAbilityValueId { get; set; }
        public int CharacterAbilityId { get; set; }
        public int CharacterProfileId { get; set; }
        public int TypeId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int ItemId { get; set; }
        public bool? IsMandatory { get; set; }
        public bool? IsAction { get; set; }
        public string UserId { get; set; }
        public int ContentId { get; set; }
        public CustomTypes Value { get; set; }
        public string XmlValue { get; set; }
        public TileViewModel tile { get; set; }
    }
    public class CharacterInventoryViewModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string UserId { get; set; }
        public int CharacterProfileId { get; set; }
        public List<CharacterItems> CharacterItems { get; set; }
        public List<CharacterSpells> CharacterSpells { get; set; }
        public List<CharacterAbilities> CharacterAbilities { get; set; }
        //Rule Set metadata.
        public CharacterInventoryMetaData CharacterInventoryMetaData = new CharacterInventoryMetaData();
    }
    public class CharacterInventoryMetaData
    {
        public CharacterItems CharacterItems = new CharacterItems();
        public CharacterSpells CharacterSpells = new CharacterSpells();
        public CharacterAbilities CharacterAbilities = new CharacterAbilities();   
    }


}

