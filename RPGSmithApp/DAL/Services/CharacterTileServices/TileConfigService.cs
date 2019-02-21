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
using Microsoft.Extensions.Configuration;

namespace DAL.Services.CharacterTileServices
{
    public class TileConfigService : ITileConfigService
    {
        private readonly IRepository<TileConfig> _repo;
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        public TileConfigService(ApplicationDbContext context, IRepository<TileConfig> repo, IConfiguration configuration)
        {
            _repo = repo;
            _context = context;
            _configuration = configuration;
        }
        public async Task<TileConfig> CreateAsync(TileConfig item)
        {
            //item.IsDeleted = false;
            item.TileConfigId = 0;
            return await _repo.Add(item);
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
        public void UpdateList(List<TileConfig> list)
        {
            int index = 0;
            List<CommonTileConfig> dtList = list.Select(o => new CommonTileConfig()
            {
                RowNum = index = Getindex(index),
                Col = o.Col,
                Row = o.Row,
                TileId = o.CharacterTileId,
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
                try
                {
                    using (SqlConnection con = new SqlConnection(consString))
                    {
                        using (SqlCommand cmd = new SqlCommand("Character_UpdateTileConfig"))
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
                catch (Exception ex)
                {
                    throw ex;
                }
            }
        }
        public void createList(List<TileConfig> list)
        {
            int index = 0;
            List<CommonTileConfig> dtList = list.Select(o => new CommonTileConfig()
            {
                RowNum = index = Getindex(index),
                Col = o.Col,
                Row = o.Row,
                TileId = o.CharacterTileId,
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
                try
                {
                    using (SqlConnection con = new SqlConnection(consString))
                    {
                        using (SqlCommand cmd = new SqlCommand("Character_CreateTileConfig"))
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
                catch (Exception ex)
                {
                    throw ex;
                }
            }
        }
        public async Task<TileConfig> UpdateAsync(TileConfig item)
        {
            var TileConfig = _context.TileConfig.Where(q => q.CharacterTileId == item.CharacterTileId).FirstOrDefault();
            if (TileConfig == null) return TileConfig;
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
        public TileConfig Get(int id)
        {
            return _context.TileConfig.Where(q => q.CharacterTileId == id).FirstOrDefault();
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
        public List<TileConfig> GetAll()
        {
            return _context.TileConfig.ToList();
        }
        private static int Getindex(int index)
        {
            index = index + 1;
            return index;
        }
    }
}
