using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.CharacterTileServices
{
    public interface IColorService
    {
        Task<TileColor> Create(TileColor color);
        Task<TileColor> Update(TileColor color);
        Task<bool> Delete(int id);
        TileColor GetById(int id);
        TileColor GetByCharacterTileId(int characterTileId);
        List<TileColor> GetByUserId(string userId);
        List<RPGCoreColor> getRPGCoreColors();
        Boolean ColorExixtsForUser(string userId);
    }
}
