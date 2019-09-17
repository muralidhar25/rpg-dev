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
    public class CharacterDashboardPageService : ICharacterDashboardPageService
    {

        private readonly IRepository<CharacterDashboardPage> _repo;
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        public CharacterDashboardPageService(ApplicationDbContext context, IRepository<CharacterDashboardPage> repo, IConfiguration configuration)
        {
            _repo = repo;
            _context = context;
            _configuration = configuration;
        }

        public async Task<CharacterDashboardPage> Create(CharacterDashboardPage item)
        {
            return await _repo.Add(item);
        }

        public async Task<bool> Delete(int id)
        {
            string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            using (SqlConnection con = new SqlConnection(consString))
            {
                using (SqlCommand cmd = new SqlCommand("CharacterDashBoardPage_Delete"))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Connection = con;
                    cmd.Parameters.AddWithValue("@DashboardPageId", id);
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
            //// Remove associated Tiles
            //var tiles = _context.CharacterTiles.Where(x => x.CharacterDashboardPageId == id && x.IsDeleted != true).ToList();

            //    foreach (CharacterTile tile in tiles)
            //    {
            //        int? TileType = tile.TileTypeId;

            //        switch (TileType)
            //        {
            //            case 1:
            //                //Remove Note Tile 
            //                var nt = _context.CharacterNoteTiles.Where(p => p.CharacterTileId == tile.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
            //                if (nt != null)
            //                    nt.IsDeleted = true;
            //                break;
            //            case 2:
            //                //Remove Image Tile 
            //                var it = _context.CharacterImageTiles.Where(p => p.CharacterTileId == tile.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
            //                if (it != null)
            //                    it.IsDeleted = true;
            //                break;
            //            case 3:
            //                //Remove Counter Tile 
            //                var ct = _context.CharacterCounterTiles.Where(p => p.CharacterTileId == tile.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
            //                if (ct != null)
            //                    ct.IsDeleted = true;
            //                break;
            //            case 4:
            //                //Remove Character Stat Tiles 
            //                var cst = _context.CharacterCharacterStatTiles.Where(p => p.CharacterTileId == tile.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
            //                if (cst != null)
            //                    cst.IsDeleted = true;
            //                break;
            //            case 5:
            //                //Remove Link Tiles 
            //                var lt = _context.CharacterLinkTiles.Where(p => p.CharacterTileId == tile.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
            //                if (lt != null)
            //                    lt.IsDeleted = true;
            //                break;
            //            case 6:
            //                //Remove Execute iles
            //                var et = _context.CharacterExecuteTiles.Where(p => p.CharacterTileId == tile.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
            //                if (et != null)
            //                    et.IsDeleted = true;
            //                break;
            //            case 7:
            //                //Remove Command Tile 
            //                var cot = _context.CharacterCommandTiles.Where(p => p.CharacterTileId == tile.CharacterTileId && p.IsDeleted != true).SingleOrDefault();
            //                if (cot != null)
            //                    cot.IsDeleted = true;
            //                break;
            //            default:

            //                break;
            //        }

            //        tile.IsDeleted = true;
            //    }

               

            //// Remove Character Dashboard Page
            //var CharDashboardPage = await _repo.Get(id);

            //if (CharDashboardPage == null)
            //    return false;
            ////CharDashboardPage.Tiles = null;
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

        public List<CharacterDashboardPage> GetByCharacterId(int characterId)
        {
            List<CharacterDashboardPage> CharacterDashboardPages = _context.CharacterDashboardPages
                .Include(d => d.Tiles)
               .Where(x => x.CharacterId == characterId && x.IsDeleted != true).OrderBy(x => x.SortOrder).ToList();


            if (CharacterDashboardPages == null) return CharacterDashboardPages;

            foreach (CharacterDashboardPage cdp in CharacterDashboardPages)
            {
                cdp.Tiles = cdp.Tiles.Where(p => p.IsDeleted != true).ToList();

            }

            return CharacterDashboardPages;
        }

        public CharacterDashboardPage GetById(int? id)
        {
            CharacterDashboardPage CharacterDashboardPage = _context.CharacterDashboardPages
                 .Include(d => d.Tiles)
                .Where(x => x.CharacterDashboardPageId == id && x.IsDeleted != true).SingleOrDefault();


            if (CharacterDashboardPage == null) return CharacterDashboardPage;

            CharacterDashboardPage.Tiles = CharacterDashboardPage.Tiles.Where(p => p.IsDeleted != true).ToList();
           
            return CharacterDashboardPage;
        }

        public List<CharacterDashboardPage> GetByLayoutId(int layoutId, int page = 1, int pageSize = 10)
        {
            List<CharacterDashboardPage> CharacterDashboardPages = _context.CharacterDashboardPages
                .Include(d => d.Tiles)
               .Where(x => x.CharacterDashboardLayoutId == layoutId && x.IsDeleted != true).OrderBy(x => x.SortOrder).ToList();

            try
            {
                if (page > 0 && pageSize > 0)
                    CharacterDashboardPages = CharacterDashboardPages.Skip(pageSize * (page - 1)).Take(pageSize).ToList();
            }
            catch { }

            if (CharacterDashboardPages == null) return CharacterDashboardPages;

            foreach (CharacterDashboardPage cdp in CharacterDashboardPages)
            {
                cdp.Tiles = cdp.Tiles.Where(p => p.IsDeleted != true).ToList();
            }

            return CharacterDashboardPages;
        }

        public int GetCountByCharacterId(int characterId)
        {
         return _context.CharacterDashboardPages
               .Where(x => x.CharacterId == characterId && x.IsDeleted != true).Count();
        }

        public int GetCountByLayoutId(int layoutId)
        {
           return   _context.CharacterDashboardPages               
                .Where(x => x.CharacterDashboardLayoutId == layoutId && x.IsDeleted != true).Count();
        }

        public async Task<CharacterDashboardPage> Update(CharacterDashboardPage item)
        {
            var CharacterDashboardPage = await _repo.Get(item.CharacterDashboardPageId);

            if (CharacterDashboardPage == null)
                return CharacterDashboardPage;

            CharacterDashboardPage.Name = item.Name;
            CharacterDashboardPage.ContainerHeight = item.ContainerHeight;
            CharacterDashboardPage.ContainerWidth = item.ContainerWidth;
            CharacterDashboardPage.BodyBgColor = item.BodyBgColor;
            CharacterDashboardPage.BodyTextColor = item.BodyTextColor;
            CharacterDashboardPage.TitleBgColor = item.TitleBgColor;
            CharacterDashboardPage.TitleTextColor = item.TitleTextColor;

            try
            {
                await _repo.Update(CharacterDashboardPage);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return CharacterDashboardPage;
        }

        public void UpdateSortOrder(List<SortOrderEditModel> sortOrderList)
        {
            foreach (var item in sortOrderList)
            {
                var CharacterDashboardPage = _context.CharacterDashboardPages.Where(p => p.CharacterDashboardPageId == item.Id).SingleOrDefault();


                if (CharacterDashboardPage != null)
                    CharacterDashboardPage.SortOrder = item.SortOrder;

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
            var result = _context.CharacterDashboardPages.Where(x => x.IsDeleted != true && x.CharacterDashboardLayoutId == layoutId).OrderByDescending(x => x.SortOrder).FirstOrDefault();

            if (result == null)
                return 0;

            return result.SortOrder;
        }

        public async  Task<bool> CheckDuplicate(string value, int? characterId, int? layoutId, int? Id = 0)
        {
            var items = _repo.GetAll();
            if (items.Result == null || items.Result.Count == 0) return false;

            return items.Result.Where(x => x.Name.ToLower() == value.ToLower() && x.CharacterId == characterId && x.CharacterDashboardLayoutId==layoutId && x.CharacterDashboardPageId != Id && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
        }
        public void Create_sp(CharacterDashboardPage model, string UserID)
        {
            string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            using (SqlConnection con = new SqlConnection(consString))
            {
                using (SqlCommand cmd = new SqlCommand("Character_DuplicateLayout_And_Page"))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Connection = con;
                    cmd.Parameters.AddWithValue("@CharacterLayoutID", model.CharacterDashboardLayoutId);                    
                    cmd.Parameters.AddWithValue("@OldCharacterDashboardPageId", model.CharacterDashboardPageId);
                    cmd.Parameters.AddWithValue("@CharacterId", model.CharacterId);
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
