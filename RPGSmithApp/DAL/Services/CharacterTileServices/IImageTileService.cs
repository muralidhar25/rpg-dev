using DAL.Models;
using DAL.Models.CharacterTileModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.CharacterTileServices
{
   public interface IImageTileService
    {
        CharacterImageTile GetById(int? id);
        Task<CharacterImageTile> Create(CharacterImageTile item);
        Task<CharacterImageTile> Update(CharacterImageTile item);
        Task<bool> Delete(int id);
    }
}
