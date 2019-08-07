using System;
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
                ||
                searchModel.SearchType == SP_SearchType.CharacterBuffAndEffect
                ||
                searchModel.SearchType == SP_SearchType.CharacterHandout
                )
            {
                bool isItem = (searchModel.SearchType == SP_SearchType.CharacterItems);
                bool isSpell = (searchModel.SearchType == SP_SearchType.CharacterSpells);
                bool isAbility = (searchModel.SearchType == SP_SearchType.CharacterAbilities);
                bool isBuffEffect = (searchModel.SearchType == SP_SearchType.CharacterBuffAndEffect);
                bool ishandout = (searchModel.SearchType == SP_SearchType.CharacterHandout);
                var res = _context.SearchFilter.Where(x => x.CharacterId == searchModel.CharacterID && x.IsCharacter == true && x.IsRuleSet == false && 
                        x.IsItem == isItem && x.IsSpell == isSpell && x.IsAbility == isAbility && x.IsBuffEffect== isBuffEffect && 
                        x.IsHandout == ishandout
                        ).FirstOrDefault();
                return res;
            }
           else if (searchModel.SearchType == SP_SearchType.Everything)
            {
                var res = _context.SearchFilter.Where(x => x.CharacterId == searchModel.CharacterID && x.RulesetId == searchModel.RulesetID 
                && x.IsCharacter == true && x.IsRuleSet == true).FirstOrDefault();
                return res;
            }
            else {
                bool isItem = (searchModel.SearchType == SP_SearchType.RulesetItems);
                bool isSpell = (searchModel.SearchType == SP_SearchType.RulesetSpells);
                bool isAbility = (searchModel.SearchType == SP_SearchType.RulesetAbilities);
                bool isBuffEffect = (searchModel.SearchType == SP_SearchType.RulesetBuffAndEffect);
                bool isMonster = (searchModel.SearchType == SP_SearchType.RulesetMonster);
                bool isMonsterTemplate = (searchModel.SearchType == SP_SearchType.RulesetMonsterTemplate);
                bool isLoot= (searchModel.SearchType == SP_SearchType.RulesetLoot);
                bool isLootTemplate = (searchModel.SearchType == SP_SearchType.RulesetLootTemplate);
                bool ishandout = (searchModel.SearchType == SP_SearchType.RulesetHandout);
                var res= _context.SearchFilter.Where(x => x.RulesetId == searchModel.RulesetID && x.IsRuleSet == true && x.IsCharacter == false &&
                        x.IsItem == isItem && x.IsSpell == isSpell && x.IsAbility == isAbility && 
                        x.IsBuffEffect == isBuffEffect && x.IsMonster == isMonster && x.IsMonsterTemplate == isMonsterTemplate &&
                        x.IsLoot == isLoot && x.IsLootTemplate == isLootTemplate && x.IsHandout == ishandout
                        ).FirstOrDefault();
                return res;
            }
        }
    }
}
