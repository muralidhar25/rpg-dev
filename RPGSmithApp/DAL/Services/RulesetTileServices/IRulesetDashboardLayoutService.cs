using DAL.Models.RulesetTileModels;
using RPGSmithApp.ViewModels.EditModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.RulesetTileServices
{
   public interface IRulesetDashboardLayoutService
    {
         RulesetDashboardLayout GetById(int? id);
        Task<RulesetDashboardLayout> Create(RulesetDashboardLayout item);
        Task<RulesetDashboardLayout> Update(RulesetDashboardLayout item);
        Task<bool> Delete(int id);
        //List<RulesetDashboardLayout> GetByRulesetId(int RulesetId, int page, int pageSize);
        Task<List<RulesetDashboardLayout>> GetByRulesetId(int RulesetId, int page = -1, int pageSize = -1);
        int GetCountByRulesetId(int RulesetId);
        int GetMaximumSortOrdertByRulesetId(int? RulesetId);
        Task<bool> CheckDuplicate(string value, int? RulesetId, int? Id = 0);
        void SetDefaultPage(int Id,int PageId);
        void UpdateSortOrder(List<SortOrderEditModel> sortOrderList);
        void UpdateDefaultLayout(int layoutId);
        void UpdateDefaultLayoutPage(int layoutId, int pageId);
        int GetCountByRuleSetId(int ruleSetId);
    }
}
