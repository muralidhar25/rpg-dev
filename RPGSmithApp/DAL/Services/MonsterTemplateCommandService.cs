using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Repositories.Interfaces;

namespace DAL.Services
{
    public class MonsterTemplateCommandService : IMonsterTemplateCommandService
    {

        private readonly IRepository<MonsterTemplateCommand> _repo;
        protected readonly ApplicationDbContext _context;

        public MonsterTemplateCommandService(ApplicationDbContext context, IRepository<MonsterTemplateCommand> repo)
        {
            _context = context;
            _repo = repo;
        }

        public async  Task<bool> DeleteMonsterTemplateCommand(int id)
        {
            // return await _repo.Remove(id);
            var ac = await  _repo.Get(id);

            if (ac == null)
                return false;

            try
            {

                ac.IsDeleted = true;
                _context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public bool DeleteMonsterTemplateCommandNotAsync(int id)
        {
           // return _repo.RemoveNotAsync(id);

            var ac = _context.MonsterTemplateCommands.Find(id);

            if (ac == null)
                return false;

            try
            {
                
                ac.IsDeleted = true;
                _context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
               throw ex;
            }
        }

        public async Task<MonsterTemplateCommand> InsertMonsterTemplateCommand(MonsterTemplateCommand monsterTemplateCommand)
        {
            return await _repo.Add(monsterTemplateCommand);
        }

        public async Task<MonsterTemplateCommand> UdateMonsterTemplateCommand(MonsterTemplateCommand monsterTemplateCommand)
        {
            var ac = _context.MonsterTemplateCommands.Find(monsterTemplateCommand.MonsterTemplateCommandId);

            if (ac == null)
                return monsterTemplateCommand;
            try
            {
                ac.Command = monsterTemplateCommand.Command;
                ac.Name = monsterTemplateCommand.Name;
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return ac;
        }
    }
}
