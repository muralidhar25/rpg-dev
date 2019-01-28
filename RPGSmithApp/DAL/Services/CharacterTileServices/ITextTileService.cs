using DAL.Models;
using DAL.Models.CharacterTileModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.CharacterTileServices
{
   public interface ITextTileService
    {
        //CharacterTextTile GetById(int? id);
        Task<CharacterTextTile> Create(CharacterTextTile item);
        Task<CharacterTextTile> Update(CharacterTextTile item);
        Task<bool> Delete(int id);
    }
}
