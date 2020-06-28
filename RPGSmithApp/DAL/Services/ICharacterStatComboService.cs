using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface ICharacterStatComboService
    {
        Task<CharacterStatCombo> InsertCharacterStatCombo(CharacterStatCombo characterStatCombo);
        Task<CharacterStatCombo> UpdateCharacterStatCombo(CharacterStatCombo characterStatCombo);
        Task<bool> DeleteCharacterStatCombo(int id);
        bool DeleteCharacterStatComboNotAsync(int id);
        List<CharacterStatCombo> GetByIds(string selectedIds);
    }
}
