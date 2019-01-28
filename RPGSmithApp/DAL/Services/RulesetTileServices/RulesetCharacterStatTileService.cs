using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.RulesetTileModels;
using DAL.Repositories.Interfaces;

namespace DAL.Services.RulesetTileServices
{
    public class RulesetCharacterStatTileService : IRulesetCharacterStatTileService
    {
        private readonly IRepository<RulesetCharacterStatTile> _repo;
        protected readonly ApplicationDbContext _context;
      

        public RulesetCharacterStatTileService(ApplicationDbContext context, IRepository<RulesetCharacterStatTile> repo)
        {
            _repo = repo;
            _context = context;
          
        }

        public async Task<RulesetCharacterStatTile> Create(RulesetCharacterStatTile item)
        {
            return await _repo.Add(item);
           
        }

        public Task<bool> Delete(int id)
        {
            throw new NotImplementedException();
        }

        public RulesetCharacterStatTile GetById(int? id)
        {

            throw new NotImplementedException();
        }

        public async  Task<RulesetCharacterStatTile> Update(RulesetCharacterStatTile item)
        {
            var cstile = await _repo.Get((int)item.CharacterStatTileId);

            if (cstile == null)
                return cstile;

            cstile.ShowTitle = item.ShowTitle;
            cstile.CharacterStatId = item.CharacterStatId;
            
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
