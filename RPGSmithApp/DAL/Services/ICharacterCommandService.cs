using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
   public interface ICharacterCommandService
    {
        CharacterCommand GetById(int? id);
        List<CharacterCommand> GetByCharacterId(int characterId);
        Task<CharacterCommand> Create(CharacterCommand item);
        Task<CharacterCommand> Update(CharacterCommand item);
        Task<bool> Delete(int id);
        Task<bool> CheckDuplicateCharacterCommand(string value, int? characterId, int? characterCommandId = 0);
        
    }
}
