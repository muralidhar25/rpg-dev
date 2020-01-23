using DAL.Models;
using DAL.Models.SPModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface ILootPileTemplateService
    {
        LootTemplate GetById(int? id);
        Task<bool> CheckDuplicateLootTemplate(string value, int? ruleSetId, int? lootTemplateId = 0);
        Task<LootTemplate> Create(LootTemplate lootPile);
        List<LootTemplateRandomizationEngine> insertRandomizationEngines(List<LootTemplateRandomizationEngine> lootTemplateRandomizationEngines, int lootTemplateId);
        Task<LootTemplate> Update(LootTemplate lootTemplate, ICollection<LootTemplateRandomizationEngine> lootTemplateRandomizationEngines);
        List<LootTemplateVM> SP_GetLootTemplateByRuleSetId(int rulesetId, int page, int pageSize);
        Task<bool> Delete(int lootTemplateId);
        void DeleteMultiLootTemplates(List<LootTemplate> model, int rulesetId);
        Task<LootTemplate> GetLootTemplateById(int Id);
        Task<List<RandomizationSearch_ViewModel>> AddUpdateRandomizationSearchInfo(List<RandomizationSearch_ViewModel> RandomizationSearchInfoList, int lootTemplateId);
    }
}
