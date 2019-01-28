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
    public class CharacterStatDefaultValueService : ICharacterStatDefaultValueService
    {
        private readonly IRepository<CharacterStatDefaultValue> _repo;
        protected readonly ApplicationDbContext _context;
        public CharacterStatDefaultValueService(ApplicationDbContext context, IRepository<CharacterStatDefaultValue> repo)
        {
            _context = context;
            _repo = repo;
        }

        public async Task<CharacterStatDefaultValue> InsertCharacterStatDefaultValue(CharacterStatDefaultValue characterStatDefaultValue)
        {
            return await _repo.Add(characterStatDefaultValue);
        }

        public async Task<CharacterStatDefaultValue> UpdateCharacterStatDefaultValue(CharacterStatDefaultValue characterStatDefaultValue)
        {
            var DefaultValue = _context.CharacterStatDefaultValues.Find(characterStatDefaultValue.CharacterStatDefaultValueId);
            if (DefaultValue == null)
                return characterStatDefaultValue;

            DefaultValue.Maximum = characterStatDefaultValue.Maximum;
            DefaultValue.Minimum = characterStatDefaultValue.Minimum;

            if (characterStatDefaultValue.Type==1 || characterStatDefaultValue.Type == 2 || characterStatDefaultValue.Type == 8)
            {
                DefaultValue.Maximum = 0;
                DefaultValue.Minimum = 0;
            }           
            DefaultValue.DefaultValue = characterStatDefaultValue.DefaultValue;
            DefaultValue.Type = characterStatDefaultValue.Type;

            //var characterstatslist = _context.CharactersCharacterStats.Where(x => x.IsDeleted == false && x.CharacterStatId == characterStatDefaultValue.CharacterStatId).ToList();
            //foreach (var item in characterstatslist)
            //{
            //    item.Maximum = (int)characterStatDefaultValue.Maximum;
            //    item.Minimum = (int)characterStatDefaultValue.Minimum;
            //    item.DefaultValue = characterStatDefaultValue.DefaultValue;
            //}
            try
            {
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return DefaultValue;
        }

        public async Task<bool> DeleteCharacterStatDefaultValue(int Statid)
        {
            var DefaultValue = _context.CharacterStatDefaultValues.Where(x => x.CharacterStatId == Statid).ToList(); 
            if (DefaultValue == null) return false;

            _context.CharacterStatDefaultValues.RemoveRange(DefaultValue);

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
        public async Task<List<CharacterStatDefaultValue>> GetCharacterStatDefaultValue(int Statid)
        {
            return await _context.CharacterStatDefaultValues.Where(x => x.CharacterStatId == Statid).ToListAsync();            
        }
    }
}
