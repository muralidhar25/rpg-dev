using DAL.Models;
using DAL.Models.SPModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface ILootPileService
    {
        Task<LootPile> GetDuplicateLootPile(string value, int? ruleSetId, int? lootPileId = 0);
        Task Create(LootPile lootPile, List<LootsToAdd> itemList);
    }
}
