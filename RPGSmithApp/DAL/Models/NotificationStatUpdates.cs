using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    [Table("NotificationStatUpdates")]
    public class NotificationStatUpdates
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int CharacterId { get; set; }

        [Required]
        public int CharacterStatId { get; set; }

        [Required]
        public string CharacterStatName { get; set; }

        [Required]
        public string CharacterStatValue { get; set; }

        public bool IsDeleted { get; set; }

        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime UpdatedDate { get; set; }

        //public virtual Character Character { get; set; }
    }
}
