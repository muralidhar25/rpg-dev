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
    public interface IItemMasterLootCurrencyService
    {
        Task<ItemMasterLootCurrency> GetById(int id);
        Task<List<ItemMasterLootCurrency>> GetByLootId(int id);
        Task<ItemMasterLootCurrency> Create(ItemMasterLootCurrency item);
        Task<ItemMasterLootCurrency> Update(ItemMasterLootCurrency item);
        Task<bool> Delete(int id);
        Task<bool> DeleteByItemMasterLoot(int id);
        Task<ItemMasterLootCurrency> DropQuantity(ItemMasterLootCurrency item);
        Task<ItemMasterLootCurrency> UpdateQuantity(ItemMasterLootCurrency item);
    }

    public class ItemMasterLootCurrencyService : IItemMasterLootCurrencyService
    {
        private readonly IRepository<ItemMasterLootCurrency> _repo;
        protected readonly ApplicationDbContext _context;

        public ItemMasterLootCurrencyService(ApplicationDbContext context, IRepository<ItemMasterLootCurrency> repo)
        {
            _repo = repo;
            _context = context;
        }

        public async Task<ItemMasterLootCurrency> GetById(int id)
        {
            return await _repo.Get(id);
        }

        public async Task<List<ItemMasterLootCurrency>> GetByLootId(int id)
        {
            return await _context.ItemMasterLootCurrency.Where(x => x.LootId == id).ToListAsync();
        }

        public async Task<ItemMasterLootCurrency> Create(ItemMasterLootCurrency item)
        {
            var ItemMasterLootCurrency = new ItemMasterLootCurrency
            {
                Name = item.Name,
                Amount = item.Amount,
                BaseUnit = item.BaseUnit,
                WeightValue = item.WeightValue,
                SortOrder = item.SortOrder,
                IsDeleted = false,
                CurrencyTypeId = item.CurrencyTypeId,
                LootId = item.LootId,
            };
            return await _repo.Add(ItemMasterLootCurrency);
        }

        public async Task<ItemMasterLootCurrency> Update(ItemMasterLootCurrency item)
        {
            var ItemMasterLootCurrency = await _repo.Get((int)item.ItemMasterLootCurrencyId);

            if (ItemMasterLootCurrency == null)
                return ItemMasterLootCurrency;

            ItemMasterLootCurrency.Amount = item.Amount;

            //ItemMasterLootCurrency.Name = item.Name;
            //ItemMasterLootCurrency.BaseUnit = item.BaseUnit;
            //ItemMasterLootCurrency.WeightValue = item.WeightValue;
            //ItemMasterLootCurrency.SortOrder = item.SortOrder;
            //ItemMasterLootCurrency.CurrencyTypeId = item.CurrencyTypeId;
            //ItemMasterLootCurrency.CharacterId = item.CharacterId;
            try
            {
                await _repo.Update(ItemMasterLootCurrency);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return ItemMasterLootCurrency;
        }

        public async Task<bool> Delete(int id)
        {
            return await _repo.Remove(id);
        }

        public async Task<bool> DeleteByItemMasterLoot(int id)
        {
            var list = await _context.ItemMasterLootCurrency.Where(x => x.LootId == id).ToListAsync();
            _context.ItemMasterLootCurrency.RemoveRange(list);
            return true;
        }

        public async Task<ItemMasterLootCurrency> UpdateQuantity(ItemMasterLootCurrency item)
        {
            var itemMasterLootCurrency = await _repo.Get((int)item.ItemMasterLootCurrencyId);

            if (itemMasterLootCurrency == null)
                return itemMasterLootCurrency;

            itemMasterLootCurrency.Amount += item.Amount;
            try
            {
                await _repo.Update(itemMasterLootCurrency);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return itemMasterLootCurrency;
        }

        public async Task<ItemMasterLootCurrency> DropQuantity(ItemMasterLootCurrency item)
        {
            var itemMasterLootCurrency = await _repo.Get((int)item.ItemMasterLootCurrencyId);

            if (itemMasterLootCurrency == null)
                return itemMasterLootCurrency;

            if (itemMasterLootCurrency.Amount >= item.Amount)
                itemMasterLootCurrency.Amount -= item.Amount;

            try
            {
                await _repo.Update(itemMasterLootCurrency);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return itemMasterLootCurrency;
        }
    }
}
