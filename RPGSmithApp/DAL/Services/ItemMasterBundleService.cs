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
                return await _context.ItemMasterBundles.Where(x => x.BundleName.ToLower() == name.ToLower() && x.RuleSetId == ruleSetId && x.BundleId != BundleId && x.IsDeleted != true).FirstOrDefaultAsync();
            else
                return await _context.ItemMasterBundles.Where(x => x.BundleName.ToLower() == name.ToLower() && x.IsDeleted != true).FirstOrDefaultAsync();
        }
        public async Task<bool> CheckDuplicateItemMasterBundle(string name, int? ruleSetId, int? BundleId = 0) {
            if (ruleSetId > 0)
                return _context.ItemMasterBundles.Where(x => x.BundleName.ToLower() == name.ToLower() && x.RuleSetId == ruleSetId && x.BundleId != BundleId && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
            else
                return _context.ItemMasterBundles.Where(x => x.BundleName.ToLower() == name.ToLower() && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
        }

        public async Task<ItemMasterBundle> CreateBundle(ItemMasterBundle bundle, ICollection<ItemMasterBundleItem> itemMasterBundleItems)
        {
            await _repo.Add(bundle);
            if (itemMasterBundleItems.Count>0)
            {
                foreach (var item in itemMasterBundleItems)
                {
                    item.BundleId = bundle.BundleId;
                    //_context.ItemMasterBundleItems.Add(item);
                }
                await _context.ItemMasterBundleItems.AddRangeAsync(itemMasterBundleItems);
                _context.SaveChanges();
            }
            
            return bundle;
        }
        public async Task<ItemMasterBundle> Core_CreateItemMasterBundle(ItemMasterBundle bundle, List<ItemMasterBundleItem> bundleItems)
        {
            bundle.ParentItemMasterBundleId = bundle.BundleId;
            bundle.BundleId = 0;

            try
            {
                bundle.ItemMasterBundleItems = new List<ItemMasterBundleItem>();                
                await _repo.Add(bundle);
                int bundleId = bundle.BundleId;
                if (bundleId > 0)
                {
                    if (bundleItems != null && bundleItems.Count > 0)
                    {
                         bundleItems.ForEach(a => a.BundleId = bundleId);
                        await _context.ItemMasterBundleItems.AddRangeAsync(bundleItems);
                        _context.SaveChanges();
                    }
                   
                }
            }
            catch (Exception ex) { }
            return bundle;
        }

        public ItemMasterBundle GetBundleById(int bundleId) {
            var bundle = _context.ItemMasterBundles
             .Include(d => d.RuleSet)
             .Include(d => d.ItemMasterBundleItems)
             .Where(d => d.BundleId == bundleId && d.IsDeleted != true)
             .FirstOrDefault();

            if (bundle == null) return bundle;

            return bundle;
        }
        public async Task<ItemMasterBundle> UpdateBundle(ItemMasterBundle bundle, ICollection<ItemMasterBundleItem> itemMasterBundleItems)
        {
            try
            {
                bundle.ItemMasterBundleItems = new List<ItemMasterBundleItem>();

                var bundleToUpdate = _context.ItemMasterBundles.Include(x => x.ItemMasterBundleItems).Where(x => x.BundleId == bundle.BundleId && x.IsDeleted != true).FirstOrDefault();

                if (bundleToUpdate == null)
                    return bundleToUpdate;

                bundleToUpdate.BundleName = bundle.BundleName;
                bundleToUpdate.BundleImage = bundle.BundleImage;
                bundleToUpdate.BundleVisibleDesc = bundle.BundleVisibleDesc;
                bundleToUpdate.gmOnly = bundle.gmOnly;
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
            _context.ItemMasterBundleItems.RemoveRange(_context.ItemMasterBundleItems.Where(x => x.BundleId == bundleId));

            ItemMasterBundle bundle = _context.ItemMasterBundles.Where(x => x.BundleId == bundleId && x.IsDeleted != true).FirstOrDefault();
            bundle.IsDeleted = true;
            //_context.ItemMasterBundles.Remove(_context.ItemMasterBundles.Where(x => x.BundleId == bundleId).FirstOrDefault());

            _context.SaveChanges();
        }
        public List<ItemMasterBundleItem> getItemsByBundleID(int bundleId) {
            return _context.ItemMasterBundleItems.Where(x => x.BundleId == bundleId).ToList();
        }
        public ItemMasterBundle getBundleByBundleID(int id)
        {
            ItemMasterBundle obj= _context.ItemMasterBundles.Include(x => x.ItemMasterBundleItems).Include(x=>x.RuleSet).Where(x => x.BundleId == id && x.IsDeleted != true).FirstOrDefault();
            if (obj.ItemMasterBundleItems.Count>0)
            {
                foreach (var item in obj.ItemMasterBundleItems)
                {
                    item.ItemMaster = _context.ItemMasters.Where(x => x.ItemMasterId == item.ItemMasterId).FirstOrDefault();
                }
            }           
            return obj;
        }
        public List<ItemMasterBundleItem> GetItemMasterIdsFromBundles(List<ItemMasterBundleIds> multiItemMasterBundles)
        {
            List<ItemMasterBundleItem> result = new List<ItemMasterBundleItem>();
            foreach (var item in multiItemMasterBundles)
            {
                result.AddRange(_context.ItemMasterBundleItems.Where(x => x.BundleId == item.ItemMasterBundleId));
            }
            return result;
        }
    }
}
