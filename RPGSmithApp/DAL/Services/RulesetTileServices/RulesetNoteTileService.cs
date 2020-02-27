using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.RulesetTileModels;
using DAL.Repositories.Interfaces;

namespace DAL.Services.RulesetTileServices
{
   public  class RulesetNoteTileService : IRulesetNoteTileService
    {

        private readonly IRepository<RulesetNoteTile> _repo;
        protected readonly ApplicationDbContext _context;


        public RulesetNoteTileService(ApplicationDbContext context, IRepository<RulesetNoteTile> repo)
        {
            _repo = repo;
            _context = context;

        }


        public async Task<RulesetNoteTile> Create(RulesetNoteTile item)
        {
            return await _repo.Add(item);
        }

        public Task<bool> Delete(int id)
        {
            throw new NotImplementedException();
        }

        public RulesetNoteTile GetById(int? id)
        {
            throw new NotImplementedException();
        }

        public  async Task<RulesetNoteTile> Update(RulesetNoteTile item)
        {
            var notetile = await _repo.Get((int)item.NoteTileId);

            if (notetile == null)
                return notetile;

            notetile.Title = item.Title;
            notetile.Content = item.Content;

            //notetile.Color = item.Color;
            //notetile.BgColor = item.BgColor;
            notetile.BodyBgColor = item.BodyBgColor;
            notetile.BodyTextColor = item.BodyTextColor;
            notetile.TitleBgColor = item.TitleBgColor;
            notetile.TitleTextColor = item.TitleTextColor;
            notetile.Shape = item.Shape;
            notetile.SortOrder = item.SortOrder;
            notetile.IsManual = item.IsManual;
            notetile.FontSize = item.FontSize;
            notetile.FontSizeTitle = item.FontSizeTitle;
            try
            {
                await _repo.Update(notetile);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return notetile;
        }
    }
}
