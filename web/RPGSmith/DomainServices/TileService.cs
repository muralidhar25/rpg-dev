using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using RPGSmith.ViewModels;
using RPGSmith.Data;
using RPGSmith.Data.Models;
using RPGSmith.Models;
using RPGSmith.Utilities.RPGSmithTileTypes;
using RPGSmith.Web.Utilities;
using System.Data.Entity.Validation;
using System.IO;
using RPGSmith.Utilities;
using RPGSmith.Web.ViewModels;

namespace RPGSmith.DomainServices
{
    public class TileService
    {
        private readonly RPGSmithContext _context;
        ServiceResponseModel _serviceResponseModel = new ServiceResponseModel();
        public TileService()
        {
            RPGSmithContext dbContext = new RPGSmithContext();
            _context = dbContext;

        }
        #region Tile
        public IEnumerable<RPGSmith.ViewModels.TileTypes> GetTileTypes()
        {
            List<RPGSmith.ViewModels.TileTypes> types = new List<RPGSmith.ViewModels.TileTypes>();
            var _tiletypes = _context.TileTypes.ToList();
            foreach (var type in _tiletypes)
            {
                types.Add(new RPGSmith.ViewModels.TileTypes()
                {
                    TileId = type.TileTypeId,
                    TileType = type.TileTypeName
                });
            }
            return types;
        }
        public IEnumerable<Tile> GetTileListByTabId(int? TabId)
        {
            if (TabId != null)
            {
                IEnumerable<Tile> _tiles = _context.Tiles.Where(x => x.TileContentId == TabId).ToList();
                return _tiles;
            }
            return null;
        }
        public Tile GetTileByTileId(int? TileId)
        {
            if (TileId != null)
            {
                Tile _tile = _context.Tiles.Where(x => x.TileId == TileId).SingleOrDefault();
                return _tile;
            }
            return null;
        }
        public ServiceResponseModel AddOrUpdateTile(TileViewModel tilemodel,string userId)
        {

            //TileViewModel tilemodelResult = tilemodel;

            //Saving All 7 Types of Tiles and getting EntityId
            int EntityId = new TileService().AddOrUpdateTileTypes(tilemodel.Value.Note, tilemodel.Value.Counter, tilemodel.Value.Attribute, tilemodel.Value.Link,
                                                                         tilemodel.Value.Execute, tilemodel.Value.Command, tilemodel.Value.Imagetile, tilemodel.CharacterProfileId, userId);
            tilemodel.EntityId = EntityId;
            //Getting Tile Details by TileId
            var _tileDetails = _context.Tiles.Where(p => p.TileId == tilemodel.TileId).SingleOrDefault();
            var Message = string.Empty;
            Tile tile = new Tile();

            if (_tileDetails == null)
            {
                tile.Authored = Convert.ToDateTime(DateTime.Now.ToString());
                tile.Edited = Convert.ToDateTime(DateTime.Now.ToString());
                tile.Height = tilemodel.Height;
                tile.UserId = userId;
                tile.Style = tilemodel.Styles == null ? "" : Utility.ConvertStyleValueClasstoXML(tilemodel.Styles).OuterXml;
                tile.TileContentId = tilemodel.TabId;
                tile.TileTypeId = tilemodel.TileTypeId;
                tile.Width = tilemodel.Width;
                tile.X = tilemodel.X;
                tile.Y = tilemodel.Y;
                tile.EntityId = tilemodel.EntityId;
                tile.TileLocationId = tilemodel.TileLocationId;//For Tile Location 
                tile.IsEditable = true;
                _context.Tiles.Add(tile);
                int _rowseffected = _context.SaveChanges();
                if (_rowseffected > 0)
                {
                    tilemodel.TileId = tile.TileId;
                    _serviceResponseModel.StatusCode = 200;
                    _serviceResponseModel.Result = tilemodel;
                }
                else
                {
                    _serviceResponseModel.StatusCode = 400;
                    _serviceResponseModel.Result = "Tile is not updated";
                }

            }
            else
            {
                _tileDetails.Authored = Convert.ToDateTime(DateTime.Now.ToString());
                _tileDetails.Edited = Convert.ToDateTime(DateTime.Now.ToString());
                 _tileDetails.Height = tilemodel.Height;
                _tileDetails.UserId = userId;
                _tileDetails.Style = tilemodel.Styles == null ? "" : Utility.ConvertStyleValueClasstoXML(tilemodel.Styles).OuterXml;
                _tileDetails.TileContentId = tilemodel.TabId;
                _tileDetails.TileTypeId = tilemodel.TileTypeId;
                _tileDetails.Width = tilemodel.Width;
                _tileDetails.X = tilemodel.X;
                _tileDetails.Y = tilemodel.Y;
                _tileDetails.EntityId = tilemodel.EntityId;
                _tileDetails.TileLocationId = tilemodel.TileLocationId;//For Tile Location 
                _tileDetails.IsEditable = true;
                int _rowseffected = _context.SaveChanges();
                if (_rowseffected > 0)
                {
                    tilemodel.TileId = _tileDetails.TileId;
                    _serviceResponseModel.StatusCode = 200;
                    _serviceResponseModel.Result = tilemodel;
                }
                else
                {
                    _serviceResponseModel.StatusCode = 400;
                    _serviceResponseModel.Result = "Tile is not updated";
                }
            }

           
           
            return _serviceResponseModel;
        }
        public List<TileType> GetAllTileTypes()
        {
            return _context.TileTypes.ToList();
        }
        public ServiceResponseModel DeleteTile(TileViewModel Tile)
        {
            if (Tile.TileId > 0)
            {
                var deletetileDetails = _context.Tiles.Where(c => c.TileId == Tile.TileId).FirstOrDefault();
                //Delete Note Tile
                if(deletetileDetails.TileTypeId == 1)
                {
                    var NoteTileDetails = _context.NoteTiles.Where(p => p.NoteId == deletetileDetails.EntityId).SingleOrDefault();
                    if (NoteTileDetails != null)
                    {
                        _context.NoteTiles.Remove(NoteTileDetails);
                        _context.SaveChanges();
                    }
                }
                //Delete Counter Tile
                if (deletetileDetails.TileTypeId == 2)
                {
                    var CounterTileDetails = _context.CounterTiles.Where(p => p.CounterId == deletetileDetails.EntityId).SingleOrDefault();
                    if (CounterTileDetails != null)
                    {
                        _context.CounterTiles.Remove(CounterTileDetails);
                        _context.SaveChanges();
                    }
                }
                //Delete Attribute Tile
                if (deletetileDetails.TileTypeId == 3)
                {
                    var AttributetileDetails = _context.AttributeTiles.Where(p => p.AttributeId == deletetileDetails.EntityId).SingleOrDefault();
                    if (AttributetileDetails != null)
                    {
                        _context.AttributeTiles.Remove(AttributetileDetails);
                        _context.SaveChanges();
                    }
                }
                //Delete Link Tile
                if (deletetileDetails.TileTypeId == 4)
                {
                    var LinkTileDetails = _context.LinkTiles.Where(p => p.LinkId == deletetileDetails.EntityId).SingleOrDefault();
                    if (LinkTileDetails != null)
                    {
                        _context.LinkTiles.Remove(LinkTileDetails);
                        _context.SaveChanges();
                    }
                }
                //Delete Execute Tile
                if (deletetileDetails.TileTypeId == 5)
                {
                    var ExecuteTileDetails = _context.ExecuteTiles.Where(p => p.ExecuteId == deletetileDetails.EntityId).SingleOrDefault();
                    if (ExecuteTileDetails != null)
                    {
                        _context.ExecuteTiles.Remove(ExecuteTileDetails);
                        _context.SaveChanges();
                    }
                }
                //Delete Command Tile
                if (deletetileDetails.TileTypeId == 6)
                {
                    var CommandTileDetails = _context.CommandTiles.Where(p => p.CommandId == deletetileDetails.EntityId).SingleOrDefault();
                    if (CommandTileDetails != null)
                    {
                        _context.CommandTiles.Remove(CommandTileDetails);
                        _context.SaveChanges();
                    }
                }
                //Delete Image Tile
                if (deletetileDetails.TileTypeId == 7)
                {
                    var ImageTileDetails = _context.ImageTiles.Where(p => p.ImageId == deletetileDetails.EntityId).SingleOrDefault();
                    if (ImageTileDetails != null)
                    {
                        _context.ImageTiles.Remove(ImageTileDetails);
                        _context.SaveChanges();
                    }
                }
                //Deleting Tile
                var deleteTileId = _context.Tiles.Where(c => c.TileId == Tile.TileId).FirstOrDefault();
                int tilelocationId = Convert.ToInt32(deleteTileId.TileLocationId);
                _context.Tiles.Remove(deleteTileId);
                _context.SaveChanges();
                if(tilelocationId == 2)
                {
                    var deleteItemProperty = _context.Items.Where(p => p.ItemId == deleteTileId.TileContentId).FirstOrDefault();
                    if(deleteItemProperty != null)
                    {
                        _context.Items.Remove(deleteItemProperty);
                        _context.SaveChanges();
                    }
                    else
                    {
                        var deleteCharacterItemProperty = _context.CharacterItemProperties.Where(p => p.Id == deleteTileId.TileContentId).FirstOrDefault();
                        if (deleteCharacterItemProperty != null)
                        {
                            _context.CharacterItemProperties.Remove(deleteCharacterItemProperty);
                            _context.SaveChanges();
                        }
                    }
                }
                else if(tilelocationId == 3)
                {
                    var deleteSpellProperty = _context.Spells.Where(p => p.SpellId == deleteTileId.TileContentId).FirstOrDefault();
                    if (deleteSpellProperty != null)
                    {
                        _context.Spells.Remove(deleteSpellProperty);
                        _context.SaveChanges();
                    }
                    else
                    {
                        var deleteCharacterSpellProperty = _context.CharacterSpellProperties.Where(p => p.Id == deleteTileId.TileContentId).FirstOrDefault();
                        if (deleteCharacterSpellProperty != null)
                        {
                            _context.CharacterSpellProperties.Remove(deleteCharacterSpellProperty);
                            _context.SaveChanges();
                        }
                    }
                }
                else if (tilelocationId == 4)
                {
                    var deleteAbilityProperty = _context.Abilities.Where(p => p.AbilityId == deleteTileId.TileContentId).FirstOrDefault();
                    if (deleteAbilityProperty != null)
                    {
                        _context.Abilities.Remove(deleteAbilityProperty);
                        _context.SaveChanges();
                    }
                    else
                    {
                        var deleteCharacterAbilityProperty = _context.CharacterAbilityProperties.Where(p => p.Id == deleteTileId.TileContentId).FirstOrDefault();
                        if (deleteCharacterAbilityProperty != null)
                        {
                            _context.CharacterAbilityProperties.Remove(deleteCharacterAbilityProperty);
                            _context.SaveChanges();
                        }
                    }
                }
            }
            _serviceResponseModel.Result = Tile;
            return _serviceResponseModel;
        }
        #endregion
        #region Tile Types
        public NoteTile GetNoteTilesByEntityId(int? EntityId)
        {
            return _context.NoteTiles.Where(p => p.NoteId == EntityId).SingleOrDefault();

        }
        public CounterTile GetCounterTilesByEntityId(int? EntityId)
        {
            return _context.CounterTiles.Where(p => p.CounterId == EntityId).SingleOrDefault();

        }
        public AttributeTile GetAtributeTilesByEntityId(int? EntityId)
        {
            return _context.AttributeTiles.Where(p => p.AttributeId == EntityId).SingleOrDefault();

        }
        public LinkTile GetLinkTilesByEntityId(int? EntityId)
        {
            return _context.LinkTiles.Where(p => p.LinkId == EntityId).SingleOrDefault();

        }
        public ExecuteTile GetExecuteTilesByEntityId(int? EntityId)
        {
            return _context.ExecuteTiles.Where(p => p.ExecuteId == EntityId).SingleOrDefault();

        }
        public CommandTile GetCommandTilesByEntityId(int? EntityId)
        {
            return _context.CommandTiles.Where(p => p.CommandId == EntityId).SingleOrDefault();

        }
        public RPGSmith.Data.Models.ImageTile GetImageTilesByEntityId(int? EntityId)
        {
            return _context.ImageTiles.Where(p => p.ImageId == EntityId).SingleOrDefault();
        }
        public RPGSmith.Utilities.TileTypeslst GetAllTileTypesRelatedCharacter(int? CharacterProfileId)
        {
            //Decalre Model
            var TileTypeslst = new Utilities.TileTypeslst
            {
                Notes = new List<Note>(),
                Attributes = new List<Attributes>(),
                Commands = new List<Command>(),
                Counters = new List<Counter>(),
                Executes = new List<Execute>(),
                Links = new List<Link>(),
                ImageTile = new List<Utilities.RPGSmithTileTypes.ImageTile>()
            };
            //Getting All Tile Type List from db
            var NoteTiles = _context.NoteTiles.Where(p => p.CharacterProfileId == CharacterProfileId).ToList();
            var AttributeTiles = _context.AttributeTiles.Where(p => p.CharacterProfileId == CharacterProfileId).ToList();
            var CommandTiles = _context.CommandTiles.Where(p => p.CharacterProfileId == CharacterProfileId).ToList();
            var CounterTiles = _context.CounterTiles.Where(p => p.CharacterProfileId == CharacterProfileId).ToList();
            var ExecuteTiles = _context.ExecuteTiles.Where(p => p.CharacterProfileId == CharacterProfileId).ToList();
            var LinkTiles = _context.LinkTiles.Where(p => p.CharacterProfileId == CharacterProfileId).ToList();
            var ImageTiles = _context.ImageTiles.Where(p => p.CharacterProfileId == CharacterProfileId).ToList();
            //Setting All Tile Type List 
            foreach (var _note in NoteTiles)
            {
                TileTypeslst.Notes.Add(new Note
                {
                    Name = _note.Name
                });
            }
            foreach (var _attribute in AttributeTiles)
            {
                TileTypeslst.Attributes.Add(new Attributes
                {
                    Name = _attribute.Name
                });
            }
            foreach (var _command in CommandTiles)
            {
                TileTypeslst.Commands.Add(new Command
                {
                    Name = _command.Name
                });
            }
            foreach (var _counter in CounterTiles)
            {
                TileTypeslst.Counters.Add(new Counter
                {
                    Name = _counter.Name
                });
            }
            foreach (var _execute in ExecuteTiles)
            {
                TileTypeslst.Executes.Add(new Execute
                {
                    Name = _execute.Name
                });
            }
            foreach (var _link in LinkTiles)
            {
                TileTypeslst.Links.Add(new Link
                {
                    Title = _link.Name
                });
            }
            foreach (var _image in ImageTiles)
            {
                TileTypeslst.ImageTile.Add(new Utilities.RPGSmithTileTypes.ImageTile
                {
                    Name = _image.Name
                });
            }
            return TileTypeslst;
        }

        public int AddOrUpdateTileTypes(Note _noteTile, Counter _counterTile, Attributes _attributeTile, Link _linkTile,
                                        Execute _executeTile, Command _commandTile, RPGSmith.Utilities.RPGSmithTileTypes.ImageTile
                                        _imageTile, int CharacterProfileId, string UserId)
        {
            //Checking Tile Type
            int CheckedNonEmptyModel = _noteTile != null ? 1 : _counterTile != null ? 2 :
                                       _attributeTile != null ? 3 : _linkTile != null ? 4 :
                                       _executeTile != null ? 5 : _commandTile != null ? 6 :
                                       _imageTile != null ? 7 : 0;

            //For getting saved Tile Type entity id
            int EntityId = 0;
            string virtualPath = "";
            switch (CheckedNonEmptyModel)
            {
                case 1:
                    var _noteDeatils = _context.NoteTiles.Where(p => p.NoteId == _noteTile.NoteId).SingleOrDefault();
                    switch (_noteDeatils)
                    {
                        //Adding Note Tile
                        case null:
                            _noteDeatils = new NoteTile();
                            _noteDeatils.CharacterProfileId = CharacterProfileId;
                            _noteDeatils.UserId = UserId;
                            _noteDeatils.Name = _noteTile.Name == null ? "" : _noteTile.Name;
                            _noteDeatils.Text = _noteTile.Text == null ? "" : _noteTile.Text;
                            _noteDeatils.Authored = DateTime.Now;
                            _noteDeatils.Edited = DateTime.Now;
                            _context.NoteTiles.Add(_noteDeatils);
                            _context.SaveChanges();
                            EntityId = _noteDeatils.NoteId;
                            break;
                        //Updating Note Tile
                        default:
                            _noteDeatils.NoteId = _noteTile.NoteId;
                            _noteDeatils.CharacterProfileId = _noteTile.CharacterProfileId;
                            _noteDeatils.UserId = _noteTile.UserId;
                            _noteDeatils.Name = _noteTile.Name == null ? "" : _noteTile.Name;
                            _noteDeatils.Text = _noteTile.Text == null ? "" : _noteTile.Text;
                            _noteDeatils.Authored = DateTime.Now;
                            _noteDeatils.Edited = DateTime.Now;
                            EntityId = _noteTile.NoteId;
                            _context.SaveChanges();
                            break;
                    }
                    break;
                case 2:
                    var _counterDeatils = _context.CounterTiles.Where(p => p.CounterId == _counterTile.CounterId).SingleOrDefault();
                    switch (_counterDeatils)
                    {
                        //Adding Counter Tile
                        case null:
                            _counterDeatils = new CounterTile();
                            _counterDeatils.CharacterProfileId = CharacterProfileId;
                            _counterDeatils.UserId = UserId;
                            _counterDeatils.Name = _counterTile.Name == null ? "" : _counterTile.Name;
                            _counterDeatils.DefaultValue = _counterTile.DefaultValue;
                            _counterDeatils.Step = _counterTile.Step;
                            _counterDeatils.Mask = _counterTile.Mask == null ? "" : _counterTile.Mask;
                            _counterDeatils.Max = _counterTile.Max == null ? 0 : _counterTile.Max;
                            _counterDeatils.Min = _counterTile.Min == null ? 0 : _counterTile.Min;
                            _counterDeatils.Value = _counterTile.Value;
                            _counterDeatils.Authored = DateTime.Now;
                            _counterDeatils.Edited = DateTime.Now;
                            _context.CounterTiles.Add(_counterDeatils);
                            _context.SaveChanges();
                            EntityId = _counterDeatils.CounterId;
                            break;
                        //Updating Counter Tile
                        default:
                            _counterDeatils.CharacterProfileId = _counterTile.CharacterProfileId;
                            _counterDeatils.UserId = _counterTile.UserId;
                            _counterDeatils.Name = _counterTile.Name == null ? "" : _counterTile.Name;
                            _counterDeatils.DefaultValue = _counterTile.DefaultValue;
                            _counterDeatils.Step = _counterTile.Step;
                            _counterDeatils.Mask = _counterTile.Mask == null ? "" : _counterTile.Mask;
                            _counterDeatils.Max = _counterTile.Max == null ? 0 : _counterTile.Max;
                            _counterDeatils.Min = _counterTile.Min == null ? 0 : _counterTile.Min;
                            _counterDeatils.Value = _counterTile.Value;
                            _counterDeatils.Authored = DateTime.Now;
                            _counterDeatils.Edited = DateTime.Now;
                            _counterDeatils.CounterId = _counterTile.CounterId;
                            EntityId = _counterTile.CounterId;
                            _context.SaveChanges();
                            break;
                    }
                    break;
                case 3:
                    var _attributeDeatils = _context.AttributeTiles.Where(p => p.AttributeId == _attributeTile.AttributeId).SingleOrDefault();
                    switch (_attributeDeatils)
                    {
                        //Adding Attribute Tile
                        case null:
                            _attributeDeatils = new AttributeTile();
                            _attributeDeatils.CharacterProfileId = CharacterProfileId;
                            _attributeDeatils.UserId = UserId;
                            _attributeDeatils.Name = _attributeTile.Title == null ? "" : _attributeTile.Title;
                            _attributeDeatils.CoreStatName = _attributeTile.Name == null ? "" : _attributeTile.Name;
                            //Checking CoreStat Values are Null or not
                            //if (_attributeTile.CoreStatValue == null)
                            //{
                            //    _attributeTile.CoreStatValue = new Utilities.CustomTypes();
                            //    if (string.IsNullOrEmpty(_attributeTile.CorestatValues) == false)
                            //    {
                            //        var getSelectedCoreStatValues = _attributeTile.CorestatValues.Split(':');
                            //        //Filling CoreStat Values
                            //        _attributeTile.CoreStatValue = SetCoreStatValues(getSelectedCoreStatValues);
                            //    }
                            //}
                            var CorestatValue = _context.CoreStatValues.Where(p => p.Id == _attributeTile.CoreStatValueId).FirstOrDefault();
                            if (CorestatValue == null)
                            {
                                _attributeDeatils.CorestatValue = "";
                            }
                            else {
                                _attributeDeatils.CorestatValue = CorestatValue.Value;

                            }
                            //_attributeDeatils.CorestatValue = _attributeTile.CoreStatValue == null ? "" : Utility.ConvertTypeValueClasstoXML(_attributeTile.TypeId, _attributeTile.CoreStatValue, "").OuterXml;
                            _attributeDeatils.CorestatValueID = _attributeTile.CoreStatValueId;
                            _attributeDeatils.TypeId = _attributeTile.TypeId;
                            _context.AttributeTiles.Add(_attributeDeatils);
                            _context.SaveChanges();
                            EntityId = _attributeDeatils.AttributeId;
                            break;
                        //Updating Attribute Tile
                        default:
                            _attributeDeatils.AttributeId = _attributeTile.AttributeId;
                            _attributeDeatils.CharacterProfileId = _attributeTile.CharacterProfileId;
                            _attributeDeatils.UserId = _attributeTile.UserId;
                            _attributeDeatils.Name = _attributeTile.Title == null ? "" : _attributeTile.Title;
                            _attributeDeatils.CoreStatName = _attributeTile.Name == null ? "" : _attributeTile.Name;
                            var CorestatEditValue = _context.CoreStatValues.Where(p => p.Id == _attributeTile.CoreStatValueId).FirstOrDefault();
                            if (CorestatEditValue == null)
                            {
                                _attributeDeatils.CorestatValue = "";
                            }
                            else
                            {
                                _attributeDeatils.CorestatValue = CorestatEditValue.Value;

                            }
                            //_attributeDeatils.CorestatValue = _attributeTile.CoreStatValue == null ? _attributeDeatils.CorestatValue : Utility.ConvertTypeValueClasstoXML(_attributeTile.TypeId, _attributeTile.CoreStatValue, "").OuterXml;
                            _attributeDeatils.CorestatValueID = _attributeTile.CoreStatValueId;
                            EntityId = _attributeTile.AttributeId;
                            try
                            {
                                _context.SaveChanges();
                            }
                            catch (DbEntityValidationException e)
                            {
                                foreach (var eve in e.EntityValidationErrors)
                                {
                                    Console.WriteLine("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                                        eve.Entry.Entity.GetType().Name, eve.Entry.State);
                                    foreach (var ve in eve.ValidationErrors)
                                    {
                                        Console.WriteLine("- Property: \"{0}\", Error: \"{1}\"",
                                            ve.PropertyName, ve.ErrorMessage);
                                    }
                                }
                                throw;
                            }

                            break;
                    }
                    break;
                case 4:
                    var _linkDeatils = _context.LinkTiles.Where(p => p.LinkId == _linkTile.LinkId).SingleOrDefault();
                    switch (_linkDeatils)
                    {
                        //Adding Link Tile
                        case null:
                            _linkDeatils = new LinkTile();
                            _linkDeatils.CharacterProfileId = CharacterProfileId;
                            _linkDeatils.UserId = UserId;
                            _linkDeatils.Name = _linkTile.Title == null ? "" : _linkTile.Title;
                            _linkDeatils.SelectedProperty = _linkTile.SelectedProperty == null ? _linkTile.SelectedPropertyValue : _linkTile.SelectedProperty;
                            //Checking Model Image is not null
                            if (_linkTile.SelectedPropertyValueImage != null && _linkTile.SelectedPropertyValueImage != "")
                            {
                                if (_linkTile.SelectedPropertyValueImage.StartsWith("/wwwroot"))
                                {
                                    virtualPath = _linkTile.SelectedPropertyValueImage;
                                }
                                else
                                {
                                    _linkTile.SelectedPropertyValueImage = _linkTile.SelectedPropertyValueImage.Replace("data:image/png;base64,", "").Replace("data:image/jpg;base64,", "").Replace("data:image/jpeg;base64,", "");
                                    byte[] linkTileImagewByte = Convert.FromBase64String(_linkTile.SelectedPropertyValueImage);
                                    //For given unique Image Name
                                    var GuidString = Guid.NewGuid();
                                    virtualPath = "/wwwroot/images/LinkTileImages/" + _linkTile.Title + "_" + GuidString + ".jpg";
                                    string virtualPathForFolder = "~/wwwroot/images/LinkTileImages/" + _linkTile.Title + "_" + GuidString + ".jpg";
                                    var linkTilePhysicalMapPath = Path.Combine(HttpContext.Current.Server.MapPath(virtualPathForFolder));
                                    System.IO.File.WriteAllBytes(linkTilePhysicalMapPath, linkTileImagewByte);
                                }
                            }
                            // _linkDeatils.SelectedPropertyValue = virtualPath == "" ? _linkTile.SelectedPropertyValueImage : virtualPath;
                            _linkDeatils.SelectedPropertyValue = _linkTile.SelectedPropertyValue + "" + virtualPath;
                            _context.LinkTiles.Add(_linkDeatils);
                            try
                            {
                                _context.SaveChanges();
                            }
                            catch (DbEntityValidationException e)
                            {
                                foreach (var eve in e.EntityValidationErrors)
                                {
                                    Console.WriteLine("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                                        eve.Entry.Entity.GetType().Name, eve.Entry.State);
                                    foreach (var ve in eve.ValidationErrors)
                                    {
                                        Console.WriteLine("- Property: \"{0}\", Error: \"{1}\"",
                                            ve.PropertyName, ve.ErrorMessage);
                                    }
                                }
                                throw;
                            }

                            EntityId = _linkDeatils.LinkId;
                            break;
                        //Updating Link Tile
                        default:
                            _linkDeatils.LinkId = _linkTile.LinkId;
                            _linkDeatils.CharacterProfileId = _linkTile.CharacterProfileId;
                            _linkDeatils.UserId = _linkTile.UserId;
                            _linkDeatils.Name = _linkTile.Title == null ? "" : _linkTile.Title;
                            _linkDeatils.SelectedProperty = _linkTile.SelectedProperty == null ? _linkTile.SelectedPropertyValue : _linkTile.SelectedProperty;
                            if (_linkTile.SelectedPropertyValueImage != null && _linkTile.SelectedPropertyValueImage != "")
                            {
                                if (_linkTile.SelectedPropertyValueImage.StartsWith("/wwwroot"))
                                {
                                    virtualPath = _linkTile.SelectedPropertyValueImage;
                                }
                                else
                                {
                                    //Checking Model Image is not null
                                    if (_linkTile.SelectedPropertyValueImage != null && _linkTile.SelectedPropertyValueImage != "")
                                    {
                                        _linkTile.SelectedPropertyValueImage = _linkTile.SelectedPropertyValueImage.Replace("data:image/png;base64,", "").Replace("data:image/jpg;base64,", "").Replace("data:image/jpeg;base64,", "");
                                        byte[] linkTileImagewByte = Convert.FromBase64String(_linkTile.SelectedPropertyValueImage);
                                        //For given unique Image Name
                                        var GuidString = Guid.NewGuid();
                                        virtualPath = "/wwwroot/images/LinkTileImages/" + _linkTile.Title + "_" + GuidString + ".jpg";
                                        string virtualPathForFolder = "~/wwwroot/images/LinkTileImages/" + _linkTile.Title + "_" + GuidString + ".jpg";
                                        var linkTilePhysicalMapPath = Path.Combine(HttpContext.Current.Server.MapPath(virtualPathForFolder));
                                        System.IO.File.WriteAllBytes(linkTilePhysicalMapPath, linkTileImagewByte);
                                    }
                                }
                            }
                            _linkDeatils.SelectedPropertyValue = _linkTile.SelectedPropertyValue + "" + virtualPath; ;
                            //_linkDeatils.SelectedPropertyValue = _linkTile.SelectedPropertyValueImage == null ? "" : _linkTile.SelectedPropertyValue + "" + _linkTile.SelectedPropertyValueImage;
                            EntityId = _linkDeatils.LinkId;
                            _context.SaveChanges();
                            break;
                    }
                    break;
                case 5:
                    var _executeDeatils = _context.ExecuteTiles.Where(p => p.ExecuteId == _executeTile.ExecuteId).SingleOrDefault();
                    switch (_executeDeatils)
                    {
                        //Adding Execute Tile
                        case null:
                            _executeDeatils = new ExecuteTile();
                            _executeDeatils.CharacterProfileId = CharacterProfileId;
                            _executeDeatils.UserId = UserId;
                            _executeDeatils.Name = _executeTile.Name == null ? "" : _executeTile.Name;
                            _executeDeatils.Command = _executeTile.Command == null ? "" : _executeTile.Command;
                            _executeDeatils.CommandLastResult = _executeTile.CommandLastResult == null ? "" : _executeTile.CommandLastResult;
                            _executeDeatils.CommandLastRunDate = DateTime.Now;
                            _executeDeatils.ContentId = _executeTile.ContentId;
                            _executeDeatils.ContentTypeId = _executeTile.ContentTypeId;
                            _executeDeatils.SelectedProperty = _executeTile.SelectedProperty == null ? _executeTile.SelectedPropertyValue : _executeTile.SelectedProperty;
                            //Checking Model Image is not null
                            if (_executeTile.SelectedPropertyValueImage != null && _executeTile.SelectedPropertyValueImage != "")
                            {
                                if (_executeTile.SelectedPropertyValueImage.StartsWith("/wwwroot"))
                                {
                                    virtualPath = _executeTile.SelectedPropertyValueImage;
                                }
                                else
                                {
                                    _executeTile.SelectedPropertyValueImage = _executeTile.SelectedPropertyValueImage.Replace("data:image/png;base64,", "").Replace("data:image/jpg;base64,", "").Replace("data:image/jpeg;base64,", "");
                                    byte[] executeTileImagewByte = Convert.FromBase64String(_executeTile.SelectedPropertyValueImage);
                                    //For given unique Image Name
                                    var GuidString = Guid.NewGuid();
                                    virtualPath = "/wwwroot/images/ExecuteTileImages/" + _imageTile.Name + "_" + GuidString + ".jpg";
                                    string virtualPathForFolder = "~/wwwroot/images/ExecuteTileImages/" + _executeTile.Name + "_" + GuidString + ".jpg";
                                    var executeTilePhysicalMapPath = Path.Combine(HttpContext.Current.Server.MapPath(virtualPathForFolder));
                                    System.IO.File.WriteAllBytes(executeTilePhysicalMapPath, executeTileImagewByte);
                                }
                            }
                            _executeDeatils.SelectedPropertyValue = _executeTile.SelectedPropertyValue + "" + virtualPath;
                            _context.ExecuteTiles.Add(_executeDeatils);
                            try
                            {
                                _context.SaveChanges();
                            }
                            catch (DbEntityValidationException e)
                            {
                                foreach (var eve in e.EntityValidationErrors)
                                {
                                    Console.WriteLine("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                                        eve.Entry.Entity.GetType().Name, eve.Entry.State);
                                    foreach (var ve in eve.ValidationErrors)
                                    {
                                        Console.WriteLine("- Property: \"{0}\", Error: \"{1}\"",
                                            ve.PropertyName, ve.ErrorMessage);
                                    }
                                }
                                throw;
                            }
                            EntityId = _executeDeatils.ExecuteId;
                            break;
                        //Updating Execute Tile
                        default:
                            _executeDeatils.ExecuteId = _executeTile.ExecuteId;
                            _executeDeatils.CharacterProfileId = _executeTile.CharacterProfileId;
                            _executeDeatils.UserId = _executeTile.UserId;
                            _executeDeatils.Name = _executeTile.Name == null ? "" : _executeTile.Name;
                            _executeDeatils.Command = _executeTile.Command == null ? "" : _executeTile.Command;
                            _executeDeatils.CommandLastResult = _executeTile.CommandLastResult == null ? "" : _executeTile.CommandLastResult;
                            _executeDeatils.CommandLastRunDate = DateTime.Now;
                            _executeDeatils.ContentId = _executeTile.ContentId;
                            _executeDeatils.ContentTypeId = _executeTile.ContentTypeId;
                            _executeDeatils.SelectedProperty = _executeTile.SelectedProperty == null ? _executeTile.SelectedPropertyValue : _executeTile.SelectedProperty;
                            if (_executeTile.SelectedPropertyValueImage != null && _executeTile.SelectedPropertyValueImage != "")
                            {
                                if (_executeTile.SelectedPropertyValueImage.StartsWith("/wwwroot"))
                                {
                                    virtualPath = _executeTile.SelectedPropertyValueImage;
                                }
                                else
                                {
                                    if (_executeTile.SelectedPropertyValueImage != null && _executeTile.SelectedPropertyValueImage != "")
                                    {
                                        _executeTile.SelectedPropertyValueImage = _executeTile.SelectedPropertyValueImage.Replace("data:image/png;base64,", "").Replace("data:image/jpg;base64,", "").Replace("data:image/jpeg;base64,", "");
                                        byte[] executeTileImagewByte = Convert.FromBase64String(_executeTile.SelectedPropertyValueImage);
                                        //For given unique Image Name
                                        var GuidString = Guid.NewGuid();
                                        virtualPath = "/wwwroot/images/ExecuteTileImages/" + _imageTile.Name + "_" + GuidString + ".jpg";
                                        string virtualPathForFolder = "~/wwwroot/images/ExecuteTileImages/" + _executeTile.Name + "_" + GuidString + ".jpg";
                                        var executeTilePhysicalMapPath = Path.Combine(HttpContext.Current.Server.MapPath(virtualPathForFolder));
                                        System.IO.File.WriteAllBytes(executeTilePhysicalMapPath, executeTileImagewByte);
                                    }
                                }
                            }
                            // _executeDeatils.SelectedPropertyValue = virtualPath == "" ? _executeTile.SelectedPropertyValueImage :
                            // virtualPath;
                            _executeDeatils.SelectedPropertyValue = _executeTile.SelectedPropertyValue + "" + virtualPath;
                            EntityId = _executeDeatils.ExecuteId;
                            _context.SaveChanges();
                            break;
                    }
                    break;
                case 6:
                    var _commandDeatils = _context.CommandTiles.Where(p => p.CommandId == _commandTile.CommandId).SingleOrDefault();
                    switch (_commandDeatils)
                    {
                        //Adding Command Tile
                        case null:
                            _commandDeatils = new CommandTile();
                            _commandDeatils.CharacterProfileId = CharacterProfileId;
                            _commandDeatils.UserId = UserId;
                            _commandDeatils.Name = _commandTile.Name == null ? "" : _commandTile.Name;
                            _commandDeatils.Command = _commandTile.command == null ? "" : _commandTile.command;
                            _commandDeatils.CommandLastResult = _commandTile.commandLastResult == null ? "" : _commandTile.commandLastResult;
                            _commandDeatils.CommandLastRunDate = DateTime.Now;
                            //_commandDeatils.ImagePath = _commandTile.ImagePath;
                            if (_commandTile.ImagePath != null && _commandTile.ImagePath != "")
                            {
                                if (_commandTile.ImagePath.StartsWith("/wwwroot"))
                                {
                                    virtualPath = _commandTile.ImagePath;
                                }
                                else
                                {
                                    //Checking Model Image is not null
                                    if (_commandTile.ImagePath != null && _commandTile.ImagePath != "")
                                    {
                                        _commandTile.ImagePath = _commandTile.ImagePath.Replace("data:image/png;base64,", "").Replace("data:image/jpg;base64,", "").Replace("data:image/jpeg;base64,", "");
                                        byte[] linkTileImagewByte = Convert.FromBase64String(_commandTile.ImagePath);
                                        //For given unique Image Name
                                        var GuidString = Guid.NewGuid();
                                        virtualPath = "/wwwroot/images/CommandTileImages/" + _commandTile.Name + "_" + GuidString + ".jpg";
                                        string virtualPathForFolder = "~/wwwroot/images/CommandTileImages/" + _commandTile.Name + "_" + GuidString + ".jpg";
                                        var commandTilePhysicalMapPath = Path.Combine(HttpContext.Current.Server.MapPath(virtualPathForFolder));
                                        System.IO.File.WriteAllBytes(commandTilePhysicalMapPath, linkTileImagewByte);
                                    }
                                }
                            }
                            _commandDeatils.ImagePath = virtualPath;
                            _context.CommandTiles.Add(_commandDeatils);
                            _context.SaveChanges();
                            EntityId = _commandDeatils.CommandId;
                            break;
                        //Updating Command Tile
                        default:
                            _commandDeatils.CommandId = _commandTile.CommandId;
                            _commandDeatils.CharacterProfileId = _commandTile.CharacterProfileId;
                            _commandDeatils.UserId = _commandTile.UserId;
                            _commandDeatils.Name = _commandTile.Name == null ? "" : _commandTile.Name;
                            _commandDeatils.Command = _commandTile.command == null ? "" : _commandTile.command;
                            _commandDeatils.CommandLastResult = _commandTile.commandLastResult == null ? "" : _commandTile.commandLastResult;
                            _commandDeatils.CommandLastRunDate = DateTime.Now;
                            if (_commandTile.ImagePath != null && _commandTile.ImagePath != "")
                            {
                                if (_commandTile.ImagePath.StartsWith("/wwwroot"))
                                {
                                    virtualPath = _commandTile.ImagePath;
                                }
                                else
                                {
                                    //Checking Model Image is not null
                                    if (_commandTile.ImagePath != null && _commandTile.ImagePath != "")
                                    {
                                        _commandTile.ImagePath = _commandTile.ImagePath.Replace("data:image/png;base64,", "").Replace("data:image/jpg;base64,", "").Replace("data:image/jpeg;base64,", "");
                                        byte[] linkTileImagewByte = Convert.FromBase64String(_commandTile.ImagePath);
                                        //For given unique Image Name
                                        var GuidString = Guid.NewGuid();
                                        virtualPath = "/wwwroot/images/CommandTileImages/" + _commandTile.Name + "_" + GuidString + ".jpg";
                                        string virtualPathForFolder = "~/wwwroot/images/CommandTileImages/" + _commandTile.Name + "_" + GuidString + ".jpg";
                                        var commandTilePhysicalMapPath = Path.Combine(HttpContext.Current.Server.MapPath(virtualPathForFolder));
                                        System.IO.File.WriteAllBytes(commandTilePhysicalMapPath, linkTileImagewByte);
                                    }
                                }
                            }
                            _commandDeatils.ImagePath = virtualPath;

                            EntityId = _commandDeatils.CommandId;
                            _context.SaveChanges();
                            break;
                    }
                    break;
                case 7:
                    var _imageDeatils = _context.ImageTiles.Where(p => p.ImageId == _imageTile.ImageId).SingleOrDefault();
                    string imageTilePhysicalMapPath = null;
                    switch (_imageDeatils)
                    {
                        //Adding Image Tile
                        case null:
                            _imageDeatils = new RPGSmith.Data.Models.ImageTile();
                            _imageDeatils.CharacterProfileId = CharacterProfileId;
                            _imageDeatils.UserId = UserId;
                            _imageDeatils.Name = _imageTile.Name == null ? "" : _imageTile.Name;
                            _imageDeatils.Description = _imageTile.Description == null ? "" : _imageTile.Description;
                            //Checking Model Image is not null
                            if (_imageTile.Imagepath != null && _imageTile.Imagepath != "")
                            {
                                _imageTile.Imagepath = _imageTile.Imagepath.Replace("data:image/png;base64,", "").Replace("data:image/jpg;base64,", "").Replace("data:image/jpeg;base64,", "");
                                byte[] imageTileImagewByte = Convert.FromBase64String(_imageTile.Imagepath);
                                //For given unique Image Name
                                var GuidString = Guid.NewGuid();
                                virtualPath = "/wwwroot/images/ImageTileImages/" + _imageTile.Name + "_" + GuidString + ".jpg";
                                string virtualPathForFolder = "~/wwwroot/images/ImageTileImages/" + _imageTile.Name + "_" + GuidString + ".jpg";
                                imageTilePhysicalMapPath = Path.Combine(HttpContext.Current.Server.MapPath(virtualPathForFolder));
                                System.IO.File.WriteAllBytes(imageTilePhysicalMapPath, imageTileImagewByte);
                            }
                            _imageDeatils.ImagePath = virtualPath == null ? "" : virtualPath;
                            _context.ImageTiles.Add(_imageDeatils);
                            _context.SaveChanges();
                            EntityId = _imageDeatils.ImageId;
                            break;
                        //Updating Image Tile
                        default:
                            _imageDeatils.CharacterProfileId = CharacterProfileId;
                            _imageDeatils.UserId = UserId;
                            _imageDeatils.Name = _imageTile.Name == null ? "" : _imageTile.Name;
                            _imageDeatils.Description = _imageTile.Description == null ? "" : _imageTile.Description;
                            //Checking Model Image is not null
                            if (_imageTile.Imagepath != null && _imageTile.Imagepath != "")
                            {
                                //Comparing Model Image and db Image 
                                if (_imageTile.Imagepath != _imageDeatils.ImagePath)
                                {
                                    _imageTile.Imagepath = _imageTile.Imagepath.Replace("data:image/png;base64,", "").Replace("data:image/jpg;base64,", "").Replace("data:image/jpeg;base64,", "");
                                    byte[] imageTileImagewByte = Convert.FromBase64String(_imageTile.Imagepath);
                                    //For given unique Image Name
                                    var GuidString = Guid.NewGuid();
                                    virtualPath = "/wwwroot/images/ImageTileImages/" + _imageTile.Name + "_" + GuidString + ".jpg";
                                    string virtualPathForFolder = "~/wwwroot/images/ImageTileImages/" + _imageTile.Name + "_" + GuidString + ".jpg";
                                    imageTilePhysicalMapPath = Path.Combine(HttpContext.Current.Server.MapPath(virtualPathForFolder));
                                    System.IO.File.WriteAllBytes(imageTilePhysicalMapPath, imageTileImagewByte);
                                }
                                else
                                {
                                    virtualPath = _imageDeatils.ImagePath;
                                }
                            }
                            _imageDeatils.ImagePath = virtualPath == null ? "" : virtualPath;
                            EntityId = _imageDeatils.ImageId;
                            _context.SaveChanges();
                            break;
                    }
                    break;
            }
            return EntityId;
        }
        #endregion
        #region Setting CoreStat Values
        private CustomTypes SetCoreStatValues(string[] getSelectedCoreStatValues)
        {
            Utilities.CustomTypes _customType = new Utilities.CustomTypes();
            switch (getSelectedCoreStatValues[0])
            {
                case "Number":
                    _customType.Number = new Utilities.RPGSmithTypes.Number();
                    _customType.Number.value = getSelectedCoreStatValues[1] == null ? 0 : Convert.ToInt32(getSelectedCoreStatValues[1]);
                    break;
                case "Text":
                    _customType.Text = new Utilities.RPGSmithTypes.Text();
                    _customType.Text.value = getSelectedCoreStatValues[1] == null ? "" : getSelectedCoreStatValues[1];
                    break;
                case "Choices":
                    _customType.Choices = new Utilities.RPGSmithTypes.Choice();
                    _customType.Choices.selectedchoice = getSelectedCoreStatValues[1] == null ? "" : getSelectedCoreStatValues[1];
                    break;
                case "CurrentAndMaxValue":
                    _customType.CurrentAndMaxValue = new Utilities.RPGSmithTypes.CurrentAndMaxValue();
                    _customType.CurrentAndMaxValue.CurrentValue = getSelectedCoreStatValues[1] == null ? 0 : Convert.ToDecimal(getSelectedCoreStatValues[1]);
                    _customType.CurrentAndMaxValue.MaxValue = getSelectedCoreStatValues[2] == null ? 0 : Convert.ToDecimal(getSelectedCoreStatValues[2]);
                    break;
                case "Image":
                    _customType.Image = new Utilities.RPGSmithTypes.Image();
                    _customType.Image.image = getSelectedCoreStatValues[1] == null ? "" : getSelectedCoreStatValues[1];
                    break;
                case "OnOrOff":
                    _customType.OnOrOff = new Utilities.RPGSmithTypes.OnOrOff();
                    _customType.OnOrOff.value = getSelectedCoreStatValues[1] == null ? "" : getSelectedCoreStatValues[1];
                    break;
                case "YesOrNo":
                    _customType.YesOrNo = new Utilities.RPGSmithTypes.YesOrNo();
                    _customType.YesOrNo.value = getSelectedCoreStatValues[1] == null ? "" : getSelectedCoreStatValues[1];
                    break;
                case "Height":
                    _customType.Height = new Utilities.RPGSmithTypes.Height();
                    _customType.Height.value = getSelectedCoreStatValues[1] == null ? 0 : Convert.ToInt32(getSelectedCoreStatValues[1]);
                    break;
                case "Volume":
                    _customType.Volume = new Utilities.RPGSmithTypes.Volume();
                    _customType.Volume.heightvalue = getSelectedCoreStatValues[1] == null ? 0 : Convert.ToDecimal(getSelectedCoreStatValues[1]);
                    _customType.Volume.depthvalue = getSelectedCoreStatValues[2] == null ? 0 : Convert.ToDecimal(getSelectedCoreStatValues[2]);
                    _customType.Volume.lenghtvalue = getSelectedCoreStatValues[3] == null ? 0 : Convert.ToDecimal(getSelectedCoreStatValues[3]);
                    break;
                case "Weight":
                    _customType.Weight = new Utilities.RPGSmithTypes.Weight();
                    _customType.Weight.value = Convert.ToInt32(getSelectedCoreStatValues[1]);
                    break;
                case "DefaultDice":
                    _customType.DefaultDice = new Utilities.RPGSmithTypes.DefaultDice();
                    _customType.DefaultDice.value = getSelectedCoreStatValues[1] == null ? "" : getSelectedCoreStatValues[1];
                    break;
                case "Calculation":
                    _customType.Calculation = new Utilities.RPGSmithTypes.Calculation();
                    _customType.Calculation.formulae = getSelectedCoreStatValues[1] == null ? "" : getSelectedCoreStatValues[1];
                    break;
            }
            return _customType;
        }
        #endregion;
    }
}