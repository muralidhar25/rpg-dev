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
    public class CharacterStatTileService : ICharacterStatTileService
    {
        private readonly IRepository<CharacterCharacterStatTile> _repo;
        protected readonly ApplicationDbContext _context;
      

        public CharacterStatTileService(ApplicationDbContext context, IRepository<CharacterCharacterStatTile> repo)
        {
            _repo = repo;
            _context = context;
          
        }

        public async Task<CharacterCharacterStatTile> Create(CharacterCharacterStatTile item)
        {
            return await _repo.Add(item);
           
        }

        public Task<bool> Delete(int id)
        {
            throw new NotImplementedException();
        }

        public CharacterCharacterStatTile GetById(int? id)
        {

            throw new NotImplementedException();
        }

        public async  Task<CharacterCharacterStatTile> Update(CharacterCharacterStatTile item)
        {
            var cstile = await _repo.Get((int)item.CharacterStatTileId);

            if (cstile == null)
                return cstile;

            cstile.ShowTitle = item.ShowTitle;
            cstile.CharactersCharacterStatId = item.CharactersCharacterStatId;
            
            //cstile.Color = item.Color;
            //cstile.BgColor = item.BgColor;
            cstile.bodyBgColor = item.bodyBgColor;
            cstile.bodyTextColor = item.bodyTextColor;
            cstile.titleBgColor = item.titleBgColor;
            cstile.titleTextColor = item.titleTextColor;
            cstile.Shape = item.Shape;
            cstile.SortOrder = item.SortOrder;
            try
            {
                await _repo.Update(cstile);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return cstile;

        }
    }
}
