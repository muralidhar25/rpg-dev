using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface ICharacterStatCalcService
    {
        Task<CharacterStatCalc> InsertCharacterStatCalc(CharacterStatCalc characterStatCalc);
        Task<CharacterStatCalc> UdateCharacterStatCalc(CharacterStatCalc characterStatCalc);
        Task<bool> DeleteCharacterStatCalc(int id);
        bool DeleteCharacterStatCalcNotAsync(int id);
    }
}
