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
    public class LootPileService : ILootPileService
    {
        private readonly IRepository<LootPile> _repo;
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IItemMasterService _itemMasterService;

        public LootPileService(ApplicationDbContext context, IRepository<LootPile> repo, IConfiguration configuration
            , IItemMasterService itemMasterService)
        {
            _repo = repo;            
            _context = context;
            _configuration = configuration;
            _itemMasterService = itemMasterService;
        }

        public async Task<LootPile> GetDuplicateLootPile(string value, int? ruleSetId, int? lootPileId = 0)
        {            
            if (ruleSetId > 0)
                return await _context.LootPiles.Where(x => x.Name.ToLower() == value.ToLower() && x.RuleSetId == ruleSetId && x.LootPileId != lootPileId && x.IsDeleted != true).FirstOrDefaultAsync();
            else
                return await _context.LootPiles.Where(x => x.Name.ToLower() == value.ToLower() && x.IsDeleted != true).FirstOrDefaultAsync();

        }
        public async Task Create(LootPile lootPile, List<LootsToAdd> itemList) {
            try
            {
                

                string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
                DataTable Datatable_Ids = utility.ToDataTable<LootsToAdd>(itemList);
                using (SqlConnection con = new SqlConnection(consString))
                {

                    using (SqlCommand cmd = new SqlCommand("CreateLootPile"))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Connection = con;
                        cmd.Parameters.AddWithValue("@IdsToInsert", Datatable_Ids);
                        cmd.Parameters.AddWithValue("@RulesetID", lootPile.RuleSetId);
                        cmd.Parameters.AddWithValue("@Name", lootPile.Name);
                        cmd.Parameters.AddWithValue("@Description", lootPile.Description);
                        cmd.Parameters.AddWithValue("@ImageUrl", lootPile.ImageUrl);
                        cmd.Parameters.AddWithValue("@Metatags", lootPile.Metatags);
                        cmd.Parameters.AddWithValue("@Visible", lootPile.Visible);
                        con.Open();
                        try
                        {
                            var a = await cmd.ExecuteNonQueryAsync();
                        }
                        catch (Exception ex)
                        {
                            con.Close();
                            throw ex;
                        }
                        con.Close();
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
