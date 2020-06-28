using DAL.Models;
using DAL.Models.RulesetTileModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.RulesetTileServices
{
   public interface IRulesetCharacterStatTileService
    {
        RulesetCharacterStatTile GetById(int? id);
        Task<RulesetCharacterStatTile> Create(RulesetCharacterStatTile item);
        Task<RulesetCharacterStatTile> Update(RulesetCharacterStatTile item);
        Task<bool> Delete(int id);
    }
}
