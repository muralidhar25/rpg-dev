using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
   public class CombatantList
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int? CombatId { get; set; }
        public virtual Combat Combat { get; set; }

        [Column(TypeName = "nvarchar(100)")]
        public string Type { get; set; }

        public int? CharacterId { get; set; }
        public virtual Character Character { get; set; }

        public int? MonsterId { get; set; }
        public virtual Monster Monster { get; set; }

        public int SortOrder { get; set; }        

        public decimal? Initiative { get; set; }

        public bool IsDeleted { get; set; }

        public bool VisibleToPc { get; set; }

        [Column(TypeName = "nvarchar(100)")]
        public string VisibilityColor { get; set; }

        public bool IsCurrentTurn { get; set; }

        public int TargetId { get; set; }

        [Column(TypeName = "nvarchar(100)")]
        public string TargetType { get; set; }

        public bool DelayTurn { get; set; }
        public bool IsCurrentSelected { get; set; }
        public bool ShowMonsterName { get; set; }
    }
}
