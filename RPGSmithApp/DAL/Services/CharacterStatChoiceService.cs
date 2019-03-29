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
    public class CharacterStatChoiceService : ICharacterStatChoiceService
    {
        private readonly IRepository<CharacterStatChoice> _repo;
        protected readonly ApplicationDbContext _context;
        public CharacterStatChoiceService(ApplicationDbContext context, IRepository<CharacterStatChoice> repo)
        {
            _context = context;
            _repo = repo;
        }
        public async Task<CharacterStatChoice> InsertCharacterStatChoice(CharacterStatChoice characterStatChoice)
        {
            return await _repo.Add(characterStatChoice);
        }

        public async Task<CharacterStatChoice> UdateCharacterStatChoice(CharacterStatChoice characterStatChoice)
        {
            var csc = _context.CharacterStatChoices.Find(characterStatChoice.CharacterStatChoiceId);

            if (csc == null)
                return characterStatChoice;

            csc.StatChoiceValue = characterStatChoice.StatChoiceValue;
            try
            {
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return csc;
           // return await _repo.Update(characterStatChoice);
        }
        public async Task<bool> DeleteCharacterStatChoice(int id)
        {
            var cs = await _repo.Get(id);

            if (cs == null)
                return false;

            cs.IsDeleted = true;

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

        public bool DeleteCharacterStatChoiceNotAsync(int id)
        {
            var cs = _context.CharacterStatCalcs.SingleOrDefault(p => p.CharacterStatCalcId == id);

            if (cs == null)
                return false;

            cs.IsDeleted = true;

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

        public List<CharacterStatChoice> GetByIds(string selectedIds)
        {
            int[] CharacterStatChoiceIds= null;

            if (selectedIds != null && selectedIds!=string.Empty)
            {
                CharacterStatChoiceIds = selectedIds.Split(';').Select(n => int.Parse(n)).ToArray();
                return _context.CharacterStatChoices.Where(u => CharacterStatChoiceIds.Contains(u.CharacterStatChoiceId)).Select(z=> new CharacterStatChoice {
                    CharacterStatChoiceId =z.CharacterStatChoiceId,
                    CharacterStatId=z.CharacterStatId,
                    IsDeleted=z.IsDeleted,
                    StatChoiceValue=z.StatChoiceValue
                }).ToList();
            }

            return  new List<CharacterStatChoice>();
            }
        public async Task<bool> DeleteChoiceByStatID(int characterStatId) {
            _context.CharacterStatChoices.RemoveRange(_context.CharacterStatChoices.Where(p => p.CharacterStatId == characterStatId));

            
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
    }
}
