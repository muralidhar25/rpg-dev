using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
   public interface IAbilityCommandService
    {
        Task<AbilityCommand> InsertAbilityCommand(AbilityCommand abilityCommand);
        Task<AbilityCommand> UdateAbilityCommand(AbilityCommand abilityCommand);
        Task<bool> DeleteAbilityCommand(int id);
        bool DeleteAbilityCommandNotAsync(int id);
    }
}
