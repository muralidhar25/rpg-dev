using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class Character
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CharacterId { get; set; }

        [Required]
        public string CharacterName { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string CharacterDescription { get; set; }

        [MaxLength(2048, ErrorMessage = "The field must be string with maximum length of 2048 characters")]
        [Column(TypeName = "nvarchar(2048)")]
        public string ImageUrl { get; set; }

        public string ThumbnailUrl { get; set; }
               
        public string UserId { get; set; }

        public virtual ApplicationUser AspNetUser { get; set; }

        [Required]
        public int? RuleSetId { get; set; }

        public int? ParentCharacterId { get; set; }

        public bool? IsDeleted { get; set; }

        public string LastCommand { get; set; }

        public string LastCommandResult { get; set; }

        //[DefaultValue(0)]
        public int LastCommandTotal { get; set; } 

        public string LastCommandValues { get; set; }

        public decimal InventoryWeight { get; set; }

        public virtual ICollection<Character> Characters1 { get; set; }

        public virtual Character Character1 { get; set; }

        public virtual RuleSet RuleSet { get; set; }

        public virtual ICollection<CharacterAbility> CharacterAbilities { get; set; }

        public virtual ICollection<CharacterSpell> CharacterSpells { get; set; }

        public virtual ICollection<Item> Items { get; set; }

        public virtual ICollection<CharacterCommand> CharacterCommands { get; set; }

        public virtual ICollection<CharactersCharacterStat> CharactersCharacterStats { get; set; }

        public virtual ICollection<CharacterDashboardPage> CharacterDashboardPages { get; set; }

        public virtual ICollection<CharacterTileModels.CharacterTile> CharacterTiles { get; set; }

    }
}
