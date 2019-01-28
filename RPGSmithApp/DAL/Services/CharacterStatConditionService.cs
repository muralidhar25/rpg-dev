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
    public class CharacterStatConditionService : ICharacterStatConditionService
    {
        private readonly IRepository<CharacterStatCondition> _repo;
        protected readonly ApplicationDbContext _context;
        public CharacterStatConditionService(ApplicationDbContext context, IRepository<CharacterStatCondition> repo)
        {
            _context = context;
            _repo = repo;
        }

        public async Task<List<CharacterStatCondition>> InsertCharacterStatCondition(List<CharacterStatCondition> characterStatConditionList, int CharacterStatId)
        {
            try
            {
                await DeleteCharacterStatCondition(CharacterStatId);
                await _context.CharacterStatConditions.AddRangeAsync(characterStatConditionList);
                await _context.SaveChangesAsync();
                return characterStatConditionList;
            }
            catch(Exception ex)
            {
                throw ex;
            }            
        }

        
        public async Task<bool> DeleteCharacterStatCondition(int StatId)
        {
            var Conditions = await _context.CharacterStatConditions.Where(x => x.CharacterStatId == StatId).ToListAsync();

            _context.CharacterStatConditions.RemoveRange(Conditions);          

            try
            {
               await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<List<CharacterStatCondition>> GetByStatId(int StatId)
        {
            var Conditions = await _context.CharacterStatConditions.Where(x => x.CharacterStatId == StatId).OrderBy(z=>z.SortOrder).ToListAsync();
            return Conditions;
        }
        public async Task<List<ConditionOperator>> GetConditionOperators()
        {
            return await _context.ConditionOperators.ToListAsync();
            
        }
        public ConditionOperator GetConditionOperatorById(int? conditionOperatorId) {
            if (conditionOperatorId!=null)
            {
                return _context.ConditionOperators.Where(X => X.ConditionOperatorId == conditionOperatorId).FirstOrDefault();
            }
            return null;
        }
    }
}
