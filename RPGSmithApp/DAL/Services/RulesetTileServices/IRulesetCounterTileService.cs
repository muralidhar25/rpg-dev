using DAL.Models;
using DAL.Models.RulesetTileModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.RulesetTileServices
{
  public  interface IRulesetCounterTileService
    {
        RulesetCounterTile GetById(int? id);
        Task<RulesetCounterTile> Create(RulesetCounterTile item);
        Task<RulesetCounterTile> Update(RulesetCounterTile item);
        Task<bool> Delete(int id);
    }
}
