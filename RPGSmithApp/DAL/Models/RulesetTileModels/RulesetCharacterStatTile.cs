using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models.RulesetTileModels
{
    public class RulesetCharacterStatTile
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CharacterStatTileId { get; set; }

        public int? RulesetTileId { get; set; }
        public int? CharacterStatId { get; set; }
        public bool ShowTitle { get; set; }

        [MaxLength(50, ErrorMessage = "The field Color must be string with maximum length of 50 characters")]
        [Column(TypeName = "nvarchar(50)")]
        public string titleTextColor { get; set; }
        [MaxLength(50, ErrorMessage = "The field Color must be string with maximum length of 50 characters")]
        [Column(TypeName = "nvarchar(50)")]
        public string titleBgColor { get; set; }
        [MaxLength(50, ErrorMessage = "The field Color must be string with maximum length of 50 characters")]
        [Column(TypeName = "nvarchar(50)")]
        public string bodyTextColor { get; set; }
        [MaxLength(50, ErrorMessage = "The field Color must be string with maximum length of 50 characters")]
        [Column(TypeName = "nvarchar(50)")]
        public string bodyBgColor { get; set; }

        public String ImageUrl { get; set; }
        public int Shape { get; set; }
        public int SortOrder { get; set; }
        public bool IsDeleted { get; set; }

        public virtual RulesetTile RulesetTile { get; set; }
        public virtual CharacterStat CharacterStat { get; set; }
    }
}
