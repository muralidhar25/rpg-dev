using DAL.Models;
using DAL.Models.SPModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface ISpellService
    {
        Spell GetById(int? id);
        List<Spell> GetSpellsByRuleSetId(int ruleSetId);
        List<Spell> GetAll();
        Task<Spell> Create(Spell spell,List<SpellBuffAndEffect> SpellBuffAndEffectVM);
        Task<Spell> Update(Spell spell, List<SpellBuffAndEffect> SpellBuffAndEffectVM);
        Task<bool> Delete(int id);
        int GetCountByRuleSetId(int ruleSetId);
        int Core_GetCountByRuleSetId(int ruleSetId, int parentID);
        Task<bool> CheckDuplicateSpell(string value, int? Id,int? spellId = 0);
        void ToggleMemorizedSpell(int Id);
        List<Spell> Core_GetSpellsByRuleSetId(int ruleSetId, int ParentID);
        Task<Spell> Core_CreateSpell(Spell spell, List<SpellBuffAndEffect> SpellBuffAndEffectVM);
        bool Core_SpellWithParentIDExists(int spellID, int RulesetID);
        List<Spell> SP_GetSpellsByRuleSetId(int rulesetId, int page, int pageSize);
        SpellAssociatedRecords SP_GetSpellCommands(int spellId, int RuleSetID);
        List<Spell> GetSpellsByRuleSetId_add(int rulesetId);
    }
}
