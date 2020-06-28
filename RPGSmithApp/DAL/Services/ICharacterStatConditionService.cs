using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface ICharacterStatConditionService
    {
        Task<List<CharacterStatCondition>> InsertCharacterStatCondition(List<CharacterStatCondition> characterStatConditionList, int CharacterStatId);
        Task<bool> DeleteCharacterStatCondition(int StatId);
        Task<List<CharacterStatCondition>> GetByStatId(int StatId);
        Task<List<ConditionOperator>> GetConditionOperators();
        ConditionOperator GetConditionOperatorById(int? conditionOperatorId);
    }
}
