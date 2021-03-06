﻿using DAL.Models;
using DAL.Models.SPModels;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels.EditModels
{
    public class EditMonsterTemplateModel
    {
        [Required]
        public int? MonsterTemplateId { get; set; }
        [Required]
        public int? RuleSetId { get; set; }

        [Required]
        public string Name { get; set; }

        public string Command { get; set; }


        public string CommandName { get; set; }


        public string Description { get; set; }
        public string gmOnly { get; set; }


        public string Stats { get; set; }


        public string ImageUrl { get; set; }


        public string Metatags { get; set; }

        public int? ParentMonsterTemplateId { get; set; }

        public bool IsDeleted { get; set; }

        public string Health { get; set; }
        public string ArmorClass { get; set; }
        public string XPValue { get; set; }
        public string ChallangeRating { get; set; }
        public string InitiativeCommand { get; set; }

        public bool IsRandomizationEngine { get; set; }



        public List<MonsterTemplateCommand> MonsterTemplateCommandVM { get; set; }

        public List<MonsterTemplateBuffAndEffect> MonsterTemplateBuffAndEffectVM { get; set; }
        public List<MonsterTemplateAbility> MonsterTemplateAbilityVM { get; set; }
        public List<MonsterTemplateSpell> MonsterTemplateSpellVM { get; set; }
        public List<MonsterTemplateMonster> MonsterTemplateAssociateMonsterTemplateVM { get; set; }
        public List<MonsterTemplateItemMaster> MonsterTemplateItemMasterVM { get; set; }
        public List<RandomizationEngine> RandomizationEngine { get; set; }
        public List<RandomizationSearch_ViewModel> RandomizationSearchInfo { get; set; }
        public List<MonsterTemplateCurrency> MonsterTemplateCurrency { get; set; }
        public List<MonsterTemplateRandomizationSearch> MonsterTemplateRandomizationSearch { get; set; }
    }

    public class EditMonsterModel: EditMonsterTemplateModel
    {

        [Required]
        public int MonsterId { get; set; }
        public int MonsterHealthCurrent { get; set; }
        public int MonsterHealthMax { get; set; }
        public int MonsterArmorClass { get; set; }
        public int MonsterXPValue { get; set; }
        public int MonsterChallangeRating { get; set; }
        public int? ParentMonsterId { get; set; }
        public List<ItemMasterForMonsterTemplate> MonsterTemplateItemVM { get; set; }
        public List<MonsterCurrency> MonsterCurrency { get; set; }
    }
}
