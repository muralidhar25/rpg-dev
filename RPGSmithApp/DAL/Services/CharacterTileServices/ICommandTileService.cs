using DAL.Models;
using DAL.Models.CharacterTileModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.CharacterTileServices
{
    public interface ICommandTileService
    {
        CharacterCommandTile GetById(int? id);
        Task<CharacterCommandTile> Create(CharacterCommandTile item);
        Task<CharacterCommandTile> Update(CharacterCommandTile item);
        Task<bool> Delete(int id);
    }
}
