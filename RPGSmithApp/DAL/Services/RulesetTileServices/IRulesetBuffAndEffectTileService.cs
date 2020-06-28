using DAL.Models;
using DAL.Models.RulesetTileModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.RulesetTileServices
{
   public interface IRulesetBuffAndEffectTileService
    {
        RulesetBuffAndEffectTile GetById(int? id);
        Task<RulesetBuffAndEffectTile> Create(RulesetBuffAndEffectTile item);
        Task<RulesetBuffAndEffectTile> Update(RulesetBuffAndEffectTile item);
        Task<bool> Delete(int id);
    }
}
