using DAL.Models;
using DAL.Models.RulesetTileModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.RulesetTileServices
{
    public interface IRulesetCommandTileService
    {
        RulesetCommandTile GetById(int? id);
        Task<RulesetCommandTile> Create(RulesetCommandTile item);
        Task<RulesetCommandTile> Update(RulesetCommandTile item);
        Task<bool> Delete(int id);
    }
}
