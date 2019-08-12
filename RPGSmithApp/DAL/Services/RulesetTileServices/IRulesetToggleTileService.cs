using DAL.Models;
using DAL.Models.RulesetTileModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.RulesetTileServices
{
   public interface IRulesetToggleTileService
    {
       // RulesetTextTile GetById(int? id);
        Task<RulesetToggleTile> Create(RulesetToggleTile item);
        Task<RulesetToggleTile> Update(RulesetToggleTile item);
        Task<bool> Delete(int id);
    }
}
