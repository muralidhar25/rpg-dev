﻿using DAL.Models.RulesetTileModels;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DAL.Models.RulesetTileModels
{
   public class RulesetBuffAndEffectTile
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BuffAndEffectTileId { get; set; }
       
        public int? RulesetTileId { get; set; }

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
        //public virtual List<CharacterBuffAndEffect>  MultiBuffAndEffectsIds { get; set; }

        public virtual RulesetTile RulesetTile { get; set; }
        
    }
    //public class BuffAndEffectIdsForTile {
    //    [Key]
    //    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    //    public int Id { get; set; }
    //    public int BuffAndEffectTileId { get; set; }
    //    public int CharacterBuffAndEffectId { get; set; }

    //    public virtual CharacterBuffAndEffect CharacterBuffAndEffect { get; set; }
    //    public virtual CharacterBuffAndEffectTile BuffAndEffectTile { get; set; }
    //}
    public class RulesetBuffAndEffectTileVM : RulesetBuffAndEffectTile
    {
        public List<BuffAndEffect> MultiBuffAndEffectsIds { get; set; }
    }
}
//INSERT INTO[TileTypes] ([Name]) values('BuffAndEffectTile')