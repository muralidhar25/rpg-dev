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
    public class CharacterStatCalcService : ICharacterStatCalcService
    {
        private readonly IRepository<CharacterStatCalc> _repo;
        protected readonly ApplicationDbContext _context;

        public CharacterStatCalcService(ApplicationDbContext context, IRepository<CharacterStatCalc> repo)
        {
            _context = context;
            _repo = repo;
        }

        public async Task<CharacterStatCalc> InsertCharacterStatCalc(CharacterStatCalc characterStatCalc)
        {
            return await _repo.Add(characterStatCalc);
        }

        public async Task<CharacterStatCalc> UdateCharacterStatCalc(CharacterStatCalc characterStatCalc)
        {
            var csc = _context.CharacterStatCalcs.Find(characterStatCalc.CharacterStatCalcId);

            if (csc == null)
                return characterStatCalc;
            try
            {
                csc.StatCalculation = characterStatCalc.StatCalculation;            
                csc.StatCalculationIds = characterStatCalc.StatCalculationIds;            
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return csc;
           // return await _repo.Update(characterStatCalc);
        }

        public async Task<bool> DeleteCharacterStatCalc(int id)
        {
            var cs= await _repo.Get(id);

            if (cs == null)
                return false;

            cs.IsDeleted = true;

            try
            {
                _context.SaveChanges();
                return true;
            }
            catch(Exception ex)
            {
                throw ex;
            }
        }

        public bool DeleteCharacterStatCalcNotAsync(int id)
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
        public List<CharacterStatCalc> GetByStatId(int StatId) {
            return _context.CharacterStatCalcs.Where(x => x.CharacterStatId == StatId && x.IsDeleted != true).ToList(); 
        }
    }
}
