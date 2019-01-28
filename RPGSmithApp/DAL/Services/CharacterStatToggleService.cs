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
    public class CharacterStatToggleService : ICharacterStatToggleService
    {
        private readonly IRepository<CharacterStatToggle> _repo;
        protected readonly ApplicationDbContext _context;
        public CharacterStatToggleService(ApplicationDbContext context, IRepository<CharacterStatToggle> repo)
        {
            _context = context;
            _repo = repo;
        }

        public async Task<CharacterStatToggle> InsertCharacterStatToggle(CharacterStatToggle characterStatToggle)
        {
            return await _repo.Add(characterStatToggle);
        }

        public async Task<CharacterStatToggle> UpdateCharacterStatToggle(CharacterStatToggle characterStatToggle)
        {
            var toggle = _context.CharacterStatToggle.Include(x=>x.CustomToggles).Where(y=>y.CharacterStatToggleId == characterStatToggle.CharacterStatToggleId).FirstOrDefault();
            if (toggle == null)
                return characterStatToggle;

            try
            {
                if (toggle.CustomToggles.Count > 0)
                {
                    foreach (var ct in toggle.CustomToggles)
                    {
                        _context.CustomToggle.Remove(ct);
                    }
                    _context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
            }

            toggle.Display = characterStatToggle.Display;
            toggle.ShowCheckbox = characterStatToggle.ShowCheckbox;
            toggle.IsCustom = characterStatToggle.IsCustom;
            toggle.OnOff = characterStatToggle.OnOff;
            toggle.YesNo = characterStatToggle.YesNo;
            try
            {
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return toggle;
        }

        public async Task<bool> DeleteCharacterStatToggle(int id)
        {
            var toggle = await _repo.Get(id);
            if (toggle == null) return false;

            var ctoggle = _context.CustomToggle.Where(x => x.CharacterStatToggleId == id).ToList();
            if (ctoggle != null)
            {
                foreach (var ct in ctoggle)
                {
                    ct.IsDeleted = true;
                }
            }

            toggle.IsDeleted = true;

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

        public bool DeleteCharacterStatToggleNotAsync(int id)
        {
            var toggle = _context.CharacterStatCalcs.SingleOrDefault(p => p.CharacterStatCalcId == id);
            if (toggle == null) return false;

            var ctoggle = _context.CustomToggle.Where(x => x.CharacterStatToggleId == id).ToList();
            if (ctoggle != null)
            {
                foreach (var ct in ctoggle)
                {
                    ct.IsDeleted = true;
                }
            }

            toggle.IsDeleted = true;

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

        public List<CharacterStatToggle> GetByIds(string selectedIds)
        {
            int[] CharacterStatToggleIds = null;

            if (selectedIds != null && selectedIds != string.Empty)
            {
                CharacterStatToggleIds = selectedIds.Split(';').Select(n => int.Parse(n)).ToArray();
                return _context.CharacterStatToggle.Where(u => CharacterStatToggleIds.Contains(u.CharacterStatToggleId)).ToList();
            }

            return new List<CharacterStatToggle>();
        }
    }
}
