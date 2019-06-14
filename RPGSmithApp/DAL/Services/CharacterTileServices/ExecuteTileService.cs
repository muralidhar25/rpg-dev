using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.CharacterTileModels;
using DAL.Repositories.Interfaces;

namespace DAL.Services.CharacterTileServices
{
    public class ExecuteTileService : IExecuteTileService
    {
        private readonly IRepository<CharacterExecuteTile> _repo;
        protected readonly ApplicationDbContext _context;


        public ExecuteTileService(ApplicationDbContext context, IRepository<CharacterExecuteTile> repo)
        {
            _repo = repo;
            _context = context;

        }

        public async Task<CharacterExecuteTile> Create(CharacterExecuteTile item)
        {
            return await _repo.Add(item);
        }

        public Task<bool> Delete(int id)
        {
            throw new NotImplementedException();
        }

        public CharacterExecuteTile GetById(int? id)
        {
            throw new NotImplementedException();
        }

        public async Task<CharacterExecuteTile> Update(CharacterExecuteTile item)
        {

            var extile = await _repo.Get((int)item.ExecuteTileId);

            if (extile == null)
                return extile;

            extile.CommandId = item.CommandId;
            extile.ShowTitle = item.ShowTitle;
            extile.DisplayLinkImage = item.DisplayLinkImage;
            extile.LinkType = item.LinkType;
            extile.AbilityId = item.AbilityId;
            extile.BuffAndEffectId = item.BuffAndEffectId;
            extile.SpellId = item.SpellId;
            extile.ItemId = item.ItemId;

            //extile.Color = item.Color;
            //extile.BgColor = item.BgColor;
            extile.BodyBgColor = item.BodyBgColor;
            extile.BodyTextColor = item.BodyTextColor;
            extile.TitleBgColor = item.TitleBgColor;
            extile.TitleTextColor = item.TitleTextColor;
            extile.Shape = item.Shape;
            extile.SortOrder = item.SortOrder;

            try
            {
                await _repo.Update(extile);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return extile;
        }
    }
}
