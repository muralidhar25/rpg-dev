using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.CharacterTileModels;
using DAL.Repositories.Interfaces;

namespace DAL.Services.CharacterTileServices
{
    public class CounterTileService : ICounterTileService
    {
        private readonly IRepository<CharacterCounterTile> _repo;
        protected readonly ApplicationDbContext _context;


        public CounterTileService(ApplicationDbContext context, IRepository<CharacterCounterTile> repo)
        {
            _repo = repo;
            _context = context;
        }

        public async Task<CharacterCounterTile> Create(CharacterCounterTile item)
        {
            return await _repo.Add(item);
        }

        public Task<bool> Delete(int id)
        {
            throw new NotImplementedException();
        }

        public CharacterCounterTile GetById(int? id)
        {
            throw new NotImplementedException();
        }

        public async Task<CharacterCounterTile> Update(CharacterCounterTile item)
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
            cutile.IsManual = item.IsManual;
            cutile.FontSize = item.FontSize;
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
