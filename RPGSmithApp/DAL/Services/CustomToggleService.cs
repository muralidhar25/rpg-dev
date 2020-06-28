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
    public class CustomToggleService : ICustomToggleService
    {
        private readonly IRepository<CustomToggle> _repo;
        protected readonly ApplicationDbContext _context;
        public CustomToggleService(ApplicationDbContext context, IRepository<CustomToggle> repo)
        {
            _context = context;
            _repo = repo;
        }

        public async Task<CustomToggle> InsertCustomToggle(CustomToggle customToggle)
        {
            return await _repo.Add(customToggle);
        }

        public async Task<CustomToggle> UpdateCustomToggle(CustomToggle customToggle)
        {
            var toggle = _context.CustomToggle.Find(customToggle.CustomToggleId);
            if (toggle == null)
                return customToggle;

            toggle.Image = customToggle.Image;
            toggle.ToggleText = customToggle.ToggleText;
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

        public async Task<bool> DeleteCustomToggle(int id)
        {
            var toggle = await _repo.Get(id);
            if (toggle == null) return false;
                        
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


        public List<CustomToggle> GetByIds(string selectedIds)
        {
            int[] CharacterStatToggleIds = null;

            if (selectedIds != null && selectedIds != string.Empty)
            {
                CharacterStatToggleIds = selectedIds.Split(';').Select(n => int.Parse(n)).ToArray();
                return _context.CustomToggle.Where(u => CharacterStatToggleIds.Contains(u.CharacterStatToggleId)).ToList();
            }

            return new List<CustomToggle>();
        }
    }
}
