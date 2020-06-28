using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Models.RulesetTileModels;
using DAL.Models.SPModels;
using DAL.Repositories.Interfaces;
using Microsoft.Extensions.Configuration;

namespace DAL.Services.RulesetTileServices
{
    public class RulesetTileConfigService : IRulesetTileConfigService
    {
        private readonly IRepository<RulesetTileConfig> _repo;
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        public RulesetTileConfigService(ApplicationDbContext context, IRepository<RulesetTileConfig> repo, IConfiguration configuration)
        {
            _repo = repo;
            _context = context;
            _configuration = configuration;
        }
        public async Task<RulesetTileConfig> CreateAsync(RulesetTileConfig item)
        {
            try
            {
                await _context.RulesetTileConfig.AddAsync(item);
                await _context.SaveChangesAsync();
                return  item;
            }
            catch (Exception ex)
            {
                return await _repo.Add(item);
            }
        }
        public async Task<bool> DeleteAsync(int id)
        {           
            try
            {
                var rec = Get(id);
                await _repo.Remove(rec.TileConfigId);
                return true;
            }
            catch (Exception ex)
            {
                throw ex;

            }
        }
        public async Task<RulesetTileConfig> UpdateAsync(RulesetTileConfig item)
        {
            var TileConfig = _context.RulesetTileConfig.Where(q => q.RulesetTileId == item.RulesetTileId).FirstOrDefault();
            if (TileConfig == null)
            {
                return await _repo.Add(item);
            }
            TileConfig.Col = item.Col;
            TileConfig.Row = item.Row;
            TileConfig.SizeX = item.SizeX;
            TileConfig.SizeY = item.SizeY;
            try
            {
                await _repo.Update(TileConfig);
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return TileConfig;
        }
        public RulesetTileConfig Get(int id)
        {
            return _context.RulesetTileConfig.Where(q => q.RulesetTileId == id).FirstOrDefault();
        }
        public bool alreadyExists(int id)
        {
            var rec = _context.TileConfig.Where(q => q.CharacterTileId == id).FirstOrDefault();
            if (rec == null)
            {
                return false;
            }
            return true;
        }
        public List<RulesetTileConfig> GetAll()
        {
            return _context.RulesetTileConfig.ToList();
        }
        public void CreateList_sp(List<RulesetTileConfig> list)
        {
            int index = 0;
            List<CommonTileConfig> dtList = list.Select(o => new CommonTileConfig()
            {
                RowNum = index = Getindex(index),
                Col = o.Col,
                Row = o.Row,
                TileId = o.RulesetTileId,
                Payload = o.Payload,
                SizeX = o.SizeX,
                SizeY = o.SizeY,
                SortOrder = o.SortOrder,
                UniqueId = o.UniqueId,
                IsDeleted = false
            }).ToList();
            DataTable dt = utility.ToDataTable<CommonTileConfig>(dtList);

            if (dt.Rows.Count > 0)
            {
                string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

                using (SqlConnection con = new SqlConnection(consString))
                {
                    using (SqlCommand cmd = new SqlCommand("Ruleset_CreateTiles"))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Connection = con;
                        cmd.Parameters.AddWithValue("@tileConfigs", dt);
                        con.Open();
                        var a = cmd.ExecuteNonQuery();
                        con.Close();
                    }
                }
                //using (SqlConnection con = new SqlConnection(consString))
                //{
                //    SqlCommand cmd = new SqlCommand();
                //    SqlDataAdapter da = new SqlDataAdapter();
                //    //DataTable dt = new DataTable();
                //    try
                //    {
                //        con.Open();
                //        cmd = new SqlCommand("Ruleset_CreateTiles", con);
                //        cmd.Parameters.Add(new SqlParameter("@tileConfigs", dt));
                //        cmd.CommandType = CommandType.StoredProcedure;
                //        da.SelectCommand = cmd;
                //        da.Fill(dt);

                //        //dataGridView1.DataSource = dt;
                //    }
                //    catch (Exception x)
                //    {

                //    }
                //    finally
                //    {
                //        cmd.Dispose();
                //        con.Close();
                //    }
                //}
            }
        }
        public void UpdateList_sp(List<RulesetTileConfig> list)
        {
            int index = 0;
            List<CommonTileConfig> dtList = list.Select(o => new CommonTileConfig()
            {
                RowNum = index = Getindex(index),
                Col = o.Col,
                Row = o.Row,
                TileId = o.RulesetTileId,
                Payload = o.Payload,
                SizeX = o.SizeX,
                SizeY = o.SizeY,
                SortOrder = o.SortOrder,
                UniqueId = o.UniqueId,
                IsDeleted = false
            }).ToList();
            DataTable dt = utility.ToDataTable<CommonTileConfig>(dtList);

            if (dt.Rows.Count > 0)
            {
                string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

                using (SqlConnection con = new SqlConnection(consString))
                {
                    using (SqlCommand cmd = new SqlCommand("Ruleset_UpdateTiles"))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Connection = con;
                        cmd.Parameters.AddWithValue("@tileConfigs", dt);
                        con.Open();
                        var a = cmd.ExecuteNonQuery();
                        con.Close();
                    }
                }
            }
        }
        private static int Getindex(int index)
        {
            index = index + 1;
            return index;
        }
    }
}
