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
    public class MonsterTemplateBundleService : IMonsterTemplateBundleService
    {
        private readonly IRepository<MonsterTemplateBundle> _repo;
        private readonly IRepository<MonsterTemplateBundleItem> _repoBundleItems;
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public MonsterTemplateBundleService(ApplicationDbContext context, IRepository<MonsterTemplateBundle> repo, IRepository<MonsterTemplateAbility> repoMasterAbility, IRepository<MonsterTemplateSpell> repoMasterSpell, IConfiguration configuration)
        {
            _repo = repo;
            _context = context;
            _configuration = configuration;
        }

       
        public async Task<MonsterTemplateBundle> GetDuplicateMonsterTemplateBundle(string name, int? ruleSetId, int? BundleId = 0)
        {
            if (ruleSetId > 0)
                return await _context.MonsterTemplateBundles.Where(x => x.BundleName.ToLower() == name.ToLower() && x.RuleSetId == ruleSetId && x.BundleId != BundleId && x.IsDeleted != true).FirstOrDefaultAsync();
            else
                return await _context.MonsterTemplateBundles.Where(x => x.BundleName.ToLower() == name.ToLower() && x.IsDeleted != true).FirstOrDefaultAsync();
        }
        public async Task<bool> CheckDuplicateMonsterTemplateBundle(string name, int? ruleSetId, int? BundleId = 0) {
            if (ruleSetId > 0)
                return _context.MonsterTemplateBundles.Where(x => x.BundleName.ToLower() == name.ToLower() && x.RuleSetId == ruleSetId && x.BundleId != BundleId && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
            else
                return _context.MonsterTemplateBundles.Where(x => x.BundleName.ToLower() == name.ToLower() && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
        }

        public async Task<MonsterTemplateBundle> CreateBundle(MonsterTemplateBundle bundle, ICollection<MonsterTemplateBundleItem> MonsterTemplateBundleItems)
        {
            await _repo.Add(bundle);
            if (MonsterTemplateBundleItems.Count>0)
            {
                foreach (var item in MonsterTemplateBundleItems)
                {
                    item.BundleId = bundle.BundleId;
                    //_context.MonsterTemplateBundleItems.Add(item);
                }
                await _context.MonsterTemplateBundleItems.AddRangeAsync(MonsterTemplateBundleItems);
                _context.SaveChanges();
            }
            
            return bundle;
        }
        public async Task<MonsterTemplateBundle> Core_CreateMonsterTemplateBundle(MonsterTemplateBundle bundle, List<MonsterTemplateBundleItem> bundleItems)
        {
            bundle.ParentMonsterTemplateBundleId = bundle.BundleId;
            bundle.BundleId = 0;

            try
            {
                bundle.MonsterTemplateBundleItems = new List<MonsterTemplateBundleItem>();                
                await _repo.Add(bundle);
                int bundleId = bundle.BundleId;
                if (bundleId > 0)
                {
                    if (bundleItems != null && bundleItems.Count > 0)
                    {
                         bundleItems.ForEach(a => a.BundleId = bundleId);
                        await _context.MonsterTemplateBundleItems.AddRangeAsync(bundleItems);
                        _context.SaveChanges();
                    }
                   
                }
            }
            catch (Exception ex) { }
            return bundle;
        }

        public MonsterTemplateBundle GetBundleById(int bundleId) {
            var bundle = _context.MonsterTemplateBundles
             .Include(d => d.RuleSet)
             .Include(d => d.MonsterTemplateBundleItems)
             .Where(d => d.BundleId == bundleId && d.IsDeleted != true)
             .FirstOrDefault();

            if (bundle == null) return bundle;

            return bundle;
        }
        public async Task<MonsterTemplateBundle> UpdateBundle(MonsterTemplateBundle bundle, ICollection<MonsterTemplateBundleItem> MonsterTemplateBundleItems)
        {
            try
            {
                bundle.MonsterTemplateBundleItems = new List<MonsterTemplateBundleItem>();

                var bundleToUpdate = _context.MonsterTemplateBundles.Include(x => x.MonsterTemplateBundleItems).Where(x => x.BundleId == bundle.BundleId && x.IsDeleted != true).FirstOrDefault();

                if (bundleToUpdate == null)
                    return bundleToUpdate;

                bundleToUpdate.BundleName = bundle.BundleName;
                bundleToUpdate.BundleImage = bundle.BundleImage;
                bundleToUpdate.BundleVisibleDesc = bundle.BundleVisibleDesc;
                
                bundleToUpdate.Metatags = bundle.Metatags;
                bundleToUpdate.AddToCombat = bundle.AddToCombat;
                

                _context.MonsterTemplateBundleItems.RemoveRange(_context.MonsterTemplateBundleItems.Where(x => x.BundleId == bundle.BundleId));

                foreach (var item in MonsterTemplateBundleItems)
                {
                    item.BundleItemId = 0;
                    item.BundleId = bundle.BundleId;
                }
                _context.MonsterTemplateBundleItems.AddRange(MonsterTemplateBundleItems);


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
            _context.MonsterTemplateBundleItems.RemoveRange(_context.MonsterTemplateBundleItems.Where(x => x.BundleId == bundleId));

            MonsterTemplateBundle bundle = _context.MonsterTemplateBundles.Where(x => x.BundleId == bundleId && x.IsDeleted != true).FirstOrDefault();
            bundle.IsDeleted = true;
            //_context.MonsterTemplateBundles.Remove(_context.MonsterTemplateBundles.Where(x => x.BundleId == bundleId).FirstOrDefault());

            _context.SaveChanges();
        }
        public List<MonsterTemplateBundleItem> getItemsByBundleID(int bundleId) {
            return _context.MonsterTemplateBundleItems.Where(x => x.BundleId == bundleId).ToList();
        }
        public MonsterTemplateBundle getBundleByBundleID(int id)
        {
            MonsterTemplateBundle obj= _context.MonsterTemplateBundles.Include(x => x.MonsterTemplateBundleItems).Include(x=>x.RuleSet).Where(x => x.BundleId == id && x.IsDeleted != true).FirstOrDefault();
            if (obj.MonsterTemplateBundleItems.Count>0)
            {
                foreach (var item in obj.MonsterTemplateBundleItems)
                {
                    item.MonsterTemplate = _context.MonsterTemplates.Where(x => x.MonsterTemplateId == item.MonsterTemplateId).FirstOrDefault();
                }
            }           
            return obj;
        }
        public List<MonsterTemplateBundleItem> GetMonsterTemplateIdsFromBundles(List<MonsterTemplateBundleIds> multiMonsterTemplateBundles)
        {
            List<MonsterTemplateBundleItem> result = new List<MonsterTemplateBundleItem>();
            foreach (var item in multiMonsterTemplateBundles)
            {
                result.AddRange(_context.MonsterTemplateBundleItems.Where(x => x.BundleId == item.MonsterTemplateBundleId));
            }
            return result;
        }
    }
}
