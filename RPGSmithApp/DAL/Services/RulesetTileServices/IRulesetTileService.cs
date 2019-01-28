using DAL.Models.RulesetTileModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.RulesetTileServices
{
    public interface IRulesetTileService
    {
        RulesetTile GetById(int? id);
        Task<RulesetTile> Create(RulesetTile item);
        Task<RulesetTile> Update(RulesetTile item);
        Task<bool> Delete(int id);
        List<RulesetTile> GetByPageIdRulesetId(int pageId, int RulesetId);
        int GetCountByPageIdRulesetId(int pageId, int RulesetId);
        Task<RulesetTile> UpdateSortOrder(int id, int sortOrder);
        void BGProcess(int _rulesetId, string userId);
        IEnumerable<RulesetTile> GetByPageIdRulesetId_sp(int pageId, int rulesetId);
    }
}
