using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface ICharacterStatToggleService
    {
        Task<CharacterStatToggle> InsertCharacterStatToggle(CharacterStatToggle characterStatToggle);
        Task<CharacterStatToggle> UpdateCharacterStatToggle(CharacterStatToggle characterStatToggle);
        Task<bool> DeleteCharacterStatToggle(int id);
        bool DeleteCharacterStatToggleNotAsync(int id);
        List<CharacterStatToggle> GetByIds(string selectedIds);
    }
}
