using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.CharacterTileModels;
using DAL.Repositories.Interfaces;

namespace DAL.Services.CharacterTileServices
{
   public  class NoteTileService : INoteTileService
    {

        private readonly IRepository<CharacterNoteTile> _repo;
        protected readonly ApplicationDbContext _context;


        public NoteTileService(ApplicationDbContext context, IRepository<CharacterNoteTile> repo)
        {
            _repo = repo;
            _context = context;

        }


        public async Task<CharacterNoteTile> Create(CharacterNoteTile item)
        {
            return await _repo.Add(item);
        }

        public Task<bool> Delete(int id)
        {
            throw new NotImplementedException();
        }

        public CharacterNoteTile GetById(int? id)
        {
            throw new NotImplementedException();
        }

        public  async Task<CharacterNoteTile> Update(CharacterNoteTile item)
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
