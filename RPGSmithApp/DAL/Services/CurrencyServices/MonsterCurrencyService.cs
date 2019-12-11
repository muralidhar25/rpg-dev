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
    public interface IMonsterCurrencyService
    {
        Task<MonsterCurrency> GetById(int id);
        Task<List<MonsterCurrency>> GetByMonsterId(int id);
        Task<MonsterCurrency> Create(MonsterCurrency item);
        Task<MonsterCurrency> Update(MonsterCurrency item);
        Task<bool> Delete(int id);
        Task<bool> DeleteByMonster(int id);
    }

    public class MonsterCurrencyService : IMonsterCurrencyService
    {
        private readonly IRepository<MonsterCurrency> _repo;
        protected readonly ApplicationDbContext _context;

        public MonsterCurrencyService(ApplicationDbContext context, IRepository<MonsterCurrency> repo)
        {
            _repo = repo;
            _context = context;
        }

        public async Task<MonsterCurrency> GetById(int id)
        {
            return await _repo.Get(id);
        }

        public async Task<List<MonsterCurrency>> GetByMonsterId(int id)
        {
            return await _context.MonsterCurrency.Where(x => x.MonsterId == id).ToListAsync();
        }

        public async Task<MonsterCurrency> Create(MonsterCurrency item)
        {
            var MonsterCurrency = new MonsterCurrency
            {
                Name = item.Name,
                Amount = item.Amount,
                Command = item.Command,
                BaseUnit = item.BaseUnit,
                WeightValue = item.WeightValue,
                SortOrder = item.SortOrder,
                IsDeleted = false,
                CurrencyTypeId = item.CurrencyTypeId,
                MonsterId = item.MonsterId,
            };
            return await _repo.Add(MonsterCurrency);
        }

        public async Task<MonsterCurrency> Update(MonsterCurrency item)
        {
            var MonsterCurrency = await _repo.Get((int)item.MonsterCurrencyId);

            if (MonsterCurrency == null)
                return MonsterCurrency;

            MonsterCurrency.Amount = item.Amount;

            //MonsterCurrency.Name = item.Name;
            //MonsterCurrency.BaseUnit = item.BaseUnit;
            //MonsterCurrency.WeightValue = item.WeightValue;
            //MonsterCurrency.SortOrder = item.SortOrder;
            //MonsterCurrency.CurrencyTypeId = item.CurrencyTypeId;
            //MonsterCurrency.CharacterId = item.CharacterId;
            try
            {
                await _repo.Update(MonsterCurrency);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return MonsterCurrency;
        }

        public async Task<bool> Delete(int id)
        {
            return await _repo.Remove(id);
        }

        public async Task<bool> DeleteByMonster(int id)
        {
            var list = await _context.MonsterCurrency.Where(x => x.MonsterId == id).ToListAsync();
            _context.MonsterCurrency.RemoveRange(list);
            return true;
        }
    }
}
