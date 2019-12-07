using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.CharacterTileModels;
using DAL.Repositories.Interfaces;

namespace DAL.Services.CharacterTileServices
{
    public class CurrencyTileService : ICurrencyTileService
    {
        private readonly IRepository<CharacterCurrencyTypeTile> _repo;
        protected readonly ApplicationDbContext _context;

        public CurrencyTileService(ApplicationDbContext context, IRepository<CharacterCurrencyTypeTile> repo)
        {
            _repo = repo;
            _context = context;
        }

        public CharacterCurrencyTypeTile GetById(int? id)
        {
            throw new NotImplementedException();
        }

        public async Task<CharacterCurrencyTypeTile> Create(CharacterCurrencyTypeTile item)
        {
            return await _repo.Add(item);
        }

        public async Task<CharacterCurrencyTypeTile> Update(CharacterCurrencyTypeTile item)
        {
            var currencyTile = await _repo.Get((int)item.CurrencyTypeTileId);

            if (currencyTile == null)
                return currencyTile;

            currencyTile.Title = item.Title;
            currencyTile.ShowTitle = item.ShowTitle;
            currencyTile.DisplayLinkImage = item.DisplayLinkImage;

            //currencyTile.Color = item.Color;
            //currencyTile.BgColor = item.BgColor;
            currencyTile.BodyBgColor = item.BodyBgColor;
            currencyTile.BodyTextColor = item.BodyTextColor;
            currencyTile.TitleBgColor = item.TitleBgColor;
            currencyTile.TitleTextColor = item.TitleTextColor;
            currencyTile.Shape = item.Shape;
            currencyTile.SortOrder = item.SortOrder;
            try
            {
                await _repo.Update(currencyTile);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return currencyTile;
        }

        public Task<bool> Delete(int id)
        {
            throw new NotImplementedException();
        }
    }
}
