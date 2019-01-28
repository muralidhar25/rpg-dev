using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface ICharacterStatDefaultValueService
    {
        Task<CharacterStatDefaultValue> InsertCharacterStatDefaultValue(CharacterStatDefaultValue characterStatCombo);
        Task<CharacterStatDefaultValue> UpdateCharacterStatDefaultValue(CharacterStatDefaultValue characterStatCombo);
        Task<bool> DeleteCharacterStatDefaultValue(int Statid);
        Task<List<CharacterStatDefaultValue>> GetCharacterStatDefaultValue(int Statid);
    }
}
