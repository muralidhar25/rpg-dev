using DAL.Models;
using DAL.Models.CharacterTileModels;
using DAL.Models.RulesetTileModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.CharacterTileServices
{
   public interface IToggleTileService
    {
        //CharacterTextTile GetById(int? id);
        Task<CharacterToggleTile> Create(CharacterToggleTile item);
        Task<CharacterToggleTile> Update(CharacterToggleTile item);
        Task<bool> Delete(int id);
        Task updateCharacterToggleTileValues(CharacterToggleTile model);
        
    }
}
