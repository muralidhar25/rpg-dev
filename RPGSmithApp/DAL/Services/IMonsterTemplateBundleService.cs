using DAL.Models;
using DAL.Models.SPModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface IMonsterTemplateBundleService
    {
        Task<MonsterTemplateBundle> GetDuplicateMonsterTemplateBundle(string name, int? ruleSetId,int? BundleId = 0);
        Task<bool> CheckDuplicateMonsterTemplateBundle(string name, int? ruleSetId, int? BundleId = 0);
        Task<MonsterTemplateBundle> CreateBundle(MonsterTemplateBundle bundle, ICollection<MonsterTemplateBundleItem> MonsterTemplateBundleItems);
        MonsterTemplateBundle GetBundleById(int bundleId);
        Task<MonsterTemplateBundle> UpdateBundle(MonsterTemplateBundle bundle, ICollection<MonsterTemplateBundleItem> MonsterTemplateBundleItems);
        Task DeleteBundle(int bundleId);
        List<MonsterTemplateBundleItem> getItemsByBundleID(int bundleId);
        MonsterTemplateBundle getBundleByBundleID(int id);
        List<MonsterTemplateBundleItem> GetMonsterTemplateIdsFromBundles(List<MonsterTemplateBundleIds> multiMonsterTemplateBundles);
        Task<MonsterTemplateBundle> Core_CreateMonsterTemplateBundle(MonsterTemplateBundle bundle, List<MonsterTemplateBundleItem> bundleItems);
    }
}
