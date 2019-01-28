using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DAL.Services.CharacterTileServices
{
    public class ColorService : IColorService
    {
        private readonly IRepository<TileColor> _repo;
        protected readonly ApplicationDbContext _context;

        public ColorService(ApplicationDbContext context, IRepository<TileColor> repo)
        {
            _repo = repo;
            _context = context;
        }

        public async Task<TileColor> Create(TileColor color)
        {
            try
            {
                var colorExist = _context.TileColors.Where(x => x.CreatedBy == color.CreatedBy
                    && x.BodyTextColor == color.BodyTextColor && x.TitleTextColor == color.TitleTextColor).FirstOrDefault();

                if (colorExist != null) _context.TileColors.Remove(colorExist);
            }
            catch { }

            color.IsDeleted = false;
            color.CreatedDate = DateTime.Now;
            _context.Add(color);
            _context.SaveChanges();
            return color;
        }

        public async Task<TileColor> Update(TileColor color)
        {
            var _tileColor = await _repo.Get(color.TileColorId);

            if (_tileColor == null) return _tileColor;

            _tileColor.TitleBgColor = color.TitleBgColor;
            _tileColor.TitleTextColor = color.TitleTextColor;
            _tileColor.BodyBgColor = color.BodyBgColor;
            _tileColor.BodyTextColor = color.BodyTextColor;
            _tileColor.CharacterTileId = color.CharacterTileId;
            _tileColor.CreatedBy = color.CreatedBy;
            _tileColor.CreatedDate = DateTime.Now;

            try
            {
                await _repo.Update(_tileColor);
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return _tileColor;
        }

        public async Task<bool> Delete(int id)
        {
            // Remove Tile 
            var colorTile = await _repo.Get(id);

            if (colorTile == null) return false;

            colorTile.IsDeleted = true;

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

        public TileColor GetById(int id)
        {
            TileColor tileColor = _context.TileColors
               // .Include(d => d.CharacterTile).ThenInclude(y => y.Character)
                .Include(d => d.User)
            .Where(x => x.TileColorId == id && x.IsDeleted != true)
            .SingleOrDefault();

            return tileColor;
        }

        public TileColor GetByCharacterTileId(int characterTileId)
        {
            TileColor tileColor = _context.TileColors
               // .Include(d => d.CharacterTile).ThenInclude(y => y.Character)
                .Include(d => d.User)
            .Where(x => x.CharacterTileId == characterTileId && x.IsDeleted != true)
            .SingleOrDefault();

            return tileColor;
        }

        public List<TileColor> GetByUserId(string userId)
        {
            List<TileColor> tileColor = _context.TileColors
            // .Include(d => d.CharacterTile).ThenInclude(y => y.Character)
            .Include(d => d.User)
            .Where(x => x.CreatedBy == userId && x.IsDeleted != true)
            .OrderByDescending(x => x.TileColorId).ToList();

            tileColor = tileColor.GroupBy(x => new { x.TitleTextColor, x.BodyTextColor, x.BodyBgColor, x.TitleBgColor })
            .Select(g => g.First()).ToList();

            if (tileColor.Count < 6)
            {
                var newlist = getRPGCoreColors();
                tileColor.Add(newlist.Where(p=>p.RPGCoreColorId==7).Select(o=>new TileColor()
                {

                    TitleTextColor = o.TitleTextColor,
                    TitleBgColor = o.TitleBgColor,
                    BodyTextColor = o.BodyTextColor,
                    BodyBgColor = o.BodyBgColor
                }).FirstOrDefault());
                foreach (var item in newlist)
                {
                    if (item.RPGCoreColorId != 7) {
                        if (tileColor.Where(x => x.TitleBgColor == item.TitleBgColor).FirstOrDefault() == null && tileColor.Count < 6)
                        {
                            tileColor.Add(new TileColor()
                            {

                                TitleTextColor = item.TitleTextColor,
                                TitleBgColor = item.TitleBgColor,
                                BodyTextColor = item.BodyTextColor,
                                BodyBgColor = item.BodyBgColor
                            });
                        }
                    }
                    
                }
            }
            tileColor = tileColor.OrderByDescending(x => x.TileColorId).Take(6).ToList();
            return tileColor;
        }
        public Boolean ColorExixtsForUser(string userId)
        {
            return _context.TileColors
            // .Include(d => d.CharacterTile).ThenInclude(y => y.Character)
            .Include(d => d.User)
            .Where(x => x.CreatedBy == userId && x.IsDeleted != true)
            .OrderByDescending(x => x.TileColorId).Any();            
            //return tileColor;
        }
        public List<RPGCoreColor> getRPGCoreColors() => _context.RPGCoreColors.ToList();

    }
}
