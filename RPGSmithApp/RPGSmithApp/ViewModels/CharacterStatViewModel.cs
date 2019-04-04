using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class CharacterStatViewModel
    {
        public CharacterStatViewModel()
        {
            this.CharacterStatCalsComndViewModel = new List<CharacterStatCalsComndViewModel>();
            this.CharacterStatChoicesViewModels = new List<CharacterStatChoicesViewModel>();
            this.CharacterStatTypeViewModel = new CharacterStatTypeViewModel();
        }

        public int CharacterStatId { get; set; }
        public int RuleSetId { get; set; }
        public string StatName { get; set; }
        public string StatDesc { get; set; }
        public bool isMultiSelect { get; set; }
        public bool isActive { get; set; }
        public bool AddToModScreen { get; set; }
        public bool IsChoiceNumeric { get; set; }
        public bool IsChoicesFromAnotherStat { get; set; }
        public int? SelectedChoiceCharacterStatId { get; set; }
        public short SortOrder { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public int? ParentCharacterStatId { get; set; }
        public Guid? StatIdentifier { get; set; }

        public CharacterStatTypeViewModel CharacterStatTypeViewModel { get; set; }
        public List<CharacterStatCalsComndViewModel> CharacterStatCalsComndViewModel { get; set; }
        public List<CharacterStatChoicesViewModel> CharacterStatChoicesViewModels { get; set; }
        public CharacterStatComboViewModel CharacterStatComboViewModel { get; set; }
        public CharacterStatToggleViewModel CharacterStatToggleViewModel { get; set; }
        public List<CharacterStatDefaultValueViewModel> CharacterStatDefaultValueViewModel { get; set; }
        public List<CharacterStatConditionViewModel> CharacterStatConditionViewModel { get; set; }
    }
}
