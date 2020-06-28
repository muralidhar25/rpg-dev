using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.CharacterTileServices
{
   public interface ITileConfigService
    {
        List<TileConfig> GetAll();
        TileConfig Get(int id);
        Task<TileConfig> CreateAsync(TileConfig item);
        Task<TileConfig> UpdateAsync(TileConfig item);
        Task<bool> DeleteAsync(int id);
        bool alreadyExists(int id);
        void UpdateList(List<TileConfig> list);
        void createList(List<TileConfig> list);
    }
}
