using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.CharacterTileModels;
using DAL.Repositories.Interfaces;

namespace DAL.Services.CharacterTileServices
{
    public class ImageTileService : IImageTileService
    {
        private readonly IRepository<CharacterImageTile> _repo;
        protected readonly ApplicationDbContext _context;


        public ImageTileService(ApplicationDbContext context, IRepository<CharacterImageTile> repo)
        {
            _repo = repo;
            _context = context;

        }

        public async Task<CharacterImageTile> Create(CharacterImageTile item)
        {
            return await _repo.Add(item);
        }

        public Task<bool> Delete(int id)
        {
            throw new NotImplementedException();
        }

        public CharacterImageTile GetById(int? id)
        {
            throw new NotImplementedException();
        }

        public async Task<CharacterImageTile> Update(CharacterImageTile item)
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
