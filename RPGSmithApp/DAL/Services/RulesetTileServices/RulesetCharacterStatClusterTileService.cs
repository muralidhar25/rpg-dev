using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.RulesetTileModels;
using DAL.Models.SPModels;
using DAL.Repositories.Interfaces;

namespace DAL.Services.RulesetTileServices
{
    public class RulesetCharacterStatClusterTileService : IRulesetCharacterStatClusterTileService
    {
        private readonly IRepository<RulesetCharacterStatClusterTile> _repo;
        protected readonly ApplicationDbContext _context;


        public RulesetCharacterStatClusterTileService(ApplicationDbContext context, IRepository<RulesetCharacterStatClusterTile> repo)
        {
            _repo = repo;
            _context = context;

        }

        public async Task<RulesetCharacterStatClusterTile> Create(RulesetCharacterStatClusterTile item)
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

        public async Task<RulesetCharacterStatClusterTile> Update(RulesetCharacterStatClusterTile item)
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
