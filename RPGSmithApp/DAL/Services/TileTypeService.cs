using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.CharacterTileModels;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DAL.Services
{
    public class TileTypeService : ITileTypeService
    {

        private readonly IRepository<TileType> _repo;
        protected readonly ApplicationDbContext _context;
        public TileTypeService(ApplicationDbContext context, IRepository<TileType> repo)
        {
            _repo = repo;
            _context = context;
        }

        public  async Task<bool> CheckDuplicate(string value, int? Id = 0)
        {
            var items = _repo.GetAll();
            if (items.Result == null || items.Result.Count == 0) return false;

            return items.Result.Where(x => x.Name.ToLower() == value.ToLower() && x.TileTypeId != Id && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
        }

        public async Task<TileType> Create(TileType item)
        {
            return await _repo.Add(item);
        }

        public async Task<bool> Delete(int id)
        {

            // Remove associated Tiles
            var tiles = _context.CharacterTiles.Where(x => x.TileTypeId == id && x.IsDeleted != true).ToList();

            foreach (CharacterTile tile in tiles)
            {
              
               switch (id)
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
                    default:

                        break;
                }

                tile.IsDeleted = true;
            }

            // Remove Tile Type
            var TileType = await _repo.Get(id);

            if (TileType == null)
                return false;

            TileType.IsDeleted = true;

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

        public List<TileType> GetAll()
        {
            List<TileType> TileTypes = _context.TileTypes
               // .Include(d => d.CharacterTiles)
              .Where(x =>  x.IsDeleted != true).ToList();


            if (TileTypes == null) return TileTypes;

            foreach (TileType tt in TileTypes)
            {
               // tt.CharacterTiles = tt.CharacterTiles.Where(p => p.IsDeleted != true).ToList();

            }

            return TileTypes;
        }

        public TileType GetById(int? id)
        {
            TileType TileType = _context.TileTypes
              //.Include(d => d.CharacterTiles)
            .Where(x => x.TileTypeId==id && x.IsDeleted != true).SingleOrDefault();

            if (TileType == null) return TileType;

            //TileType.CharacterTiles = TileType.CharacterTiles.Where(p => p.IsDeleted != true).ToList();

            return TileType;
        }

        public int GetCount()
        {
            return _context.TileTypes
                 .Where(x => x.IsDeleted != true).Count();
        }

        public async Task<TileType> Update(TileType item)
        {
            var TileType = await _repo.Get(item.TileTypeId);

            if (TileType == null)
                return TileType;

            TileType.Name = item.Name;
            TileType.ImageUrl = item.ImageUrl;

            try
            {
                await _repo.Update(TileType);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return TileType;
        }
    }
}
