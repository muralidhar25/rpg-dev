using DAL.Models;
using DAL.Models.CharacterTileModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.CharacterTileServices
{
   public interface ICurrencyTileService
    {
        CharacterCurrencyTypeTile GetById(int? id);
        Task<CharacterCurrencyTypeTile> Create(CharacterCurrencyTypeTile item);
        Task<CharacterCurrencyTypeTile> Update(CharacterCurrencyTypeTile item);
        Task<bool> Delete(int id);
    }
}
