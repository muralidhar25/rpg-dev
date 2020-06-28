using DAL.Models;
using DAL.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
  public  class SpellCommandService : ISpellCommandService
    {
        private readonly IRepository<SpellCommand> _repo;
        protected readonly ApplicationDbContext _context;

        public SpellCommandService(ApplicationDbContext context, IRepository<SpellCommand> repo)
        {
            _context = context;
            _repo = repo;
        }

        public async Task<SpellCommand> InsertSpellCommand(SpellCommand spellCommand)
        {
            return await _repo.Add(spellCommand);
        }

        public async Task<SpellCommand> UdateSpellCommand(SpellCommand spellCommand)
        {
            var sc = _context.SpellCommands.Find(spellCommand.SpellCommandId);

            if (sc == null)
                return spellCommand;
            try
            {
                sc.Command = spellCommand.Command;
                sc.Name = spellCommand.Name;
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return sc;

        }

        public async Task<bool> DeleteSpellCommand(int id)
        {
          
            var sc = await _repo.Get(id);

            if (sc == null)
                return false;

            try
            {

                sc.IsDeleted = true;
                var spellcommand = await _repo.Update(sc);
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public bool DeleteSpellCommandNotAsync(int id)
        {

            var sc = _context.SpellCommands.Find(id);

            if (sc == null)
                return false;

            try
            {

                sc.IsDeleted = true;
                _context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
