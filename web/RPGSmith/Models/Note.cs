using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmith.Web.Models
{
    public class Note
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int CharacterId { get; set; }
        public int UserId { get; set; }
        [Required]
        [MaxLength(128)]
        public string Name { get; set; }
        public string Content { get; set; }

        public virtual CharacterProfile Character { get; set; }
    }
}
