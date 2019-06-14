using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
   public interface IBuffAndEffectCommandService
    {
        Task<BuffAndEffectCommand> InsertBuffAndEffectCommand(BuffAndEffectCommand abilityCommand);
        Task<BuffAndEffectCommand> UdateBuffAndEffectCommand(BuffAndEffectCommand abilityCommand);
        Task<bool> DeleteBuffAndEffectCommand(int id);
        bool DeleteBuffAndEffectCommandNotAsync(int id);
    }
}
