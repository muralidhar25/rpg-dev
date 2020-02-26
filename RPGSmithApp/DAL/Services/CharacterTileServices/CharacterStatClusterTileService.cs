using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.CharacterTileModels;
using DAL.Models.SPModels;
using DAL.Repositories.Interfaces;

namespace DAL.Services.CharacterTileServices
{
    public class CharacterStatClusterTileService : ICharacterStatClusterTileService
    {
        private readonly IRepository<CharacterCharacterStatClusterTile> _repo;
        protected readonly ApplicationDbContext _context;


        public CharacterStatClusterTileService(ApplicationDbContext context, IRepository<CharacterCharacterStatClusterTile> repo)
        {
            _repo = repo;
            _context = context;

        }

        public async Task<CharacterCharacterStatClusterTile> Create(CharacterCharacterStatClusterTile item)
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

        public async Task<CharacterCharacterStatClusterTile> Update(CharacterCharacterStatClusterTile item)
        {

            var clusterTile = await _repo.Get((int)item.CharacterStatClusterTileId);

            if (clusterTile == null)
                return clusterTile;

            clusterTile.DisplayCharactersCharacterStatID = item.DisplayCharactersCharacterStatID;
            clusterTile.Title = item.Title;
            
            clusterTile.BodyBgColor = item.BodyBgColor;
            clusterTile.BodyTextColor = item.BodyTextColor;
            clusterTile.TitleBgColor = item.TitleBgColor;
            clusterTile.TitleTextColor = item.TitleTextColor;
            clusterTile.Shape = item.Shape;
            clusterTile.SortOrder = item.SortOrder;
            clusterTile.ClusterWithSortOrder = item.ClusterWithSortOrder;
            clusterTile.IsManual = item.IsManual;
            clusterTile.FontSize = item.FontSize;
            try
            {
                await _repo.Update(clusterTile);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return clusterTile;
        }
        public void updateClusterSortOrder(UpdateClusterSortOrderModel model) {
            var clusterTile = _repo.Get(model.ClusterTileId).Result;
            clusterTile.ClusterWithSortOrder = model.SortedIds;
            _context.SaveChanges();
        }
    }
}
