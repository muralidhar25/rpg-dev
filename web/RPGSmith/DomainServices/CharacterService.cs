using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using RPGSmith.Data;
using RPGSmith.Data.Models;
using RPGSmith.Web.ViewModels;
using RPGSmith.ViewModels;
using System.IO;
using RPGSmith.DomainServices;
using RPGSmith.Web.Utilities;
using System.Xml;
using RPGSmith.Utilities.RPGSmithTypes;
using RPGSmith.Utilities;

namespace RPGSmith.DomainServices
{
    public class CharacterService
    {
        ServiceResponseModel _serviceResponseModel = new ServiceResponseModel();
        private readonly RPGSmithContext _context;
        public CharacterService()
        {
            RPGSmithContext dbContext = new RPGSmithContext();
            _context = dbContext;

        }
        #region Character
        public IEnumerable<CharacterProfile> GetCharactersByUserID(string UserID)
        {
            if (UserID != null)
            {
                IEnumerable<CharacterProfile> _character = _context.CharacterProfiles.Where(x => x.UserId == UserID).ToList();
                return _character;
            }
            return null;
        }

        public CharacterViewModel GetCharacterByCharacterID(int CharacterId)
        {
            if (CharacterId > 0)
            {
                CharacterViewModel _characterViewModel = new CharacterViewModel();
                _characterViewModel = _context.CharacterProfiles.Where(x => x.CharacterProfileId == CharacterId).Select(x =>
                     new CharacterViewModel
                     {
                         Id = x.CharacterProfileId,
                         CampaignId = x.CampaignId,
                         Name = x.Name,
                         Portrait = x.Portrait,
                         RulesetId = x.RulesetId

                     }).FirstOrDefault();

                return _characterViewModel;
            }
            return null;
        }

        public ServiceResponseModel AddCharacter(CharacterViewModel charactermodel, string userId)
        {
            try
            {
                if (userId != null || userId != "")
                {
                    int resultStatus;
                    string Errors = "";
                    Errors = ValidationForNewCharacter(charactermodel, userId, out resultStatus);
                    if (resultStatus == 1)
                    {
                        _serviceResponseModel.ErrorMessage = Errors;
                        _serviceResponseModel.StatusCode = 400;
                    }
                    else
                    {
                        CharacterProfile character = new CharacterProfile();
                        CharacterSpellProperty spellProperty = new CharacterSpellProperty();
                        CharacterAbilityProperty abilityproperty = new CharacterAbilityProperty();
                        string characterimagephysicalmappath = null;
                        string virtualPath = null;
                        if (charactermodel.Portrait != null && charactermodel.Portrait != "")
                        {
                            charactermodel.Portrait = charactermodel.Portrait.Replace("data:image/png;base64,", "").Replace("data:image/jpg;base64,", "").Replace("data:image/jpeg;base64,", "");
                            byte[] profileimagewByte = Convert.FromBase64String(charactermodel.Portrait);
                            virtualPath = "/wwwroot/images/characters/" + charactermodel.Name + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                            string virtualPathForFolder = "~/wwwroot/images/characters/" + charactermodel.Name + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                            characterimagephysicalmappath = Path.Combine(HttpContext.Current.Server.MapPath(virtualPathForFolder));
                            System.IO.File.WriteAllBytes(characterimagephysicalmappath, profileimagewByte);
                        }
                        charactermodel.CampaignId = 1;
                        charactermodel.Authored = Convert.ToDateTime(DateTime.Now.ToString());
                        charactermodel.Edited = Convert.ToDateTime(DateTime.Now.ToString());
                        character.CharacterProfileId = charactermodel.Id;
                        character.UserId = charactermodel.UserId;
                        character.CampaignId = charactermodel.CampaignId;
                        character.Name = charactermodel.Name;
                        character.Portrait = virtualPath;
                        character.Authored = charactermodel.Authored;
                        character.Edited = charactermodel.Edited;
                        character.RulesetId = charactermodel.RulesetId;
                        _context.CharacterProfiles.Add(character);
                        int _rowseffected = _context.SaveChanges();
                        LayoutViewModel _layoutViewModel = new LayoutViewModel();
                        _layoutViewModel.CharacterProfileId = character.CharacterProfileId;
                        _layoutViewModel.Name = "Default";
                        _layoutViewModel.UserId = charactermodel.UserId;
                        _layoutViewModel.IsDefault = true;
                        _layoutViewModel.TabList = new List<TabViewModel>();
                        _layoutViewModel.TabList.Add(new TabViewModel()
                        {
                            TabName = "Default",
                            UserId = _layoutViewModel.UserId,
                            TabOrder = 0,

                        });
                        //Save  Default Layout  For New Character
                        SaveDefaultLayoutForNewCharacter(_layoutViewModel);
                        _serviceResponseModel.StatusCode = 200;
                        _serviceResponseModel.Result = GetCharacterByCharacterID(character.CharacterProfileId);

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

        public ServiceResponseModel DeleteCharacter(int? CharacterID, string userId)
        {
            try
            {
                CharacterViewModel charactermodel = new CharacterViewModel();
                charactermodel.Id = Convert.ToInt32(CharacterID);

                if (userId != null || userId != "")
                {
                    int resultStatus;
                    string Errors = "";
                    Errors = ValidationForDeleteCharacter(charactermodel, userId, out resultStatus);

                    if (resultStatus == 1)
                    {
                        _serviceResponseModel.ErrorMessage = Errors;
                        _serviceResponseModel.StatusCode = 400;
                    }
                    else
                    {
                        //Deleting Character Relationship Table Data 
                        var NoteTiles = _context.NoteTiles.Where(p => p.CharacterProfileId == CharacterID).ToList();
                        foreach (var _note in NoteTiles)
                        {
                            _context.NoteTiles.Remove(_note);
                        }
                        var AttributeTiles = _context.AttributeTiles.Where(p => p.CharacterProfileId == CharacterID).ToList();
                        foreach (var _attr in AttributeTiles)
                        {
                            _context.AttributeTiles.Remove(_attr);
                        }
                        var CounterTiles = _context.CounterTiles.Where(p => p.CharacterProfileId == CharacterID).ToList();
                        foreach (var _counter in CounterTiles)
                        {
                            _context.CounterTiles.Remove(_counter);
                        }
                        var LinkTiles = _context.LinkTiles.Where(p => p.CharacterProfileId == CharacterID).ToList();
                        foreach (var _link in LinkTiles)
                        {
                            _context.LinkTiles.Remove(_link);
                        }
                        var ExecuteTiles = _context.ExecuteTiles.Where(p => p.CharacterProfileId == CharacterID).ToList();
                        foreach (var _execute in ExecuteTiles)
                        {
                            _context.ExecuteTiles.Remove(_execute);
                        }
                        var CommandTiles = _context.CommandTiles.Where(p => p.CharacterProfileId == CharacterID).ToList();
                        foreach (var _command in CommandTiles)
                        {
                            _context.CommandTiles.Remove(_command);
                        }
                        var _CoreStatValues = _context.CoreStatValues.Where(p => p.CharacterProfileId == CharacterID).ToList();
                        foreach (var _coreStatValue in _CoreStatValues)
                        {
                            _context.CoreStatValues.Remove(_coreStatValue);
                        }
                        var CharacterItem = _context.CharacterItems.Where(x => x.CharacterProfileId == CharacterID).ToList();
                        foreach (var Value in CharacterItem)
                        {
                            var CharacterItemProperties = _context.CharacterItemProperties.Where(x => x.CharacterItemId == Value.CharacterItemId).ToList();
                            foreach (var _characterItemProperty in CharacterItemProperties)
                            {
                                _context.CharacterItemProperties.Remove(_characterItemProperty);
                            }
                            _context.CharacterItems.Remove(Value);
                        }
                        var CharacterSpell = _context.CharacterSpells.Where(x => x.CharacterProfileId == CharacterID).ToList();
                        foreach (var spellValue in CharacterSpell)
                        {
                            var CharacterSpellProperties = _context.CharacterSpellProperties.Where(x => x.CharacterSpellId == spellValue.CharacterSpellId).ToList();
                            foreach (var _characterSpellProperty in CharacterSpellProperties)
                            {
                                _context.CharacterSpellProperties.Remove(_characterSpellProperty);
                            }
                            _context.CharacterSpells.Remove(spellValue);
                        }

                        var CharacterAbilities = _context.CharacterAbilities.Where(x => x.CharacterProfileId == CharacterID).ToList();
                        foreach (var abilityValue in CharacterAbilities)
                        {
                            var CharacterAbilityProperties = _context.CharacterAbilityProperties.Where(x => x.CharacterAbilityId == abilityValue.CharacterAbilityId).ToList();
                            foreach (var _characterAbilityProperty in CharacterAbilityProperties)
                            {
                                _context.CharacterAbilityProperties.Remove(_characterAbilityProperty);
                            }
                            _context.CharacterAbilities.Remove(abilityValue);
                        }
                        var VirtualDiceList = _context.UserVirtualDices.Where(p => p.CharacterProfileId == CharacterID).ToList();
                        foreach (var _virtualDice in VirtualDiceList)
                        {
                            _context.UserVirtualDices.Remove(_virtualDice);
                        }

                        //Deleting Character details
                        var deleteCharacter = _context.CharacterProfiles.Where(c => c.CharacterProfileId == CharacterID).FirstOrDefault();
                        var message = string.Empty;
                        _context.CharacterProfiles.Remove(deleteCharacter);
                        int deletedRecordCount = _context.SaveChanges();

                        if (deletedRecordCount > 0 && (deleteCharacter.Portrait != null && deleteCharacter.Portrait != ""))
                        {
                            var characterProfileFileLocation = HttpContext.Current.Server.MapPath(deleteCharacter.Portrait);
                            File.Delete(characterProfileFileLocation);
                        }

                        _serviceResponseModel.Result = "Character Deleted Successfully";
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

        public ServiceResponseModel EditCharacter(CharacterViewModel EditModel, string userId)
        {
            try
            {
                if (userId != null || userId != "")
                {
                    int resultStatus;
                    string Errors = "";
                    Errors = ValidationForEditCharacter(EditModel, userId, out resultStatus);

                    if (resultStatus == 1)
                    {
                        _serviceResponseModel.ErrorMessage = Errors;
                        _serviceResponseModel.StatusCode = 400;
                    }
                    else
                    {
                        var editcharacter = _context.CharacterProfiles.Where(c => c.CharacterProfileId == EditModel.Id).FirstOrDefault();
                        string characterimagephysicalmappath = null;
                        string virtualPath = null;
                        var message = string.Empty;
                        EditModel.Edited = Convert.ToDateTime(DateTime.UtcNow.ToString());
                        if (editcharacter != null)
                        {
                            if (EditModel.Portrait.StartsWith("/wwwroot"))
                            {
                                editcharacter.Portrait = EditModel.Portrait;
                            }
                            else
                            {

                                if (editcharacter.Portrait != null && editcharacter.Portrait != "")
                                {
                                    var characterProfileFileLocation = HttpContext.Current.Server.MapPath(editcharacter.Portrait);
                                    File.Delete(characterProfileFileLocation);
                                }

                                EditModel.Portrait = EditModel.Portrait.Replace("data:image/png;base64,", "").Replace("data:image/jpg;base64,", "").Replace("data:image/jpeg;base64,", "");

                                byte[] profileimagewByte = Convert.FromBase64String(EditModel.Portrait);
                                virtualPath = "/wwwroot/images/characters/" + EditModel.Name + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                                string virtualPathForFolder = "~/wwwroot/images/characters/" + EditModel.Name + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                                characterimagephysicalmappath = HttpContext.Current.Server.MapPath(virtualPathForFolder);
                                System.IO.File.WriteAllBytes(characterimagephysicalmappath, profileimagewByte);
                                editcharacter.Portrait = virtualPath;
                            }
                            editcharacter.CharacterProfileId = EditModel.Id;
                            editcharacter.CampaignId = EditModel.CampaignId;
                            editcharacter.Edited = DateTime.Now;
                            editcharacter.RulesetId = EditModel.RulesetId;
                        }
                        _context.SaveChanges();
                        _serviceResponseModel.Result = GetCharacterByCharacterID(editcharacter.CharacterProfileId);
                        _serviceResponseModel.StatusCode = 200;
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

        public ServiceResponseModel CopyCharacter(CharacterViewModel CopyModel, string userId)
        {
            try
            {
                if (userId != null || userId != "")
                {
                    int resultStatus;
                    string Errors = "";
                    Errors = ValidationForCopyCharacter(CopyModel, userId, out resultStatus);

                    if (resultStatus == 1)
                    {
                        _serviceResponseModel.ErrorMessage = Errors;
                        _serviceResponseModel.StatusCode = 400;
                    }
                    else
                    {
                        var copycharacter = _context.CharacterProfiles.Where(c => c.CharacterProfileId == CopyModel.Id).FirstOrDefault();
                        string characterimagephysicalmappath = null;
                        string virtualPath = null;
                        var message = string.Empty;
                        CopyModel.Edited = Convert.ToDateTime(DateTime.UtcNow.ToString());
                        if (copycharacter != null)
                        {
                            if (copycharacter.Portrait == CopyModel.Portrait)
                            {
                                string characterimagephysicalmappathsource = HttpContext.Current.Server.MapPath(copycharacter.Portrait);

                                string virtualPathDest = "/wwwroot/images/characters/" + CopyModel.Name + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";

                                string characterimagephysicalmappathdest = HttpContext.Current.Server.MapPath(virtualPathDest);

                                if (File.Exists(characterimagephysicalmappathsource))
                                {
                                    File.Copy(characterimagephysicalmappathsource, characterimagephysicalmappathdest);
                                }
                                copycharacter.Portrait = virtualPathDest;
                            }
                            else
                            {

                                CopyModel.Portrait = CopyModel.Portrait.Replace("data:image/png;base64,", "").Replace("data:image/jpg;base64,", "").Replace("data:image/jpeg;base64,", "");

                                byte[] profileimagewByte = Convert.FromBase64String(CopyModel.Portrait);
                                virtualPath = "/wwwroot/images/characters/" + CopyModel.Name + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                                  characterimagephysicalmappath = HttpContext.Current.Server.MapPath(virtualPath);
                                System.IO.File.WriteAllBytes(characterimagephysicalmappath, profileimagewByte);
                                copycharacter.Portrait = virtualPath;
                            }
                            copycharacter.CampaignId = CopyModel.CampaignId;
                            copycharacter.Name = CopyModel.Name;
                            copycharacter.Authored = DateTime.Now;
                            copycharacter.Edited = DateTime.Now;
                            copycharacter.RulesetId = CopyModel.RulesetId;
                        }
                        _context.CharacterProfiles.Add(copycharacter);
                        _context.SaveChanges();

                        _serviceResponseModel.Result = GetCharacterByCharacterID(copycharacter.CharacterProfileId);
                        _serviceResponseModel.StatusCode = 200;
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

        public CharacterContentsValues GetCharacterContentsByCharacterProfileId(int? CharacterProfileId)
        {
            CharacterContentsValues _characterContentsValues = new CharacterContentsValues();
            _characterContentsValues.CharacterItems = new List<CharacterItems>();
            _characterContentsValues.CharacterSpells = new List<CharacterSpells>();
            _characterContentsValues.CharacterAbilities = new List<CharacterAbilities>();

            var result = _context.CharacterItems.Where(x => x.CharacterProfileId == CharacterProfileId).ToList();
            if (result == null) return _characterContentsValues;
            var RarityMetadata = _context.RulesetContentTypes.Where(x => x.ContentType == 1 && x.IsActive == true && x.IsRuleSet == true && x.Id == 7).SingleOrDefault().Metadata;


            foreach (var item in result)
            {
                List<CharacterItemsProperties> _characterItemsValues = new List<Web.ViewModels.CharacterItemsProperties>();
                var CharacterItemProperties = (from itemproperties in _context.CharacterItemProperties.Where(p => p.CharacterItemId == item.CharacterItemId)
                                               join rpgtype in _context.RPGSmithTypes on itemproperties.TypeId equals rpgtype.TypeID
                                               select new { Id = itemproperties.Id, Name = itemproperties.Name, Discription = itemproperties.Description, TypeId = itemproperties.TypeId, Value = itemproperties.Value, IsAction = itemproperties.IsAction, Units = rpgtype.Units }).ToList();
                foreach (var _characterItemProperties in CharacterItemProperties)
                {
                   if (_characterItemProperties.Name == "Rarity")
                    {
                        _characterItemsValues.Add(new CharacterItemsProperties()
                        {
                            CharacterItemValueId = Convert.ToInt32(_characterItemProperties.Id),
                            CharacterItemId = item.CharacterItemId,
                            ContentId = item.ContentId,
                            Name = _characterItemProperties.Name,
                            IsAction = _characterItemProperties.IsAction,
                            Description = _characterItemProperties.Discription,
                            TypeId = Convert.ToInt32(_characterItemProperties.TypeId),
                            Value = Utility.ConvertTypeValueXMLtoClass(_characterItemProperties.TypeId, _characterItemProperties.Value, RarityMetadata)
                        });
                    }
                    else
                    {

                        if (_characterItemProperties.TypeId == 16)
                        {

                            CustomTypes c1 = new CustomTypes();
                            c1.Calculation = new Calculation();
                            c1.Calculation.formulae = "[Weight]*[Quantity]";
                           _characterItemsValues.Add(new CharacterItemsProperties()
                            {
                                CharacterItemValueId = Convert.ToInt32(_characterItemProperties.Id),
                                CharacterItemId = item.CharacterItemId,
                                ContentId = item.ContentId,
                                Name = _characterItemProperties.Name,
                                IsAction = _characterItemProperties.IsAction,
                                Description = _characterItemProperties.Discription,
                                TypeId = Convert.ToInt32(_characterItemProperties.TypeId),
                                Value = c1
                            });

                        }
                        else
                        {
                            _characterItemsValues.Add(new CharacterItemsProperties()
                            {
                                CharacterItemValueId = Convert.ToInt32(_characterItemProperties.Id),
                                CharacterItemId = item.CharacterItemId,
                                ContentId = item.ContentId,
                                Name = _characterItemProperties.Name,
                                IsAction = _characterItemProperties.IsAction,
                                Description = _characterItemProperties.Discription,
                                TypeId = Convert.ToInt32(_characterItemProperties.TypeId),
                                Value = Utility.ConvertTypeValueXMLtoClass(_characterItemProperties.TypeId, _characterItemProperties.Value, _characterItemProperties.Units)
                            });

                        }


                    }


                }

                _characterContentsValues.CharacterItems.Add(new CharacterItems()
                {
                    ContentId = Convert.ToInt32(item.ContentId),
                    CharacterProfileId = Convert.ToInt32(item.CharacterProfileId),
                    CharacterItemId = item.CharacterItemId,
                    UserId = item.UserId,
                    CharacterItemsProperties = _characterItemsValues
                });
            }
            var spellresult = _context.CharacterSpells.Where(x => x.CharacterProfileId == CharacterProfileId).ToList();
            if (spellresult == null) return _characterContentsValues;
            foreach (var spell in spellresult)
            {
                List<CharacterSpellsProperties> _characterSpellValues = new List<Web.ViewModels.CharacterSpellsProperties>();
                var CharacterSpellProperties = (from spellproperties in _context.CharacterSpellProperties.Where(p => p.CharacterSpellId == spell.CharacterSpellId)
                                                join rpgtype in _context.RPGSmithTypes on spellproperties.TypeId equals rpgtype.TypeID
                                                orderby spellproperties.Id
                                                select new { Id = spellproperties.Id, Name = spellproperties.Name, Discription = spellproperties.Description, TypeId = spellproperties.TypeId, Value = spellproperties.Value, IsAction = spellproperties.IsAction, Units = rpgtype.Units }).ToList();

                foreach (var _characterSpellProperties in CharacterSpellProperties)
                {

                    if (_characterSpellProperties.Name == "Rarity")
                    {
                        _characterSpellValues.Add(new CharacterSpellsProperties()
                        {
                            CharacterSpellValueId = Convert.ToInt32(_characterSpellProperties.Id),
                            CharacterSpellId = spell.CharacterSpellId,
                            ContentId = Convert.ToInt32(spell.ContentId),
                            Name = _characterSpellProperties.Name,
                            IsAction = _characterSpellProperties.IsAction,
                            Description = _characterSpellProperties.Discription,
                            TypeId = Convert.ToInt32(_characterSpellProperties.TypeId),
                            Value = Utility.ConvertTypeValueXMLtoClass(_characterSpellProperties.TypeId, _characterSpellProperties.Value, RarityMetadata)
                        });
                    }
                    else
                    {
                        _characterSpellValues.Add(new CharacterSpellsProperties()
                        {
                            CharacterSpellValueId = _characterSpellProperties.Id,
                            CharacterSpellId = spell.CharacterSpellId,
                            ContentId = Convert.ToInt32(spell.ContentId),
                            Name = _characterSpellProperties.Name,
                            IsAction = _characterSpellProperties.IsAction,
                            Description = _characterSpellProperties.Discription,
                            TypeId = Convert.ToInt32(_characterSpellProperties.TypeId),
                            Value = Utility.ConvertTypeValueXMLtoClass(_characterSpellProperties.TypeId, _characterSpellProperties.Value, _characterSpellProperties.Units)
                        });
                    }
                }

                _characterContentsValues.CharacterSpells.Add(new CharacterSpells()
                {
                    ContentId = Convert.ToInt32(spell.ContentId),
                    CharacterProfileId = Convert.ToInt32(spell.CharacterProfileId),
                    CharacterSpellId = spell.CharacterSpellId,
                    UserId = spell.UserId,
                    CharacterSpellsProperties = _characterSpellValues
                });

            }

            var abilityresult = _context.CharacterAbilities.Where(x => x.CharacterProfileId == CharacterProfileId).ToList();
            if (abilityresult == null) return _characterContentsValues;
            foreach (var ability in abilityresult)
            {
                List<CharacterAbilitiesProperties> _characterabilityValues = new List<Web.ViewModels.CharacterAbilitiesProperties>();
                var CharacterabilityProperties = (from abilityproperties in _context.CharacterAbilityProperties.Where(p => p.CharacterAbilityId == ability.CharacterAbilityId)
                                                  join rpgtype in _context.RPGSmithTypes on abilityproperties.TypeId equals rpgtype.TypeID
                                                  orderby abilityproperties.Id
                                                  select new { Id = abilityproperties.Id, Name = abilityproperties.Name, Discription = abilityproperties.Description, TypeId = abilityproperties.TypeId, Value = abilityproperties.Value, IsAction = abilityproperties.ISAction, Units = rpgtype.Units }).ToList();
                foreach (var _characterabilityProperties in CharacterabilityProperties)
                {

                    if (_characterabilityProperties.Name == "Rarity")
                    {
                        _characterabilityValues.Add(new CharacterAbilitiesProperties()
                        {
                            CharacterAbilityValueId = Convert.ToInt32(_characterabilityProperties.Id),
                            CharacterAbilityId = ability.CharacterAbilityId,
                            ContentId = Convert.ToInt32(ability.ContentId),
                            Name = _characterabilityProperties.Name,
                            IsAction = _characterabilityProperties.IsAction,
                            Description = _characterabilityProperties.Discription,
                            TypeId = Convert.ToInt32(_characterabilityProperties.TypeId),
                            Value = Utility.ConvertTypeValueXMLtoClass(_characterabilityProperties.TypeId, _characterabilityProperties.Value, RarityMetadata)
                        });
                    }
                    else
                    {
                        _characterabilityValues.Add(new CharacterAbilitiesProperties()
                        {
                            CharacterAbilityValueId = Convert.ToInt32(_characterabilityProperties.Id),
                            CharacterAbilityId = ability.CharacterAbilityId,
                            ContentId = Convert.ToInt32(ability.ContentId),
                            Name = _characterabilityProperties.Name,
                            IsAction = _characterabilityProperties.IsAction,
                            Description = _characterabilityProperties.Discription,
                            TypeId = Convert.ToInt32(_characterabilityProperties.TypeId),
                            Value = Utility.ConvertTypeValueXMLtoClass(_characterabilityProperties.TypeId, _characterabilityProperties.Value, _characterabilityProperties.Units)
                        });
                    }
                }

                _characterContentsValues.CharacterAbilities.Add(new CharacterAbilities()
                {
                    ContentId = Convert.ToInt32(ability.ContentId),
                    CharacterProfileId = Convert.ToInt32(ability.CharacterProfileId),
                    CharacterAbilityId = ability.CharacterAbilityId,
                    UserId = ability.UserId,
                    CharacterAbilitiesProperties = _characterabilityValues
                });
            }
            return _characterContentsValues;
        }
        #endregion
        #region Character Inventory
        public CharacterInventoryViewModel GetNewCharacterInventory()
        {
            CharacterInventoryViewModel _inventoryViewModel = new CharacterInventoryViewModel();
            CharacterItems _inventoryItem = new CharacterItems();
            _inventoryItem.CharacterItemsProperties = new List<CharacterItemsProperties>();
            var _dataQuery = _context.RulesetContentTypes.Where(x => x.ContentType == 1 && x.IsActive == true && x.IsRuleSet == true).Select(
             x => new
             {
                 Id = x.Id,
                 Name = x.Name,
                 Description = x.Description,
                 TypeId = x.TypeId,
                 Metadata = x.Metadata,
                 Mandatory = x.Mandatory,
                 IsFormula = x.IsFormula,
                 Formula = x.Formula

             }
             ).ToList();

            _inventoryViewModel.CharacterInventoryMetaData.CharacterItems.CharacterItemsProperties = new List<CharacterItemsProperties>();
            foreach (var val in _dataQuery)
            {
                CharacterItemsProperties _inventoryItemProperty = new CharacterItemsProperties();
                _inventoryItemProperty.CharacterItemValueId = val.Id;
                _inventoryItemProperty.Name = val.Name;
                _inventoryItemProperty.Description = val.Description;
                _inventoryItemProperty.TypeId = Convert.ToInt32(val.TypeId);
                _inventoryItemProperty.IsMandatory = val.Mandatory == true ? val.Mandatory : false;
                if (val.Metadata != null && val.Metadata != "")
                {
                    _inventoryItemProperty.Value = Utility.ConvertTypeMetaDataXMLtoClass(val.TypeId, val.Metadata);
                }
                else
                {
                    _inventoryItemProperty.Value = Utility.GetTypeClassMetaData(val.TypeId);
                    if (val.Formula != null && val.Formula != "")
                    {
                        _inventoryItemProperty.Value.Calculation.formulae = val.Formula;
                    }
                }

                _inventoryViewModel.CharacterInventoryMetaData.CharacterItems.CharacterItemsProperties.Add(_inventoryItemProperty);
            }

            _inventoryViewModel.CharacterItems = new List<CharacterItems>();
            CharacterSpells _inventoryspell = new CharacterSpells();
            _inventoryspell.CharacterSpellsProperties = new List<CharacterSpellsProperties>();

            _dataQuery = _context.RulesetContentTypes.Where(x => x.ContentType == 2).Select(
              x => new
              {
                  Id = x.Id,
                  Name = x.Name,
                  Description = x.Description,
                  TypeId = x.TypeId,
                  Metadata = x.Metadata,
                  Mandatory = x.Mandatory,
                  IsFormula = x.IsFormula,
                  Formula = x.Formula

              }
              ).ToList();

            _inventoryViewModel.CharacterInventoryMetaData.CharacterSpells.CharacterSpellsProperties = new List<CharacterSpellsProperties>();
            foreach (var val in _dataQuery)
            {
                CharacterSpellsProperties _inventorySpellProperty = new CharacterSpellsProperties();
                _inventorySpellProperty.CharacterSpellValueId = val.Id;
                _inventorySpellProperty.Name = val.Name;
                _inventorySpellProperty.Description = val.Description;
                _inventorySpellProperty.TypeId = Convert.ToInt32(val.TypeId);
                _inventorySpellProperty.IsMandatory = val.Mandatory == true ? val.Mandatory : false;
                if (val.Metadata != null && val.Metadata != "")
                {
                    _inventorySpellProperty.Value = Utility.ConvertTypeMetaDataXMLtoClass(val.TypeId, val.Metadata);
                }
                else
                {
                    _inventorySpellProperty.Value = Utility.GetTypeClassMetaData(val.TypeId);
                }

                _inventoryViewModel.CharacterInventoryMetaData.CharacterSpells.CharacterSpellsProperties.Add(_inventorySpellProperty);
            }

            _inventoryViewModel.CharacterSpells = new List<CharacterSpells>();

            CharacterAbilities _inventoryAbility = new CharacterAbilities();
            _inventoryAbility.CharacterAbilitiesProperties = new List<CharacterAbilitiesProperties>();

            _dataQuery = _context.RulesetContentTypes.Where(x => x.ContentType == 3).Select(
              x => new
              {
                  Id = x.Id,
                  Name = x.Name,
                  Description = x.Description,
                  TypeId = x.TypeId,
                  Metadata = x.Metadata,
                  Mandatory = x.Mandatory,
                  IsFormula = x.IsFormula,
                  Formula = x.Formula
              }
              ).ToList();

            _inventoryViewModel.CharacterInventoryMetaData.CharacterAbilities.CharacterAbilitiesProperties = new List<CharacterAbilitiesProperties>();
            foreach (var val in _dataQuery)
            {
                CharacterAbilitiesProperties _inventoryAbilityProperty = new CharacterAbilitiesProperties();
                _inventoryAbilityProperty.CharacterAbilityValueId = val.Id;
                _inventoryAbilityProperty.Name = val.Name;
                _inventoryAbilityProperty.Description = val.Description;
                _inventoryAbilityProperty.TypeId = Convert.ToInt32(val.TypeId);
                _inventoryAbilityProperty.IsMandatory = val.Mandatory == true ? val.Mandatory : false;
                if (val.Metadata != null && val.Metadata != "")
                {
                    _inventoryAbilityProperty.Value = Utility.ConvertTypeMetaDataXMLtoClass(val.TypeId, val.Metadata);
                }
                else
                {
                    _inventoryAbilityProperty.Value = Utility.GetTypeClassMetaData(val.TypeId);
                }

                _inventoryViewModel.CharacterInventoryMetaData.CharacterAbilities.CharacterAbilitiesProperties.Add(_inventoryAbilityProperty);
            }

            _inventoryViewModel.CharacterAbilities = new List<CharacterAbilities>();

            return _inventoryViewModel;
        }

        public CharacterInventoryViewModel GetInventoryByCharacterProfileId(int? CharacterProfileId)
        {
            CharacterInventoryViewModel _inventoryViewModel = new CharacterInventoryViewModel();
            _inventoryViewModel.CharacterItems = new List<CharacterItems>();
            _inventoryViewModel.CharacterSpells = new List<CharacterSpells>();
            _inventoryViewModel.CharacterAbilities = new List<CharacterAbilities>();
            //Getting RuleSetItems based on RuleSetId
            var result = _context.CharacterItems.Where(x => x.CharacterProfileId == CharacterProfileId).ToList();
            if (result == null) return _inventoryViewModel;
            var RarityMetadata = _context.RulesetContentTypes.Where(x => x.ContentType == 1 && x.IsActive == true && x.IsRuleSet == true && x.Id == 7).SingleOrDefault().Metadata;


            foreach (var item in result)
            {
                List<CharacterItemsProperties> _characterItemsproperties = new List<Web.ViewModels.CharacterItemsProperties>();
                var CharacterItemProperties = (from itemproperties in _context.CharacterItemProperties.Where(p => p.CharacterItemId == item.CharacterItemId)
                                               join rpgtype in _context.RPGSmithTypes on itemproperties.TypeId equals rpgtype.TypeID
                                               select new { Id = itemproperties.Id, Name = itemproperties.Name, Discription = itemproperties.Description, TypeId = itemproperties.TypeId, Value = itemproperties.Value, IsAction = itemproperties.IsAction, Units = rpgtype.Units }).ToList();
                foreach (var _characterItemProperties in CharacterItemProperties)
                {

                    if (_characterItemProperties.Name == "Rarity")
                    {
                        _characterItemsproperties.Add(new CharacterItemsProperties()
                        {
                            CharacterItemValueId = Convert.ToInt32(_characterItemProperties.Id),
                            CharacterItemId = item.CharacterItemId,
                            ContentId = item.ContentId,
                            Name = _characterItemProperties.Name,
                            IsAction = _characterItemProperties.IsAction,
                            Description = _characterItemProperties.Discription,
                            TypeId = Convert.ToInt32(_characterItemProperties.TypeId),
                            Value = Utility.ConvertTypeValueXMLtoClass(_characterItemProperties.TypeId, _characterItemProperties.Value, RarityMetadata)
                        });
                    }
                    else
                    {

                        if (_characterItemProperties.TypeId == 16)
                        {

                            CustomTypes c1 = new CustomTypes();
                            c1.Calculation = new Calculation();
                            c1.Calculation.formulae = "[Weight]*[Quantity]";
                            _characterItemsproperties.Add(new CharacterItemsProperties()
                            {
                                CharacterItemValueId = Convert.ToInt32(_characterItemProperties.Id),
                                CharacterItemId = item.CharacterItemId,
                                ContentId = item.ContentId,
                                Name = _characterItemProperties.Name,
                                IsAction = _characterItemProperties.IsAction,
                                Description = _characterItemProperties.Discription,
                                TypeId = Convert.ToInt32(_characterItemProperties.TypeId),
                                Value = c1
                            });

                        }
                        else
                        {
                            _characterItemsproperties.Add(new CharacterItemsProperties()
                            {
                                CharacterItemValueId = Convert.ToInt32(_characterItemProperties.Id),
                                CharacterItemId = item.CharacterItemId,
                                ContentId = item.ContentId,
                                Name = _characterItemProperties.Name,
                                IsAction = _characterItemProperties.IsAction,
                                Description = _characterItemProperties.Discription,
                                TypeId = Convert.ToInt32(_characterItemProperties.TypeId),
                                Value = Utility.ConvertTypeValueXMLtoClass(_characterItemProperties.TypeId, _characterItemProperties.Value, _characterItemProperties.Units)
                            });

                        }


                    }


                }

                _inventoryViewModel.CharacterItems.Add(new CharacterItems()
                {
                    CharacterProfileId = Convert.ToInt32(item.CharacterProfileId),
                    CharacterItemId = item.CharacterItemId,
                    UserId = item.UserId,
                    CharacterItemsProperties = _characterItemsproperties
                });
            }
            //For Items Metadata

            var _dataQuery = _context.RulesetContentTypes.Where(x => x.ContentType == 1 && x.IsActive == true && x.IsRuleSet == true).Select(
            x => new
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                TypeId = x.TypeId,
                Metadata = x.Metadata,
                Mandatory = x.Mandatory,
                IsFormula = x.IsFormula,
                Formula = x.Formula

            }
            ).ToList();

            _inventoryViewModel.CharacterInventoryMetaData.CharacterItems.CharacterItemsProperties = new List<CharacterItemsProperties>();
            foreach (var val in _dataQuery)
            {
                CharacterItemsProperties _inventoryItemProperty = new CharacterItemsProperties();
                _inventoryItemProperty.CharacterItemValueId = val.Id;
                _inventoryItemProperty.Name = val.Name;
                _inventoryItemProperty.Description = val.Description;
                _inventoryItemProperty.TypeId = Convert.ToInt32(val.TypeId);
                _inventoryItemProperty.IsMandatory = val.Mandatory == true ? val.Mandatory : false;
                if (val.Metadata != null && val.Metadata != "")
                {
                    _inventoryItemProperty.Value = Utility.ConvertTypeMetaDataXMLtoClass(val.TypeId, val.Metadata);
                }
                else
                {
                    _inventoryItemProperty.Value = Utility.GetTypeClassMetaData(val.TypeId);
                    if (val.Formula != null && val.Formula != "")
                    {
                        _inventoryItemProperty.Value.Calculation.formulae = val.Formula;
                    }
                }

                _inventoryViewModel.CharacterInventoryMetaData.CharacterItems.CharacterItemsProperties.Add(_inventoryItemProperty);
            }
            //Getting Spells Data From DB
            var spellresult = _context.CharacterSpells.Where(x => x.CharacterProfileId == CharacterProfileId).ToList();
            if (spellresult == null) return _inventoryViewModel;
            foreach (var spell in spellresult)
            {
                List<CharacterSpellsProperties> _characterSpellProperties = new List<Web.ViewModels.CharacterSpellsProperties>();
                var CharacterSpellProperties = (from spellproperties in _context.CharacterSpellProperties.Where(p => p.CharacterSpellId == spell.CharacterSpellId)
                                                join rpgtype in _context.RPGSmithTypes on spellproperties.TypeId equals rpgtype.TypeID
                                                orderby spellproperties.Id
                                                select new { Id = spellproperties.Id, Name = spellproperties.Name, Discription = spellproperties.Description, TypeId = spellproperties.TypeId, Value = spellproperties.Value, IsAction = spellproperties.IsAction, Units = rpgtype.Units }).ToList();

                foreach (var _characterSpellProperty in CharacterSpellProperties)
                {

                    if (_characterSpellProperty.Name == "Rarity")
                    {
                        _characterSpellProperties.Add(new CharacterSpellsProperties()
                        {
                            CharacterSpellValueId = Convert.ToInt32(_characterSpellProperty.Id),
                            CharacterSpellId = spell.CharacterSpellId,
                            ContentId = Convert.ToInt32(spell.ContentId),
                            Name = _characterSpellProperty.Name,
                            IsAction = _characterSpellProperty.IsAction,
                            Description = _characterSpellProperty.Discription,
                            TypeId = Convert.ToInt32(_characterSpellProperty.TypeId),
                            Value = Utility.ConvertTypeValueXMLtoClass(_characterSpellProperty.TypeId, _characterSpellProperty.Value, RarityMetadata)
                        });
                    }
                    else
                    {
                        _characterSpellProperties.Add(new CharacterSpellsProperties()
                        {
                            CharacterSpellValueId = Convert.ToInt32(_characterSpellProperty.Id),
                            CharacterSpellId = spell.CharacterSpellId,
                            ContentId = Convert.ToInt32(spell.ContentId),
                            Name = _characterSpellProperty.Name,
                            IsAction = _characterSpellProperty.IsAction,
                            Description = _characterSpellProperty.Discription,
                            TypeId = Convert.ToInt32(_characterSpellProperty.TypeId),
                            Value = Utility.ConvertTypeValueXMLtoClass(_characterSpellProperty.TypeId, _characterSpellProperty.Value, _characterSpellProperty.Units)
                        });
                    }
                }

                _inventoryViewModel.CharacterSpells.Add(new CharacterSpells()
                {
                    ContentId = Convert.ToInt32(spell.ContentId),
                    CharacterProfileId = Convert.ToInt32(spell.CharacterProfileId),
                    CharacterSpellId = spell.CharacterSpellId,
                    UserId = spell.UserId,
                    CharacterSpellsProperties = _characterSpellProperties
                });

            }
            //For Spell Metdata
            _dataQuery = _context.RulesetContentTypes.Where(x => x.ContentType == 2).Select(
           x => new
           {
               Id = x.Id,
               Name = x.Name,
               Description = x.Description,
               TypeId = x.TypeId,
               Metadata = x.Metadata,
               Mandatory = x.Mandatory,
               IsFormula = x.IsFormula,
               Formula = x.Formula

           }
           ).ToList();

            _inventoryViewModel.CharacterInventoryMetaData.CharacterSpells.CharacterSpellsProperties = new List<CharacterSpellsProperties>();
            foreach (var val in _dataQuery)
            {
                CharacterSpellsProperties _inventorySpellProperty = new CharacterSpellsProperties();
                _inventorySpellProperty.CharacterSpellValueId = val.Id;
                _inventorySpellProperty.Name = val.Name;
                _inventorySpellProperty.Description = val.Description;
                _inventorySpellProperty.TypeId = Convert.ToInt32(val.TypeId);
                _inventorySpellProperty.IsMandatory = val.Mandatory == true ? val.Mandatory : false;
                if (val.Metadata != null && val.Metadata != "")
                {
                    _inventorySpellProperty.Value = Utility.ConvertTypeMetaDataXMLtoClass(val.TypeId, val.Metadata);
                }
                else
                {
                    _inventorySpellProperty.Value = Utility.GetTypeClassMetaData(val.TypeId);
                    if (val.Formula != null && val.Formula != "")
                    {
                        _inventorySpellProperty.Value.Calculation.formulae = val.Formula;
                    }
                }
                _inventoryViewModel.CharacterInventoryMetaData.CharacterSpells.CharacterSpellsProperties.Add(_inventorySpellProperty);
            }
            //Getting Abilities Data From DB
            var abilityresult = _context.CharacterAbilities.Where(x => x.CharacterProfileId == CharacterProfileId).ToList();
            if (abilityresult == null) return _inventoryViewModel;
            foreach (var ability in abilityresult)
            {
                List<CharacterAbilitiesProperties> _characterabilityProperties = new List<Web.ViewModels.CharacterAbilitiesProperties>();
                var CharacterabilityProperties = (from abilityproperties in _context.CharacterAbilityProperties.Where(p => p.CharacterAbilityId == ability.CharacterAbilityId)
                                                  join rpgtype in _context.RPGSmithTypes on abilityproperties.TypeId equals rpgtype.TypeID
                                                  orderby abilityproperties.Id
                                                  select new { Id = abilityproperties.Id, Name = abilityproperties.Name, Discription = abilityproperties.Description, TypeId = abilityproperties.TypeId, Value = abilityproperties.Value, IsAction = abilityproperties.ISAction, Units = rpgtype.Units }).ToList();
                foreach (var _characterabilityProperty in CharacterabilityProperties)
                {

                    if (_characterabilityProperty.Name == "Rarity")
                    {
                        _characterabilityProperties.Add(new CharacterAbilitiesProperties()
                        {
                            CharacterAbilityValueId = Convert.ToInt32(_characterabilityProperty.Id),
                            CharacterAbilityId = ability.CharacterAbilityId,
                            ContentId = Convert.ToInt32(ability.ContentId),
                            Name = _characterabilityProperty.Name,
                            IsAction = _characterabilityProperty.IsAction,
                            Description = _characterabilityProperty.Discription,
                            TypeId = Convert.ToInt32(_characterabilityProperty.TypeId),
                            Value = Utility.ConvertTypeValueXMLtoClass(_characterabilityProperty.TypeId, _characterabilityProperty.Value, RarityMetadata)
                        });
                    }
                    else
                    {
                        _characterabilityProperties.Add(new CharacterAbilitiesProperties()
                        {
                            CharacterAbilityValueId = Convert.ToInt32(_characterabilityProperty.Id),
                            CharacterAbilityId = ability.CharacterAbilityId,
                            ContentId = Convert.ToInt32(ability.ContentId),
                            Name = _characterabilityProperty.Name,
                            IsAction = _characterabilityProperty.IsAction,
                            Description = _characterabilityProperty.Discription,
                            TypeId = Convert.ToInt32(_characterabilityProperty.TypeId),
                            Value = Utility.ConvertTypeValueXMLtoClass(_characterabilityProperty.TypeId, _characterabilityProperty.Value, _characterabilityProperty.Units)
                        });
                    }
                }

                _inventoryViewModel.CharacterAbilities.Add(new CharacterAbilities()
                {
                    ContentId = Convert.ToInt32(ability.ContentId),
                    CharacterProfileId = Convert.ToInt32(ability.CharacterProfileId),
                    CharacterAbilityId = ability.CharacterAbilityId,
                    UserId = ability.UserId,
                    CharacterAbilitiesProperties = _characterabilityProperties
                });
            }
            //For Ability Metadata
            _dataQuery = _context.RulesetContentTypes.Where(x => x.ContentType == 3).Select(
          x => new
          {
              Id = x.Id,
              Name = x.Name,
              Description = x.Description,
              TypeId = x.TypeId,
              Metadata = x.Metadata,
              Mandatory = x.Mandatory,
              IsFormula = x.IsFormula,
              Formula = x.Formula

          }
          ).ToList();

            _inventoryViewModel.CharacterInventoryMetaData.CharacterAbilities.CharacterAbilitiesProperties = new List<CharacterAbilitiesProperties>();
            foreach (var val in _dataQuery)
            {
                CharacterAbilitiesProperties _inventoryAbilityProperty = new CharacterAbilitiesProperties();
                _inventoryAbilityProperty.CharacterAbilityValueId = val.Id;
                _inventoryAbilityProperty.Name = val.Name;
                _inventoryAbilityProperty.Description = val.Description;
                _inventoryAbilityProperty.TypeId = Convert.ToInt32(val.TypeId);
                _inventoryAbilityProperty.IsMandatory = val.Mandatory == true ? val.Mandatory : false;
                if (val.Metadata != null && val.Metadata != "")
                {
                    _inventoryAbilityProperty.Value = Utility.ConvertTypeMetaDataXMLtoClass(val.TypeId, val.Metadata);
                }
                else
                {
                    _inventoryAbilityProperty.Value = Utility.GetTypeClassMetaData(val.TypeId);
                    if (val.Formula != null && val.Formula != "")
                    {
                        _inventoryAbilityProperty.Value.Calculation.formulae = val.Formula;
                    }
                }
                _inventoryViewModel.CharacterInventoryMetaData.CharacterAbilities.CharacterAbilitiesProperties.Add(_inventoryAbilityProperty);
            }
            return _inventoryViewModel;
        }

        public CharacterInventoryViewModel GetItemInventoryByCharacterProfileId(int? CharacterProfileId)
        {
            CharacterInventoryViewModel _inventoryViewModel = new CharacterInventoryViewModel();
            _inventoryViewModel.CharacterItems = new List<CharacterItems>();

            var result = _context.CharacterItems.Where(x => x.CharacterProfileId == CharacterProfileId).ToList();
            if (result == null) return _inventoryViewModel;
            var RarityMetadata = _context.RulesetContentTypes.Where(x => x.ContentType == 1 && x.IsActive == true && x.IsRuleSet == true && x.Id == 7).SingleOrDefault().Metadata;

            List<CharacterSpells> _associatedSpells = null;
            List<CharacterAbilities> _associatedAbilities = null;

            foreach (var item in result)
            {
                List<CharacterItemsProperties> _characterItemsproperties = new List<Web.ViewModels.CharacterItemsProperties>();
                var CharacterItemProperties = (from itemproperties in _context.CharacterItemProperties.Where(p => p.CharacterItemId == item.CharacterItemId)
                                               join rpgtype in _context.RPGSmithTypes on itemproperties.TypeId equals rpgtype.TypeID
                                               select new { Id = itemproperties.Id, Name = itemproperties.Name, Discription = itemproperties.Description, TypeId = itemproperties.TypeId, Value = itemproperties.Value, IsAction = itemproperties.IsAction, Units = rpgtype.Units }).ToList();
                foreach (var _characterItemProperties in CharacterItemProperties)
                {

                    if (_characterItemProperties.Name == "Rarity")
                    {
                        _characterItemsproperties.Add(new CharacterItemsProperties()
                        {
                            CharacterItemValueId = Convert.ToInt32(_characterItemProperties.Id),
                            CharacterItemId = item.CharacterItemId,
                            ContentId = item.ContentId,
                            Name = _characterItemProperties.Name,
                            IsAction = _characterItemProperties.IsAction,
                            Description = _characterItemProperties.Discription,
                            TypeId = Convert.ToInt32(_characterItemProperties.TypeId),
                            Value = Utility.ConvertTypeValueXMLtoClass(_characterItemProperties.TypeId, _characterItemProperties.Value, RarityMetadata)
                        });
                    }
                    else
                    {

                        if (_characterItemProperties.TypeId == 16)
                        {

                            CustomTypes c1 = new CustomTypes();
                            c1.Calculation = new Calculation();
                            c1.Calculation.formulae = "[Weight]*[Quantity]";
                            //Calculation c1 = new Calculation();
                            //c1.formulae = 
                            _characterItemsproperties.Add(new CharacterItemsProperties()
                            {
                                CharacterItemValueId = Convert.ToInt32(_characterItemProperties.Id),
                                CharacterItemId = item.CharacterItemId,
                                ContentId = item.ContentId,
                                Name = _characterItemProperties.Name,
                                IsAction = _characterItemProperties.IsAction,
                                Description = _characterItemProperties.Discription,
                                TypeId = Convert.ToInt32(_characterItemProperties.TypeId),
                                Value = c1
                            });

                        }
                        else
                        {
                            _characterItemsproperties.Add(new CharacterItemsProperties()
                            {
                                CharacterItemValueId = Convert.ToInt32(_characterItemProperties.Id),
                                CharacterItemId = item.CharacterItemId,
                                ContentId = item.ContentId,
                                Name = _characterItemProperties.Name,
                                IsAction = _characterItemProperties.IsAction,
                                Description = _characterItemProperties.Discription,
                                TypeId = Convert.ToInt32(_characterItemProperties.TypeId),
                                Value = Utility.ConvertTypeValueXMLtoClass(_characterItemProperties.TypeId, _characterItemProperties.Value, _characterItemProperties.Units)
                            });

                        }


                    }


                }
                //Declare Model
                var _CharacterItemTileProperties = new CharacterItemsProperties();
                //Getting Spell Tile Properties from db
                var CharacterItemTileProperties = _context.CharacterItemProperties.Where(p => p.CharacterItemId == item.CharacterItemId && p.Name == null).ToList();
                foreach (var _characterItemTileProperty in CharacterItemTileProperties)
                {
                    // Setting RuleSet Spell Tile Properties
                    _CharacterItemTileProperties = SetInventoryContents(_characterItemTileProperty, null, null).CharacterItemsProperties;
                    _characterItemsproperties.Add(_CharacterItemTileProperties);
                }


                //Filling the Associated Spells into the Items.
                List<CharacterSpells> _ruleSetAssociatedSpellsVM = new List<CharacterSpells>();
                var _characterAssociatedSpellIds = (from _characterAssociatedItems in _context.CharacterItems
                                                    join _characterItemSpells in _context.CharacterItemSpells on _characterAssociatedItems.CharacterItemId equals _characterItemSpells.CharacterItemId
                                                    where _characterAssociatedItems.CharacterItemId == item.CharacterItemId
                                                    select new
                                                    {
                                                        CharacterSpellId = _characterItemSpells.CharacterSpellId
                                                    }).ToList();

                if (_characterAssociatedSpellIds.Count > 0)
                {
                    _associatedSpells = new List<CharacterSpells>();

                    foreach (var val in _characterAssociatedSpellIds)
                    {
                        _associatedSpells.Add(GetSpellInventoryBySpellId(val.CharacterSpellId));
                    }

                }

                //Filling the Associated Spells into the Items.
                List<CharacterAbilities> _ruleSetAssociatedAbilitiesVM = new List<CharacterAbilities>();
                var _characterAssociatedAbilitiesIds = (from _characterAssociatedItems in _context.CharacterItems
                                                        join _characterItemAbilities in _context.CharacterItemAbilities on _characterAssociatedItems.CharacterItemId equals _characterItemAbilities.CharacterItemId
                                                        where _characterAssociatedItems.CharacterItemId == item.CharacterItemId
                                                        select new
                                                        {
                                                            CharacterSpellId = _characterItemAbilities.CharacterAbilityId
                                                        }).ToList();

                if (_characterAssociatedAbilitiesIds.Count > 0)
                {
                    _associatedAbilities = new List<CharacterAbilities>();

                    foreach (var val in _associatedAbilities)
                    {
                        _associatedAbilities.Add(GetAbilityInventoryByAbilityId(val.CharacterAbilityId));
                    }

                }

                _inventoryViewModel.CharacterItems.Add(new CharacterItems()
                {
                    CharacterProfileId = Convert.ToInt32(item.CharacterProfileId),
                    CharacterItemId = item.CharacterItemId,
                    UserId = item.UserId,
                    CharacterItemsProperties = _characterItemsproperties,
                    AssociatedSpells = _associatedSpells,
                    AssociatedAbilities = _associatedAbilities
                });
            }
            //For Items Metadata

            var _dataQuery = _context.RulesetContentTypes.Where(x => x.ContentType == 1 && x.IsActive == true && x.IsRuleSet == true).Select(
            x => new
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                TypeId = x.TypeId,
                Metadata = x.Metadata,
                Mandatory = x.Mandatory,
                IsFormula = x.IsFormula,
                Formula = x.Formula,
                IsAction = x.IsAction
            }
            ).ToList();

            _inventoryViewModel.CharacterInventoryMetaData.CharacterItems.CharacterItemsProperties = new List<CharacterItemsProperties>();
            foreach (var val in _dataQuery)
            {
                CharacterItemsProperties _inventoryItemProperty = new CharacterItemsProperties();
                _inventoryItemProperty.CharacterItemValueId = val.Id;
                _inventoryItemProperty.Name = val.Name;
                _inventoryItemProperty.Description = val.Description;
                _inventoryItemProperty.TypeId = Convert.ToInt32(val.TypeId);
                _inventoryItemProperty.IsMandatory = val.Mandatory == true ? val.Mandatory : false;
                _inventoryItemProperty.IsAction = val.IsAction == true ? val.IsAction : false;
                if (val.Metadata != null && val.Metadata != "")
                {
                    _inventoryItemProperty.Value = Utility.ConvertTypeMetaDataXMLtoClass(val.TypeId, val.Metadata);
                }
                else
                {
                    _inventoryItemProperty.Value = Utility.GetTypeClassMetaData(val.TypeId);
                    if (val.Formula != null && val.Formula != "")
                    {
                        _inventoryItemProperty.Value.Calculation.formulae = val.Formula;
                    }
                }

                _inventoryViewModel.CharacterInventoryMetaData.CharacterItems.CharacterItemsProperties.Add(_inventoryItemProperty);
            }
            return _inventoryViewModel;
        }

        public CharacterInventoryViewModel GetSpellInventoryByCharacterProfileId(int? CharacterProfileId)
        {
            CharacterInventoryViewModel _inventoryViewModel = new CharacterInventoryViewModel();
            _inventoryViewModel.CharacterSpells = new List<CharacterSpells>();
            var spellresult = _context.CharacterSpells.Where(x => x.CharacterProfileId == CharacterProfileId).ToList();
            if (spellresult == null) return _inventoryViewModel;
            var RarityMetadata = _context.RulesetContentTypes.Where(x => x.ContentType == 1 && x.IsActive == true && x.IsRuleSet == true && x.Id == 7).SingleOrDefault().Metadata;
            foreach (var spell in spellresult)
            {
                List<CharacterSpellsProperties> _characterSpellProperties = new List<Web.ViewModels.CharacterSpellsProperties>();
                var CharacterSpellProperties = (from spellproperties in _context.CharacterSpellProperties.Where(p => p.CharacterSpellId == spell.CharacterSpellId)
                                                join rpgtype in _context.RPGSmithTypes on spellproperties.TypeId equals rpgtype.TypeID
                                                orderby spellproperties.Id
                                                select new { Id = spellproperties.Id, Name = spellproperties.Name, Discription = spellproperties.Description, TypeId = spellproperties.TypeId, Value = spellproperties.Value, IsAction = spellproperties.IsAction, Units = rpgtype.Units }).ToList();

                foreach (var _characterSpellProperty in CharacterSpellProperties)
                {

                    if (_characterSpellProperty.Name == "Rarity")
                    {
                        _characterSpellProperties.Add(new CharacterSpellsProperties()
                        {
                            CharacterSpellValueId = Convert.ToInt32(_characterSpellProperty.Id),
                            CharacterSpellId = spell.CharacterSpellId,
                            ContentId = Convert.ToInt32(spell.ContentId),
                            Name = _characterSpellProperty.Name,
                            IsAction = _characterSpellProperty.IsAction,
                            Description = _characterSpellProperty.Discription,
                            TypeId = Convert.ToInt32(_characterSpellProperty.TypeId),
                            Value = Utility.ConvertTypeValueXMLtoClass(_characterSpellProperty.TypeId, _characterSpellProperty.Value, RarityMetadata)
                        });
                    }
                    else
                    {
                        _characterSpellProperties.Add(new CharacterSpellsProperties()
                        {
                            CharacterSpellValueId = Convert.ToInt32(_characterSpellProperty.Id),
                            CharacterSpellId = spell.CharacterSpellId,
                            ContentId = Convert.ToInt32(spell.ContentId),
                            Name = _characterSpellProperty.Name,
                            IsAction = _characterSpellProperty.IsAction,
                            Description = _characterSpellProperty.Discription,
                            TypeId = Convert.ToInt32(_characterSpellProperty.TypeId),
                            Value = Utility.ConvertTypeValueXMLtoClass(_characterSpellProperty.TypeId, _characterSpellProperty.Value, _characterSpellProperty.Units)
                        });
                    }

                }
                //Declare Model
                var _CharacterSpellTileProperties = new CharacterSpellsProperties();
                //Getting Spell Tile Properties from db
                var CharacterSpellTileProperties = _context.CharacterSpellProperties.Where(p => p.CharacterSpellId == spell.CharacterSpellId && p.Name == null).ToList();
                foreach (var _characterSpellTileProperty in CharacterSpellTileProperties)
                {
                    // Setting RuleSet Spell Tile Properties
                    _CharacterSpellTileProperties = SetInventoryContents(null, _characterSpellTileProperty, null).CharacterSpellsProperties;
                    _characterSpellProperties.Add(_CharacterSpellTileProperties);
                }
                _inventoryViewModel.CharacterSpells.Add(new CharacterSpells()
                {
                    ContentId = Convert.ToInt32(spell.ContentId),
                    CharacterProfileId = Convert.ToInt32(spell.CharacterProfileId),
                    CharacterSpellId = spell.CharacterSpellId,
                    UserId = spell.UserId,
                    CharacterSpellsProperties = _characterSpellProperties
                });

            }
            //For Spell Metdata
            var _dataQuery = _context.RulesetContentTypes.Where(x => x.ContentType == 2).Select(
            x => new
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                TypeId = x.TypeId,
                Metadata = x.Metadata,
                Mandatory = x.Mandatory,
                IsFormula = x.IsFormula,
                Formula = x.Formula,
                IsAction = x.IsAction

            }
            ).ToList();

            _inventoryViewModel.CharacterInventoryMetaData.CharacterSpells.CharacterSpellsProperties = new List<CharacterSpellsProperties>();
            foreach (var val in _dataQuery)
            {
                CharacterSpellsProperties _inventorySpellProperty = new CharacterSpellsProperties();
                _inventorySpellProperty.CharacterSpellValueId = val.Id;
                _inventorySpellProperty.Name = val.Name;
                _inventorySpellProperty.Description = val.Description;
                _inventorySpellProperty.TypeId = Convert.ToInt32(val.TypeId);
                _inventorySpellProperty.IsMandatory = val.Mandatory == true ? val.Mandatory : false;
                _inventorySpellProperty.IsAction = val.IsAction == true ? val.IsAction : false;
                if (val.Metadata != null && val.Metadata != "")
                {
                    _inventorySpellProperty.Value = Utility.ConvertTypeMetaDataXMLtoClass(val.TypeId, val.Metadata);
                }
                else
                {
                    _inventorySpellProperty.Value = Utility.GetTypeClassMetaData(val.TypeId);
                    if (val.Formula != null && val.Formula != "")
                    {
                        _inventorySpellProperty.Value.Calculation.formulae = val.Formula;
                    }
                }
                _inventoryViewModel.CharacterInventoryMetaData.CharacterSpells.CharacterSpellsProperties.Add(_inventorySpellProperty);
            }
            return _inventoryViewModel;
        }

        public CharacterInventoryViewModel GetAbilityInventoryByCharacterProfileId(int? CharacterProfileId)
        {
            CharacterInventoryViewModel _inventoryViewModel = new CharacterInventoryViewModel();
            _inventoryViewModel.CharacterAbilities = new List<CharacterAbilities>();
            var abilityresult = _context.CharacterAbilities.Where(x => x.CharacterProfileId == CharacterProfileId).ToList();
            var RarityMetadata = _context.RulesetContentTypes.Where(x => x.ContentType == 1 && x.IsActive == true && x.IsRuleSet == true && x.Id == 7).SingleOrDefault().Metadata;
            if (abilityresult == null) return _inventoryViewModel;
            foreach (var ability in abilityresult)
            {
                List<CharacterAbilitiesProperties> _characterabilityProperties = new List<Web.ViewModels.CharacterAbilitiesProperties>();
                var CharacterabilityProperties = (from abilityproperties in _context.CharacterAbilityProperties.Where(p => p.CharacterAbilityId == ability.CharacterAbilityId)
                                                  join rpgtype in _context.RPGSmithTypes on abilityproperties.TypeId equals rpgtype.TypeID
                                                  orderby abilityproperties.Id
                                                  select new { Id = abilityproperties.Id, Name = abilityproperties.Name, Discription = abilityproperties.Description, TypeId = abilityproperties.TypeId, Value = abilityproperties.Value, IsAction = abilityproperties.ISAction, Units = rpgtype.Units }).ToList();
                foreach (var _characterabilityProperty in CharacterabilityProperties)
                {

                    if (_characterabilityProperty.Name == "Rarity")
                    {
                        _characterabilityProperties.Add(new CharacterAbilitiesProperties()
                        {
                            CharacterAbilityValueId = Convert.ToInt32(_characterabilityProperty.Id),
                            CharacterAbilityId = ability.CharacterAbilityId,
                            ContentId = Convert.ToInt32(ability.ContentId),
                            Name = _characterabilityProperty.Name,
                            IsAction = _characterabilityProperty.IsAction,
                            Description = _characterabilityProperty.Discription,
                            TypeId = Convert.ToInt32(_characterabilityProperty.TypeId),
                            Value = Utility.ConvertTypeValueXMLtoClass(_characterabilityProperty.TypeId, _characterabilityProperty.Value, RarityMetadata)
                        });
                    }
                    else
                    {
                        _characterabilityProperties.Add(new CharacterAbilitiesProperties()
                        {
                            CharacterAbilityValueId = Convert.ToInt32(_characterabilityProperty.Id),
                            CharacterAbilityId = ability.CharacterAbilityId,
                            ContentId = Convert.ToInt32(ability.ContentId),
                            Name = _characterabilityProperty.Name,
                            IsAction = _characterabilityProperty.IsAction,
                            Description = _characterabilityProperty.Discription,
                            TypeId = Convert.ToInt32(_characterabilityProperty.TypeId),
                            Value = Utility.ConvertTypeValueXMLtoClass(_characterabilityProperty.TypeId, _characterabilityProperty.Value, _characterabilityProperty.Units)
                        });
                    }

                }
                //Declare Model
                var _CharacterAbilityTileProperties = new CharacterAbilitiesProperties();
                //Getting Spell Tile Properties from db
                var CharacterAbilityTileProperties = _context.CharacterAbilityProperties.Where(p => p.CharacterAbilityId == ability.CharacterAbilityId && p.Name == null).ToList();
                foreach (var _characterAbilityTileProperty in CharacterAbilityTileProperties)
                {
                    // Setting RuleSet Spell Tile Properties
                    _CharacterAbilityTileProperties = SetInventoryContents(null, null, _characterAbilityTileProperty).CharacterAbilitiesProperties;
                    _characterabilityProperties.Add(_CharacterAbilityTileProperties);
                }
                _inventoryViewModel.CharacterAbilities.Add(new CharacterAbilities()
                {
                    ContentId = Convert.ToInt32(ability.ContentId),
                    CharacterProfileId = Convert.ToInt32(ability.CharacterProfileId),
                    CharacterAbilityId = ability.CharacterAbilityId,
                    UserId = ability.UserId,
                    CharacterAbilitiesProperties = _characterabilityProperties
                });
            }
            //For Ability Metadata
            var _dataQuery = _context.RulesetContentTypes.Where(x => x.ContentType == 3).Select(
           x => new
           {
               Id = x.Id,
               Name = x.Name,
               Description = x.Description,
               TypeId = x.TypeId,
               Metadata = x.Metadata,
               Mandatory = x.Mandatory,
               IsFormula = x.IsFormula,
               Formula = x.Formula,
               IsAction = x.IsAction

           }
           ).ToList();

            _inventoryViewModel.CharacterInventoryMetaData.CharacterAbilities.CharacterAbilitiesProperties = new List<CharacterAbilitiesProperties>();
            foreach (var val in _dataQuery)
            {
                CharacterAbilitiesProperties _inventoryAbilityProperty = new CharacterAbilitiesProperties();
                _inventoryAbilityProperty.CharacterAbilityValueId = val.Id;
                _inventoryAbilityProperty.Name = val.Name;
                _inventoryAbilityProperty.Description = val.Description;
                _inventoryAbilityProperty.TypeId = Convert.ToInt32(val.TypeId);
                _inventoryAbilityProperty.IsMandatory = val.Mandatory == true ? val.Mandatory : false;
                _inventoryAbilityProperty.IsAction = val.IsAction == true ? val.IsAction : false;
                if (val.Metadata != null && val.Metadata != "")
                {
                    _inventoryAbilityProperty.Value = Utility.ConvertTypeMetaDataXMLtoClass(val.TypeId, val.Metadata);
                }
                else
                {
                    _inventoryAbilityProperty.Value = Utility.GetTypeClassMetaData(val.TypeId);
                    if (val.Formula != null && val.Formula != "")
                    {
                        _inventoryAbilityProperty.Value.Calculation.formulae = val.Formula;
                    }
                }
                _inventoryViewModel.CharacterInventoryMetaData.CharacterAbilities.CharacterAbilitiesProperties.Add(_inventoryAbilityProperty);
            }
            return _inventoryViewModel;
        }

        public CharacterItems GetItemInventoryByItemId(int? ItemId)
        {

            CharacterItems _characterItems = new CharacterItems();

            var result = _context.CharacterItems.Where(x => x.CharacterItemId == ItemId).FirstOrDefault();

            if (result == null) return _characterItems;

            var RarityMetadata = _context.RulesetContentTypes.Where(x => x.ContentType == 1 && x.IsActive == true && x.IsRuleSet == true && x.Id == 7).SingleOrDefault().Metadata;

            List<CharacterItemsProperties> _characterItemsproperties = new List<Web.ViewModels.CharacterItemsProperties>();

            var CharacterItemProperties = (from itemproperties in _context.CharacterItemProperties.Where(p => p.CharacterItemId == ItemId)
                                           join rpgtype in _context.RPGSmithTypes on itemproperties.TypeId equals rpgtype.TypeID
                                           select new { Id = itemproperties.Id, Name = itemproperties.Name, Discription = itemproperties.Description, TypeId = itemproperties.TypeId, Value = itemproperties.Value, IsAction = itemproperties.IsAction, Units = rpgtype.Units }).ToList();

            foreach (var _characterItemProperties in CharacterItemProperties)
            {

                if (_characterItemProperties.Name == "Rarity")
                {
                    _characterItemsproperties.Add(new CharacterItemsProperties()
                    {
                        CharacterItemValueId = Convert.ToInt32(_characterItemProperties.Id),
                        CharacterItemId = result.CharacterItemId,
                        ContentId = result.ContentId,
                        Name = _characterItemProperties.Name,
                        IsAction = _characterItemProperties.IsAction,
                        Description = _characterItemProperties.Discription,
                        TypeId = Convert.ToInt32(_characterItemProperties.TypeId),
                        Value = Utility.ConvertTypeValueXMLtoClass(_characterItemProperties.TypeId, _characterItemProperties.Value, RarityMetadata)
                    });
                }
                else
                {

                    if (_characterItemProperties.TypeId == 16)
                    {

                        CustomTypes c1 = new CustomTypes();
                        c1.Calculation = new Calculation();
                        c1.Calculation.formulae = "[Weight]*[Quantity]";
                        _characterItemsproperties.Add(new CharacterItemsProperties()
                        {
                            CharacterItemValueId = Convert.ToInt32(_characterItemProperties.Id),
                            CharacterItemId = result.CharacterItemId,
                            ContentId = result.ContentId,
                            Name = _characterItemProperties.Name,
                            IsAction = _characterItemProperties.IsAction,
                            Description = _characterItemProperties.Discription,
                            TypeId = Convert.ToInt32(_characterItemProperties.TypeId),
                            Value = c1
                        });

                    }
                    else
                    {
                        _characterItemsproperties.Add(new CharacterItemsProperties()
                        {
                            CharacterItemValueId = Convert.ToInt32(_characterItemProperties.Id),
                            CharacterItemId = result.CharacterItemId,
                            ContentId = result.ContentId,
                            Name = _characterItemProperties.Name,
                            IsAction = _characterItemProperties.IsAction,
                            Description = _characterItemProperties.Discription,
                            TypeId = Convert.ToInt32(_characterItemProperties.TypeId),
                            Value = Utility.ConvertTypeValueXMLtoClass(_characterItemProperties.TypeId, _characterItemProperties.Value, _characterItemProperties.Units)
                        });

                    }


                }


            }

            //Filling the Associated Spells into the Items.
            List<CharacterSpells> _ruleSetAssociatedSpellsVM = new List<CharacterSpells>();
            var _characterAssociatedSpellIds = (from _characterAssociatedItems in _context.CharacterItems
                                                join _characterItemSpells in _context.CharacterItemSpells on _characterAssociatedItems.CharacterItemId equals _characterItemSpells.CharacterItemId
                                                where _characterAssociatedItems.CharacterItemId == ItemId
                                                select new
                                                {
                                                    CharacterSpellId = _characterItemSpells.CharacterSpellId
                                                }).ToList();

            if (_characterAssociatedSpellIds.Count > 0)
            {
                _characterItems.AssociatedSpells = new List<CharacterSpells>();

                foreach (var val in _characterAssociatedSpellIds)
                {
                    _characterItems.AssociatedSpells.Add(GetSpellInventoryBySpellId(val.CharacterSpellId));
                }

            }

            _characterItems = new CharacterItems()
            {
                //ContentId = Convert.ToInt32(item.ContentId),
                CharacterProfileId = Convert.ToInt32(result.CharacterProfileId),
                CharacterItemId = result.CharacterItemId,
                UserId = result.UserId,
                CharacterItemsProperties = _characterItemsproperties
            };


            return _characterItems;
        }

        public CharacterSpells GetSpellInventoryBySpellId(int? SpellId)
        {

            CharacterSpells _characterSpells = new CharacterSpells();

            var result = _context.CharacterSpells.Where(x => x.CharacterSpellId == SpellId).FirstOrDefault();

            if (result == null) return _characterSpells;

            var RarityMetadata = _context.RulesetContentTypes.Where(x => x.ContentType == 1 && x.IsActive == true && x.IsRuleSet == true && x.Id == 7).SingleOrDefault().Metadata;

            List<CharacterSpellsProperties> _characterSpellsproperties = new List<Web.ViewModels.CharacterSpellsProperties>();

            var CharacterSpellProperties = (from spellproperties in _context.CharacterSpellProperties.Where(p => p.CharacterSpellId == SpellId)
                                            join rpgtype in _context.RPGSmithTypes on spellproperties.TypeId equals rpgtype.TypeID
                                            select new { Id = spellproperties.Id, Name = spellproperties.Name, Discription = spellproperties.Description, TypeId = spellproperties.TypeId, Value = spellproperties.Value, IsAction = spellproperties.IsAction, Units = rpgtype.Units }).ToList();

            foreach (var _characterSpellProperties in CharacterSpellProperties)
            {

                if (_characterSpellProperties.Name == "Rarity")
                {
                    _characterSpellsproperties.Add(new CharacterSpellsProperties()
                    {
                        CharacterSpellValueId = Convert.ToInt32(_characterSpellProperties.Id),
                        CharacterSpellId = result.CharacterSpellId,
                        ContentId = Convert.ToInt32(result.ContentId),
                        Name = _characterSpellProperties.Name,
                        IsAction = _characterSpellProperties.IsAction,
                        Description = _characterSpellProperties.Discription,
                        TypeId = Convert.ToInt32(_characterSpellProperties.TypeId),
                        Value = Utility.ConvertTypeValueXMLtoClass(_characterSpellProperties.TypeId, _characterSpellProperties.Value, RarityMetadata)
                    });
                }
                else
                {

                    if (_characterSpellProperties.TypeId == 16)
                    {

                        CustomTypes c1 = new CustomTypes();
                        c1.Calculation = new Calculation();
                        c1.Calculation.formulae = "[Weight]*[Quantity]";
                        //Calculation c1 = new Calculation();
                        //c1.formulae = 
                        _characterSpellsproperties.Add(new CharacterSpellsProperties()
                        {
                            CharacterSpellValueId = Convert.ToInt32(_characterSpellProperties.Id),
                            CharacterSpellId = result.CharacterSpellId,
                            ContentId = Convert.ToInt32(result.ContentId),
                            Name = _characterSpellProperties.Name,
                            IsAction = _characterSpellProperties.IsAction,
                            Description = _characterSpellProperties.Discription,
                            TypeId = Convert.ToInt32(_characterSpellProperties.TypeId),
                            Value = c1
                        });

                    }
                    else
                    {
                        _characterSpellsproperties.Add(new CharacterSpellsProperties()
                        {
                            CharacterSpellValueId = Convert.ToInt32(_characterSpellProperties.Id),
                            CharacterSpellId = result.CharacterSpellId,
                            ContentId = Convert.ToInt32(result.ContentId),
                            Name = _characterSpellProperties.Name,
                            IsAction = _characterSpellProperties.IsAction,
                            Description = _characterSpellProperties.Discription,
                            TypeId = Convert.ToInt32(_characterSpellProperties.TypeId),
                            Value = Utility.ConvertTypeValueXMLtoClass(_characterSpellProperties.TypeId, _characterSpellProperties.Value, _characterSpellProperties.Units)
                        });

                    }


                }


            }

            _characterSpells = new CharacterSpells()
            {
                CharacterProfileId = Convert.ToInt32(result.CharacterProfileId),
                CharacterSpellId = result.CharacterSpellId,
                UserId = result.UserId,
                CharacterSpellsProperties = _characterSpellsproperties
            };


            return _characterSpells;
        }

        public CharacterAbilities GetAbilityInventoryByAbilityId(int? AbilityId)
        {

            CharacterAbilities _characterAbility = new CharacterAbilities();

            var result = _context.CharacterAbilities.Where(x => x.CharacterAbilityId == AbilityId).FirstOrDefault();

            if (result == null) return _characterAbility;

            var RarityMetadata = _context.RulesetContentTypes.Where(x => x.ContentType == 1 && x.IsActive == true && x.IsRuleSet == true && x.Id == 7).SingleOrDefault().Metadata;

            List<CharacterAbilitiesProperties> _characterAbilitiesproperties = new List<Web.ViewModels.CharacterAbilitiesProperties>();

            var CharacterAbilityProperties = (from abilityproperties in _context.CharacterAbilityProperties.Where(p => p.CharacterAbilityId == AbilityId)
                                              join rpgtype in _context.RPGSmithTypes on abilityproperties.TypeId equals rpgtype.TypeID
                                              select new { Id = abilityproperties.Id, Name = abilityproperties.Name, Discription = abilityproperties.Description, TypeId = abilityproperties.TypeId, Value = abilityproperties.Value, IsAction = abilityproperties.ISAction, Units = rpgtype.Units }).ToList();

            foreach (var _characterAbilityProperties in CharacterAbilityProperties)
            {

                if (_characterAbilityProperties.Name == "Rarity")
                {
                    _characterAbilitiesproperties.Add(new CharacterAbilitiesProperties()
                    {
                        CharacterAbilityValueId = Convert.ToInt32(_characterAbilityProperties.Id),
                        CharacterAbilityId = result.CharacterAbilityId,
                        ContentId = Convert.ToInt32(result.ContentId),
                        Name = _characterAbilityProperties.Name,
                        IsAction = _characterAbilityProperties.IsAction,
                        Description = _characterAbilityProperties.Discription,
                        TypeId = Convert.ToInt32(_characterAbilityProperties.TypeId),
                        Value = Utility.ConvertTypeValueXMLtoClass(_characterAbilityProperties.TypeId, _characterAbilityProperties.Value, RarityMetadata)
                    });
                }
                else
                {

                    if (_characterAbilityProperties.TypeId == 16)
                    {

                        CustomTypes c1 = new CustomTypes();
                        c1.Calculation = new Calculation();
                        c1.Calculation.formulae = "[Weight]*[Quantity]";
                       _characterAbilitiesproperties.Add(new CharacterAbilitiesProperties()
                        {
                            CharacterAbilityValueId = Convert.ToInt32(_characterAbilityProperties.Id),
                            CharacterAbilityId = result.CharacterAbilityId,
                            ContentId = Convert.ToInt32(result.ContentId),
                            Name = _characterAbilityProperties.Name,
                            IsAction = _characterAbilityProperties.IsAction,
                            Description = _characterAbilityProperties.Discription,
                            TypeId = Convert.ToInt32(_characterAbilityProperties.TypeId),
                            Value = c1
                        });

                    }
                    else
                    {
                        _characterAbilitiesproperties.Add(new CharacterAbilitiesProperties()
                        {
                            CharacterAbilityValueId = Convert.ToInt32(_characterAbilityProperties.Id),
                            CharacterAbilityId = result.CharacterAbilityId,
                            ContentId = Convert.ToInt32(result.ContentId),
                            Name = _characterAbilityProperties.Name,
                            IsAction = _characterAbilityProperties.IsAction,
                            Description = _characterAbilityProperties.Discription,
                            TypeId = Convert.ToInt32(_characterAbilityProperties.TypeId),
                            Value = Utility.ConvertTypeValueXMLtoClass(_characterAbilityProperties.TypeId, _characterAbilityProperties.Value, _characterAbilityProperties.Units)

                        });

                    }


                }


            }

            _characterAbility = new CharacterAbilities()
            {
                CharacterProfileId = Convert.ToInt32(result.CharacterProfileId),
                CharacterAbilityId = result.CharacterAbilityId,
                UserId = result.UserId,
                CharacterAbilitiesProperties = _characterAbilitiesproperties
            };


            return _characterAbility;
        }

        public ServiceResponseModel CreateCharacterInventoryItems(List<CharacterItems> _characterInventoryItems, string userId)
        {

            try
            {
                if (userId != null || userId != "")
                {
                    int resultStatus;
                    string Errors = "";

                    Errors = ValidationForCreateCharacterInventoryItems(_characterInventoryItems, userId, out resultStatus);

                    if (resultStatus == 1)
                    {
                        _serviceResponseModel.ErrorMessage = Errors;
                        _serviceResponseModel.StatusCode = 400;
                        _serviceResponseModel.ShowToUser = true;
                    }
                    else
                    {

                        List<CharacterItems> _characterItems = new List<CharacterItems>();
                        int rowseffected = 0;
                        if (_characterInventoryItems != null)
                        {
                            var virtualPath = string.Empty;
                            foreach (var item in _characterInventoryItems)
                            {
                                CharacterItem _item = new CharacterItem();
                                if (item.CharacterItemId == 0)
                                {
                                    _item.Authored = Convert.ToDateTime(DateTime.Now.ToString());
                                    _item.Edited = Convert.ToDateTime(DateTime.Now.ToString());
                                    _item.CharacterProfileId = item.CharacterProfileId;
                                    _item.ContentId = 0;
                                    _item.UserId = userId;
                                    _context.CharacterItems.Add(_item);

                                    if (item.CharacterItemsProperties != null)
                                    {
                                        foreach (var _itemProperties in item.CharacterItemsProperties)
                                        {
                                            List<CharacterItemProperty> _propertieslist = new List<CharacterItemProperty>();
                                            XmlDocument _tempitemPropertyValue = new XmlDocument();
                                            if (_itemProperties.Value != null)
                                            {
                                                if (_itemProperties.Value.Image != null && _itemProperties.Value.Image.image != null)
                                                {
                                                    if (_itemProperties.Value.Image.image.StartsWith("/wwwroot"))
                                                    {
                                                        virtualPath = _itemProperties.Value.Image.image;
                                                        _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(_itemProperties.TypeId, _itemProperties.Value, virtualPath);
                                                    }
                                                    else
                                                    {
                                                        _itemProperties.Value.Image.image = _itemProperties.Value.Image.image.Replace("data:image/png;base64,", "").Replace("data:image/jpg;base64,", "").Replace("data:image/jpeg;base64,", "");
                                                        byte[] ItemimagewByte = Convert.FromBase64String(_itemProperties.Value.Image.image);
                                                        string virtualPathForFolder = "~/wwwroot/images/RuleSetItemImages/" + item.CharacterItemsProperties[0].Value.Text.value + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                                                        virtualPath = "/wwwroot/images/RuleSetItemImages/" + item.CharacterItemsProperties[0].Value.Text.value + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                                                        var Itemimagephysicalmappath = _itemProperties.Value.Image.image;
                                                        string ItemimagephysicalmappathForFolder = HttpContext.Current.Server.MapPath(virtualPathForFolder);
                                                        Itemimagephysicalmappath = HttpContext.Current.Server.MapPath(virtualPath);
                                                        System.IO.File.WriteAllBytes(ItemimagephysicalmappathForFolder, ItemimagewByte);
                                                        _itemProperties.Value.Image.image = virtualPath;
                                                        _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(_itemProperties.TypeId, _itemProperties.Value, virtualPath);
                                                    }

                                                }
                                                else
                                                {
                                                    _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(_itemProperties.TypeId, _itemProperties.Value, "");
                                                }
                                            }
                                            _item.CharacterItemProperties.Add(new CharacterItemProperty()
                                            {
                                                Name = _itemProperties.Name,
                                                Description = _itemProperties.Description,
                                                CharacterItemId = _item.CharacterItemId,
                                                TypeId = _itemProperties.TypeId,
                                                IsAction = _itemProperties.IsAction,
                                                Value = _tempitemPropertyValue == null ? "" : _tempitemPropertyValue.OuterXml
                                            });
                                        }
                                    }
                                    rowseffected = _context.SaveChanges();
                                }


                                if (item.AssociatedSpells != null)
                                {

                                    foreach (var associatedSpell in item.AssociatedSpells)
                                    {
                                        CharacterItemSpell _characterItemSpell = new CharacterItemSpell();
                                        _characterItemSpell.CharacterItemId = _item.CharacterItemId;
                                        _characterItemSpell.CharacterSpellId = associatedSpell.CharacterSpellId;
                                        _context.CharacterItemSpells.Add(_characterItemSpell);
                                    }
                                }

                                if (item.AssociatedAbilities != null)
                                {

                                    foreach (var associatedAbility in item.AssociatedAbilities)
                                    {
                                        CharacterItemAbility _characterItemAbility = new CharacterItemAbility();
                                        _characterItemAbility.CharacterItemId = item.CharacterItemId;
                                        _characterItemAbility.CharacterAbilityId = associatedAbility.CharacterAbilityId;
                                        _context.CharacterItemAbilities.Add(_characterItemAbility);
                                    }
                                }

                                _characterItems.Add(GetItemInventoryByItemId(_item.CharacterItemId));
                            }



                            rowseffected = _context.SaveChanges();
                        }
                 _serviceResponseModel.Result = _characterItems;
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

        public ServiceResponseModel CreateCharacterInventorySpells(List<CharacterSpells> _characterInventorySpells, string userId)
        {

            try
            {
                if (userId != null || userId != "")
                {
                    int resultStatus;
                    string Errors = "";

                    Errors = ValidationForCreateCharacterInventorySpells(_characterInventorySpells, userId, out resultStatus);

                    if (resultStatus == 1)
                    {
                        _serviceResponseModel.ErrorMessage = Errors;
                        _serviceResponseModel.StatusCode = 400;
                    }
                    else
                    {

                        List<CharacterSpells> _characterSpells = new List<CharacterSpells>();
                        int rowseffected = 0;
                        if (_characterInventorySpells != null)
                        {
                            var virtualPath = string.Empty;
                            foreach (var spell in _characterInventorySpells)
                            {
                                CharacterSpell _spell = new CharacterSpell();
                                if (spell.CharacterSpellId == 0)
                                {
                                    _spell.Authored = Convert.ToDateTime(DateTime.Now.ToString());
                                    _spell.Edited = Convert.ToDateTime(DateTime.Now.ToString());
                                    _spell.CharacterProfileId = spell.CharacterProfileId;
                                    _spell.ContentId = 0;
                                    _spell.UserId = userId;
                                    _context.CharacterSpells.Add(_spell);

                                    if (spell.CharacterSpellsProperties != null)
                                    {
                                        foreach (var _spellProperties in spell.CharacterSpellsProperties)
                                        {
                                            List<CharacterSpellProperty> _propertieslist = new List<CharacterSpellProperty>();
                                            XmlDocument _tempitemPropertyValue = new XmlDocument();
                                            if (_spellProperties.Value != null)
                                            {
                                                if (_spellProperties.Value.Image != null && _spellProperties.Value.Image.image != null)
                                                {
                                                    if (_spellProperties.Value.Image.image.StartsWith("/wwwroot"))
                                                    {
                                                        virtualPath = _spellProperties.Value.Image.image;
                                                        _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(_spellProperties.TypeId, _spellProperties.Value, virtualPath);
                                                    }
                                                    else
                                                    {
                                                        _spellProperties.Value.Image.image = _spellProperties.Value.Image.image.Replace("data:image/png;base64,", "").Replace("data:image/jpg;base64,", "").Replace("data:image/jpeg;base64,", "");
                                                        byte[] ItemimagewByte = Convert.FromBase64String(_spellProperties.Value.Image.image);
                                                        string virtualPathForFolder = "~/wwwroot/images/RuleSetItemImages/" + spell.CharacterSpellsProperties[0].Value.Text.value + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                                                        virtualPath = "/wwwroot/images/RuleSetItemImages/" + spell.CharacterSpellsProperties[0].Value.Text.value + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                                                        var Itemimagephysicalmappath = _spellProperties.Value.Image.image;
                                                        string ItemimagephysicalmappathForFolder = HttpContext.Current.Server.MapPath(virtualPathForFolder);
                                                        Itemimagephysicalmappath = HttpContext.Current.Server.MapPath(virtualPath);
                                                        System.IO.File.WriteAllBytes(ItemimagephysicalmappathForFolder, ItemimagewByte);
                                                        _spellProperties.Value.Image.image = virtualPath;
                                                        _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(_spellProperties.TypeId, _spellProperties.Value, virtualPath);
                                                    }

                                                }
                                                else
                                                {
                                                    _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(_spellProperties.TypeId, _spellProperties.Value, "");
                                                }
                                            }
                                            _spell.CharacterSpellProperties.Add(new CharacterSpellProperty()
                                            {
                                                Name = _spellProperties.Name,
                                                Description = _spellProperties.Description,
                                                CharacterSpellId = _spell.CharacterSpellId,
                                                TypeId = _spellProperties.TypeId,
                                                IsAction = _spellProperties.IsAction,
                                                Value = _tempitemPropertyValue == null ? "" : _tempitemPropertyValue.OuterXml
                                            });
                                        }
                                    }
                                    rowseffected = _context.SaveChanges();
                                }
                                _characterSpells.Add(GetSpellInventoryBySpellId(_spell.CharacterSpellId));
                            }
                            rowseffected = _context.SaveChanges();
                        }


                        _serviceResponseModel.Result = _characterSpells;
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

        public ServiceResponseModel CreateCharacterInventoryAbility(List<CharacterAbilities> _characterInventoryAbility, string userId)
        {

            try
            {
                if (userId != null || userId != "")
                {
                    int resultStatus;
                    string Errors = "";

                    Errors = ValidationForCreateCharacterInventoryAbilitys(_characterInventoryAbility, userId, out resultStatus);

                    if (resultStatus == 1)
                    {
                        _serviceResponseModel.ErrorMessage = Errors;
                        _serviceResponseModel.StatusCode = 400;
                    }
                    else
                    {
                        List<CharacterAbilities> _characterabilities = new List<CharacterAbilities>();
                        int rowseffected = 0;
                        if (_characterInventoryAbility != null)
                        {
                            var virtualPath = string.Empty;
                            foreach (var ability in _characterInventoryAbility)
                            {
                                CharacterAbility _ability = new CharacterAbility();
                                if (ability.CharacterAbilityId == 0)
                                {
                                    _ability.Authored = Convert.ToDateTime(DateTime.Now.ToString());
                                    _ability.Edited = Convert.ToDateTime(DateTime.Now.ToString());
                                    _ability.CharacterProfileId = ability.CharacterProfileId;
                                    _ability.ContentId = 0;
                                    _ability.UserId = userId;
                                    _context.CharacterAbilities.Add(_ability);

                                    if (ability.CharacterAbilitiesProperties != null)
                                    {
                                        foreach (var _itemProperties in ability.CharacterAbilitiesProperties)
                                        {
                                            XmlDocument _tempitemPropertyValue = new XmlDocument();
                                            if (_itemProperties.Value != null)
                                            {
                                                if (_itemProperties.Value.Image != null && _itemProperties.Value.Image.image != null)
                                                {
                                                    if (_itemProperties.Value.Image.image.StartsWith("/wwwroot"))
                                                    {
                                                        virtualPath = _itemProperties.Value.Image.image;
                                                        _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(_itemProperties.TypeId, _itemProperties.Value, virtualPath);
                                                    }
                                                    else
                                                    {
                                                        _itemProperties.Value.Image.image = _itemProperties.Value.Image.image.Replace("data:image/png;base64,", "").Replace("data:image/jpg;base64,", "").Replace("data:image/jpeg;base64,", "");
                                                        byte[] ItemimagewByte = Convert.FromBase64String(_itemProperties.Value.Image.image);
                                                        string virtualPathForFolder = "~/wwwroot/images/RuleSetItemImages/" + ability.CharacterAbilitiesProperties[0].Value.Text.value + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                                                        virtualPath = "/wwwroot/images/RuleSetItemImages/" + ability.CharacterAbilitiesProperties[0].Value.Text.value + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                                                        var Itemimagephysicalmappath = _itemProperties.Value.Image.image;
                                                        string ItemimagephysicalmappathForFolder = HttpContext.Current.Server.MapPath(virtualPathForFolder);
                                                        Itemimagephysicalmappath = HttpContext.Current.Server.MapPath(virtualPath);
                                                        System.IO.File.WriteAllBytes(ItemimagephysicalmappathForFolder, ItemimagewByte);
                                                        _itemProperties.Value.Image.image = virtualPath;
                                                        _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(_itemProperties.TypeId, _itemProperties.Value, virtualPath);
                                                    }

                                                }
                                                else
                                                {
                                                    _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(_itemProperties.TypeId, _itemProperties.Value, "");
                                                }
                                            }
                                            _ability.CharacterAbilityProperties.Add(new CharacterAbilityProperty()
                                            {
                                                Name = _itemProperties.Name,
                                                Description = _itemProperties.Description,
                                                CharacterAbilityId = _ability.CharacterAbilityId,
                                                TypeId = _itemProperties.TypeId,
                                                ISAction = _itemProperties.IsAction,
                                                Value = _tempitemPropertyValue == null ? "" : _tempitemPropertyValue.OuterXml
                                            });
                                        }
                                    }
                                    rowseffected = _context.SaveChanges();
                                }
                                _characterabilities.Add(GetAbilityInventoryByAbilityId(_ability.CharacterAbilityId));
                            }
                            rowseffected = _context.SaveChanges();
                        }


                        _serviceResponseModel.Result = _characterabilities;
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

        public ServiceResponseModel CreateInventoryItemTiles(List<CharacterItems> _characterInventoryItems, string userId)
        {

            try
            {
                if (userId != null || userId != "")
                {

                    ChaacterContents characterContent = new ChaacterContents();
                    characterContent.CharacterItems = _characterInventoryItems;
                    foreach (var item in characterContent.CharacterItems)
                    {
                        item.UserId = userId;
                    }
                    SaveInventoryTiles(characterContent, userId);
                    _serviceResponseModel.Result = characterContent;
                    _serviceResponseModel.StatusCode = 200;
                }

            }
            catch (Exception ex)
            {
                _serviceResponseModel.ErrorMessage = ex.Message;
                _serviceResponseModel.StatusCode = 500;
            }

            return _serviceResponseModel;

        }

        public ServiceResponseModel CreateInventorySpellTiles(List<CharacterSpells> _characterInventorySpells, string userId)
        {

            try
            {
                if (userId != null || userId != "")
                {

                    ChaacterContents characterContent = new ChaacterContents();
                    characterContent.CharacterSpells = _characterInventorySpells;
                    foreach (var spell in characterContent.CharacterSpells)
                    {
                        spell.UserId = userId;
                    }
                    SaveInventoryTiles(characterContent, userId);
                    _serviceResponseModel.Result = characterContent;
                    _serviceResponseModel.StatusCode = 200;
                }

            }
            catch (Exception ex)
            {
                _serviceResponseModel.ErrorMessage = ex.Message;
                _serviceResponseModel.StatusCode = 500;
            }

            return _serviceResponseModel;

     }

        public ServiceResponseModel CreateInventoryAbilityTiles(List<CharacterAbilities> _characterInventoryAbility, string userId)
        {

            try
            {
                if (userId != null || userId != "")
                {

                    ChaacterContents characterContent = new ChaacterContents();
                    characterContent.CharacterAbilities = _characterInventoryAbility;
                    foreach (var ability in characterContent.CharacterAbilities)
                    {
                        ability.UserId = userId;
                    }
                    SaveInventoryTiles(characterContent, userId);
                    _serviceResponseModel.Result = characterContent;
                    _serviceResponseModel.StatusCode = 200;
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
        #region Character Contents
        public ServiceResponseModel EditCharacterContentValues(CharacterContent _characterContent, string userId)
        {

            try
            {
                if (userId != null || userId != "")
                {
                    int resultStatus;
                    string Errors = "";

                    Errors = ValidationForEditCharacterContentValues(_characterContent, userId, out resultStatus);

                    if (resultStatus == 1)
                    {
                        _serviceResponseModel.ErrorMessage = Errors;
                        _serviceResponseModel.StatusCode = 400;

                    }
                    else
                    {

                        var virtualPath = string.Empty;
                        int rowseffected = 0;
                        if (_characterContent.CharacterItem != null)
                        {
                            var dbresult = _context.CharacterItemProperties.Where(x => x.CharacterItemId == _characterContent.CharacterItem.CharacterItemId).ToList();
                            for (var i = 0; i < dbresult.Count; i++)
                            {
                                var itemvalue = dbresult[i];
                                var charactercontentvalue = _characterContent.CharacterItem.CharacterItemsProperties[i];
                                itemvalue.CharacterItemId = _characterContent.CharacterItem.CharacterItemId;
                                XmlDocument _tempitemPropertyValue = new XmlDocument();
                                if (itemvalue.Id == charactercontentvalue.CharacterItemValueId)
                                {
                                    if (charactercontentvalue.Value != null)
                                    {
                                        if (charactercontentvalue.Value.Image != null && charactercontentvalue.Value.Image.image != null)
                                        {

                                            if (charactercontentvalue.Value.Image.image.StartsWith("/wwwroot"))
                                            {
                                                virtualPath = charactercontentvalue.Value.Image.image;
                                                _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(charactercontentvalue.TypeId, charactercontentvalue.Value, virtualPath);
                                            }
                                            else
                                            {
                                                charactercontentvalue.Value.Image.image = charactercontentvalue.Value.Image.image.Replace("data:image/png;base64,", "").Replace("data:image/jpg;base64,", "").Replace("data:image/jpeg;base64,", "");
                                                byte[] ItemimagewByte = Convert.FromBase64String(charactercontentvalue.Value.Image.image);
                                                string virtualPathForFolder = "~/wwwroot/images/RuleSetItemImages/" + itemvalue.Name + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                                                virtualPath = "/wwwroot/images/RuleSetItemImages/" + itemvalue.Name + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                                                var Itemimagephysicalmappath = charactercontentvalue.Value.Image.image;
                                                string ItemimagephysicalmappathForFolder = HttpContext.Current.Server.MapPath(virtualPathForFolder);
                                                Itemimagephysicalmappath = HttpContext.Current.Server.MapPath(virtualPath);
                                                System.IO.File.WriteAllBytes(ItemimagephysicalmappathForFolder, ItemimagewByte);
                                                charactercontentvalue.Value.Image.image = virtualPath;
                                                _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(charactercontentvalue.TypeId, charactercontentvalue.Value, virtualPath);
                                            }

                                        }
                                        else
                                        {
                                            _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(charactercontentvalue.TypeId, charactercontentvalue.Value, "");

                                        }
                                        if (_tempitemPropertyValue != null)
                                        {
                                            itemvalue.Value = _tempitemPropertyValue.OuterXml;
                                        }
                                    }

                                }

                            }

                            //Deleting the Associated Spells in the Items.

                            var _characterItemId = _characterContent.CharacterItem.CharacterItemId;


                            var _itemSpells = (from characteritemcontent in _context.CharacterItems
                                               join characteritemspell in _context.CharacterItemSpells on characteritemcontent.CharacterItemId equals characteritemspell.CharacterItemId
                                               where characteritemcontent.CharacterItemId == _characterItemId
                                               select characteritemspell).ToList();

                            _context.CharacterItemSpells.RemoveRange(_itemSpells);
                            _context.SaveChanges();

                            if (_characterContent.CharacterItem.AssociatedSpells != null)
                            {

                                foreach (var associatedSpell in _characterContent.CharacterItem.AssociatedSpells)
                                {
                                    CharacterItemSpell _characterItemSpell = new CharacterItemSpell();
                                    _characterItemSpell.CharacterItemId = _characterContent.CharacterItem.CharacterItemId;
                                    _characterItemSpell.CharacterSpellId = associatedSpell.CharacterSpellId;

                                    _context.CharacterItemSpells.Add(_characterItemSpell);
                                }
                            }



                        }
                        else if (_characterContent.CharacterSpell != null)
                        {
                            var dbresult = _context.CharacterSpellProperties.Where(x => x.CharacterSpellId == _characterContent.CharacterSpell.CharacterSpellId).ToList();
                            for (var i = 0; i < dbresult.Count; i++)
                            {
                                var spellvalue = dbresult[i];
                                var characterspellcontentvalue = _characterContent.CharacterSpell.CharacterSpellsProperties[i];
                                spellvalue.CharacterSpellId = _characterContent.CharacterSpell.CharacterSpellId;
                                XmlDocument _tempitemPropertyValue = new XmlDocument();
                                if (spellvalue.Id == characterspellcontentvalue.CharacterSpellValueId)
                                {
                                    if (characterspellcontentvalue.Value != null)
                                    {
                                        if (characterspellcontentvalue.Value.Image != null && characterspellcontentvalue.Value.Image.image != null)
                                        {
                                            var ItemImage = Utility.ConvertTypeValueXMLtoClass(8, spellvalue.Value, "");
                                            if (ItemImage.Image.image == characterspellcontentvalue.Value.Image.image)
                                            {
                                                _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(characterspellcontentvalue.TypeId, characterspellcontentvalue.Value, virtualPath);
                                            }
                                            else if (ItemImage.Image.image != characterspellcontentvalue.Value.Image.image)
                                            {
                                                characterspellcontentvalue.Value.Image.image = characterspellcontentvalue.Value.Image.image.Replace("data:image/png;base64,", "").Replace("data:image/jpg;base64,", "").Replace("data:image/jpeg;base64,", "");
                                                byte[] ItemimagewByte = Convert.FromBase64String(characterspellcontentvalue.Value.Image.image);
                                                string virtualPathForFolder = "~/wwwroot/images/RuleSetItemImages/" + spellvalue.Name + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                                                virtualPath = "/wwwroot/images/RuleSetItemImages/" + spellvalue.Name + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                                                var Itemimagephysicalmappath = characterspellcontentvalue.Value.Image.image;
                                                string ItemimagephysicalmappathForFolder = HttpContext.Current.Server.MapPath(virtualPathForFolder);
                                                Itemimagephysicalmappath = HttpContext.Current.Server.MapPath(virtualPath);
                                                System.IO.File.WriteAllBytes(ItemimagephysicalmappathForFolder, ItemimagewByte);
                                                characterspellcontentvalue.Value.Image.image = virtualPath;
                                                _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(characterspellcontentvalue.TypeId, characterspellcontentvalue.Value, virtualPath);
                                            }

                                        }
                                        else
                                        {
                                            _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(characterspellcontentvalue.TypeId, characterspellcontentvalue.Value, "");

                                        }
                                        if (_tempitemPropertyValue != null)
                                        {
                                            spellvalue.Value = _tempitemPropertyValue.OuterXml;
                                        }
                                    }

                                }

                            }
                        }
                        else if (_characterContent.CharacterAbility != null)
                        {
                            var dbresult = _context.CharacterAbilityProperties.Where(x => x.CharacterAbilityId == _characterContent.CharacterAbility.CharacterAbilityId).ToList();
                            for (var i = 0; i < dbresult.Count; i++)
                            {
                                var abilityvalue = dbresult[i];
                                var characterabilitycontentvalue = _characterContent.CharacterAbility.CharacterAbilitiesProperties[i];
                                abilityvalue.CharacterAbilityId = _characterContent.CharacterAbility.CharacterAbilityId;
                                XmlDocument _tempitemPropertyValue = new XmlDocument();
                                if (abilityvalue.Id == characterabilitycontentvalue.CharacterAbilityValueId)
                                {
                                    if (characterabilitycontentvalue.Value != null)
                                    {
                                        if (characterabilitycontentvalue.Value.Image != null && characterabilitycontentvalue.Value.Image.image != null)
                                        {
                                            var ItemImage = Utility.ConvertTypeValueXMLtoClass(8, abilityvalue.Value, "");
                                            if (ItemImage.Image.image == characterabilitycontentvalue.Value.Image.image)
                                            {
                                                _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(characterabilitycontentvalue.TypeId, characterabilitycontentvalue.Value, virtualPath);
                                            }
                                            if (ItemImage.Image.image != characterabilitycontentvalue.Value.Image.image)
                                            {
                                                characterabilitycontentvalue.Value.Image.image = characterabilitycontentvalue.Value.Image.image.Replace("data:image/png;base64,", "").Replace("data:image/jpg;base64,", "").Replace("data:image/jpeg;base64,", "");
                                                byte[] ItemimagewByte = Convert.FromBase64String(characterabilitycontentvalue.Value.Image.image);
                                                string virtualPathForFolder = "~/wwwroot/images/RuleSetAbilitiesImages/" + characterabilitycontentvalue.Name + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                                                virtualPath = "/wwwroot/images/RuleSetAbilitiesImages/" + characterabilitycontentvalue.Name + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                                                var Itemimagephysicalmappath = characterabilitycontentvalue.Value.Image.image;
                                                string ItemimagephysicalmappathForFolder = HttpContext.Current.Server.MapPath(virtualPathForFolder);
                                                Itemimagephysicalmappath = HttpContext.Current.Server.MapPath(virtualPath);
                                                System.IO.File.WriteAllBytes(ItemimagephysicalmappathForFolder, ItemimagewByte);
                                                characterabilitycontentvalue.Value.Image.image = virtualPath;
                                                _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(characterabilitycontentvalue.TypeId, characterabilitycontentvalue.Value, virtualPath);
                                            }

                                        }
                                        else
                                        {
                                            _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(characterabilitycontentvalue.TypeId, characterabilitycontentvalue.Value, "");

                                        }
                                        if (_tempitemPropertyValue != null)
                                        {
                                            abilityvalue.Value = _tempitemPropertyValue.OuterXml;
                                        }
                                    }

                                }

                            }
                        }
                        rowseffected = _context.SaveChanges();
                        // return _characterContent;

                        _serviceResponseModel.Result = _characterContent;
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
        public ServiceResponseModel CopyCharacterContentValues(CharacterContent _characterContent, string userId)
        {

            try
            {
                if (userId != null || userId != "")
                {
                    int resultStatus;
                    string Errors = "";

                    Errors = ValidationForCopyCharacterContentValues(_characterContent, userId, out resultStatus);

                    if (resultStatus == 1)
                    {
                        _serviceResponseModel.ErrorMessage = Errors;
                        _serviceResponseModel.StatusCode = 400;
                    }
                    else
                    {
                        int rowseffected = 0;
                        string virtualPath = "";
                        CharacterContent _characterresultContent = new CharacterContent();
                        if (_characterContent.CharacterItem != null)
                        {
                            CharacterItem item = new CharacterItem();
                            CharacterItemProperty property = new CharacterItemProperty();
                            List<CharacterItemProperty> propertylist = new List<CharacterItemProperty>();
                            var CharacterItemValue = "";
                            item.CharacterProfileId = _characterContent.CharacterItem.CharacterProfileId;
                            item.UserId = _characterContent.CharacterItem.UserId;
                            item.ContentId = _characterContent.CharacterItem.ContentId;
                            item.Authored = Convert.ToDateTime(DateTime.Now.ToString());
                            item.Edited = Convert.ToDateTime(DateTime.Now.ToString());
                            _context.CharacterItems.Add(item);

                            foreach (var values in _characterContent.CharacterItem.CharacterItemsProperties)
                            {

                                XmlDocument _tempitemPropertyValue = new XmlDocument();
                                if (values.Value != null)
                                {

                                    if (values.Value.Image != null && values.Value.Image.image != null)
                                    {
                                        if (values.Value.Image.image.StartsWith("/wwwroot"))
                                        {
                                            virtualPath = values.Value.Image.image;
                                            _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(values.TypeId, values.Value, virtualPath);
                                        }
                                        else
                                        {
                                            values.Value.Image.image = values.Value.Image.image.Replace("data:image/png;base64,", "").Replace("data:image/jpg;base64,", "").Replace("data:image/jpeg;base64,", "");
                                            byte[] ItemimagewByte = Convert.FromBase64String(values.Value.Image.image);
                                            string virtualPathForFolder = "~/wwwroot/images/RuleSetItemImages/" + values.Name + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                                            virtualPath = "/wwwroot/images/RuleSetItemImages/" + values.Name + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                                            var Itemimagephysicalmappath = values.Value.Image.image;
                                            string ItemimagephysicalmappathForFolder = HttpContext.Current.Server.MapPath(virtualPathForFolder);
                                            Itemimagephysicalmappath = HttpContext.Current.Server.MapPath(virtualPath);
                                            System.IO.File.WriteAllBytes(ItemimagephysicalmappathForFolder, ItemimagewByte);
                                            values.Value.Image.image = virtualPath;
                                            _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(values.TypeId, values.Value, virtualPath);
                                        }
                                    }
                                    else
                                    {
                                        _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(values.TypeId, values.Value, "");
                                    }
                                }
                                if (_tempitemPropertyValue != null)
                                {
                                    CharacterItemValue = _tempitemPropertyValue.OuterXml;
                                }
                                else
                                {
                                    CharacterItemValue = null;
                                }
                                item.CharacterItemProperties.Add(new CharacterItemProperty()
                                {

                                    CharacterItemId = item.CharacterItemId,
                                    Name = values.Name,
                                    Description = values.Description,
                                    TypeId = values.TypeId,
                                    IsAction = values.IsAction,
                                    Value = CharacterItemValue

                                });
                            }
                            rowseffected = _context.SaveChanges();

                            if (_characterContent.CharacterItem.AssociatedSpells != null)
                            {

                                foreach (var associatedSpell in _characterContent.CharacterItem.AssociatedSpells)
                                {
                                    CharacterItemSpell _characterItemSpell = new CharacterItemSpell();
                                    _characterItemSpell.CharacterItemId = _characterContent.CharacterItem.CharacterItemId;
                                    _characterItemSpell.CharacterSpellId = associatedSpell.CharacterSpellId;
                                    _context.CharacterItemSpells.Add(_characterItemSpell);
                                }
                            }

                            if (_characterContent.CharacterItem.AssociatedAbilities != null)
                            {

                                foreach (var associatedAbility in _characterContent.CharacterItem.AssociatedAbilities)
                                {
                                    CharacterItemSpell _characterItemSpell = new CharacterItemSpell();
                                    _characterItemSpell.CharacterItemId = _characterContent.CharacterItem.CharacterItemId;
                                    _characterItemSpell.CharacterSpellId = associatedAbility.CharacterAbilityId;
                                    _context.CharacterItemSpells.Add(_characterItemSpell);
                                }
                            }

                            _characterresultContent.CharacterItem = GetItemInventoryByItemId(item.CharacterItemId);
                        }
                        else if (_characterContent.CharacterSpell != null)
                        {
                            CharacterSpell spell = new CharacterSpell();
                            CharacterSpellProperty spellproperty = new CharacterSpellProperty();
                            List<CharacterSpellProperty> spellpropertylist = new List<CharacterSpellProperty>();
                            var CharacterspellValue = "";
                            spell.CharacterProfileId = _characterContent.CharacterSpell.CharacterProfileId;
                            spell.UserId = _characterContent.CharacterSpell.UserId;
                            spell.ContentId = _characterContent.CharacterSpell.ContentId;
                            spell.Authored = Convert.ToDateTime(DateTime.Now.ToString());
                            spell.Edited = Convert.ToDateTime(DateTime.Now.ToString());
                            _context.CharacterSpells.Add(spell);

                            foreach (var spellvalues in _characterContent.CharacterSpell.CharacterSpellsProperties)
                            {
                                XmlDocument _tempitemPropertyValue = new XmlDocument();
                                if (spellvalues.Value != null)
                                {

                                    if (spellvalues.Value.Image != null && spellvalues.Value.Image.image != null)
                                    {
                                        if (spellvalues.Value.Image.image.StartsWith("/wwwroot"))
                                        {
                                            virtualPath = spellvalues.Value.Image.image;
                                            _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(spellvalues.TypeId, spellvalues.Value, virtualPath);
                                        }
                                        else
                                        {
                                            spellvalues.Value.Image.image = spellvalues.Value.Image.image.Replace("data:image/png;base64,", "").Replace("data:image/jpg;base64,", "").Replace("data:image/jpeg;base64,", "");
                                            byte[] ItemimagewByte = Convert.FromBase64String(spellvalues.Value.Image.image);
                                            string virtualPathForFolder = "~/wwwroot/images/RuleSetItemImages/" + spellvalues.Name + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                                            virtualPath = "/wwwroot/images/RuleSetItemImages/" + spellvalues.Name + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                                            var Itemimagephysicalmappath = spellvalues.Value.Image.image;
                                            string ItemimagephysicalmappathForFolder = HttpContext.Current.Server.MapPath(virtualPathForFolder);
                                            Itemimagephysicalmappath = HttpContext.Current.Server.MapPath(virtualPath);
                                            System.IO.File.WriteAllBytes(ItemimagephysicalmappathForFolder, ItemimagewByte);
                                            spellvalues.Value.Image.image = virtualPath;
                                            _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(spellvalues.TypeId, spellvalues.Value, virtualPath);
                                        }
                                    }
                                    else
                                    {
                                        _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(spellvalues.TypeId, spellvalues.Value, "");
                                    }
                                }
                                if (_tempitemPropertyValue != null)
                                {
                                    CharacterspellValue = _tempitemPropertyValue.OuterXml;
                                }
                                else
                                {
                                    CharacterspellValue = null;
                                }
                                spell.CharacterSpellProperties.Add(new CharacterSpellProperty()
                                {

                                    CharacterSpellId = spell.CharacterSpellId,
                                    Name = spellvalues.Name,
                                    Description = spellvalues.Description,
                                    TypeId = spellvalues.TypeId,
                                    IsAction = spellvalues.IsAction,
                                    Value = CharacterspellValue

                                });

                            }
                            rowseffected = _context.SaveChanges();
                            _characterresultContent.CharacterSpell = GetSpellInventoryBySpellId(spell.CharacterSpellId);
                        }
                        else if (_characterContent.CharacterAbility != null)
                        {
                            CharacterAbility ability = new CharacterAbility();
                            CharacterAbilityProperty abilityproperty = new CharacterAbilityProperty();
                            List<CharacterAbilityProperty> abilitypropertylist = new List<CharacterAbilityProperty>();
                            var CharacterabilityValue = "";
                            ability.CharacterProfileId = _characterContent.CharacterAbility.CharacterProfileId;
                            ability.UserId = _characterContent.CharacterAbility.UserId;
                            ability.ContentId = _characterContent.CharacterAbility.ContentId;
                            ability.Authored = Convert.ToDateTime(DateTime.Now.ToString());
                            ability.Edited = Convert.ToDateTime(DateTime.Now.ToString());
                            _context.CharacterAbilities.Add(ability);
                            foreach (var abilityvalues in _characterContent.CharacterAbility.CharacterAbilitiesProperties)
                            {
                                XmlDocument _tempitemPropertyValue = new XmlDocument();
                                if (abilityvalues.Value != null)
                                {

                                    if (abilityvalues.Value.Image != null && abilityvalues.Value.Image.image != null)
                                    {
                                        if (abilityvalues.Value.Image.image.StartsWith("/wwwroot"))
                                        {
                                            virtualPath = abilityvalues.Value.Image.image;
                                            _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(abilityvalues.TypeId, abilityvalues.Value, virtualPath);
                                        }
                                        else
                                        {
                                            abilityvalues.Value.Image.image = abilityvalues.Value.Image.image.Replace("data:image/png;base64,", "").Replace("data:image/jpg;base64,", "").Replace("data:image/jpeg;base64,", "");
                                            byte[] ItemimagewByte = Convert.FromBase64String(abilityvalues.Value.Image.image);
                                            string virtualPathForFolder = "~/wwwroot/images/RuleSetItemImages/" + abilityvalues.Name + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                                            virtualPath = "/wwwroot/images/RuleSetItemImages/" + abilityvalues.Name + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".jpg";
                                            var Itemimagephysicalmappath = abilityvalues.Value.Image.image;
                                            string ItemimagephysicalmappathForFolder = HttpContext.Current.Server.MapPath(virtualPathForFolder);
                                            Itemimagephysicalmappath = HttpContext.Current.Server.MapPath(virtualPath);
                                            System.IO.File.WriteAllBytes(ItemimagephysicalmappathForFolder, ItemimagewByte);
                                            abilityvalues.Value.Image.image = virtualPath;
                                            _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(abilityvalues.TypeId, abilityvalues.Value, virtualPath);
                                        }
                                    }
                                    else
                                    {
                                        _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(abilityvalues.TypeId, abilityvalues.Value, "");
                                    }
                                }
                                if (_tempitemPropertyValue != null)
                                {
                                    CharacterabilityValue = _tempitemPropertyValue.OuterXml;
                                }
                                else
                                {
                                    CharacterabilityValue = null;
                                }
                                ability.CharacterAbilityProperties.Add(new CharacterAbilityProperty()
                                {

                                    CharacterAbilityId = ability.CharacterAbilityId,
                                    Name = abilityvalues.Name,
                                    Description = abilityvalues.Description,
                                    TypeId = abilityvalues.TypeId,
                                    ISAction = abilityvalues.IsAction,
                                    Value = CharacterabilityValue

                                });

                            }
                            rowseffected = _context.SaveChanges();
                            _characterresultContent.CharacterAbility = GetAbilityInventoryByAbilityId(ability.CharacterAbilityId);
                        }


                        _serviceResponseModel.Result = _characterContent;
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
        public ServiceResponseModel DeleteCharacterItemContentValues(int CharacterItemId, string userId)
        {

            try
            {
                if (userId != null || userId != "")
                {
                    int resultStatus;
                    string Errors = "";

                    Errors = ValidationForDeleteCharacterItemContentValues(CharacterItemId, userId, out resultStatus);

                    if (resultStatus == 1)
                    {
                        _serviceResponseModel.ErrorMessage = Errors;
                        _serviceResponseModel.StatusCode = 400;
                    }
                    else
                    {

                        var dbresult = _context.CharacterItemProperties.Where(x => x.CharacterItemId == CharacterItemId).ToList();
                        var dbitemresult = _context.CharacterItems.Where(x => x.CharacterItemId == CharacterItemId).FirstOrDefault();
                        foreach (var item in dbresult)
                        {
                            _context.CharacterItemProperties.Remove(item);
                        }

                        _context.CharacterItems.Remove(dbitemresult);
                        _context.SaveChanges();
                        //return "Item Deleted Successfully";

                        _serviceResponseModel.Result = "Item Deleted Successfully";
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
        public ServiceResponseModel DeleteCharacterSpellContentValues(int CharacterSpellId, string userId)
        {

            try
            {
                if (userId != null || userId != "")
                {
                    int resultStatus;
                    string Errors = "";

                    Errors = ValidationForDeleteCharacterSpellContentValues(CharacterSpellId, userId, out resultStatus);

                    if (resultStatus == 1)
                    {
                        _serviceResponseModel.ErrorMessage = Errors;
                        _serviceResponseModel.StatusCode = 400;
                    }
                    else
                    {

                        var dbresult = _context.CharacterSpellProperties.Where(x => x.CharacterSpellId == CharacterSpellId).ToList();
                        var dbspellresult = _context.CharacterSpells.Where(x => x.CharacterSpellId == CharacterSpellId).FirstOrDefault();
                        foreach (var spell in dbresult)
                        {
                            _context.CharacterSpellProperties.Remove(spell);
                        }

                        _context.CharacterSpells.Remove(dbspellresult);
                        _context.SaveChanges();

                        _serviceResponseModel.Result = "Spell Deleted Successfully";
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
        public ServiceResponseModel DeleteCharacterAbilityContentValues(int CharacterAbilityId, string userId)
        {

            try
            {
                if (userId != null || userId != "")
                {
                    int resultStatus;
                    string Errors = "";

                    Errors = ValidationForDeleteCharacterAbilityContentValues(CharacterAbilityId, userId, out resultStatus);

                    if (resultStatus == 1)
                    {
                        _serviceResponseModel.ErrorMessage = Errors;
                        _serviceResponseModel.StatusCode = 400;
                    }
                    else
                    {

                        var dbresult = _context.CharacterAbilityProperties.Where(x => x.CharacterAbilityId == CharacterAbilityId).ToList();
                        var dbabilityresult = _context.CharacterAbilities.Where(x => x.CharacterAbilityId == CharacterAbilityId).FirstOrDefault();
                        foreach (var ability in dbresult)
                        {
                            _context.CharacterAbilityProperties.Remove(ability);
                        }

                        _context.CharacterAbilities.Remove(dbabilityresult);
                        _context.SaveChanges();
                        _serviceResponseModel.Result = "Ability Deleted Successfully";
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
        public string UpdateItemEquipContent(CharacterItemsProperties _CharacterItemsValues)
        {
            var dbresult = _context.CharacterItemProperties.Where(x => x.Id == _CharacterItemsValues.CharacterItemValueId).FirstOrDefault();
            XmlDocument _tempitemPropertyValue = new XmlDocument();
            dbresult.Id = _CharacterItemsValues.CharacterItemValueId;
            _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(_CharacterItemsValues.TypeId, _CharacterItemsValues.Value, "");
            dbresult.Value = _tempitemPropertyValue.OuterXml;
            _context.SaveChanges();
            return "ItemContent Updated Successfully";

        }
        public string UpdateSpellMemorizeContent(CharacterSpellsProperties _CharacterSpellValues)
        {
            var dbresult = _context.CharacterSpellProperties.Where(x => x.Id == _CharacterSpellValues.CharacterSpellValueId).FirstOrDefault();
            XmlDocument _tempitemPropertyValue = new XmlDocument();
            dbresult.Id = _CharacterSpellValues.CharacterSpellValueId;
            _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(_CharacterSpellValues.TypeId, _CharacterSpellValues.Value, "");
            dbresult.Value = _tempitemPropertyValue.OuterXml;
            _context.SaveChanges();
            return "SpellContent Updated Successfully";

        }
        public string UpdateAbilityEnabledContent(CharacterAbilitiesProperties _CharacterabilityValues)
        {
            var dbresult = _context.CharacterAbilityProperties.Where(x => x.Id == _CharacterabilityValues.CharacterAbilityValueId).FirstOrDefault();
            XmlDocument _tempitemPropertyValue = new XmlDocument();
            dbresult.Id = _CharacterabilityValues.CharacterAbilityValueId;
            _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(_CharacterabilityValues.TypeId, _CharacterabilityValues.Value, "");
            dbresult.Value = _tempitemPropertyValue.OuterXml;
            _context.SaveChanges();
            return "AbilityContent Updated Successfully";

        }
        #endregion
        #region Helper Methods
        private void SaveDefaultLayoutForNewCharacter(LayoutViewModel _layoutViewModel)
        {
            var result = new LayoutService().AddLayout(_layoutViewModel, _layoutViewModel.UserId);
        }

        public HeaderContentCounts GetHeaderContentsCounts(string Userid)
        {
            HeaderContentCounts _headerContentCounts = new HeaderContentCounts();
            _headerContentCounts.TotalCharactersCount = _context.CharacterProfiles.Where(p => p.UserId == Userid).Count();
            _headerContentCounts.TotalRuleSetCount = _context.RuleSets.Where(p => p.UserId == Userid).Count();
            _headerContentCounts.TotalInventoryCount = _context.CharacterItems.Where(p => p.UserId == Userid).Count();
            return _headerContentCounts;
        }

        #endregion
        #region Validations For Character
        /// <summary>
        /// ValidationForNewCharacter: Create Character serverside Validation methord when clicks on Save Button
        /// resultStatus=0  NoError  |  resultStatus=1  Error
        /// </summary>
        /// <param name="Type"></param>
        /// <param name="charactermodel"></param>
        /// <param name="userId"></param>
        /// <param name="validationType"></param>
        /// <returns></returns>
        ///         
        public string ValidationForNewCharacter(CharacterViewModel charactermodel, string userId, out int resultStatus)
        {
            string Errors = "";
            resultStatus = 0; // 0-NoError   1-Error

            if (charactermodel.Name != null && charactermodel.Name != "")
            {
                IEnumerable<CharacterProfile> _character = _context.CharacterProfiles.Where(x => x.UserId == userId && x.Name == charactermodel.Name).ToList();
                if (_character.Count() > 0)
                {
                    Errors = Errors + " Character Name Already Exist ";
                    resultStatus = 1;
                }
            }
            else
            {
                Errors = Errors + " Please Enter CharacterName ";
                resultStatus = 1;
            }

            if (charactermodel.RulesetId <= 0)
            {
                Errors = Errors + " Please Select one Ruleset ";
                resultStatus = 1;
            }
            else
            {
                IEnumerable<RuleSet> _ruleSet = _context.RuleSets.Where(x => x.UserId == userId && x.RulesetID == charactermodel.RulesetId).ToList();
                if (_ruleSet.Count() == 0)
                {
                    Errors = Errors + "Please Select Valid Ruleset ";
                    resultStatus = 1;
                }

            }

            return Errors;
        }

        /// <summary>
        /// ValidationForEditCharacter: Edit Character serverside Validation methord when clicks on Save Button
        /// resultStatus=0  NoError  |  resultStatus=1  Error
        /// </summary>
        /// <param name="charactermodel"></param>
        /// <param name="userId"></param>
        /// <param name="resultStatus"></param>
        /// <returns></returns>
        public string ValidationForEditCharacter(CharacterViewModel charactermodel, string userId, out int resultStatus)
        {
            string Errors = "";
            resultStatus = 0;

            //if (charactermodel.Name != null && charactermodel.Name != "")
            //{
            //    IEnumerable<CharacterProfile> _character = _context.CharacterProfiles.Where(x => x.UserId == userId && x.Name == charactermodel.Name).ToList();
            //    if (_character.Count() != 0)
            //    {
            //        Errors = Errors + "Character Name Already Exist \n";
            //    }
            //}
            //else
            //{
            //    Errors = Errors + "Please Enter CharacterName \n";
            //}

            if (charactermodel.RulesetId != 0)
            {
                IEnumerable<RuleSet> _ruleSet = _context.RuleSets.Where(x => x.UserId == userId && x.RulesetID == charactermodel.RulesetId).ToList();
                if (_ruleSet.Count() == 0)
                {
                    Errors = Errors + "Please Select Valid Ruleset ";
                    resultStatus = 1;
                }
            }
            else
            {
                Errors = Errors + "Please Select Ruleset ";
            }

            return Errors;

        }

        /// <summary>
        /// ValidationForCopyCharacter: Copy Character serverside Validation methord when clicks on Save Button
        /// resultStatus=0  NoError  |  resultStatus=1  Error
        /// </summary>
        /// <param name="charactermodel"></param>
        /// <param name="userId"></param>
        /// <param name="resultStatus"></param>
        /// <returns></returns>
        public string ValidationForCopyCharacter(CharacterViewModel charactermodel, string userId, out int resultStatus)
        {
            string Errors = "";
            resultStatus = 0;

            if (charactermodel.Name != null && charactermodel.Name != "")
            {
                IEnumerable<CharacterProfile> _character = _context.CharacterProfiles.Where(x => x.UserId == userId && x.Name == charactermodel.Name).ToList();
                if (_character.Count() != 0)
                {
                    Errors = Errors + "Character Name Already Exist ";
                    resultStatus = 1;
                }
            }
            else
            {
                Errors = Errors + "Please Enter CharacterName ";
                resultStatus = 1;
            }


            if (charactermodel.RulesetId != 0)
            {
                IEnumerable<RuleSet> _ruleSet = _context.RuleSets.Where(x => x.UserId == userId && x.RulesetID == charactermodel.RulesetId).ToList();
                if (_ruleSet.Count() == 0)
                {
                    Errors = Errors + "Please Select Valid Ruleset \n";
                    resultStatus = 1;
                }
            }
            else
            {
                Errors = Errors + "Please Select Ruleset \n";
                resultStatus = 1;
            }

            return Errors;

        }

        /// <summary>
        /// ValidationForDeleteCharacter: Delete Character serverside Validation methord
        /// resultStatus=0  NoError  |  resultStatus=1  Error
        /// </summary>
        /// <param name="charactermodel"></param>
        /// <param name="userId"></param>
        /// <param name="resultStatus"></param>
        /// <returns></returns>
        public string ValidationForDeleteCharacter(CharacterViewModel charactermodel, string userId, out int resultStatus)
        {
            string Errors = "";
            resultStatus = 0;

            IEnumerable<CharacterProfile> _characterProfiles;
            _characterProfiles = _context.CharacterProfiles.Where(c => c.CharacterProfileId == charactermodel.Id && c.UserId == userId).ToList();
            if (_characterProfiles.Count() == 0)
            {
                Errors = Errors + "Please Select Valid Character ";
                resultStatus = 1;
            }

            return Errors;
        }
        public string ValidationForCreateCharacterInventoryItems(List<CharacterItems> _characterInventoryItems, string userId, out int resultStatus)
        {
            string Errors = "";
            resultStatus = 0; // 0-NoError   1-Error

            if (_characterInventoryItems != null)
            {
                var itemData = _characterInventoryItems[0].CharacterItemsProperties.Where(x => x.Name == "Name" && x.TypeId == 1).ToList();

                string ItemName = "";

                foreach (var Item in itemData)
                {
                    ItemName = Item.Value.Text.value;
                }

                int Typeid = 1;
                int CharacterProfileId = _characterInventoryItems[0].CharacterProfileId;
                var Result = (from _CharacterItemProperties in _context.CharacterItemProperties
                              join _CharacterItems in _context.CharacterItems on _CharacterItemProperties.CharacterItemId equals _CharacterItems.CharacterItemId
                              join _CharacterProfiles in _context.CharacterProfiles on _CharacterItems.CharacterProfileId equals _CharacterProfiles.CharacterProfileId
                              where _CharacterProfiles.CharacterProfileId == CharacterProfileId && _CharacterItemProperties.TypeId == Typeid && _CharacterItemProperties.Name == "Name"
                              select new
                              {
                                  CharacterItemId = _CharacterItemProperties.CharacterItemId,
                                  TypeId = _CharacterItemProperties.TypeId,
                                  Value = _CharacterItemProperties.Value,
                                  IsAction = _CharacterItemProperties.IsAction
                              }).ToList();


                List<CharacterItemsProperties> _characterItemPropertyList = new List<CharacterItemsProperties>();
                foreach (var val in Result)
                {
                    CharacterItemsProperties _characterItemProperty = new CharacterItemsProperties();
                    _characterItemProperty.CharacterItemId = Convert.ToInt32(val.CharacterItemId);
                    _characterItemProperty.Value = Utility.ConvertTypeValueXMLtoClass(val.TypeId, Convert.ToString(val.Value), "");
                    _characterItemPropertyList.Add(_characterItemProperty);
                }

                List<CharacterItemsProperties> _characterItems = _characterItemPropertyList.Where(x => x.Value.Text.value.ToLower() == ItemName.ToLower()).ToList();
                if (_characterItems.Count() > 0)
                {
                    Errors = Errors + "Item Name Already Exist ";
                    resultStatus = 1;
                }

            }

            return Errors;

        }
        public string ValidationForCreateCharacterInventorySpells(List<CharacterSpells> _characterInventorySpells, string userId, out int resultStatus)
        {
            string Errors = "";
            resultStatus = 0; // 0-NoError   1-Error


            if (_characterInventorySpells != null)
            {
                var spellData = _characterInventorySpells[0].CharacterSpellsProperties.Where(x => x.Name == "Name" && x.TypeId == 1).ToList();

                string SpellName = "";

                foreach (var _Spell in spellData)
                {
                    SpellName = _Spell.Value.Text.value;
                }


                int Typeid = 1;
                int CharacterProfileId = _characterInventorySpells[0].CharacterProfileId;



                var Result = (from _CharacterSpellProperties in _context.CharacterSpellProperties
                              join _CharacterSpells in _context.CharacterSpells on _CharacterSpellProperties.CharacterSpellId equals _CharacterSpells.CharacterSpellId
                              join _CharacterProfiles in _context.CharacterProfiles on _CharacterSpells.CharacterProfileId equals _CharacterProfiles.CharacterProfileId
                              where _CharacterProfiles.CharacterProfileId == CharacterProfileId && _CharacterSpellProperties.TypeId == Typeid && _CharacterSpellProperties.Name == "Name"
                              select new
                              {
                                  CharacterSpellId = _CharacterSpellProperties.CharacterSpellId,
                                  TypeId = _CharacterSpellProperties.TypeId,
                                  Value = _CharacterSpellProperties.Value,
                                  IsAction = _CharacterSpellProperties.IsAction
                              }).ToList();


                List<CharacterSpellsProperties> _characterSpellsProperties = new List<CharacterSpellsProperties>();
                foreach (var val in Result)
                {
                    CharacterSpellsProperties _characterSpellsProperty = new CharacterSpellsProperties();
                    _characterSpellsProperty.CharacterSpellId = Convert.ToInt32(val.CharacterSpellId);
                    _characterSpellsProperty.Value = Utility.ConvertTypeValueXMLtoClass(val.TypeId, Convert.ToString(val.Value), "");
                    _characterSpellsProperties.Add(_characterSpellsProperty);

                }

                List<CharacterSpellsProperties> _characterSpells = _characterSpellsProperties.Where(x => x.Value.Text.value.ToLower() == SpellName.ToLower()).ToList();
                if (_characterSpells.Count() > 0)
                {
                    Errors = Errors + "Spell Name Already Exist ";
                    resultStatus = 1;
                }

            }

            return Errors;

        }
        public string ValidationForCreateCharacterInventoryAbilitys(List<CharacterAbilities> _characterInventoryAbilities, string userId, out int resultStatus)
        {
            string Errors = "";
            resultStatus = 0; // 0-NoError   1-Error


            if (_characterInventoryAbilities != null)
            {
                var AbilitieData = _characterInventoryAbilities[0].CharacterAbilitiesProperties.Where(x => x.Name == "Name" && x.TypeId == 1).ToList();

                string AbilitieName = "";

                foreach (var _Abilitie in AbilitieData)
                {
                    AbilitieName = _Abilitie.Value.Text.value;
                }


                int Typeid = 1;
                int CharacterProfileId = _characterInventoryAbilities[0].CharacterProfileId;


                var Result = (from _CharacterAbilityProperties in _context.CharacterAbilityProperties
                              join _CharacterAbilities in _context.CharacterAbilities on _CharacterAbilityProperties.CharacterAbilityId equals _CharacterAbilities.CharacterAbilityId
                              join _CharacterProfiles in _context.CharacterProfiles on _CharacterAbilities.CharacterProfileId equals _CharacterProfiles.CharacterProfileId
                              where _CharacterProfiles.CharacterProfileId == CharacterProfileId && _CharacterAbilityProperties.TypeId == Typeid && _CharacterAbilityProperties.Name == "Name"
                              select new
                              {
                                  CharacterAbilityId = _CharacterAbilityProperties.CharacterAbilityId,
                                  TypeId = _CharacterAbilityProperties.TypeId,
                                  Value = _CharacterAbilityProperties.Value,
                                  IsAction = _CharacterAbilityProperties.ISAction
                              }).ToList();


                List<CharacterAbilitiesProperties> _characterAbilitiesProperties = new List<CharacterAbilitiesProperties>();
                foreach (var val in Result)
                {
                    CharacterAbilitiesProperties _characterAbilitiesProperty = new CharacterAbilitiesProperties();
                    _characterAbilitiesProperty.CharacterAbilityId = Convert.ToInt32(val.CharacterAbilityId);
                    _characterAbilitiesProperty.Value = Utility.ConvertTypeValueXMLtoClass(val.TypeId, Convert.ToString(val.Value), "");
                    _characterAbilitiesProperties.Add(_characterAbilitiesProperty);

                }

                List<CharacterAbilitiesProperties> _characterAbilitie = _characterAbilitiesProperties.Where(x => x.Value.Text.value.ToLower() == AbilitieName.ToLower()).ToList();
                if (_characterAbilitie.Count() > 0)
                {
                    Errors = Errors + "Ability Name Already Exist ";
                    resultStatus = 1;
                }


            }

            return Errors;

        }
        public string ValidationForEditCharacterContentValues(CharacterContent _CharacterContent, string userId, out int resultStatus)
        {
            string Errors = "";
            resultStatus = 0; // 0-NoError   1-Error

            if (_CharacterContent != null)
            {
                int CopyType = 0;
                if (_CharacterContent.CharacterItem != null)
                {

                    CopyType = 1;  //Items
                }
                else if (_CharacterContent.CharacterSpell != null)
                {
                    CopyType = 2;  //Spells
                }
                else if (_CharacterContent.CharacterAbility != null)
                {
                    CopyType = 3; //Abilitys
                }


                switch (CopyType)
                {

                    case 1:

                        var itemData = _CharacterContent.CharacterItem.CharacterItemsProperties.Where(x => x.Name == "Name" && x.TypeId == 1).ToList();
                        string ItemName = "";

                        foreach (var Item in itemData)
                        {
                            ItemName = Item.Value.Text.value;
                        }

                        int ItemTypeId = 1;
                        int ItemCharacterProfileId = _CharacterContent.CharacterItem.CharacterProfileId;


                        var ItemResult = (from _CharacterItemProperties in _context.CharacterItemProperties
                                          join _CharacterItems in _context.CharacterItems on _CharacterItemProperties.CharacterItemId equals _CharacterItems.CharacterItemId
                                          join _CharacterProfiles in _context.CharacterProfiles on _CharacterItems.CharacterProfileId equals _CharacterProfiles.CharacterProfileId
                                          where _CharacterProfiles.CharacterProfileId == ItemCharacterProfileId
                                          && _CharacterItems.CharacterItemId != _CharacterContent.CharacterItem.CharacterItemId
                                          && _CharacterItemProperties.TypeId == ItemTypeId && _CharacterItemProperties.Name == "Name"
                                          select new
                                          {
                                              CharacterItemId = _CharacterItemProperties.CharacterItemId,
                                              TypeId = _CharacterItemProperties.TypeId,
                                              Value = _CharacterItemProperties.Value,
                                              IsAction = _CharacterItemProperties.IsAction
                                          }).ToList();


                        List<CharacterItemsProperties> _characterItemPropertyList = new List<CharacterItemsProperties>();
                        foreach (var val in ItemResult)
                        {
                            CharacterItemsProperties _characterItemProperty = new CharacterItemsProperties();
                            _characterItemProperty.CharacterItemId = Convert.ToInt32(val.CharacterItemId);
                            _characterItemProperty.Value = Utility.ConvertTypeValueXMLtoClass(val.TypeId, Convert.ToString(val.Value), "");
                            _characterItemPropertyList.Add(_characterItemProperty);
                        }

                        List<CharacterItemsProperties> _characterItems = _characterItemPropertyList.Where(x => x.Value.Text.value.ToLower() == ItemName.ToLower()).ToList();
                        if (_characterItems.Count() > 0)
                        {
                            Errors = Errors + "Item Name Already Exist";
                            resultStatus = 1;
                        }


                        break;
                    case 2:

                        var spellData = _CharacterContent.CharacterSpell.CharacterSpellsProperties.Where(x => x.Name == "Name" && x.TypeId == 1).ToList();

                        string SpellName = "";

                        foreach (var _Spell in spellData)
                        {
                            SpellName = _Spell.Value.Text.value;
                        }


                        int SpellTypeId = 1;
                        int SpellCharacterProfileId = _CharacterContent.CharacterSpell.CharacterProfileId;



                        var SpellResult = (from _CharacterSpellProperties in _context.CharacterSpellProperties
                                           join _CharacterSpells in _context.CharacterSpells on _CharacterSpellProperties.CharacterSpellId equals _CharacterSpells.CharacterSpellId
                                           join _CharacterProfiles in _context.CharacterProfiles on _CharacterSpells.CharacterProfileId equals _CharacterProfiles.CharacterProfileId
                                           where _CharacterProfiles.CharacterProfileId == SpellCharacterProfileId
                                             && _CharacterSpells.CharacterSpellId != _CharacterContent.CharacterSpell.CharacterSpellId
                                           && _CharacterSpellProperties.TypeId == SpellTypeId && _CharacterSpellProperties.Name == "Name"
                                           select new
                                           {
                                               CharacterSpellId = _CharacterSpellProperties.CharacterSpellId,
                                               TypeId = _CharacterSpellProperties.TypeId,
                                               Value = _CharacterSpellProperties.Value,
                                               IsAction = _CharacterSpellProperties.IsAction
                                           }).ToList();


                        List<CharacterSpellsProperties> _characterSpellsProperties = new List<CharacterSpellsProperties>();
                        foreach (var val in SpellResult)
                        {
                            CharacterSpellsProperties _characterSpellsProperty = new CharacterSpellsProperties();
                            _characterSpellsProperty.CharacterSpellId = Convert.ToInt32(val.CharacterSpellId);
                            _characterSpellsProperty.Value = Utility.ConvertTypeValueXMLtoClass(val.TypeId, Convert.ToString(val.Value), "");
                            _characterSpellsProperties.Add(_characterSpellsProperty);

                        }

                        List<CharacterSpellsProperties> _characterSpells = _characterSpellsProperties.Where(x => x.Value.Text.value == SpellName).ToList();
                        if (_characterSpells.Count() > 0)
                        {
                            Errors = Errors + "Spell Name Already Exist <br/>";
                            resultStatus = 1;
                        }



                        break;
                    case 3:

                        var AbilitieData = _CharacterContent.CharacterAbility.CharacterAbilitiesProperties.Where(x => x.Name == "Name" && x.TypeId == 1).ToList();

                        string AbilitieName = "";

                        foreach (var _Abilitie in AbilitieData)
                        {
                            AbilitieName = _Abilitie.Value.Text.value;
                        }


                        int AbilitieTypeid = 1;
                        int AbilitieCharacterProfileId = _CharacterContent.CharacterAbility.CharacterProfileId;


                        var ResultAbilite = (from _CharacterAbilityProperties in _context.CharacterAbilityProperties
                                             join _CharacterAbilities in _context.CharacterAbilities on _CharacterAbilityProperties.CharacterAbilityId equals _CharacterAbilities.CharacterAbilityId
                                             join _CharacterProfiles in _context.CharacterProfiles on _CharacterAbilities.CharacterProfileId equals _CharacterProfiles.CharacterProfileId
                                             where _CharacterProfiles.CharacterProfileId == AbilitieCharacterProfileId
                                             && _CharacterAbilities.CharacterAbilityId != _CharacterContent.CharacterAbility.CharacterAbilityId
                                             && _CharacterAbilityProperties.TypeId == AbilitieTypeid && _CharacterAbilityProperties.Name == "Name"
                                             select new
                                             {
                                                 CharacterAbilityId = _CharacterAbilityProperties.CharacterAbilityId,
                                                 TypeId = _CharacterAbilityProperties.TypeId,
                                                 Value = _CharacterAbilityProperties.Value,
                                                 IsAction = _CharacterAbilityProperties.ISAction
                                             }).ToList();


                        List<CharacterAbilitiesProperties> _characterAbilitiesProperties = new List<CharacterAbilitiesProperties>();
                        foreach (var val in ResultAbilite)
                        {
                            CharacterAbilitiesProperties _characterAbilitiesProperty = new CharacterAbilitiesProperties();
                            _characterAbilitiesProperty.CharacterAbilityId = Convert.ToInt32(val.CharacterAbilityId);
                            _characterAbilitiesProperty.Value = Utility.ConvertTypeValueXMLtoClass(val.TypeId, Convert.ToString(val.Value), "");
                            _characterAbilitiesProperties.Add(_characterAbilitiesProperty);

                        }

                        List<CharacterAbilitiesProperties> _characterAbilitie = _characterAbilitiesProperties.Where(x => x.Value.Text.value == AbilitieName).ToList();
                        if (_characterAbilitie.Count() > 0)
                        {
                            Errors = Errors + "Ability Name Already Exist <br/>";
                            resultStatus = 1;
                        }

                        break;
                }

            }

            return Errors;

        }
        public string ValidationForCopyCharacterContentValues(CharacterContent _CharacterContent, string userId, out int resultStatus)
        {
            string Errors = "";
            resultStatus = 0; // 0-NoError   1-Error

            if (_CharacterContent != null)
            {
                int CopyType = 0;
                if (_CharacterContent.CharacterItem != null)
                {

                    CopyType = 1;  //Items
                }
                else if (_CharacterContent.CharacterSpell != null)
                {
                    CopyType = 2;  //Spells
                }
                else if (_CharacterContent.CharacterAbility != null)
                {
                    CopyType = 3; //Abilitys
                }

                switch (CopyType)
                {

                    case 1:

                        var itemData = _CharacterContent.CharacterItem.CharacterItemsProperties.Where(x => x.Name == "Name" && x.TypeId == 1).ToList();
                        string ItemName = "";

                        foreach (var Item in itemData)
                        {
                            ItemName = Item.Value.Text.value;
                        }

                        int ItemTypeId = 1;
                        int ItemCharacterProfileId = _CharacterContent.CharacterItem.CharacterProfileId;


                        var ItemResult = (from _CharacterItemProperties in _context.CharacterItemProperties
                                          join _CharacterItems in _context.CharacterItems on _CharacterItemProperties.CharacterItemId equals _CharacterItems.CharacterItemId
                                          join _CharacterProfiles in _context.CharacterProfiles on _CharacterItems.CharacterProfileId equals _CharacterProfiles.CharacterProfileId
                                          where _CharacterProfiles.CharacterProfileId == ItemCharacterProfileId && _CharacterItemProperties.TypeId == ItemTypeId && _CharacterItemProperties.Name == "Name"
                                          select new
                                          {
                                              CharacterItemId = _CharacterItemProperties.CharacterItemId,
                                              TypeId = _CharacterItemProperties.TypeId,
                                              Value = _CharacterItemProperties.Value,
                                              IsAction = _CharacterItemProperties.IsAction
                                          }).ToList();


                        List<CharacterItemsProperties> _characterItemPropertyList = new List<CharacterItemsProperties>();
                        foreach (var val in ItemResult)
                        {
                            CharacterItemsProperties _characterItemProperty = new CharacterItemsProperties();
                            _characterItemProperty.CharacterItemId = Convert.ToInt32(val.CharacterItemId);
                            _characterItemProperty.Value = Utility.ConvertTypeValueXMLtoClass(val.TypeId, Convert.ToString(val.Value), "");
                            _characterItemPropertyList.Add(_characterItemProperty);
                        }

                        List<CharacterItemsProperties> _characterItems = _characterItemPropertyList.Where(x => x.Value.Text.value.ToLower() == ItemName.ToLower()).ToList();
                        if (_characterItems.Count() > 0)
                        {
                            Errors = Errors + "Item Name Already Exist ";
                            resultStatus = 1;
                        }


                        break;
                    case 2:

                        var spellData = _CharacterContent.CharacterSpell.CharacterSpellsProperties.Where(x => x.Name == "Name" && x.TypeId == 1).ToList();

                        string SpellName = "";

                        foreach (var _Spell in spellData)
                        {
                            SpellName = _Spell.Value.Text.value;
                        }


                        int SpellTypeId = 1;
                        int SpellCharacterProfileId = _CharacterContent.CharacterSpell.CharacterProfileId;



                        var SpellResult = (from _CharacterSpellProperties in _context.CharacterSpellProperties
                                           join _CharacterSpells in _context.CharacterSpells on _CharacterSpellProperties.CharacterSpellId equals _CharacterSpells.CharacterSpellId
                                           join _CharacterProfiles in _context.CharacterProfiles on _CharacterSpells.CharacterProfileId equals _CharacterProfiles.CharacterProfileId
                                           where _CharacterProfiles.CharacterProfileId == SpellCharacterProfileId && _CharacterSpellProperties.TypeId == SpellTypeId && _CharacterSpellProperties.Name == "Name"
                                           select new
                                           {
                                               CharacterSpellId = _CharacterSpellProperties.CharacterSpellId,
                                               TypeId = _CharacterSpellProperties.TypeId,
                                               Value = _CharacterSpellProperties.Value,
                                               IsAction = _CharacterSpellProperties.IsAction
                                           }).ToList();


                        List<CharacterSpellsProperties> _characterSpellsProperties = new List<CharacterSpellsProperties>();
                        foreach (var val in SpellResult)
                        {
                            CharacterSpellsProperties _characterSpellsProperty = new CharacterSpellsProperties();
                            _characterSpellsProperty.CharacterSpellId = Convert.ToInt32(val.CharacterSpellId);
                            _characterSpellsProperty.Value = Utility.ConvertTypeValueXMLtoClass(val.TypeId, Convert.ToString(val.Value), "");
                            _characterSpellsProperties.Add(_characterSpellsProperty);

                        }

                        List<CharacterSpellsProperties> _characterSpells = _characterSpellsProperties.Where(x => x.Value.Text.value == SpellName).ToList();
                        if (_characterSpells.Count() > 0)
                        {
                            Errors = Errors + "Spell Name Already Exist <br/>";
                            resultStatus = 1;
                        }



                        break;
                    case 3:

                        var AbilitieData = _CharacterContent.CharacterAbility.CharacterAbilitiesProperties.Where(x => x.Name == "Name" && x.TypeId == 1).ToList();

                        string AbilitieName = "";

                        foreach (var _Abilitie in AbilitieData)
                        {
                            AbilitieName = _Abilitie.Value.Text.value;
                        }


                        int AbilitieTypeid = 1;
                        int AbilitieCharacterProfileId = _CharacterContent.CharacterAbility.CharacterProfileId;


                        var ResultAbilite = (from _CharacterAbilityProperties in _context.CharacterAbilityProperties
                                             join _CharacterAbilities in _context.CharacterAbilities on _CharacterAbilityProperties.CharacterAbilityId equals _CharacterAbilities.CharacterAbilityId
                                             join _CharacterProfiles in _context.CharacterProfiles on _CharacterAbilities.CharacterProfileId equals _CharacterProfiles.CharacterProfileId
                                             where _CharacterProfiles.CharacterProfileId == AbilitieCharacterProfileId && _CharacterAbilityProperties.TypeId == AbilitieTypeid && _CharacterAbilityProperties.Name == "Name"
                                             select new
                                             {
                                                 CharacterAbilityId = _CharacterAbilityProperties.CharacterAbilityId,
                                                 TypeId = _CharacterAbilityProperties.TypeId,
                                                 Value = _CharacterAbilityProperties.Value,
                                                 IsAction = _CharacterAbilityProperties.ISAction
                                             }).ToList();


                        List<CharacterAbilitiesProperties> _characterAbilitiesProperties = new List<CharacterAbilitiesProperties>();
                        foreach (var val in ResultAbilite)
                        {
                            CharacterAbilitiesProperties _characterAbilitiesProperty = new CharacterAbilitiesProperties();
                            _characterAbilitiesProperty.CharacterAbilityId = Convert.ToInt32(val.CharacterAbilityId);
                            _characterAbilitiesProperty.Value = Utility.ConvertTypeValueXMLtoClass(val.TypeId, Convert.ToString(val.Value), "");
                            _characterAbilitiesProperties.Add(_characterAbilitiesProperty);

                        }

                        List<CharacterAbilitiesProperties> _characterAbilitie = _characterAbilitiesProperties.Where(x => x.Value.Text.value == AbilitieName).ToList();
                        if (_characterAbilitie.Count() > 0)
                        {
                            Errors = Errors + "Ability Name Already Exist <br/>";
                            resultStatus = 1;
                        }

                        break;
                }

            }

            return Errors;

        }
        public string ValidationForDeleteCharacterItemContentValues(int CharacterItemId, string userId, out int resultStatus)
        {
            string Errors = "";
            resultStatus = 0; // 0-NoError   1-Error

            IEnumerable<CharacterItem> _characterItemList;
            _characterItemList = _context.CharacterItems.Where(x => x.CharacterItemId == CharacterItemId && x.UserId == userId).ToList();
            if (_characterItemList.Count() == 0)
            {
                Errors = Errors + "Please Select Valid Item ";
                resultStatus = 1;
            }

            return Errors;

        }
        public string ValidationForDeleteCharacterSpellContentValues(int CharacterSpellId, string userId, out int resultStatus)
        {
            string Errors = "";
            resultStatus = 0; // 0-NoError   1-Error

            IEnumerable<CharacterSpell> _characterSpellList;
            _characterSpellList = _context.CharacterSpells.Where(x => x.CharacterSpellId == CharacterSpellId && x.UserId == userId).ToList();
            if (_characterSpellList.Count() == 0)
            {
                Errors = Errors + "Please Select Valid Spell ";
                resultStatus = 1;
            }

            return Errors;

        }
        public string ValidationForDeleteCharacterAbilityContentValues(int CharacterAbilityId, string userId, out int resultStatus)
        {
            string Errors = "";
            resultStatus = 0; // 0-NoError   1-Error

            IEnumerable<CharacterAbility> _characterAbilityList;
            _characterAbilityList = _context.CharacterAbilities.Where(x => x.CharacterAbilityId == CharacterAbilityId && x.UserId == userId).ToList();
            if (_characterAbilityList.Count() == 0)
            {
                Errors = Errors + "Please Select Valid Ability ";
                resultStatus = 1;
            }

            return Errors;
        }
        private ServiceResponseModel SaveInventoryTiles(ChaacterContents _ChaacterContents, string userId)
        {
            //Saving All 7 Type of Tiles For Items,Spells,Abilities
            ChaacterContents ChaacterContents = new ChaacterContents();
            ServiceResponseModel _tempserviceresponsemodel = new ServiceResponseModel();
            if (_ChaacterContents.CharacterItems != null)
            {
                for (var j = 0; j < _ChaacterContents.CharacterItems.Count; j++)
                {
                    var modelItemProperties = _ChaacterContents.CharacterItems[j].CharacterItemsProperties;
                    for (var m = 0; m < modelItemProperties.Count; m++)
                    {
                        var modelItems = modelItemProperties[m];
                        if (modelItems.tile != null)
                        {
                            if (modelItems.tile.Value != null)
                            {
                                modelItems.tile.TileLocationId = 2;
                                CharacterItemProperty _characterItemProperty = new CharacterItemProperty();
                                if (modelItems.tile.TabId == 0)
                                {

                                    if (modelItems.tile != null)
                                    {
                                        modelItems.tile.UserId = userId;
                                        //Adding Last Item Properties for Tiles
                                        _characterItemProperty.CharacterItemId = _ChaacterContents.CharacterItems[0].CharacterItemId;
                                        _characterItemProperty.TypeId = null;
                                        _characterItemProperty.Value = "";
                                        _context.CharacterItemProperties.Add(_characterItemProperty);
                                        _context.SaveChanges();
                                        modelItems.tile.TabId = Convert.ToInt32(_characterItemProperty.Id != 0 ? _characterItemProperty.Id : modelItems.tile.TabId);
                                        //Saving Tiles

                                        _tempserviceresponsemodel = new TileService().AddOrUpdateTile(modelItems.tile, userId);
                                    }

                                }
                                else
                                {
                                    if (_context.Tiles.Where(p => p.TileContentId == modelItems.CharacterItemValueId).ToList().Count > 0)
                                    {
                                        if (modelItems.tile != null)
                                        {
                                            //Adding or Updating Tiles
                                            modelItems.tile.TileLocationId = 2;
                                            modelItems.tile.UserId = _ChaacterContents.CharacterItems[0].UserId;
                                            _context.SaveChanges();
                                            _tempserviceresponsemodel = new TileService().AddOrUpdateTile(modelItems.tile, userId);
                                        }
                                    }
                                }

                            }
                        }
                    }

                }
            }
            if (_ChaacterContents.CharacterSpells != null)
            {
                for (var j = 0; j < _ChaacterContents.CharacterSpells.Count; j++)
                {
                    var modelSpellProperties = _ChaacterContents.CharacterSpells[j].CharacterSpellsProperties;
                    for (var n = 0; n < modelSpellProperties.Count; n++)
                    {
                        var modelSpells = modelSpellProperties[n];
                        if (modelSpells.tile != null)
                        {
                            if (modelSpells.tile.Value != null)
                            {
                                modelSpells.tile.TileLocationId = 3;
                                modelSpells.tile.UserId = _ChaacterContents.CharacterSpells[0].UserId;
                                //Adding Last Spell Properties for Tiles
                                CharacterSpellProperty _CharacterSpellProperty = new CharacterSpellProperty();
                                if (modelSpells.tile.TabId == 0)
                                {
                                    modelSpells.tile.UserId = _ChaacterContents.CharacterSpells[0].UserId;
                                    //Adding Last Item Properties for Tiles
                                    _CharacterSpellProperty.CharacterSpellId = _ChaacterContents.CharacterSpells[0].CharacterSpellId;
                                    _CharacterSpellProperty.Value = "";
                                    _context.CharacterSpellProperties.Add(_CharacterSpellProperty);
                                    _context.SaveChanges();
                                    modelSpells.tile.TabId = Convert.ToInt32(_CharacterSpellProperty.Id != 0 ? _CharacterSpellProperty.Id : modelSpells.tile.TabId);
                                    //Saving Tiles
                                    _tempserviceresponsemodel = new TileService().AddOrUpdateTile(modelSpells.tile, userId);
                                }
                                else
                                {
                                    if (_context.Tiles.Where(p => p.TileContentId == modelSpells.CharacterSpellValueId).ToList().Count > 0)
                                    {
                                        if (modelSpells.tile != null)
                                        {
                                            //Adding or Updating Tiles
                                            modelSpells.tile.TileLocationId = 3;
                                            modelSpells.tile.UserId = _ChaacterContents.CharacterItems[0].UserId;
                                            _context.SaveChanges();
                                            _tempserviceresponsemodel = new TileService().AddOrUpdateTile(modelSpells.tile, userId);
                                        }
                                    }
                                }

                            }
                        }
                    }

                }
            }
            if (_ChaacterContents.CharacterAbilities != null)
            {
                for (var j = 0; j < _ChaacterContents.CharacterAbilities.Count; j++)
                {
                    var modelAbilityProperties = _ChaacterContents.CharacterAbilities[j].CharacterAbilitiesProperties;
                    for (var o = 0; o < modelAbilityProperties.Count; o++)
                    {
                        var modelAbility = modelAbilityProperties[o];
                        if (modelAbility.tile != null)
                        {
                            if (modelAbility.tile.Value != null)
                            {
                                modelAbility.tile.TileLocationId = 4;
                                modelAbility.tile.UserId = _ChaacterContents.CharacterAbilities[0].UserId;
                                //Adding Last Ability Properties for Tiles
                                CharacterAbilityProperty _CharacterAbilityProperty = new CharacterAbilityProperty();
                                if (modelAbility.tile.TabId == 0)
                                {
                                    modelAbility.tile.UserId = _ChaacterContents.CharacterAbilities[0].UserId;
                                    //Adding Last Item Properties for Tiles
                                    _CharacterAbilityProperty.CharacterAbilityId = _ChaacterContents.CharacterAbilities[0].CharacterAbilityId;
                                    _CharacterAbilityProperty.Value = "";
                                    _context.CharacterAbilityProperties.Add(_CharacterAbilityProperty);
                                    _context.SaveChanges();
                                    modelAbility.tile.TabId = Convert.ToInt32(_CharacterAbilityProperty.Id != 0 ? _CharacterAbilityProperty.Id : modelAbility.tile.TabId);
                                    //Saving Tiles
                                    _tempserviceresponsemodel = new TileService().AddOrUpdateTile(modelAbility.tile, userId);
                                }
                                else
                                {
                                    if (_context.Tiles.Where(p => p.TileContentId == modelAbility.CharacterAbilityId).ToList().Count > 0)
                                    {
                                        if (modelAbility.tile != null)
                                        {
                                            //Adding or Updating Tiles
                                            modelAbility.tile.TileLocationId = 4;
                                            modelAbility.tile.UserId = _ChaacterContents.CharacterItems[0].UserId;
                                            _context.SaveChanges();
                                            _tempserviceresponsemodel = new TileService().AddOrUpdateTile(modelAbility.tile, userId);
                                        }
                                    }
                                }

                            }

                        }
                    }

                }
            }
            _serviceResponseModel.Result = _tempserviceresponsemodel;
            return _serviceResponseModel;
        }
        private CharacterInventoriesContents SetInventoryContents(CharacterItemProperty _item, CharacterSpellProperty _spell, CharacterAbilityProperty _ability)
        {
            //Declare Models
            CharacterInventoriesContents _characterInventoriesContents = new CharacterInventoriesContents();
            _characterInventoriesContents.CharacterItemsProperties = new CharacterItemsProperties();
            _characterInventoriesContents.CharacterSpellsProperties = new CharacterSpellsProperties();
            _characterInventoriesContents.CharacterAbilitiesProperties = new CharacterAbilitiesProperties();


            //Checking non Empty Model
            var EmptyNonModel = _item != null ? 1 : _spell != null ? 2 : _ability != null ? 3 : 0;
            var TileType = new RPGSmith.Utilities.TileTypes();
            switch (EmptyNonModel)
            {
                case 1:
                    //Setting Item Tile Properties
                    var ItemTile = _context.Tiles.Where(p => p.TileContentId == _item.Id).SingleOrDefault();
                    if (ItemTile != null)
                    {
                        if (ItemTile.EntityId > 0 && ItemTile.TileTypeId > 0 && ItemTile.TileLocationId == 2)
                        {
                            switch (ItemTile.TileTypeId)
                            {
                                case 1:
                                    RPGSmith.Utilities.RPGSmithTileTypes.Note note = new Utilities.RPGSmithTileTypes.Note();
                                    var dbNoteTileDetails = new TileService().GetNoteTilesByEntityId(ItemTile.EntityId);
                                    note.NoteId = dbNoteTileDetails.NoteId;
                                    note.CharacterProfileId = dbNoteTileDetails.CharacterProfileId;
                                    note.UserId = dbNoteTileDetails.UserId;
                                    note.Name = dbNoteTileDetails.Name;
                                    note.Text = dbNoteTileDetails.Text;
                                    TileType.Note = note;
                                    break;
                                case 2:
                                    RPGSmith.Utilities.RPGSmithTileTypes.Counter counter = new Utilities.RPGSmithTileTypes.Counter();
                                    var dbCounterTileDetails = new TileService().GetCounterTilesByEntityId(ItemTile.EntityId);
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
                                    var dbAtributeTileDetails = new TileService().GetAtributeTilesByEntityId(ItemTile.EntityId);
                                    attributes.AttributeId = dbAtributeTileDetails.AttributeId;
                                    attributes.CharacterProfileId = dbAtributeTileDetails.CharacterProfileId;
                                    attributes.UserId = dbAtributeTileDetails.UserId;
                                    attributes.Name = dbAtributeTileDetails.CoreStatName;
                                    attributes.Title = dbAtributeTileDetails.Name;
                                    attributes.TypeId = dbAtributeTileDetails.TypeId == null ? 0 : dbAtributeTileDetails.TypeId;
                                    attributes.CoreStatValue = Utility.ConvertTypeValueXMLtoClass(dbAtributeTileDetails.TypeId, dbAtributeTileDetails.CorestatValue, "");
                                    attributes.CoreStatValueId = dbAtributeTileDetails.CorestatValueID;
                                    TileType.Attribute = attributes;
                                    break;
                                case 4:
                                    RPGSmith.Utilities.RPGSmithTileTypes.Link link = new Utilities.RPGSmithTileTypes.Link();
                                    var dbLinkTileDetails = new TileService().GetLinkTilesByEntityId(ItemTile.EntityId);
                                    link.LinkId = dbLinkTileDetails.LinkId;
                                    link.CharacterProfileId = dbLinkTileDetails.CharacterProfileId;
                                    link.UserId = dbLinkTileDetails.UserId;
                                    link.Title = dbLinkTileDetails.Name;
                                    link.SelectedProperty = dbLinkTileDetails.SelectedProperty;
                                    link.SelectedPropertyValue = dbLinkTileDetails.SelectedPropertyValue != null ? dbLinkTileDetails.SelectedPropertyValue.Split('/')[0] : "";
                                    link.SelectedPropertyValueImage = dbLinkTileDetails.SelectedPropertyValue == null ? "" : dbLinkTileDetails.SelectedPropertyValue.Substring(link.SelectedPropertyValue.Length, dbLinkTileDetails.SelectedPropertyValue.Length - link.SelectedPropertyValue.Length);
                                    TileType.Link = link;
                                    break;
                                case 5:
                                    RPGSmith.Utilities.RPGSmithTileTypes.Execute execute = new Utilities.RPGSmithTileTypes.Execute();
                                    var dbExecuteTileDetails = new TileService().GetExecuteTilesByEntityId(ItemTile.EntityId);
                                    execute.ExecuteId = dbExecuteTileDetails.ExecuteId;
                                    execute.CharacterProfileId = dbExecuteTileDetails.CharacterProfileId;
                                    execute.UserId = dbExecuteTileDetails.UserId;
                                    execute.Name = dbExecuteTileDetails.Name;
                                    execute.Command = dbExecuteTileDetails.Command;
                                    execute.CommandLastResult = dbExecuteTileDetails.CommandLastResult;
                                    execute.CommandLastRunDate = dbExecuteTileDetails.CommandLastRunDate;
                                    execute.ContentId = dbExecuteTileDetails.ContentId;
                                    execute.ContentTypeId = dbExecuteTileDetails.ContentTypeId;
                                    execute.SelectedPropertyValueImage = dbExecuteTileDetails.SelectedPropertyValue;
                                    execute.SelectedProperty = dbExecuteTileDetails.SelectedProperty;
                                    execute.SelectedPropertyValue = dbExecuteTileDetails.SelectedPropertyValue != null ? dbExecuteTileDetails.SelectedPropertyValue.Split('/')[0] : "";
                                    execute.SelectedPropertyValueImage = dbExecuteTileDetails.SelectedPropertyValue == null ? "" : dbExecuteTileDetails.SelectedPropertyValue.Substring(execute.SelectedPropertyValue.Length, dbExecuteTileDetails.SelectedPropertyValue.Length - execute.SelectedPropertyValue.Length);
                                    TileType.Execute = execute;
                                    break;
                                case 6:
                                    RPGSmith.Utilities.RPGSmithTileTypes.Command command = new Utilities.RPGSmithTileTypes.Command();
                                    var dbCommandTileDetails = new TileService().GetCommandTilesByEntityId(ItemTile.EntityId);
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
                                    var dbImageTileDetails = new TileService().GetImageTilesByEntityId(ItemTile.EntityId);
                                    image.CharacterProfileId = dbImageTileDetails.CharacterProfileId;
                                    image.ImageId = dbImageTileDetails.ImageId;
                                    image.Name = dbImageTileDetails.Name == null ? "" : dbImageTileDetails.Name;
                                    image.UserId = dbImageTileDetails.UserId;
                                    image.Imagepath = dbImageTileDetails.ImagePath == null ? "" : dbImageTileDetails.ImagePath;
                                    TileType.Imagetile = image;
                                    break;
                            }

                        }
                        _characterInventoriesContents.CharacterItemsProperties.tile = new ViewModels.TileViewModel()
                        {
                            EntityId = ItemTile.EntityId,
                            Height = ItemTile.Height,
                            Style = ItemTile.Style,
                            Styles = (ItemTile.Style != null && ItemTile.Style != "") ? Utility.ConvertStyleValueXMLtoClass(ItemTile.Style) : new Style(),
                            TabId = ItemTile.TileContentId,
                            TileId = ItemTile.TileId,
                            TileTypeId = ItemTile.TileTypeId,
                            UserId = ItemTile.UserId,
                            X = ItemTile.X,
                            Y = ItemTile.Y,
                            Width = ItemTile.Width,
                            Value = TileType,
                            TileTypeName = (new TileService().GetAllTileTypes().Count > 0 && ItemTile.TileTypeId > 0) ? new TileService().GetAllTileTypes().Where(p => p.TileTypeId == ItemTile.TileTypeId).SingleOrDefault().TileTypeName : "",
                            Mode = "Use"
                        };
                    }
                    break;
                case 2:
                    //Setting Spell Tile Properties
                    var SpellTile = _context.Tiles.Where(p => p.TileContentId == _spell.Id).SingleOrDefault();
                    if (SpellTile != null)
                    {
                        if (SpellTile.EntityId > 0 && SpellTile.TileTypeId > 0 && SpellTile.TileLocationId == 3)
                        {
                            switch (SpellTile.TileTypeId)
                            {
                                case 1:
                                    RPGSmith.Utilities.RPGSmithTileTypes.Note note = new Utilities.RPGSmithTileTypes.Note();
                                    var dbNoteTileDetails = new TileService().GetNoteTilesByEntityId(SpellTile.EntityId);
                                    note.NoteId = dbNoteTileDetails.NoteId;
                                    note.CharacterProfileId = dbNoteTileDetails.CharacterProfileId;
                                    note.UserId = dbNoteTileDetails.UserId;
                                    note.Name = dbNoteTileDetails.Name;
                                    note.Text = dbNoteTileDetails.Text;
                                    TileType.Note = note;
                                    break;
                                case 2:
                                    RPGSmith.Utilities.RPGSmithTileTypes.Counter counter = new Utilities.RPGSmithTileTypes.Counter();
                                    var dbCounterTileDetails = new TileService().GetCounterTilesByEntityId(SpellTile.EntityId);
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
                                    var dbAtributeTileDetails = new TileService().GetAtributeTilesByEntityId(SpellTile.EntityId);
                                    attributes.AttributeId = dbAtributeTileDetails.AttributeId;
                                    attributes.CharacterProfileId = dbAtributeTileDetails.CharacterProfileId;
                                    attributes.UserId = dbAtributeTileDetails.UserId;
                                    attributes.Name = dbAtributeTileDetails.CoreStatName;
                                    attributes.Title = dbAtributeTileDetails.Name;
                                    attributes.TypeId = dbAtributeTileDetails.TypeId == null ? 0 : dbAtributeTileDetails.TypeId;
                                    attributes.CoreStatValue = Utility.ConvertTypeValueXMLtoClass(dbAtributeTileDetails.TypeId, dbAtributeTileDetails.CorestatValue, "");
                                    attributes.CoreStatValueId = dbAtributeTileDetails.CorestatValueID;
                                    TileType.Attribute = attributes;
                                    break;
                                case 4:
                                    RPGSmith.Utilities.RPGSmithTileTypes.Link link = new Utilities.RPGSmithTileTypes.Link();
                                    var dbLinkTileDetails = new TileService().GetLinkTilesByEntityId(SpellTile.EntityId);
                                    link.LinkId = dbLinkTileDetails.LinkId;
                                    link.CharacterProfileId = dbLinkTileDetails.CharacterProfileId;
                                    link.UserId = dbLinkTileDetails.UserId;
                                    link.Title = dbLinkTileDetails.Name;
                                    link.SelectedProperty = dbLinkTileDetails.SelectedProperty;
                                    link.SelectedPropertyValueImage = dbLinkTileDetails.SelectedPropertyValue == null ? "" : dbLinkTileDetails.SelectedPropertyValue;
                                    TileType.Link = link;
                                    break;
                                case 5:
                                    RPGSmith.Utilities.RPGSmithTileTypes.Execute execute = new Utilities.RPGSmithTileTypes.Execute();
                                    var dbExecuteTileDetails = new TileService().GetExecuteTilesByEntityId(SpellTile.EntityId);
                                    execute.ExecuteId = dbExecuteTileDetails.ExecuteId;
                                    execute.CharacterProfileId = dbExecuteTileDetails.CharacterProfileId;
                                    execute.UserId = dbExecuteTileDetails.UserId;
                                    execute.Name = dbExecuteTileDetails.Name;
                                    execute.Command = dbExecuteTileDetails.Command;
                                    execute.CommandLastResult = dbExecuteTileDetails.CommandLastResult;
                                    execute.CommandLastRunDate = dbExecuteTileDetails.CommandLastRunDate;
                                    execute.ContentId = dbExecuteTileDetails.ContentId;
                                    execute.ContentTypeId = dbExecuteTileDetails.ContentTypeId;
                                    execute.SelectedPropertyValueImage = dbExecuteTileDetails.SelectedPropertyValue;
                                    execute.SelectedProperty = dbExecuteTileDetails.SelectedProperty;
                                    execute.SelectedPropertyValue = dbExecuteTileDetails.SelectedPropertyValue;
                                    TileType.Execute = execute;
                                    break;
                                case 6:
                                    RPGSmith.Utilities.RPGSmithTileTypes.Command command = new Utilities.RPGSmithTileTypes.Command();
                                    var dbCommandTileDetails = new TileService().GetCommandTilesByEntityId(SpellTile.EntityId);
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
                                    var dbImageTileDetails = new TileService().GetImageTilesByEntityId(SpellTile.EntityId);
                                    image.CharacterProfileId = dbImageTileDetails.CharacterProfileId;
                                    image.ImageId = dbImageTileDetails.ImageId;
                                    image.Name = dbImageTileDetails.Name == null ? "" : dbImageTileDetails.Name;
                                    image.UserId = dbImageTileDetails.UserId;
                                    image.Imagepath = dbImageTileDetails.ImagePath == null ? "" : dbImageTileDetails.ImagePath;
                                    TileType.Imagetile = image;
                                    break;
                            }

                        }
                        _characterInventoriesContents.CharacterSpellsProperties.tile = new ViewModels.TileViewModel()
                        {
                            EntityId = SpellTile.EntityId,
                            Height = SpellTile.Height,
                            Style = SpellTile.Style,
                            Styles = (SpellTile.Style != null && SpellTile.Style != "") ? Utility.ConvertStyleValueXMLtoClass(SpellTile.Style) : new Style(),
                            TabId = SpellTile.TileContentId,
                            TileId = SpellTile.TileId,
                            TileTypeId = SpellTile.TileTypeId,
                            UserId = SpellTile.UserId,
                            X = SpellTile.X,
                            Y = SpellTile.Y,
                            Width = SpellTile.Width,
                            Value = TileType,
                            TileTypeName = (new TileService().GetAllTileTypes().Count > 0 && SpellTile.TileTypeId > 0) ? new TileService().GetAllTileTypes().Where(p => p.TileTypeId == SpellTile.TileTypeId).SingleOrDefault().TileTypeName : "",
                            Mode = "Use"
                        };
                    }
                    break;
                case 3:
                    //Setting Ability Tile Properties
                    var AbilityTile = _context.Tiles.Where(p => p.TileContentId == _ability.Id).SingleOrDefault();
                    if (AbilityTile != null)
                    {
                        if (AbilityTile.EntityId > 0 && AbilityTile.TileTypeId > 0 && AbilityTile.TileLocationId == 4)
                        {
                            switch (AbilityTile.TileTypeId)
                            {
                                case 1:
                                    RPGSmith.Utilities.RPGSmithTileTypes.Note note = new Utilities.RPGSmithTileTypes.Note();
                                    var dbNoteTileDetails = new TileService().GetNoteTilesByEntityId(AbilityTile.EntityId);
                                    note.NoteId = dbNoteTileDetails.NoteId;
                                    note.CharacterProfileId = dbNoteTileDetails.CharacterProfileId;
                                    note.UserId = dbNoteTileDetails.UserId;
                                    note.Name = dbNoteTileDetails.Name;
                                    note.Text = dbNoteTileDetails.Text;
                                    TileType.Note = note;
                                    break;
                                case 2:
                                    RPGSmith.Utilities.RPGSmithTileTypes.Counter counter = new Utilities.RPGSmithTileTypes.Counter();
                                    var dbCounterTileDetails = new TileService().GetCounterTilesByEntityId(AbilityTile.EntityId);
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
                                    var dbAtributeTileDetails = new TileService().GetAtributeTilesByEntityId(AbilityTile.EntityId);
                                    attributes.AttributeId = dbAtributeTileDetails.AttributeId;
                                    attributes.CharacterProfileId = dbAtributeTileDetails.CharacterProfileId;
                                    attributes.UserId = dbAtributeTileDetails.UserId;
                                    attributes.Name = dbAtributeTileDetails.CoreStatName;
                                    attributes.Title = dbAtributeTileDetails.Name;
                                    attributes.TypeId = dbAtributeTileDetails.TypeId == null ? 0 : dbAtributeTileDetails.TypeId;
                                    attributes.CoreStatValue = Utility.ConvertTypeValueXMLtoClass(dbAtributeTileDetails.TypeId, dbAtributeTileDetails.CorestatValue, "");
                                    attributes.CoreStatValueId = dbAtributeTileDetails.CorestatValueID;
                                    TileType.Attribute = attributes;
                                    break;
                                case 4:
                                    RPGSmith.Utilities.RPGSmithTileTypes.Link link = new Utilities.RPGSmithTileTypes.Link();
                                    var dbLinkTileDetails = new TileService().GetLinkTilesByEntityId(AbilityTile.EntityId);
                                    link.LinkId = dbLinkTileDetails.LinkId;
                                    link.CharacterProfileId = dbLinkTileDetails.CharacterProfileId;
                                    link.UserId = dbLinkTileDetails.UserId;
                                    link.Title = dbLinkTileDetails.Name;
                                    link.SelectedProperty = dbLinkTileDetails.SelectedProperty;
                                    link.SelectedPropertyValueImage = dbLinkTileDetails.SelectedPropertyValue == null ? "" : dbLinkTileDetails.SelectedPropertyValue;
                                    TileType.Link = link;
                                    break;
                                case 5:
                                    RPGSmith.Utilities.RPGSmithTileTypes.Execute execute = new Utilities.RPGSmithTileTypes.Execute();
                                    var dbExecuteTileDetails = new TileService().GetExecuteTilesByEntityId(AbilityTile.EntityId);
                                    execute.ExecuteId = dbExecuteTileDetails.ExecuteId;
                                    execute.CharacterProfileId = dbExecuteTileDetails.CharacterProfileId;
                                    execute.UserId = dbExecuteTileDetails.UserId;
                                    execute.Name = dbExecuteTileDetails.Name;
                                    execute.Command = dbExecuteTileDetails.Command;
                                    execute.CommandLastResult = dbExecuteTileDetails.CommandLastResult;
                                    execute.CommandLastRunDate = dbExecuteTileDetails.CommandLastRunDate;
                                    execute.ContentId = dbExecuteTileDetails.ContentId;
                                    execute.ContentTypeId = dbExecuteTileDetails.ContentTypeId;
                                    execute.SelectedPropertyValueImage = dbExecuteTileDetails.SelectedPropertyValue;
                                    execute.SelectedProperty = dbExecuteTileDetails.SelectedProperty;
                                    execute.SelectedPropertyValue = dbExecuteTileDetails.SelectedPropertyValue;
                                    TileType.Execute = execute;
                                    break;
                                case 6:
                                    RPGSmith.Utilities.RPGSmithTileTypes.Command command = new Utilities.RPGSmithTileTypes.Command();
                                    var dbCommandTileDetails = new TileService().GetCommandTilesByEntityId(AbilityTile.EntityId);
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
                                    var dbImageTileDetails = new TileService().GetImageTilesByEntityId(AbilityTile.EntityId);
                                    image.CharacterProfileId = dbImageTileDetails.CharacterProfileId;
                                    image.ImageId = dbImageTileDetails.ImageId;
                                    image.Name = dbImageTileDetails.Name == null ? "" : dbImageTileDetails.Name;
                                    image.UserId = dbImageTileDetails.UserId;
                                    image.Imagepath = dbImageTileDetails.ImagePath == null ? "" : dbImageTileDetails.ImagePath;
                                    TileType.Imagetile = image;
                                    break;
                            }

                        }
                        _characterInventoriesContents.CharacterAbilitiesProperties.tile = new ViewModels.TileViewModel()
                        {
                            EntityId = AbilityTile.EntityId,
                            Height = AbilityTile.Height,
                            Style = AbilityTile.Style,
                            Styles = (AbilityTile.Style != null && AbilityTile.Style != "") ? Utility.ConvertStyleValueXMLtoClass(AbilityTile.Style) : new Style(),
                            TabId = AbilityTile.TileContentId,
                            TileId = AbilityTile.TileId,
                            TileTypeId = AbilityTile.TileTypeId,
                            UserId = AbilityTile.UserId,
                            X = AbilityTile.X,
                            Y = AbilityTile.Y,
                            Width = AbilityTile.Width,
                            Value = TileType,
                            TileTypeName = (new TileService().GetAllTileTypes().Count > 0 && AbilityTile.TileTypeId > 0) ? new TileService().GetAllTileTypes().Where(p => p.TileTypeId == AbilityTile.TileTypeId).SingleOrDefault().TileTypeName : "",
                            Mode = "Use"
                        };
                    }
                    break;
            }
            return _characterInventoriesContents;
        }
        #endregion
       
    }
}