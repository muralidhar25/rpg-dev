using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DAL.Models.RulesetTileModels
{
  public  class RulesetToggleTile
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ToggleTileId { get; set; }
       
        public int? RulesetTileId { get; set; }
      
        [MaxLength(255, ErrorMessage = "The field Title must be string with maximum length of 255 characters")]
        [Column(TypeName = "nvarchar(255)")]
        public string Title { get; set; }
        
        public int? TileToggleId { get; set; }

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

        public bool IsManual { get; set; }
        public int FontSize { get; set; }

        public int Shape { get; set; }
        public int SortOrder { get; set; }
        public bool IsDeleted { get; set; }
        public bool OnOff { get; set; }
        public bool YesNo { get; set; }
        public bool CheckBox { get; set; }
        public int CustomValue { get; set; }

        public virtual TileToggle TileToggle { get; set; }
        public virtual RulesetTile RulesetTile { get; set; }
    }
}
