using DAL.Models;
using DAL.Models.CharacterTileModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.CharacterTileServices
{
   public interface INoteTileService
    {
        CharacterNoteTile GetById(int? id);
        Task<CharacterNoteTile> Create(CharacterNoteTile item);
        Task<CharacterNoteTile> Update(CharacterNoteTile item);
        Task<bool> Delete(int id);
       
    }
}
