using DAL.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace DAL.Models
{
    public class MonsterTemplateRandomizationSearch
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RandomizationSearchId { get; set; }
        public int MonsterTemplateId { get; set; }

        public string Quantity { get; set; }
        public string String { get; set; }
        public string ItemRecord { get; set; }
        public bool IsAnd { get; set; }
        public int SortOrder { get; set; }
        public bool IsDeleted { get; set; }

        public virtual MonsterTemplate MonsterTemplate { get; set; }
        public virtual ICollection<MonsterTemplateRandomizationSearchFields> Fields { get; set; }
    }

    public class MonsterTemplateRandomizationSearchFields
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsDeleted { get; set; }

        public int RandomizationSearchId { get; set; }
        public virtual MonsterTemplateRandomizationSearch MonsterTemplateRandomizationSearch { get; set; }
    }
}
