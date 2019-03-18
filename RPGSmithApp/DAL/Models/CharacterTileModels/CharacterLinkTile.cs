using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DAL.Models.CharacterTileModels
{
   public class CharacterLinkTile
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LinkTileId { get; set; }
       
        public int? CharacterTileId { get; set; }
      
        [MaxLength(50, ErrorMessage = "The field LinkType must be string with maximum length of 50 characters")]
        [Column(TypeName = "nvarchar(255)")]
        public string LinkType { get; set; }
      
        public int? SpellId { get; set; }
        public int? AbilityId { get; set; }
        public int? ItemId { get; set; }

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
        public virtual CharacterSpell Spell { get; set; }
        public virtual CharacterAbility Ability { get; set; }
        public virtual Item Item { get; set; }
    }
}
