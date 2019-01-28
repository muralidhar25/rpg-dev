using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface IItemCommandService
    {
        Task<ItemCommand> InsertItemCommand(ItemCommand ItemCommand);
        Task<ItemCommand> UpdateItemCommand(ItemCommand ItemCommand);
        Task<bool> DeleteItemCommand(int id);
        bool DeleteItemCommandNotAsync(int id);
        Task<bool> DeleteItemCommandByItemId(int ItemId);
    }
}
