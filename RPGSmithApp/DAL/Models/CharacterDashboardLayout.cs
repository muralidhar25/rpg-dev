using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
   public class CharacterDashboardLayout
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CharacterDashboardLayoutId { get; set; }

        [Required]
        public int? CharacterId { get; set; }

        [Required]
        [MaxLength(255, ErrorMessage = "The field Name must be string with maximum length of 255 characters")]
        [Column(TypeName = "nvarchar(255)")]
        public string Name { get; set; }

        public bool IsDefaultLayout { get; set; }
        public Nullable<int> DefaultPageId { get; set; }

        public int LayoutHeight { get; set; }
        public int LayoutWidth { get; set; }

        public int SortOrder { get; set; }
     
        public bool IsDeleted { get; set; }

        public virtual ICollection<CharacterDashboardPage> CharacterDashboardPages { get; set; }

        


    }
}
