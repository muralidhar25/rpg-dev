using System;
using System.Collections.Generic;
using System.Text;
using DAL.Models;
using DAL.Repositories.Interfaces;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using DAL.Repositories;
using System.Linq.Expressions;

namespace DAL.Services
{
    public class CharacterStatComboService : ICharacterStatComboService
    {
        private readonly IRepository<CharacterStatCombo> _repo;
        protected readonly ApplicationDbContext _context;
        public CharacterStatComboService(ApplicationDbContext context, IRepository<CharacterStatCombo> repo)
        {
            _context = context;
            _repo = repo;
        }

        public async Task<CharacterStatCombo> InsertCharacterStatCombo(CharacterStatCombo characterStatCombo)
        {
            return await _repo.Add(characterStatCombo);
        }

        public async Task<CharacterStatCombo> UpdateCharacterStatCombo(CharacterStatCombo characterStatCombo)
        {
            var combo = _context.CharacterStatCombos.Find(characterStatCombo.CharacterStatComboId);
            if (combo == null)
                return characterStatCombo;

            combo.Maximum = characterStatCombo.Maximum;
            combo.Minimum = characterStatCombo.Minimum;
            combo.DefaultValue = characterStatCombo.DefaultValue;

            var characterstatslist = _context.CharactersCharacterStats.Where(x => x.IsDeleted == false && x.CharacterStatId == characterStatCombo.CharacterStatId).ToList();
            foreach (var item in characterstatslist)
            {
                item.Maximum = (int)characterStatCombo.Maximum;
                item.Minimum = (int)characterStatCombo.Minimum;
                item.DefaultValue = characterStatCombo.DefaultValue;
            }
            try
            {
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return combo;
        }

        public async Task<bool> DeleteCharacterStatCombo(int id)
        {
            var combo = await _repo.Get(id);
            if (combo == null) return false;

            combo.IsDeleted = true;

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

        public bool DeleteCharacterStatComboNotAsync(int id)
        {
            var combo = _context.CharacterStatCalcs.SingleOrDefault(p => p.CharacterStatCalcId == id);
            if (combo == null) return false;

            combo.IsDeleted = true;

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

        public List<CharacterStatCombo> GetByIds(string selectedIds)
        {
            int[] CharacterStatComboIds = null;

            if (selectedIds != null && selectedIds != string.Empty)
            {
                CharacterStatComboIds = selectedIds.Split(';').Select(n => int.Parse(n)).ToArray();
                return _context.CharacterStatCombos.Where(u => CharacterStatComboIds.Contains(u.CharacterStatComboId)).ToList();
            }

            return new List<CharacterStatCombo>();
        }
    }
}
