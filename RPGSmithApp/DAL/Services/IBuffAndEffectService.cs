using DAL.Models;
using DAL.Models.SPModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface IBuffAndEffectService
    {
        Task<BuffAndEffect> Create(BuffAndEffect item);
        Task<BuffAndEffect> Update(BuffAndEffect item);
        Task<bool> Delete(int id);
        BuffAndEffect GetById(int? id);
        int GetCountByRuleSetId(int ruleSetId);
        int Core_GetCountByRuleSetId(int ruleSetId, int parentID);
        Task<bool> CheckDuplicateBuffAndEffect(string value, int? ruleSetId, int? buffAndEffectId = 0);
        bool Core_BuffAndEffectWithParentIDExists(int buffAndEffectId, int RulesetID);
        List<BuffAndEffectVM> SP_GetBuffAndEffectByRuleSetId(int rulesetId, int page, int pageSize);
        List<BuffAndEffectCommand> SP_GetBuffAndEffectCommands(int buffAndEffectId);
        Task<BuffAndEffect> Core_CreateBuffAndEffect(BuffAndEffect BuffAndEffect);
        List<BuffAndEffect> GetByRuleSetId_add(int rulesetId);
        Task SP_AssignBuffAndEffectToCharacter(List<BuffAndEffect> buffsList, List<Character> characters, List<Character> nonSelectedCharacters, List<BuffAndEffect> nonSelectedBuffAndEffectsList, int CharacterID);
        Task<List<CharBuffAndEffect>> getBuffAndEffectAssignedToCharacter(int characterID);
        Task<CharacterBuffAndEffect> GetCharacterBuffAndEffectById(int CharacterBuffAndEffectID);

        //List<BuffAndEffect> GetBuffAndEffectsByRuleSetId(int ruleSetId);

        //List<BuffAndEffect> Core_GetBuffAndEffectByRuleSetId(int ruleSetId, int parentID);


    }
}
