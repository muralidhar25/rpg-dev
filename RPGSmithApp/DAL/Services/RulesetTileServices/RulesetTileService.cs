using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.RulesetTileModels;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace DAL.Services.RulesetTileServices
{
    public class RulesetTileService : IRulesetTileService
    {
        private readonly IRepository<RulesetTile> _repo;
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        //Int32 _rulesetId;
        //string userId;

        public RulesetTileService(ApplicationDbContext context, IRepository<RulesetTile> repo, IConfiguration configuration)
        {
            _repo = repo;
            _context = context;
            _configuration = configuration;
        }

        public async Task<RulesetTile> Create(RulesetTile item)
        {
            item.IsDeleted = false;
            var _RulesetTile = await _repo.Add(item);
            return _RulesetTile;
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
                    var nt = _context.RulesetNoteTiles.Where(p => p.RulesetTileId == tile.RulesetTileId && p.IsDeleted != true).SingleOrDefault();
                    if (nt != null)
                        nt.IsDeleted = true;
                    break;
                case 2:
                    //Remove Image Tile 
                    var it = _context.RulesetImageTiles.Where(p => p.RulesetTileId == tile.RulesetTileId && p.IsDeleted != true).SingleOrDefault();
                    if (it != null)
                        it.IsDeleted = true;
                    break;
                case 3:
                    //Remove Counter Tile 
                    var ct = _context.RulesetCounterTiles.Where(p => p.RulesetTileId == tile.RulesetTileId && p.IsDeleted != true).SingleOrDefault();
                    if (ct != null)
                        ct.IsDeleted = true;
                    break;
                case 4:
                    //Remove Ruleset Stat Tiles 
                    var cst = _context.RulesetCharacterStatTiles.Where(p => p.RulesetTileId == tile.RulesetTileId && p.IsDeleted != true).SingleOrDefault();
                    if (cst != null)
                        cst.IsDeleted = true;
                    break;
                case 5:
                    ////Remove Link Tiles 
                    //var lt = _context.RulesetLinkTiles.Where(p => p.TileId == tile.RulesetTileId && p.IsDeleted != true).SingleOrDefault();
                    //if (lt != null)
                    //    lt.IsDeleted = true;
                    break;
                case 6:
                    //Remove Execute iles
                    //var et = _context.ExecuteTiles.Where(p => p.TileId == tile.RulesetTileId && p.IsDeleted != true).SingleOrDefault();
                    //if (et != null)
                    //    et.IsDeleted = true;
                    break;
                case 7:
                    //Remove Command Tile 
                    var cot = _context.RulesetCommandTiles.Where(p => p.RulesetTileId == tile.RulesetTileId && p.IsDeleted != true).SingleOrDefault();
                    if (cot != null)
                        cot.IsDeleted = true;
                    break;
                case 8:
                    //Remove Text Tile 
                    var tt = _context.RulesetTextTiles.Where(p => p.RulesetTileId == tile.RulesetTileId && p.IsDeleted != true).SingleOrDefault();
                    if (tt != null)
                        tt.IsDeleted = true;
                    break;
                default:
                    break;
            }
            var config = _context.RulesetTileConfig.Where(p => p.RulesetTileId == tile.RulesetTileId && p.IsDeleted != true).SingleOrDefault();
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

        public RulesetTile GetById(int? id)
        {
            RulesetTile RulesetTile = _context.RulesetTiles
                .Where(x => x.RulesetTileId == id && x.IsDeleted != true)
                .Include(d => d.Ruleset)
                .Include(d => d.RulesetDashboardPage)
                .Include(d => d.CharacterStatTiles).ThenInclude(y => y.CharacterStat).ThenInclude(q => q.CharacterStatChoices)
                                .Include(d => d.CharacterStatTiles).ThenInclude(y => y.CharacterStat).ThenInclude(y => y.CharacterStatType)
                                .Include(d => d.CharacterStatTiles).ThenInclude(y => y.CharacterStat).ThenInclude(y => y.CharacterStatCalcs)
                .Include(d => d.CommandTiles)
                .Include(d => d.CounterTiles)
                .Include(d => d.NoteTiles)
                .Include(d => d.ImageTiles)
                 // .Include(d => d.LinkTiles).ThenInclude(y => y.Ability)
                 // .Include(d => d.LinkTiles).ThenInclude(y => y.Spell)
                 //.Include(d => d.LinkTiles).ThenInclude(y => y.Item)
                 //.Include(d => d.ExecuteTiles).ThenInclude(y => y.Ability)
                 // .Include(d => d.ExecuteTiles).ThenInclude(y => y.Spell)
                 // .Include(d => d.ExecuteTiles).ThenInclude(y => y.Item)
                 .Include(d => d.Config)
                  .AsNoTracking()
            .SingleOrDefault();

            if (RulesetTile.CharacterStatTiles != null)
                RulesetTile.CharacterStatTiles = RulesetTile.CharacterStatTiles.IsDeleted == false ? RulesetTile.CharacterStatTiles : null;
            if (RulesetTile.CommandTiles != null)
                RulesetTile.CommandTiles = RulesetTile.CommandTiles.IsDeleted == false ? RulesetTile.CommandTiles : null;
            if (RulesetTile.CounterTiles != null)
                RulesetTile.CounterTiles = RulesetTile.CounterTiles.IsDeleted == false ? RulesetTile.CounterTiles : null;
            if (RulesetTile.NoteTiles != null)
                RulesetTile.NoteTiles = RulesetTile.NoteTiles.IsDeleted == false ? RulesetTile.NoteTiles : null;
            if (RulesetTile.ImageTiles != null)
                RulesetTile.ImageTiles = RulesetTile.ImageTiles.IsDeleted == false ? RulesetTile.ImageTiles : null;
            //if (characterTile.LinkTiles != null)
            //    characterTile.LinkTiles = characterTile.LinkTiles.IsDeleted == false ? characterTile.LinkTiles : null;
            //if (characterTile.ExecuteTiles != null)
            //    characterTile.ExecuteTiles = characterTile.ExecuteTiles.IsDeleted == false ? characterTile.ExecuteTiles : null;

            return RulesetTile;
        }

        public int GetCountByPageIdRulesetId(int pageId, int RulesetId)
        {
            return _context.RulesetTiles
                .Where(x => x.RulesetDashboardPageId == pageId && x.RulesetId == RulesetId && x.IsDeleted != true).Count();
        }

        public List<RulesetTile> GetByPageIdRulesetId(int pageId, int RulesetId)
        {
            List<RulesetTile> _RulesetTiles = GetByPageIdRulesetId_sp(pageId, RulesetId).ToList();
            //List<RulesetTile> _RulesetTiles = _context.RulesetTiles
            //    .Where(x => x.RulesetDashboardPageId == pageId
            //        && x.RulesetId == RulesetId
            //        && x.IsDeleted != true)
            //    .Include(d => d.Ruleset)
            //    .Include(d => d.RulesetDashboardPage)
            //    .Include(d => d.CharacterStatTiles).ThenInclude(y => y.CharacterStat).ThenInclude(q => q.CharacterStatChoices)
            //                    .Include(d => d.CharacterStatTiles).ThenInclude(y => y.CharacterStat).ThenInclude(y => y.CharacterStatType)
            //                    .Include(d => d.CharacterStatTiles).ThenInclude(y => y.CharacterStat).ThenInclude(y => y.CharacterStatCalcs)
            //    .Include(d => d.CommandTiles)
            //    .Include(d => d.CounterTiles)
            //    .Include(d => d.NoteTiles)
            //    .Include(d => d.ImageTiles)
            //      //.Include(d => d.LinkTiles).ThenInclude(y => y.Ability).ThenInclude(y => y.Ability)
            //      //.Include(d => d.LinkTiles).ThenInclude(y => y.Spell).ThenInclude(y => y.Spell)
            //      //.Include(d => d.LinkTiles).ThenInclude(y => y.Item)
            //      //.Include(d => d.ExecuteTiles).ThenInclude(y => y.Ability).ThenInclude(y => y.Ability)
            //      //.Include(d => d.ExecuteTiles).ThenInclude(y => y.Spell).ThenInclude(y => y.Spell)
            //      //.Include(d => d.ExecuteTiles).ThenInclude(y => y.Item)
            //      .Include(d => d.Config)
            //      .AsNoTracking()
            //   .ToList();

            return _RulesetTiles;
        }
        public IEnumerable<RulesetTile> GetByPageIdRulesetId_sp(int pageId, int rulesetId)
        {
            List<CharacterStat> ClusterSelectedCharStats = new List<CharacterStat>();
            bool IsClusterCharacterStatsFilled = false;

            List<RulesetTile> tileList = new List<RulesetTile>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC Ruleset_GetTilesByPageID @RulesetID = '" + rulesetId + "' ,@PageID='" + pageId + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("Ruleset_GetTilesByPageID", connection);

                // Add the parameters for the SelectCommand.
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
                    RulesetTile tile = new RulesetTile();
                    tile.Height = row["Height"] == DBNull.Value ? 0 : Convert.ToInt32(row["Height"]);
                    tile.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                    tile.LocationX = row["LocationX"] == DBNull.Value ? 0 : Convert.ToInt32(row["LocationX"]);
                    tile.LocationY = row["LocationY"] == DBNull.Value ? 0 : Convert.ToInt32(row["LocationY"]);
                    tile.RulesetDashboardPageId = row["RulesetDashboardPageId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RulesetDashboardPageId"]);
                    tile.RulesetId = row["RulesetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RulesetId"]);
                    tile.RulesetTileId = row["RulesetTileId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RulesetTileId"]);
                    tile.Shape = row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(row["Shape"]);
                    tile.SortOrder = row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(row["SortOrder"]);
                    tile.TileTypeId = row["TileTypeId"] == DBNull.Value ? 0 : Convert.ToInt32(row["TileTypeId"]);
                    tile.Width = row["Width"] == DBNull.Value ? 0 : Convert.ToInt32(row["Width"]);
                    switch (tile.TileTypeId)
                    {
                        case 1://NoteTiles
                            RulesetNoteTile NT = null;
                            if (ds.Tables[5].Rows.Count > 0)
                            {
                                foreach (DataRow NT_Row in ds.Tables[5].Rows)
                                {
                                    int RulesetTileId = NT_Row["RulesetTileId"] == DBNull.Value ? 0 : Convert.ToInt32(NT_Row["RulesetTileId"]);
                                    if (RulesetTileId == tile.RulesetTileId)
                                    {
                                        NT = new RulesetNoteTile();
                                        //DataRow NT_Row = ds.Tables[5].Rows[0];
                                        NT.BodyBgColor = NT_Row["BodyBgColor"] == DBNull.Value ? null : NT_Row["BodyBgColor"].ToString();
                                        NT.BodyTextColor = NT_Row["BodyTextColor"] == DBNull.Value ? null : NT_Row["BodyTextColor"].ToString();
                                        NT.Content = NT_Row["Content"] == DBNull.Value ? null : NT_Row["Content"].ToString();
                                        NT.IsDeleted = NT_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(NT_Row["IsDeleted"]);
                                        NT.NoteTileId = NT_Row["NoteTileId"] == DBNull.Value ? 0 : Convert.ToInt32(NT_Row["NoteTileId"]);
                                        NT.RulesetTileId = RulesetTileId;
                                        NT.Shape = NT_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(NT_Row["Shape"]);
                                        NT.SortOrder = NT_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(NT_Row["SortOrder"]);
                                        NT.Title = NT_Row["Title"] == DBNull.Value ? null : NT_Row["Title"].ToString();
                                        NT.TitleBgColor = NT_Row["TitleBgColor"] == DBNull.Value ? null : NT_Row["TitleBgColor"].ToString();
                                        NT.TitleTextColor = NT_Row["TitleTextColor"] == DBNull.Value ? null : NT_Row["TitleTextColor"].ToString();
                                        NT.IsManual = NT_Row["IsManual"] == DBNull.Value ? false : Convert.ToBoolean(NT_Row["IsManual"]);
                                        NT.FontSize = NT_Row["FontSize"] == DBNull.Value ? 0 : Convert.ToInt32(NT_Row["FontSize"]);
                                        //NT.FontSizeTitle = NT_Row["FontSizeTitle"] == DBNull.Value ? 0 : Convert.ToInt32(NT_Row["FontSizeTitle"]);
                                    }
                                }
                            }
                            tile.NoteTiles = NT;
                            break;

                        case 2://ImageTiles
                            RulesetImageTile IT = null;
                            if (ds.Tables[6].Rows.Count > 0)
                            {
                                foreach (DataRow IT_Row in ds.Tables[6].Rows)
                                {
                                    int RulesetTileId = IT_Row["RulesetTileId"] == DBNull.Value ? 0 : Convert.ToInt32(IT_Row["RulesetTileId"]);
                                    if (RulesetTileId == tile.RulesetTileId)
                                    {
                                        IT = new RulesetImageTile();
                                        IT.BodyBgColor = IT_Row["BodyBgColor"] == DBNull.Value ? null : IT_Row["BodyBgColor"].ToString();
                                        IT.BodyTextColor = IT_Row["BodyTextColor"] == DBNull.Value ? null : IT_Row["BodyTextColor"].ToString();
                                        IT.IsDeleted = IT_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(IT_Row["IsDeleted"]);
                                        IT.ImageTileId = IT_Row["ImageTileId"] == DBNull.Value ? 0 : Convert.ToInt32(IT_Row["ImageTileId"]);
                                        IT.RulesetTileId = RulesetTileId;
                                        IT.Shape = IT_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(IT_Row["Shape"]);
                                        IT.SortOrder = IT_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(IT_Row["SortOrder"]);
                                        IT.Title = IT_Row["Title"] == DBNull.Value ? null : IT_Row["Title"].ToString();
                                        IT.TitleBgColor = IT_Row["TitleBgColor"] == DBNull.Value ? null : IT_Row["TitleBgColor"].ToString();
                                        IT.TitleTextColor = IT_Row["TitleTextColor"] == DBNull.Value ? null : IT_Row["TitleTextColor"].ToString();
                                        IT.ImageUrl = IT_Row["ImageUrl"] == DBNull.Value ? null : IT_Row["ImageUrl"].ToString();
                                        IT.IsManual = IT_Row["IsManual"] == DBNull.Value ? false : Convert.ToBoolean(IT_Row["IsManual"]);
                                        IT.FontSize = IT_Row["FontSize"] == DBNull.Value ? 0 : Convert.ToInt32(IT_Row["FontSize"]);
                                        //IT.FontSizeTitle = IT_Row["FontSizeTitle"] == DBNull.Value ? 0 : Convert.ToInt32(IT_Row["FontSizeTitle"]);
                                    }
                                }
                            }
                            tile.ImageTiles = IT;
                            break;

                        case 3://CounterTiles
                            RulesetCounterTile CNT = null;
                            if (ds.Tables[4].Rows.Count > 0)
                            {
                                foreach (DataRow CNT_Row in ds.Tables[4].Rows)
                                {
                                    int RulesetTileId = CNT_Row["RulesetTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CNT_Row["RulesetTileId"]);
                                    if (RulesetTileId == tile.RulesetTileId)
                                    {
                                        CNT = new RulesetCounterTile();
                                        CNT.BodyBgColor = CNT_Row["BodyBgColor"] == DBNull.Value ? null : CNT_Row["BodyBgColor"].ToString();
                                        CNT.BodyTextColor = CNT_Row["BodyTextColor"] == DBNull.Value ? null : CNT_Row["BodyTextColor"].ToString();
                                        CNT.IsDeleted = CNT_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CNT_Row["IsDeleted"]);
                                        CNT.CounterTileId = CNT_Row["CounterTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CNT_Row["CounterTileId"]);
                                        CNT.RulesetTileId = RulesetTileId;
                                        CNT.Shape = CNT_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(CNT_Row["Shape"]);
                                        CNT.SortOrder = CNT_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(CNT_Row["SortOrder"]);
                                        CNT.Title = CNT_Row["Title"] == DBNull.Value ? null : CNT_Row["Title"].ToString();
                                        CNT.TitleBgColor = CNT_Row["TitleBgColor"] == DBNull.Value ? null : CNT_Row["TitleBgColor"].ToString();
                                        CNT.TitleTextColor = CNT_Row["TitleTextColor"] == DBNull.Value ? null : CNT_Row["TitleTextColor"].ToString();
                                        CNT.CurrentValue = CNT_Row["CurrentValue"] == DBNull.Value ? 0 : Convert.ToInt32(CNT_Row["CurrentValue"]);
                                        CNT.DefaultValue = CNT_Row["DefaultValue"] == DBNull.Value ? 0 : Convert.ToInt32(CNT_Row["DefaultValue"]);
                                        CNT.Maximum = CNT_Row["Maximum"] == DBNull.Value ? (int?)null : Convert.ToInt32(CNT_Row["Maximum"]);
                                        CNT.Minimum = CNT_Row["Minimum"] == DBNull.Value ? (int?)null : Convert.ToInt32(CNT_Row["Minimum"]);
                                        CNT.Step = CNT_Row["Step"] == DBNull.Value ? 1 : Convert.ToInt32(CNT_Row["Step"]); //default step=1
                                        CNT.IsManual = CNT_Row["IsManual"] == DBNull.Value ? false : Convert.ToBoolean(CNT_Row["IsManual"]);
                                        CNT.FontSize = CNT_Row["FontSize"] == DBNull.Value ? 0 : Convert.ToInt32(CNT_Row["FontSize"]);
                                        //CNT.FontSizeTitle = CNT_Row["FontSizeTitle"] == DBNull.Value ? 0 : Convert.ToInt32(CNT_Row["FontSizeTitle"]);
                                    }
                                }
                            }
                            tile.CounterTiles = CNT;
                            break;

                        case 4://CharacterStatTiles
                            RulesetCharacterStatTile CST = null;
                            if (ds.Tables[7].Rows.Count > 0)
                            {
                                foreach (DataRow CST_Row in ds.Tables[7].Rows)
                                {
                                    int RulesetTileId = CST_Row["RulesetTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CST_Row["RulesetTileId"]);
                                    if (RulesetTileId == tile.RulesetTileId)
                                    {
                                        CST = new RulesetCharacterStatTile();
                                        CST.bodyBgColor = CST_Row["bodyBgColor"] == DBNull.Value ? null : CST_Row["bodyBgColor"].ToString();
                                        CST.bodyTextColor = CST_Row["bodyTextColor"] == DBNull.Value ? null : CST_Row["bodyTextColor"].ToString();
                                        CST.IsDeleted = CST_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CST_Row["IsDeleted"]);
                                        CST.CharacterStatTileId = CST_Row["CharacterStatTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CST_Row["CharacterStatTileId"]);
                                        CST.RulesetTileId = RulesetTileId;
                                        CST.Shape = CST_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(CST_Row["Shape"]);
                                        CST.SortOrder = CST_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(CST_Row["SortOrder"]);
                                        CST.titleBgColor = CST_Row["titleBgColor"] == DBNull.Value ? null : CST_Row["titleBgColor"].ToString();
                                        CST.titleTextColor = CST_Row["titleTextColor"] == DBNull.Value ? null : CST_Row["titleTextColor"].ToString();
                                        CST.CharacterStatId = CST_Row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CST_Row["CharacterStatId"]);
                                        CST.ShowTitle = CST_Row["ShowTitle"] == DBNull.Value ? false : Convert.ToBoolean(CST_Row["ShowTitle"]);
                                        CST.ImageUrl = CST_Row["ImageUrl"] == DBNull.Value ? null : CST_Row["ImageUrl"].ToString();
                                        CST.IsManual = CST_Row["IsManual"] == DBNull.Value ? false : Convert.ToBoolean(CST_Row["IsManual"]);
                                        CST.FontSize = CST_Row["FontSize"] == DBNull.Value ? 0 : Convert.ToInt32(CST_Row["FontSize"]);
                                        //CST.FontSizeTitle = CST_Row["FontSizeTitle"] == DBNull.Value ? 0 : Convert.ToInt32(CST_Row["FontSizeTitle"]);

                                        CharacterStat CharStat = null;
                                        if (ds.Tables[8].Rows.Count > 0)
                                        {
                                            foreach (DataRow CharStat_Row in ds.Tables[8].Rows)
                                            {
                                                short num = 0;
                                                int characterstatID = CharStat_Row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CharStat_Row["CharacterStatId"]);
                                                if (characterstatID == CST.CharacterStatId)
                                                {
                                                    CharStat = new CharacterStat();
                                                    CharStat.CharacterStatId = characterstatID;
                                                    CharStat.RuleSetId = CharStat_Row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(CharStat_Row["RuleSetId"]);
                                                    CharStat.StatName = CharStat_Row["StatName"] == DBNull.Value ? null : CharStat_Row["StatName"].ToString();
                                                    CharStat.StatDesc = CharStat_Row["StatDesc"] == DBNull.Value ? null : CharStat_Row["StatDesc"].ToString();
                                                    CharStat.isActive = CharStat_Row["isActive"] == DBNull.Value ? false : Convert.ToBoolean(CharStat_Row["isActive"]);
                                                    CharStat.CharacterStatTypeId = CharStat_Row["CharacterStatTypeId"] == DBNull.Value ? num : (short)(CharStat_Row["CharacterStatTypeId"]);
                                                    CharStat.isMultiSelect = CharStat_Row["isMultiSelect"] == DBNull.Value ? false : Convert.ToBoolean(CharStat_Row["isMultiSelect"]);
                                                    CharStat.ParentCharacterStatId = CharStat_Row["ParentCharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CharStat_Row["ParentCharacterStatId"]);
                                                    CharStat.SortOrder = CharStat_Row["SortOrder"] == DBNull.Value ? num : (short)(CharStat_Row["SortOrder"]);
                                                    CharStat.IsDeleted = CharStat_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CharStat_Row["IsDeleted"]);
                                                    CharStat.IsChoiceNumeric = CharStat_Row["IsChoiceNumeric"] == DBNull.Value ? false : Convert.ToBoolean(CharStat_Row["IsChoiceNumeric"]);                                                   
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

                                                    ////
                                                    List<CharacterStatDefaultValue> dfv = new List<CharacterStatDefaultValue>();
                                                    if (ds.Tables[14].Rows.Count > 0)
                                                    {
                                                        foreach (DataRow r in ds.Tables[14].Rows)
                                                        {
                                                            int dfvCharacterStat = r["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatId"]);
                                                            if (characterstatID == dfvCharacterStat)
                                                            {
                                                                CharacterStatDefaultValue cal = new CharacterStatDefaultValue();
                                                                cal.CharacterStatId = r["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatId"]);
                                                                cal.CharacterStatDefaultValueId = r["CharacterStatDefaultValueId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatDefaultValueId"]);
                                                                cal.DefaultValue = r["DefaultValue"] == DBNull.Value ? null : r["DefaultValue"].ToString();
                                                                cal.Maximum = r["Maximum"] == DBNull.Value ? 0 : Convert.ToInt32(r["Maximum"]);
                                                                cal.Minimum = r["Minimum"] == DBNull.Value ? 0 : Convert.ToInt32(r["Minimum"]);
                                                                cal.Type = r["Type"] == DBNull.Value ? 0 : Convert.ToInt32(r["Type"]);
                                                                dfv.Add(cal);
                                                            }
                                                        }
                                                    }
                                                    CharStat.CharacterStatDefaultValues = dfv.OrderBy(x=>x.Type).ToList();

                                                    CharacterStatCombo combo = new CharacterStatCombo();
                                                    if (ds.Tables[15].Rows.Count > 0)
                                                    {
                                                        foreach (DataRow r in ds.Tables[15].Rows)
                                                        {
                                                            int comboCharacterStat = r["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatId"]);
                                                            if (characterstatID == comboCharacterStat)
                                                            {

                                                                combo.CharacterStatComboId = r["CharacterStatComboId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatComboId"]);
                                                                combo.CharacterStatId = r["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatId"]);
                                                                combo.DefaultText = r["DefaultText"] == DBNull.Value ? null : r["DefaultText"].ToString();
                                                                combo.DefaultValue = r["DefaultValue"] == DBNull.Value ? 0 : Convert.ToInt32(r["DefaultValue"]);
                                                                
                                                                break;
                                                            }

                                                        }
                                                    }
                                                    CharStat.CharacterStatCombos = combo;
                                                    //////

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


                                                    CharacterStatToggle CharacterStatToggle = GetCharacterStatToggleList((int)CharStat.CharacterStatId);
                                                    //if (CharacterStatToggle != null)
                                                    //{
                                                    //    //CharacterStatToggle CharacterStatToggle = GetCharacterStatToggleList((int)CharCharStat.CharacterStatId);
                                                    //    if (CharacterStatToggle.IsCustom)
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
                                                    CharStat.CharacterStatToggles = CharacterStatToggle;
                                                }

                                            }

                                        }
                                        CST.CharacterStat = CharStat;
                                    }
                                }
                            }
                            tile.CharacterStatTiles = CST;
                            break;

                        case 7://CommandTiles
                            RulesetCommandTile CMT = null;
                            if (ds.Tables[3].Rows.Count > 0)
                            {
                                foreach (DataRow CMT_Row in ds.Tables[3].Rows)
                                {
                                    int RulesetTileId = CMT_Row["RulesetTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CMT_Row["RulesetTileId"]);
                                    if (RulesetTileId == tile.RulesetTileId)
                                    {
                                        CMT = new RulesetCommandTile();
                                        CMT.BodyBgColor = CMT_Row["BodyBgColor"] == DBNull.Value ? null : CMT_Row["BodyBgColor"].ToString();
                                        CMT.BodyTextColor = CMT_Row["BodyTextColor"] == DBNull.Value ? null : CMT_Row["BodyTextColor"].ToString();
                                        CMT.IsDeleted = CMT_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CMT_Row["IsDeleted"]);
                                        CMT.CommandTileId = CMT_Row["CommandTileId"] == DBNull.Value ? 0 : Convert.ToInt32(CMT_Row["CommandTileId"]);
                                        CMT.RulesetTileId = RulesetTileId;
                                        CMT.Shape = CMT_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(CMT_Row["Shape"]);
                                        CMT.SortOrder = CMT_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(CMT_Row["SortOrder"]);
                                        CMT.Title = CMT_Row["Title"] == DBNull.Value ? null : CMT_Row["Title"].ToString();
                                        CMT.TitleBgColor = CMT_Row["TitleBgColor"] == DBNull.Value ? null : CMT_Row["TitleBgColor"].ToString();
                                        CMT.TitleTextColor = CMT_Row["TitleTextColor"] == DBNull.Value ? null : CMT_Row["TitleTextColor"].ToString();
                                        CMT.ImageUrl = CMT_Row["ImageUrl"] == DBNull.Value ? null : CMT_Row["ImageUrl"].ToString();
                                        CMT.Command = CMT_Row["Command"] == DBNull.Value ? null : CMT_Row["Command"].ToString();
                                        CMT.IsManual = CMT_Row["IsManual"] == DBNull.Value ? false : Convert.ToBoolean(CMT_Row["IsManual"]);
                                        CMT.FontSize = CMT_Row["FontSize"] == DBNull.Value ? 0 : Convert.ToInt32(CMT_Row["FontSize"]);
                                        //CMT.FontSizeTitle = CMT_Row["FontSizeTitle"] == DBNull.Value ? 0 : Convert.ToInt32(CMT_Row["FontSizeTitle"]);
                                    }
                                }
                            }
                            tile.CommandTiles = CMT;
                            break;
                        case 8://TextTiles
                            RulesetTextTile TT = null;
                            if (ds.Tables[13].Rows.Count > 0)
                            {
                                foreach (DataRow TT_Row in ds.Tables[13].Rows)
                                {
                                    int RulesetTileId = TT_Row["RulesetTileId"] == DBNull.Value ? 0 : Convert.ToInt32(TT_Row["RulesetTileId"]);
                                    if (RulesetTileId == tile.RulesetTileId)
                                    {
                                        TT = new RulesetTextTile();
                                        TT.BodyBgColor = TT_Row["BodyBgColor"] == DBNull.Value ? null : TT_Row["BodyBgColor"].ToString();
                                        TT.BodyTextColor = TT_Row["BodyTextColor"] == DBNull.Value ? null : TT_Row["BodyTextColor"].ToString();
                                        TT.IsDeleted = TT_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(TT_Row["IsDeleted"]);
                                        TT.TextTileId = TT_Row["TextTileId"] == DBNull.Value ? 0 : Convert.ToInt32(TT_Row["TextTileId"]);
                                        TT.RulesetTileId = RulesetTileId;
                                        TT.Shape = TT_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(TT_Row["Shape"]);
                                        TT.SortOrder = TT_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(TT_Row["SortOrder"]);
                                        TT.Title = TT_Row["Title"] == DBNull.Value ? null : TT_Row["Title"].ToString();
                                        TT.TitleBgColor = TT_Row["TitleBgColor"] == DBNull.Value ? null : TT_Row["TitleBgColor"].ToString();
                                        TT.TitleTextColor = TT_Row["TitleTextColor"] == DBNull.Value ? null : TT_Row["TitleTextColor"].ToString();
                                        TT.Text = TT_Row["Text"] == DBNull.Value ? null : TT_Row["Text"].ToString();
                                        TT.IsManualTitle = TT_Row["IsManualTitle"] == DBNull.Value ? false : Convert.ToBoolean(TT_Row["IsManualTitle"]);
                                        TT.FontSizeTitle = TT_Row["FontSizeTitle"] == DBNull.Value ? 0 : Convert.ToInt32(TT_Row["FontSizeTitle"]);
                                        TT.IsManualText = TT_Row["IsManualText"] == DBNull.Value ? false : Convert.ToBoolean(TT_Row["IsManualText"]);
                                        TT.FontSizeText = TT_Row["FontSizeText"] == DBNull.Value ? 0 : Convert.ToInt32(TT_Row["FontSizeText"]);
                                    }
                                }
                            }
                            tile.TextTiles = TT;
                            break;
                        case 9://BuffAndEffectTiles
                            RulesetBuffAndEffectTileVM BET = null;
                            if (ds.Tables[16].Rows.Count > 0)
                            {
                                foreach (DataRow BET_Row in ds.Tables[16].Rows)
                                {
                                    int RulesetTileId = BET_Row["RulesetTileId"] == DBNull.Value ? 0 : Convert.ToInt32(BET_Row["RulesetTileId"]);
                                    if (RulesetTileId == tile.RulesetTileId)
                                    {
                                        BET = new RulesetBuffAndEffectTileVM();
                                        BET.Title = BET_Row["Title"] == DBNull.Value ? null : BET_Row["Title"].ToString();
                                        BET.BodyBgColor = BET_Row["BodyBgColor"] == DBNull.Value ? null : BET_Row["BodyBgColor"].ToString();
                                        BET.BodyTextColor = BET_Row["BodyTextColor"] == DBNull.Value ? null : BET_Row["BodyTextColor"].ToString();
                                        BET.RulesetTileId = RulesetTileId;
                                        BET.IsDeleted = BET_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(BET_Row["IsDeleted"]);
                                        BET.BuffAndEffectTileId = BET_Row["BuffAndEffectTileId"] == DBNull.Value ? 0 : Convert.ToInt32(BET_Row["BuffAndEffectTileId"]);
                                        BET.Shape = BET_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(BET_Row["Shape"]);
                                        BET.ShowTitle = BET_Row["ShowTitle"] == DBNull.Value ? false : Convert.ToBoolean(BET_Row["ShowTitle"]);
                                        BET.SortOrder = BET_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(BET_Row["SortOrder"]);
                                        BET.TitleBgColor = BET_Row["TitleBgColor"] == DBNull.Value ? null : BET_Row["TitleBgColor"].ToString();
                                        BET.TitleTextColor = BET_Row["TitleTextColor"] == DBNull.Value ? null : BET_Row["TitleTextColor"].ToString();
                                        BET.DisplayLinkImage = BET_Row["DisplayLinkImage"] == DBNull.Value ? false : Convert.ToBoolean(BET_Row["DisplayLinkImage"]);
                                        BET.IsManual = BET_Row["IsManual"] == DBNull.Value ? false : Convert.ToBoolean(BET_Row["IsManual"]);
                                        BET.FontSize = BET_Row["FontSize"] == DBNull.Value ? 0 : Convert.ToInt32(BET_Row["FontSize"]);
                                        //BET.FontSizeTitle = BET_Row["FontSizeTitle"] == DBNull.Value ? 0 : Convert.ToInt32(BET_Row["FontSizeTitle"]);
                                        BET.MultiBuffAndEffectsIds = new List<BuffAndEffect>();
                                        if (ds.Tables[17].Rows.Count > 0)
                                        {
                                            foreach (DataRow BE_Row in ds.Tables[17].Rows)
                                            {
                                                BuffAndEffect BuffAndEffect = new BuffAndEffect()
                                                //int CharacterBuffAndEffectId = CCBE_Row["CharacterBuffAandEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(CCBE_Row["CharacterBuffAandEffectId"]);
                                                //if (CharacterBuffAndEffectId == buffAndEffectIdsForTile.CharacterBuffAndEffectId)
                                                //{
                                                {
                                                    ImageUrl = BE_Row["ImageUrl"] == DBNull.Value ? null : BE_Row["ImageUrl"].ToString(),
                                                    Name = BE_Row["Name"] == DBNull.Value ? null : BE_Row["Name"].ToString(),
                                                    BuffAndEffectId = BE_Row["BuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(BE_Row["BuffAndEffectId"]),
                                                    Description = BE_Row["Description"] == DBNull.Value ? null : BE_Row["Description"].ToString(),

                                                };

                                                //}
                                                BET.MultiBuffAndEffectsIds.Add(BuffAndEffect);
                                            }


                                        }
                                    }
                                }
                            }
                            tile.BuffAndEffectTiles = BET;
                            break;
                        case 10://ToggleTiles
                            RulesetToggleTile TGT = null;
                            if (ds.Tables[18].Rows.Count > 0)
                            {
                                foreach (DataRow TGT_Row in ds.Tables[18].Rows)
                                {
                                    int RulesetTileId = TGT_Row["RulesetTileId"] == DBNull.Value ? 0 : Convert.ToInt32(TGT_Row["RulesetTileId"]);
                                    if (RulesetTileId == tile.RulesetTileId)
                                    {
                                        TGT = new RulesetToggleTile();
                                        TGT.BodyBgColor = TGT_Row["BodyBgColor"] == DBNull.Value ? null : TGT_Row["BodyBgColor"].ToString();
                                        TGT.BodyTextColor = TGT_Row["BodyTextColor"] == DBNull.Value ? null : TGT_Row["BodyTextColor"].ToString();
                                        TGT.IsDeleted = TGT_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(TGT_Row["IsDeleted"]);
                                        TGT.ToggleTileId = TGT_Row["ToggleTileId"] == DBNull.Value ? 0 : Convert.ToInt32(TGT_Row["ToggleTileId"]);
                                        TGT.TileToggleId = TGT_Row["TileToggleId"] == DBNull.Value ? 0 : Convert.ToInt32(TGT_Row["TileToggleId"]);
                                        TGT.RulesetTileId = RulesetTileId;
                                        TGT.Shape = TGT_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(TGT_Row["Shape"]);
                                        TGT.SortOrder = TGT_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(TGT_Row["SortOrder"]);
                                        TGT.Title = TGT_Row["Title"] == DBNull.Value ? null : TGT_Row["Title"].ToString();
                                        TGT.TitleBgColor = TGT_Row["TitleBgColor"] == DBNull.Value ? null : TGT_Row["TitleBgColor"].ToString();
                                        TGT.TitleTextColor = TGT_Row["TitleTextColor"] == DBNull.Value ? null : TGT_Row["TitleTextColor"].ToString();

                                        TGT.OnOff = TGT_Row["OnOff"] == DBNull.Value ? false : Convert.ToBoolean(TGT_Row["OnOff"]);
                                        TGT.YesNo = TGT_Row["YesNo"] == DBNull.Value ? false : Convert.ToBoolean(TGT_Row["YesNo"]);
                                        TGT.CheckBox = TGT_Row["CheckBox"] == DBNull.Value ? false : Convert.ToBoolean(TGT_Row["CheckBox"]);
                                        TGT.CustomValue = TGT_Row["CustomValue"] == DBNull.Value ? 0 : Convert.ToInt32(TGT_Row["CustomValue"]);
                                        TGT.IsManual = TGT_Row["IsManual"] == DBNull.Value ? false : Convert.ToBoolean(TGT_Row["IsManual"]);
                                        TGT.FontSize = TGT_Row["FontSize"] == DBNull.Value ? 0 : Convert.ToInt32(TGT_Row["FontSize"]);
                                        //TGT.FontSizeTitle = TGT_Row["FontSizeTitle"] == DBNull.Value ? 0 : Convert.ToInt32(TGT_Row["FontSizeTitle"]);
                                        if (ds.Tables[19].Rows.Count > 0)
                                        {
                                            foreach (DataRow Toggle_Row in ds.Tables[19].Rows)
                                            {
                                                int TileToggleId = Toggle_Row["TileToggleId"] == DBNull.Value ? 0 : Convert.ToInt32(Toggle_Row["TileToggleId"]);
                                                if (TileToggleId == TGT.TileToggleId)
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
                                                        TileCustomToggles = new List<TileCustomToggle>(),
                                                    };

                                                    if (ds.Tables[20].Rows.Count > 0)
                                                    {
                                                        foreach (DataRow CustomToggle_Row in ds.Tables[20].Rows)
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
                        case 11://CharacterStatClusterTiles
                            RulesetCharacterStatClusterTile_VM ClusterT = null;
                            if (ds.Tables[21].Rows.Count > 0)
                            {
                                if (ds.Tables[22].Rows.Count > 0 && !IsClusterCharacterStatsFilled)
                                {
                                    foreach (DataRow CharStatIDs_Rows in ds.Tables[22].Rows)
                                    {
                                        int charcharstatId = CharStatIDs_Rows[0] == DBNull.Value ? 0 : Convert.ToInt32(CharStatIDs_Rows[0]);
                                        CharacterStat CharStatObj = null;
                                        CharStatObj = GetClusterCharStat(ds, charcharstatId, CharStatObj);
                                        if (CharStatObj != null)
                                        {
                                            ClusterSelectedCharStats.Add(CharStatObj);
                                        }
                                    }
                                    IsClusterCharacterStatsFilled = true;
                                }
                                foreach (DataRow ClusterT_Row in ds.Tables[21].Rows)
                                {
                                    int RulesetTileId = ClusterT_Row["RulesetTileId"] == DBNull.Value ? 0 : Convert.ToInt32(ClusterT_Row["RulesetTileId"]);
                                    if (RulesetTileId == tile.RulesetTileId)
                                    {
                                        ClusterT = new RulesetCharacterStatClusterTile_VM();
                                        ClusterT.BodyBgColor = ClusterT_Row["BodyBgColor"] == DBNull.Value ? null : ClusterT_Row["BodyBgColor"].ToString();
                                        ClusterT.BodyTextColor = ClusterT_Row["BodyTextColor"] == DBNull.Value ? null : ClusterT_Row["BodyTextColor"].ToString();
                                        ClusterT.IsDeleted = ClusterT_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(ClusterT_Row["IsDeleted"]);
                                        ClusterT.CharacterStatClusterTileId = ClusterT_Row["CharacterStatClusterTileId"] == DBNull.Value ? 0 : Convert.ToInt32(ClusterT_Row["CharacterStatClusterTileId"]);
                                        ClusterT.RulesetTileId = RulesetTileId;
                                        ClusterT.Shape = ClusterT_Row["Shape"] == DBNull.Value ? 0 : Convert.ToInt32(ClusterT_Row["Shape"]);
                                        ClusterT.SortOrder = ClusterT_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(ClusterT_Row["SortOrder"]);
                                        ClusterT.Title = ClusterT_Row["Title"] == DBNull.Value ? null : ClusterT_Row["Title"].ToString();
                                        ClusterT.TitleBgColor = ClusterT_Row["TitleBgColor"] == DBNull.Value ? null : ClusterT_Row["TitleBgColor"].ToString();
                                        ClusterT.TitleTextColor = ClusterT_Row["TitleTextColor"] == DBNull.Value ? null : ClusterT_Row["TitleTextColor"].ToString();
                                        ClusterT.DisplayCharactersCharacterStatID = ClusterT_Row["DisplayCharactersCharacterStatID"] == DBNull.Value ? 0 : Convert.ToInt32(ClusterT_Row["DisplayCharactersCharacterStatID"]);
                                        ClusterT.ClusterWithSortOrder = ClusterT_Row["ClusterWithSortOrder"] == DBNull.Value ? null : ClusterT_Row["ClusterWithSortOrder"].ToString();
                                        ClusterT.IsManual = ClusterT_Row["IsManual"] == DBNull.Value ? false : Convert.ToBoolean(ClusterT_Row["IsManual"]);
                                        ClusterT.FontSize = ClusterT_Row["FontSize"] == DBNull.Value ? 0 : Convert.ToInt32(ClusterT_Row["FontSize"]);
                                        //ClusterT.FontSizeTitle = ClusterT_Row["FontSizeTitle"] == DBNull.Value ? 0 : Convert.ToInt32(ClusterT_Row["FontSizeTitle"]);

                                        CharacterStat ClusterCharStat = null;
                                        ClusterCharStat = GetClusterCharStat(ds, ClusterT.DisplayCharactersCharacterStatID, ClusterCharStat);


                                        ClusterT.DisplayCharactersCharacterStat = ClusterCharStat;
                                        if (ClusterT.ClusterWithSortOrder != null)
                                        {
                                            List<int> charcharIds = StringToIntList(ClusterT.ClusterWithSortOrder).ToList();
                                            ClusterT.ClusterCharactersCharacterStats = ClusterSelectedCharStats.Where(x => charcharIds.Contains(x.CharacterStatId)).ToList();
                                        }

                                    }
                                }


                            }
                            tile.CharacterStatClusterTiles = ClusterT;
                            break;
                        default:
                            break;
                    }
                    RulesetTileConfig config = null;
                    if (ds.Tables[12].Rows.Count > 0)
                    {
                        foreach (DataRow config_Row in ds.Tables[12].Rows)
                        {
                            int RulesetTileId = config_Row["RulesetTileId"] == DBNull.Value ? 0 : Convert.ToInt32(config_Row["RulesetTileId"]);
                            if (RulesetTileId == tile.RulesetTileId)
                            {
                                config = new RulesetTileConfig();
                                config.Col = config_Row["Col"] == DBNull.Value ? 0 : Convert.ToInt32(config_Row["Col"]);
                                config.IsDeleted = config_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(config_Row["IsDeleted"]);
                                config.Payload = config_Row["Payload"] == DBNull.Value ? 0 : Convert.ToInt32(config_Row["Payload"]);
                                config.Row = config_Row["Row"] == DBNull.Value ? 0 : Convert.ToInt32(config_Row["Row"]);
                                config.RulesetTileId = RulesetTileId;
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
        public static IEnumerable<int> StringToIntList(string str)
        {
            if (String.IsNullOrEmpty(str))
                yield break;

            foreach (var s in str.Split(','))
            {
                int num;
                if (int.TryParse(s, out num))
                    yield return num;
            }
        }
        private CharacterStat GetClusterCharStat(DataSet ds, int? CharStatId, CharacterStat CharStat)
        {
            if (ds.Tables[23].Rows.Count > 0)
            {
                foreach (DataRow CharStat_Row in ds.Tables[23].Rows)
                {
                    short num = 0;
                    int characterstatID = CharStat_Row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CharStat_Row["CharacterStatId"]);
                    if (characterstatID == CharStatId)
                    {
                        CharStat = new CharacterStat();
                        CharStat.CharacterStatId = characterstatID;
                        CharStat.RuleSetId = CharStat_Row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(CharStat_Row["RuleSetId"]);
                        CharStat.StatName = CharStat_Row["StatName"] == DBNull.Value ? null : CharStat_Row["StatName"].ToString();
                        CharStat.StatDesc = CharStat_Row["StatDesc"] == DBNull.Value ? null : CharStat_Row["StatDesc"].ToString();
                        CharStat.isActive = CharStat_Row["isActive"] == DBNull.Value ? false : Convert.ToBoolean(CharStat_Row["isActive"]);
                        CharStat.CharacterStatTypeId = CharStat_Row["CharacterStatTypeId"] == DBNull.Value ? num : (short)(CharStat_Row["CharacterStatTypeId"]);
                        CharStat.isMultiSelect = CharStat_Row["isMultiSelect"] == DBNull.Value ? false : Convert.ToBoolean(CharStat_Row["isMultiSelect"]);
                        CharStat.ParentCharacterStatId = CharStat_Row["ParentCharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CharStat_Row["ParentCharacterStatId"]);
                        CharStat.SortOrder = CharStat_Row["SortOrder"] == DBNull.Value ? num : (short)(CharStat_Row["SortOrder"]);
                        CharStat.IsDeleted = CharStat_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CharStat_Row["IsDeleted"]);
                        CharStat.IsChoiceNumeric = CharStat_Row["IsChoiceNumeric"] == DBNull.Value ? false : Convert.ToBoolean(CharStat_Row["IsChoiceNumeric"]);
                        List<CharacterStatChoice> Choices = new List<CharacterStatChoice>();
                        if (ds.Tables[25].Rows.Count > 0)
                        {
                            foreach (DataRow r in ds.Tables[25].Rows)
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
                            }
                        }
                        CharStat.CharacterStatChoices = Choices;
                        List<CharacterStatCalc> calcs = new List<CharacterStatCalc>();
                        if (ds.Tables[24].Rows.Count > 0)
                        {
                            foreach (DataRow r in ds.Tables[24].Rows)
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

                        ////
                        List<CharacterStatDefaultValue> dfv = new List<CharacterStatDefaultValue>();
                        if (ds.Tables[27].Rows.Count > 0)
                        {
                            foreach (DataRow r in ds.Tables[27].Rows)
                            {
                                int dfvCharacterStat = r["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatId"]);
                                if (characterstatID == dfvCharacterStat)
                                {
                                    CharacterStatDefaultValue cal = new CharacterStatDefaultValue();
                                    cal.CharacterStatId = r["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatId"]);
                                    cal.CharacterStatDefaultValueId = r["CharacterStatDefaultValueId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatDefaultValueId"]);
                                    cal.DefaultValue = r["DefaultValue"] == DBNull.Value ? null : r["DefaultValue"].ToString();
                                    cal.Maximum = r["Maximum"] == DBNull.Value ? 0 : Convert.ToInt32(r["Maximum"]);
                                    cal.Minimum = r["Minimum"] == DBNull.Value ? 0 : Convert.ToInt32(r["Minimum"]);
                                    cal.Type = r["Type"] == DBNull.Value ? 0 : Convert.ToInt32(r["Type"]);
                                    dfv.Add(cal);
                                }
                            }
                        }
                        CharStat.CharacterStatDefaultValues = dfv.OrderBy(x => x.Type).ToList();

                        CharacterStatCombo combo = new CharacterStatCombo();
                        if (ds.Tables[28].Rows.Count > 0)
                        {
                            foreach (DataRow r in ds.Tables[28].Rows)
                            {
                                int comboCharacterStat = r["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatId"]);
                                if (characterstatID == comboCharacterStat)
                                {

                                    combo.CharacterStatComboId = r["CharacterStatComboId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatComboId"]);
                                    combo.CharacterStatId = r["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatId"]);
                                    combo.DefaultText = r["DefaultText"] == DBNull.Value ? null : r["DefaultText"].ToString();
                                    combo.DefaultValue = r["DefaultValue"] == DBNull.Value ? 0 : Convert.ToInt32(r["DefaultValue"]);

                                    break;
                                }

                            }
                        }
                        CharStat.CharacterStatCombos = combo;
                        //////

                        CharacterStatType statType = null;
                        if (ds.Tables[26].Rows.Count > 0)
                        {
                            foreach (DataRow r in ds.Tables[26].Rows)
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


                        CharacterStatToggle CharacterStatToggle= GetCharacterStatToggleList((int)CharStat.CharacterStatId);
                        //if (CharacterStatToggle != null)
                        //{
                        //    //CharacterStatToggle CharacterStatToggle = GetCharacterStatToggleList((int)CharCharStat.CharacterStatId);
                        //    if (CharacterStatToggle.IsCustom)
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
                        CharStat.CharacterStatToggles = CharacterStatToggle;
                    }

                }
            }

            return CharStat;
        }

        public async Task<RulesetTile> Update(RulesetTile item)
        {
            var RulesetTile = await _repo.Get(item.RulesetTileId);

            if (RulesetTile == null) return RulesetTile;

            //RulesetTile.Color = item.Color;
            //RulesetTile.BgColor = item.BgColor;
            RulesetTile.Shape = item.Shape;
            RulesetTile.Height = item.Height;
            RulesetTile.Width = item.Width;
            RulesetTile.LocationX = item.LocationX;
            RulesetTile.LocationY = item.LocationY;
            RulesetTile.SortOrder = item.SortOrder;
            try
            {
                await _repo.Update(RulesetTile);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return RulesetTile;
        }

        public async Task<RulesetTile> UpdateSortOrder(int id, int sortOrder)
        {
            var RulesetTile = await _repo.Get(id);
            if (RulesetTile == null) return RulesetTile;

            RulesetTile.SortOrder = sortOrder;
            try
            {
                await _repo.Update(RulesetTile);
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return RulesetTile;
        }

        public void BGProcess(int _rulesetId, string userId)
        {

            List<CharacterStat> characterStats = _context.CharacterStats
                .Include(q => q.CharacterStatCalcs)
                .Include(q => q.CharacterStatChoices)
                .Where(x => x.RuleSetId == _rulesetId && x.IsDeleted != true)
                .ToList();

            foreach (var characterStat in characterStats)
            {
                CharacterStat newCharacterStat = new CharacterStat()
                {
                    RuleSetId = _rulesetId,
                    StatName = characterStat.StatName,
                    StatDesc = characterStat.StatDesc,
                    CharacterStatTypeId = characterStat.CharacterStatTypeId,
                    isActive = characterStat.isActive,
                    OwnerId = userId,
                    CreatedBy = userId,
                    CreatedDate = DateTime.Now,
                    ModifiedBy = userId,
                    ModifiedDate = DateTime.Now,
                    isMultiSelect = characterStat.isActive,
                    SortOrder = characterStat.SortOrder
                };
                _context.CharacterStats.Add(newCharacterStat);
                _context.SaveChanges();

                if (characterStat.CharacterStatCalcs != null && characterStat.CharacterStatCalcs.Count > 0)
                {
                    foreach (var cscViewModels in characterStat.CharacterStatCalcs)
                    {
                        _context.CharacterStatCalcs.Add(new CharacterStatCalc()
                        {
                            StatCalculation = cscViewModels.StatCalculation,
                            CharacterStatId = newCharacterStat.CharacterStatId
                        });
                    }
                }
                if (characterStat.CharacterStatChoices != null && characterStat.CharacterStatChoices.Count > 0)
                {
                    foreach (var cscViewModels in characterStat.CharacterStatChoices)
                    {
                        _context.CharacterStatChoices.Add(new CharacterStatChoice()
                        {
                            StatChoiceValue = cscViewModels.StatChoiceValue,
                            CharacterStatId = newCharacterStat.CharacterStatId
                        });
                    }
                }
            }

            var itemMasters = _context.ItemMasters
                .Include(d => d.ItemMasterAbilities)
                .Include(d => d.ItemMasterSpell)
                .Include(d => d.ItemMasterCommand)
                .Where(p => p.RuleSetId == _rulesetId && p.IsDeleted != true)
                .Include(d => d.ItemMasterCommand).OrderBy(o => o.ItemName).ToList();

            foreach (var item in itemMasters)
            {
                var ItemMaster = new ItemMaster()
                {
                    ItemName = item.ItemName,
                    ItemImage = item.ItemImage,
                    ItemStats = item.ItemStats,
                    ItemVisibleDesc = item.ItemVisibleDesc,
                    Command = item.Command,
                    ItemCalculation = item.ItemCalculation,
                    Value = item.Value,
                    Volume = item.Volume,
                    Weight = item.Weight,
                    IsContainer = item.IsContainer,
                    IsMagical = item.IsMagical,
                    IsConsumable = item.IsConsumable,
                    ContainerWeightMax = item.ContainerWeightMax,
                    ContainerWeightModifier = item.ContainerWeightModifier,
                    ContainerVolumeMax = item.ContainerVolumeMax,
                    PercentReduced = item.PercentReduced,
                    TotalWeightWithContents = item.TotalWeightWithContents,
                    Metatags = item.Metatags,
                    Rarity = item.Rarity,
                    RuleSetId = _rulesetId
                    //ParentItemMasterId=model.ParentRuleSetId
                };

                List<ItemMasterAbility> ItemMasterAbilities = item.ItemMasterAbilities.ToList();
                List<ItemMasterSpell> ItemMasterSpell = item.ItemMasterSpell.ToList();

                _context.ItemMasters.Add(item);
                _context.SaveChanges();
                if (item.ItemMasterId > 0)
                {
                    if (ItemMasterAbilities != null)
                    {
                        ItemMasterAbilities.ForEach(a => a.ItemMasterId = item.ItemMasterId);
                        _context.AddRange(ItemMasterAbilities);
                        _context.SaveChanges();
                    }
                    if (ItemMasterSpell != null)
                    {
                        ItemMasterSpell.ForEach(a => a.ItemMasterId = item.ItemMasterId);
                        _context.AddRange(ItemMasterSpell);
                        _context.SaveChanges();
                    }
                }

                if (item.ItemMasterCommand != null)
                {
                    foreach (var cmd in item.ItemMasterCommand)
                    {
                        ItemMasterCommand _ItemMasterCommand = new ItemMasterCommand()
                        {
                            Command = cmd.Command,
                            Name = cmd.Name,
                            ItemMasterId = item.ItemMasterId
                        };
                        _context.ItemMasterCommands.Add(_ItemMasterCommand);
                        _context.SaveChanges();
                    }
                }
            }
            //-----spell

            List<Spell> spells = _context.Spells
                   .Include(d => d.SpellCommand)
                   .Where(x => x.RuleSetId == _rulesetId && x.IsDeleted != true).OrderBy(o => o.Name).ToList();

            // _spellService.GetSpellsByRuleSetId(model.RuleSetId);
            foreach (var spell in spells)
            {
                var _spell = new Spell()
                {
                    Name = spell.Name,
                    School = spell.School,
                    Class = spell.Class,
                    Levels = spell.Levels,
                    Command = spell.Command,
                    MaterialComponent = spell.MaterialComponent,
                    IsMaterialComponent = spell.IsMaterialComponent,
                    IsSomaticComponent = spell.IsSomaticComponent,
                    IsVerbalComponent = spell.IsVerbalComponent,
                    CastingTime = spell.CastingTime,
                    Description = spell.Description,
                    Stats = spell.Stats,
                    HitEffect = spell.HitEffect,
                    MissEffect = spell.MissEffect,
                    EffectDescription = spell.EffectDescription,
                    ShouldCast = spell.ShouldCast,
                    ImageUrl = spell.ImageUrl,
                    Memorized = spell.Memorized,
                    Metatags = spell.Metatags,
                    RuleSetId = _rulesetId
                };
                _context.Spells.Add(_spell);
                if (spell.SpellCommand != null)
                {
                    foreach (var cmd in spell.SpellCommand)
                    {
                        SpellCommand _SpellCommand = new SpellCommand()
                        {
                            Command = cmd.Command,
                            Name = cmd.Name,
                            SpellId = _spell.SpellId
                        };
                        _context.SpellCommands.Add(_SpellCommand);
                    }
                }
            }
            //---Ability

            List<Ability> abilitiesList = _context.Abilities
            .Include(d => d.AbilityCommand)
            .Where(x => x.RuleSetId == _rulesetId && x.IsDeleted != true)
            .OrderBy(o => o.Name).ToList();

            foreach (var ability in abilitiesList)
            {
                var _ability = new Ability()
                {
                    Name = ability.Name,
                    Level = ability.Level,
                    Command = ability.Command,
                    Description = ability.Description,
                    Stats = ability.Stats,
                    ImageUrl = ability.ImageUrl,
                    IsEnabled = ability.IsEnabled,
                    Metatags = ability.Metatags,
                    CurrentNumberOfUses = ability.CurrentNumberOfUses,
                    MaxNumberOfUses = ability.MaxNumberOfUses,
                    RuleSetId = _rulesetId
                };

                _context.Abilities.Add(_ability);
                if (ability.AbilityCommand != null)
                {
                    foreach (var cmd in ability.AbilityCommand)
                    {
                        AbilityCommand _AbilityCommand = new AbilityCommand()
                        {
                            Command = cmd.Command,
                            Name = cmd.Name,
                            AbilityId = _ability.AbilityId
                        };
                        _context.AbilityCommands.Add(_AbilityCommand);
                    }
                }
            }

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
