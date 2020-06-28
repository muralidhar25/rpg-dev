using DAL.Models;
using DAL.Models.CharacterTileModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.CharacterTileServices
{
  public  interface ICounterTileService
    {
        CharacterCounterTile GetById(int? id);
        Task<CharacterCounterTile> Create(CharacterCounterTile item);
        Task<CharacterCounterTile> Update(CharacterCounterTile item);
        Task<bool> Delete(int id);
    }
}
