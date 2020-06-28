// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;

namespace DAL.Repositories.Interfaces
{
    public interface IRepository<TEntity> where TEntity : class
    {
        Task<TEntity> Add(TEntity entity);
        Task<IEnumerable<TEntity>> AddRange(IEnumerable<TEntity> entities);

        Task<TEntity> Update(TEntity entity);
        Task<IEnumerable<TEntity>> UpdateRange(IEnumerable<TEntity> entities);

        Task<bool> Remove(int id);
        bool RemoveNotAsync(int id);
        Task<bool> Remove(TEntity entity);
        Task<bool> RemoveRange(IEnumerable<TEntity> entities);

        Task<int> Count();

        List<TEntity> Find(Expression<Func<TEntity, bool>> predicate);
        Task<TEntity> GetSingleOrDefault(Expression<Func<TEntity, bool>> predicate);
        Task<TEntity> Get(int id);
        Task<List<TEntity>> GetAll();
        List<TEntity> GetList();
        List<TEntity> AllIncludeNavigation(string[] includTables);
        Task<List<TEntity>> AllInclude(params Expression<Func<TEntity, object>>[] IncludeProperties);
        //  Task<List<TEntity>> FindByInclude(Expression<Func<TEntity, bool>> Predicate, params Expression<Func<TEntity, object>>[] IncludeProperties);

        Task<List<TEntity>> PagedList(int page, int pageSize);

        List<TEntity> SQLQuery(string query);

        RuleSet GetRuleset(DataTable dtRuleset, short num = 0);
        List<RuleSet> GetRulesetsList(DataTable dtRuleset);
        Character GetCharacter(DataTable dtCharacter);
    }
}
