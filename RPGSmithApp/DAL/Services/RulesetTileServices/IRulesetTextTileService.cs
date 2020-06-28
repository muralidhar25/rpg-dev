using DAL.Models;
using DAL.Models.RulesetTileModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.RulesetTileServices
{
   public interface IRulesetTextTileService
    {
       // RulesetTextTile GetById(int? id);
        Task<RulesetTextTile> Create(RulesetTextTile item);
        Task<RulesetTextTile> Update(RulesetTextTile item);
        Task<bool> Delete(int id);
    }
}
