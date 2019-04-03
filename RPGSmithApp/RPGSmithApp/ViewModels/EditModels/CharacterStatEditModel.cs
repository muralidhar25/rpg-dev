using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class CharacterStatEditModel
    {
        public CharacterStatEditModel()
        {
            this.CharacterStatCalsComndViewModel = new List<CharacterStatCalsComndViewModel>();
            this.CharacterStatChoicesViewModels = new List<CharacterStatChoicesViewModel>();
            this.CharacterStatComboViewModel = new CharacterStatComboViewModel();
            this.CharacterStatToggleViewModel = new CharacterStatToggleViewModel();
        }

        public int CharacterStatId { get; set; }

        [Required(ErrorMessage = "RuleSetId is required")]
        public int? RuleSetId { get; set; }

        [Required(ErrorMessage = "Name is required"), StringLength(100, ErrorMessage = "Name of Character Stat must less than 100 characters.")]
        public string StatName { get; set; }

        [StringLength(4000, ErrorMessage = "Stat Description length not more than 4000 characters.")]
        public string StatDesc { get; set; }

        //[Required(ErrorMessage = "isMultiSelect is required")]
        public bool? isMultiSelect { get; set; }

        //[Required(ErrorMessage = "isActive is required")]
        public bool? isActive { get; set; }

        //[Required(ErrorMessage = "SortOrder is required")]
        public short? SortOrder { get; set; }

        public int? ParentCharacterStatId { get; set; }

        public short CharacterStatTypeId { get; set; }

        public Guid? StatIdentifier { get; set; }

        public bool AddToModScreen { get; set; }
        public bool IsChoiceNumeric { get; set; }
        public bool IsChoicesFromAnotherStat { get; set; }
        public int? SelectedChoiceCharacterStatId { get; set; }

        public List<CharacterStatCalsComndViewModel> CharacterStatCalsComndViewModel { get; set; }
        public List<CharacterStatChoicesViewModel> CharacterStatChoicesViewModels { get; set; }
        public CharacterStatComboViewModel CharacterStatComboViewModel { get; set; }
        public CharacterStatToggleViewModel CharacterStatToggleViewModel { get; set; }
        public List<CharacterStatDefaultValueViewModel> CharacterStatDefaultValueViewModel { get; set; }
        public List<CharacterStatConditionViewModel> CharacterStatConditionViewModel { get; set; }
    }
}
