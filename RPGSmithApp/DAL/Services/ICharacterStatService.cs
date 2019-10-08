using DAL.Models;
using DAL.Models.SPModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface ICharacterStatService
    {
        CharacterStat GetCharacterStatById(int Id);
        List<CharacterStat> GetCharacterStatRuleSetId(int Id);
        Task<CharacterStat> InsertCharacterStat(CharacterStat CharacterStatDomain);
        Task<CharacterStat> UdateCharacterStat(CharacterStat CharacterStatDomain);
        Task<bool> CheckDuplicateCharacterStat(string value, int Id, int? ruleSetId);
        Task<bool> DeleteCharacterStat(int id,bool IsChildRulesetCharacterStatDeleted=false);
        bool DeleteCharacterStatNotAsync(int id);
        Task<List<CharacterStat>> GetAllCharacterStats();
        Task<int> GetCharacterStatsCount();
        Task<bool> UpdateCharacterStatOrder(List<CharacterStat> characterStats);
        int GetCountByRuleSetId(int? ruleSetId);
        int Core_GetCountByRuleSetId(int? ruleSetId, int? parentID);
        List<CharacterStat> Core_GetCharacterStatRuleSetId(int Id, int parentID);
        bool Core_CharacterStatWithParentIDExists(int abilityId, int rulesetID);
        Task<CharacterStat> Core_CharacterStat(CharacterStat characterStat);
        List<CharacterStat> SP_GetCharacterStatByRuleSetId(int rulesetId);
        bool CheckDuplicateCharacterStat_sp(string statName, int characterStatId, int? ruleSetId);
        Task SaveLogStat(LogStatUpdate model);
        Task<bool> DeleteLogStat(int id);
        Task<List<LogStatUpdate>> GetStatNotificationForGM(int rulesetId);
        Task<List<LogStatUpdate>> GetStatNotificationForPlayer(int characterId);
        Task DeleteNotification(List<CommonID> ids);
    }
}
