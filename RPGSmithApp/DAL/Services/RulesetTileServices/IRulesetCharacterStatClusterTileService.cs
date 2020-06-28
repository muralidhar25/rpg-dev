using DAL.Models;
using DAL.Models.RulesetTileModels;
using DAL.Models.SPModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.RulesetTileServices
{
   public interface IRulesetCharacterStatClusterTileService
    {
        //CharacterTextTile GetById(int? id);
        Task<RulesetCharacterStatClusterTile> Create(RulesetCharacterStatClusterTile item);
        Task<RulesetCharacterStatClusterTile> Update(RulesetCharacterStatClusterTile item);
        Task<bool> Delete(int id);
        void updateClusterSortOrder(UpdateClusterSortOrderModel model);
    }
}
