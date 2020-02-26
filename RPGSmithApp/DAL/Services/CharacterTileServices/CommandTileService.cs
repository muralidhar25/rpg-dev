using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.CharacterTileModels;
using DAL.Repositories.Interfaces;

namespace DAL.Services.CharacterTileServices
{
    public class CommandTileService : ICommandTileService
    {
        private readonly IRepository<CharacterCommandTile> _repo;
        protected readonly ApplicationDbContext _context;


        public CommandTileService(ApplicationDbContext context, IRepository<CharacterCommandTile> repo)
        {
            _repo = repo;
            _context = context;

        }

        public async  Task<CharacterCommandTile> Create(CharacterCommandTile item)
        {
            return await _repo.Add(item);
        }

        public async Task<bool> Delete(int id)
        {
            return await _repo.Remove(id);
        }

        public async Task<CharacterCommandTile> GetById(int? id)
        {
            return await _repo.Get(id ?? 0);
        }

        public async Task<CharacterCommandTile> GetByCharacterTileId(int TileId)
        {
            return _context.CharacterCommandTiles.Where(x => x.CharacterTileId == TileId).FirstOrDefault();
        }

        public async Task<CharacterCommandTile> Update(CharacterCommandTile item)
        {

            var ctile = await _repo.Get((int)item.CommandTileId);

            if (ctile == null)
                return ctile;

            ctile.Command = item.Command;
            ctile.Title = item.Title;
            ctile.ImageUrl = item.ImageUrl;
            ctile.IsCommandChecked = item.IsCommandChecked;

            //ctile.Color = item.Color;
            //ctile.BgColor = item.BgColor;
            ctile.BodyBgColor = item.BodyBgColor;
            ctile.BodyTextColor = item.BodyTextColor;
            ctile.TitleBgColor = item.TitleBgColor;
            ctile.TitleTextColor = item.TitleTextColor;
            ctile.Shape = item.Shape;
            ctile.SortOrder = item.SortOrder;
            ctile.IsManual = item.IsManual;
            ctile.FontSize = item.FontSize;

            try
            {
                await _repo.Update(ctile);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return ctile;
        }
    }
}
