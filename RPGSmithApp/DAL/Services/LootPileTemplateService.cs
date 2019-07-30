using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.SPModels;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace DAL.Services
{
    public class LootPileTemplateService : ILootPileTemplateService
    {
        private readonly IRepository<LootTemplate> _repo;
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IItemMasterService _itemMasterService;

        public LootPileTemplateService(ApplicationDbContext context, IRepository<LootTemplate> repo, IConfiguration configuration
            , IItemMasterService itemMasterService)
        {
            _repo = repo;
            _context = context;
            _configuration = configuration;
            _itemMasterService = itemMasterService;
        }

        public LootTemplate GetById(int? id) {
            LootTemplate lootTemplate = _context.LootTemplates
                    .Include(d => d.RuleSet)                    
                    .Where(x => x.LootTemplateId == id && x.IsDeleted != true)

                    .FirstOrDefault();

                if (lootTemplate == null) return lootTemplate;
               
                return lootTemplate;
            
        }

        public async Task<bool> CheckDuplicateLootTemplate(string value, int? ruleSetId, int? lootTemplateId = 0)
        {
           
            if (ruleSetId > 0)
            {
                return _context.LootTemplates.Where(x => x.Name.ToLower() == value.ToLower() && x.RuleSetId == ruleSetId && x.LootTemplateId != lootTemplateId && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
            }
            else
                return _context.LootTemplates.Where(x => x.Name.ToLower() == value.ToLower()).FirstOrDefault() == null ? false : true;
        }
        public async Task<LootTemplate> Create(LootTemplate lootPile)
        {
            try
            {
                lootPile.LootTemplateRandomizationEngines = new List<LootTemplateRandomizationEngine>();
                return await _repo.Add(lootPile);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public List<LootTemplateRandomizationEngine> insertRandomizationEngines(
            List<LootTemplateRandomizationEngine> lootTemplateRandomizationEngines, 
            int lootTemplateId
            )
        {
            try
            {
                foreach (var Ritem in lootTemplateRandomizationEngines)
                {
                    if (Ritem.ItemMasterId != 0)
                    {
                        Ritem.RandomizationEngineId = 0;
                        Ritem.LootTemplateId = lootTemplateId;
                        _context.LootTemplateRandomizationEngines.Add(Ritem);
                    }

                }
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
            }
            return lootTemplateRandomizationEngines;
        }
        public async Task<LootTemplate> Update(LootTemplate item, ICollection<LootTemplateRandomizationEngine> lootTemplateRandomizationEngines)
        {
            try
            {
                var lootTemplate = _context.LootTemplates.FirstOrDefault(x => x.LootTemplateId == item.LootTemplateId);

                if (lootTemplate == null)
                    return lootTemplate;

                lootTemplate.Name = item.Name;
                lootTemplate.ImageUrl = item.ImageUrl;
                lootTemplate.Metatags = item.Metatags;
                lootTemplate.Description = item.Description;

                var mrEngineList = _context.LootTemplateRandomizationEngines.Where(x => x.LootTemplateId == item.LootTemplateId && x.IsDeleted != true).ToList();
                foreach (var MRE in mrEngineList)
                {
                    MRE.IsDeleted = true;
                }
                _context.SaveChanges();

                if (lootTemplateRandomizationEngines != null && lootTemplateRandomizationEngines.Count > 0)
                {
                    insertRandomizationEngines(lootTemplateRandomizationEngines.ToList(), item.LootTemplateId);
                }

                return lootTemplate;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
