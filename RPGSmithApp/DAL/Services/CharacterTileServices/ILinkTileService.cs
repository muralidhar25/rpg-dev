using DAL.Models;
using DAL.Models.CharacterTileModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.CharacterTileServices
{
   public interface ILinkTileService
    {
        CharacterLinkTile GetById(int? id);
        Task<CharacterLinkTile> Create(CharacterLinkTile item);
        Task<CharacterLinkTile> Update(CharacterLinkTile item);
        Task<bool> Delete(int id);
    }
}
