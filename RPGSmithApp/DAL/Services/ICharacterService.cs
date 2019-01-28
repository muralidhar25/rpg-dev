using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface ICharacterService
    {
        Character GetCharacterById(int Id);
        List<Character> GetCharacterRuleSetId(int ruleSetId);
        List<Character> GetCharacterUserId(string userId);
        Task<Character> InsertCharacter(Character CharacterDomain);
        Task<Character> UpdateCharacter(Character CharacterDomain);
        Task<Character> UpdateCharacterLastCommand(Character _character);
        Task<Character> UpdateCharacterInventoryWeight(int _characterId);
        Task<bool> IsCharacterExist(string value, string userId,int? characterId=0);
        Task<bool> DeleteCharacter(int id);
        Task<int> GetCharactersCount();
        Task<int> GetCharactersCountByUserId(string userId);
        Task<Character> UpdateLastCommand(int characterId, string lastcommand, string lastcommandresult, string lastCommandValues, int lastCommandTotal);
        int GetCharacterCountUserId(string userId);
        Task<List<Character>> GetOnlyCharactersByRulesetID(int ruleSetId);
        (List<Character>, List<RuleSet>) SP_Character_GetByUserId(string userId, int page, int pageSize);
        Character GetCharacterByIdDice(int Id);
        void Create_SP(Character characterDomain, int layoutHeight, int layoutWidth);
    }
}
