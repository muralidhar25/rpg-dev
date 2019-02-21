using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
   public class CharactersCharacterStat
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CharactersCharacterStatId { get; set; }

        [Required]
        public int? CharacterStatId { get; set; }

        [Required]
        public int? CharacterId { get; set; }

        [Column(TypeName = "nvarchar(255)")]
        [MaxLength(255, ErrorMessage = "The field Text must be string with maximum length of 255 characters")]
        public string Text { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string RichText { get; set; }

        [MaxLength(255, ErrorMessage = "The field Choice must be string with maximum length of 255 characters")]
        [Column(TypeName = "nvarchar(255)")]
        public string Choice { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string MultiChoice { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Command { get; set; }

        public bool YesNo { get; set; }
        public bool OnOff { get; set; }

        public int Value { get; set; }
        public int SubValue { get; set; }
        public int Current { get; set; }
        public int Maximum { get; set; }
        public int CalculationResult { get; set; }
        public int? Number { get; set; }
        
        public int DefaultValue { get; set; }
        public int Minimum { get; set; }
        public string ComboText { get; set; }

        public bool IsDeleted { get; set; }

        public bool Display { get; set; }
        public bool ShowCheckbox { get; set; }
        public bool IsCustom { get; set; }
       
        public bool IsYes { get; set; }
        public bool IsOn { get; set; }

        [Column(TypeName = "nvarchar(8)")]
        public string LinkType { get; set; }
        //public bool IsLinkRecord { get; set; }

        public virtual Character Character { get; set; }
        public virtual CharacterStat CharacterStat { get; set; }

        public virtual ICollection<CharacterCustomToggle> CharacterCustomToggles { get; set; }
        

        public virtual ICollection<CharacterTileModels.CharacterCharacterStatTile> CharacterStatTiles { get; set; }
    }
}
