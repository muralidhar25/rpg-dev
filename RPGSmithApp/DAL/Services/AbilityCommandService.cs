using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Repositories.Interfaces;

namespace DAL.Services
{
    public class AbilityCommandService : IAbilityCommandService
    {

        private readonly IRepository<AbilityCommand> _repo;
        protected readonly ApplicationDbContext _context;

        public AbilityCommandService(ApplicationDbContext context, IRepository<AbilityCommand> repo)
        {
            _context = context;
            _repo = repo;
        }

        public async  Task<bool> DeleteAbilityCommand(int id)
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

        public bool DeleteAbilityCommandNotAsync(int id)
        {
           // return _repo.RemoveNotAsync(id);

            var ac = _context.AbilityCommands.Find(id);

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

        public async Task<AbilityCommand> InsertAbilityCommand(AbilityCommand abilityCommand)
        {
            return await _repo.Add(abilityCommand);
        }

        public async Task<AbilityCommand> UdateAbilityCommand(AbilityCommand abilityCommand)
        {
            var ac = _context.AbilityCommands.Find(abilityCommand.AbilityCommandId);

            if (ac == null)
                return abilityCommand;
            try
            {
                ac.Command = abilityCommand.Command;
                ac.Name = abilityCommand.Name;
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
