using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
   public interface ICharacterSpellService
    {
        Task<CharacterSpell> InsertCharacterSpell(CharacterSpell characterSpell);
        Task<CharacterSpell> UpdateCharacterSpell(CharacterSpell characterSpell);
        List<CharacterSpell> GetAll();
        CharacterSpell GetById(int? id);
        List<CharacterSpell> GetByCharacterId(int characterId);
        List<CharacterSpell> GetByCharacterId(int characterId, int page, int pageSize);
        int GetCountByCharacterId(int characterId);
        Task<bool> DeleteCharacterSpell(int id);
        bool DeleteCharacterSpellNotAsync(int id);
        void ToggleMemorizedCharacterSpell(int id);
        (bool, string) CheckCharacterSpellExist(int characterId, int spellId);
        CharacterSpell GetBySpellId(int spellId);
        (List<CharacterSpell>, Character, RuleSet) SP_CharacterSpell_GetByCharacterId(int characterId, int rulesetId, int page, int pageSize, int sortType = 1);
        List<CharacterSpell> GetSpellByCharacterId(int characterId);
    }
}
