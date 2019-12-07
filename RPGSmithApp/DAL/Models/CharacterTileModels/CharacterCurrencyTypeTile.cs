using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DAL.Models.CharacterTileModels
{
   public class CharacterCurrencyTypeTile
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CurrencyTypeTileId { get; set; }

        [MaxLength(255, ErrorMessage = "The field Title must be string with maximum length of 255 characters")]
        [Column(TypeName = "nvarchar(255)")]
        public string Title { get; set; }

        public int? CharacterTileId { get; set; }

        public bool ShowTitle { get; set; }    
        public bool IsDeleted { get; set; }

        [MaxLength(50, ErrorMessage = "The field Color must be string with maximum length of 50 characters")]
        [Column(TypeName = "nvarchar(50)")]
        public string TitleTextColor { get; set; }
        [MaxLength(50, ErrorMessage = "The field Color must be string with maximum length of 50 characters")]
        [Column(TypeName = "nvarchar(50)")]
        public string TitleBgColor { get; set; }
        [MaxLength(50, ErrorMessage = "The field Color must be string with maximum length of 50 characters")]
        [Column(TypeName = "nvarchar(50)")]
        public string BodyTextColor { get; set; }
        [MaxLength(50, ErrorMessage = "The field Color must be string with maximum length of 50 characters")]
        [Column(TypeName = "nvarchar(50)")]
        public string BodyBgColor { get; set; }

        public int Shape { get; set; }
        public int SortOrder { get; set; }

        public bool DisplayLinkImage { get; set; }

        public virtual CharacterTile CharacterTile { get; set; }
        
    }

    public class CharacterCurrencyTypeTileVM : CharacterCurrencyTypeTile
    {
        public virtual List<CharacterCurrency> CharacterCurrency { get; set; }
    }

}
//INSERT INTO[TileTypes] ([Name]) values('CurrencyTile')