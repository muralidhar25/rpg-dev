﻿using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.SPModels;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using NgChatSignalR.Models;

namespace DAL.Services
{
    public class CombatService : ICombatService
    {
        private readonly string CombatantTypeCharacter = "character";
        private readonly string CombatantTypeMonster = "monster";
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IRepository<RuleSet> _repo;
        public CombatService(IRepository<RuleSet> repo, ApplicationDbContext context, IConfiguration configuration)
        {
            _repo = repo;
            _context = context;
            _configuration = configuration;
        }

        public async Task<Combat_ViewModel> GetCombatDetails(int CampaignId, string UserID)
        {
            Combat_ViewModel combat = new Combat_ViewModel();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            // string qry = "EXEC ItemMasterGetAllDetailsByRulesetID_add @RulesetID = '" + rulesetId + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("Combat_GetDetails", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@CampaignId", CampaignId);
                command.Parameters.AddWithValue("@UserID", UserID);
                command.CommandType = CommandType.StoredProcedure;

                adapter.SelectCommand = command;

                adapter.Fill(ds);
                command.Dispose();
                connection.Close();
            }
            catch (Exception ex)
            {
                command.Dispose();
                connection.Close();
            }

            if (ds.Tables[0].Rows.Count > 0)
            {
                foreach (DataRow Row in ds.Tables[0].Rows)
                {
                    combat = new Combat_ViewModel()
                    {
                        CampaignId = Row["CampaignId"] == DBNull.Value ? 0 : Convert.ToInt32(Row["CampaignId"]),
                        Id = Row["Id"] == DBNull.Value ? 0 : Convert.ToInt32(Row["Id"]),
                        IsStarted = Row["IsStarted"] == DBNull.Value ? false : Convert.ToBoolean(Row["IsStarted"]),
                        Round = Row["Round"] == DBNull.Value ? 0 : Convert.ToInt32(Row["Round"]),
                        Campaign = new RuleSet(),
                        CombatantList = new List<Combatant_ViewModel>(),
                        CombatSettings = new CombatSetting(),                        

                    };

                    if (ds.Tables[1].Rows.Count > 0)
                    {
                        combat.Campaign = _repo.GetRuleset(ds.Tables[1]);
                    }

                    if (ds.Tables[2].Rows.Count > 0)
                    {
                        foreach (DataRow SettingRow in ds.Tables[2].Rows)
                        {
                            combat.CombatSettings.AccessMonsterDetails =
                                SettingRow["AccessMonsterDetails"] == DBNull.Value ? false : Convert.ToBoolean(SettingRow["AccessMonsterDetails"]);

                            combat.CombatSettings.CharcterHealthStats =
                                SettingRow["CharcterHealthStats"] == DBNull.Value ? string.Empty : SettingRow["CharcterHealthStats"].ToString();

                            combat.CombatSettings.CharcterXpStats =
                                SettingRow["CharcterXpStats"] == DBNull.Value ? string.Empty : SettingRow["CharcterXpStats"].ToString();

                            combat.CombatSettings.CombatId = combat.Id;

                            combat.CombatSettings.DisplayMonsterRollResultInChat =
                                SettingRow["DisplayMonsterRollResultInChat"] == DBNull.Value ? false : Convert.ToBoolean(SettingRow["DisplayMonsterRollResultInChat"]);

                            combat.CombatSettings.DropItemsForDeletedMonsters =
                                SettingRow["DropItemsForDeletedMonsters"] == DBNull.Value ? false : Convert.ToBoolean(SettingRow["DropItemsForDeletedMonsters"]);

                            combat.CombatSettings.GameRoundLength =
                                SettingRow["GameRoundLength"] == DBNull.Value ? 0 : Convert.ToInt32(SettingRow["GameRoundLength"]);

                            combat.CombatSettings.GroupInitFormula =
                                SettingRow["GroupInitFormula"] == DBNull.Value ? string.Empty : SettingRow["GroupInitFormula"].ToString();

                            combat.CombatSettings.GroupInitiative =
                                SettingRow["GroupInitiative"] == DBNull.Value ? false : Convert.ToBoolean(SettingRow["GroupInitiative"]);

                            combat.CombatSettings.MonsterVisibleByDefault =
                                SettingRow["MonsterVisibleByDefault"] == DBNull.Value ? false : Convert.ToBoolean(SettingRow["MonsterVisibleByDefault"]);

                            combat.CombatSettings.PcInitiativeFormula =
                                SettingRow["PcInitiativeFormula"] == DBNull.Value ? string.Empty : SettingRow["PcInitiativeFormula"].ToString();

                            combat.CombatSettings.RollInitiativeEveryRound =
                                SettingRow["RollInitiativeEveryRound"] == DBNull.Value ? false : Convert.ToBoolean(SettingRow["RollInitiativeEveryRound"]);

                            combat.CombatSettings.RollInitiativeForPlayer =
                                SettingRow["RollInitiativeForPlayer"] == DBNull.Value ? false : Convert.ToBoolean(SettingRow["RollInitiativeForPlayer"]);

                            combat.CombatSettings.SeeMonsterBuffEffects =
                                SettingRow["SeeMonsterBuffEffects"] == DBNull.Value ? false : Convert.ToBoolean(SettingRow["SeeMonsterBuffEffects"]);

                            combat.CombatSettings.SeeMonsterItems =
                                SettingRow["SeeMonsterItems"] == DBNull.Value ? false : Convert.ToBoolean(SettingRow["SeeMonsterItems"]);

                            combat.CombatSettings.ShowMonsterHealth =
                               SettingRow["ShowMonsterHealth"] == DBNull.Value ? false : Convert.ToBoolean(SettingRow["ShowMonsterHealth"]);

                            combat.CombatSettings.XPDistributionforDeletedMonster =
                               SettingRow["XPDistributionforDeletedMonster"] == DBNull.Value ? false : Convert.ToBoolean(SettingRow["XPDistributionforDeletedMonster"]);

                        }
                    }
                    if (ds.Tables[3].Rows.Count > 0)
                    {
                        int? nullInt = null;
                        foreach (DataRow CombatantRow in ds.Tables[3].Rows)
                        {
                            Combatant_ViewModel combatant = new Combatant_ViewModel() {
                                CharacterId= CombatantRow["CharacterId"] == DBNull.Value ? nullInt : Convert.ToInt32(CombatantRow["CharacterId"]),
                                InitiativeCommand= CombatantRow["InitiativeCommand"] == DBNull.Value ? string.Empty : CombatantRow["InitiativeCommand"].ToString(),
                                CombatId = CombatantRow["CombatId"] == DBNull.Value ? nullInt : Convert.ToInt32(CombatantRow["CombatId"]),
                                MonsterId= CombatantRow["MonsterId"] == DBNull.Value ? nullInt : Convert.ToInt32(CombatantRow["MonsterId"]),
                                SortOrder= CombatantRow["Id"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["Id"]),
                                Type= CombatantRow["Type"] == DBNull.Value ? string.Empty : CombatantRow["Type"].ToString(),
                                Id= CombatantRow["Id"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["Id"]),
                                //Character = new Character(),
                                //Monster=new Monster()
                        };
                            if (combatant.CharacterId!=null && combatant.Type== CombatantTypeCharacter)
                            {
                                if (combatant.CharacterId>0)
                                {
                                    combatant.Character = new  Character() {
                                        CharacterId= CombatantRow["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["CharacterId"]),
                                        CharacterName= CombatantRow["C_CharacterName"] == DBNull.Value ? string.Empty : CombatantRow["C_CharacterName"].ToString(),
                                        ImageUrl= CombatantRow["C_ImageUrl"] == DBNull.Value ? string.Empty : CombatantRow["C_ImageUrl"].ToString(),
                                    };
                                }
                            }
                            if (combatant.MonsterId != null && combatant.Type == CombatantTypeMonster)
                            {
                                if (combatant.MonsterId > 0)
                                {
                                    combatant.Monster = new Monster() {
                                        MonsterId = CombatantRow["MonsterId"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["MonsterId"]),
                                        Name = CombatantRow["M_Name"] == DBNull.Value ? string.Empty : CombatantRow["M_Name"].ToString(),
                                        ImageUrl = CombatantRow["M_ImageUrl"] == DBNull.Value ? string.Empty : CombatantRow["M_ImageUrl"].ToString(),
                                        HealthCurrent= CombatantRow["M_HealthCurrent"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["M_HealthCurrent"]),
                                        HealthMax= CombatantRow["M_HealthMax"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["M_HealthMax"])
                                    };
                                }
                            }
                            combat.CombatantList.Add(combatant);
                        }
                    }
                }
            }
            return combat;


        }
        public async Task<CombatSetting> UpdateSettings(CombatSetting model) {
            var combatsetting = _context.CombatSettings.Where(x => x.CombatId == model.CombatId).FirstOrDefault();
            if (combatsetting!=null)
            {
                combatsetting.AccessMonsterDetails=model.AccessMonsterDetails;
                combatsetting.CharcterHealthStats=model.CharcterHealthStats;
                combatsetting.CharcterXpStats=model.CharcterXpStats;
                combatsetting.DisplayMonsterRollResultInChat=model.DisplayMonsterRollResultInChat;
                combatsetting.DropItemsForDeletedMonsters=model.DropItemsForDeletedMonsters;
                combatsetting.GameRoundLength=model.GameRoundLength;
                combatsetting.GroupInitFormula=model.GroupInitFormula;
                combatsetting.GroupInitiative=model.GroupInitiative;
                combatsetting.MonsterVisibleByDefault=model.MonsterVisibleByDefault;
                combatsetting.PcInitiativeFormula=model.PcInitiativeFormula;
                combatsetting.RollInitiativeEveryRound=model.RollInitiativeEveryRound;
                combatsetting.RollInitiativeForPlayer=model.RollInitiativeForPlayer;
                combatsetting.SeeMonsterBuffEffects=model.SeeMonsterBuffEffects;
                combatsetting.SeeMonsterItems=model.SeeMonsterItems;
                combatsetting.ShowMonsterHealth=model.ShowMonsterHealth;
                combatsetting.XPDistributionforDeletedMonster = model.XPDistributionforDeletedMonster;
                await _context.SaveChangesAsync();                
            }
            return combatsetting;
        }
    }
}