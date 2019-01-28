using DAL.Models;
using DAL.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public class ItemMasterCommandService : IItemMasterCommandService
    {
        private readonly IRepository<ItemMasterCommand> _repo;
        protected readonly ApplicationDbContext _context;

        public ItemMasterCommandService(ApplicationDbContext context, IRepository<ItemMasterCommand> repo)
        {
            _context = context;
            _repo = repo;
        }

        public async Task<ItemMasterCommand> InsertItemMasterCommand(ItemMasterCommand itemMasterCommand)
        {
            return await _repo.Add(itemMasterCommand);
        }

        public async Task<ItemMasterCommand> UdateItemMasterCommand(ItemMasterCommand itemMasterCommand)
        {
            var imc = _context.ItemMasterCommands.Find(itemMasterCommand.ItemMasterCommandId);

            if (imc == null)
                return itemMasterCommand;
            try
            {
                imc.Command = itemMasterCommand.Command;
                imc.Name = itemMasterCommand.Name;
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return imc;
           
        }

        public async Task<bool> DeleteItemMasterCommand(int id)
        {
            var imc = await _repo.Get(id);

            if (imc == null)
                return false;

            imc.IsDeleted = true;

            try
            {
                _context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public bool DeleteItemMasterCommandNotAsync(int id)
        {
            var imc = _context.ItemMasterCommands.SingleOrDefault(p => p.ItemMasterCommandId == id);

            if (imc == null)
                return false;

            imc.IsDeleted = true;

            try
            {
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
