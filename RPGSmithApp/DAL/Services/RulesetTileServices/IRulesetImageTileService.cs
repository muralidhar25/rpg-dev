using DAL.Models;
using DAL.Models.RulesetTileModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.RulesetTileServices
{
   public interface IRulesetImageTileService
    {
        RulesetImageTile GetById(int? id);
        Task<RulesetImageTile> Create(RulesetImageTile item);
        Task<RulesetImageTile> Update(RulesetImageTile item);
        Task<bool> Delete(int id);
    }
}
