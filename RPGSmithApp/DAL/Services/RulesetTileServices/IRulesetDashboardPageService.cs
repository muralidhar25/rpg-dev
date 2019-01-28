using DAL.Models.RulesetTileModels;
using RPGSmithApp.ViewModels.EditModels;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DAL.Services.RulesetTileServices
{
   public interface IRulesetDashboardPageService
    {
        RulesetDashboardPage GetById(int? id);
        Task<RulesetDashboardPage> Create(RulesetDashboardPage item);
        Task<RulesetDashboardPage> Update(RulesetDashboardPage item);
        Task<bool> Delete(int id);
        List<RulesetDashboardPage> GetByRulesetId(int RulesetId);
        List<RulesetDashboardPage> GetByLayoutId(int layoutId, int page = 1, int pageSize = 10);
        int GetCountByRulesetId(int RulesetId);
        int GetCountByLayoutId(int RulesetId);
        int GetMaximumSortOrdertByLayoutId(int? layoutId);
        Task<bool> CheckDuplicate(string value, int? RulesetId, int? layoutId, int? Id = 0);
        void UpdateSortOrder(List<SortOrderEditModel> sortOrderList);
        List<RulesetDashboardPage> GetPagesByLayoutId(int layoutId);
    }
}
