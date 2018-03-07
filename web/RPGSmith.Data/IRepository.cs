using System;
using System.Collections.Generic;
using System.Data.Entity.Core.Objects;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RPGSmith.Data
{
    public interface IRepository<T> : IDisposable where T : class
    {
        IQueryable<T> Fetch();
        IEnumerable<T> GetAll();
        IEnumerable<T> Find(Func<T, bool> predicate);
        T Single(Func<T, bool> predicate);
        T First(Func<T, bool> predicate);
        void Add(T entity);
        void Delete(T entity);
        void Attach(T entity);
        void SaveChanges();
        void SaveChanges(SaveOptions options);

        IEnumerable<T> ExecSQLWithStoreProcedure(string sql, params ObjectParameter[] parameters);
    }
}
