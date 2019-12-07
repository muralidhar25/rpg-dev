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
    public interface ILootTemplateCurrencyService
    {
        Task<LootTemplateCurrency> GetById(int id);
        Task<List<LootTemplateCurrency>> GetByLootTemplateId(int id);
        Task<LootTemplateCurrency> Create(LootTemplateCurrency item);
        Task<LootTemplateCurrency> Update(LootTemplateCurrency item);
        Task<bool> Delete(int id);
        Task<bool> DeleteByLootTemplate(int id);
    }

    public class LootTemplateCurrencyService : ILootTemplateCurrencyService
    {
        private readonly IRepository<LootTemplateCurrency> _repo;
        protected readonly ApplicationDbContext _context;

        public LootTemplateCurrencyService(ApplicationDbContext context, IRepository<LootTemplateCurrency> repo)
        {
            _repo = repo;
            _context = context;
        }

        public async Task<LootTemplateCurrency> GetById(int id)
        {
            return await _repo.Get(id);
        }

        public async Task<List<LootTemplateCurrency>> GetByLootTemplateId(int id)
        {
            return await _context.LootTemplateCurrency.Where(x => x.LootTemplateId == id).ToListAsync();
        }

        public async Task<LootTemplateCurrency> Create(LootTemplateCurrency item)
        {
            var LootTemplateCurrency = new LootTemplateCurrency
            {
                Name = item.Name,
                Amount = item.Amount,
                BaseUnit = item.BaseUnit,
                WeightValue = item.WeightValue,
                SortOrder = item.SortOrder,
                IsDeleted = false,
                CurrencyTypeId = item.CurrencyTypeId,
                LootTemplateId = item.LootTemplateId,
            };
            return await _repo.Add(LootTemplateCurrency);
        }

        public async Task<LootTemplateCurrency> Update(LootTemplateCurrency item)
        {
            var LootTemplateCurrency = await _repo.Get((int)item.LootTemplateCurrencyId);

            if (LootTemplateCurrency == null)
                return LootTemplateCurrency;

            LootTemplateCurrency.Amount = item.Amount;

            //LootTemplateCurrency.Name = item.Name;
            //LootTemplateCurrency.BaseUnit = item.BaseUnit;
            //LootTemplateCurrency.WeightValue = item.WeightValue;
            //LootTemplateCurrency.SortOrder = item.SortOrder;
            //LootTemplateCurrency.CurrencyTypeId = item.CurrencyTypeId;
            //LootTemplateCurrency.CharacterId = item.CharacterId;
            try
            {
                await _repo.Update(LootTemplateCurrency);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return LootTemplateCurrency;
        }

        public async Task<bool> Delete(int id)
        {
            return await _repo.Remove(id);
        }

        public async Task<bool> DeleteByLootTemplate(int id)
        {
            var list = await _context.LootTemplateCurrency.Where(x => x.LootTemplateId == id).ToListAsync();
            _context.LootTemplateCurrency.RemoveRange(list);
            return true;
        }
    }
}
