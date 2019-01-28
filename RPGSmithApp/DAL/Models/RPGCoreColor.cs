using DAL.Models.CharacterTileModels;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DAL.Models
{
   public class RPGCoreColor
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RPGCoreColorId { get; set; }  

        [Column(TypeName = "nvarchar(50)")]
        public string TitleTextColor { get; set; }

        [Column(TypeName = "nvarchar(50)")]
        public string TitleBgColor { get; set; }

        [Column(TypeName = "nvarchar(50)")]
        public string BodyTextColor { get; set; }

        [Column(TypeName = "nvarchar(50)")]
        public string BodyBgColor { get; set; }

        public bool IsDeleted { get; set; }
        //public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }

    }
}
