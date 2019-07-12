using System;
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
        private readonly IMonsterTemplateService _monsterTemplateService;
        public CombatService(IRepository<RuleSet> repo, ApplicationDbContext context, IConfiguration configuration,
            IMonsterTemplateService monsterTemplateService)
        {
            _repo = repo;
            _context = context;
            _configuration = configuration;
            _monsterTemplateService = monsterTemplateService;
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
                        isCharacterAbilityEnabled= Row["IsAbilityEnabled"] == DBNull.Value ? false : Convert.ToBoolean(Row["IsAbilityEnabled"]),
                        isCharacterSpellEnabled= Row["IsSpellEnabled"] == DBNull.Value ? false : Convert.ToBoolean(Row["IsSpellEnabled"]),
                        isCharacterItemEnabled= Row["IsItemEnabled"] == DBNull.Value ? false : Convert.ToBoolean(Row["IsItemEnabled"]),
                        isCharacterBuffAndEffectEnabled = Row["IsBuffAndEffectEnabled"] == DBNull.Value ? false : Convert.ToBoolean(Row["IsBuffAndEffectEnabled"]),

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

                            combat.CombatSettings.CampaignId = CampaignId;

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
                                IsCurrentTurn= CombatantRow["IsCurrentTurn"] == DBNull.Value ? false : Convert.ToBoolean(CombatantRow["IsCurrentTurn"]),
                                VisibilityColor= CombatantRow["VisibilityColor"] == DBNull.Value ? string.Empty : CombatantRow["VisibilityColor"].ToString(),
                                VisibleToPc = CombatantRow["VisibleToPc"] == DBNull.Value ? false : Convert.ToBoolean(CombatantRow["VisibleToPc"])
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
                                        HealthMax= CombatantRow["M_HealthMax"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["M_HealthMax"]),
                                        Command= CombatantRow["M_Command"] == DBNull.Value ? null : CombatantRow["M_Command"].ToString(),
                                        CommandName= CombatantRow["M_CommandName"] == DBNull.Value ? null : CombatantRow["M_CommandName"].ToString()
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
            var combatsetting = _context.CombatSettings.Where(x => x.CampaignId == model.CampaignId).FirstOrDefault();
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
        public List<CombatAllTypeMonsters> GetCombatAllTypeMonsters(int CampaignId) {
            List<MonsterWithItemCount> Monsters = _monsterTemplateService.SP_GetMonstersByRuleSetId(CampaignId, 1, 9999);
            List<MonsterTemplate_Bundle> MonsterTemplates = _monsterTemplateService.SP_GetMonsterTemplateByRuleSetId(CampaignId, 1, 9999);
            List<CombatAllTypeMonsters> allTypeMonsters = new List<CombatAllTypeMonsters>();

            foreach (var monster in Monsters)
            {
                CombatAllTypeMonsters obj = new CombatAllTypeMonsters()
                {
                    MonsterId = monster.MonsterId,
                    ImageUrl = monster.ImageUrl,
                    Name = monster.Name,
                };
                allTypeMonsters.Add(obj);
            }
            foreach (var monsterTemplate in MonsterTemplates)
            {
                CombatAllTypeMonsters obj = new CombatAllTypeMonsters()
                {
                    IsBundle= monsterTemplate.IsBundle,
                    BundleItems= monsterTemplate.BundleItems,
                    RandomizationEngine= monsterTemplate.RandomizationEngine,

                    MonsterTemplateId = monsterTemplate.MonsterTemplateId,
                    ImageUrl = monsterTemplate.ImageUrl,
                    Name = monsterTemplate.Name,
                    ArmorClass= monsterTemplate.ArmorClass,
                    ChallangeRating= monsterTemplate.ChallangeRating,
                    Command= monsterTemplate.Command,
                    CommandName= monsterTemplate.CommandName,
                    Description= monsterTemplate.Description,
                    Health= monsterTemplate.Health,
                    InitiativeCommand= monsterTemplate.InitiativeCommand,
                    IsMonster=false,
                    IsRandomizationEngine= monsterTemplate.IsRandomizationEngine,
                    Metatags= monsterTemplate.Metatags,
                    MonsterId=null,
                    MonsterTemplateCommands= monsterTemplate.MonsterTemplateCommands,
                    ParentMonsterTemplate= monsterTemplate.ParentMonsterTemplate,
                    ParentMonsterTemplateId= monsterTemplate.ParentMonsterTemplateId,
                    RuleSet= monsterTemplate.RuleSet,
                    RuleSetId= monsterTemplate.RuleSetId,
                   IsDeleted = monsterTemplate.IsDeleted,
                   Stats = monsterTemplate.Stats,
                    XPValue= monsterTemplate.XPValue,

                };
                allTypeMonsters.Add(obj);
            }
            return allTypeMonsters.OrderBy(x=>x.Name).ToList();
        }
        public void AddDeployedMonstersToCombat(List<CombatAllTypeMonsters> model)
        {
            foreach (var item in model)
            {
                var monster = _context.Monsters.Where(x => x.MonsterId == item.MonsterId && item.IsDeleted != true).FirstOrDefault();
                monster.AddToCombatTracker = true;
            }
            if (model.Count > 0)
            {
                _context.SaveChanges();
            }
        }
        public List<Monster> GetCombat_MonstersList(int campaignId) {
            return _context.Monsters.Where(x => x.RuleSetId == campaignId && x.IsDeleted != true && x.AddToCombatTracker == true).ToList();
        }
        public void RemoveMonsters(List<MonsterIds> monsterIds, bool deleteMonster) {

            List<CommonID> monsterIdList = monsterIds.Select(o => new CommonID()
            {               
                ID = o.MonsterId
            }).ToList();

            DataTable dt = utility.ToDataTable<CommonID>(monsterIdList);

            string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            try
            {
                using (SqlConnection con = new SqlConnection(consString))
                {
                    using (SqlCommand cmd = new SqlCommand("Combat_RemoveMonsters"))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Connection = con;
                        cmd.Parameters.AddWithValue("@MonsterIds", dt);
                        cmd.Parameters.AddWithValue("@DeleteMonster", deleteMonster);
                        con.Open();
                        var a = cmd.ExecuteNonQuery();
                        con.Close();
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public List<Combatant_ViewModel> SaveCombatantList(List<Combatant_DTModel> model, int campaignId, string UserId)
        {
            int index = 0;
            List<Combatant_DTModel> CombatList = model.Select(o => new Combatant_DTModel()
            {
                CharacterId=o.CharacterId,
                CombatId= o.CombatId,
                Id= o.Id,
                Initiative= o.Initiative,
                IsCurrentTurn= o.IsCurrentTurn,
                IsDeleted= o.IsDeleted,
                MonsterId= o.MonsterId,
                RowNum = index = Getindex(index),
                SortOrder = o.SortOrder,
                Type= o.Type,
                VisibilityColor= o.VisibilityColor,
                VisibleToPc= o.VisibleToPc,
            }).ToList();

            DataTable DTCombatantList = utility.ToDataTable<Combatant_DTModel>(CombatList);

            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            
            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("Combat_SaveCombatantList", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@CombatantList", DTCombatantList);
                command.Parameters.AddWithValue("@CampaignId", campaignId);
                command.Parameters.AddWithValue("@UserID", UserId);
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
                throw ex;
            }
            List<Combatant_ViewModel> combatant_s = new List<Combatant_ViewModel>();
            if (ds.Tables[0].Rows.Count > 0)
            {
                int? nullInt = null;
                foreach (DataRow CombatantRow in ds.Tables[0].Rows)
                {
                    Combatant_ViewModel combatant = new Combatant_ViewModel()
                    {
                        CharacterId = CombatantRow["CharacterId"] == DBNull.Value ? nullInt : Convert.ToInt32(CombatantRow["CharacterId"]),
                        InitiativeCommand = CombatantRow["InitiativeCommand"] == DBNull.Value ? string.Empty : CombatantRow["InitiativeCommand"].ToString(),
                        CombatId = CombatantRow["CombatId"] == DBNull.Value ? nullInt : Convert.ToInt32(CombatantRow["CombatId"]),
                        MonsterId = CombatantRow["MonsterId"] == DBNull.Value ? nullInt : Convert.ToInt32(CombatantRow["MonsterId"]),
                        SortOrder = CombatantRow["Id"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["Id"]),
                        Type = CombatantRow["Type"] == DBNull.Value ? string.Empty : CombatantRow["Type"].ToString(),
                        Id = CombatantRow["Id"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["Id"]),
                        IsCurrentTurn = CombatantRow["IsCurrentTurn"] == DBNull.Value ? false : Convert.ToBoolean(CombatantRow["IsCurrentTurn"]),
                        VisibilityColor = CombatantRow["VisibilityColor"] == DBNull.Value ? string.Empty : CombatantRow["VisibilityColor"].ToString(),
                        VisibleToPc = CombatantRow["VisibleToPc"] == DBNull.Value ? false : Convert.ToBoolean(CombatantRow["VisibleToPc"])
                        //Character = new Character(),
                        //Monster=new Monster()
                    };
                    if (combatant.CharacterId != null && combatant.Type == CombatantTypeCharacter)
                    {
                        if (combatant.CharacterId > 0)
                        {
                            combatant.Character = new Character()
                            {
                                CharacterId = CombatantRow["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["CharacterId"]),
                                CharacterName = CombatantRow["C_CharacterName"] == DBNull.Value ? string.Empty : CombatantRow["C_CharacterName"].ToString(),
                                ImageUrl = CombatantRow["C_ImageUrl"] == DBNull.Value ? string.Empty : CombatantRow["C_ImageUrl"].ToString(),
                            };
                        }
                    }
                    if (combatant.MonsterId != null && combatant.Type == CombatantTypeMonster)
                    {
                        if (combatant.MonsterId > 0)
                        {
                            combatant.Monster = new Monster()
                            {
                                MonsterId = CombatantRow["MonsterId"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["MonsterId"]),
                                Name = CombatantRow["M_Name"] == DBNull.Value ? string.Empty : CombatantRow["M_Name"].ToString(),
                                ImageUrl = CombatantRow["M_ImageUrl"] == DBNull.Value ? string.Empty : CombatantRow["M_ImageUrl"].ToString(),
                                HealthCurrent = CombatantRow["M_HealthCurrent"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["M_HealthCurrent"]),
                                HealthMax = CombatantRow["M_HealthMax"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["M_HealthMax"])
                            };
                        }
                    }
                    combatant_s.Add(combatant);
                }
            }
            return combatant_s;
        }
        public void Combat_Start(int combatId, bool start)
        {
            var combat = _context.Combats.Where(x => x.Id == combatId).FirstOrDefault();
            if (combat!=null)
            {
                combat.IsStarted = start;
                if (start)
                {
                    combat.Round = 1;
                    _context.SaveChanges();
                }
                else {
                    EndCombat(combatId);
                }
                
            }
        }

        private void EndCombat(int combatId)
        {
            var combatants = _context.CombatantLists.Where(x => x.CombatId == combatId).ToList();
            foreach (var combatant in combatants)
            {
                combatant.IsDeleted = true;
            }
            var combat = _context.Combats.Where(x => x.Id == combatId).FirstOrDefault();
            if (combat != null)
            {
                combat.IsDeleted = true;                
            }
            _context.SaveChanges();
        }
        public void SwitchCombatantTurn(Combatant_ViewModel model, int roundCount) {
            string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            try
            {
                using (SqlConnection con = new SqlConnection(consString))
                {
                    using (SqlCommand cmd = new SqlCommand("SwitchCombatantTurn"))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Connection = con;
                        cmd.Parameters.AddWithValue("@CombatantID", model.Id);
                        cmd.Parameters.AddWithValue("@CombatID", model.CombatId);
                        cmd.Parameters.AddWithValue("@RoundCount", roundCount);
                        con.Open();
                        var a = cmd.ExecuteNonQuery();
                        con.Close();
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        private static int Getindex(int index)
        {
            index = index + 1;
            return index;
        }
    }
}