// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

using DAL.Models;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class Repository<TEntity> : IRepository<TEntity> where TEntity : class
    {
        protected readonly ApplicationDbContext _context;
        protected readonly DbSet<TEntity> _entities;

        public Repository(ApplicationDbContext context)
        {
            _context = context;
            _entities = context.Set<TEntity>();
        }

        public virtual async Task<TEntity> Add(TEntity entity)
        {
            _entities.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public virtual async Task<IEnumerable<TEntity>> AddRange(IEnumerable<TEntity> entities)
        {
            _entities.AddRange(entities);
            await _context.SaveChangesAsync();
            return entities;
        }


        public virtual async Task<TEntity> Update(TEntity entity)
        {
            _entities.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public virtual async Task<IEnumerable<TEntity>> UpdateRange(IEnumerable<TEntity> entities)
        {
            _entities.UpdateRange(entities);
            await _context.SaveChangesAsync();
            return entities;
        }


        public virtual async Task<bool> Remove(int id)
        {
            _entities.Remove(Get(id).Result);
            await _context.SaveChangesAsync();
            return true;
        }

        public virtual bool RemoveNotAsync(int id)
        {
            _entities.Remove(Get(id).Result);
            _context.SaveChanges();
            return true;
        }

        public virtual async Task<bool> Remove(TEntity entity)
        {
            _entities.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public virtual async Task<bool> RemoveRange(IEnumerable<TEntity> entities)
        {
            _entities.RemoveRange(entities);
            await _context.SaveChangesAsync();
            return true;
        }


        public virtual async Task<int> Count()
        {
            return await _entities.CountAsync();
        }


        public virtual List<TEntity> Find(Expression<Func<TEntity, bool>> predicate)
        {
            return _entities.Where(predicate).ToList();
        }

        public virtual async Task<TEntity> GetSingleOrDefault(Expression<Func<TEntity, bool>> predicate)
        {
            return await _entities.FirstOrDefaultAsync(predicate);
        }

        public virtual async Task<TEntity> Get(int id)
        {
            return await _entities.FindAsync(id);
        }

        public virtual async Task<List<TEntity>> GetAll()
        {
            return await _entities.ToListAsync();
        }

        public virtual  List<TEntity> GetList()
        {
            return _entities.ToList();
        }

        //public List<TEntity> FindByInclude(Expression<Func<TEntity, bool>> Predicate, params Expression<Func<TEntity, object>>[] IncludeProperties)
        //{
        //    var query = GetAllIncluding(IncludeProperties);
        //    return query.Where(Predicate).to
        //}
        public virtual List<TEntity> AllIncludeNavigation(string[] includTables)
        {
            IQueryable<TEntity> queryable = _entities;

            foreach (var table in includTables)
            {
                queryable = queryable.Include(table);
            }

            return queryable.ToList();
        }

        public virtual async Task<List<TEntity>> AllInclude(params Expression<Func<TEntity, object>>[] IncludeProperties)
        {
            return GetAllIncluding(IncludeProperties);
        }
        private List<TEntity> GetAllIncluding(params Expression<Func<TEntity, object>>[] IncludeProperties)
        {
            IQueryable<TEntity> queryable = _entities.AsNoTracking();

            return IncludeProperties.Aggregate(queryable, (current, includeProperty) => current.Include(includeProperty)).ToList();
        }

        public async Task<List<TEntity>> PagedList(int page, int pageSize)
        {
            IQueryable<TEntity> data = null;

            if (page != -1)
                data = _entities.Skip((page - 1) * pageSize);

            if (pageSize != -1)
                data = _entities.Take(pageSize);

            var ruleSetList = await data.ToListAsync();


            return ruleSetList;
        }

        public virtual List<TEntity> SQLQuery(string query)
        {
            return _entities.FromSql(query).ToList();

        }

        public RuleSet GetRuleset(DataTable dtRuleset, short num =0)
        {
            RuleSet ruleset = new RuleSet();

            ruleset.CreatedBy = dtRuleset.Rows[0]["CreatedBy"] == DBNull.Value ? null : dtRuleset.Rows[0]["CreatedBy"].ToString();
            ruleset.CreatedDate = dtRuleset.Rows[0]["CreatedDate"] == DBNull.Value ? new DateTime() : Convert.ToDateTime(dtRuleset.Rows[0]["CreatedDate"]);
            ruleset.CurrencyLabel = dtRuleset.Rows[0]["CurrencyLabel"] == DBNull.Value ? null : dtRuleset.Rows[0]["CurrencyLabel"].ToString();
            ruleset.DefaultDice = dtRuleset.Rows[0]["DefaultDice"] == DBNull.Value ? null : dtRuleset.Rows[0]["DefaultDice"].ToString();
            ruleset.DistanceLabel = dtRuleset.Rows[0]["DistanceLabel"] == DBNull.Value ? null : dtRuleset.Rows[0]["DistanceLabel"].ToString();
            ruleset.ImageUrl = dtRuleset.Rows[0]["ImageUrl"] == DBNull.Value ? null : dtRuleset.Rows[0]["ImageUrl"].ToString();
            ruleset.IsAbilityEnabled = dtRuleset.Rows[0]["IsAbilityEnabled"] == DBNull.Value ? false : Convert.ToBoolean(dtRuleset.Rows[0]["IsAbilityEnabled"]);
            ruleset.isActive = dtRuleset.Rows[0]["isActive"] == DBNull.Value ? false : Convert.ToBoolean(dtRuleset.Rows[0]["isActive"]);
            ruleset.IsAllowSharing = dtRuleset.Rows[0]["IsAllowSharing"] == DBNull.Value ? false : Convert.ToBoolean(dtRuleset.Rows[0]["IsAllowSharing"]);
            ruleset.IsCoreRuleset = dtRuleset.Rows[0]["IsCoreRuleset"] == DBNull.Value ? false : Convert.ToBoolean(dtRuleset.Rows[0]["IsCoreRuleset"]);
            ruleset.IsDeleted = dtRuleset.Rows[0]["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(dtRuleset.Rows[0]["IsDeleted"]);
            ruleset.IsItemEnabled = dtRuleset.Rows[0]["IsItemEnabled"] == DBNull.Value ? false : Convert.ToBoolean(dtRuleset.Rows[0]["IsItemEnabled"]);
            ruleset.IsSpellEnabled = dtRuleset.Rows[0]["IsSpellEnabled"] == DBNull.Value ? false : Convert.ToBoolean(dtRuleset.Rows[0]["IsSpellEnabled"]);
            ruleset.ModifiedBy = dtRuleset.Rows[0]["ModifiedBy"] == DBNull.Value ? null : dtRuleset.Rows[0]["ModifiedBy"].ToString();
            ruleset.ModifiedDate = dtRuleset.Rows[0]["ModifiedDate"] == DBNull.Value ? new DateTime() : Convert.ToDateTime(dtRuleset.Rows[0]["ModifiedDate"]);
            ruleset.OwnerId = dtRuleset.Rows[0]["ParentRuleSetId"] == DBNull.Value ? null : dtRuleset.Rows[0]["OwnerId"].ToString();
            ruleset.ParentRuleSetId = dtRuleset.Rows[0]["ParentRuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(dtRuleset.Rows[0]["ParentRuleSetId"]);
            ruleset.RuleSetDesc = dtRuleset.Rows[0]["RuleSetDesc"] == DBNull.Value ? null : dtRuleset.Rows[0]["RuleSetDesc"].ToString();
            ruleset.RuleSetGenreId = dtRuleset.Rows[0]["RuleSetGenreId"] == DBNull.Value ? num : (short)Convert.ToInt32(dtRuleset.Rows[0]["RuleSetGenreId"]);
            ruleset.RuleSetId = dtRuleset.Rows[0]["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(dtRuleset.Rows[0]["RuleSetId"]);
            ruleset.RuleSetName = dtRuleset.Rows[0]["RuleSetName"] == DBNull.Value ? null : dtRuleset.Rows[0]["RuleSetName"].ToString();
            ruleset.ShareCode = dtRuleset.Rows[0]["ShareCode"] == DBNull.Value ? new Guid() : new Guid(dtRuleset.Rows[0]["ShareCode"].ToString());
            ruleset.ThumbnailUrl = dtRuleset.Rows[0]["ThumbnailUrl"] == DBNull.Value ? null : dtRuleset.Rows[0]["ThumbnailUrl"].ToString();
            ruleset.VolumeLabel = dtRuleset.Rows[0]["VolumeLabel"] == DBNull.Value ? null : dtRuleset.Rows[0]["VolumeLabel"].ToString();
            ruleset.WeightLabel = dtRuleset.Rows[0]["WeightLabel"] == DBNull.Value ? null : dtRuleset.Rows[0]["WeightLabel"].ToString();
            if (dtRuleset.Columns.Contains("IsBuffAndEffectEnabled"))
            {
                ruleset.IsBuffAndEffectEnabled = dtRuleset.Rows[0]["IsBuffAndEffectEnabled"] == DBNull.Value ? false : Convert.ToBoolean(dtRuleset.Rows[0]["IsBuffAndEffectEnabled"]);
            }
            return ruleset;
        }

        public List<RuleSet> GetRulesetsList(DataTable dtRuleset)
        {
            List<RuleSet> _rulesetsList = new List<RuleSet>();
            short num = 0;
            foreach (DataRow row in dtRuleset.Rows)
            {

                RuleSet ruleset = new RuleSet();

                ruleset.CreatedBy = row["CreatedBy"] == DBNull.Value ? null : row["CreatedBy"].ToString();
                ruleset.CreatedDate = row["CreatedDate"] == DBNull.Value ? new DateTime() : Convert.ToDateTime(row["CreatedDate"]);
                ruleset.CurrencyLabel = row["CurrencyLabel"] == DBNull.Value ? null : row["CurrencyLabel"].ToString();
                ruleset.DefaultDice = row["DefaultDice"] == DBNull.Value ? null : row["DefaultDice"].ToString();
                ruleset.DistanceLabel = row["DistanceLabel"] == DBNull.Value ? null : row["DistanceLabel"].ToString();
                ruleset.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();
                ruleset.IsAbilityEnabled = row["IsAbilityEnabled"] == DBNull.Value ? false : Convert.ToBoolean(row["IsAbilityEnabled"]);
                ruleset.isActive = row["isActive"] == DBNull.Value ? false : Convert.ToBoolean(row["isActive"]);
                ruleset.IsAllowSharing = row["IsAllowSharing"] == DBNull.Value ? false : Convert.ToBoolean(row["IsAllowSharing"]);
                ruleset.IsCoreRuleset = row["IsCoreRuleset"] == DBNull.Value ? false : Convert.ToBoolean(row["IsCoreRuleset"]);
                ruleset.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                ruleset.IsItemEnabled = row["IsItemEnabled"] == DBNull.Value ? false : Convert.ToBoolean(row["IsItemEnabled"]);
                ruleset.IsSpellEnabled = row["IsSpellEnabled"] == DBNull.Value ? false : Convert.ToBoolean(row["IsSpellEnabled"]);
                ruleset.ModifiedBy = row["ModifiedBy"] == DBNull.Value ? null : row["ModifiedBy"].ToString();
                ruleset.ModifiedDate = row["ModifiedDate"] == DBNull.Value ? new DateTime() : Convert.ToDateTime(row["ModifiedDate"]);
                ruleset.OwnerId = row["ParentRuleSetId"] == DBNull.Value ? null : row["OwnerId"].ToString();
                ruleset.ParentRuleSetId = row["ParentRuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ParentRuleSetId"]);
                ruleset.RuleSetDesc = row["RuleSetDesc"] == DBNull.Value ? null : row["RuleSetDesc"].ToString();
                ruleset.RuleSetGenreId = row["RuleSetGenreId"] == DBNull.Value ? num : (short)Convert.ToInt32(row["RuleSetGenreId"]);
                ruleset.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                ruleset.RuleSetName = row["RuleSetName"] == DBNull.Value ? null : row["RuleSetName"].ToString();
                ruleset.ShareCode = row["ShareCode"] == DBNull.Value ? new Guid() : new Guid(row["ShareCode"].ToString());
                ruleset.ThumbnailUrl = row["ThumbnailUrl"] == DBNull.Value ? null : row["ThumbnailUrl"].ToString();
                ruleset.VolumeLabel = row["VolumeLabel"] == DBNull.Value ? null : row["VolumeLabel"].ToString();
                ruleset.WeightLabel = row["WeightLabel"] == DBNull.Value ? null : row["WeightLabel"].ToString();

                _rulesetsList.Add(ruleset);
            }
            return _rulesetsList;
        }

        public Character GetCharacter(DataTable dtCharacter)
        {
            Character _character = new Character();
            
            _character.CharacterId = dtCharacter.Rows[0]["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(dtCharacter.Rows[0]["CharacterId"]);
            _character.CharacterName = dtCharacter.Rows[0]["CharacterName"] == DBNull.Value ? null : dtCharacter.Rows[0]["CharacterName"].ToString();
            _character.CharacterDescription = dtCharacter.Rows[0]["CharacterDescription"] == DBNull.Value ? null : dtCharacter.Rows[0]["CharacterDescription"].ToString();
            _character.ImageUrl = dtCharacter.Rows[0]["ImageUrl"] == DBNull.Value ? null : dtCharacter.Rows[0]["ImageUrl"].ToString();
            _character.ThumbnailUrl = dtCharacter.Rows[0]["ThumbnailUrl"] == DBNull.Value ? null : dtCharacter.Rows[0]["ThumbnailUrl"].ToString();
            _character.UserId = dtCharacter.Rows[0]["UserId"] == DBNull.Value ? null : dtCharacter.Rows[0]["UserId"].ToString();
            _character.RuleSetId = dtCharacter.Rows[0]["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(dtCharacter.Rows[0]["RuleSetId"]);
            _character.ParentCharacterId = dtCharacter.Rows[0]["ParentCharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(dtCharacter.Rows[0]["ParentCharacterId"]);
            _character.IsDeleted = dtCharacter.Rows[0]["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(dtCharacter.Rows[0]["IsDeleted"]);
            _character.LastCommand = dtCharacter.Rows[0]["LastCommand"] == DBNull.Value ? null : dtCharacter.Rows[0]["LastCommand"].ToString();
            _character.LastCommandResult = dtCharacter.Rows[0]["LastCommandResult"] == DBNull.Value ? null : dtCharacter.Rows[0]["LastCommandResult"].ToString();
            _character.LastCommandValues = dtCharacter.Rows[0]["LastCommandValues"] == DBNull.Value ? null : dtCharacter.Rows[0]["LastCommandValues"].ToString();
            _character.LastCommandTotal = dtCharacter.Rows[0]["LastCommandTotal"] == DBNull.Value ? 0 : Convert.ToInt32(dtCharacter.Rows[0]["LastCommandTotal"]);
            _character.InventoryWeight = dtCharacter.Rows[0]["InventoryWeight"] == DBNull.Value ? 0 : Convert.ToDecimal(dtCharacter.Rows[0]["InventoryWeight"]);
            
            return _character;
        }
    }
}
