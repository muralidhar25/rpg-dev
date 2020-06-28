using DAL.Models;
using DAL.Models.RulesetTileModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.RulesetTileServices
{
    public interface IRulesetTileColorService
    {
        Task<RulesetTileColor> Create(RulesetTileColor color);
        Task<RulesetTileColor> Update(RulesetTileColor color);
        Task<bool> Delete(int id);
        RulesetTileColor GetById(int id);
        RulesetTileColor GetByRulesetTileId(int RulesetTileId);
        List<RulesetTileColor> GetByUserId(string userId);
        List<RPGCoreColor> getRPGCoreColors();
    }
}
