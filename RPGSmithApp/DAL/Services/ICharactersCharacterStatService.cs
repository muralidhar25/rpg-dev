using DAL.Models;
using DAL.Models.SPModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
   public interface ICharactersCharacterStatService
    {
        void Create(CharactersCharacterStat item);
        Task<CharactersCharacterStat> Update(CharactersCharacterStat item);
        void Update(List<CharactersCharacterStat> characterStats, bool AlertToGM, bool AlertToPlayer);
        List<CharactersCharacterStat> GetByCharacterId(int characterId, int page, int pageSize);
        List<CharactersCharacterStat> GetByCharacterId_sp(int characterId, int page = 1, int pageSize = 10, bool getResultForAddModScreen = false);
        List<CharactersCharacterStat> GetNumericStatsByCharacterId(int characterId, int page, int pageSize);
        List<CharactersCharacterStat> GetByCharacterStatId(int characterStatId, int characterId);
        List<CharacterStat> GetNumericStatsByRulesetId(int rulesetId, int page, int pageSize);
        List<CharactersCharacterStat> GetStatListByCharacterId(int characterId, int page, int pageSize);
        CharacterStatToggle GetCharacterStatToggleList(int characterStatId);
        List<LinkTypeRecord> getLinkTypeRecords(int characterId);
        Task<List<CharactersCharacterStat>> GetConditionsValuesList(int characterId);
        Task<CharactersCharacterStat> UpdateCommandImage(int id, string image);
        CharCharStatDetails getCharCharStatDetails(int characterId);
    }
}
