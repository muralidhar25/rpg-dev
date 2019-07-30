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
                    .Include(d => d.RuleSet).Include(d=>d.LootTemplateRandomizationEngines)            
                    .Where(x => x.LootTemplateId == id && x.IsDeleted != true)
                    .FirstOrDefault();

            if (lootTemplate == null) return lootTemplate;
            else
            {
                if (lootTemplate.LootTemplateRandomizationEngines.Count>0)
                {
                    foreach (var item in lootTemplate.LootTemplateRandomizationEngines)
                    {
                        item.ItemMaster = _context.ItemMasters.Where(x=>x.ItemMasterId== item.ItemMasterId).FirstOrDefault();
                    }
                }
            }
               
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
        public List<LootTemplate> SP_GetLootTemplateByRuleSetId(int rulesetId, int page, int pageSize)
        {

            List<LootTemplate> _lootTemplateList = new List<LootTemplate>();
            RuleSet ruleset = new RuleSet();

            short num = 0;
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("LootTemplate_GetByRulesetID", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@RulesetID", rulesetId);
                command.Parameters.AddWithValue("@page", page);
                command.Parameters.AddWithValue("@size", pageSize);
                command.CommandType = CommandType.StoredProcedure;

                adapter.SelectCommand = command;

                adapter.Fill(ds);
                command.Dispose();
                connection.Close();
            }
            catch (Exception ex)
            {
                command.Dispose();
                connection.Close();
            }



            if (ds.Tables[1].Rows.Count > 0)
                ruleset = _repo.GetRuleset(ds.Tables[1], num);

            if (ds.Tables[0].Rows.Count > 0)
            {

                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    LootTemplate _LootTemplate = new LootTemplate();
                    _LootTemplate.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    _LootTemplate.Metatags = row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString();
                    _LootTemplate.Description = row["Description"] == DBNull.Value ? null : row["Description"].ToString();
                    _LootTemplate.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();
                    _LootTemplate.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                    _LootTemplate.LootTemplateId = row["LootTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["LootTemplateId"].ToString());
                    _LootTemplate.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString());
                    _LootTemplate.RuleSet = ruleset;

                    _LootTemplate.LootTemplateRandomizationEngines = new List<LootTemplateRandomizationEngine>();
                    if (ds.Tables[2].Rows.Count > 0)
                    {
                        foreach (DataRow RErow in ds.Tables[2].Rows)
                        {
                            int LT_ID = RErow["LootTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["LootTemplateId"]);
                            if (LT_ID == _LootTemplate.LootTemplateId)
                            {
                                LootTemplateRandomizationEngine RE = new LootTemplateRandomizationEngine();
                                RE.RandomizationEngineId = RErow["RandomizationEngineId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["RandomizationEngineId"]);
                                RE.Qty = RErow["Qty"] == DBNull.Value ? string.Empty : RErow["Qty"].ToString();
                                RE.Percentage = RErow["Percentage"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["Percentage"]);
                                RE.SortOrder = RErow["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["SortOrder"]);
                                RE.ItemMasterId = RErow["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["ItemMasterId"]);
                                RE.IsOr = RErow["IsOr"] == DBNull.Value ? false : Convert.ToBoolean(RErow["IsOr"]);
                                RE.IsDeleted = RErow["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(RErow["IsDeleted"]);
                                RE.LootTemplateId = LT_ID;
                                RE.ItemMaster = new ItemMaster()
                                {
                                    ItemMasterId = RErow["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["ItemMasterId"]),
                                    ItemName = RErow["ItemName"] == DBNull.Value ? null : RErow["ItemName"].ToString(),
                                    ItemImage = RErow["ItemImage"] == DBNull.Value ? null : RErow["ItemImage"].ToString()
                                };
                                _LootTemplate.LootTemplateRandomizationEngines.Add(RE);
                            }
                        }
                    }

                    _lootTemplateList.Add(_LootTemplate);
                }
            }
            return _lootTemplateList;

        }
    }
}
