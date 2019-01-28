using DAL.Models;
using DAL.Models.CharacterTileModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.CharacterTileServices
{
   public interface IExecuteTileService
    {
        CharacterExecuteTile GetById(int? id);
        Task<CharacterExecuteTile> Create(CharacterExecuteTile item);
        Task<CharacterExecuteTile> Update(CharacterExecuteTile item);
        Task<bool> Delete(int id);
    }
}
