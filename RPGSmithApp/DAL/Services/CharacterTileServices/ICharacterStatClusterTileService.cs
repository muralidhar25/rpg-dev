using DAL.Models;
using DAL.Models.CharacterTileModels;
using DAL.Models.SPModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.CharacterTileServices
{
   public interface ICharacterStatClusterTileService
    {
        //CharacterTextTile GetById(int? id);
        Task<CharacterCharacterStatClusterTile> Create(CharacterCharacterStatClusterTile item);
        Task<CharacterCharacterStatClusterTile> Update(CharacterCharacterStatClusterTile item);
        Task<bool> Delete(int id);
        void updateClusterSortOrder(UpdateClusterSortOrderModel model);
    }
}
