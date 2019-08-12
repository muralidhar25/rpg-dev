using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.CharacterTileModels;
using DAL.Models.SPModels;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace DAL.Services.CharacterTileServices
{
    public class CharacterTileService : ICharacterTileService
    {
        private readonly IRepository<CharacterTile> _repo;
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ICharacterStatDefaultValueService _characterStatDefaultValueService;
        private readonly ICharacterStatConditionService _characterStatConditionService;
        private readonly ICharacterStatChoiceService _characterStatChoiceService;
        private readonly ICharacterStatCalcService _characterStatCalcService;
        public CharacterTileService(ApplicationDbContext context, IRepository<CharacterTile> repo, IConfiguration configuration, ICharacterStatDefaultValueService characterStatDefaultValueService, ICharacterStatConditionService characterStatConditionService, ICharacterStatChoiceService characterStatChoiceService, ICharacterStatCalcService characterStatCalcService)
        {
            _repo = repo;
            _context = context;
            _configuration = configuration;
            _characterStatDefaultValueService = characterStatDefaultValueService;
            _characterStatConditionService = characterStatConditionService;
            _characterStatChoiceService = characterStatChoiceService;
            _characterStatCalcService = characterStatCalcService;
        }

        public async Task<CharacterTile> Create(CharacterTile item)
        {
            item.IsDeleted = false;
            var _CharacterTile = await _repo.Add(item);
            return _CharacterTile;
        }

        public async Task<bool> Delete(int id)
        {
            // Remove Tile 
            var tile = await _repo.Get(id);

            if (tile == null)
                return false;

            switch (tile.TileTypeId)
            {
                case 1:
                    //Remove Note Tile 
                    var nt = _context.CharacterNoteTiles.Where(p => p.CharacterTileId == tile.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
                    if (nt != null)
                        nt.IsDeleted = true;
                    break;
                case 2:
                    //Remove Image Tile 
                    var it = _context.CharacterImageTiles.Where(p => p.CharacterTileId == tile.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
                    if (it != null)
                        it.IsDeleted = true;
                    break;
                case 3:
                    //Remove Counter Tile 
                    var ct = _context.CharacterCounterTiles.Where(p => p.CharacterTileId == tile.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
                    if (ct != null)
                        ct.IsDeleted = true;
                    break;
                case 4:
                    //Remove Character Stat Tiles 
                    var cst = _context.CharacterCharacterStatTiles.Where(p => p.CharacterTileId == tile.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
                    if (cst != null)
                        cst.IsDeleted = true;
                    break;
                case 5:
                    //Remove Link Tiles 
                    var lt = _context.CharacterLinkTiles.Where(p => p.CharacterTileId == tile.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
                    if (lt != null)
                        lt.IsDeleted = true;
                    break;
                case 6:
                    //Remove Execute iles
                    var et = _context.CharacterExecuteTiles.Where(p => p.CharacterTileId == tile.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
                    if (et != null)
                        et.IsDeleted = true;
                    break;
                case 7:
                    //Remove Command Tile 
                    var cot = _context.CharacterCommandTiles.Where(p => p.CharacterTileId == tile.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
                    if (cot != null)
                        cot.IsDeleted = true;
                    break;
                case 8:
                    //Remove Text Tile 
                    var tt = _context.CharacterTextTiles.Where(p => p.CharacterTileId == tile.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
                    if (tt != null)
                        tt.IsDeleted = true;
                    break;
                default:

                    break;
            }
            var config = _context.TileConfig.Where(p => p.CharacterTileId == tile.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
            if (config != null)
            {
                config.IsDeleted = true;
            }

            tile.IsDeleted = true;

            try
            {
                _context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        public CharacterTile GetById(int? id)
        {
            CharacterTile characterTile = _context.CharacterTiles
                .Where(x => x.CharacterTileId == id && x.IsDeleted != true)
                .Include(d => d.Character)
                .Include(d => d.CharacterDashboardPage)
                .Include(d => d.CharacterStatTiles).ThenInclude(y => y.CharactersCharacterStat).ThenInclude(y => y.CharacterStat).ThenInclude(q => q.CharacterStatChoices)
                                .Include(d => d.CharacterStatTiles).ThenInclude(y => y.CharactersCharacterStat).ThenInclude(y => y.CharacterStat).ThenInclude(y => y.CharacterStatType)
                                .Include(d => d.CharacterStatTiles).ThenInclude(y => y.CharactersCharacterStat).ThenInclude(y => y.CharacterStat).ThenInclude(y => y.CharacterStatCalcs)
                .Include(d => d.CommandTiles)
                .Include(d => d.CounterTiles)
                .Include(d => d.NoteTiles)
                .Include(d => d.ImageTiles)
                .Include(d => d.LinkTiles).ThenInclude(y => y.Ability)
                .Include(d => d.LinkTiles).ThenInclude(y => y.Spell)
                .Include(d => d.LinkTiles).ThenInclude(y => y.Item)
                .Include(d => d.ExecuteTiles).ThenInclude(y => y.Ability)
                .Include(d => d.ExecuteTiles).ThenInclude(y => y.Spell)
                .Include(d => d.ExecuteTiles).ThenInclude(y => y.Item)
                 .Include(d => d.Config)
                 .AsNoTracking()
            .SingleOrDefault();

            if (characterTile.CharacterStatTiles != null)
                characterTile.CharacterStatTiles = characterTile.CharacterStatTiles.IsDeleted == false ? characterTile.CharacterStatTiles : null;
            if (characterTile.CommandTiles != null)
                characterTile.CommandTiles = characterTile.CommandTiles.IsDeleted == false ? characterTile.CommandTiles : null;
            if (characterTile.CounterTiles != null)
                characterTile.CounterTiles = characterTile.CounterTiles.IsDeleted == false ? characterTile.CounterTiles : null;
            if (characterTile.NoteTiles != null)
                characterTile.NoteTiles = characterTile.NoteTiles.IsDeleted == false ? characterTile.NoteTiles : null;
            if (characterTile.ImageTiles != null)
                characterTile.ImageTiles = characterTile.ImageTiles.IsDeleted == false ? characterTile.ImageTiles : null;
            if (characterTile.LinkTiles != null)
                characterTile.LinkTiles = characterTile.LinkTiles.IsDeleted == false ? characterTile.LinkTiles : null;
            if (characterTile.ExecuteTiles != null)
                characterTile.ExecuteTiles = characterTile.ExecuteTiles.IsDeleted == false ? characterTile.ExecuteTiles : null;

            return characterTile;
        }

        public int GetCountByPageIdCharacterId(int pageId, int characterId)
        {
            return _context.CharacterTiles
                .Where(x => x.CharacterDashboardPageId == pageId && x.CharacterId == characterId && x.IsDeleted != true).Count();
        }

        public List<CharacterTile> GetByPageIdCharacterId(int pageId, int characterId)
        {
            List<CharacterTile> _characterTiles = new List<CharacterTile>();
            _characterTiles = GetByPageIdCharacterId_sp(pageId, characterId);
            //_characterTiles = _context.CharacterTiles
            //    .Where(x => x.CharacterDashboardPageId == pageId
            //             && x.CharacterId == characterId
            //             && x.IsDeleted != true)
            //         .Include(d => d.Character)
            //         .Include(d => d.CharacterDashboardPage)
            //         .Include(d => d.CharacterStatTiles).ThenInclude(y => y.CharactersCharacterStat).ThenInclude(y => y.CharacterStat).ThenInclude(q => q.CharacterStatChoices)
            //         .Include(d => d.CharacterStatTiles).ThenInclude(y => y.CharactersCharacterStat).ThenInclude(y => y.CharacterStat).ThenInclude(y => y.CharacterStatType)
            //         .Include(d => d.CharacterStatTiles).ThenInclude(y => y.CharactersCharacterStat).ThenInclude(y => y.CharacterStat).ThenInclude(y => y.CharacterStatCalcs)
            //        .Include(d => d.CommandTiles)
            //        .Include(d => d.CounterTiles)
            //        .Include(d => d.NoteTiles)
            //        .Include(d => d.ImageTiles)
            //        .Include(d => d.LinkTiles).ThenInclude(y => y.Ability).ThenInclude(y => y.Ability)
            //        .Include(d => d.LinkTiles).ThenInclude(y => y.Spell).ThenInclude(y => y.Spell)
            //        .Include(d => d.LinkTiles).ThenInclude(y => y.Item)
            //        .Include(d => d.ExecuteTiles).ThenInclude(y => y.Ability).ThenInclude(y => y.Ability)
            //        .Include(d => d.ExecuteTiles).ThenInclude(y => y.Spell).ThenInclude(y => y.Spell)
            //        .Include(d => d.ExecuteTiles).ThenInclude(y => y.Item)
            //        .Include(d => d.Config)
            //        .AsNoTracking()
            //        .ToList();
            return _characterTiles;
        }
        public List<CharacterTile> GetByPageIdCharacterId_sp(int pageId, int characterId)
        {
            List<CharacterTile> tileList = new List<CharacterTile>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC Character_GetTilesByPageID @CharacterID = '" + characterId + "' ,@PageID='" + pageId + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("Character_GetTilesByPageID", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@CharacterID", characterId);
                command.Parameters.AddWithValue("@PageID", pageId);
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
            {
                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    CharacterTile tile = new CharacterTile();
                    tile.Height = row["Height"] == DBNull.Value ? 0 : Convert.ToInt32(row["Height"]);
                    tile.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                    tile.LocationX = row["LocationX"] == DBNull.Value ? 0 : Convert.ToInt32(row["LocationX"]);
                    tile.LocationY = row["LocationY"] == DBNull.Value ? 0 : Convert.ToInt32(row["LocationY"]);
                    tile.CharacterDashboardPageId = row["CharacterDashboardPageId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterDashboardPageId"]);
                    tile.CharacterId = row["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterId"]);
                    tile.CharacterTileId = row["CharacterTileId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterTileId"]);
                    tile.Shape = row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(row["Shape"]);
                    tile.SortOrder = row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(row["SortOrder"]);
                    tile.TileTypeId = row["TileTypeId"] == DBNull.Value ? 0 : Convert.ToInt32(row["TileTypeId"]);
                    tile.Width = row["Width"] == DBNull.Value ? 0 : Convert.ToInt32(row["Width"]);
                    switch (tile.TileTypeId)
                    {
                        case 1://NoteTiles
                            CharacterNoteTile NT = null;
                            if (ds.Tables[5].Rows.Count > 0)
                            {
                                foreach (DataRow NT_Row in ds.Tables[5].Rows)
                                {
                                    int CharacterTileId = NT_Row["CharacterTileId"] == DBNull.Value ? 0 : Convert.ToInt32(NT_Row["CharacterTileId"]);
                                    if (CharacterTileId == tile.CharacterTileId)
                                    {
                                        NT = new CharacterNoteTile();
                                        //DataRow NT_Row = ds.Tables[5].Rows[0];
                                        NT.BodyBgColor = NT_Row["BodyBgColor"] == DBNull.Value ? null : NT_Row["BodyBgColor"].ToString();
                                        NT.BodyTextColor = NT_Row["BodyTextColor"] == DBNull.Value ? null : NT_Row["BodyTextColor"].ToString();
                                        NT.Content = NT_Row["Content"] == DBNull.Value ? null : NT_Row["Content"].ToString();
                                        NT.IsDeleted = NT_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(NT_Row["IsDeleted"]);
                                        NT.NoteTileId = NT_Row["NoteTileId"] == DBNull.Value ? 0 : Convert.ToInt32(NT_Row["NoteTileId"]);
                                        NT.CharacterTileId = CharacterTileId;
                                        NT.Shape = NT_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(NT_Row["Shape"]);
                                        NT.SortOrder = NT_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(NT_Row["SortOrder"]);
                                        NT.Title = NT_Row["Title"] == DBNull.Value ? null : NT_Row["Title"].ToString();
                                        NT.TitleBgColor = NT_Row["TitleBgColor"] == DBNull.Value ? null : NT_Row["TitleBgColor"].ToString();
                                        NT.TitleTextColor = NT_Row["TitleTextColor"] == DBNull.Value ? null : NT_Row["TitleTextColor"].ToString();
                                    }
                                }
                            }
                            tile.NoteTiles = NT;
                            break;

                        case 2://ImageTiles
                            CharacterImageTile IT = null;
                            if (ds.Tables[6].Rows.Count > 0)
                            {
                                foreach (DataRow IT_Row in ds.Tables[6].Rows)
                                {
                                    int CharacterTileId = IT_Row["CharacterTileId"] == DBNull.Value ? 0 : Convert.ToInt32(IT_Row["CharacterTileId"]);
                                    if (CharacterTileId == tile.CharacterTileId)
                                    {
                                        IT = new CharacterImageTile();
                                        IT.BodyBgColor = IT_Row["BodyBgColor"] == DBNull.Value ? null : IT_Row["BodyBgColor"].ToString();
                                        IT.BodyTextColor = IT_Row["BodyTextColor"] == DBNull.Value ? null : IT_Row["BodyTextColor"].ToString();
                                        IT.IsDeleted = IT_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(IT_Row["IsDeleted"]);
                                        IT.ImageTileId = IT_Row["ImageTileId"] == DBNull.Value ? 0 : Convert.ToInt32(IT_Row["ImageTileId"]);
                                        IT.CharacterTileId = CharacterTileId;
                                        IT.Shape = IT_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(IT_Row["Shape"]);
                                        IT.SortOrder = IT_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(IT_Row["SortOrder"]);
                                        IT.Title = IT_Row["Title"] == DBNull.Value ? null : IT_Row["Title"].ToString();
                                        IT.TitleBgColor = IT_Row["TitleBgColor"] == DBNull.Value ? null : IT_Row["TitleBgColor"].ToString();
                                        IT.TitleTextColor = IT_Row["TitleTextColor"] == DBNull.Value ? null : IT_Row["TitleTextColor"].ToString();
                                        IT.ImageUrl = IT_Row["ImageUrl"] == DBNull.Value ? null : IT_Row["ImageUrl"].ToString();
                                    }
                                }
                            }
                            tile.ImageTiles = IT;
                            break;

                        case 3://CounterTiles
                            CharacterCounterTile CNT = null;
                            if (ds.Tables[4].Rows.Count > 0)
                            {
                                foreach (DataRow CNT_Row in ds.Tables[4].Rows)
                                {
                                    int CharacterTileId = CNT_Row["CharacterTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CNT_Row["CharacterTileId"]);
                                    if (CharacterTileId == tile.CharacterTileId)
                                    {
                                        CNT = new CharacterCounterTile();
                                        CNT.BodyBgColor = CNT_Row["BodyBgColor"] == DBNull.Value ? null : CNT_Row["BodyBgColor"].ToString();
                                        CNT.BodyTextColor = CNT_Row["BodyTextColor"] == DBNull.Value ? null : CNT_Row["BodyTextColor"].ToString();
                                        CNT.IsDeleted = CNT_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CNT_Row["IsDeleted"]);
                                        CNT.CounterTileId = CNT_Row["CounterTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CNT_Row["CounterTileId"]);
                                        CNT.CharacterTileId = CharacterTileId;
                                        CNT.Shape = CNT_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(CNT_Row["Shape"]);
                                        CNT.SortOrder = CNT_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(CNT_Row["SortOrder"]);
                                        CNT.Title = CNT_Row["Title"] == DBNull.Value ? null : CNT_Row["Title"].ToString();
                                        CNT.TitleBgColor = CNT_Row["TitleBgColor"] == DBNull.Value ? null : CNT_Row["TitleBgColor"].ToString();
                                        CNT.TitleTextColor = CNT_Row["TitleTextColor"] == DBNull.Value ? null : CNT_Row["TitleTextColor"].ToString();
                                        CNT.CurrentValue = CNT_Row["CurrentValue"] == DBNull.Value ? 0 : Convert.ToInt32(CNT_Row["CurrentValue"]);
                                        CNT.DefaultValue = CNT_Row["DefaultValue"] == DBNull.Value ? 0 : Convert.ToInt32(CNT_Row["DefaultValue"]);
                                        CNT.Maximum = CNT_Row["Maximum"] == DBNull.Value ? (int?)null : Convert.ToInt32(CNT_Row["Maximum"]);
                                        CNT.Minimum = CNT_Row["Minimum"] == DBNull.Value ? (int?)null : Convert.ToInt32(CNT_Row["Minimum"]);
                                        CNT.Step = CNT_Row["Step"] == DBNull.Value ? 1 : Convert.ToInt32(CNT_Row["Step"]);//default step=1 
                                    }
                                }
                            }
                            tile.CounterTiles = CNT;
                            break;

                        case 4://CharacterStatTiles
                            CharacterCharacterStatTile CST = null;
                            if (ds.Tables[7].Rows.Count > 0)
                            {
                                foreach (DataRow CST_Row in ds.Tables[7].Rows)
                                {
                                    int CharacterTileId = CST_Row["CharacterTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CST_Row["CharacterTileId"]);
                                    if (CharacterTileId == tile.CharacterTileId)
                                    {
                                        CST = new CharacterCharacterStatTile();
                                        CST.bodyBgColor = CST_Row["bodyBgColor"] == DBNull.Value ? null : CST_Row["bodyBgColor"].ToString();
                                        CST.bodyTextColor = CST_Row["bodyTextColor"] == DBNull.Value ? null : CST_Row["bodyTextColor"].ToString();
                                        CST.IsDeleted = CST_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CST_Row["IsDeleted"]);
                                        CST.CharacterStatTileId = CST_Row["CharacterStatTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CST_Row["CharacterStatTileId"]);
                                        CST.CharacterTileId = CharacterTileId;
                                        CST.Shape = CST_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(CST_Row["Shape"]);
                                        CST.SortOrder = CST_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(CST_Row["SortOrder"]);
                                        CST.titleBgColor = CST_Row["titleBgColor"] == DBNull.Value ? null : CST_Row["titleBgColor"].ToString();
                                        CST.titleTextColor = CST_Row["titleTextColor"] == DBNull.Value ? null : CST_Row["titleTextColor"].ToString();
                                        //CST.CharacterStatId = CST_Row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CST_Row["CharacterStatId"]);
                                        CST.CharactersCharacterStatId = CST_Row["CharactersCharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CST_Row["CharactersCharacterStatId"]);
                                        CST.ShowTitle = CST_Row["ShowTitle"] == DBNull.Value ? false : Convert.ToBoolean(CST_Row["ShowTitle"]);
                                        CST.DisplayLinkImage = CST_Row["DisplayLinkImage"] == DBNull.Value ? false : Convert.ToBoolean(CST_Row["DisplayLinkImage"]);
                                        CST.ImageUrl = CST_Row["ImageUrl"] == DBNull.Value ? null : CST_Row["ImageUrl"].ToString();

                                        CharactersCharacterStat CharCharStat = null;
                                        if (ds.Tables[8].Rows.Count > 0)
                                        {
                                            foreach (DataRow CharCharStat_Row in ds.Tables[8].Rows)
                                            {
                                                int? nullInt = null;
                                                int CharactersCharacterStatId = CharCharStat_Row["CharactersCharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["CharactersCharacterStatId"]);
                                                if (CharactersCharacterStatId == CST.CharactersCharacterStatId)
                                                {
                                                    CharCharStat = new CharactersCharacterStat();
                                                    CharCharStat.CharactersCharacterStatId = CharactersCharacterStatId;
                                                    CharCharStat.CharacterStatId = CharCharStat_Row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["CharacterStatId"]);
                                                    CharCharStat.CharacterId = CharCharStat_Row["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["CharacterId"]);
                                                    CharCharStat.Text = CharCharStat_Row["Text"] == DBNull.Value ? null : CharCharStat_Row["Text"].ToString();
                                                    CharCharStat.RichText = CharCharStat_Row["RichText"] == DBNull.Value ? null : CharCharStat_Row["RichText"].ToString();
                                                    CharCharStat.Choice = CharCharStat_Row["Choice"] == DBNull.Value ? null : CharCharStat_Row["Choice"].ToString();
                                                    CharCharStat.MultiChoice = CharCharStat_Row["MultiChoice"] == DBNull.Value ? null : CharCharStat_Row["MultiChoice"].ToString();
                                                    CharCharStat.Command = CharCharStat_Row["Command"] == DBNull.Value ? null : CharCharStat_Row["Command"].ToString();
                                                    CharCharStat.YesNo = CharCharStat_Row["YesNo"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["YesNo"]);
                                                    CharCharStat.OnOff = CharCharStat_Row["OnOff"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["OnOff"]);
                                                    CharCharStat.Value = CharCharStat_Row["Value"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["Value"]);
                                                    CharCharStat.Number = CharCharStat_Row["Number"] == DBNull.Value ? (int?)null : Convert.ToInt32(CharCharStat_Row["Number"]);
                                                    CharCharStat.SubValue = CharCharStat_Row["SubValue"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["SubValue"]);
                                                    CharCharStat.Current = CharCharStat_Row["Current"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["Current"]);
                                                    CharCharStat.Maximum = CharCharStat_Row["Maximum"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["Maximum"]);
                                                    CharCharStat.CalculationResult = CharCharStat_Row["CalculationResult"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["CalculationResult"]);
                                                    CharCharStat.Minimum = CharCharStat_Row["Minimum"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["Minimum"]);
                                                    CharCharStat.DefaultValue = CharCharStat_Row["DefaultValue"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["DefaultValue"]);
                                                    CharCharStat.ComboText = CharCharStat_Row["ComboText"] == DBNull.Value ? null : CharCharStat_Row["ComboText"].ToString();
                                                    CharCharStat.IsDeleted = CharCharStat_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["IsDeleted"]);
                                                    CharCharStat.Display = CharCharStat_Row["Display"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["Display"]);
                                                    CharCharStat.ShowCheckbox = CharCharStat_Row["ShowCheckbox"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["ShowCheckbox"]);
                                                    CharCharStat.IsCustom = CharCharStat_Row["IsCustom"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["IsCustom"]);
                                                    //CharCharStat.CustomToggleId = CharCharStat_Row["CustomToggleId"] == DBNull.Value ? nullInt : Convert.ToInt32(CharCharStat_Row["CustomToggleId"]);
                                                    CharCharStat.IsYes = CharCharStat_Row["IsYes"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["IsYes"]);
                                                    CharCharStat.IsOn = CharCharStat_Row["IsOn"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["IsOn"]);
                                                    CharCharStat.LinkType = CharCharStat_Row["LinkType"] == DBNull.Value ? null : CharCharStat_Row["LinkType"].ToString();
                                                    CharacterStat CharStat = null;
                                                    short num = 0;
                                                    int characterstatID = CharCharStat_Row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["CharacterStatId"]);
                                                    if (characterstatID == CharCharStat.CharacterStatId)
                                                    {
                                                        CharStat = new CharacterStat();


                                                        CharStat.CharacterStatDefaultValues = new List<CharacterStatDefaultValue>();
                                                        if (ds.Tables[22].Rows.Count > 0)
                                                        {
                                                            foreach (DataRow DefaultVal_Row in ds.Tables[22].Rows)
                                                            {
                                                                int DefaultValcharacterstatID = DefaultVal_Row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(DefaultVal_Row["CharacterStatId"]);
                                                                if (DefaultValcharacterstatID == CharCharStat.CharacterStatId)
                                                                {
                                                                    CharStat.CharacterStatDefaultValues.Add(new CharacterStatDefaultValue()
                                                                    {
                                                                        CharacterStatDefaultValueId = DefaultVal_Row["CharacterStatDefaultValueId"] == DBNull.Value ? 0 : Convert.ToInt32(DefaultVal_Row["CharacterStatDefaultValueId"]),
                                                                        CharacterStatId = DefaultVal_Row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(DefaultVal_Row["CharacterStatId"]),
                                                                        DefaultValue = DefaultVal_Row["DefaultValue"] == DBNull.Value ? string.Empty : DefaultVal_Row["DefaultValue"].ToString(),
                                                                        Minimum = DefaultVal_Row["Minimum"] == DBNull.Value ? 0 : Convert.ToInt32(DefaultVal_Row["Minimum"]),
                                                                        Maximum = DefaultVal_Row["Maximum"] == DBNull.Value ? 0 : Convert.ToInt32(DefaultVal_Row["Maximum"]),
                                                                        Type = DefaultVal_Row["Type"] == DBNull.Value ? 0 : Convert.ToInt32(DefaultVal_Row["Type"])
                                                                    });
                                                                }
                                                            }
                                                        }

                                                        //List<CharacterStatDefaultValue> defvaluesList = _characterStatDefaultValueService.GetCharacterStatDefaultValue(characterstatID).Result;
                                                        //CharStat.CharacterStatDefaultValues = new List<CharacterStatDefaultValue>();
                                                        //foreach (var def in defvaluesList) {
                                                        //    CharStat.CharacterStatDefaultValues.Add(new CharacterStatDefaultValue()
                                                        //    {
                                                        //        CharacterStatDefaultValueId = def.CharacterStatDefaultValueId,
                                                        //        CharacterStatId = def.CharacterStatId,
                                                        //        DefaultValue = def.DefaultValue,
                                                        //        Minimum = def.Minimum,
                                                        //        Maximum = def.Maximum,
                                                        //        Type = def.Type
                                                        //    });
                                                        //};

                                                      utility.FillConditionStats(ds, CharCharStat, CharStat,23);

                                                        //CharStat.CharacterStatConditions = _characterStatConditionService.GetByStatId(characterstatID).Result;
                                                        //foreach (var cond in CharStat.CharacterStatConditions)
                                                        //{
                                                        //    cond.ConditionOperator = _characterStatConditionService.GetConditionOperatorById(cond.ConditionOperatorID);
                                                        //}



                                                        CharStat.CharacterStatId = characterstatID;
                                                        CharStat.RuleSetId = CharCharStat_Row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["RuleSetId"]);
                                                        CharStat.StatName = CharCharStat_Row["StatName"] == DBNull.Value ? null : CharCharStat_Row["StatName"].ToString();
                                                        CharStat.StatDesc = CharCharStat_Row["StatDesc"] == DBNull.Value ? null : CharCharStat_Row["StatDesc"].ToString();
                                                        CharStat.isActive = CharCharStat_Row["isActive"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["isActive"]);
                                                        CharStat.CharacterStatTypeId = CharCharStat_Row["CharacterStatTypeId"] == DBNull.Value ? num : (short)(CharCharStat_Row["CharacterStatTypeId"]);
                                                        CharStat.isMultiSelect = CharCharStat_Row["isMultiSelect"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["isMultiSelect"]);
                                                        CharStat.ParentCharacterStatId = CharCharStat_Row["ParentCharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["ParentCharacterStatId"]);
                                                        CharStat.SortOrder = CharCharStat_Row["SortOrder"] == DBNull.Value ? num : (short)(CharCharStat_Row["SortOrder"]);
                                                        CharStat.IsDeleted = CharCharStat_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["IsDeleted"]);
                                                        CharStat.IsChoiceNumeric = CharCharStat_Row["IsChoiceNumeric"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["IsChoiceNumeric"]);
                                                        CharStat.IsChoicesFromAnotherStat = CharCharStat_Row["IsChoicesFromAnotherStat"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["IsChoicesFromAnotherStat"]);
                                                        CharStat.SelectedChoiceCharacterStatId = CharCharStat_Row["SelectedChoiceCharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["SelectedChoiceCharacterStatId"]);

                                                        utility.FillStatChoices(ds, CharStat, characterstatID, 10);
                                                        utility.FillStatCalcs(ds, CharStat, characterstatID, 9);
                                                        CharacterStatType statType = null;
                                                        if (ds.Tables[11].Rows.Count > 0)
                                                        {
                                                            foreach (DataRow r in ds.Tables[11].Rows)
                                                            {
                                                                short CharacterStatTypeID = r["CharacterStatTypeId"] == DBNull.Value ? num : (short)(r["CharacterStatTypeId"]);
                                                                if (CharacterStatTypeID == CharStat.CharacterStatTypeId)
                                                                {
                                                                    statType = new CharacterStatType();
                                                                    statType.CharacterStatTypeId = CharacterStatTypeID;
                                                                    statType.StatTypeName = r["StatTypeName"] == DBNull.Value ? null : r["StatTypeName"].ToString();
                                                                    statType.StatTypeDesc = r["StatTypeDesc"] == DBNull.Value ? null : r["StatTypeDesc"].ToString();
                                                                    statType.isNumeric = r["isNumeric"] == DBNull.Value ? false : Convert.ToBoolean(r["isNumeric"]);
                                                                    statType.TypeId = r["TypeId"] == DBNull.Value ? num : (short)(r["TypeId"]);
                                                                }
                                                            }
                                                        }
                                                        CharStat.CharacterStatType = statType;
                                                    }


                                                    CharCharStat.CharacterStat = CharStat;

                                                    List<CharacterCustomToggle> characterCustomToggle = new List<CharacterCustomToggle>();
                                                    if (CharCharStat.IsCustom)
                                                    {
                                                        CharCharStat.CharacterCustomToggles = characterCustomToggle;
                                                        if (ds.Tables[24].Rows.Count > 0)
                                                        {
                                                            foreach (DataRow CustomToggle_Row in ds.Tables[24].Rows)
                                                            {
                                                                int CustomTogglecharacterstatID = CustomToggle_Row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CustomToggle_Row["CharacterStatId"]);
                                                                if (CustomTogglecharacterstatID == CharCharStat.CharacterStatId)
                                                                {
                                                                    characterCustomToggle.Add(new CharacterCustomToggle()
                                                                    {
                                                                        CustomToggleId = CustomToggle_Row["CustomToggleId"] == DBNull.Value ? 0 : Convert.ToInt32(CustomToggle_Row["CustomToggleId"]),
                                                                        Image = CustomToggle_Row["Image"] == DBNull.Value ? string.Empty : CustomToggle_Row["Image"].ToString(),
                                                                        IsDeleted = CustomToggle_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CustomToggle_Row["IsDeleted"]),
                                                                        ToggleText = CustomToggle_Row["ToggleText"] == DBNull.Value ? string.Empty : CustomToggle_Row["ToggleText"].ToString(),
                                                                    });
                                                                }
                                                            }
                                                        }                                                      

                                                        //CharacterStatToggle CharacterStatToggle = GetCharacterStatToggleList((int)CharCharStat.CharacterStatId);
                                                        //if (CharacterStatToggle != null)
                                                        //{
                                                        //    foreach (var toggle in CharacterStatToggle.CustomToggles)
                                                        //    {
                                                        //        characterCustomToggle.Add(new CharacterCustomToggle()
                                                        //        {
                                                        //            CustomToggleId = toggle.CustomToggleId,
                                                        //            Image = toggle.Image,
                                                        //            IsDeleted = toggle.IsDeleted,
                                                        //            ToggleText = toggle.ToggleText,
                                                        //        });
                                                        //    }
                                                        //}
                                                    }
                                                    CharCharStat.CharacterCustomToggles = characterCustomToggle;
                                                }

                                            }
                                        }
                                        CST.CharactersCharacterStat = CharCharStat;
                                    }
                                }
                            }
                            tile.CharacterStatTiles = CST;
                            break;
                        case 5://LinkTiles
                            CharacterLinkTile CLT = null;
                            if (ds.Tables[13].Rows.Count > 0)
                            {
                                foreach (DataRow CLT_Row in ds.Tables[13].Rows)
                                {
                                    int CharacterTileId = CLT_Row["CharacterTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CLT_Row["CharacterTileId"]);
                                    if (CharacterTileId == tile.CharacterTileId)
                                    {
                                        CLT = new CharacterLinkTile();
                                        CLT.AbilityId = CLT_Row["AbilityId"] == DBNull.Value ? null : (int?)(CLT_Row["AbilityId"]);
                                        CLT.BuffAndEffectId = CLT_Row["BuffAndEffectId"] == DBNull.Value ? null : (int?)(CLT_Row["BuffAndEffectId"]);
                                        CLT.BodyBgColor = CLT_Row["BodyBgColor"] == DBNull.Value ? null : CLT_Row["BodyBgColor"].ToString();
                                        CLT.BodyTextColor = CLT_Row["BodyTextColor"] == DBNull.Value ? null : CLT_Row["BodyTextColor"].ToString();
                                        CLT.CharacterTileId = CharacterTileId;
                                        CLT.IsDeleted = CLT_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CLT_Row["IsDeleted"]);
                                        CLT.ItemId = CLT_Row["ItemId"] == DBNull.Value ? null : (int?)(CLT_Row["ItemId"]);
                                        CLT.LinkTileId = CLT_Row["LinkTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CLT_Row["LinkTileId"]);
                                        CLT.LinkType = CLT_Row["LinkType"] == DBNull.Value ? null : CLT_Row["LinkType"].ToString();
                                        CLT.Shape = CLT_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(CLT_Row["Shape"]);
                                        CLT.ShowTitle = CLT_Row["ShowTitle"] == DBNull.Value ? false : Convert.ToBoolean(CLT_Row["ShowTitle"]);
                                        CLT.SortOrder = CLT_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(CLT_Row["SortOrder"]);
                                        CLT.SpellId = CLT_Row["SpellId"] == DBNull.Value ? null : (int?)(CLT_Row["SpellId"]);
                                        CLT.TitleBgColor = CLT_Row["TitleBgColor"] == DBNull.Value ? null : CLT_Row["TitleBgColor"].ToString();
                                        CLT.TitleTextColor = CLT_Row["TitleTextColor"] == DBNull.Value ? null : CLT_Row["TitleTextColor"].ToString();
                                        CLT.DisplayLinkImage = CLT_Row["DisplayLinkImage"] == DBNull.Value ? false : Convert.ToBoolean(CLT_Row["DisplayLinkImage"]);
                                        CLT.Ability = null;
                                        CLT.Item = null;
                                        CLT.Spell = null;
                                        if (CLT.AbilityId != null)
                                        {
                                            if (ds.Tables[14].Rows.Count > 0)
                                            {
                                                foreach (DataRow CA_Row in ds.Tables[14].Rows)
                                                {
                                                    int CharacterAbilityId = CA_Row["CharacterAbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(CA_Row["CharacterAbilityId"]);
                                                    if (CharacterAbilityId == CLT.AbilityId)
                                                    {
                                                        CharacterAbility ca = new CharacterAbility();
                                                        ca.CharacterAbilityId = CharacterAbilityId;
                                                        ca.CharacterId = CA_Row["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(CA_Row["CharacterId"]);
                                                        ca.IsEnabled = CA_Row["IsEnabled"] == DBNull.Value ? false : Convert.ToBoolean(CA_Row["IsEnabled"]);
                                                        ca.AbilityId = CA_Row["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(CA_Row["AbilityId"]);
                                                        ca.IsDeleted = CA_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CA_Row["IsDeleted"]);

                                                        Ability a = new Ability();
                                                        a.AbilityId = CA_Row["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(CA_Row["AbilityId"]);
                                                        a.RuleSetId = CA_Row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(CA_Row["RuleSetId"]);
                                                        a.Name = CA_Row["Name"] == DBNull.Value ? null : CA_Row["Name"].ToString();
                                                        a.Command = CA_Row["Command"] == DBNull.Value ? null : CA_Row["Command"].ToString();
                                                        a.ImageUrl = CA_Row["ImageUrl"] == DBNull.Value ? null : CA_Row["ImageUrl"].ToString();
                                                        a.ParentAbilityId = CA_Row["ParentAbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(CA_Row["ParentAbilityId"]);
                                                        a.IsDeleted = CA_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CA_Row["IsDeleted"]);
                                                        a.Description = CA_Row["Description"] == DBNull.Value ? null : CA_Row["Description"].ToString();
                                                        ca.Ability = a;

                                                        CLT.Ability = ca;
                                                    }
                                                }
                                            }
                                        }
                                        else if (CLT.ItemId != null)
                                        {
                                            if (ds.Tables[16].Rows.Count > 0)
                                            {
                                                foreach (DataRow CI_Row in ds.Tables[16].Rows)
                                                {
                                                    int ItemId = CI_Row["ItemId"] == DBNull.Value ? 0 : Convert.ToInt32(CI_Row["ItemId"]);
                                                    if (ItemId == CLT.ItemId)
                                                    {
                                                        Item i = new Item();
                                                        i.ItemId = ItemId;
                                                        i.Name = CI_Row["Name"] == DBNull.Value ? null : CI_Row["Name"].ToString();
                                                        i.ItemImage = CI_Row["ItemImage"] == DBNull.Value ? null : CI_Row["ItemImage"].ToString();
                                                        i.CharacterId = CI_Row["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(CI_Row["CharacterId"]);
                                                        i.ItemMasterId = CI_Row["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(CI_Row["ItemMasterId"]);
                                                        i.ParentItemId = CI_Row["ParentItemId"] == DBNull.Value ? 0 : Convert.ToInt32(CI_Row["ParentItemId"]);
                                                        i.IsDeleted = CI_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CI_Row["IsDeleted"]);
                                                        i.Command = CI_Row["Command"] == DBNull.Value ? null : CI_Row["Command"].ToString();
                                                        i.Description = CI_Row["Description"] == DBNull.Value ? null : CI_Row["Description"].ToString();
                                                        CLT.Item = i;
                                                    }
                                                }
                                            }
                                        }
                                        else if (CLT.SpellId != null)
                                        {
                                            if (ds.Tables[15].Rows.Count > 0)
                                            {
                                                foreach (DataRow CS_Row in ds.Tables[15].Rows)
                                                {
                                                    int CharacterSpellID = CS_Row["CharacterSpellID"] == DBNull.Value ? 0 : Convert.ToInt32(CS_Row["CharacterSpellID"]);
                                                    if (CharacterSpellID == CLT.SpellId)
                                                    {
                                                        CharacterSpell cs = new CharacterSpell();
                                                        cs.CharacterSpellId = CharacterSpellID;
                                                        cs.CharacterId = CS_Row["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(CS_Row["CharacterId"]);
                                                        cs.IsMemorized = CS_Row["IsMemorized"] == DBNull.Value ? false : Convert.ToBoolean(CS_Row["IsMemorized"]);
                                                        cs.SpellId = CS_Row["SpellId"] == DBNull.Value ? 0 : Convert.ToInt32(CS_Row["SpellId"]);
                                                        cs.IsDeleted = CS_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CS_Row["IsDeleted"]);

                                                        Spell s = new Spell();
                                                        s.SpellId = CS_Row["SpellId"] == DBNull.Value ? 0 : Convert.ToInt32(CS_Row["SpellId"]);
                                                        s.RuleSetId = CS_Row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(CS_Row["RuleSetId"]);
                                                        s.Name = CS_Row["Name"] == DBNull.Value ? null : CS_Row["Name"].ToString();
                                                        s.Command = CS_Row["Command"] == DBNull.Value ? null : CS_Row["Command"].ToString();
                                                        s.ImageUrl = CS_Row["ImageUrl"] == DBNull.Value ? null : CS_Row["ImageUrl"].ToString();
                                                        s.ParentSpellId = CS_Row["ParentSpellId"] == DBNull.Value ? 0 : Convert.ToInt32(CS_Row["ParentSpellId"]);
                                                        s.IsDeleted = CS_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CS_Row["IsDeleted"]);
                                                        s.Description = CS_Row["Description"] == DBNull.Value ? null : CS_Row["Description"].ToString();
                                                        cs.Spell = s;

                                                        CLT.Spell = cs;
                                                    }
                                                }
                                            }
                                        }
                                        else if (CLT.BuffAndEffectId != null)
                                        {
                                            if (ds.Tables[25].Rows.Count > 0)
                                            {
                                                foreach (DataRow CBE_Row in ds.Tables[25].Rows)
                                                {
                                                    int CharacterBuffAandEffectId = CBE_Row["CharacterBuffAandEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(CBE_Row["CharacterBuffAandEffectId"]);
                                                    if (CharacterBuffAandEffectId == CLT.BuffAndEffectId)
                                                    {
                                                        CharacterBuffAndEffect cbe = new CharacterBuffAndEffect();
                                                        cbe.CharacterBuffAandEffectId = CharacterBuffAandEffectId;
                                                        cbe.CharacterId = CBE_Row["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(CBE_Row["CharacterId"]);
                                                        cbe.BuffAndEffectID = CBE_Row["BuffAndEffectID"] == DBNull.Value ? 0 : Convert.ToInt32(CBE_Row["BuffAndEffectID"]);
                                                        

                                                        BuffAndEffect be = new BuffAndEffect();
                                                        be.BuffAndEffectId = CBE_Row["BuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(CBE_Row["BuffAndEffectId"]);
                                                        be.RuleSetId = CBE_Row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(CBE_Row["RuleSetId"]);
                                                        be.Name = CBE_Row["Name"] == DBNull.Value ? null : CBE_Row["Name"].ToString();
                                                        be.Command = CBE_Row["Command"] == DBNull.Value ? null : CBE_Row["Command"].ToString();
                                                        be.ImageUrl = CBE_Row["ImageUrl"] == DBNull.Value ? null : CBE_Row["ImageUrl"].ToString();
                                                        be.ParentBuffAndEffectId = CBE_Row["ParentBuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(CBE_Row["ParentBuffAndEffectId"]);
                                                        be.IsDeleted = CBE_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CBE_Row["IsDeleted"]);
                                                        be.Description = CBE_Row["Description"] == DBNull.Value ? null : CBE_Row["Description"].ToString();

                                                        cbe.BuffAndEffect = be;

                                                        CLT.BuffAndEffect = cbe;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            tile.LinkTiles = CLT;
                            break;
                        case 6://ExecuteTiles
                            CharacterExecuteTile CEXT = null;
                            if (ds.Tables[17].Rows.Count > 0)
                            {
                                foreach (DataRow CEXT_Row in ds.Tables[17].Rows)
                                {
                                    int CharacterTileId = CEXT_Row["CharacterTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CEXT_Row["CharacterTileId"]);
                                    if (CharacterTileId == tile.CharacterTileId)
                                    {
                                        CEXT = new CharacterExecuteTile();
                                        CEXT.AbilityId = CEXT_Row["AbilityId"] == DBNull.Value ? null : (int?)(CEXT_Row["AbilityId"]);
                                        CEXT.BuffAndEffectId = CEXT_Row["BuffAndEffectId"] == DBNull.Value ? null : (int?)(CEXT_Row["BuffAndEffectId"]);
                                        CEXT.BodyBgColor = CEXT_Row["BodyBgColor"] == DBNull.Value ? null : CEXT_Row["BodyBgColor"].ToString();
                                        CEXT.BodyTextColor = CEXT_Row["BodyTextColor"] == DBNull.Value ? null : CEXT_Row["BodyTextColor"].ToString();
                                        CEXT.CharacterTileId = CharacterTileId;
                                        CEXT.IsDeleted = CEXT_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CEXT_Row["IsDeleted"]);
                                        CEXT.ItemId = CEXT_Row["ItemId"] == DBNull.Value ? null : (int?)(CEXT_Row["ItemId"]);
                                        CEXT.ExecuteTileId = CEXT_Row["ExecuteTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CEXT_Row["ExecuteTileId"]);
                                        CEXT.LinkType = CEXT_Row["LinkType"] == DBNull.Value ? null : CEXT_Row["LinkType"].ToString();
                                        CEXT.Shape = CEXT_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(CEXT_Row["Shape"]);
                                        CEXT.ShowTitle = CEXT_Row["ShowTitle"] == DBNull.Value ? false : Convert.ToBoolean(CEXT_Row["ShowTitle"]);
                                        CEXT.SortOrder = CEXT_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(CEXT_Row["SortOrder"]);
                                        CEXT.SpellId = CEXT_Row["SpellId"] == DBNull.Value ? null : (int?)(CEXT_Row["SpellId"]);
                                        CEXT.CommandId = CEXT_Row["CommandId"] == DBNull.Value ? null : (int?)(CEXT_Row["CommandId"]);
                                        CEXT.TitleBgColor = CEXT_Row["TitleBgColor"] == DBNull.Value ? null : CEXT_Row["TitleBgColor"].ToString();
                                        CEXT.TitleTextColor = CEXT_Row["TitleTextColor"] == DBNull.Value ? null : CEXT_Row["TitleTextColor"].ToString();
                                        CEXT.DisplayLinkImage = CEXT_Row["DisplayLinkImage"] == DBNull.Value ? false : Convert.ToBoolean(CEXT_Row["DisplayLinkImage"]);
                                        CEXT.Ability = null;
                                        CEXT.Item = null;
                                        CEXT.Spell = null;
                                        if (CEXT.AbilityId != null)
                                        {
                                            if (ds.Tables[18].Rows.Count > 0)
                                            {
                                                foreach (DataRow CA_Row in ds.Tables[18].Rows)
                                                {
                                                    int CharacterAbilityId = CA_Row["CharacterAbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(CA_Row["CharacterAbilityId"]);
                                                    if (CharacterAbilityId == CEXT.AbilityId)
                                                    {
                                                        CharacterAbility ca = new CharacterAbility();
                                                        ca.CharacterAbilityId = CharacterAbilityId;
                                                        ca.CharacterId = CA_Row["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(CA_Row["CharacterId"]);
                                                        ca.IsEnabled = CA_Row["IsEnabled"] == DBNull.Value ? false : Convert.ToBoolean(CA_Row["IsEnabled"]);
                                                        ca.AbilityId = CA_Row["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(CA_Row["AbilityId"]);
                                                        ca.IsDeleted = CA_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CA_Row["IsDeleted"]);

                                                        Ability a = new Ability();
                                                        a.AbilityId = CA_Row["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(CA_Row["AbilityId"]);
                                                        a.RuleSetId = CA_Row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(CA_Row["RuleSetId"]);
                                                        a.Name = CA_Row["Name"] == DBNull.Value ? null : CA_Row["Name"].ToString();
                                                        a.Command = CA_Row["Command"] == DBNull.Value ? null : CA_Row["Command"].ToString();
                                                        a.CommandName = CA_Row["CommandName"] == DBNull.Value ? null : CA_Row["CommandName"].ToString();
                                                        a.ImageUrl = CA_Row["ImageUrl"] == DBNull.Value ? null : CA_Row["ImageUrl"].ToString();
                                                        a.ParentAbilityId = CA_Row["ParentAbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(CA_Row["ParentAbilityId"]);
                                                        a.IsDeleted = CA_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CA_Row["IsDeleted"]);
                                                        ca.Ability = a;

                                                        CEXT.Ability = ca;
                                                    }
                                                }
                                            }
                                        }
                                        else if (CEXT.ItemId != null)
                                        {
                                            if (ds.Tables[20].Rows.Count > 0)
                                            {
                                                foreach (DataRow CI_Row in ds.Tables[20].Rows)
                                                {
                                                    int ItemId = CI_Row["ItemId"] == DBNull.Value ? 0 : Convert.ToInt32(CI_Row["ItemId"]);
                                                    if (ItemId == CEXT.ItemId)
                                                    {
                                                        Item i = new Item();
                                                        i.ItemId = ItemId;
                                                        i.Name = CI_Row["Name"] == DBNull.Value ? null : CI_Row["Name"].ToString();
                                                        i.ItemImage = CI_Row["ItemImage"] == DBNull.Value ? null : CI_Row["ItemImage"].ToString();
                                                        i.CharacterId = CI_Row["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(CI_Row["CharacterId"]);
                                                        i.ItemMasterId = CI_Row["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(CI_Row["ItemMasterId"]);
                                                        i.ParentItemId = CI_Row["ParentItemId"] == DBNull.Value ? 0 : Convert.ToInt32(CI_Row["ParentItemId"]);
                                                        i.IsDeleted = CI_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CI_Row["IsDeleted"]);
                                                        i.Command = CI_Row["Command"] == DBNull.Value ? null : CI_Row["Command"].ToString();
                                                        i.CommandName = CI_Row["CommandName"] == DBNull.Value ? null : CI_Row["CommandName"].ToString();

                                                        CEXT.Item = i;
                                                    }
                                                }
                                            }
                                        }
                                        else if (CEXT.SpellId != null)
                                        {
                                            if (ds.Tables[19].Rows.Count > 0)
                                            {
                                                foreach (DataRow CS_Row in ds.Tables[19].Rows)
                                                {
                                                    int CharacterSpellID = CS_Row["CharacterSpellID"] == DBNull.Value ? 0 : Convert.ToInt32(CS_Row["CharacterSpellID"]);
                                                    if (CharacterSpellID == CEXT.SpellId)
                                                    {
                                                        CharacterSpell cs = new CharacterSpell();
                                                        cs.CharacterSpellId = CharacterSpellID;
                                                        cs.CharacterId = CS_Row["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(CS_Row["CharacterId"]);
                                                        cs.IsMemorized = CS_Row["IsMemorized"] == DBNull.Value ? false : Convert.ToBoolean(CS_Row["IsMemorized"]);
                                                        cs.SpellId = CS_Row["SpellId"] == DBNull.Value ? 0 : Convert.ToInt32(CS_Row["SpellId"]);
                                                        cs.IsDeleted = CS_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CS_Row["IsDeleted"]);

                                                        Spell s = new Spell();
                                                        s.SpellId = CS_Row["SpellId"] == DBNull.Value ? 0 : Convert.ToInt32(CS_Row["SpellId"]);
                                                        s.RuleSetId = CS_Row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(CS_Row["RuleSetId"]);
                                                        s.Name = CS_Row["Name"] == DBNull.Value ? null : CS_Row["Name"].ToString();
                                                        s.Command = CS_Row["Command"] == DBNull.Value ? null : CS_Row["Command"].ToString();
                                                        s.CommandName = CS_Row["CommandName"] == DBNull.Value ? null : CS_Row["CommandName"].ToString();
                                                        s.ImageUrl = CS_Row["ImageUrl"] == DBNull.Value ? null : CS_Row["ImageUrl"].ToString();
                                                        s.ParentSpellId = CS_Row["ParentSpellId"] == DBNull.Value ? 0 : Convert.ToInt32(CS_Row["ParentSpellId"]);
                                                        s.IsDeleted = CS_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CS_Row["IsDeleted"]);
                                                        cs.Spell = s;

                                                        CEXT.Spell = cs;
                                                    }
                                                }
                                            }
                                        }
                                        else if (CEXT.BuffAndEffectId != null)
                                        {
                                            if (ds.Tables[26].Rows.Count > 0)
                                            {
                                                foreach (DataRow CBE_Row in ds.Tables[26].Rows)
                                                {
                                                    int CharacterBuffAandEffectId = CBE_Row["CharacterBuffAandEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(CBE_Row["CharacterBuffAandEffectId"]);
                                                    if (CharacterBuffAandEffectId == CEXT.BuffAndEffectId)
                                                    {
                                                        CharacterBuffAndEffect cbe = new CharacterBuffAndEffect();
                                                        cbe.CharacterBuffAandEffectId = CharacterBuffAandEffectId;
                                                        cbe.CharacterId = CBE_Row["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(CBE_Row["CharacterId"]);
                                                        cbe.BuffAndEffectID = CBE_Row["BuffAndEffectID"] == DBNull.Value ? 0 : Convert.ToInt32(CBE_Row["BuffAndEffectID"]);                                                        

                                                        BuffAndEffect be = new BuffAndEffect();
                                                        be.BuffAndEffectId = CBE_Row["BuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(CBE_Row["BuffAndEffectId"]);
                                                        be.RuleSetId = CBE_Row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(CBE_Row["RuleSetId"]);
                                                        be.Name = CBE_Row["Name"] == DBNull.Value ? null : CBE_Row["Name"].ToString();
                                                        be.Command = CBE_Row["Command"] == DBNull.Value ? null : CBE_Row["Command"].ToString();
                                                        be.CommandName = CBE_Row["CommandName"] == DBNull.Value ? null : CBE_Row["CommandName"].ToString();
                                                        be.ImageUrl = CBE_Row["ImageUrl"] == DBNull.Value ? null : CBE_Row["ImageUrl"].ToString();
                                                        be.ParentBuffAndEffectId = CBE_Row["ParentBuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(CBE_Row["ParentBuffAndEffectId"]);
                                                        be.IsDeleted = CBE_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CBE_Row["IsDeleted"]);
                                                        cbe.BuffAndEffect = be;

                                                        CEXT.BuffAndEffect = cbe;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            tile.ExecuteTiles = CEXT;
                            break;
                        case 7://CommandTiles
                            CharacterCommandTile CMT = null;
                            if (ds.Tables[3].Rows.Count > 0)
                            {
                                foreach (DataRow CMT_Row in ds.Tables[3].Rows)
                                {
                                    int CharacterTileId = CMT_Row["CharacterTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CMT_Row["CharacterTileId"]);
                                    if (CharacterTileId == tile.CharacterTileId)
                                    {
                                        CMT = new CharacterCommandTile();
                                        CMT.BodyBgColor = CMT_Row["BodyBgColor"] == DBNull.Value ? null : CMT_Row["BodyBgColor"].ToString();
                                        CMT.BodyTextColor = CMT_Row["BodyTextColor"] == DBNull.Value ? null : CMT_Row["BodyTextColor"].ToString();
                                        CMT.IsDeleted = CMT_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CMT_Row["IsDeleted"]);
                                        CMT.CommandTileId = CMT_Row["CommandTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CMT_Row["CommandTileId"]);
                                        CMT.CharacterTileId = CharacterTileId;
                                        CMT.Shape = CMT_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(CMT_Row["Shape"]);
                                        CMT.SortOrder = CMT_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(CMT_Row["SortOrder"]);
                                        CMT.Title = CMT_Row["Title"] == DBNull.Value ? null : CMT_Row["Title"].ToString();
                                        CMT.TitleBgColor = CMT_Row["TitleBgColor"] == DBNull.Value ? null : CMT_Row["TitleBgColor"].ToString();
                                        CMT.TitleTextColor = CMT_Row["TitleTextColor"] == DBNull.Value ? null : CMT_Row["TitleTextColor"].ToString();
                                        CMT.ImageUrl = CMT_Row["ImageUrl"] == DBNull.Value ? null : CMT_Row["ImageUrl"].ToString();
                                        CMT.Command = CMT_Row["Command"] == DBNull.Value ? null : CMT_Row["Command"].ToString();
                                    }
                                }
                            }
                            tile.CommandTiles = CMT;
                            break;
                        case 8://TextTiles
                            CharacterTextTile TT = null;
                            if (ds.Tables[21].Rows.Count > 0)
                            {
                                foreach (DataRow TT_Row in ds.Tables[21].Rows)
                                {
                                    int CharacterTileId = TT_Row["CharacterTileId"] == DBNull.Value ? 0 : Convert.ToInt32(TT_Row["CharacterTileId"]);
                                    if (CharacterTileId == tile.CharacterTileId)
                                    {
                                        TT = new CharacterTextTile();
                                        TT.BodyBgColor = TT_Row["BodyBgColor"] == DBNull.Value ? null : TT_Row["BodyBgColor"].ToString();
                                        TT.BodyTextColor = TT_Row["BodyTextColor"] == DBNull.Value ? null : TT_Row["BodyTextColor"].ToString();
                                        TT.IsDeleted = TT_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(TT_Row["IsDeleted"]);
                                        TT.TextTileId = TT_Row["TextTileId"] == DBNull.Value ? 0 : Convert.ToInt32(TT_Row["TextTileId"]);
                                        TT.CharacterTileId = CharacterTileId;
                                        TT.Shape = TT_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(TT_Row["Shape"]);
                                        TT.SortOrder = TT_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(TT_Row["SortOrder"]);
                                        TT.Title = TT_Row["Title"] == DBNull.Value ? null : TT_Row["Title"].ToString();
                                        TT.TitleBgColor = TT_Row["TitleBgColor"] == DBNull.Value ? null : TT_Row["TitleBgColor"].ToString();
                                        TT.TitleTextColor = TT_Row["TitleTextColor"] == DBNull.Value ? null : TT_Row["TitleTextColor"].ToString();
                                        TT.Text = TT_Row["Text"] == DBNull.Value ? "" : TT_Row["Text"].ToString();
                                    }
                                }
                            }
                            tile.TextTiles = TT;
                            break;
                        case 9://BuffAndEffectTiles
                            CharacterBuffAndEffectTileVM CBET = null;
                            if (ds.Tables[27].Rows.Count > 0)
                            {
                                foreach (DataRow CBET_Row in ds.Tables[27].Rows)
                                {
                                    int CharacterTileId = CBET_Row["CharacterTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CBET_Row["CharacterTileId"]);
                                    if (CharacterTileId == tile.CharacterTileId)
                                    {
                                        CBET = new CharacterBuffAndEffectTileVM();
                                        CBET.BodyBgColor = CBET_Row["BodyBgColor"] == DBNull.Value ? null : CBET_Row["BodyBgColor"].ToString();
                                        CBET.BodyTextColor = CBET_Row["BodyTextColor"] == DBNull.Value ? null : CBET_Row["BodyTextColor"].ToString();
                                        CBET.CharacterTileId = CharacterTileId;
                                        CBET.IsDeleted = CBET_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CBET_Row["IsDeleted"]);
                                        CBET.BuffAndEffectTileId = CBET_Row["BuffAndEffectTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CBET_Row["BuffAndEffectTileId"]);
                                        CBET.Shape = CBET_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(CBET_Row["Shape"]);
                                        CBET.ShowTitle = CBET_Row["ShowTitle"] == DBNull.Value ? false : Convert.ToBoolean(CBET_Row["ShowTitle"]);
                                        CBET.SortOrder = CBET_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(CBET_Row["SortOrder"]);
                                        CBET.TitleBgColor = CBET_Row["TitleBgColor"] == DBNull.Value ? null : CBET_Row["TitleBgColor"].ToString();
                                        CBET.TitleTextColor = CBET_Row["TitleTextColor"] == DBNull.Value ? null : CBET_Row["TitleTextColor"].ToString();
                                        CBET.DisplayLinkImage = CBET_Row["DisplayLinkImage"] == DBNull.Value ? false : Convert.ToBoolean(CBET_Row["DisplayLinkImage"]);
                                        CBET.MultiBuffAndEffectsIds = new List<CharacterBuffAndEffect>();
                                        if (ds.Tables[28].Rows.Count > 0)
                                        {
                                            foreach (DataRow CCBE_Row in ds.Tables[28].Rows)
                                            {
                                                CharacterBuffAndEffect characterBuffAndEffect = new CharacterBuffAndEffect();
                                                //int CharacterBuffAndEffectId = CCBE_Row["CharacterBuffAandEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(CCBE_Row["CharacterBuffAandEffectId"]);
                                                //if (CharacterBuffAndEffectId == buffAndEffectIdsForTile.CharacterBuffAndEffectId)
                                                //{
                                                characterBuffAndEffect.CharacterBuffAandEffectId = CCBE_Row["CharacterBuffAandEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(CCBE_Row["CharacterBuffAandEffectId"]);
                                                    characterBuffAndEffect.BuffAndEffectID = CCBE_Row["BuffAndEffectID"] == DBNull.Value ? 0 : Convert.ToInt32(CCBE_Row["BuffAndEffectID"]);
                                                    characterBuffAndEffect.CharacterId = CCBE_Row["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(CCBE_Row["CharacterId"]);
                                                    characterBuffAndEffect.BuffAndEffect = new BuffAndEffect()
                                                    {
                                                        ImageUrl = CCBE_Row["ImageUrl"] == DBNull.Value ? null : CCBE_Row["ImageUrl"].ToString(),
                                                        Name = CCBE_Row["Name"] == DBNull.Value ? null : CCBE_Row["Name"].ToString(),
                                                        BuffAndEffectId = (int)characterBuffAndEffect.BuffAndEffectID,
                                                        Description = CCBE_Row["Description"] == DBNull.Value ? null : CCBE_Row["Description"].ToString(),

                                                    };

                                                //}
                                                CBET.MultiBuffAndEffectsIds.Add(characterBuffAndEffect);
                                            }


                                        }
                                    }
                                }
                            }
                            tile.BuffAndEffectTiles = CBET;
                            break;
                        case 10://TextTiles
                            CharacterToggleTile TGT = null;
                            if (ds.Tables[29].Rows.Count > 0)
                            {
                                foreach (DataRow TGT_Row in ds.Tables[29].Rows)
                                {
                                    int CharacterTileId = TGT_Row["CharacterTileId"] == DBNull.Value ? 0 : Convert.ToInt32(TGT_Row["CharacterTileId"]);
                                    if (CharacterTileId == tile.CharacterTileId)
                                    {
                                        TGT = new CharacterToggleTile();
                                        TGT.BodyBgColor = TGT_Row["BodyBgColor"] == DBNull.Value ? null : TGT_Row["BodyBgColor"].ToString();
                                        TGT.BodyTextColor = TGT_Row["BodyTextColor"] == DBNull.Value ? null : TGT_Row["BodyTextColor"].ToString();
                                        TGT.IsDeleted = TGT_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(TGT_Row["IsDeleted"]);
                                        TGT.ToggleTileId = TGT_Row["ToggleTileId"] == DBNull.Value ? 0 : Convert.ToInt32(TGT_Row["ToggleTileId"]);
                                        TGT.TileToggleId = TGT_Row["TileToggleId"] == DBNull.Value ? 0 : Convert.ToInt32(TGT_Row["TileToggleId"]);
                                        TGT.CharacterTileId = CharacterTileId;
                                        TGT.Shape = TGT_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(TGT_Row["Shape"]);
                                        TGT.SortOrder = TGT_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(TGT_Row["SortOrder"]);
                                        TGT.Title = TGT_Row["Title"] == DBNull.Value ? null : TGT_Row["Title"].ToString();
                                        TGT.TitleBgColor = TGT_Row["TitleBgColor"] == DBNull.Value ? null : TGT_Row["TitleBgColor"].ToString();
                                        TGT.TitleTextColor = TGT_Row["TitleTextColor"] == DBNull.Value ? null : TGT_Row["TitleTextColor"].ToString();

                                        TGT.OnOff = TGT_Row["OnOff"] == DBNull.Value ? false : Convert.ToBoolean(TGT_Row["OnOff"]);
                                        TGT.YesNo = TGT_Row["YesNo"] == DBNull.Value ? false : Convert.ToBoolean(TGT_Row["YesNo"]);
                                        TGT.CheckBox = TGT_Row["CheckBox"] == DBNull.Value ? false : Convert.ToBoolean(TGT_Row["CheckBox"]);
                                        TGT.CustomValue = TGT_Row["CustomValue"] == DBNull.Value ? 0 : Convert.ToInt32(TGT_Row["CustomValue"]);
                                        if (ds.Tables[30].Rows.Count > 0)
                                        {                                            
                                            foreach (DataRow Toggle_Row in ds.Tables[30].Rows)
                                            {
                                                int TileToggleId= Toggle_Row["TileToggleId"] == DBNull.Value ? 0 : Convert.ToInt32(Toggle_Row["TileToggleId"]);
                                                if (TileToggleId== TGT.TileToggleId)
                                                {
                                                    TileToggle toggle = new TileToggle()
                                                    {
                                                        Display = Toggle_Row["Display"] == DBNull.Value ? false : Convert.ToBoolean(Toggle_Row["Display"]),
                                                        IsCustom = Toggle_Row["IsCustom"] == DBNull.Value ? false : Convert.ToBoolean(Toggle_Row["IsCustom"]),
                                                        IsDeleted = Toggle_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(Toggle_Row["IsDeleted"]),
                                                        OnOff = Toggle_Row["OnOff"] == DBNull.Value ? false : Convert.ToBoolean(Toggle_Row["OnOff"]),
                                                        ShowCheckbox = Toggle_Row["ShowCheckbox"] == DBNull.Value ? false : Convert.ToBoolean(Toggle_Row["ShowCheckbox"]),                                                        
                                                        TileToggleId = Toggle_Row["TileToggleId"] == DBNull.Value ? 0 : Convert.ToInt32(Toggle_Row["TileToggleId"]),
                                                        YesNo = Toggle_Row["YesNo"] == DBNull.Value ? false : Convert.ToBoolean(Toggle_Row["YesNo"]),
                                                        TileCustomToggles =new List<TileCustomToggle>(),
                                                    };

                                                    if (ds.Tables[31].Rows.Count > 0)
                                                    {
                                                        foreach (DataRow CustomToggle_Row in ds.Tables[31].Rows)
                                                        {
                                                            int CTileToggleId = CustomToggle_Row["TileToggleId"] == DBNull.Value ? 0 : Convert.ToInt32(CustomToggle_Row["TileToggleId"]);
                                                            if (CTileToggleId == toggle.TileToggleId)
                                                            {
                                                                TileCustomToggle Cust_toggle = new TileCustomToggle()
                                                                {
                                                                    Image = CustomToggle_Row["Image"] == DBNull.Value ? null : CustomToggle_Row["Image"].ToString(),
                                                                    TileCustomToggleId = CustomToggle_Row["TileCustomToggleId"] == DBNull.Value ? 0 : Convert.ToInt32(CustomToggle_Row["TileCustomToggleId"]),                                                                    
                                                                    IsDeleted = CustomToggle_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CustomToggle_Row["IsDeleted"]),
                                                                    ToggleText = CustomToggle_Row["ToggleText"] == DBNull.Value ? null : CustomToggle_Row["ToggleText"].ToString(),
                                                                    TileToggleId = CustomToggle_Row["TileToggleId"] == DBNull.Value ? 0 : Convert.ToInt32(CustomToggle_Row["TileToggleId"]),
                                                                    
                                                                };
                                                                toggle.TileCustomToggles.Add(Cust_toggle); 
                                                            }
                                                        }
                                                    }


                                                    TGT.TileToggle = toggle;
                                                }                                                
                                            }
                                        }
                                    }
                                }
                            }
                            tile.ToggleTiles = TGT;
                            break;
                        default:
                            break;
                    }
                    TileConfig config = null;
                    if (ds.Tables[12].Rows.Count > 0)
                    {
                        foreach (DataRow config_Row in ds.Tables[12].Rows)
                        {
                            int CharacterTileId = config_Row["CharacterTileId"] == DBNull.Value ? 0 : Convert.ToInt32(config_Row["CharacterTileId"]);
                            if (CharacterTileId == tile.CharacterTileId)
                            {
                                config = new TileConfig();
                                config.Col = config_Row["Col"] == DBNull.Value ? 0 : Convert.ToInt32(config_Row["Col"]);
                                config.IsDeleted = config_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(config_Row["IsDeleted"]);
                                config.Payload = config_Row["Payload"] == DBNull.Value ? 0 : Convert.ToInt32(config_Row["Payload"]);
                                config.Row = config_Row["Row"] == DBNull.Value ? 0 : Convert.ToInt32(config_Row["Row"]);
                                config.CharacterTileId = CharacterTileId;
                                config.SizeX = config_Row["SizeX"] == DBNull.Value ? 0 : Convert.ToInt32(config_Row["SizeX"]);
                                config.SizeY = config_Row["SizeY"] == DBNull.Value ? 0 : Convert.ToInt32(config_Row["SizeY"]);
                                config.SortOrder = config_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(config_Row["SortOrder"]);
                                config.TileConfigId = config_Row["TileConfigId"] == DBNull.Value ? 0 : Convert.ToInt32(config_Row["TileConfigId"]);
                                config.UniqueId = config_Row["UniqueId"] == DBNull.Value ? null : config_Row["UniqueId"].ToString();
                            }
                        }
                    }
                    tile.Config = config;

                    //tile.Ruleset =;
                    //tile.RulesetDashboardPage =;
                    //tile.TileType =;
                    tileList.Add(tile);
                }
            }
            return tileList;
        }

        

        public List<CharacterTile> GetSharedLayoutByPageIdRulesetId_sp(int characterId, int pageId, int rulesetId)
        {
            List<CharacterTile> tileList = new List<CharacterTile>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC Character_GetTilesByPageID @CharacterID = '" + characterId + "' ,@PageID='" + pageId + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("Ruleset_GetSharedLayoutTilesByPageID", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@CharacterID", characterId);
                command.Parameters.AddWithValue("@RulesetID", rulesetId);
                command.Parameters.AddWithValue("@PageID", pageId);
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
            {
                foreach (DataRow row in ds.Tables[0].Rows)
                {

                    CharacterTile tile = new CharacterTile();
                    tile.Height = row["Height"] == DBNull.Value ? 0 : Convert.ToInt32(row["Height"]);
                    tile.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                    tile.LocationX = row["LocationX"] == DBNull.Value ? 0 : Convert.ToInt32(row["LocationX"]);
                    tile.LocationY = row["LocationY"] == DBNull.Value ? 0 : Convert.ToInt32(row["LocationY"]);
                  //  tile.CharacterDashboardPageId = row["CharacterDashboardPageId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterDashboardPageId"]);
                  //  tile.CharacterId = row["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterId"]);
                    tile.CharacterTileId = row["RulesetTileId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RulesetTileId"]);
                    tile.Shape = row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(row["Shape"]);
                    tile.SortOrder = row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(row["SortOrder"]);
                    tile.TileTypeId = row["TileTypeId"] == DBNull.Value ? 0 : Convert.ToInt32(row["TileTypeId"]);
                    tile.Width = row["Width"] == DBNull.Value ? 0 : Convert.ToInt32(row["Width"]);
                    switch (tile.TileTypeId)
                    {
                        case 1://NoteTiles
                            CharacterNoteTile NT = null;
                            if (ds.Tables[5].Rows.Count > 0)
                            {
                                foreach (DataRow NT_Row in ds.Tables[5].Rows)
                                {
                                    int CharacterTileId = NT_Row["RulesetTileId"] == DBNull.Value ? 0 : Convert.ToInt32(NT_Row["RulesetTileId"]);
                                    if (CharacterTileId == tile.CharacterTileId)
                                    {
                                        NT = new CharacterNoteTile();
                                        //DataRow NT_Row = ds.Tables[5].Rows[0];
                                        NT.BodyBgColor = NT_Row["BodyBgColor"] == DBNull.Value ? null : NT_Row["BodyBgColor"].ToString();
                                        NT.BodyTextColor = NT_Row["BodyTextColor"] == DBNull.Value ? null : NT_Row["BodyTextColor"].ToString();
                                        NT.Content = NT_Row["Content"] == DBNull.Value ? null : NT_Row["Content"].ToString();
                                        NT.IsDeleted = NT_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(NT_Row["IsDeleted"]);
                                        NT.NoteTileId = NT_Row["NoteTileId"] == DBNull.Value ? 0 : Convert.ToInt32(NT_Row["NoteTileId"]);
                                        NT.CharacterTileId = CharacterTileId;
                                        NT.Shape = NT_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(NT_Row["Shape"]);
                                        NT.SortOrder = NT_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(NT_Row["SortOrder"]);
                                        NT.Title = NT_Row["Title"] == DBNull.Value ? null : NT_Row["Title"].ToString();
                                        NT.TitleBgColor = NT_Row["TitleBgColor"] == DBNull.Value ? null : NT_Row["TitleBgColor"].ToString();
                                        NT.TitleTextColor = NT_Row["TitleTextColor"] == DBNull.Value ? null : NT_Row["TitleTextColor"].ToString();
                                    }
                                }
                            }
                            tile.NoteTiles = NT;
                            break;

                        case 2://ImageTiles
                            CharacterImageTile IT = null;
                            if (ds.Tables[6].Rows.Count > 0)
                            {
                                foreach (DataRow IT_Row in ds.Tables[6].Rows)
                                {
                                    int CharacterTileId = IT_Row["RulesetTileId"] == DBNull.Value ? 0 : Convert.ToInt32(IT_Row["RulesetTileId"]);
                                    if (CharacterTileId == tile.CharacterTileId)
                                    {
                                        IT = new CharacterImageTile();
                                        IT.BodyBgColor = IT_Row["BodyBgColor"] == DBNull.Value ? null : IT_Row["BodyBgColor"].ToString();
                                        IT.BodyTextColor = IT_Row["BodyTextColor"] == DBNull.Value ? null : IT_Row["BodyTextColor"].ToString();
                                        IT.IsDeleted = IT_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(IT_Row["IsDeleted"]);
                                        IT.ImageTileId = IT_Row["ImageTileId"] == DBNull.Value ? 0 : Convert.ToInt32(IT_Row["ImageTileId"]);
                                        IT.CharacterTileId = CharacterTileId;
                                        IT.Shape = IT_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(IT_Row["Shape"]);
                                        IT.SortOrder = IT_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(IT_Row["SortOrder"]);
                                        IT.Title = IT_Row["Title"] == DBNull.Value ? null : IT_Row["Title"].ToString();
                                        IT.TitleBgColor = IT_Row["TitleBgColor"] == DBNull.Value ? null : IT_Row["TitleBgColor"].ToString();
                                        IT.TitleTextColor = IT_Row["TitleTextColor"] == DBNull.Value ? null : IT_Row["TitleTextColor"].ToString();
                                        IT.ImageUrl = IT_Row["ImageUrl"] == DBNull.Value ? null : IT_Row["ImageUrl"].ToString();
                                    }
                                }
                            }
                            tile.ImageTiles = IT;
                            break;

                        case 3://CounterTiles
                            CharacterCounterTile CNT = null;
                            if (ds.Tables[4].Rows.Count > 0)
                            {
                                foreach (DataRow CNT_Row in ds.Tables[4].Rows)
                                {
                                    int CharacterTileId = CNT_Row["RulesetTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CNT_Row["RulesetTileId"]);
                                    if (CharacterTileId == tile.CharacterTileId)
                                    {
                                        CNT = new CharacterCounterTile();
                                        CNT.BodyBgColor = CNT_Row["BodyBgColor"] == DBNull.Value ? null : CNT_Row["BodyBgColor"].ToString();
                                        CNT.BodyTextColor = CNT_Row["BodyTextColor"] == DBNull.Value ? null : CNT_Row["BodyTextColor"].ToString();
                                        CNT.IsDeleted = CNT_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CNT_Row["IsDeleted"]);
                                        CNT.CounterTileId = CNT_Row["CounterTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CNT_Row["CounterTileId"]);
                                        CNT.CharacterTileId = CharacterTileId;
                                        CNT.Shape = CNT_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(CNT_Row["Shape"]);
                                        CNT.SortOrder = CNT_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(CNT_Row["SortOrder"]);
                                        CNT.Title = CNT_Row["Title"] == DBNull.Value ? null : CNT_Row["Title"].ToString();
                                        CNT.TitleBgColor = CNT_Row["TitleBgColor"] == DBNull.Value ? null : CNT_Row["TitleBgColor"].ToString();
                                        CNT.TitleTextColor = CNT_Row["TitleTextColor"] == DBNull.Value ? null : CNT_Row["TitleTextColor"].ToString();
                                        CNT.CurrentValue = CNT_Row["CurrentValue"] == DBNull.Value ? 0 : Convert.ToInt32(CNT_Row["CurrentValue"]);
                                        CNT.DefaultValue = CNT_Row["DefaultValue"] == DBNull.Value ? 0 : Convert.ToInt32(CNT_Row["DefaultValue"]);
                                        CNT.Maximum = CNT_Row["Maximum"] == DBNull.Value ? (int?)null : Convert.ToInt32(CNT_Row["Maximum"]);
                                        CNT.Minimum = CNT_Row["Minimum"] == DBNull.Value ? (int?)null : Convert.ToInt32(CNT_Row["Minimum"]);
                                        CNT.Step = CNT_Row["Step"] == DBNull.Value ? 1 : Convert.ToInt32(CNT_Row["Step"]);//default step=1 
                                    }
                                }
                            }
                            tile.CounterTiles = CNT;
                            break;

                        case 4://CharacterStatTiles
                            CharacterCharacterStatTile CST = null;
                            if (ds.Tables[7].Rows.Count > 0)
                            {
                                foreach (DataRow CST_Row in ds.Tables[7].Rows)
                                {
                                    int CharacterTileId = CST_Row["RulesetTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CST_Row["RulesetTileId"]);
                                    if (CharacterTileId == tile.CharacterTileId)
                                    {
                                        CST = new CharacterCharacterStatTile();
                                        CST.bodyBgColor = CST_Row["bodyBgColor"] == DBNull.Value ? null : CST_Row["bodyBgColor"].ToString();
                                        CST.bodyTextColor = CST_Row["bodyTextColor"] == DBNull.Value ? null : CST_Row["bodyTextColor"].ToString();
                                        CST.IsDeleted = CST_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CST_Row["IsDeleted"]);
                                        CST.CharacterStatTileId = CST_Row["CharacterStatTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CST_Row["CharacterStatTileId"]);
                                        CST.CharacterTileId = CharacterTileId;
                                        CST.Shape = CST_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(CST_Row["Shape"]);
                                        CST.SortOrder = CST_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(CST_Row["SortOrder"]);
                                        CST.titleBgColor = CST_Row["titleBgColor"] == DBNull.Value ? null : CST_Row["titleBgColor"].ToString();
                                        CST.titleTextColor = CST_Row["titleTextColor"] == DBNull.Value ? null : CST_Row["titleTextColor"].ToString();
                                        CST.CharactersCharacterStatId = CST_Row["CharactersCharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CST_Row["CharactersCharacterStatId"]);
                                        CST.ShowTitle = CST_Row["ShowTitle"] == DBNull.Value ? false : Convert.ToBoolean(CST_Row["ShowTitle"]);
                                        //CST.DisplayLinkImage = CST_Row["DisplayLinkImage"] == DBNull.Value ? false : Convert.ToBoolean(CST_Row["DisplayLinkImage"]);
                                        CST.ImageUrl = CST_Row["ImageUrl"] == DBNull.Value ? null : CST_Row["ImageUrl"].ToString();

                                        CharactersCharacterStat CharCharStat = new CharactersCharacterStat();
                                        if (ds.Tables[8].Rows.Count > 0)
                                        {
                                            foreach (DataRow CharCharStat_Row in ds.Tables[8].Rows)
                                            {
                                                int? nullInt = null;
                                                int CharactersCharacterStatId = CharCharStat_Row["CharactersCharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["CharactersCharacterStatId"]);
                                                if (CharactersCharacterStatId == CST.CharactersCharacterStatId)
                                                {
                                                    CharCharStat = new CharactersCharacterStat();
                                                    CharCharStat.CharactersCharacterStatId = CharactersCharacterStatId;
                                                    CharCharStat.CharacterStatId = CharCharStat_Row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["CharacterStatId"]);
                                                    CharCharStat.CharacterId = CharCharStat_Row["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["CharacterId"]);
                                                    CharCharStat.Text = CharCharStat_Row["Text"] == DBNull.Value ? null : CharCharStat_Row["Text"].ToString();
                                                    CharCharStat.RichText = CharCharStat_Row["RichText"] == DBNull.Value ? null : CharCharStat_Row["RichText"].ToString();
                                                    CharCharStat.Choice = CharCharStat_Row["Choice"] == DBNull.Value ? null : CharCharStat_Row["Choice"].ToString();
                                                    CharCharStat.MultiChoice = CharCharStat_Row["MultiChoice"] == DBNull.Value ? null : CharCharStat_Row["MultiChoice"].ToString();
                                                    CharCharStat.Command = CharCharStat_Row["Command"] == DBNull.Value ? null : CharCharStat_Row["Command"].ToString();
                                                    CharCharStat.YesNo = CharCharStat_Row["YesNo"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["YesNo"]);
                                                    CharCharStat.OnOff = CharCharStat_Row["OnOff"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["OnOff"]);
                                                    CharCharStat.Value = CharCharStat_Row["Value"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["Value"]);
                                                    CharCharStat.Number = CharCharStat_Row["Number"] == DBNull.Value ? (int?)null : Convert.ToInt32(CharCharStat_Row["Number"]);
                                                    CharCharStat.SubValue = CharCharStat_Row["SubValue"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["SubValue"]);
                                                    CharCharStat.Current = CharCharStat_Row["Current"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["Current"]);
                                                    CharCharStat.Maximum = CharCharStat_Row["Maximum"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["Maximum"]);
                                                    CharCharStat.CalculationResult = CharCharStat_Row["CalculationResult"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["CalculationResult"]);
                                                    CharCharStat.Minimum = CharCharStat_Row["Minimum"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["Minimum"]);
                                                    CharCharStat.DefaultValue = CharCharStat_Row["DefaultValue"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["DefaultValue"]);
                                                    CharCharStat.ComboText = CharCharStat_Row["ComboText"] == DBNull.Value ? null : CharCharStat_Row["ComboText"].ToString();
                                                    CharCharStat.IsDeleted = CharCharStat_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["IsDeleted"]);
                                                    CharCharStat.Display = CharCharStat_Row["Display"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["Display"]);
                                                    CharCharStat.ShowCheckbox = CharCharStat_Row["ShowCheckbox"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["ShowCheckbox"]);
                                                    CharCharStat.IsCustom = CharCharStat_Row["IsCustom"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["IsCustom"]);
                                                    //CharCharStat.CustomToggleId = CharCharStat_Row["CustomToggleId"] == DBNull.Value ? nullInt : Convert.ToInt32(CharCharStat_Row["CustomToggleId"]);
                                                    CharCharStat.IsYes = CharCharStat_Row["IsYes"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["IsYes"]);
                                                    CharCharStat.IsOn = CharCharStat_Row["IsOn"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["IsOn"]);
                                                    CharCharStat.LinkType = CharCharStat_Row["LinkType"] == DBNull.Value ? null : CharCharStat_Row["LinkType"].ToString();
                                                    CharacterStat CharStat = null;
                                                    short num = 0;
                                                    int characterstatID = CharCharStat_Row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["CharacterStatId"]);
                                                    if (characterstatID == CharCharStat.CharacterStatId)
                                                    {
                                                        CharStat = new CharacterStat();

                                                        //List<CharacterStatDefaultValue> defvaluesList = _characterStatDefaultValueService.GetCharacterStatDefaultValue(characterstatID).Result;
                                                        //CharStat.CharacterStatDefaultValues = new List<CharacterStatDefaultValue>();
                                                        //foreach (var def in defvaluesList)
                                                        //{
                                                        //    CharStat.CharacterStatDefaultValues.Add(new CharacterStatDefaultValue()
                                                        //    {
                                                        //        CharacterStatDefaultValueId = def.CharacterStatDefaultValueId,
                                                        //        CharacterStatId = def.CharacterStatId,
                                                        //        DefaultValue = def.DefaultValue,
                                                        //        Minimum = def.Minimum,
                                                        //        Maximum = def.Maximum,
                                                        //        Type = def.Type
                                                        //    });
                                                        //};
                                                        CharStat.CharacterStatDefaultValues = new List<CharacterStatDefaultValue>();
                                                        if (ds.Tables[14].Rows.Count > 0)
                                                        {
                                                            foreach (DataRow DefaultVal_Row in ds.Tables[14].Rows)
                                                            {
                                                                int DefaultValcharacterstatID = DefaultVal_Row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(DefaultVal_Row["CharacterStatId"]);
                                                                if (DefaultValcharacterstatID == CharCharStat.CharacterStatId)
                                                                {
                                                                    CharStat.CharacterStatDefaultValues.Add(new CharacterStatDefaultValue()
                                                                    {
                                                                        CharacterStatDefaultValueId = DefaultVal_Row["CharacterStatDefaultValueId"] == DBNull.Value ? 0 : Convert.ToInt32(DefaultVal_Row["CharacterStatDefaultValueId"]),
                                                                        CharacterStatId = DefaultVal_Row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(DefaultVal_Row["CharacterStatId"]),
                                                                        DefaultValue = DefaultVal_Row["DefaultValue"] == DBNull.Value ? string.Empty : DefaultVal_Row["DefaultValue"].ToString(),
                                                                        Minimum = DefaultVal_Row["Minimum"] == DBNull.Value ? 0 : Convert.ToInt32(DefaultVal_Row["Minimum"]),
                                                                        Maximum = DefaultVal_Row["Maximum"] == DBNull.Value ? 0 : Convert.ToInt32(DefaultVal_Row["Maximum"]),
                                                                        Type = DefaultVal_Row["Type"] == DBNull.Value ? 0 : Convert.ToInt32(DefaultVal_Row["Type"])
                                                                    });
                                                                }
                                                            }
                                                        }


                                                        utility.FillConditionStats(ds, CharCharStat, CharStat, 16);
                                                        //CharStat.CharacterStatConditions = _characterStatConditionService.GetByStatId(characterstatID).Result;
                                                        //foreach (var cond in CharStat.CharacterStatConditions)
                                                        //{
                                                        //    cond.ConditionOperator = _characterStatConditionService.GetConditionOperatorById(cond.ConditionOperatorID);
                                                        //}
                                                        CharStat.CharacterStatId = characterstatID;
                                                        CharStat.RuleSetId = CharCharStat_Row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["RuleSetId"]);
                                                        CharStat.StatName = CharCharStat_Row["StatName"] == DBNull.Value ? null : CharCharStat_Row["StatName"].ToString();
                                                        CharStat.StatDesc = CharCharStat_Row["StatDesc"] == DBNull.Value ? null : CharCharStat_Row["StatDesc"].ToString();
                                                        CharStat.isActive = CharCharStat_Row["isActive"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["isActive"]);
                                                        CharStat.CharacterStatTypeId = CharCharStat_Row["CharacterStatTypeId"] == DBNull.Value ? num : (short)(CharCharStat_Row["CharacterStatTypeId"]);
                                                        CharStat.isMultiSelect = CharCharStat_Row["isMultiSelect"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["isMultiSelect"]);
                                                        CharStat.ParentCharacterStatId = CharCharStat_Row["ParentCharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["ParentCharacterStatId"]);
                                                        CharStat.SortOrder = CharCharStat_Row["SortOrder"] == DBNull.Value ? num : (short)(CharCharStat_Row["SortOrder"]);
                                                        CharStat.IsDeleted = CharCharStat_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["IsDeleted"]);
                                                        CharStat.IsChoiceNumeric = CharCharStat_Row["IsChoiceNumeric"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["IsChoiceNumeric"]);
                                                        CharStat.IsChoicesFromAnotherStat = CharCharStat_Row["IsChoicesFromAnotherStat"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["IsChoicesFromAnotherStat"]);
                                                        CharStat.SelectedChoiceCharacterStatId = CharCharStat_Row["SelectedChoiceCharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["SelectedChoiceCharacterStatId"]);

                                                        List<CharacterStatChoice> Choices = new List<CharacterStatChoice>();
                                                        if (ds.Tables[10].Rows.Count > 0)
                                                        {
                                                            foreach (DataRow r in ds.Tables[10].Rows)
                                                            {
                                                                int choiceCharacterStat = r["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatId"]);
                                                                if (characterstatID == choiceCharacterStat)
                                                                {
                                                                    CharacterStatChoice ch = new CharacterStatChoice();
                                                                    ch.CharacterStatChoiceId = r["CharacterStatChoiceId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatChoiceId"]);
                                                                    ch.StatChoiceValue = r["StatChoiceValue"] == DBNull.Value ? null : r["StatChoiceValue"].ToString();
                                                                    ch.CharacterStatId = choiceCharacterStat;
                                                                    ch.IsDeleted = r["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(r["IsDeleted"]);

                                                                    Choices.Add(ch);
                                                                }
                                                                else
                                                                {
                                                                    if (CharStat.SelectedChoiceCharacterStatId == choiceCharacterStat && CharStat.IsChoicesFromAnotherStat == true)
                                                                    {
                                                                        CharacterStatChoice ch = new CharacterStatChoice();
                                                                        ch.CharacterStatChoiceId = r["CharacterStatChoiceId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatChoiceId"]);
                                                                        ch.StatChoiceValue = r["StatChoiceValue"] == DBNull.Value ? null : r["StatChoiceValue"].ToString();
                                                                        ch.CharacterStatId = choiceCharacterStat;
                                                                        ch.IsDeleted = r["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(r["IsDeleted"]);

                                                                        Choices.Add(ch);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        CharStat.CharacterStatChoices = Choices;
                                                        List<CharacterStatCalc> calcs = new List<CharacterStatCalc>();
                                                        if (ds.Tables[9].Rows.Count > 0)
                                                        {
                                                            foreach (DataRow r in ds.Tables[9].Rows)
                                                            {
                                                                int calcCharacterStat = r["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatId"]);
                                                                if (characterstatID == calcCharacterStat)
                                                                {
                                                                    CharacterStatCalc cal = new CharacterStatCalc();
                                                                    cal.CharacterStatCalcId = r["CharacterStatCalcId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatCalcId"]);
                                                                    cal.StatCalculation = r["StatCalculation"] == DBNull.Value ? null : r["StatCalculation"].ToString();
                                                                    cal.CharacterStatId = r["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatId"]);
                                                                    cal.IsDeleted = r["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(r["IsDeleted"]);
                                                                    cal.StatCalculationIds = r["StatCalculationIds"] == DBNull.Value ? null : r["StatCalculationIds"].ToString();
                                                                    calcs.Add(cal);
                                                                }
                                                            }
                                                        }
                                                        CharStat.CharacterStatCalcs = calcs;
                                                        //List<CharacterStatCombo> combos = new List<CharacterStatCombo>();
                                                        //CharacterStatCombo combo = new CharacterStatCombo();
                                                        //if (ds.Tables[14].Rows.Count > 0)
                                                        //{
                                                        //    foreach (DataRow r in ds.Tables[14].Rows)
                                                        //    {
                                                        //        int comboCharacterStat = r["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatId"]);
                                                        //        if (characterstatID == comboCharacterStat)
                                                        //        {
                                                                    
                                                        //            combo.CharacterStatComboId = r["CharacterStatComboId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatComboId"]);
                                                        //            combo.CharacterStatId = r["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatId"]);
                                                        //            combo.DefaultText = r["DefaultText"] == DBNull.Value ? null : r["DefaultText"].ToString();
                                                        //            combo.DefaultValue = r["DefaultValue"] == DBNull.Value ? 0 : Convert.ToInt32(r["DefaultValue"]);   
                                                        //            combos.Add(combo);
                                                        //            break;
                                                        //        }
                                                               
                                                        //    }
                                                        //}
                                                        //CharStat.CharacterStatCombos = combo;
                                                        CharacterStatType statType = null;
                                                        if (ds.Tables[11].Rows.Count > 0)
                                                        {
                                                            foreach (DataRow r in ds.Tables[11].Rows)
                                                            {
                                                                short CharacterStatTypeID = r["CharacterStatTypeId"] == DBNull.Value ? num : (short)(r["CharacterStatTypeId"]);
                                                                if (CharacterStatTypeID == CharStat.CharacterStatTypeId)
                                                                {
                                                                    statType = new CharacterStatType();
                                                                    statType.CharacterStatTypeId = CharacterStatTypeID;
                                                                    statType.StatTypeName = r["StatTypeName"] == DBNull.Value ? null : r["StatTypeName"].ToString();
                                                                    statType.StatTypeDesc = r["StatTypeDesc"] == DBNull.Value ? null : r["StatTypeDesc"].ToString();
                                                                    statType.isNumeric = r["isNumeric"] == DBNull.Value ? false : Convert.ToBoolean(r["isNumeric"]);
                                                                    statType.TypeId = r["TypeId"] == DBNull.Value ? num : (short)(r["TypeId"]);
                                                                }
                                                            }
                                                        }
                                                        CharStat.CharacterStatType = statType;
                                                    }


                                                    CharCharStat.CharacterStat = CharStat;

                                                    //List<CharacterCustomToggle> characterCustomToggle = new List<CharacterCustomToggle>();
                                                    //if (CharCharStat.IsCustom)
                                                    //{
                                                    //    CharacterStatToggle CharacterStatToggle = GetCharacterStatToggleList((int)CharCharStat.CharacterStatId);
                                                    //    if (CharacterStatToggle != null)
                                                    //    {
                                                    //        foreach (var toggle in CharacterStatToggle.CustomToggles)
                                                    //        {
                                                    //            characterCustomToggle.Add(new CharacterCustomToggle()
                                                    //            {
                                                    //                CustomToggleId = toggle.CustomToggleId,
                                                    //                Image = toggle.Image,
                                                    //                IsDeleted = toggle.IsDeleted,
                                                    //                ToggleText = toggle.ToggleText,
                                                    //            });
                                                    //        }
                                                    //    }
                                                    //}
                                                    //CharCharStat.CharacterCustomToggles = characterCustomToggle;

                                                    List<CharacterCustomToggle> characterCustomToggle = new List<CharacterCustomToggle>();
                                                    if (CharCharStat.IsCustom)
                                                    {
                                                        CharCharStat.CharacterCustomToggles = characterCustomToggle;
                                                        if (ds.Tables[17].Rows.Count > 0)
                                                        {
                                                            foreach (DataRow CustomToggle_Row in ds.Tables[17].Rows)
                                                            {
                                                                int CustomTogglecharacterstatID = CustomToggle_Row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CustomToggle_Row["CharacterStatId"]);
                                                                if (CustomTogglecharacterstatID == CharCharStat.CharacterStatId)
                                                                {
                                                                    characterCustomToggle.Add(new CharacterCustomToggle()
                                                                    {
                                                                        CustomToggleId = CustomToggle_Row["CustomToggleId"] == DBNull.Value ? 0 : Convert.ToInt32(CustomToggle_Row["CustomToggleId"]),
                                                                        Image = CustomToggle_Row["Image"] == DBNull.Value ? string.Empty : CustomToggle_Row["Image"].ToString(),
                                                                        IsDeleted = CustomToggle_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CustomToggle_Row["IsDeleted"]),
                                                                        ToggleText = CustomToggle_Row["ToggleText"] == DBNull.Value ? string.Empty : CustomToggle_Row["ToggleText"].ToString(),
                                                                    });
                                                                }
                                                            }
                                                        }
                                                    }
                                                    CharCharStat.CharacterCustomToggles = characterCustomToggle;
                                                }

                                            }
                                        }
                                        CST.CharactersCharacterStat = CharCharStat;
                                    }
                                }
                            }
                            tile.CharacterStatTiles = CST;
                            break;

                        case 7://CommandTiles
                            CharacterCommandTile CMT = null;
                            if (ds.Tables[3].Rows.Count > 0)
                            {
                                foreach (DataRow CMT_Row in ds.Tables[3].Rows)
                                {
                                    int CharacterTileId = CMT_Row["RulesetTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CMT_Row["RulesetTileId"]);
                                    if (CharacterTileId == tile.CharacterTileId)
                                    {
                                        CMT = new CharacterCommandTile();
                                        CMT.BodyBgColor = CMT_Row["BodyBgColor"] == DBNull.Value ? null : CMT_Row["BodyBgColor"].ToString();
                                        CMT.BodyTextColor = CMT_Row["BodyTextColor"] == DBNull.Value ? null : CMT_Row["BodyTextColor"].ToString();
                                        CMT.IsDeleted = CMT_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CMT_Row["IsDeleted"]);
                                        CMT.CommandTileId = CMT_Row["CommandTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CMT_Row["CommandTileId"]);
                                        CMT.CharacterTileId = CharacterTileId;
                                        CMT.Shape = CMT_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(CMT_Row["Shape"]);
                                        CMT.SortOrder = CMT_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(CMT_Row["SortOrder"]);
                                        CMT.Title = CMT_Row["Title"] == DBNull.Value ? null : CMT_Row["Title"].ToString();
                                        CMT.TitleBgColor = CMT_Row["TitleBgColor"] == DBNull.Value ? null : CMT_Row["TitleBgColor"].ToString();
                                        CMT.TitleTextColor = CMT_Row["TitleTextColor"] == DBNull.Value ? null : CMT_Row["TitleTextColor"].ToString();
                                        CMT.ImageUrl = CMT_Row["ImageUrl"] == DBNull.Value ? null : CMT_Row["ImageUrl"].ToString();
                                        CMT.Command = CMT_Row["Command"] == DBNull.Value ? null : CMT_Row["Command"].ToString();
                                    }
                                }
                            }
                            tile.CommandTiles = CMT;
                            break;
                        case 8://TextTiles
                            CharacterTextTile TT = null;
                            if (ds.Tables[13].Rows.Count > 0)
                            {
                                foreach (DataRow TT_Row in ds.Tables[13].Rows)
                                {
                                    int CharacterTileId = TT_Row["RulesetTileId"] == DBNull.Value ? 0 : Convert.ToInt32(TT_Row["RulesetTileId"]);
                                    if (CharacterTileId == tile.CharacterTileId)
                                    {
                                        TT = new CharacterTextTile();
                                        TT.BodyBgColor = TT_Row["BodyBgColor"] == DBNull.Value ? null : TT_Row["BodyBgColor"].ToString();
                                        TT.BodyTextColor = TT_Row["BodyTextColor"] == DBNull.Value ? null : TT_Row["BodyTextColor"].ToString();
                                        TT.IsDeleted = TT_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(TT_Row["IsDeleted"]);
                                        TT.TextTileId = TT_Row["TextTileId"] == DBNull.Value ? 0 : Convert.ToInt32(TT_Row["TextTileId"]);
                                        TT.CharacterTileId = CharacterTileId;
                                        TT.Shape = TT_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(TT_Row["Shape"]);
                                        TT.SortOrder = TT_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(TT_Row["SortOrder"]);
                                        TT.Title = TT_Row["Title"] == DBNull.Value ? null : TT_Row["Title"].ToString();
                                        TT.TitleBgColor = TT_Row["TitleBgColor"] == DBNull.Value ? null : TT_Row["TitleBgColor"].ToString();
                                        TT.TitleTextColor = TT_Row["TitleTextColor"] == DBNull.Value ? null : TT_Row["TitleTextColor"].ToString();
                                        TT.Text = TT_Row["Text"] == DBNull.Value ? "" : TT_Row["Text"].ToString();
                                    }
                                }
                            }
                            tile.TextTiles = TT;
                            break;
                        case 9://BuffAndEffectTiles
                            CharacterBuffAndEffectTileVM CBET = null;
                            if (ds.Tables[18].Rows.Count > 0)
                            {
                                foreach (DataRow CBET_Row in ds.Tables[18].Rows)
                                {
                                    int CharacterTileId = CBET_Row["RulesetTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CBET_Row["RulesetTileId"]);
                                    if (CharacterTileId == tile.CharacterTileId)
                                    {
                                        CBET = new CharacterBuffAndEffectTileVM();
                                        CBET.BodyBgColor = CBET_Row["BodyBgColor"] == DBNull.Value ? null : CBET_Row["BodyBgColor"].ToString();
                                        CBET.BodyTextColor = CBET_Row["BodyTextColor"] == DBNull.Value ? null : CBET_Row["BodyTextColor"].ToString();
                                        CBET.CharacterTileId = CharacterTileId;
                                        CBET.IsDeleted = CBET_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CBET_Row["IsDeleted"]);
                                        CBET.BuffAndEffectTileId = CBET_Row["BuffAndEffectTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CBET_Row["BuffAndEffectTileId"]);
                                        CBET.Shape = CBET_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(CBET_Row["Shape"]);
                                        CBET.ShowTitle = CBET_Row["ShowTitle"] == DBNull.Value ? false : Convert.ToBoolean(CBET_Row["ShowTitle"]);
                                        CBET.SortOrder = CBET_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(CBET_Row["SortOrder"]);
                                        CBET.TitleBgColor = CBET_Row["TitleBgColor"] == DBNull.Value ? null : CBET_Row["TitleBgColor"].ToString();
                                        CBET.TitleTextColor = CBET_Row["TitleTextColor"] == DBNull.Value ? null : CBET_Row["TitleTextColor"].ToString();
                                        CBET.DisplayLinkImage = CBET_Row["DisplayLinkImage"] == DBNull.Value ? false : Convert.ToBoolean(CBET_Row["DisplayLinkImage"]);
                                        CBET.MultiBuffAndEffectsIds = new List<CharacterBuffAndEffect>();
                                        if (ds.Tables[19].Rows.Count > 0)
                                        {
                                            foreach (DataRow CCBE_Row in ds.Tables[19].Rows)
                                            {
                                                CharacterBuffAndEffect characterBuffAndEffect = new CharacterBuffAndEffect();
                                                //int CharacterBuffAndEffectId = CCBE_Row["CharacterBuffAandEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(CCBE_Row["CharacterBuffAandEffectId"]);
                                                //if (CharacterBuffAndEffectId == buffAndEffectIdsForTile.CharacterBuffAndEffectId)
                                                //{
                                                characterBuffAndEffect.CharacterBuffAandEffectId = CCBE_Row["CharacterBuffAandEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(CCBE_Row["CharacterBuffAandEffectId"]);
                                                characterBuffAndEffect.BuffAndEffectID = CCBE_Row["BuffAndEffectID"] == DBNull.Value ? 0 : Convert.ToInt32(CCBE_Row["BuffAndEffectID"]);
                                                characterBuffAndEffect.CharacterId = CCBE_Row["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(CCBE_Row["CharacterId"]);
                                                characterBuffAndEffect.BuffAndEffect = new BuffAndEffect()
                                                {
                                                    ImageUrl = CCBE_Row["ImageUrl"] == DBNull.Value ? null : CCBE_Row["ImageUrl"].ToString(),
                                                    Name = CCBE_Row["Name"] == DBNull.Value ? null : CCBE_Row["Name"].ToString(),
                                                    BuffAndEffectId = (int)characterBuffAndEffect.BuffAndEffectID,
                                                    Description = CCBE_Row["Description"] == DBNull.Value ? null : CCBE_Row["Description"].ToString(),

                                                };

                                                //}
                                                CBET.MultiBuffAndEffectsIds.Add(characterBuffAndEffect);
                                            }


                                        }
                                    }
                                }
                            }
                            tile.BuffAndEffectTiles = CBET;
                            break;
                        default:
                            break;
                    }
                    TileConfig config = null;
                    if (ds.Tables[12].Rows.Count > 0)
                    {
                        foreach (DataRow config_Row in ds.Tables[12].Rows)
                        {
                            int CharacterTileId = config_Row["RulesetTileId"] == DBNull.Value ? 0 : Convert.ToInt32(config_Row["RulesetTileId"]);
                            if (CharacterTileId == tile.CharacterTileId)
                            {
                                config = new TileConfig();
                                config.Col = config_Row["Col"] == DBNull.Value ? 0 : Convert.ToInt32(config_Row["Col"]);
                                config.IsDeleted = config_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(config_Row["IsDeleted"]);
                                config.Payload = config_Row["Payload"] == DBNull.Value ? 0 : Convert.ToInt32(config_Row["Payload"]);
                                config.Row = config_Row["Row"] == DBNull.Value ? 0 : Convert.ToInt32(config_Row["Row"]);
                                config.CharacterTileId = CharacterTileId;
                                config.SizeX = config_Row["SizeX"] == DBNull.Value ? 0 : Convert.ToInt32(config_Row["SizeX"]);
                                config.SizeY = config_Row["SizeY"] == DBNull.Value ? 0 : Convert.ToInt32(config_Row["SizeY"]);
                                config.SortOrder = config_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(config_Row["SortOrder"]);
                                config.TileConfigId = config_Row["TileConfigId"] == DBNull.Value ? 0 : Convert.ToInt32(config_Row["TileConfigId"]);
                                config.UniqueId = config_Row["UniqueId"] == DBNull.Value ? null : config_Row["UniqueId"].ToString();
                            }
                        }
                    }
                    tile.Config = config;

                    //tile.Ruleset =;
                    //tile.RulesetDashboardPage =;
                    //tile.TileType =;
                    tileList.Add(tile);
                }
            }
            return tileList;
        }

        public async Task<CharacterTile> Update(CharacterTile item)
        {
            var characterTile = await _repo.Get(item.CharacterTileId);

            if (characterTile == null) return characterTile;

            //characterTile.Color = item.Color;
            //characterTile.BgColor = item.BgColor;
            characterTile.Shape = item.Shape;
            characterTile.Height = item.Height;
            characterTile.Width = item.Width;
            characterTile.LocationX = item.LocationX;
            characterTile.LocationY = item.LocationY;
            characterTile.SortOrder = item.SortOrder;
            try
            {
                await _repo.Update(characterTile);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return characterTile;
        }

        public async Task<CharacterTile> UpdateSortOrder(int id, int sortOrder)
        {
            var characterTile = await _repo.Get(id);
            if (characterTile == null) return characterTile;

            characterTile.SortOrder = sortOrder;
            try
            {
                await _repo.Update(characterTile);
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return characterTile;
        }
        public SP_CharactersCharacterStat GetCharactersCharacterStats_sp(int characterId)
        {
            SP_CharactersCharacterStat obj = new SP_CharactersCharacterStat();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC CharactersCharacterStats_GetByCharacterID @CharacterID = '" + characterId + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("CharactersCharacterStats_GetByCharacterID", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@CharacterID", characterId);
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
            {
                short num = 0;
                List<CharactersCharacterStat> list = new List<CharactersCharacterStat>();
                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    CharactersCharacterStat ccs = new CharactersCharacterStat()
                    {
                        CalculationResult = row["CalculationResult"] == DBNull.Value ? 0 : Convert.ToInt32(row["CalculationResult"]),
                        CharacterId = row["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterId"]),
                        CharactersCharacterStatId = row["CharactersCharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharactersCharacterStatId"]),
                        CharacterStatId = row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterStatId"]),
                        Choice = row["Choice"] == DBNull.Value ? null : row["Choice"].ToString(),
                        Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString(),
                        Current = row["Current"] == DBNull.Value ? 0 : Convert.ToInt32(row["Current"]),
                        IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]),
                        Maximum = row["Maximum"] == DBNull.Value ? 0 : Convert.ToInt32(row["Maximum"]),
                        MultiChoice = row["MultiChoice"] == DBNull.Value ? null : row["MultiChoice"].ToString(),
                        Number = row["Number"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["Number"]),
                        OnOff = row["OnOff"] == DBNull.Value ? false : Convert.ToBoolean(row["OnOff"]),
                        RichText = row["RichText"] == DBNull.Value ? null : row["RichText"].ToString(),
                        SubValue = row["SubValue"] == DBNull.Value ? 0 : Convert.ToInt32(row["SubValue"]),
                        Text = row["Text"] == DBNull.Value ? null : row["Text"].ToString(),
                        Value = row["Value"] == DBNull.Value ? 0 : Convert.ToInt32(row["Value"]),
                        YesNo = row["YesNo"] == DBNull.Value ? false : Convert.ToBoolean(row["YesNo"]),
                        Minimum = row["Minimum"] == DBNull.Value ? 0 : Convert.ToInt32(row["Minimum"]),
                        DefaultValue = row["DefaultValue"] == DBNull.Value ? 0 : Convert.ToInt32(row["DefaultValue"]),
                        ComboText = row["ComboText"] == DBNull.Value ? "" : row["ComboText"].ToString(),
                        Display = row["Display"] == DBNull.Value ? false : Convert.ToBoolean(row["Display"]),
                        IsCustom = row["IsCustom"] == DBNull.Value ? false : Convert.ToBoolean(row["IsCustom"]),
                        IsOn = row["IsOn"] == DBNull.Value ? false : Convert.ToBoolean(row["IsOn"]),
                        IsYes = row["IsYes"] == DBNull.Value ? false : Convert.ToBoolean(row["IsYes"]),
                        ShowCheckbox = row["ShowCheckbox"] == DBNull.Value ? false : Convert.ToBoolean(row["ShowCheckbox"]),
                        LinkType = row["LinkType"] == DBNull.Value ? null : row["LinkType"].ToString(),
                        CharacterStat = new CharacterStat()
                        {
                            CharacterStatTypeId = row["CharacterStatTypeId"] == DBNull.Value ? num : (short)(row["CharacterStatTypeId"]),
                            CharacterStatId = row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterStatId"]),
                            StatName = row["StatName"] == DBNull.Value ? null : row["StatName"].ToString(),
                            isMultiSelect = row["isMultiSelect"] == DBNull.Value ? false : Convert.ToBoolean(row["isMultiSelect"]),
                            
                            //CharacterStatChoices = _characterStatChoiceService.GetByIds(((row["Choice"] == DBNull.Value ? "" : row["Choice"].ToString()) + (row["MultiChoice"] == DBNull.Value ? "" : row["MultiChoice"].ToString())).ToString()),
                            //CharacterStatCalcs = _characterStatCalcService.GetByStatId(row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterStatId"]))
                        }
                        
                    };
                    utility.FillStatChoices(ds, ccs.CharacterStat, (int)ccs.CharacterStatId, 3);
                    utility.FillStatCalcs(ds, ccs.CharacterStat, (int)ccs.CharacterStatId, 2);
                    list.Add(ccs);
                }
                obj.charactersCharacterStat = list;
            }

            if (ds.Tables[1].Rows.Count > 0)
            {
                obj.character = _repo.GetCharacter(ds.Tables[1]);
            }
            return obj;
        }
        public CharacterStatToggle GetCharacterStatToggleList(int characterStatId)
        {
            var res = _context.CharacterStatToggle.Where(x => x.CharacterStatId == characterStatId && x.IsDeleted == false).Select(x => new CharacterStatToggle()
            {
                CharacterStatId = x.CharacterStatId,
                CharacterStatToggleId = x.CharacterStatToggleId,
                Display = x.Display,
                IsCustom = x.IsCustom,
                IsDeleted = x.IsDeleted,
                OnOff = x.OnOff,
                ShowCheckbox = x.ShowCheckbox,
                YesNo = x.YesNo,
                CustomToggles = _context.CustomToggle.Where(z => z.CharacterStatToggleId == x.CharacterStatToggleId).ToList()
            }).FirstOrDefault();
            return res;
        }
    }
}
