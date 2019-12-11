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
    public interface IMonsterTemplateCurrencyService
    {
        Task<MonsterTemplateCurrency> GetById(int id);
        Task<List<MonsterTemplateCurrency>> GetByMonsterTemplateId(int id);
        Task<MonsterTemplateCurrency> Create(MonsterTemplateCurrency item);
        Task<MonsterTemplateCurrency> Update(MonsterTemplateCurrency item);
        Task<bool> Delete(int id);
        Task<bool> DeleteByMonsterTemplate(int id);
    }

    public class MonsterTemplateCurrencyService : IMonsterTemplateCurrencyService
    {
        private readonly IRepository<MonsterTemplateCurrency> _repo;
        protected readonly ApplicationDbContext _context;

        public MonsterTemplateCurrencyService(ApplicationDbContext context, IRepository<MonsterTemplateCurrency> repo)
        {
            _repo = repo;
            _context = context;
        }

        public async Task<MonsterTemplateCurrency> GetById(int id)
        {
            return await _repo.Get(id);
        }

        public async Task<List<MonsterTemplateCurrency>> GetByMonsterTemplateId(int id)
        {
            return await _context.MonsterTemplateCurrency.Where(x => x.MonsterTemplateId == id).ToListAsync();
        }

        public async Task<MonsterTemplateCurrency> Create(MonsterTemplateCurrency item)
        {
            var MonsterTemplateCurrency = new MonsterTemplateCurrency
            {
                Name = item.Name,
                Amount = item.Amount,
                Command = item.Command,
                BaseUnit = item.BaseUnit,
                WeightValue = item.WeightValue,
                SortOrder = item.SortOrder,
                IsDeleted = false,
                CurrencyTypeId = item.CurrencyTypeId,
                MonsterTemplateId = item.MonsterTemplateId,
            };
            return await _repo.Add(MonsterTemplateCurrency);
        }

        public async Task<MonsterTemplateCurrency> Update(MonsterTemplateCurrency item)
        {
            var MonsterTemplateCurrency = await _repo.Get((int)item.MonsterTemplateCurrencyId);

            if (MonsterTemplateCurrency == null)
                return MonsterTemplateCurrency;

            MonsterTemplateCurrency.Amount = item.Amount;
            MonsterTemplateCurrency.Command = item.Command;

            //MonsterTemplateCurrency.Name = item.Name;
            //MonsterTemplateCurrency.BaseUnit = item.BaseUnit;
            //MonsterTemplateCurrency.WeightValue = item.WeightValue;
            //MonsterTemplateCurrency.SortOrder = item.SortOrder;
            //MonsterTemplateCurrency.CurrencyTypeId = item.CurrencyTypeId;
            //MonsterTemplateCurrency.CharacterId = item.CharacterId;
            try
            {
                await _repo.Update(MonsterTemplateCurrency);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return MonsterTemplateCurrency;
        }

        public async Task<bool> Delete(int id)
        {
            return await _repo.Remove(id);
        }

        public async Task<bool> DeleteByMonsterTemplate(int id)
        {
            var list = await _context.MonsterTemplateCurrency.Where(x => x.MonsterTemplateId == id).ToListAsync();
            _context.MonsterTemplateCurrency.RemoveRange(list);
            return true;
        }
    }
}
