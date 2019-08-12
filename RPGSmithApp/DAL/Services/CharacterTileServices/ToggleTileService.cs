using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.CharacterTileModels;
using DAL.Repositories.Interfaces;

namespace DAL.Services.CharacterTileServices
{
    public class ToggleTileService : IToggleTileService
    {
        private readonly IRepository<CharacterToggleTile> _repo;
        protected readonly ApplicationDbContext _context;


        public ToggleTileService(ApplicationDbContext context, IRepository<CharacterToggleTile> repo)
        {
            _repo = repo;
            _context = context;

        }

        public async Task<CharacterToggleTile> Create(CharacterToggleTile item)
        {
            return await _repo.Add(item);
        }

        public Task<bool> Delete(int id)
        {
            throw new NotImplementedException();
        }

        //public CharacterImageTile GetById(int? id)
        //{
        //    throw new NotImplementedException();
        //}

        public async Task<CharacterToggleTile> Update(CharacterToggleTile item)
        {

            var toggleTile = await _repo.Get((int)item.ToggleTileId);

            if (toggleTile == null)
                return toggleTile;

            //toggleTile.TileToggleId = item.Text;
            toggleTile.Title = item.Title;

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
