using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.RulesetTileModels;
using DAL.Repositories.Interfaces;

namespace DAL.Services.RulesetTileServices
{
    public class RulesetCounterTileService : IRulesetCounterTileService
    {
        private readonly IRepository<RulesetCounterTile> _repo;
        protected readonly ApplicationDbContext _context;


        public RulesetCounterTileService(ApplicationDbContext context, IRepository<RulesetCounterTile> repo)
        {
            _repo = repo;
            _context = context;
        }

        public async Task<RulesetCounterTile> Create(RulesetCounterTile item)
        {
            return await _repo.Add(item);
        }

        public Task<bool> Delete(int id)
        {
            throw new NotImplementedException();
        }

        public RulesetCounterTile GetById(int? id)
        {
            throw new NotImplementedException();
        }

        public async Task<RulesetCounterTile> Update(RulesetCounterTile item)
        {
            var cutile = await _repo.Get((int)item.CounterTileId);

            if (cutile == null)
                return cutile;

            cutile.DefaultValue = item.DefaultValue;
            cutile.CurrentValue = item.CurrentValue;
            cutile.Title = item.Title;
            cutile.Maximum = item.Maximum;
            cutile.Minimum = item.Minimum;
            cutile.Step = item.Step;

            //cutile.Color = item.Color;
            //cutile.BgColor = item.BgColor;
            cutile.BodyBgColor = item.BodyBgColor;
            cutile.BodyTextColor = item.BodyTextColor;
            cutile.TitleBgColor = item.TitleBgColor;
            cutile.TitleTextColor = item.TitleTextColor;
            cutile.Shape = item.Shape;
            cutile.SortOrder = item.SortOrder;
            try
            {
                await _repo.Update(cutile);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return cutile;
        }
    }
}
