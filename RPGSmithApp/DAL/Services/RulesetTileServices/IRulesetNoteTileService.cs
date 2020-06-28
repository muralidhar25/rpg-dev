using DAL.Models;
using DAL.Models.RulesetTileModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.RulesetTileServices
{
   public interface IRulesetNoteTileService
    {
        RulesetNoteTile GetById(int? id);
        Task<RulesetNoteTile> Create(RulesetNoteTile item);
        Task<RulesetNoteTile> Update(RulesetNoteTile item);
        Task<bool> Delete(int id);
       
    }
}
