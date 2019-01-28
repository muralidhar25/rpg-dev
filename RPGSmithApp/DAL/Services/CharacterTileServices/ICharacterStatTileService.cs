using DAL.Models;
using DAL.Models.CharacterTileModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.CharacterTileServices
{
   public interface ICharacterStatTileService
    {
        CharacterCharacterStatTile GetById(int? id);
        Task<CharacterCharacterStatTile> Create(CharacterCharacterStatTile item);
        Task<CharacterCharacterStatTile> Update(CharacterCharacterStatTile item);
        Task<bool> Delete(int id);
    }
}
