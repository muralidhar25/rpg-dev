using DAL.Models;
using DAL.Models.RulesetTileModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.RulesetTileServices
{
   public interface IRulesetTileConfigService
    {
        List<RulesetTileConfig> GetAll();
        RulesetTileConfig Get(int id);
        Task<RulesetTileConfig> CreateAsync(RulesetTileConfig item);
        Task<RulesetTileConfig> UpdateAsync(RulesetTileConfig item);
        Task<bool> DeleteAsync(int id);
        bool alreadyExists(int id);
        void CreateList_sp(List<RulesetTileConfig> list);
        void UpdateList_sp(List<RulesetTileConfig> list);
    }
}
