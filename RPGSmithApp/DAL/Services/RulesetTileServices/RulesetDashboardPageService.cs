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
using RPGSmithApp.ViewModels.EditModels;

namespace DAL.Services.RulesetTileServices
{
    public class RulesetDashboardPageService : IRulesetDashboardPageService
    {

        private readonly IRepository<RulesetDashboardPage> _repo;
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public RulesetDashboardPageService(ApplicationDbContext context, IRepository<RulesetDashboardPage> repo, IConfiguration configuration)
        {
            _repo = repo;
            _context = context;
            _configuration = configuration;
        }

        public async Task<RulesetDashboardPage> Create(RulesetDashboardPage item)
        {
            return await _repo.Add(item);
        }

        public async Task<bool> Delete(int id)
        {
            //SP RulesetDashBoardPage_Delete
            string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            using (SqlConnection con = new SqlConnection(consString))
            {
                using (SqlCommand cmd = new SqlCommand("RulesetDashBoardPage_Delete"))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Connection = con;
                    cmd.Parameters.AddWithValue("@DashboardPageId", id);
                    con.Open();
                    try
                    {
                        var a = cmd.ExecuteNonQuery();
                    }
                    catch (Exception ex) {
                        con.Close();
                        return false;
                    }
                    con.Close();
                    return true;
                }
            }            
            // Remove associated Tiles
            //var tiles = _context.RulesetTiles.Where(x => x.RulesetDashboardPageId == id && x.IsDeleted != true).ToList();

            //    foreach (RulesetTile tile in tiles)
            //    {
            //        int? TileType = tile.TileTypeId;

            //        switch (TileType)
            //        {
            //            case 1:
            //                //Remove Note Tile 
            //                var nt = _context.RulesetNoteTiles.Where(p => p.RulesetTileId == tile.RulesetTileId && p.IsDeleted != true).SingleOrDefault();
            //                if (nt != null)
            //                    nt.IsDeleted = true;
            //                break;
            //            case 2:
            //                //Remove Image Tile 
            //                var it = _context.RulesetImageTiles.Where(p => p.RulesetTileId == tile.RulesetTileId && p.IsDeleted != true).SingleOrDefault();
            //                if (it != null)
            //                    it.IsDeleted = true;
            //                break;
            //            case 3:
            //                //Remove Counter Tile 
            //                var ct = _context.RulesetCounterTiles.Where(p => p.RulesetTileId == tile.RulesetTileId && p.IsDeleted != true).SingleOrDefault();
            //                if (ct != null)
            //                    ct.IsDeleted = true;
            //                break;
            //            case 4:
            //                //Remove Ruleset Stat Tiles 
            //                var cst = _context.RulesetCharacterStatTiles.Where(p => p.RulesetTileId == tile.RulesetTileId && p.IsDeleted != true).SingleOrDefault();
            //                if (cst != null)
            //                    cst.IsDeleted = true;
            //                break;
            //            case 5:
            //                //Remove Link Tiles 
            //                break;
            //            case 6:
            //                //Remove Execute iles
            //                break;
            //            case 7:
            //                //Remove Command Tile 
            //                var cot = _context.RulesetCommandTiles.Where(p => p.RulesetTileId == tile.RulesetTileId && p.IsDeleted != true).SingleOrDefault();
            //                if (cot != null)
            //                    cot.IsDeleted = true;
            //                break;
            //            default:

            //                break;
            //        }

            //        tile.IsDeleted = true;
            //    }

               

            //// Remove Ruleset Dashboard Page
            //var CharDashboardPage = await _repo.Get(id);

            //if (CharDashboardPage == null)
            //    return false;

            //CharDashboardPage.IsDeleted = true;

            //try
            //{
            //    _context.SaveChanges();
            //    return true;
            //}
            //catch (Exception ex)
            //{
            //    throw ex;
            //}
        }

        public List<RulesetDashboardPage> GetByRulesetId(int RulesetId)
        {
            List<RulesetDashboardPage> RulesetDashboardPages = _context.RulesetDashboardPages
                .Include(d => d.Tiles)
               .Where(x => x.RulesetId == RulesetId && x.IsDeleted != true).OrderBy(x => x.SortOrder).ToList();


            if (RulesetDashboardPages == null) return RulesetDashboardPages;

            foreach (RulesetDashboardPage cdp in RulesetDashboardPages)
            {
                cdp.Tiles = cdp.Tiles.Where(p => p.IsDeleted != true).ToList();

            }

            return RulesetDashboardPages;
        }

        public RulesetDashboardPage GetById(int? id)
        {
            RulesetDashboardPage RulesetDashboardPage = _context.RulesetDashboardPages
                 .Include(d => d.Tiles)
                .Where(x => x.RulesetDashboardPageId == id && x.IsDeleted != true).SingleOrDefault();


            if (RulesetDashboardPage == null) return RulesetDashboardPage;

            RulesetDashboardPage.Tiles = RulesetDashboardPage.Tiles.Where(p => p.IsDeleted != true).ToList();
           
            return RulesetDashboardPage;
        }

        public List<RulesetDashboardPage> GetByLayoutId(int layoutId, int page = 1, int pageSize = 10)
        {
            List<RulesetDashboardPage> RulesetDashboardPages = _context.RulesetDashboardPages
                .Include(d => d.Tiles)
               .Where(x => x.RulesetDashboardLayoutId == layoutId && x.IsDeleted != true).OrderBy(x => x.SortOrder).ToList();

            try
            {
                if (page > 0 && pageSize > 0)
                    RulesetDashboardPages = RulesetDashboardPages.Skip(pageSize * (page - 1)).Take(pageSize).ToList();
            }
            catch { }

            if (RulesetDashboardPages == null) return RulesetDashboardPages;

            foreach (RulesetDashboardPage cdp in RulesetDashboardPages)
            {
                cdp.Tiles = cdp.Tiles.Where(p => p.IsDeleted != true).ToList();
            }

            return RulesetDashboardPages;
        }

        public List<RulesetDashboardPage> GetPagesByLayoutId(int layoutId)
        {
            return _context.RulesetDashboardPages.Where(x => x.RulesetDashboardLayoutId == layoutId && x.IsDeleted != true).OrderBy(x => x.SortOrder).ToList();
        }

        public int GetCountByRulesetId(int RulesetId)
        {
         return _context.RulesetDashboardPages
               .Where(x => x.RulesetId == RulesetId && x.IsDeleted != true).Count();
        }

        public int GetCountByLayoutId(int layoutId)
        {
           return   _context.RulesetDashboardPages               
                .Where(x => x.RulesetDashboardLayoutId == layoutId && x.IsDeleted != true).Count();
        }

        public async Task<RulesetDashboardPage> Update(RulesetDashboardPage item)
        {
            var RulesetDashboardPage = await _repo.Get(item.RulesetDashboardPageId);

            if (RulesetDashboardPage == null)
                return RulesetDashboardPage;

            RulesetDashboardPage.Name = item.Name;
            RulesetDashboardPage.ContainerHeight = item.ContainerHeight;
            RulesetDashboardPage.ContainerWidth = item.ContainerWidth;
            RulesetDashboardPage.BodyBgColor = item.BodyBgColor;
            RulesetDashboardPage.BodyTextColor = item.BodyTextColor;
            RulesetDashboardPage.TitleBgColor = item.TitleBgColor;
            RulesetDashboardPage.TitleTextColor = item.TitleTextColor;

            try
            {
                await _repo.Update(RulesetDashboardPage);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return RulesetDashboardPage;
        }

        public void UpdateSortOrder(List<SortOrderEditModel> sortOrderList)
        {
            foreach (var item in sortOrderList)
            {
                var RulesetDashboardPage = _context.RulesetDashboardPages.Where(p => p.RulesetDashboardPageId == item.Id).SingleOrDefault();


                if (RulesetDashboardPage != null)
                    RulesetDashboardPage.SortOrder = item.SortOrder;

            }

            try
            {
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int GetMaximumSortOrdertByLayoutId(int? layoutId)
        {
            var result = _context.RulesetDashboardPages.Where(x => x.IsDeleted != true && x.RulesetDashboardLayoutId == layoutId).OrderByDescending(x => x.SortOrder).FirstOrDefault();

            if (result == null)
                return 0;

            return result.SortOrder;
        }

        public async  Task<bool> CheckDuplicate(string value, int? RulesetId, int? layoutId, int? Id = 0)
        {
            var items = _repo.GetAll();
            if (items.Result == null || items.Result.Count == 0) return false;

            return items.Result.Where(x => x.Name.ToLower() == value.ToLower() && x.RulesetId == RulesetId && x.RulesetDashboardLayoutId==layoutId && x.RulesetDashboardPageId != Id && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
        }
        public void Create_sp(RulesetDashboardPage model, string UserID)
        {
            string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            using (SqlConnection con = new SqlConnection(consString))
            {
                using (SqlCommand cmd = new SqlCommand("Ruleset_DuplicateLayout_And_Page"))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Connection = con;
                    cmd.Parameters.AddWithValue("@RulesetLayoutID", model.RulesetDashboardLayoutId);
                    cmd.Parameters.AddWithValue("@OldRulesetDashboardPageId", model.RulesetDashboardPageId);
                    cmd.Parameters.AddWithValue("@RulesetId", model.RulesetId);
                    cmd.Parameters.AddWithValue("@PageName", model.Name);
                    cmd.Parameters.AddWithValue("@UserId", UserID);
                    cmd.Parameters.AddWithValue("@IsDuplicatingLayout", false);
                    cmd.Parameters.AddWithValue("@PageSortOrder", model.SortOrder);
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
                    //return true;
                }
            }
        }
    }
}
