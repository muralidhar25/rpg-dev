using System;
using System.Collections.Generic;
using System.Text;
using DAL.Models;
using DAL.Repositories.Interfaces;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using DAL.Repositories;
using System.Linq.Expressions;
using DAL.Models.CharacterTileModels;
using Microsoft.Extensions.Configuration;
using System.Data.SqlClient;
using System.Data;

namespace DAL.Services
{
    public class CharacterService : ICharacterService
    {
        private readonly IRepository<Character> _repo;
        protected readonly ApplicationDbContext _context;
        private readonly ICharacterSpellService _characterSpellService;
        private readonly ICharacterAbilityService _characterAbilityService;
        private readonly IItemService _itemService;
        private readonly IConfiguration _configuration;

        public CharacterService(ApplicationDbContext context, IRepository<Character> repo, IConfiguration configuration,
            ICharacterSpellService characterSpellService, ICharacterAbilityService characterAbilityService, IItemService itemService)
        {
            _context = context;
            _repo = repo;
            _characterSpellService = characterSpellService;
            _characterAbilityService = characterAbilityService;
            _itemService = itemService;
            this._configuration = configuration;
        }

        public Character GetCharacterById(int Id)
        {
            //var character= _repo.AllIncludeNavigation(new string[] { "RuleSet", "AspNetUser" , "CharacterAbilities" , "CharacterSpells" ,"Items" ,"CharacterCommands" })
            //    .Where(x => x.CharacterId == Id && x.IsDeleted!=true).FirstOrDefault();
            var character = _context.Characters
                .Include(p=>p.RuleSet)
                .Include(p=>p.AspNetUser)
                .Include(p=>p.CharacterAbilities)
                .Include(p=>p.CharacterSpells)
                .Include(p=>p.Items)
                .Include(p=>p.CharacterCommands)
               .Where(x => x.CharacterId == Id && x.IsDeleted != true).FirstOrDefault();
            if (character != null)
            {
                character.CharacterAbilities = character.CharacterAbilities.Where(p => p.IsDeleted != true).ToList();
                character.CharacterSpells = character.CharacterSpells.Where(p => p.IsDeleted != true).ToList();
                character.Items = character.Items.Where(p => p.IsDeleted != true).ToList();
                character.CharacterCommands = character.CharacterCommands.Where(p => p.IsDeleted != true).ToList();
            }
            return character;
        }

        public Character GetCharacterByIdDice(int Id)
        {
            var character = _context.Characters
               .Where(x => x.CharacterId == Id && x.IsDeleted != true)
               .FirstOrDefault();
            
            return character;
        }

        public List<Character> GetCharacterRuleSetId(int ruleSetId)
        {
            List<Character> characters= _repo.AllIncludeNavigation(new string[] { "RuleSet", "AspNetUser" , "CharacterAbilities" , "CharacterSpells" ,"Items", "CharacterCommands" })
                .Where(x => x.RuleSetId == ruleSetId && x.IsDeleted!=true).ToList();

            foreach(Character character in characters)
            {
                character.CharacterAbilities = character.CharacterAbilities.Where(p => p.IsDeleted != true).ToList();
                character.CharacterSpells = character.CharacterSpells.Where(p => p.IsDeleted != true).ToList();
                character.Items = character.Items.Where(p => p.IsDeleted != true).ToList();
                character.CharacterCommands = character.CharacterCommands.Where(p => p.IsDeleted != true).ToList();
            }

            return characters;
        }
        public int GetCharacterCountUserId(string userId) {
            return _context.Characters.Where(x => x.UserId == userId && x.IsDeleted != true).ToList().Count;
        }
        public List<Character> GetCharacterUserId(string userId)
        {
            //List<Character> characters = _repo.AllIncludeNavigation(new string[] { "RuleSet", "AspNetUser" ,"CharacterAbilities", "CharacterSpells" ,"Items", "CharacterCommands" })
            //    .Where(x => x.UserId == userId && x.IsDeleted!=true).ToList();
            List<Character> characters =_context.Characters
                .Include(p=>p.RuleSet)
                .Include(p=>p.AspNetUser)
                .Include(p=>p.CharacterAbilities)
                .Include(p=>p.CharacterSpells)
                .Include(p=>p.Items)
                .Include(p=>p.CharacterCommands)
                .Where(x => x.UserId == userId && x.IsDeleted != true).ToList();
            foreach (Character character in characters)
            {
                character.CharacterAbilities = character.CharacterAbilities.Where(p => p.IsDeleted != true).ToList();
                character.CharacterSpells = character.CharacterSpells.Where(p => p.IsDeleted != true).ToList();
                character.Items = character.Items.Where(p => p.IsDeleted != true).ToList();
                character.CharacterCommands = character.CharacterCommands.Where(p => p.IsDeleted != true).ToList();
            }

            return characters;
        }

        public async Task<Character> InsertCharacter(Character CharacterDomain)
        {
            return await _repo.Add(CharacterDomain);
        }
        public Character Create_SP(Character model, int layoutHeight, int layoutWidth, int CharIdToDuplicate = 0)
        {
            string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            Character character = null;
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            using (SqlConnection con = new SqlConnection(consString))
            {
                //string qry = "EXEC Character_Create @CharacterName='"+ GetNull(model.CharacterName) + "', @CharacterDescription='"+GetNull(model.CharacterDescription)+ "', @ImageUrl='" + GetNull(model.ImageUrl) + "', @ThumbnailUrl='" + GetNull(model.ThumbnailUrl) + "', @UserId='" + GetNull(model.UserId) + "', @RuleSetId='" + GetNull(model.RuleSetId) + "', @LastCommand='" + GetNull(model.LastCommand) + "',  @LastCommandResult='" + GetNull(model.LastCommandResult) + "', @InventoryWeight='" + GetNull(model.InventoryWeight) + "', @LastCommandValues='" + GetNull(model.LastCommandValues) + "', @LayoutHeight='" + GetNull(layoutHeight) + "', @LayoutWidth='" + GetNull(layoutWidth) + "' ";
                using (SqlCommand cmd = new SqlCommand("Character_Create"))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Connection = con;
                    cmd.Parameters.AddWithValue("@CharacterName", GetNull(model.CharacterName));
                    cmd.Parameters.AddWithValue("@CharacterDescription", GetNull(model.CharacterDescription));
                    cmd.Parameters.AddWithValue("@ImageUrl", GetNull(model.ImageUrl));
                    cmd.Parameters.AddWithValue("@ThumbnailUrl", GetNull(model.ThumbnailUrl));
                    cmd.Parameters.AddWithValue("@UserId", GetNull(model.UserId));
                    cmd.Parameters.AddWithValue("@RuleSetId", GetNull(model.RuleSetId));
                    cmd.Parameters.AddWithValue("@LastCommand", GetNull(model.LastCommand));
                    cmd.Parameters.AddWithValue("@LastCommandResult", GetNull(model.LastCommandResult));
                    cmd.Parameters.AddWithValue("@InventoryWeight", GetNull(model.InventoryWeight));
                    cmd.Parameters.AddWithValue("@LastCommandValues", GetNull(model.LastCommandValues));
                    cmd.Parameters.AddWithValue("@LayoutHeight", GetNull(layoutHeight));
                    cmd.Parameters.AddWithValue("@LayoutWidth", GetNull(layoutWidth));
                    cmd.Parameters.AddWithValue("@CharIdToDuplicate", CharIdToDuplicate);
                    con.Open();
                    try
                    {
                       
                        adapter.SelectCommand = cmd;
                        adapter.Fill(ds);
                        //var a = cmd.ExecuteNonQuery();
                    }
                    catch (Exception ex)
                    {
                        con.Close();
                        throw ex;
                    }
                    con.Close();                    
                }
            }
            if (ds.Tables.Count > 0)
            {
                character = _repo.GetCharacter(ds.Tables[0]);
            }
            return character;
        }
        private object GetNull(object obj)
        {
            if (obj == null)
                return DBNull.Value;
            else if (obj.GetType() == typeof(bool))
            {
                if ((bool)obj)
                    return 1;
                else
                    return 0;
            }
            else
                return obj;
        }
        public async Task<Character> UpdateCharacter(Character CharacterDomain)
        {
            var Character = _context.Characters.Include("RuleSet").Include("AspNetUser").Where(x => x.CharacterId == CharacterDomain.CharacterId).FirstOrDefault();

            if (Character == null)
                return Character;

            Character.CharacterName = CharacterDomain.CharacterName;
            Character.CharacterDescription = CharacterDomain.CharacterDescription;
            //Character.CharacterImage = CharacterDomain.CharacterImage;
            Character.ImageUrl = CharacterDomain.ImageUrl;
            Character.ThumbnailUrl = CharacterDomain.ThumbnailUrl;
            Character.InventoryWeight = CharacterDomain.InventoryWeight;

            try
            {
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return Character;
        }
        
        public async Task<Character> UpdateCharacterLastCommand(Character _character)
        {
            var Character = _context.Characters.Where(x => x.CharacterId == _character.CharacterId).FirstOrDefault();

            if (Character == null) return Character;

            Character.LastCommand = _character.LastCommand;
            Character.LastCommandResult = _character.LastCommandResult;
            Character.LastCommandValues = _character.LastCommandValues;
            Character.LastCommandTotal = _character.LastCommandTotal;

            try
            {
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return Character;
        }

        public async Task<Character> UpdateCharacterInventoryWeight(int _characterId)
        {
            Character _character = new Character();
            try
            {
                string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
                //string qry = "EXEC Characters_UpdateInventoryWeight @CharacterId='" + _characterId + "'";

                SqlConnection connection = new SqlConnection(connectionString);
                SqlCommand command = new SqlCommand();
                SqlDataAdapter adapter = new SqlDataAdapter();
                DataSet ds = new DataSet();
                try
                {
                    connection.Open();
                    command = new SqlCommand("Characters_UpdateInventoryWeight", connection);

                    // Add the parameters for the SelectCommand.
                    command.Parameters.AddWithValue("@CharacterId", _characterId);
                    command.CommandType = CommandType.StoredProcedure;

                    adapter.SelectCommand = command;

                    adapter.Fill(ds);
                    command.Dispose();
                    connection.Close();
                }
                catch (Exception ex)
                {
                    command.Dispose();
                    connection.Close();
                }

                if (ds.Tables[0].Rows.Count > 0)
                    _character = _repo.GetCharacter(ds.Tables[0]);
            }
            catch (Exception ex)
            {
                //throw ex;
            }
            return _character;
        }

        public async Task<bool> IsCharacterExist(string value, string userId, int? characterId= 0)
        {
            var items = _repo.GetAll();
          
                return items.Result.Where(x => x.CharacterName == value && x.UserId== userId && x.CharacterId!= characterId && x.IsDeleted!=true)
                .FirstOrDefault() == null ? false : true;
        }

        public async Task<bool> DeleteCharacter(int id)
        {
            string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            using (SqlConnection con = new SqlConnection(consString))
            {
               
                using (SqlCommand cmd = new SqlCommand("Character_Delete"))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Connection = con;
                    cmd.Parameters.AddWithValue("@CharacterID", GetNull(id));                    
                    con.Open();
                    try
                    {
                        var a = cmd.ExecuteNonQuery();
                    }
                    catch (Exception ex)
                    {
                        con.Close();
                        throw ex;
                    }
                    con.Close();
                    return true;
                }
            }
            //   // remove charcter abilities
            //  var ca= _context.CharacterAbilities.Where(x => x.CharacterId == id && x.IsDeleted!=true).ToList();

            //   foreach(CharacterAbility ca_item in ca)
            //   {
            //       ca_item.IsDeleted = true;
            //   }

            //   // remove charcter spells
            //var cs= _context.CharacterSpells.Where(x => x.CharacterId == id && x.IsDeleted != true).ToList();

            //   foreach(CharacterSpell cs_item in cs)
            //   {
            //       cs_item.IsDeleted = true;
            //   }

            //   // remove charcter items
            //   var ci = _context.Items.Where(x => x.CharacterId == id && x.IsDeleted != true).ToList(); 

            //   foreach(Item item in ci)
            //   {
            //       item.IsDeleted = true;
            //   }


            //   // remove charcter commands
            //   var cc = _context.CharacterCommands.Where(x => x.CharacterId == id && x.IsDeleted != true).ToList(); 

            //   foreach (CharacterCommand  item in cc)
            //   {
            //       item.IsDeleted = true;
            //   }


            //   //Remove Characters Character Stat

            //   var ccs = _context.CharactersCharacterStats.Where(p => p.CharacterId == id && p.IsDeleted != true).ToList();

            //   foreach (CharactersCharacterStat ccs_item in ccs)
            //   {
            //       //Remove Characters Stat  Tiles 
            //       var cstile = _context.CharacterCharacterStatTiles.Where(p => p.CharactersCharacterStatId == ccs_item.CharactersCharacterStatId && p.IsDeleted != true).ToList();

            //       foreach (var cstile_item in cstile)
            //       {
            //           // Remove Tile
            //           var tile = _context.CharacterTiles.Where(p => p.CharacterTileId == cstile_item.CharacterTileId).SingleOrDefault();

            //           tile.IsDeleted = true;
            //           cstile_item.IsDeleted = true;
            //       }

            //       ccs_item.IsDeleted = true;
            //   }


            //   // Remove Tiles
            //   var tiles = _context.CharacterTiles.Include(p=>p.TileType).Where(p => p.CharacterId == id && p.IsDeleted != true).ToList();

            //   foreach (CharacterTile t in tiles)
            //   {

            //       int? TileType=t.TileTypeId  ;

            //       switch (TileType)
            //       {
            //           case 1:
            //               //Remove Note Tile 
            //               var nt = _context.CharacterNoteTiles.Where(p => p.CharacterTileId == t.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
            //               if (nt != null)
            //                   nt.IsDeleted = true;
            //               break;
            //           case 2:
            //               //Remove Image Tile 
            //               var it = _context.CharacterImageTiles.Where(p => p.CharacterTileId == t.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
            //               if (it != null)
            //                   it.IsDeleted = true;
            //               break;
            //           case 3:
            //               //Remove Counter Tile 
            //               var ct = _context.CharacterCounterTiles.Where(p => p.CharacterTileId == t.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
            //               if (ct != null)
            //                   ct.IsDeleted = true;
            //               break;
            //           case 5:
            //               //Remove Link Tiles 
            //               var lt = _context.CharacterLinkTiles.Where(p => p.CharacterTileId == t.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
            //               if (lt != null)
            //                   lt.IsDeleted = true;
            //               break;
            //           case 6:
            //               //Remove Execute iles
            //               var et = _context.CharacterExecuteTiles.Where(p => p.CharacterTileId == t.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
            //               if (et != null)
            //                   et.IsDeleted = true;
            //               break;
            //           case 7:
            //               //Remove Command Tile 
            //               var cot = _context.CharacterCommandTiles.Where(p => p.CharacterTileId == t.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
            //               if (cot != null)
            //                   cot.IsDeleted = true;
            //               break;
            //           default:

            //               break;
            //       }


            //       t.IsDeleted = true;
            //   }



            //   // remove Character Dashboard Pages
            //   var cp = _context.CharacterDashboardPages.Where(x => x.CharacterId == id && x.IsDeleted != true).ToList(); ;
            //   foreach (CharacterDashboardPage cp_item in cp)

            //   {
            //       cp_item.IsDeleted = true;
            //   }


            //   // remove Character Dashboard Layouts 
            //   var cl = _context.CharacterDashboardLayouts.Where(x => x.CharacterId == id && x.IsDeleted != true).ToList(); ;

            //   foreach (CharacterDashboardLayout cl_item in cl)
            //   {
            //       cl_item.IsDeleted = true;
            //   }

            //   var c = await _repo.Get(id);

            //   if (c == null)
            //       return false;

            //   c.IsDeleted = true;

            //   try
            //   {
            //       _context.SaveChanges();
            //       return true;
            //   }
            //   catch (Exception ex)
            //   {
            //       throw ex;
            //   }
        }
        
        public async Task<int> GetCharactersCount()
        {
           return  _context.Characters.Where(x => x.IsDeleted != true).Count();          
        }

        public async Task<int> GetCharactersCountByUserId(string userId)
        {
            return _context.Characters.Where(x => x.UserId == userId && x.IsDeleted != true).Count();
        }


        public async Task<Character> UpdateLastCommand(int characterId, string lastcommand, string lastcommandresult, string lastCommandValues, int lastCommandTotal)
        {
            var _character = await _repo.Get(characterId);

            if (_character == null)
                return _character;

            _character.LastCommand = lastcommand;
            _character.LastCommandResult = lastcommandresult;
            _character.LastCommandValues = lastCommandValues;
            _character.LastCommandTotal = lastCommandTotal;

            try
            {
                _context.SaveChanges();
                return _character;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public async Task<List<Character>> GetOnlyCharactersByRulesetID(int ruleSetId)
        {
            return await _context.Characters.Where(x => x.RuleSetId == ruleSetId && x.IsDeleted != true).ToListAsync();
        }

        public bool IsNewRulesetToAdd(int ruleSetId,string userId) {
        return   ! _context.RuleSets.Where(x => x.OwnerId == userId && x.RuleSetId == ruleSetId).Any();
        }

        #region SP relate methods

        public (List<Character>, List<RuleSet>) SP_Character_GetByUserId(string userId, int page, int pageSize)
        {
            List<Character> _CharacterList = new List<Character>();
            List<RuleSet> ruleset = new List<RuleSet>();

            short num = 0;
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC Characters_GetByUserId @UserId='" + userId + "',@page='" + page + "',@size='" + pageSize + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("Characters_GetByUserId", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@UserId", userId);
                command.Parameters.AddWithValue("@page", page);
                command.Parameters.AddWithValue("@size", pageSize);
                command.CommandType = CommandType.StoredProcedure;

                adapter.SelectCommand = command;

                adapter.Fill(ds);
                command.Dispose();
                connection.Close();
            }
            catch (Exception ex)
            {
                command.Dispose();
                connection.Close();
            }

            if (ds.Tables[1].Rows.Count > 0)
                ruleset = _repo.GetRulesetsList(ds.Tables[1]);
            
            if (ds.Tables[0].Rows.Count > 0)
            {

                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    RuleSet __ruleset = new RuleSet();
                    __ruleset.ImageUrl = row["RuleSetImageUrl"] == DBNull.Value ? null : row["RuleSetImageUrl"].ToString();
                    __ruleset.IsAbilityEnabled = row["IsAbilityEnabled"] == DBNull.Value ? false : Convert.ToBoolean(row["IsAbilityEnabled"]);
                    __ruleset.IsAllowSharing = row["IsAllowSharing"] == DBNull.Value ? false : Convert.ToBoolean(row["IsAllowSharing"]);
                    __ruleset.IsCoreRuleset = row["IsCoreRuleset"] == DBNull.Value ? false : Convert.ToBoolean(row["IsCoreRuleset"]);
                    __ruleset.IsItemEnabled = row["IsItemEnabled"] == DBNull.Value ? false : Convert.ToBoolean(row["IsItemEnabled"]);
                    __ruleset.IsSpellEnabled = row["IsSpellEnabled"] == DBNull.Value ? false : Convert.ToBoolean(row["IsSpellEnabled"]);
                    __ruleset.ParentRuleSetId = row["ParentRuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ParentRuleSetId"]);
                    __ruleset.RuleSetDesc = row["RuleSetDesc"] == DBNull.Value ? null : row["RuleSetDesc"].ToString();
                    __ruleset.RuleSetId = row["RuleSetRuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetRuleSetId"]);
                    __ruleset.RuleSetName = row["RuleSetName"] == DBNull.Value ? null : row["RuleSetName"].ToString();
                    __ruleset.ShareCode = row["ShareCode"] == DBNull.Value ? new Guid() : new Guid(row["ShareCode"].ToString());
                    __ruleset.ThumbnailUrl = row["RuleSetThumbnailUrl"] == DBNull.Value ? null : row["RuleSetThumbnailUrl"].ToString();

                    Character _character = new Character();
                    _character.CharacterId = row["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterId"]);
                    _character.CharacterName = row["CharacterName"] == DBNull.Value ? null : row["CharacterName"].ToString();
                    _character.CharacterDescription = row["CharacterDescription"] == DBNull.Value ? null : row["CharacterDescription"].ToString();
                    _character.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();
                    _character.ThumbnailUrl = row["ThumbnailUrl"] == DBNull.Value ? null : row["ThumbnailUrl"].ToString();
                    _character.UserId = row["UserId"] == DBNull.Value ? null : row["UserId"].ToString();
                    _character.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    _character.ParentCharacterId = row["ParentCharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ParentCharacterId"]);
                    _character.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                    _character.LastCommand = row["LastCommand"] == DBNull.Value ? null : row["LastCommand"].ToString();
                    _character.LastCommandResult = row["LastCommandResult"] == DBNull.Value ? null : row["LastCommandResult"].ToString();
                    _character.LastCommandValues = row["LastCommandValues"] == DBNull.Value ? null : row["LastCommandValues"].ToString();
                    _character.LastCommandTotal = row["LastCommandTotal"] == DBNull.Value ? 0 : Convert.ToInt32(row["LastCommandTotal"]);
                    _character.InventoryWeight = row["InventoryWeight"] == DBNull.Value ? 0 : Convert.ToDecimal(row["InventoryWeight"]);

                    _character.RuleSet = __ruleset;
                    _CharacterList.Add(_character);
                }
            }
            return (_CharacterList, ruleset);
        }


        #endregion
    }
}
