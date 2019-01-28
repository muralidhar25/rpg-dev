using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface IItemMasterCommandService
    {
        Task<ItemMasterCommand> InsertItemMasterCommand(ItemMasterCommand itemMasterCommand);
        Task<ItemMasterCommand> UdateItemMasterCommand(ItemMasterCommand itemMasterCommand);
        Task<bool> DeleteItemMasterCommand(int id);
        bool DeleteItemMasterCommandNotAsync(int id);
    }
}
