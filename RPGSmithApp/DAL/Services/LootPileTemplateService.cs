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
        private readonly ILootTemplateCurrencyService _lootTemplateCurrencyService;

        public LootPileTemplateService(ApplicationDbContext context, IRepository<LootTemplate> repo, IConfiguration configuration
            , IItemMasterService itemMasterService, ILootTemplateCurrencyService lootTemplateCurrencyService)
        {
            _repo = repo;
            _context = context;
            _configuration = configuration;
            _itemMasterService = itemMasterService;
            _lootTemplateCurrencyService = lootTemplateCurrencyService;
        }

        public LootTemplate GetById(int? id)
        {
            LootTemplate lootTemplate = _context.LootTemplates
                    .Include(d => d.RuleSet).Include(d => d.LootTemplateRandomizationEngines)
                    .Where(x => x.LootTemplateId == id && x.IsDeleted != true)
                    .FirstOrDefault();

            if (lootTemplate == null) return lootTemplate;
            else
            {
                if (lootTemplate.LootTemplateRandomizationEngines != null)
                {
                    lootTemplate.LootTemplateRandomizationEngines = lootTemplate.LootTemplateRandomizationEngines.Where(z => z.IsDeleted != true).ToList();
                    if (lootTemplate.LootTemplateRandomizationEngines.Count > 0)
                    {
                        foreach (var item in lootTemplate.LootTemplateRandomizationEngines)
                        {
                            item.ItemMaster = _context.ItemMasters.Where(x => x.ItemMasterId == item.ItemMasterId && x.IsDeleted != true).FirstOrDefault();
                        }
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
                return _context.LootTemplates.Where(x => x.Name.ToLower() == value.ToLower() && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
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

        public List<LootTemplateRandomizationEngine> insertRandomizationEngines(List<LootTemplateRandomizationEngine> lootTemplateRandomizationEngines, int lootTemplateId)
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
                lootTemplate.gmOnly = item.gmOnly;

                var mrEngineList = _context.LootTemplateRandomizationEngines.Where(x => x.LootTemplateId == item.LootTemplateId && x.IsDeleted != true).ToList();
                foreach (var MRE in mrEngineList)
                {
                    MRE.IsDeleted = true;
                }
                _context.SaveChanges();

                if (lootTemplateRandomizationEngines != null && lootTemplateRandomizationEngines.Count > 0)
                {
                    var resToDelete = _context.LootTemplateRandomizationEngines.Where(x => x.LootTemplateId== item.LootTemplateId);
                    _context.LootTemplateRandomizationEngines.RemoveRange(resToDelete);
                    _context.SaveChanges();
                    insertRandomizationEngines(lootTemplateRandomizationEngines.ToList(), item.LootTemplateId);
                }

                return lootTemplate;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<List<RandomizationSearch_ViewModel>> AddUpdateRandomizationSearchInfo(List<RandomizationSearch_ViewModel> RandomizationSearchInfoList, int lootTemplateId)
        {
            try
            {
                var ExistedSearchIds = new List<int>();
                foreach (var SearchInfo in RandomizationSearchInfoList)
                {
                    bool HasNew = true;
                    if (SearchInfo.RandomizationSearchEngineId > 0)
                    {
                        var _lootTemplateRandomizationSearchInfo = await _context.LootTemplateRandomizationSearch.Where(x => x.RandomizationSearchId == SearchInfo.RandomizationSearchEngineId && x.IsDeleted != true).FirstOrDefaultAsync();
                        if (_lootTemplateRandomizationSearchInfo != null)
                        {
                            ExistedSearchIds.Add(_lootTemplateRandomizationSearchInfo.RandomizationSearchId);
                            _lootTemplateRandomizationSearchInfo.LootTemplateId = lootTemplateId;
                            _lootTemplateRandomizationSearchInfo.Quantity = SearchInfo.Qty;
                            _lootTemplateRandomizationSearchInfo.String = SearchInfo.MatchingString;
                            _lootTemplateRandomizationSearchInfo.ItemRecord = SearchInfo.ItemRecord;
                            _lootTemplateRandomizationSearchInfo.IsAnd = SearchInfo.IsAnd;
                            _lootTemplateRandomizationSearchInfo.SortOrder = SearchInfo.SortOrder;

                            await _context.SaveChangesAsync();

                            var _randomizationSearchField = await _context.RandomizationSearchFields.Where(x => x.RandomizationSearchId == _lootTemplateRandomizationSearchInfo.RandomizationSearchId && x.IsDeleted != true).ToListAsync();
                            _context.RandomizationSearchFields.RemoveRange(_randomizationSearchField);
                            await _context.SaveChangesAsync();

                            foreach (var Field in SearchInfo.SearchFields)
                            {
                                _context.RandomizationSearchFields.Add(new RandomizationSearchFields()
                                {
                                    Name = Field.Name,
                                    RandomizationSearchId = _lootTemplateRandomizationSearchInfo.RandomizationSearchId,
                                    IsDeleted = false
                                });
                                await _context.SaveChangesAsync();
                            }
                            HasNew = false;
                        }
                    }
                    if (HasNew)
                    {
                        var _lootTemplateRandomizationSearch = new LootTemplateRandomizationSearch()
                        {
                            LootTemplateId = lootTemplateId,
                            Quantity = SearchInfo.Qty,
                            String = SearchInfo.MatchingString,
                            ItemRecord = SearchInfo.ItemRecord,
                            IsAnd = SearchInfo.IsAnd,
                            SortOrder = SearchInfo.SortOrder,
                            IsDeleted = false
                        };
                        _context.LootTemplateRandomizationSearch.Add(_lootTemplateRandomizationSearch);
                        await _context.SaveChangesAsync();

                        foreach (var Field in SearchInfo.SearchFields)
                        {
                            _context.RandomizationSearchFields.Add(new RandomizationSearchFields()
                            {
                                Name = Field.Name,
                                RandomizationSearchId = _lootTemplateRandomizationSearch.RandomizationSearchId,
                                IsDeleted = false
                            });
                            await _context.SaveChangesAsync();
                        }
                    }
                }

                //remove non-exist data while update/duplicate
                var _lootTemplateRandomizationSearchInfoList = await _context.LootTemplateRandomizationSearch.Where(x => x.LootTemplateId == lootTemplateId && x.IsDeleted != true).ToListAsync();
                var DeleteRandomizationSearch = _lootTemplateRandomizationSearchInfoList.Where(p => ExistedSearchIds.All(q => q != p.RandomizationSearchId)).ToList();
                if (DeleteRandomizationSearch.Count > 0)
                {
                    _context.LootTemplateRandomizationSearch.RemoveRange(DeleteRandomizationSearch);
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {

            }
            return RandomizationSearchInfoList;
        }
        
        public List<LootTemplateVM> SP_GetLootTemplateByRuleSetId(int rulesetId, int page, int pageSize)
        {

            List<LootTemplateVM> _lootTemplateList = new List<LootTemplateVM>();
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
                    LootTemplateVM _LootTemplate = new LootTemplateVM();
                    _LootTemplate.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    _LootTemplate.Metatags = row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString();
                    _LootTemplate.Description = row["Description"] == DBNull.Value ? null : row["Description"].ToString();
                    _LootTemplate.gmOnly = row["gmOnly"] == DBNull.Value ? null : row["gmOnly"].ToString();
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
                    _LootTemplate.LootTemplateRandomizationSearch = _context.LootTemplateRandomizationSearch
                        .Where(search => search.LootTemplateId == _LootTemplate.LootTemplateId)
                        .Select(search => new LootTemplateRandomizationSearch
                        {
                            LootTemplateId = search.LootTemplateId,
                            Quantity = search.Quantity,
                            String = search.String,
                            ItemRecord = search.ItemRecord,
                            IsAnd = search.IsAnd,
                            SortOrder = search.SortOrder,
                            IsDeleted = false,
                            RandomizationSearchId = search.RandomizationSearchId,
                            Fields = _context.RandomizationSearchFields.Where(t => t.RandomizationSearchId == search.RandomizationSearchId).ToList()
                        }).ToListAsync().Result;


                    //_LootTemplate.LootTemplateRandomizationSearch =_context.LootTemplateRandomizationSearch.Include(y => y.Fields).Where(x => x.LootTemplateId == _LootTemplate.LootTemplateId).ToListAsync().Result;
                    _LootTemplate.LootTemplateCurrency = this._lootTemplateCurrencyService.GetByLootTemplateId(_LootTemplate.LootTemplateId).Result;

                    _lootTemplateList.Add(_LootTemplate);
                }
            }
            return _lootTemplateList;
        }

        public async Task<bool> Delete(int lootTemplateId) {            

            // Remove deployed Monsters
            var m = _context.LootTemplateRandomizationEngines.Where(x => x.LootTemplateId == lootTemplateId && x.IsDeleted != true).ToList();
            foreach (LootTemplateRandomizationEngine item in m)
            {
                item.IsDeleted = true;
            }

            // Remove deployed Monsters
            var SearchInfo = _context.LootTemplateRandomizationSearch.Where(x => x.LootTemplateId == lootTemplateId && x.IsDeleted != true).ToList();
            foreach (var item in SearchInfo)
            {
                item.IsDeleted = true;
            }

            // Remove Monster Template
            var lootTemplate = await _context.LootTemplates.Where(x => x.LootTemplateId == lootTemplateId && x.IsDeleted != true).FirstOrDefaultAsync();

            if (lootTemplate == null)
                return false;

            lootTemplate.IsDeleted = true;

            try
            {
                _context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public void DeleteMultiLootTemplates(List<LootTemplate> model, int rulesetId)
        {

            int index = 0;
            List<numbersList> dtList = model.Select(x => new numbersList()
            {
                RowNum = index = Getindex(index),
                Number = x.LootTemplateId
            }).ToList();


            DataTable DT_List = new DataTable();

            if (dtList.Count > 0)
            {
                DT_List = utility.ToDataTable<numbersList>(dtList);
            }


            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            int rowseffectesd = 0;
            SqlConnection con = new SqlConnection(connectionString);
            con.Open();
            SqlCommand cmd = new SqlCommand("Ruleset_DeleteMultiLootTemplates", con);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@RecordIdsList", DT_List);
            cmd.Parameters.AddWithValue("@RulesetID", rulesetId);

            rowseffectesd = cmd.ExecuteNonQuery();
            con.Close();
        }
        private static int Getindex(int index)
        {
            index = index + 1;
            return index;
        }

        public async Task<LootTemplate> GetLootTemplateById(int Id)
        {
            return _context.LootTemplates.Where(x => x.LootTemplateId == Id && x.IsDeleted != true)
                    .FirstOrDefault();
        }

    }
}
