using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.RulesetTileModels;
using DAL.Repositories.Interfaces;

namespace DAL.Services.RulesetTileServices
{
    public class RulesetBuffAndEffectTileService : IRulesetBuffAndEffectTileService
    {
          private readonly IRepository<RulesetBuffAndEffectTile> _repo;
        protected readonly ApplicationDbContext _context;


        public RulesetBuffAndEffectTileService(ApplicationDbContext context, IRepository<RulesetBuffAndEffectTile> repo)
        {
            _repo = repo;
            _context = context;

        }

        public RulesetBuffAndEffectTile GetById(int? id)
        {
            throw new NotImplementedException();
        }

        public async Task<RulesetBuffAndEffectTile> Create(RulesetBuffAndEffectTile item)
        {
            var res = await _repo.Add(item);
            //if (item.MultiBuffAndEffectsIds.Count>0)
            //{
            //    foreach (var rec in item.MultiBuffAndEffectsIds)
            //    {
            //        rec.BuffAndEffectTileId = res.BuffAndEffectTileId;
            //    }
            //    _context.BuffAndEffectIdsForTiles.AddRange(item.MultiBuffAndEffectsIds);
            //   await _context.SaveChangesAsync();
            //}
            return res;
        }

        public async Task<RulesetBuffAndEffectTile> Update(RulesetBuffAndEffectTile item)
        {
            var buffAndEffectTile = await _repo.Get((int)item.BuffAndEffectTileId);

            if (buffAndEffectTile == null)
                return buffAndEffectTile;

            buffAndEffectTile.ShowTitle = item.ShowTitle;
            buffAndEffectTile.DisplayLinkImage = item.DisplayLinkImage;
            buffAndEffectTile.BodyBgColor = item.BodyBgColor;
            buffAndEffectTile.BodyTextColor = item.BodyTextColor;
            buffAndEffectTile.TitleBgColor = item.TitleBgColor;
            buffAndEffectTile.TitleTextColor = item.TitleTextColor;
            buffAndEffectTile.Shape = item.Shape;
            buffAndEffectTile.SortOrder = item.SortOrder;
            try
            {
                await _repo.Update(buffAndEffectTile);
                //if (item.MultiBuffAndEffectsIds.Count > 0)
                //{
                //    foreach (var rec in item.MultiBuffAndEffectsIds)
                //    {
                //        rec.BuffAndEffectTileId = item.BuffAndEffectTileId;
                //    }
                //    _context.BuffAndEffectIdsForTiles.RemoveRange(_context.BuffAndEffectIdsForTiles.Where(x => x.BuffAndEffectTileId == item.BuffAndEffectTileId));
                //    _context.BuffAndEffectIdsForTiles.AddRange(item.MultiBuffAndEffectsIds);
                //    await _context.SaveChangesAsync();
                //}
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return buffAndEffectTile;
        }

        public Task<bool> Delete(int id)
        {
            throw new NotImplementedException();
        }
    }
}
