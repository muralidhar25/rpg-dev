using DAL.Models;
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
        Task<Spell> Create(Spell spell);
        Task<Spell> Update(Spell spell);
        Task<bool> Delete(int id);
        int GetCountByRuleSetId(int ruleSetId);
        int Core_GetCountByRuleSetId(int ruleSetId, int parentID);
        Task<bool> CheckDuplicateSpell(string value, int? Id,int? spellId = 0);
        void ToggleMemorizedSpell(int Id);
        List<Spell> Core_GetSpellsByRuleSetId(int ruleSetId, int ParentID);
        Task<Spell> Core_CreateSpell(Spell spell);
        bool Core_SpellWithParentIDExists(int spellID, int RulesetID);
        List<Spell> SP_GetSpellsByRuleSetId(int rulesetId, int page, int pageSize);
        List<SpellCommand> SP_GetSpellCommands(int spellId);
        List<Spell> GetSpellsByRuleSetId_add(int rulesetId);
    }
}
