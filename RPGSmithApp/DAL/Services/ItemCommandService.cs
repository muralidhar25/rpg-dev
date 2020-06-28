using DAL.Models;
using DAL.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public class ItemCommandService : IItemCommandService
    {
        private readonly IRepository<ItemCommand> _repo;
        protected readonly ApplicationDbContext _context;

        public ItemCommandService(ApplicationDbContext context, IRepository<ItemCommand> repo)
        {
            _context = context;
            _repo = repo;
        }

        public async Task<ItemCommand> InsertItemCommand(ItemCommand ItemCommand)
        {
            return await _repo.Add(ItemCommand);
        }

        public async Task<ItemCommand> UpdateItemCommand(ItemCommand ItemCommand)
        {
            var imc = _context.ItemCommands.Find(ItemCommand.ItemCommandId);

            if (imc == null)
                return ItemCommand;
            try
            {
                imc.Command = ItemCommand.Command;
                imc.Name = ItemCommand.Name;
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return imc;
           
        }

        public async Task<bool> DeleteItemCommand(int id)
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

        public async Task<bool> DeleteItemCommandByItemId(int ItemId)
        {
            var itemCmd = _context.ItemCommands.Where(w => w.ItemId == ItemId).ToList();
            _context.ItemCommands.RemoveRange(itemCmd);
            _context.SaveChanges();
            return true;
        }

        public bool DeleteItemCommandNotAsync(int id)
        {
            var imc = _context.ItemCommands.SingleOrDefault(p => p.ItemCommandId == id);

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
