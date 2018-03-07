using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Core.EntityClient;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using RPGSmith.Data;

namespace RPGSmith.Data
{
    public partial class RPGSmithContext : DbContext
    {
      
        public RPGSmithContext(string connectionString) : base(connectionString)
        {
            this.Configuration.LazyLoadingEnabled = false;
            this.Configuration.ProxyCreationEnabled = false;
        }

        public static RPGSmithContext Create(string connectionString)
        {
            var entityBuilder = new EntityConnectionStringBuilder()
            {
                ProviderConnectionString = connectionString,
                Provider = "System.Data.SqlClient",

                // Set the Metadata location.
                Metadata = @"res://*/RPGSmith.csdl|res://*/RPGSmith.ssdl|res://*/RPGSmith.msl"
            };

            return new RPGSmithContext(entityBuilder.ConnectionString);
        }

        private void UpdateEntities()
        {
            DateTime now = DateTime.UtcNow;

            var changes = ChangeTracker.Entries().ToList();

            foreach (var entry in changes)
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        {
                            if (entry.Entity is IAuthored a)
                                a.Authored = now;
                        }
                        break;
                    case EntityState.Modified:
                        {
                            if (entry.Entity is IEdited e)
                                e.Edited = now;
                        }
                        break;
                }

            }
        }

        public override int SaveChanges()
        {
            UpdateEntities();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken)
        {
            UpdateEntities();
            return base.SaveChangesAsync(cancellationToken);
        }
       
    }
}
