﻿using DAL.Models;
using DAL.Models.SPModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
  public interface ICharacterAbilityService
    {
        Task<CharacterAbility> InsertCharacterAbility(CharacterAbility characterAbility);
        Task<CharacterAbility> UpdateCharacterAbility(CharacterAbility characterAbility);
        List<CharacterAbility> GetAll();
        CharacterAbility GetById(int? id);
        List<CharacterAbility> GetByCharacterId(int characterId);
        List<CharacterAbility> GetByCharacterId(int characterId, int page, int pageSize);
        int GetCountByCharacterId(int characterId);
        Task<bool> DeleteCharacterAbility(int id);
        bool DeleteCharacterAbilityNotAsync(int id);
        void ToggleEnableCharacterAbility(int id);
        (bool, string) CheckCharacterAbilityExist(int characterId, int abilityId);
        CharacterAbility GetByAbilityId(int abilityId);
        (CharacterAbilityListWithFilterCount, Character, RuleSet) SP_CharacterAbility_GetByCharacterId(int characterId, int rulesetId, int page, int pageSize, int sortType = 1);
        List<CharacterAbility> GetAbilityByCharacterId(int characterId);
        void removeMultiAbilities(List<CharacterAbility> model, int rulesetId);
    }
}
