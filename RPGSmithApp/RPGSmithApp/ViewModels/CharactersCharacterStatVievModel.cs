using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class CharactersCharacterStatViewModel
    {
       
        public int CharactersCharacterStatId { get; set; }      
        public int? CharacterStatId { get; set; }     
        public int? CharacterId { get; set; }
      
        public string Text { get; set; }       
        public string RichText { get; set; }
      
        public string Choice { get; set; }      
        public string MultiChoice { get; set; }
       
        public string Command { get; set; }

        public bool YesNo { get; set; }
        public bool OnOff { get; set; }

        public int Value { get; set; }
        public int SubValue { get; set; }
        public int Current { get; set; }
        public int Maximum { get; set; }
        public int CalculationResult { get; set; }
        public int Number { get; set; }

        public int DefaultValue { get; set; }
        public int Minimum { get; set; }
        public string ComboText { get; set; }

        public bool IsDeleted { get; set; }

        public bool Display { get; set; }
        public bool ShowCheckbox { get; set; }
        public bool IsCustom { get; set; }
        public int? CustomToggleId { get; set; }
        public bool IsYes { get; set; }
        public bool IsOn { get; set; }
        public string LinkType { get; set; }

        public virtual Character Character { get; set; }
        public virtual CharacterStat CharacterStat { get; set; }
        public virtual List<CharacterCustomToggle> CharacterCustomToggle { get; set; }
        public virtual ICollection<DAL.Models.CharacterTileModels.CharacterCharacterStatTile> CharacterStatTiles { get; set; }

        public List<CharacterStatChoice> SelectedCharacterChoices { get; set; }
    }
}
