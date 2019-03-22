using DAL.Models;
using DAL.Models.SPModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface IItemMasterBundleService
    {
        Task<ItemMasterBundle> GetDuplicateItemMasterBundle(string name, int? ruleSetId,int? BundleId = 0);
        Task<bool> CheckDuplicateItemMasterBundle(string name, int? ruleSetId, int? BundleId = 0);
        Task<ItemMasterBundle> CreateBundle(ItemMasterBundle bundle);
        ItemMasterBundle GetBundleById(int bundleId);
        Task<ItemMasterBundle> UpdateBundle(ItemMasterBundle bundle, ICollection<ItemMasterBundleItem> itemMasterBundleItems);
        Task DeleteBundle(int bundleId);
    }
}
