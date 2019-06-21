using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
   public interface IMonsterTemplateCommandService
    {
        Task<MonsterTemplateCommand> InsertMonsterTemplateCommand(MonsterTemplateCommand monsterTemplateCommand);
        Task<MonsterTemplateCommand> UdateMonsterTemplateCommand(MonsterTemplateCommand monsterTemplateCommand);
        Task<bool> DeleteMonsterTemplateCommand(int id);
        bool DeleteMonsterTemplateCommandNotAsync(int id);
    }
}
