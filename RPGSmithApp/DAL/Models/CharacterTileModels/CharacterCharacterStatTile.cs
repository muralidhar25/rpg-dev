using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models.CharacterTileModels
{
    public class CharacterCharacterStatTile
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CharacterStatTileId { get; set; }

        public int? CharacterTileId { get; set; }

        public int? CharactersCharacterStatId { get; set; }

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

        public bool DisplayLinkImage { get; set; }
        public virtual CharacterTile CharacterTile { get; set; }
        public virtual CharactersCharacterStat CharactersCharacterStat { get; set; }
    }
}
