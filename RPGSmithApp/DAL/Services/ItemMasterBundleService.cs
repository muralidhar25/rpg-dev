using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.SPModels;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace DAL.Services
{
    public class ItemMasterBundleService : IItemMasterBundleService
    {
        private readonly IRepository<ItemMasterBundle> _repo;
        private readonly IRepository<ItemMasterBundleItem> _repoBundleItems;
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public ItemMasterBundleService(ApplicationDbContext context, IRepository<ItemMasterBundle> repo, IRepository<ItemMasterAbility> repoMasterAbility, IRepository<ItemMasterSpell> repoMasterSpell, IConfiguration configuration)
        {
            _repo = repo;
            _context = context;
            _configuration = configuration;
        }

       
        public async Task<ItemMasterBundle> GetDuplicateItemMasterBundle(string name, int? ruleSetId, int? BundleId = 0)
        {
            if (ruleSetId > 0)
                return await _context.ItemMasterBundles.Where(x => x.BundleName.ToLower() == name.ToLower() && x.RuleSetId == ruleSetId && x.BundleId != BundleId).FirstOrDefaultAsync();
            else
                return await _context.ItemMasterBundles.Where(x => x.BundleName.ToLower() == name.ToLower()).FirstOrDefaultAsync();
        }
        public async Task<bool> CheckDuplicateItemMasterBundle(string name, int? ruleSetId, int? BundleId = 0) {
            if (ruleSetId > 0)
                return _context.ItemMasterBundles.Where(x => x.BundleName.ToLower() == name.ToLower() && x.RuleSetId == ruleSetId && x.BundleId != BundleId).FirstOrDefault() == null ? false : true;
            else
                return _context.ItemMasterBundles.Where(x => x.BundleName.ToLower() == name.ToLower()).FirstOrDefault() == null ? false : true;
        }

        public async Task<ItemMasterBundle> CreateBundle(ItemMasterBundle bundle)
        {
            await _repo.Add(bundle);
            await _repoBundleItems.AddRange(bundle.ItemMasterBundleItems);
            return bundle;
        }

        public ItemMasterBundle GetBundleById(int bundleId) {
            var bundle = _context.ItemMasterBundles
             .Include(d => d.RuleSet)
             .Include(d => d.ItemMasterBundleItems)
             .Where(d => d.BundleId == bundleId)
             .FirstOrDefault();

            if (bundle == null) return bundle;

            return bundle;
        }
        public async Task<ItemMasterBundle> UpdateBundle(ItemMasterBundle bundle, ICollection<ItemMasterBundleItem> itemMasterBundleItems)
        {
            try
            {
                bundle.ItemMasterBundleItems = new List<ItemMasterBundleItem>();

                var bundleToUpdate = _context.ItemMasterBundles.Include(x => x.ItemMasterBundleItems).Where(x => x.BundleId == bundle.BundleId).FirstOrDefault();

                if (bundleToUpdate == null)
                    return bundleToUpdate;

                bundleToUpdate.BundleName = bundle.BundleName;
                bundleToUpdate.BundleImage = bundle.BundleImage;
                bundleToUpdate.BundleVisibleDesc = bundle.BundleVisibleDesc;
                bundleToUpdate.Value = bundle.Value;
                bundleToUpdate.Volume = bundle.Volume;
                bundleToUpdate.TotalWeight = bundle.TotalWeight;
                bundleToUpdate.Metatags = bundle.Metatags;
                bundleToUpdate.Rarity = bundle.Rarity;

                _context.ItemMasterBundleItems.RemoveRange(_context.ItemMasterBundleItems.Where(x => x.BundleId == bundle.BundleId));

                foreach (var item in itemMasterBundleItems)
                {
                    item.BundleItemId = 0;
                    item.BundleId = bundle.BundleId;
                }
                _context.ItemMasterBundleItems.AddRange(itemMasterBundleItems);


                _context.SaveChanges();
                return bundleToUpdate;
            }
            catch (Exception ex)
            {
                throw ex;
            }

            
        }
        public async Task DeleteBundle(int bundleId)
        {
            await _repoBundleItems.RemoveRange(_context.ItemMasterBundleItems.Where(x => x.BundleId == bundleId));
            await _repo.Remove(bundleId);
        }

    }
}
