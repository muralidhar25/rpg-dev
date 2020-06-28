using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.CharacterTileModels;
using DAL.Repositories.Interfaces;

namespace DAL.Services.CharacterTileServices
{
    public class TextTileService : ITextTileService
    {
        private readonly IRepository<CharacterTextTile> _repo;
        protected readonly ApplicationDbContext _context;


        public TextTileService(ApplicationDbContext context, IRepository<CharacterTextTile> repo)
        {
            _repo = repo;
            _context = context;

        }

        public async Task<CharacterTextTile> Create(CharacterTextTile item)
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

        public async Task<CharacterTextTile> Update(CharacterTextTile item)
        {

            var textTile = await _repo.Get((int)item.TextTileId);

            if (textTile == null)
                return textTile;

            textTile.Text = item.Text;
            textTile.Title = item.Title;

            textTile.BodyBgColor = item.BodyBgColor;
            textTile.BodyTextColor = item.BodyTextColor;
            textTile.TitleBgColor = item.TitleBgColor;
            textTile.TitleTextColor = item.TitleTextColor;
            textTile.Shape = item.Shape;
            textTile.SortOrder = item.SortOrder;
            textTile.IsManualTitle = item.IsManualTitle;
            textTile.FontSizeTitle = item.FontSizeTitle;
            textTile.IsManualText = item.IsManualText;
            textTile.FontSizeText = item.FontSizeText;
            try
            {
                await _repo.Update(textTile);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return textTile;
        }
    }
}
