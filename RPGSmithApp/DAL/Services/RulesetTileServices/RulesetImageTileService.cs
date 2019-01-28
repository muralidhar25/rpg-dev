using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.RulesetTileModels;
using DAL.Repositories.Interfaces;

namespace DAL.Services.RulesetTileServices
{
    public class RulesetImageTileService : IRulesetImageTileService
    {
        private readonly IRepository<RulesetImageTile> _repo;
        protected readonly ApplicationDbContext _context;


        public RulesetImageTileService(ApplicationDbContext context, IRepository<RulesetImageTile> repo)
        {
            _repo = repo;
            _context = context;

        }

        public async Task<RulesetImageTile> Create(RulesetImageTile item)
        {
            return await _repo.Add(item);
        }

        public Task<bool> Delete(int id)
        {
            throw new NotImplementedException();
        }

        public RulesetImageTile GetById(int? id)
        {
            throw new NotImplementedException();
        }

        public async Task<RulesetImageTile> Update(RulesetImageTile item)
        {

            var imagetile = await _repo.Get((int)item.ImageTileId);

            if (imagetile == null)
                return imagetile;

            imagetile.ImageUrl = item.ImageUrl;
            imagetile.Title = item.Title;

            //imagetile.Color = item.Color;
            //imagetile.BgColor = item.BgColor;
            imagetile.BodyBgColor = item.BodyBgColor;
            imagetile.BodyTextColor = item.BodyTextColor;
            imagetile.TitleBgColor = item.TitleBgColor;
            imagetile.TitleTextColor = item.TitleTextColor;
            imagetile.Shape = item.Shape;
            imagetile.SortOrder = item.SortOrder;
            try
            {
                await _repo.Update(imagetile);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return imagetile;
        }
    }
}
