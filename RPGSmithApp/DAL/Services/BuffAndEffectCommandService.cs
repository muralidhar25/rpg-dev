using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Repositories.Interfaces;

namespace DAL.Services
{
    public class BuffAndEffectCommandService : IBuffAndEffectCommandService
    {

        private readonly IRepository<BuffAndEffectCommand> _repo;
        protected readonly ApplicationDbContext _context;

        public BuffAndEffectCommandService(ApplicationDbContext context, IRepository<BuffAndEffectCommand> repo)
        {
            _context = context;
            _repo = repo;
        }

        public async  Task<bool> DeleteBuffAndEffectCommand(int id)
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

        public bool DeleteBuffAndEffectCommandNotAsync(int id)
        {
           // return _repo.RemoveNotAsync(id);

            var ac = _context.BuffAndEffectCommands.Find(id);

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

        public async Task<BuffAndEffectCommand> InsertBuffAndEffectCommand(BuffAndEffectCommand buffAndEffectCommand)
        {
            _context.BuffAndEffectCommands.Add(buffAndEffectCommand);
            _context.SaveChanges();
            return buffAndEffectCommand;
        }

        public async Task<BuffAndEffectCommand> UdateBuffAndEffectCommand(BuffAndEffectCommand buffAndEffectCommand)
        {
            var ac = _context.BuffAndEffectCommands.Find(buffAndEffectCommand.BuffAndEffectCommandId);

            if (ac == null)
                return buffAndEffectCommand;
            try
            {
                ac.Command = buffAndEffectCommand.Command;
                ac.Name = buffAndEffectCommand.Name;
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
