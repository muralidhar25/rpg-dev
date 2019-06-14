using DAL.Models;
using DAL.Models.CharacterTileModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.CharacterTileServices
{
   public interface IBuffAndEffectTileService
    {
        CharacterBuffAndEffectTile GetById(int? id);
        Task<CharacterBuffAndEffectTile> Create(CharacterBuffAndEffectTile item);
        Task<CharacterBuffAndEffectTile> Update(CharacterBuffAndEffectTile item);
        Task<bool> Delete(int id);
    }
}
