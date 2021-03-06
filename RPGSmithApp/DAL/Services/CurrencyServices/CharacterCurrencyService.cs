﻿using System;
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
    public interface ICharacterCurrencyService
    {
        Task<CharacterCurrency> GetById(int id);
        Task<List<CharacterCurrency>> GetByCharacterId(int id);
        Task<bool> ExistCurrencyType(int CharacterId, int CurrencyTypeId);
        Task<bool> HasCharacterCurrency(int CharacterId);
        Task<CharacterCurrency> HasCharacterCurrencyWithDefault(int CharacterId);
        Task<CharacterCurrency> Create(CharacterCurrency item);
        Task<CharacterCurrency> Update(CharacterCurrency item);
        Task<CharacterCurrency> UpdateQuantity(CharacterCurrency item);
        Task<CharacterCurrency> DropQuantity(CharacterCurrency item);
        Task<bool> UpdateList(List<CharacterCurrency> items);
        Task<bool> UpdateListFromTile(List<CharacterCurrency> items);
        Task<bool> Delete(int id);
        Task<bool> DeleteByCharacter(int id);
        Task<bool> UpdateCurrencyIfNoId(List<CharacterCurrency> items, int CharacterId);
    }

    public class CharacterCurrencyService : ICharacterCurrencyService
    {
        private readonly IRepository<CharacterCurrency> _repo;
        protected readonly ApplicationDbContext _context;

        public CharacterCurrencyService(ApplicationDbContext context, IRepository<CharacterCurrency> repo)
        {
            _repo = repo;
            _context = context;
        }

        public async Task<CharacterCurrency> GetById(int id)
        {
            return await _repo.Get(id);
        }

        public async Task<List<CharacterCurrency>> GetByCharacterId(int id)
        {
            return await _context.CharacterCurrency.Where(r => r.CharacterId == id && (r.IsDeleted == false || r.IsDeleted == null))
                .Select(item => new CharacterCurrency
                {
                    Name = item.Name,
                    Amount = item.Amount,
                    Command = item.Command,
                    BaseUnit = item.BaseUnit,
                    WeightValue = item.WeightValue,
                    WeightLabel = item.WeightLabel,
                    SortOrder = item.SortOrder,
                    IsDeleted = item.IsDeleted,
                    CurrencyTypeId = item.CurrencyTypeId,
                    CharacterId = item.CharacterId,
                    CharacterCurrencyId = item.CharacterCurrencyId
                }).ToListAsync();
        }

        public async Task<bool> ExistCurrencyType(int CharacterId, int CurrencyTypeId)
        {
            return await _context.CharacterCurrency
                .Where(x => x.CharacterId == CharacterId && x.CurrencyTypeId == CurrencyTypeId && (x.IsDeleted == false || x.IsDeleted == null))
                .FirstOrDefaultAsync() == null ? false : true;
        }

        public async Task<bool> HasCharacterCurrency(int CharacterId)
        {
            return await _context.CharacterCurrency.Where(x => x.CharacterId == CharacterId && (x.IsDeleted == false || x.IsDeleted == null))
                .FirstOrDefaultAsync() == null ? false : true;
        }

        public async Task<CharacterCurrency> HasCharacterCurrencyWithDefault(int CharacterId)
        {
            return await _context.CharacterCurrency.Where(x => x.CharacterId == CharacterId && x.CurrencyTypeId == -1 && (x.IsDeleted == false || x.IsDeleted == null))
                .FirstOrDefaultAsync();
        }

        public async Task<CharacterCurrency> Create(CharacterCurrency item)
        {
            var characterCurrency = new CharacterCurrency
            {
                Name = item.Name,
                Amount = item.Amount,
                Command = item.Command,
                BaseUnit = item.BaseUnit,
                WeightValue = item.WeightValue,
                WeightLabel = item.WeightLabel,
                SortOrder = item.SortOrder,
                IsDeleted = false,
                CurrencyTypeId = item.CurrencyTypeId,
                CharacterId = item.CharacterId,
            };
            return await _repo.Add(characterCurrency);
        }

        public async Task<CharacterCurrency> Update(CharacterCurrency item)
        {
            var characterCurrency = await _repo.Get((int)item.CharacterCurrencyId);

            if (characterCurrency == null)
                return characterCurrency;

            characterCurrency.Amount = item.Amount;
            characterCurrency.SortOrder = item.SortOrder;
            characterCurrency.Name = item.Name;
            characterCurrency.BaseUnit = item.BaseUnit;
            characterCurrency.WeightValue = item.WeightValue;
            characterCurrency.WeightLabel = item.WeightLabel;
            //characterCurrency.CurrencyTypeId = item.CurrencyTypeId;
            //characterCurrency.CharacterId = item.CharacterId;
            try
            {
                await _repo.Update(characterCurrency);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return characterCurrency;
        }

        public async Task<CharacterCurrency> UpdateQuantity(CharacterCurrency item)
        {
            var characterCurrency = await _repo.Get((int)item.CharacterCurrencyId);

            if (characterCurrency == null)
                return characterCurrency;

            characterCurrency.Amount += item.Amount;
            try
            {
                await _repo.Update(characterCurrency);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return characterCurrency;
        }

        public async Task<CharacterCurrency> DropQuantity(CharacterCurrency item)
        {
            var characterCurrency = await _repo.Get((int)item.CharacterCurrencyId);

            if (characterCurrency == null)
                return characterCurrency;

            if (characterCurrency.Amount >= item.Amount)
                characterCurrency.Amount -= item.Amount;

            try
            {
                await _repo.Update(characterCurrency);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return characterCurrency;
        }

        public async Task<bool> UpdateList(List<CharacterCurrency> items)
        {
            try
            {
                await _repo.UpdateRange(items);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return true;
        }

        public async Task<bool> UpdateListFromTile(List<CharacterCurrency> items)
        {
            try
            {
                foreach(var item in items)
                {
                    var characterCurrency = await _repo.Get((int)item.CharacterCurrencyId);
                    characterCurrency.Amount = item.Amount;
                    await _repo.Update(characterCurrency);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return true;
        }

        public async Task<bool> UpdateCurrencyIfNoId(List<CharacterCurrency> items, int CharacterId)
        {
            try
            {
                foreach (var item in items)
                {
                    var _characterCurrency = await _context.CharacterCurrency
                        .Where(x => x.CharacterId == item.CharacterId && x.Name == item.Name && x.CurrencyTypeId == item.CurrencyTypeId)
                        .FirstOrDefaultAsync();

                    if (_characterCurrency == null)
                        _characterCurrency = await _context.CharacterCurrency
                        .Where(x => x.CharacterId == CharacterId && x.Name == item.Name && x.CurrencyTypeId == item.CurrencyTypeId)
                        .FirstOrDefaultAsync();

                    if (_characterCurrency == null) continue;

                    _characterCurrency.Amount += item.Amount;
                    await _repo.Update(_characterCurrency);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return true;
        }

        public async Task<bool> Delete(int id)
        {
            return await _repo.Remove(id);
        }

        public async Task<bool> DeleteByCharacter(int id)
        {
            var list = await _context.CharacterCurrency.Where(x => x.CharacterId == id).ToListAsync();
            _context.CharacterCurrency.RemoveRange(list);
            return true;
        }
    }
}
