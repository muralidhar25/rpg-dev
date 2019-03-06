﻿using System;
using System.Collections.Generic;
using System.Text;
using DAL.Models;
using DAL.Repositories.Interfaces;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using DAL.Repositories;
using System.Linq.Expressions;
using DAL.Models.SPModels;

namespace DAL.Services
{
    public class SearchService : ISearchService
    {
        private readonly IRepository<Character> _repo;
        protected readonly ApplicationDbContext _context;
        private readonly ICharacterSpellService _characterSpellService;
        private readonly ICharacterAbilityService _characterAbilityService;
        private readonly IItemService _itemService;

        public SearchService(ApplicationDbContext context, IRepository<Character> repo
            , ICharacterSpellService characterSpellService, ICharacterAbilityService characterAbilityService, IItemService itemService)
        {
            _context = context;
            _repo = repo;
            _characterSpellService = characterSpellService;
            _characterAbilityService = characterAbilityService;
            _itemService = itemService;
        }

        public async Task<List<Character>> SearchCharacters(string query, string userId)
        {
            return _context.Characters
                .Where(x => x.UserId == userId && x.IsDeleted != true && (x.CharacterName.Contains(query) || x.CharacterDescription.Contains(query)))
                .ToList();
        }

        public SearchFilter getFilters(SearchModel searchModel)
        {
            if (
                searchModel.SearchType == SP_SearchType.CharacterAbilities
                ||
                searchModel.SearchType == SP_SearchType.CharacterSpells
                ||
                searchModel.SearchType == SP_SearchType.CharacterItems
                )
            {
                bool isItem = (searchModel.SearchType == SP_SearchType.CharacterItems);
                bool isSpell = (searchModel.SearchType == SP_SearchType.CharacterSpells);
                bool isAbility = (searchModel.SearchType == SP_SearchType.CharacterAbilities);
                return _context.SearchFilter.Where(x => x.CharacterId == searchModel.CharacterID && x.IsCharacter == true &&
                        x.IsItem == isItem && x.IsSpell == isSpell && x.IsAbility == isAbility
                        ).FirstOrDefault();
            }
            else {
                bool isItem = (searchModel.SearchType == SP_SearchType.RulesetItems);
                bool isSpell = (searchModel.SearchType == SP_SearchType.RulesetSpells);
                bool isAbility = (searchModel.SearchType == SP_SearchType.RulesetAbilities);
                return _context.SearchFilter.Where(x => x.RulesetId == searchModel.RulesetID && x.IsRuleSet == true &&
                        x.IsItem == isItem && x.IsSpell == isSpell && x.IsAbility == isAbility).FirstOrDefault();
            }
        }
    }
}