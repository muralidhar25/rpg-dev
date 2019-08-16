using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.SPModels;
using NgChatSignalR.Models;

namespace DAL.Services
{
    public interface ICombatService
    {
      Task <Combat_ViewModel> GetCombatDetails(int CampaignId, ApplicationUser user, bool isPCView, int recentlyEndedCombatId);
        Task<Combat_ViewModel> GetCombatDetailsForPCUpdates(int CampaignId, ApplicationUser user);
        Task<CombatSetting> UpdateSettings(CombatSetting model);
        List<CombatAllTypeMonsters> GetCombatAllTypeMonsters(int CampaignId);
        void AddDeployedMonstersToCombat(List<CombatAllTypeMonsters> model);
        List<Monster> GetCombat_MonstersList(int campaignId);
        void RemoveMonsters(List<MonsterIds> monsterIds, bool deleteMonster, bool isFromCombatScreen, int CampaignId, int XP_Ruleset_CharacterStatID);
        List<Combatant_ViewModel> SaveCombatantList(List<Combatant_DTModel> model, int campaignId, string UserId);
        void Combat_Start(int combatId, bool start);
        void SwitchCombatantTurn(Combatant_ViewModel model, int roundCount);
        void SaveVisibilityDetails(Combatant_ViewModel model);
        void SaveMonsterHealth(Monster model);
        List<BuffAndEffect> SP_GetMonsterAssociateBEs(int monsterID, int rulesetId);
        void SaveCharacterHealth(CharacterHealthModel model);
        void saveTarget(Combatant_ViewModel model, bool isFromGMScreen = false);
        void SaveSortorder(List<Combatant_DTModel> model);
        void SaveDelayTurn(Combatant_ViewModel model);
        void saveSelectedCombatant(Combatant_ViewModel model);
        void updateMonsterDetails(Combatant_ViewModel model, string type);
        PCViewUpdates IsCombatUpdatedAndCurrentTurn(int combatId);
        void MarkCombatAsUpdated(int combatId);
        void MarkCombatAsUpdatedFalse(int combatId);
    }
}
