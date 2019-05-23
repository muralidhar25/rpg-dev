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
    public class RulesetDashboardLayoutService : IRulesetDashboardLayoutService
    {
        private readonly IRepository<RulesetDashboardLayout> _repo;
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        public RulesetDashboardLayoutService(ApplicationDbContext context, IRepository<RulesetDashboardLayout> repo, IConfiguration configuration)
        {
            _repo = repo;
            _context = context;
            _configuration = configuration;
        }
        
        public async  Task<bool> CheckDuplicate(string value, int? RulesetId, bool IsCampaignDashboard, int? Id = 0)
        {
            var items = _repo.GetAll();
            if (items.Result == null || items.Result.Count == 0) return false;
          
                return items.Result
                .Where(x => x.Name.ToLower() == value.ToLower() && x.RulesetId == RulesetId && x.RulesetDashboardLayoutId != Id && x.IsDeleted != true && x.IsSharedLayout== IsCampaignDashboard)
                .FirstOrDefault() == null ? false : true;
        
        }

        public async Task<RulesetDashboardLayout> Create(RulesetDashboardLayout item)
        {
            //item.IsDefaultComputer = false;
            //item.IsDefaultTablet = false;
            //item.IsDefaultMobile = false;
            return await _repo.Add(item);
        }

        public async Task<bool> Delete(int id)
        {
            string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            using (SqlConnection con = new SqlConnection(consString))
            {
                using (SqlCommand cmd = new SqlCommand("RulesetDashBoardLayout_Delete"))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Connection = con;
                    cmd.Parameters.AddWithValue("@DashboardLayoutId", id);
                    con.Open();
                    try
                    {
                        var a = cmd.ExecuteNonQuery();
                    }
                    catch (Exception ex)
                    {
                        con.Close();
                        return false;
                    }
                    con.Close();
                    return true;
                }
            }

            //// Remove associated Pages
            //var pages = _context.RulesetDashboardPages.Where(x => x.RulesetDashboardLayoutId == id && x.IsDeleted != true).ToList();

            //foreach (RulesetDashboardPage item in pages)
            //{

            //// Remove associated Tiles
            //var tiles = _context.RulesetTiles.Where(x => x.RulesetDashboardPageId == item.RulesetDashboardPageId && x.IsDeleted != true).ToList();

            //foreach(RulesetTile tile in tiles)
            //{
            //    int? TileType = tile.TileTypeId;

            //    switch (TileType)
            //    {
            //        case 1:
            //            //Remove Note Tile 
            //            var nt = _context.RulesetNoteTiles.Where(p => p.RulesetTileId == tile.RulesetTileId && p.IsDeleted != true).SingleOrDefault();
            //            if (nt != null)
            //                nt.IsDeleted = true;
            //            break;
            //        case 2:
            //            //Remove Image Tile 
            //            var it = _context.RulesetImageTiles.Where(p => p.RulesetTileId == tile.RulesetTileId && p.IsDeleted != true).SingleOrDefault();
            //            if (it != null)
            //                it.IsDeleted = true;
            //            break;
            //        case 3:
            //            //Remove Counter Tile 
            //            var ct = _context.RulesetCounterTiles.Where(p => p.RulesetTileId == tile.RulesetTileId && p.IsDeleted != true).SingleOrDefault();
            //            if (ct != null)
            //                ct.IsDeleted = true;
            //            break;
            //        case 4:
            //            //Remove Ruleset Stat Tiles 
            //            var cst = _context.RulesetCharacterStatTiles.Where(p => p.RulesetTileId == tile.RulesetTileId && p.IsDeleted != true).SingleOrDefault();
            //            if (cst != null)
            //                cst.IsDeleted = true;
            //            break;
            //        case 5:
            //            //Remove Link Tiles 
            //           break;
            //        case 6:
            //            //Remove Execute iles
            //            break;
            //        case 7:
            //            //Remove Command Tile 
            //            var cot = _context.RulesetCommandTiles.Where(p => p.RulesetTileId == tile.RulesetTileId && p.IsDeleted != true).SingleOrDefault();
            //            if (cot != null)
            //                cot.IsDeleted = true;
            //            break;
            //        default:

            //            break;
            //    }

            //    tile.IsDeleted = true;
            //}

            //item.IsDeleted = true;
            //}

            //// Remove Ruleset Dashboard Layout
            //var CharDashboardLayout = await _repo.Get(id);

            //if (CharDashboardLayout == null)
            //    return false;

            //CharDashboardLayout.IsDeleted = true;

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

        public async Task<List<RulesetDashboardLayout>> GetByRulesetId(int RulesetId, int page = -1, int pageSize = -1)
        {
            List<RulesetDashboardLayout> RulesetDashboardLayouts = null;

            if (page > 0 && pageSize > 0)
                RulesetDashboardLayouts = _context.RulesetDashboardLayouts
                .Include(d => d.RulesetDashboardPages)
               .Where(x => x.RulesetId == RulesetId && !x.IsSharedLayout && x.IsDeleted != true).OrderBy(x => x.SortOrder).Skip(pageSize * (page - 1)).Take(pageSize).ToList();
            else
                RulesetDashboardLayouts = _context.RulesetDashboardLayouts
                    .Include(d => d.RulesetDashboardPages)
                   .Where(x => x.RulesetId == RulesetId && !x.IsSharedLayout && x.IsDeleted != true).OrderBy(x => x.SortOrder).ToList();

            if (RulesetDashboardLayouts == null) return RulesetDashboardLayouts;

            foreach (RulesetDashboardLayout cdl in RulesetDashboardLayouts)
            {
                cdl.RulesetDashboardPages = cdl.RulesetDashboardPages.Where(p => p.IsDeleted != true).OrderBy(x => x.SortOrder).ToList();
            }

            return RulesetDashboardLayouts;
        }

        public RulesetDashboardLayout GetById(int? id)
        {
            RulesetDashboardLayout RulesetDashboardLayout = _context.RulesetDashboardLayouts
                .Include(d => d.RulesetDashboardPages)
               .Where(x => x.RulesetDashboardLayoutId == id && x.IsDeleted != true).SingleOrDefault();

            if (RulesetDashboardLayout == null) return RulesetDashboardLayout;            
                RulesetDashboardLayout.RulesetDashboardPages = RulesetDashboardLayout.RulesetDashboardPages.Where(p => p.IsDeleted != true).OrderBy(x => x.SortOrder).ToList();

            return RulesetDashboardLayout;
        }

        public int GetCountByRulesetId(int RulesetId)
        {
           return _context.RulesetDashboardLayouts
               .Where(x => x.RulesetId == RulesetId && x.IsDeleted != true).Count();
        }

        public void SetDefaultPage(int Id, int PageId)
        {
            throw new NotImplementedException();
        }

        public  async Task<RulesetDashboardLayout> Update(RulesetDashboardLayout item)
        {
            var RulesetDashboardLayout = await _repo.Get(item.RulesetDashboardLayoutId);

            if (RulesetDashboardLayout == null)
                return RulesetDashboardLayout;

            RulesetDashboardLayout.Name = item.Name;
            RulesetDashboardLayout.DefaultPageId = item.DefaultPageId;
            RulesetDashboardLayout.LayoutHeight = item.LayoutHeight;
            RulesetDashboardLayout.LayoutWidth = item.LayoutWidth;

            RulesetDashboardLayout.IsDefaultComputer = item.IsDefaultComputer;
            RulesetDashboardLayout.IsDefaultTablet = item.IsDefaultTablet;
            RulesetDashboardLayout.IsDefaultMobile = item.IsDefaultMobile;

            try
            {
                await _repo.Update(RulesetDashboardLayout);

                if (RulesetDashboardLayout.IsDefaultComputer)
                {
                    RemoveDefaultComputerDeviceFromOtherLayouts(RulesetDashboardLayout);
                }
                if (RulesetDashboardLayout.IsDefaultTablet)
                {
                    RemoveDefaultTabletDeviceFromOtherLayouts(RulesetDashboardLayout);
                }
                if (RulesetDashboardLayout.IsDefaultMobile)
                {
                    RemoveDefaultMobileDeviceFromOtherLayouts(RulesetDashboardLayout);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return RulesetDashboardLayout;
        }
        private void RemoveDefaultMobileDeviceFromOtherLayouts(RulesetDashboardLayout RDL)
        {
            var layouts = _context.RulesetDashboardLayouts.Where(x => x.RulesetDashboardLayoutId != RDL.RulesetDashboardLayoutId && x.RulesetId == RDL.RulesetId && x.IsDeleted != true).ToList();
            foreach (var item in layouts)
            {
                item.IsDefaultMobile = false;
            }
            _context.SaveChanges();
        }

        private void RemoveDefaultTabletDeviceFromOtherLayouts(RulesetDashboardLayout RDL)
        {
            var layouts = _context.RulesetDashboardLayouts.Where(x => x.RulesetDashboardLayoutId != RDL.RulesetDashboardLayoutId && x.RulesetId == RDL.RulesetId && x.IsDeleted != true).ToList();
            foreach (var item in layouts)
            {
                item.IsDefaultTablet = false;
            }
            _context.SaveChanges();
        }

        private void RemoveDefaultComputerDeviceFromOtherLayouts(RulesetDashboardLayout RDL)
        {
            var layouts = _context.RulesetDashboardLayouts.Where(x => x.RulesetDashboardLayoutId != RDL.RulesetDashboardLayoutId && x.RulesetId == RDL.RulesetId && x.IsDeleted != true).ToList();
            foreach (var item in layouts)
            {
                item.IsDefaultComputer = false;
            }
            _context.SaveChanges();
        }

        public int GetMaximumSortOrdertByRulesetId(int? RulesetId)
        {
            var result = _context.RulesetDashboardLayouts.Where(x => x.IsDeleted != true && x.RulesetId == RulesetId).OrderByDescending(x => x.SortOrder).FirstOrDefault();

            if (result == null)
                return 0;

            return result.SortOrder;
        }

        public void UpdateSortOrder(List<SortOrderEditModel> sortOrderList)
        {

            foreach (var item in sortOrderList)
            {
                var RulesetDashboardLayout = _context.RulesetDashboardLayouts.Where(p => p.RulesetDashboardLayoutId == item.Id).SingleOrDefault();


                if (RulesetDashboardLayout != null)
                    RulesetDashboardLayout.SortOrder = item.SortOrder;

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

        public void UpdateDefaultLayout(int layoutId)
        {
            try
            {
                var layout = _context.RulesetDashboardLayouts.Where(x => x.RulesetDashboardLayoutId == layoutId).FirstOrDefault();
                if (layout != null)
                {
                    var allLayouts = _context.RulesetDashboardLayouts
                   .Where(x => x.RulesetId == layout.RulesetId && x.IsDeleted != true).OrderBy(x => x.SortOrder).ToList();//GetByRulesetId(layout.RulesetId ?? 0);

                    foreach (var _layout in allLayouts)
                    {
                        _layout.IsDefaultLayout = false;
                    }
                    layout.IsDefaultLayout = true;
                    _context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public void UpdateDefaultLayoutPage(int layoutId, int pageId)
        {
            try
            {
                var layout = _context.RulesetDashboardLayouts.Where(x => x.RulesetDashboardLayoutId == layoutId).FirstOrDefault();
                if (layout != null)
                {
                    layout.DefaultPageId = pageId;
                    _context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int GetCountByRuleSetId(int ruleSetId)
        {
            return _context.RulesetDashboardLayouts.Where(x => x.RulesetId == ruleSetId && x.IsDeleted != true).Count();
        }

        #region Shared layout
        public async Task<List<RulesetDashboardLayout>> GetSharedLayoutByRulesetId(int RulesetId, int page = -1, int pageSize = -1)
        {
            List<RulesetDashboardLayout> RulesetDashboardLayouts = null;

            if (page > 0 && pageSize > 0)
                RulesetDashboardLayouts = _context.RulesetDashboardLayouts
                .Include(d => d.RulesetDashboardPages)
               .Where(x => x.RulesetId == RulesetId && x.IsSharedLayout && x.IsDeleted != true).OrderBy(x => x.SortOrder).Skip(pageSize * (page - 1)).Take(pageSize).ToList();
            else
                RulesetDashboardLayouts = _context.RulesetDashboardLayouts
                    .Include(d => d.RulesetDashboardPages)
                   .Where(x => x.RulesetId == RulesetId && x.IsSharedLayout && x.IsDeleted != true).OrderBy(x => x.SortOrder).ToList();

            if (RulesetDashboardLayouts == null) return RulesetDashboardLayouts;

            foreach (RulesetDashboardLayout cdl in RulesetDashboardLayouts)
            {
                cdl.RulesetDashboardPages = cdl.RulesetDashboardPages.Where(p => p.IsDeleted != true).OrderBy(x => x.SortOrder).ToList();
            }

            return RulesetDashboardLayouts;
        }
        #endregion
    }
}
