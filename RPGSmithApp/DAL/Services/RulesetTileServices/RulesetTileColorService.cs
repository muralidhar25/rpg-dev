using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Models.RulesetTileModels;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DAL.Services.RulesetTileServices
{
    public class RulesetTileColorService : IRulesetTileColorService
    {
        private readonly IRepository<RulesetTileColor> _repo;
        protected readonly ApplicationDbContext _context;

        public RulesetTileColorService(ApplicationDbContext context, IRepository<RulesetTileColor> repo)
        {
            _repo = repo;
            _context = context;
        }

        public async Task<RulesetTileColor> Create(RulesetTileColor color)
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

        public async Task<RulesetTileColor> Update(RulesetTileColor color)
        {
            var _tileColor = await _repo.Get(color.TileColorId);

            if (_tileColor == null) return _tileColor;

            _tileColor.TitleBgColor = color.TitleBgColor;
            _tileColor.TitleTextColor = color.TitleTextColor;
            _tileColor.BodyBgColor = color.BodyBgColor;
            _tileColor.BodyTextColor = color.BodyTextColor;
            _tileColor.RulesetTileId = color.RulesetTileId;
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

        public RulesetTileColor GetById(int id)
        {
            RulesetTileColor tileColor = _context.RulesetTileColors
                // .Include(d => d.CharacterTile).ThenInclude(y => y.Character)
                .Include(d => d.User)
            .Where(x => x.TileColorId == id && x.IsDeleted != true)
            .SingleOrDefault();

            return tileColor;
        }

        public RulesetTileColor GetByRulesetTileId(int RulesetTileId)
        {
            RulesetTileColor tileColor = _context.RulesetTileColors
                // .Include(d => d.CharacterTile).ThenInclude(y => y.Character)
                .Include(d => d.User)
            .Where(x => x.RulesetTileId == RulesetTileId && x.IsDeleted != true)
            .SingleOrDefault();

            return tileColor;
        }

        public List<RulesetTileColor> GetByUserId(string userId)
        {
            List<RulesetTileColor> tileColor = _context.RulesetTileColors
            // .Include(d => d.CharacterTile).ThenInclude(y => y.Character)
            .Include(d => d.User)
            .Where(x => x.CreatedBy == userId && x.IsDeleted != true)
            .OrderByDescending(x => x.TileColorId).ToList();

            tileColor = tileColor.GroupBy(x => new { x.TitleTextColor, x.BodyTextColor, x.BodyBgColor, x.TitleBgColor })
            .Select(g => g.First()).ToList();
            if (tileColor.Count > 7)
            {
                tileColor = tileColor.GroupBy(x => new { x.BodyBgColor }).Select(g => g.First()).ToList();
            }
            if (tileColor.Count < 6)
            {
                //var newlist = getRPGCoreColors();
                //foreach (var item in newlist)
                //{ if (tileColor.Where(x => x.TitleBgColor == item.TitleBgColor).FirstOrDefault()==null && tileColor.Count < 6)
                //    {
                //        tileColor.Add(new RulesetTileColor()
                //        {

                //            TitleTextColor = item.TitleTextColor,
                //            TitleBgColor = item.TitleBgColor,
                //            BodyTextColor = item.BodyTextColor,
                //            BodyBgColor = item.BodyBgColor
                //        });
                //    }
                //}
                var newlist = getRPGCoreColors();
                tileColor.Add(newlist.Where(p => p.RPGCoreColorId == 7).Select(o => new RulesetTileColor()
                {

                    TitleTextColor = o.TitleTextColor,
                    TitleBgColor = o.TitleBgColor,
                    BodyTextColor = o.BodyTextColor,
                    BodyBgColor = o.BodyBgColor
                }).FirstOrDefault());
                foreach (var item in newlist)
                {
                    if (item.RPGCoreColorId != 7)
                    {
                        if (tileColor.Where(x => x.TitleBgColor == item.TitleBgColor).FirstOrDefault() == null && tileColor.Count < 6)
                        {
                            tileColor.Add(new RulesetTileColor()
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

        public List<Models.RPGCoreColor> getRPGCoreColors() => _context.RPGCoreColors.ToList();

    }
}
