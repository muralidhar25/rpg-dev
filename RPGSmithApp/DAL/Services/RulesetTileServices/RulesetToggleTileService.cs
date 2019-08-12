using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.RulesetTileModels;
using DAL.Repositories.Interfaces;

namespace DAL.Services.RulesetTileServices
{
    public class RulesetToggleTileService : IRulesetToggleTileService
    {
        private readonly IRepository<RulesetToggleTile> _repo;
        protected readonly ApplicationDbContext _context;


        public RulesetToggleTileService(ApplicationDbContext context, IRepository<RulesetToggleTile> repo)
        {
            _repo = repo;
            _context = context;

        }

        public async Task<RulesetToggleTile> Create(RulesetToggleTile item)
        {
            return await _repo.Add(item);
        }

        public Task<bool> Delete(int id)
        {
            throw new NotImplementedException();
        }

        //public RulesetImageTile GetById(int? id)
        //{
        //    throw new NotImplementedException();
        //}

        public async Task<RulesetToggleTile> Update(RulesetToggleTile item)
        {

            var toggleTile = await _repo.Get((int)item.ToggleTileId);

            if (toggleTile == null)
                return toggleTile;

           // toggleTile.Text = item.Text;
            toggleTile.Title = item.Title;

            //imagetile.Color = item.Color;
            //imagetile.BgColor = item.BgColor;
            toggleTile.BodyBgColor = item.BodyBgColor;
            toggleTile.BodyTextColor = item.BodyTextColor;
            toggleTile.TitleBgColor = item.TitleBgColor;
            toggleTile.TitleTextColor = item.TitleTextColor;
            toggleTile.Shape = item.Shape;
            toggleTile.SortOrder = item.SortOrder;
            try
            {
                await _repo.Update(toggleTile);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return toggleTile;
        }
    }
}
