using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface ICharacterStatChoiceService
    {
        Task<CharacterStatChoice> InsertCharacterStatChoice(CharacterStatChoice characterStatChoice);
        Task<CharacterStatChoice> UdateCharacterStatChoice(CharacterStatChoice characterStatChoice);
        Task<bool> DeleteCharacterStatChoice(int id);
        bool DeleteCharacterStatChoiceNotAsync(int id);
        List<CharacterStatChoice> GetByIds(string selectedIds);
        Task<bool> DeleteChoiceByStatID(int characterStatId);
    }
}
