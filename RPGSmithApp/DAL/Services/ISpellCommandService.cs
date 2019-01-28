using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
   public interface ISpellCommandService
    {
        Task<SpellCommand> InsertSpellCommand(SpellCommand spellCommand);
        Task<SpellCommand> UdateSpellCommand(SpellCommand spellCommand);
        Task<bool> DeleteSpellCommand(int id);
        bool DeleteSpellCommandNotAsync(int id);
    }
}
