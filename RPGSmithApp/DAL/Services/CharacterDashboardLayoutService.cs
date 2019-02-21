using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.CharacterTileModels;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using RPGSmithApp.ViewModels.EditModels;

namespace DAL.Services
{
    public class CharacterDashboardLayoutService : ICharacterDashboardLayoutService
    {
        private readonly IRepository<CharacterDashboardLayout> _repo;
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        public CharacterDashboardLayoutService(ApplicationDbContext context, IRepository<CharacterDashboardLayout> repo, IConfiguration configuration)
        {
            _repo = repo;
            _context = context;
            _configuration = configuration;
        }
        
        public async  Task<bool> CheckDuplicate(string value, int? characterId, int? Id = 0)
        {
            var items = _repo.GetAll();
            if (items.Result == null || items.Result.Count == 0) return false;
          
                return items.Result.Where(x => x.Name.ToLower() == value.ToLower() && x.CharacterId == characterId && x.CharacterDashboardLayoutId != Id && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
        
        }

        public async Task<CharacterDashboardLayout> Create(CharacterDashboardLayout item)
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
                using (SqlCommand cmd = new SqlCommand("CharacterDashBoardLayout_Delete"))
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

            // Remove associated Pages
            //var pages = _context.CharacterDashboardPages.Where(x => x.CharacterDashboardLayoutId == id && x.IsDeleted != true).ToList();

            //foreach (CharacterDashboardPage item in pages)
            //{

            //// Remove associated Tiles
            //var tiles = _context.CharacterTiles.Where(x => x.CharacterDashboardPageId == item.CharacterDashboardPageId && x.IsDeleted != true).ToList();

            //foreach(CharacterTile tile in tiles)
            //{
            //    int? TileType = tile.TileTypeId;

            //    switch (TileType)
            //    {
            //        case 1:
            //            //Remove Note Tile 
            //            var nt = _context.CharacterNoteTiles.Where(p => p.CharacterTileId == tile.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
            //            if (nt != null)
            //                nt.IsDeleted = true;
            //            break;
            //        case 2:
            //            //Remove Image Tile 
            //            var it = _context.CharacterImageTiles.Where(p => p.CharacterTileId == tile.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
            //            if (it != null)
            //                it.IsDeleted = true;
            //            break;
            //        case 3:
            //            //Remove Counter Tile 
            //            var ct = _context.CharacterCounterTiles.Where(p => p.CharacterTileId == tile.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
            //            if (ct != null)
            //                ct.IsDeleted = true;
            //            break;
            //        case 4:
            //            //Remove Character Stat Tiles 
            //            var cst = _context.CharacterCharacterStatTiles.Where(p => p.CharacterTileId == tile.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
            //            if (cst != null)
            //                cst.IsDeleted = true;
            //            break;
            //        case 5:
            //            //Remove Link Tiles 
            //            var lt = _context.CharacterLinkTiles.Where(p => p.CharacterTileId == tile.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
            //            if (lt != null)
            //                lt.IsDeleted = true;
            //            break;
            //        case 6:
            //            //Remove Execute iles
            //            var et = _context.CharacterExecuteTiles.Where(p => p.CharacterTileId == tile.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
            //            if (et != null)
            //                et.IsDeleted = true;
            //            break;
            //        case 7:
            //            //Remove Command Tile 
            //            var cot = _context.CharacterCommandTiles.Where(p => p.CharacterTileId == tile.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
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

            //// Remove Character Dashboard Layout
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

        public async Task<List<CharacterDashboardLayout>> GetByCharacterId(int characterId, int page = -1, int pageSize = -1)
        {
            List<CharacterDashboardLayout> CharacterDashboardLayouts = null;

            if (page > 0 && pageSize > 0)
                CharacterDashboardLayouts = _context.CharacterDashboardLayouts
                .Include(d => d.CharacterDashboardPages)
               .Where(x => x.CharacterId == characterId && x.IsDeleted != true).OrderBy(x => x.SortOrder).Skip(pageSize * (page - 1)).Take(pageSize).ToList();
            else
                CharacterDashboardLayouts = _context.CharacterDashboardLayouts
                    .Include(d => d.CharacterDashboardPages)
                   .Where(x => x.CharacterId == characterId && x.IsDeleted != true).OrderBy(x => x.SortOrder).ToList();

            if (CharacterDashboardLayouts == null) return CharacterDashboardLayouts;

            foreach (CharacterDashboardLayout cdl in CharacterDashboardLayouts)
            {
                cdl.CharacterDashboardPages = cdl.CharacterDashboardPages.Where(p => p.IsDeleted != true).OrderBy(x => x.SortOrder).ToList();
            }

            return CharacterDashboardLayouts;
        }

        public CharacterDashboardLayout GetById(int? id)
        {
            CharacterDashboardLayout CharacterDashboardLayout = _context.CharacterDashboardLayouts
                .Include(d => d.CharacterDashboardPages)
               .Where(x => x.CharacterDashboardLayoutId == id && x.IsDeleted != true).SingleOrDefault();

            if (CharacterDashboardLayout == null) return CharacterDashboardLayout;            
                CharacterDashboardLayout.CharacterDashboardPages = CharacterDashboardLayout.CharacterDashboardPages.Where(p => p.IsDeleted != true).OrderBy(x => x.SortOrder).ToList();

            return CharacterDashboardLayout;
        }

        public int GetCountByCharacterId(int characterId)
        {
           return _context.CharacterDashboardLayouts
               .Where(x => x.CharacterId == characterId && x.IsDeleted != true).Count();
        }

        public void SetDefaultPage(int Id, int PageId)
        {
            throw new NotImplementedException();
        }

        public  async Task<CharacterDashboardLayout> Update(CharacterDashboardLayout item)
        {
            var CharacterDashboardLayout = await _repo.Get(item.CharacterDashboardLayoutId);

            if (CharacterDashboardLayout == null)
                return CharacterDashboardLayout;

            CharacterDashboardLayout.Name = item.Name;
            CharacterDashboardLayout.DefaultPageId = item.DefaultPageId;
            CharacterDashboardLayout.LayoutHeight = item.LayoutHeight;
            CharacterDashboardLayout.LayoutWidth = item.LayoutWidth;
            CharacterDashboardLayout.IsDefaultComputer = item.IsDefaultComputer;
            CharacterDashboardLayout.IsDefaultTablet = item.IsDefaultTablet;
            CharacterDashboardLayout.IsDefaultMobile = item.IsDefaultMobile;

            try
            {
                await _repo.Update(CharacterDashboardLayout);

                ///////////////////////////////////////////////
                if (CharacterDashboardLayout.IsDefaultComputer)
                {
                    RemoveDefaultComputerDeviceFromOtherLayouts(CharacterDashboardLayout);
                }
                if (CharacterDashboardLayout.IsDefaultTablet)
                {
                    RemoveDefaultTabletDeviceFromOtherLayouts(CharacterDashboardLayout);
                }
                if (CharacterDashboardLayout.IsDefaultMobile)
                {
                    RemoveDefaultMobileDeviceFromOtherLayouts(CharacterDashboardLayout);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return CharacterDashboardLayout;
        }

        private void RemoveDefaultMobileDeviceFromOtherLayouts(CharacterDashboardLayout CDL)
        {
            var layouts = _context.CharacterDashboardLayouts.Where(x => x.CharacterDashboardLayoutId != CDL.CharacterDashboardLayoutId && x.CharacterId==CDL.CharacterId && x.IsDeleted!=true).ToList();
            foreach (var item in layouts)
            {
                item.IsDefaultMobile = false;
            }
            _context.SaveChanges();
        }

        private void RemoveDefaultTabletDeviceFromOtherLayouts(CharacterDashboardLayout CDL)
        {
            var layouts = _context.CharacterDashboardLayouts.Where(x => x.CharacterDashboardLayoutId != CDL.CharacterDashboardLayoutId && x.CharacterId == CDL.CharacterId && x.IsDeleted != true).ToList();
            foreach (var item in layouts)
            {
                item.IsDefaultTablet = false;
            }
            _context.SaveChanges();
        }

        private void RemoveDefaultComputerDeviceFromOtherLayouts(CharacterDashboardLayout CDL)
        {
            var layouts = _context.CharacterDashboardLayouts.Where(x => x.CharacterDashboardLayoutId != CDL.CharacterDashboardLayoutId && x.CharacterId == CDL.CharacterId && x.IsDeleted != true).ToList();
            foreach (var item in layouts)
            {
                item.IsDefaultComputer = false;
            }
            _context.SaveChanges();
        }

        public int GetMaximumSortOrdertByCharacterId(int? characterId)
        {
            var result = _context.CharacterDashboardLayouts.Where(x => x.IsDeleted != true && x.CharacterId == characterId).OrderByDescending(x => x.SortOrder).FirstOrDefault();

            if (result == null)
                return 0;

            return result.SortOrder;
        }

        public void UpdateSortOrder(List<SortOrderEditModel> sortOrderList)
        {

            foreach (var item in sortOrderList)
            {
                var CharacterDashboardLayout = _context.CharacterDashboardLayouts.Where(p => p.CharacterDashboardLayoutId == item.Id).SingleOrDefault();


                if (CharacterDashboardLayout != null)
                    CharacterDashboardLayout.SortOrder = item.SortOrder;

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
                var layout = _context.CharacterDashboardLayouts.Where(x => x.CharacterDashboardLayoutId == layoutId).FirstOrDefault();
                if (layout != null)
                {
                    var allLayouts = _context.CharacterDashboardLayouts
                   .Where(x => x.CharacterId == layout.CharacterId && x.IsDeleted != true).OrderBy(x => x.SortOrder).ToList();
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
                var layout = _context.CharacterDashboardLayouts.Where(x => x.CharacterDashboardLayoutId == layoutId).FirstOrDefault();
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
    }
}
