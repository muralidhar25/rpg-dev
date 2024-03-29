﻿using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Core;
using DAL.Models;
using DAL.Models.SPModels;
using DAL.Repositories.Interfaces;
using Dapper;
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
        private readonly ICharactersCharacterStatService _charactersCharacterStatServic;
        private readonly ICharacterStatChoiceService _characterStatChoiceService;
        private readonly IRuleSetService _ruleSetService;
        private readonly IMonsterTemplateCurrencyService _monsterTemplateCurrencyService;
        private readonly IMonsterCurrencyService _monsterCurrencyService;

        public CombatService(IRepository<RuleSet> repo, ApplicationDbContext context, IConfiguration configuration,
            IMonsterTemplateService monsterTemplateService, ICharactersCharacterStatService charactersCharacterStatServic,
            ICharacterStatChoiceService characterStatChoiceService, IRuleSetService ruleSetService,
            IMonsterTemplateCurrencyService monsterTemplateCurrencyService, IMonsterCurrencyService monsterCurrencyService)
        {
            _repo = repo;
            _context = context;
            _configuration = configuration;
            _monsterTemplateService = monsterTemplateService;
            _charactersCharacterStatServic = charactersCharacterStatServic;
            _characterStatChoiceService = characterStatChoiceService;
            _ruleSetService = ruleSetService;
            _monsterTemplateCurrencyService = monsterTemplateCurrencyService;
            _monsterCurrencyService = monsterCurrencyService;
        }

        public async Task<Combat_ViewModel> GetCombatDetails(int CampaignId, ApplicationUser user, bool isPCView, int recentlyEndedCombatId)
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
                command.Parameters.AddWithValue("@UserID", user.Id);
                command.Parameters.AddWithValue("@isPCView", isPCView);
                command.Parameters.AddWithValue("@recentlyEndedCombatId", recentlyEndedCombatId);

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
            try
            {
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
                            isCharacterAbilityEnabled = Row["IsAbilityEnabled"] == DBNull.Value ? false : Convert.ToBoolean(Row["IsAbilityEnabled"]),
                            isCharacterSpellEnabled = Row["IsSpellEnabled"] == DBNull.Value ? false : Convert.ToBoolean(Row["IsSpellEnabled"]),
                            isCharacterItemEnabled = Row["IsItemEnabled"] == DBNull.Value ? false : Convert.ToBoolean(Row["IsItemEnabled"]),
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

                                combat.CombatSettings.ShowMonsterNameByDefault =
                                    SettingRow["ShowMonsterNameByDefault"] == DBNull.Value ? false : Convert.ToBoolean(SettingRow["ShowMonsterNameByDefault"]);

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
                            decimal? nulldecimal = null;
                            foreach (DataRow CombatantRow in ds.Tables[3].Rows)
                            {
                                Combatant_ViewModel combatant = new Combatant_ViewModel()
                                {
                                    CharacterId = CombatantRow["CharacterId"] == DBNull.Value ? nullInt : Convert.ToInt32(CombatantRow["CharacterId"]),
                                    InitiativeCommand = CombatantRow["InitiativeCommand"] == DBNull.Value ? string.Empty : CombatantRow["InitiativeCommand"].ToString(),
                                    CombatId = CombatantRow["CombatId"] == DBNull.Value ? nullInt : Convert.ToInt32(CombatantRow["CombatId"]),
                                    MonsterId = CombatantRow["MonsterId"] == DBNull.Value ? nullInt : Convert.ToInt32(CombatantRow["MonsterId"]),
                                    SortOrder = CombatantRow["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["SortOrder"]),
                                    Type = CombatantRow["Type"] == DBNull.Value ? string.Empty : CombatantRow["Type"].ToString(),
                                    Id = CombatantRow["Id"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["Id"]),
                                    IsCurrentTurn = CombatantRow["IsCurrentTurn"] == DBNull.Value ? false : Convert.ToBoolean(CombatantRow["IsCurrentTurn"]),
                                    VisibilityColor = CombatantRow["VisibilityColor"] == DBNull.Value ? string.Empty : CombatantRow["VisibilityColor"].ToString(),
                                    VisibleToPc = CombatantRow["VisibleToPc"] == DBNull.Value ? false : Convert.ToBoolean(CombatantRow["VisibleToPc"]),
                                    ShowMonsterName = CombatantRow["ShowMonsterName"] == DBNull.Value ? false : Convert.ToBoolean(CombatantRow["ShowMonsterName"]),
                                    Initiative = CombatantRow["Initiative"] == DBNull.Value ? nulldecimal : Convert.ToDecimal(CombatantRow["Initiative"]),
                                    TargetId = CombatantRow["TargetId"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["TargetId"]),
                                    TargetType = CombatantRow["TargetType"] == DBNull.Value ? string.Empty : CombatantRow["TargetType"].ToString(),
                                    DelayTurn = CombatantRow["DelayTurn"] == DBNull.Value ? false : Convert.ToBoolean(CombatantRow["DelayTurn"]),
                                    IsCurrentSelected = CombatantRow["IsCurrentSelected"] == DBNull.Value ? false : Convert.ToBoolean(CombatantRow["IsCurrentSelected"]),
                                    IsPlayerCharacter = CombatantRow["IsPlayerCharacter"] == DBNull.Value ? false : Convert.ToBoolean(CombatantRow["IsPlayerCharacter"]),
                                    HiddenMonsterName= CombatantRow["HiddenMonsterName"] == DBNull.Value ? string.Empty : CombatantRow["HiddenMonsterName"].ToString()
                                    //Character = new Character(),
                                    //Monster=new Monster()

                                };
                                if (combatant.CharacterId != null && combatant.Type == CombatantTypeCharacter)
                                {
                                    if (combatant.CharacterId > 0)
                                    {

                                        combatant.Character = new Character_Combat_VM_ForCharCharStats()
                                        {
                                            CharacterId = CombatantRow["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["CharacterId"]),
                                            CharacterName = CombatantRow["C_CharacterName"] == DBNull.Value ? string.Empty : CombatantRow["C_CharacterName"].ToString(),
                                            ImageUrl = CombatantRow["C_ImageUrl"] == DBNull.Value ? string.Empty : CombatantRow["C_ImageUrl"].ToString(),
                                            Items = new List<Item>(),
                                            CharacterAbilities = new List<CharacterAbility>(),
                                            CharacterSpells = new List<CharacterSpell>(),
                                            CharacterBuffAndEffects = new List<CharacterBuffAndEffect>(),
                                            CharacterCommands = new List<CharacterCommand>(),
                                            CharacterDescription = CombatantRow["C_Description"] == DBNull.Value ? string.Empty : CombatantRow["C_Description"].ToString(),
                                            DiceRollViewModel = new DiceRollViewModel_Combat(),
                                            RuleSetId = CombatantRow["C_RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["C_RuleSetId"]),
                                            InventoryWeight = CombatantRow["C_InventoryWeight"] == DBNull.Value ? 0 : Convert.ToDecimal(CombatantRow["C_InventoryWeight"]),
                                            UserId= CombatantRow["UserId"] == DBNull.Value ? string.Empty : CombatantRow["UserId"].ToString(),
                                        };
                                        /////Getting CharacterCharacterStats Starts////////////////////////////////////////////////////////////////////////////
                                        try
                                        {
                                            //DiceRollModel diceRollModel = await _ruleSetService.GetDiceRollModelAsync((int)combatant.Character.RuleSetId, combatant.Character.CharacterId, user);
                                            //DiceRollViewModel diceRollViewModel = new DiceRollViewModel()
                                            //{
                                            //    Character = diceRollModel.Character == null ? new Character() : diceRollModel.Character,
                                            //    CharacterCommands = diceRollModel.CharacterCommands == null ? new List<CharacterCommand>() : diceRollModel.CharacterCommands,
                                            //    RulesetCommands = diceRollModel.RulesetCommands == null ? new List<RulesetCommand>() : diceRollModel.RulesetCommands,
                                            //    CharactersCharacterStats = diceRollModel.CharactersCharacterStats == null ? new List<CharactersCharacterStat>() : diceRollModel.CharactersCharacterStats,// Utilities.GetCharCharStatViewModelList( diceRollModel.CharactersCharacterStats,_characterStatChoiceService),
                                            //    CustomDices = utility.MapCustomDice(diceRollModel.CustomDices),
                                            //    DefaultDices = diceRollModel.DefaultDices,
                                            //    DiceTrays = diceRollModel.DiceTrays,
                                            //    IsGmAccessingPlayerCharacter = diceRollModel.IsGmAccessingPlayerCharacter,
                                            //    RuleSet = diceRollModel.RuleSet,
                                            //};
                                            //combatant.Character.DiceRollViewModel = diceRollViewModel;

                                            DiceRollViewModel_Combat diceRollModel =GetDiceRollModel_combatAsync((int)combatant.Character.RuleSetId, combatant.Character.CharacterId, user);
                                            combatant.Character.DiceRollViewModel = diceRollModel;

                                        }
                                        catch (Exception ex)
                                        {

                                        }
                                        /////Getting CharacterCharacterStats ends//////////////////////////////////////////////////////////////////////////////



                                        if (ds.Tables[4].Rows.Count > 0)
                                        {
                                            foreach (DataRow CharItemRow in ds.Tables[4].Rows)
                                            {
                                                int CurrentRunningCharacterId = CharItemRow["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(CharItemRow["CharacterId"]);
                                                if (CurrentRunningCharacterId == combatant.Character.CharacterId)
                                                {
                                                    Item i = new Item();
                                                    i.ItemId = CharItemRow["ItemId"] == DBNull.Value ? 0 : Convert.ToInt32(CharItemRow["ItemId"].ToString());
                                                    i.Name = CharItemRow["Name"] == DBNull.Value ? null : CharItemRow["Name"].ToString();
                                                    i.ItemImage = CharItemRow["ItemImage"] == DBNull.Value ? null : CharItemRow["ItemImage"].ToString();
                                                    i.IsVisible = CharItemRow["IsVisible"] == DBNull.Value ? false : Convert.ToBoolean(CharItemRow["IsVisible"]);
                                                    i.CharacterId = CurrentRunningCharacterId;
                                                    i.IsEquipped= CharItemRow["IsEquipped"] == DBNull.Value ? false : Convert.ToBoolean(CharItemRow["IsEquipped"]);
                                                    i.Quantity = CharItemRow["Quantity"] == DBNull.Value ? 0 : Convert.ToInt32(CharItemRow["Quantity"]);
                                                    i.IsConsumable = CharItemRow["IsConsumable"] == DBNull.Value ? false : Convert.ToBoolean(CharItemRow["IsConsumable"]);
                                                    i.Command = CharItemRow["Command"] == DBNull.Value ? null : CharItemRow["Command"].ToString();
                                                    i.CommandName = CharItemRow["CommandName"] == DBNull.Value ? null : CharItemRow["CommandName"].ToString();
                                                    i.Rarity = CharItemRow["Rarity"] == DBNull.Value ? null : CharItemRow["Rarity"].ToString();
                                                    i.Value = CharItemRow["Value"] == DBNull.Value ? 0 : Convert.ToInt32(CharItemRow["Value"]);
                                                    i.Weight = CharItemRow["Weight"] == DBNull.Value ? 0 : Convert.ToInt32(CharItemRow["Weight"]);
                                                    i.Volume = CharItemRow["Volume"] == DBNull.Value ? 0 : Convert.ToInt32(CharItemRow["Volume"]);
                                                    i.IsMagical = CharItemRow["IsMagical"] == DBNull.Value ? false : Convert.ToBoolean(CharItemRow["IsMagical"]);
                                                    i.IsContainer = CharItemRow["IsContainer"] == DBNull.Value ? false : Convert.ToBoolean(CharItemRow["IsContainer"]);
                                                    i.Description = CharItemRow["Description"] == DBNull.Value ? null : CharItemRow["Description"].ToString();
                                                    i.ItemStats = CharItemRow["ItemStats"] == DBNull.Value ? null : CharItemRow["ItemStats"].ToString();
                                                    i.gmOnly = CharItemRow["gmOnly"] == DBNull.Value ? null : CharItemRow["gmOnly"].ToString();
                                                    combatant.Character.Items.Add(i);
                                                }
                                            }
                                        }
                                        if (ds.Tables[5].Rows.Count > 0)
                                        {
                                            foreach (DataRow CharItemRow in ds.Tables[5].Rows)
                                            {
                                                int CurrentRunningCharacterId = CharItemRow["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(CharItemRow["CharacterId"]);
                                                if (CurrentRunningCharacterId == combatant.Character.CharacterId)
                                                {
                                                    CharacterAbility i = new CharacterAbility();
                                                    i.CharacterAbilityId = CharItemRow["CharacterAbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(CharItemRow["CharacterAbilityId"].ToString());
                                                    i.Ability = new Ability()
                                                    {
                                                        AbilityId = CharItemRow["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(CharItemRow["AbilityId"]),
                                                        Name = CharItemRow["Name"] == DBNull.Value ? null : CharItemRow["Name"].ToString(),
                                                        ImageUrl = CharItemRow["ImageUrl"] == DBNull.Value ? null : CharItemRow["ImageUrl"].ToString(),
                                                        IsEnabled = CharItemRow["IsEnabled"] == DBNull.Value ? false : Convert.ToBoolean(CharItemRow["IsEnabled"]),
                                                        Level = CharItemRow["Level"] == DBNull.Value ? null : CharItemRow["Level"].ToString(),
                                                        Description = CharItemRow["Description"] == DBNull.Value ? null : CharItemRow["Description"].ToString(),
                                                        Stats = CharItemRow["Stats"] == DBNull.Value ? null : CharItemRow["Stats"].ToString(),
                                                        gmOnly = CharItemRow["gmOnly"] == DBNull.Value ? null : CharItemRow["gmOnly"].ToString()
                                                    };
                                                    i.IsEnabled = CharItemRow["IsEnabled"] == DBNull.Value ? false : Convert.ToBoolean(CharItemRow["IsEnabled"]);
                                                    i.CharacterId = combatant.CharacterId;
                                                    combatant.Character.CharacterAbilities.Add(i);
                                                }
                                            }
                                        }
                                        if (ds.Tables[6].Rows.Count > 0)
                                        {
                                            foreach (DataRow CharItemRow in ds.Tables[6].Rows)
                                            {
                                                int CurrentRunningCharacterId = CharItemRow["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(CharItemRow["CharacterId"]);
                                                if (CurrentRunningCharacterId == combatant.Character.CharacterId)
                                                {
                                                    CharacterSpell i = new CharacterSpell();
                                                    i.CharacterSpellId = CharItemRow["CharacterSpellId"] == DBNull.Value ? 0 : Convert.ToInt32(CharItemRow["CharacterSpellId"].ToString());
                                                    i.Spell = new Spell()
                                                    {
                                                        SpellId = CharItemRow["SpellId"] == DBNull.Value ? 0 : Convert.ToInt32(CharItemRow["SpellId"]),
                                                        Name = CharItemRow["Name"] == DBNull.Value ? null : CharItemRow["Name"].ToString(),
                                                        ImageUrl = CharItemRow["ImageUrl"] == DBNull.Value ? null : CharItemRow["ImageUrl"].ToString(),
                                                        Memorized = CharItemRow["IsMemorized"] == DBNull.Value ? false : Convert.ToBoolean(CharItemRow["IsMemorized"]),
                                                        Levels = CharItemRow["Levels"] == DBNull.Value ? null : CharItemRow["Levels"].ToString(),
                                                        CastingTime = CharItemRow["CastingTime"] == DBNull.Value ? null : CharItemRow["CastingTime"].ToString(),
                                                        IsSomaticComponent = CharItemRow["IsSomaticComponent"] == DBNull.Value ? false : Convert.ToBoolean(CharItemRow["IsSomaticComponent"]),
                                                        IsVerbalComponent = CharItemRow["IsVerbalComponent"] == DBNull.Value ? false : Convert.ToBoolean(CharItemRow["IsVerbalComponent"]),
                                                        IsMaterialComponent = CharItemRow["IsMaterialComponent"] == DBNull.Value ? false : Convert.ToBoolean(CharItemRow["IsMaterialComponent"]),
                                                        Description = CharItemRow["Description"] == DBNull.Value ? null : CharItemRow["Description"].ToString(),
                                                        Stats = CharItemRow["Stats"] == DBNull.Value ? null : CharItemRow["Stats"].ToString(),
                                                        gmOnly = CharItemRow["gmOnly"] == DBNull.Value ? null : CharItemRow["gmOnly"].ToString()
                                                    };
                                                    i.IsMemorized = CharItemRow["IsMemorized"] == DBNull.Value ? false : Convert.ToBoolean(CharItemRow["IsMemorized"]);
                                                    i.CharacterId = combatant.CharacterId;
                                                    combatant.Character.CharacterSpells.Add(i);
                                                }
                                            }
                                        }
                                        if (ds.Tables[7].Rows.Count > 0)
                                        {
                                            foreach (DataRow CharItemRow in ds.Tables[7].Rows)
                                            {
                                                int CurrentRunningCharacterId = CharItemRow["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(CharItemRow["CharacterId"]);
                                                if (CurrentRunningCharacterId == combatant.Character.CharacterId)
                                                {
                                                    CharacterBuffAndEffect i = new CharacterBuffAndEffect();
                                                    i.CharacterBuffAandEffectId = CharItemRow["CharacterBuffAandEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(CharItemRow["CharacterBuffAandEffectId"].ToString());
                                                    i.BuffAndEffect = new BuffAndEffect()
                                                    {
                                                        BuffAndEffectId = CharItemRow["BuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(CharItemRow["BuffAndEffectId"]),
                                                        Name = CharItemRow["Name"] == DBNull.Value ? null : CharItemRow["Name"].ToString(),
                                                        ImageUrl = CharItemRow["ImageUrl"] == DBNull.Value ? null : CharItemRow["ImageUrl"].ToString(),
                                                        Description = CharItemRow["Description"] == DBNull.Value ? null : CharItemRow["Description"].ToString(),
                                                        Stats = CharItemRow["Stats"] == DBNull.Value ? null : CharItemRow["Stats"].ToString(),
                                                        gmOnly = CharItemRow["gmOnly"] == DBNull.Value ? null : CharItemRow["gmOnly"].ToString()
                                                    };
                                                    i.CharacterId = combatant.CharacterId;
                                                    combatant.Character.CharacterBuffAndEffects.Add(i);
                                                }
                                            }
                                        }
                                        if (ds.Tables[12].Rows.Count > 0)                                        {                                            foreach (DataRow CharCommandRow in ds.Tables[12].Rows)                                            {                                                int CurrentRunningCharacterId = CharCommandRow["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(CharCommandRow["CharacterId"]);                                                if (CurrentRunningCharacterId == combatant.Character.CharacterId)                                                {
                                                    CharacterCommand characterCommand = new CharacterCommand()                                                    {                                                        CharacterCommandId = CharCommandRow["CharacterCommandId"] == DBNull.Value ? 0 : Convert.ToInt32(CharCommandRow["CharacterCommandId"]),                                                        CharacterId = CharCommandRow["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(CharCommandRow["CharacterId"]),                                                        Command = CharCommandRow["Command"] == DBNull.Value ? null : CharCommandRow["Command"].ToString(),                                                        CreatedOn = CharCommandRow["CreatedOn"] == DBNull.Value ? new DateTime() : Convert.ToDateTime(CharCommandRow["CreatedOn"]),                                                        IsDeleted = CharCommandRow["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CharCommandRow["IsDeleted"]),                                                        UpdatedOn = CharCommandRow["UpdatedOn"] == DBNull.Value ? new DateTime() : Convert.ToDateTime(CharCommandRow["UpdatedOn"]),                                                        Name = CharCommandRow["Name"] == DBNull.Value ? null : CharCommandRow["Name"].ToString()                                                    };                                                    combatant.Character.CharacterCommands.Add(characterCommand);
                                                }                                            }                                        }
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
                                            HealthMax = CombatantRow["M_HealthMax"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["M_HealthMax"]),
                                            Command = CombatantRow["M_Command"] == DBNull.Value ? null : CombatantRow["M_Command"].ToString(),
                                            CommandName = CombatantRow["M_CommandName"] == DBNull.Value ? null : CombatantRow["M_CommandName"].ToString(),
                                            ItemMasterMonsterItems = new List<ItemMasterMonsterItem>(),
                                            MonsterAbilitys = new List<MonsterAbility>(),
                                            MonsterSpells = new List<MonsterSpell>(),
                                            MonsterBuffAndEffects = new List<MonsterBuffAndEffect>(),
                                            Description = CombatantRow["M_Description"] == DBNull.Value ? null : CombatantRow["M_Description"].ToString(),
                                            Stats = CombatantRow["M_Stats"] == DBNull.Value ? null : CombatantRow["M_Stats"].ToString(),
                                            XPValue = CombatantRow["M_XPValue"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["M_XPValue"]),
                                            ChallangeRating = CombatantRow["M_ChallangeRating"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["M_ChallangeRating"]),
                                            ArmorClass = CombatantRow["M_ArmorClass"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["M_ArmorClass"]),
                                            CharacterId = CombatantRow["M_CharacterID"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["M_CharacterID"]),
                                            gmOnly = CombatantRow["gmOnly"] == DBNull.Value ? null : CombatantRow["gmOnly"].ToString(),
                                        };

                                        //MonsterCurrency
                                        combatant.MonsterCurrency = await this._monsterCurrencyService.GetByMonsterId(combatant.Monster.MonsterId);

                                        if (ds.Tables[8].Rows.Count > 0)
                                        {
                                            foreach (DataRow MonsItemRow in ds.Tables[8].Rows)
                                            {
                                                int CurrentRunningMonsterId = MonsItemRow["MonsterId"] == DBNull.Value ? 0 : Convert.ToInt32(MonsItemRow["MonsterId"]);
                                                if (CurrentRunningMonsterId == combatant.Monster.MonsterId)
                                                {
                                                    ItemMasterMonsterItem i = new ItemMasterMonsterItem();
                                                    i.ItemId = MonsItemRow["ItemId"] == DBNull.Value ? 0 : Convert.ToInt32(MonsItemRow["ItemId"].ToString());
                                                    i.ItemName = MonsItemRow["ItemName"] == DBNull.Value ? null : MonsItemRow["ItemName"].ToString();
                                                    i.ItemImage = MonsItemRow["ItemImage"] == DBNull.Value ? null : MonsItemRow["ItemImage"].ToString();
                                                    i.Rarity = MonsItemRow["Rarity"] == DBNull.Value ? null : MonsItemRow["Rarity"].ToString();
                                                    i.Value = MonsItemRow["Value"] == DBNull.Value ? 0 : Convert.ToInt32(MonsItemRow["Value"]);
                                                    i.Weight = MonsItemRow["Weight"] == DBNull.Value ? 0 : Convert.ToInt32(MonsItemRow["Weight"]);
                                                    i.Volume = MonsItemRow["Volume"] == DBNull.Value ? 0 : Convert.ToInt32(MonsItemRow["Volume"]);
                                                    i.IsConsumable = MonsItemRow["IsConsumable"] == DBNull.Value ? false : Convert.ToBoolean(MonsItemRow["IsMagical"]);
                                                    i.IsMagical = MonsItemRow["IsMagical"] == DBNull.Value ? false : Convert.ToBoolean(MonsItemRow["IsMagical"]);
                                                    i.IsContainer = MonsItemRow["IsContainer"] == DBNull.Value ? false : Convert.ToBoolean(MonsItemRow["IsContainer"]);
                                                    i.ItemVisibleDesc = MonsItemRow["ItemVisibleDesc"] == DBNull.Value ? null : MonsItemRow["ItemVisibleDesc"].ToString();
                                                    i.ItemStats = MonsItemRow["ItemStats"] == DBNull.Value ? null : MonsItemRow["ItemStats"].ToString();
                                                    //i.gmOnly = MonsItemRow["gmOnly"] == DBNull.Value ? null : MonsItemRow["gmOnly"].ToString();
                                                    i.MonsterId = CurrentRunningMonsterId;
                                                    combatant.Monster.ItemMasterMonsterItems.Add(i);
                                                }
                                            }
                                        }
                                        if (ds.Tables[9].Rows.Count > 0)
                                        {
                                            foreach (DataRow MonsItemRow in ds.Tables[9].Rows)
                                            {
                                                int CurrentRunningMonsterId = MonsItemRow["MonsterId"] == DBNull.Value ? 0 : Convert.ToInt32(MonsItemRow["MonsterId"]);
                                                if (CurrentRunningMonsterId == combatant.Monster.MonsterId)
                                                {
                                                    MonsterAbility i = new MonsterAbility();
                                                    i.AbilityId = MonsItemRow["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(MonsItemRow["AbilityId"].ToString());
                                                    i.Ability = new Ability()
                                                    {
                                                        Name = MonsItemRow["Name"] == DBNull.Value ? null : MonsItemRow["Name"].ToString(),
                                                        ImageUrl = MonsItemRow["ImageUrl"] == DBNull.Value ? null : MonsItemRow["ImageUrl"].ToString(),
                                                        IsEnabled = MonsItemRow["IsEnabled"] == DBNull.Value ? false : Convert.ToBoolean(MonsItemRow["IsEnabled"]),
                                                        Level = MonsItemRow["Level"] == DBNull.Value ? null : MonsItemRow["Level"].ToString(),
                                                        Description = MonsItemRow["Description"] == DBNull.Value ? null : MonsItemRow["Description"].ToString(),
                                                        Stats = MonsItemRow["Stats"] == DBNull.Value ? null : MonsItemRow["Stats"].ToString(),
                                                        gmOnly = MonsItemRow["gmOnly"] == DBNull.Value ? null : MonsItemRow["gmOnly"].ToString()

                                                    };
                                                    i.MonsterId = CurrentRunningMonsterId;
                                                    combatant.Monster.MonsterAbilitys.Add(i);
                                                }
                                            }
                                        }
                                        if (ds.Tables[10].Rows.Count > 0)
                                        {
                                            foreach (DataRow MonsItemRow in ds.Tables[10].Rows)
                                            {
                                                int CurrentRunningMonsterId = MonsItemRow["MonsterId"] == DBNull.Value ? 0 : Convert.ToInt32(MonsItemRow["MonsterId"]);
                                                if (CurrentRunningMonsterId == combatant.Monster.MonsterId)
                                                {
                                                    MonsterSpell i = new MonsterSpell();
                                                    i.SpellId = MonsItemRow["SpellId"] == DBNull.Value ? 0 : Convert.ToInt32(MonsItemRow["SpellId"].ToString());
                                                    i.Spell = new Spell()
                                                    {
                                                        Name = MonsItemRow["Name"] == DBNull.Value ? null : MonsItemRow["Name"].ToString(),
                                                        ImageUrl = MonsItemRow["ImageUrl"] == DBNull.Value ? null : MonsItemRow["ImageUrl"].ToString(),
                                                        Memorized = MonsItemRow["Memorized"] == DBNull.Value ? false : Convert.ToBoolean(MonsItemRow["Memorized"]),
                                                        Levels = MonsItemRow["Levels"] == DBNull.Value ? null : MonsItemRow["Levels"].ToString(),
                                                        CastingTime = MonsItemRow["CastingTime"] == DBNull.Value ? null : MonsItemRow["CastingTime"].ToString(),
                                                        IsSomaticComponent = MonsItemRow["IsSomaticComponent"] == DBNull.Value ? false : Convert.ToBoolean(MonsItemRow["IsSomaticComponent"]),
                                                        IsVerbalComponent = MonsItemRow["IsVerbalComponent"] == DBNull.Value ? false : Convert.ToBoolean(MonsItemRow["IsVerbalComponent"]),
                                                        IsMaterialComponent = MonsItemRow["IsMaterialComponent"] == DBNull.Value ? false : Convert.ToBoolean(MonsItemRow["IsMaterialComponent"]),
                                                        Description = MonsItemRow["Description"] == DBNull.Value ? null : MonsItemRow["Description"].ToString(),
                                                        Stats = MonsItemRow["Stats"] == DBNull.Value ? null : MonsItemRow["Stats"].ToString(),
                                                        gmOnly = MonsItemRow["gmOnly"] == DBNull.Value ? null : MonsItemRow["gmOnly"].ToString()

                                                    };
                                                    i.MonsterId = CurrentRunningMonsterId;
                                                    combatant.Monster.MonsterSpells.Add(i);
                                                }
                                            }
                                        }
                                        if (ds.Tables[11].Rows.Count > 0)
                                        {
                                            foreach (DataRow MonsItemRow in ds.Tables[11].Rows)
                                            {
                                                int CurrentRunningMonsterId = MonsItemRow["MonsterId"] == DBNull.Value ? 0 : Convert.ToInt32(MonsItemRow["MonsterId"]);
                                                if (CurrentRunningMonsterId == combatant.Monster.MonsterId)
                                                {
                                                    MonsterBuffAndEffect i = new MonsterBuffAndEffect();
                                                    i.BuffAndEffectId = MonsItemRow["BuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(MonsItemRow["BuffAndEffectId"].ToString());
                                                    i.BuffAndEffect = new BuffAndEffect()
                                                    {
                                                        Name = MonsItemRow["Name"] == DBNull.Value ? null : MonsItemRow["Name"].ToString(),
                                                        ImageUrl = MonsItemRow["ImageUrl"] == DBNull.Value ? null : MonsItemRow["ImageUrl"].ToString(),
                                                        Description = MonsItemRow["Description"] == DBNull.Value ? null : MonsItemRow["Description"].ToString(),
                                                        Stats = MonsItemRow["Stats"] == DBNull.Value ? null : MonsItemRow["Stats"].ToString(),
                                                        gmOnly = MonsItemRow["gmOnly"] == DBNull.Value ? null : MonsItemRow["gmOnly"].ToString()

                                                    };
                                                    i.MonsterId = CurrentRunningMonsterId;
                                                    combatant.Monster.MonsterBuffAndEffects.Add(i);
                                                }
                                            }
                                        }
                                    }
                                }
                                combat.CombatantList.Add(combatant);
                            }
                        }
                    }
                }

            }
            catch (Exception ex)
            {
                throw ex;
            }
            return combat;


        }

        //public async Task<Combat_ViewModel> GetCombatDetailsNew(int CampaignId, ApplicationUser user, bool isPCView, int recentlyEndedCombatId)
        //{
        //    Combat_ViewModel combat = new Combat_ViewModel();

        //    var userType = _context.Set().FromSql("dbo.Combat_GetDetails @CampaignId = {0}, @UserID = {1}", CampaignId, user.Id, isPCView, recentlyEndedCombatId);
        //}
        private DiceRollViewModel_Combat GetDiceRollModel_combatAsync(int RulesetID, int CharacterID, ApplicationUser User)
        {

            DiceRollViewModel_Combat DiceRollModel = new DiceRollViewModel_Combat();

            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC Character_GetTilesByPageID @CharacterID = '" + characterId + "' ,@PageID='" + pageId + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("CharCharStatReferenced_GetByCharacterID", connection);
                //@CharacterID=@CharacterID,@page =1,@size =99999,@getResultForAddModScreen=0
                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@CharacterID", CharacterID);
                command.Parameters.AddWithValue("@page", 1);
                command.Parameters.AddWithValue("@size", 99999);
                command.Parameters.AddWithValue("@getResultForAddModScreen", false);
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

            if (ds.Tables[0].Rows.Count > 0) //Check Character Exists
            {
                DiceRollModel.Character = _repo.GetCharacter(ds.Tables[0]);
                DiceRollModel.Character.IsDicePublicRoll = ds.Tables[0].Rows[0]["IsDicePublicRoll"] == DBNull.Value ? false : Convert.ToBoolean(ds.Tables[0].Rows[0]["IsDicePublicRoll"]);

                DiceRollModel.CharactersCharacterStats = new List<CharactersCharacterStat>();
                if (ds.Tables[1].Rows.Count > 0)
                {
                    utility.FillCharacterCharacterStats(DiceRollModel.CharactersCharacterStats, ds);
                }

            }
            return DiceRollModel;

        }

        public async Task<CombatSetting> UpdateSettings(CombatSetting model)
        {
            var combatsetting = _context.CombatSettings.Where(x => x.CampaignId == model.CampaignId && x.IsDeleted != true).FirstOrDefault();
            if (combatsetting != null)
            {
                combatsetting.AccessMonsterDetails = model.AccessMonsterDetails;
                combatsetting.CharcterHealthStats = model.CharcterHealthStats;
                combatsetting.CharcterXpStats = model.CharcterXpStats;
                combatsetting.DisplayMonsterRollResultInChat = model.DisplayMonsterRollResultInChat;
                combatsetting.DropItemsForDeletedMonsters = model.DropItemsForDeletedMonsters;
                combatsetting.GameRoundLength = model.GameRoundLength;
                combatsetting.GroupInitFormula = model.GroupInitFormula;
                combatsetting.GroupInitiative = model.GroupInitiative;
                combatsetting.MonsterVisibleByDefault = model.MonsterVisibleByDefault;
                combatsetting.ShowMonsterNameByDefault = model.ShowMonsterNameByDefault;
                combatsetting.PcInitiativeFormula = model.PcInitiativeFormula;
                combatsetting.RollInitiativeEveryRound = model.RollInitiativeEveryRound;
                combatsetting.RollInitiativeForPlayer = model.RollInitiativeForPlayer;
                combatsetting.SeeMonsterBuffEffects = model.SeeMonsterBuffEffects;
                combatsetting.SeeMonsterItems = model.SeeMonsterItems;
                combatsetting.ShowMonsterHealth = model.ShowMonsterHealth;
                combatsetting.XPDistributionforDeletedMonster = model.XPDistributionforDeletedMonster;
                await _context.SaveChangesAsync();
                var combats = _context.Combats.Where(x => x.CampaignId == model.CampaignId && x.IsDeleted != true).ToList();
                foreach (var c in combats)
                {
                    MarkCombatAsUpdated(c.Id);
                }

            }
            return combatsetting;
        }
        public List<CombatAllTypeMonsters> GetCombatAllTypeMonsters(int CampaignId)
        {
            List<MonsterWithItemCount> Monsters = _monsterTemplateService.SP_GetMonstersByRuleSetId(CampaignId, 1, 9999).Monsters;
            List<MonsterTemplate_Bundle> MonsterTemplates = _monsterTemplateService.SP_GetMonsterTemplateByRuleSetId(CampaignId, 1, 9999).MonsterTemplates_Bundle;
            List<CombatAllTypeMonsters> allTypeMonsters = new List<CombatAllTypeMonsters>();

            Monsters = Monsters.Where(x => x.AddToCombatTracker != true).ToList();
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
                    IsBundle = monsterTemplate.IsBundle,
                    BundleItems = monsterTemplate.BundleItems,
                    RandomizationEngine = monsterTemplate.RandomizationEngine,

                    MonsterTemplateId = monsterTemplate.MonsterTemplateId,
                    ImageUrl = monsterTemplate.ImageUrl,
                    Name = monsterTemplate.Name,
                    ArmorClass = monsterTemplate.ArmorClass,
                    ChallangeRating = monsterTemplate.ChallangeRating,
                    Command = monsterTemplate.Command,
                    CommandName = monsterTemplate.CommandName,
                    Description = monsterTemplate.Description,
                    Health = monsterTemplate.Health,
                    InitiativeCommand = monsterTemplate.InitiativeCommand,
                    IsMonster = false,
                    IsRandomizationEngine = monsterTemplate.IsRandomizationEngine,
                    Metatags = monsterTemplate.Metatags,
                    MonsterId = null,
                    MonsterTemplateCommands = monsterTemplate.MonsterTemplateCommands,
                    ParentMonsterTemplate = monsterTemplate.ParentMonsterTemplate,
                    ParentMonsterTemplateId = monsterTemplate.ParentMonsterTemplateId,
                    RuleSet = monsterTemplate.RuleSet,
                    RuleSetId = monsterTemplate.RuleSetId,
                    IsDeleted = monsterTemplate.IsDeleted,
                    Stats = monsterTemplate.Stats,
                    XPValue = monsterTemplate.XPValue,

                };
                allTypeMonsters.Add(obj);
            }
            return allTypeMonsters.OrderBy(x => x.Name).ToList();
        }
        public void AddDeployedMonstersToCombat(List<CombatAllTypeMonsters> model)
        {         
            foreach (var item in model)
            {
                var monster = _context.Monsters.Where(x => x.MonsterId == item.MonsterId && x.IsDeleted != true).FirstOrDefault();
                monster.AddToCombatTracker = true;
                //var combatant=_context.CombatantLists.Where(x=>x.MonsterId== item.MonsterId)
            }
            if (model.Count > 0)
            {
                _context.SaveChanges();
            }
            if (model.Any())
            {
                var mon = model.FirstOrDefault();
                if (mon!=null)
                {
                    var monsterDetail = _context.Monsters.Where(x => x.MonsterId == mon.MonsterId && x.IsDeleted != true).FirstOrDefault();
                    if (monsterDetail != null)
                    {
                        var combats = _context.Combats.Where(x => x.CampaignId == monsterDetail.RuleSetId && x.IsDeleted != true).ToList();
                        foreach (var c in combats)
                        {
                            MarkCombatAsUpdated(c.Id);
                        }
                    }
                    
                }
               
            }
        }
        public List<Monster> GetCombat_MonstersList(int campaignId)
        {
            return _context.Monsters.Where(x => x.RuleSetId == campaignId && x.IsDeleted != true && x.AddToCombatTracker == true).ToList();
        }
        public void RemoveMonsters(List<MonsterIds> monsterIds, bool deleteMonster, bool isFromCombatScreen, int CampaignId, int XP_Ruleset_CharacterStatID)
        {

            if (isFromCombatScreen)
            {
                var CombatSettings = _context.CombatSettings.Where(x => x.CampaignId == CampaignId && x.IsDeleted != true).FirstOrDefault();
                if (CombatSettings != null)
                {
                    if (CombatSettings.XPDistributionforDeletedMonster)
                    {
                        var charactersCharacterStats = _context.CharactersCharacterStats.Where(x => x.CharacterStatId == XP_Ruleset_CharacterStatID && x.IsDeleted != true).Include(x => x.CharacterStat).ToList();

                        var monsters = _context.Monsters.Where(x => monsterIds.Select(mi => mi.MonsterId).Contains(x.MonsterId)).ToList();
                        foreach (var m in monsters)
                        {
                            if (m.XPValue > 0 && charactersCharacterStats.Count > 0)
                            {
                                // decimal decimalNumberToAdd = m.XPValue / charactersCharacterStats.Count;
                                double decimalNumberToAdd = (double)m.XPValue / (double)charactersCharacterStats.Count;
                                int NumberToAdd = Convert.ToInt32(decimalNumberToAdd);

                                foreach (var CC_Stat in charactersCharacterStats)
                                {
                                    switch (CC_Stat.CharacterStat.CharacterStatTypeId)
                                    {
                                        case (int)STAT_TYPE.Number:
                                            CC_Stat.Number = CC_Stat.Number == null ? 0 : CC_Stat.Number;
                                            CC_Stat.Number = CC_Stat.Number + NumberToAdd;
                                            break;
                                        default:
                                            break;
                                    }
                                }
                                _context.SaveChanges();
                            }

                        }
                    }

                    if (CombatSettings.DropItemsForDeletedMonsters)
                    {
                        foreach (var m in monsterIds)
                        {
                            var monsterItems = _context.ItemMasterMonsterItems.Where(x => x.MonsterId == m.MonsterId && x.IsDeleted != true)
                                .Select(x => new ItemMasterForMonsterTemplate()
                                {
                                    ItemId = x.ItemId,
                                    ItemMasterId = x.ItemMasterId,
                                })
                                .ToList();
                            _monsterTemplateService.DropItemsToLoot(monsterItems, m.MonsterId);
                        }
                    }

                }


            }

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

            var combats = _context.Combats.Where(x => x.CampaignId == CampaignId && x.IsDeleted != true).ToList();
            foreach (var c in combats)
            {
                MarkCombatAsUpdated(c.Id);
            }
        }
        public List<Combatant_ViewModel> SaveCombatantList(List<Combatant_DTModel> model, int campaignId, string UserId)
        {
            int index = 0;
            List<Combatant_DTModel> CombatList = model.Select(o => new Combatant_DTModel()
            {
                CharacterId = o.CharacterId,
                CombatId = o.CombatId,
                Id = o.Id,
                Initiative = o.Initiative,
                IsCurrentTurn = o.IsCurrentTurn,
                IsDeleted = o.IsDeleted,
                MonsterId = o.MonsterId,
                RowNum = index = Getindex(index),
                SortOrder = o.SortOrder,
                Type = o.Type,
                VisibilityColor = o.VisibilityColor,
                VisibleToPc = o.VisibleToPc,
                ShowMonsterName=o.ShowMonsterName
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
                        VisibleToPc = CombatantRow["VisibleToPc"] == DBNull.Value ? false : Convert.ToBoolean(CombatantRow["VisibleToPc"]),
                        ShowMonsterName = CombatantRow["ShowMonsterName"] == DBNull.Value ? false : Convert.ToBoolean(CombatantRow["ShowMonsterName"]),
                        TargetId = CombatantRow["TargetId"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["TargetId"]),
                        TargetType = CombatantRow["TargetType"] == DBNull.Value ? string.Empty : CombatantRow["TargetType"].ToString(),
                        DelayTurn = CombatantRow["DelayTurn"] == DBNull.Value ? false : Convert.ToBoolean(CombatantRow["DelayTurn"]),
                        IsCurrentSelected = CombatantRow["IsCurrentSelected"] == DBNull.Value ? false : Convert.ToBoolean(CombatantRow["IsCurrentSelected"]),
                        IsPlayerCharacter = CombatantRow["IsPlayerCharacter"] == DBNull.Value ? false : Convert.ToBoolean(CombatantRow["IsPlayerCharacter"])
                        //Character = new Character(),
                        //Monster=new Monster()
                    };
                    if (combatant.CharacterId != null && combatant.Type == CombatantTypeCharacter)
                    {
                        if (combatant.CharacterId > 0)
                        {
                            combatant.Character = new Character_Combat_VM_ForCharCharStats()
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
                                HealthMax = CombatantRow["M_HealthMax"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["M_HealthMax"]),
                                XPValue = CombatantRow["M_XPValue"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["M_XPValue"]),
                                ChallangeRating = CombatantRow["M_ChallangeRating"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["M_ChallangeRating"]),
                                ArmorClass = CombatantRow["M_ArmorClass"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["M_ArmorClass"]),
                            };
                        }
                    }
                    combatant_s.Add(combatant);
                }
            }

            if (model.Any())
            {
                if (model.FirstOrDefault().CombatId != null)
                {
                    MarkCombatAsUpdated((int)model.FirstOrDefault().CombatId);
                }
            }
            return combatant_s;
        }
        public void Combat_Start(int combatId, bool start)
        {
            var combat = _context.Combats.Where(x => x.Id == combatId).FirstOrDefault();
            if (combat != null)
            {
                combat.IsStarted = start;
                if (start)
                {
                    combat.Round = 1;
                    _context.SaveChanges();
                    AssignNamesToHiddenMonsters(combatId);
                }
                else
                {
                    EndCombat(combatId);
                }
                MarkCombatAsUpdated(combatId);
            }
        }

        private void AssignNamesToHiddenMonsters(int combatId)
        {
            string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            try
            {
                using (SqlConnection con = new SqlConnection(consString))
                {
                    using (SqlCommand cmd = new SqlCommand("Combat_AssignNamesToHiddenMonsters"))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@combatId", combatId);
                        cmd.Connection = con;                        
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
        public void SwitchCombatantTurn(Combatant_ViewModel model, int roundCount, bool CharacterHasChangedTurn = false)
        {
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
                        cmd.Parameters.AddWithValue("@CharacterHasChangedTurn", CharacterHasChangedTurn);
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
            //int combatId = model.CombatId == null ? 0 : (int)model.CombatId;
            //MarkCombatAsUpdated(combatId);
        }
        public void SaveVisibilityDetails(Combatant_ViewModel model)
        {
            var combatant = _context.CombatantLists.Where(x => x.Id == model.Id).FirstOrDefault();
            if (combatant != null)
            {
                combatant.VisibilityColor = model.VisibilityColor;
                combatant.VisibleToPc = model.VisibleToPc;
                combatant.ShowMonsterName = model.ShowMonsterName;
                _context.SaveChanges();

                int combatId = model.CombatId == null ? 0 : (int)model.CombatId;
                MarkCombatAsUpdated(combatId);
            }
        }
        public void SaveMonsterHealth(Monster model)
        {
            var monster = _context.Monsters.Where(x => x.MonsterId == model.MonsterId).FirstOrDefault();
            if (monster != null)
            {
                monster.HealthCurrent = model.HealthCurrent;
                monster.HealthMax = model.HealthMax;
                _context.SaveChanges();


                var combats = _context.Combats.Where(x => x.CampaignId == monster.RuleSetId && x.IsDeleted != true).ToList();
                foreach (var c in combats)
                {
                    MarkCombatAsUpdated(c.Id);
                }
            }
        }
        public void SaveCharacterHealth(CharacterHealthModel model)
        {
            var characterCharacterStat = _context.CharactersCharacterStats.Where(x => x.CharactersCharacterStatId == model.healthStatId && x.IsDeleted != true).Include(x => x.CharacterStat).FirstOrDefault();
            if (characterCharacterStat != null)
            {
                if (characterCharacterStat.CharacterStat.CharacterStatTypeId == (int)STAT_TYPE.Combo)
                {
                    characterCharacterStat.DefaultValue = model.healthCurrent;
                }
                if (characterCharacterStat.CharacterStat.CharacterStatTypeId == (int)STAT_TYPE.Number)
                {
                    characterCharacterStat.Number = model.healthCurrent;
                }
                if (characterCharacterStat.CharacterStat.CharacterStatTypeId == (int)STAT_TYPE.ValueSubValue)
                {
                    characterCharacterStat.Value = model.healthCurrent;
                    characterCharacterStat.SubValue = model.healthMax;
                }
                if (characterCharacterStat.CharacterStat.CharacterStatTypeId == (int)STAT_TYPE.CurrentMax)
                {
                    characterCharacterStat.Current = model.healthCurrent;
                    characterCharacterStat.Maximum = model.healthMax;
                }
                _context.SaveChanges();
                var combats = _context.Combats.Where(x => x.CampaignId == characterCharacterStat.CharacterStat.RuleSetId && x.IsDeleted != true).ToList();
                foreach (var c in combats)
                {
                    MarkCombatAsUpdated(c.Id);
                }
            }
        }
        public void saveTarget(Combatant_ViewModel model, bool isFromGMScreen = false)
        {
            var combatant = _context.CombatantLists.Where(x => x.Id == model.Id).FirstOrDefault();
            if (combatant != null)
            {
                combatant.TargetId = model.TargetId;
                combatant.TargetType = model.TargetType;

                //MarkCombatAsUpdated((int) model.CombatId);
                _context.SaveChanges();
                if (isFromGMScreen)
                {
                    MarkCombatAsUpdated((int)model.CombatId);
                }
                
            }
        }
        private static int Getindex(int index)
        {
            index = index + 1;
            return index;
        }
        public List<BuffAndEffect> SP_GetMonsterAssociateBEs_old(int monsterID, int rulesetId)
        {
            List<BuffAndEffect> res = new List<BuffAndEffect>();

            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;


            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("Monster_GetAssociateRecords", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@MonsterID", monsterID);
                command.Parameters.AddWithValue("@RulesetID", rulesetId);

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

            if (ds.Tables[3].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[3].Rows)
                {
                    BuffAndEffect i = new BuffAndEffect();
                    i.BuffAndEffectId = row["BuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(row["BuffAndEffectId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.Add(i);/////////
                }

            }

            return res;
        }

        public List<BuffAndEffect> SP_GetMonsterAssociateBEs(int monsterID, int rulesetId)
        {
           
            List<BuffAndEffect> res = new List<BuffAndEffect>();

            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            string qry = "EXEC Monster_GetAssociateRecords @MonsterID = '" + monsterID + "',@RulesetID = '" + rulesetId + "'";
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                try
                {
                    connection.Open();
                    var abilityrecord = connection.QueryMultiple(qry);
                    var monstercommand = abilityrecord.Read<MonsterCommand>().ToList();
                    var ability = abilityrecord.Read<Ability>().ToList();
                    var spell = abilityrecord.Read<Spell>().ToList();
                    res = abilityrecord.Read<BuffAndEffect>().ToList();
                }
                catch (Exception ex1)
                {
                    throw ex1;
                }
                finally
                {
                    connection.Close();
                }
            }
          
            return res;
        }

        public void SaveSortorder(List<Combatant_DTModel> model)
        {

            var oldCombatantList = _context.CombatantLists.Where(x => model.Select(y => y.Id).Contains(x.Id)).ToList();
            foreach (var oldCombatant in oldCombatantList)
            {
                if (model.Where(x => x.Id == oldCombatant.Id).Select(x => x.SortOrder).Any())
                {
                    oldCombatant.SortOrder = model.Where(x => x.Id == oldCombatant.Id).Select(x => x.SortOrder).FirstOrDefault();
                }
            }
            _context.SaveChanges();

            if (model.Any())
            {
                int combatId = model.FirstOrDefault().Id;
                MarkCombatAsUpdated(combatId);
            }

        }

        public void SaveDelayTurn(Combatant_ViewModel model)
        {
            var combatant = _context.CombatantLists.Where(x => x.Id == model.Id).FirstOrDefault();
            if (combatant != null)
            {
                combatant.DelayTurn = model.DelayTurn;
                _context.SaveChanges();

                int combatid = model.CombatId == null ? 0 : (int)model.CombatId;
                MarkCombatAsUpdated(combatid);
            }
        }

        public void saveSelectedCombatant(Combatant_ViewModel model)
        {
            var combatants = _context.CombatantLists.Where(x => x.CombatId == model.CombatId).ToList();
            foreach (var c in combatants)
            {
                c.IsCurrentSelected = false;
                if (c.Id == model.Id)
                {
                    c.IsCurrentSelected = model.IsCurrentSelected;
                }

                _context.SaveChanges();
            }
        }

        public void updateMonsterDetails(Combatant_ViewModel model, string type)
        {
            if (type == "Initiative")
            {
                var combatant = _context.CombatantLists.Where(x => x.Id == model.Id).FirstOrDefault();
                if (combatant != null)
                {
                    combatant.Initiative = model.Initiative;
                    _context.SaveChanges();
                }
            }
            else if (type == "Armor Class")
            {
                var monster = _context.Monsters.Where(x => x.MonsterId == model.MonsterId).FirstOrDefault();
                if (monster != null)
                {
                    monster.ArmorClass = model.Monster.ArmorClass;
                    _context.SaveChanges();
                }

            }
            else if (type == "Challenge Rating")
            {
                var monster = _context.Monsters.Where(x => x.MonsterId == model.MonsterId).FirstOrDefault();
                if (monster != null)
                {
                    monster.ChallangeRating = model.Monster.ChallangeRating;
                    _context.SaveChanges();
                }
            }
            else if (type == "Xp Value")
            {
                var monster = _context.Monsters.Where(x => x.MonsterId == model.MonsterId).FirstOrDefault();
                if (monster != null)
                {
                    monster.XPValue = model.Monster.XPValue;
                    _context.SaveChanges();
                }
            }
            int combatid = model.CombatId == null ? 0 : (int)model.CombatId;
            MarkCombatAsUpdated(combatid);
        }

        public PCViewUpdates IsCombatUpdatedAndCurrentTurn(int combatId)
        {
            try
            {
                bool isCombatUdated = false;
                int CurrentTurnCombatantId = 0;
                int CurrentRound = 0;
                var updateCombatFlagRec = _context.CombatUpdates.Where(x => x.CombatId == combatId).FirstOrDefault();
                if (updateCombatFlagRec != null)
                {
                    isCombatUdated = updateCombatFlagRec.IsUpdated;
                    //if (flag)
                    //{
                    //    updateCombatFlagRec.IsUpdated = false;
                    //    _context.SaveChanges();
                    //}                    
                }
                var combat = _context.Combats.Where(x => x.Id == combatId && x.IsDeleted != true).FirstOrDefault();
                if (combat!=null)
                {
                    CurrentRound = combat.Round;
                }

                var combatant = _context.CombatantLists.Where(x => x.CombatId == combatId && x.IsDeleted != true && x.IsCurrentTurn).FirstOrDefault();
                if (combatant!=null)
                {
                    CurrentTurnCombatantId = combatant.Id;                    
                }
                return new PCViewUpdates() { CurrentTurnCombatantId=CurrentTurnCombatantId , isCombatUdated= isCombatUdated, CurrentRound=CurrentRound };
            }
            catch (Exception ex) {
                return new PCViewUpdates() { CurrentTurnCombatantId = 0, isCombatUdated = false, CurrentRound=0 };
            }
        }

        public void MarkCombatAsUpdated(int combatId)
        {   //same code also written on monsterTemplateService.cs
            try
            {
                var updateCombatFlagRec = _context.CombatUpdates.Where(x => x.CombatId == combatId).FirstOrDefault();
                if (updateCombatFlagRec != null)
                {
                    //if (!updateCombatFlagRec.IsUpdated)
                    //{
                        updateCombatFlagRec.IsUpdated = true;
                        _context.SaveChanges();
                    //}
                }
                else
                {
                    _context.CombatUpdates.Add(new CombatUpdate { CombatId = combatId, IsUpdated = true });
                    _context.SaveChanges();
                }
            }
            catch (Exception ex) { }
        }
        public void MarkCombatAsUpdatedFalse(int combatId)
        {   //same code also written on monsterTemplateService.cs
            try
            {
                var updateCombatFlagRec = _context.CombatUpdates.Where(x => x.CombatId == combatId).FirstOrDefault();
                if (updateCombatFlagRec != null)
                {
                    //if (!updateCombatFlagRec.IsUpdated)
                    //{
                    updateCombatFlagRec.IsUpdated = false;
                    _context.SaveChanges();
                    //}
                }
                //else
                //{
                //    _context.CombatUpdates.Add(new CombatUpdate { CombatId = combatId, IsUpdated = false });
                //    _context.SaveChanges();
                //}
            }
            catch (Exception ex) { }
        }
        
        public bool update_hasCharacterChangedTurn(int combatId, bool flag)
        {   //same code also written on monsterTemplateService.cs
            try
            {
                var combat = _context.Combats.Where(x => x.Id == combatId).FirstOrDefault();
                
                if (combat != null)
                {
                    if (flag != combat.HasCharacterChangedTurn)
                    {
                        combat.HasCharacterChangedTurn = flag;
                        _context.SaveChanges();
                        return true;
                    }
                    else {
                        combat.HasCharacterChangedTurn = flag;
                        _context.SaveChanges();
                    }
                }    
                return false;
            }
            catch (Exception ex) { return false; }
        }
        public async Task<Combat_ViewModel> GetCombatDetailsForPCUpdates(int CampaignId, ApplicationUser user)
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
                command = new SqlCommand("Combat_GetDetails_PC_Updates", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@CampaignId", CampaignId);
                command.Parameters.AddWithValue("@UserID", user.Id);

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
            try
            {
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
                            CombatantList = new List<Combatant_ViewModel>(),
                        };
                        if (ds.Tables[1].Rows.Count > 0)
                        {
                            int? nullInt = null;
                            decimal? nulldecimal = null;
                            foreach (DataRow CombatantRow in ds.Tables[1].Rows)
                            {
                                Combatant_ViewModel combatant = new Combatant_ViewModel()
                                {
                                    CombatId = CombatantRow["CombatId"] == DBNull.Value ? nullInt : Convert.ToInt32(CombatantRow["CombatId"]),
                                    Id = CombatantRow["Id"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["Id"]),
                                    TargetId = CombatantRow["TargetId"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["TargetId"]),
                                    TargetType = CombatantRow["TargetType"] == DBNull.Value ? string.Empty : CombatantRow["TargetType"].ToString(),

                                    CharacterId = CombatantRow["CharacterId"] == DBNull.Value ? nullInt : Convert.ToInt32(CombatantRow["CharacterId"]),
                                    Type = CombatantRow["Type"] == DBNull.Value ? string.Empty : CombatantRow["Type"].ToString(),
                                    
                                };
                                if (combatant.CharacterId != null && combatant.Type == CombatantTypeCharacter)
                                {
                                    if (combatant.CharacterId > 0)
                                    {

                                        combatant.Character = new Character_Combat_VM_ForCharCharStats()
                                        {
                                            CharacterId = CombatantRow["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["CharacterId"]),
                                            CharacterName = CombatantRow["C_CharacterName"] == DBNull.Value ? string.Empty : CombatantRow["C_CharacterName"].ToString(),
                                            ImageUrl = CombatantRow["C_ImageUrl"] == DBNull.Value ? string.Empty : CombatantRow["C_ImageUrl"].ToString(),
                                            
                                            CharacterBuffAndEffects = new List<CharacterBuffAndEffect>(),
                                            CharacterDescription = CombatantRow["C_Description"] == DBNull.Value ? string.Empty : CombatantRow["C_Description"].ToString(),
                                            DiceRollViewModel = new DiceRollViewModel_Combat(),
                                            RuleSetId = CombatantRow["C_RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(CombatantRow["C_RuleSetId"]),
                                            InventoryWeight = CombatantRow["C_InventoryWeight"] == DBNull.Value ? 0 : Convert.ToDecimal(CombatantRow["C_InventoryWeight"])

                                        };
                                        /////Getting CharacterCharacterStats Starts////////////////////////////////////////////////////////////////////////////
                                        try
                                        {                                            
                                            DiceRollViewModel_Combat diceRollModel = GetDiceRollModel_combatAsync((int)combatant.Character.RuleSetId, combatant.Character.CharacterId, user);
                                            combatant.Character.DiceRollViewModel = diceRollModel;
                                        }
                                        catch (Exception ex)
                                        {

                                        }
                                        /////Getting CharacterCharacterStats ends//////////////////////////////////////////////////////////////////////////////

                                        
                                        if (ds.Tables[2].Rows.Count > 0)
                                        {
                                            foreach (DataRow CharItemRow in ds.Tables[2].Rows)
                                            {
                                                int CurrentRunningCharacterId = CharItemRow["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(CharItemRow["CharacterId"]);
                                                if (CurrentRunningCharacterId == combatant.Character.CharacterId)
                                                {
                                                    CharacterBuffAndEffect i = new CharacterBuffAndEffect();
                                                    i.CharacterBuffAandEffectId = CharItemRow["CharacterBuffAandEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(CharItemRow["CharacterBuffAandEffectId"].ToString());
                                                    i.BuffAndEffect = new BuffAndEffect()
                                                    {
                                                        BuffAndEffectId = CharItemRow["BuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(CharItemRow["BuffAndEffectId"]),
                                                        Name = CharItemRow["Name"] == DBNull.Value ? null : CharItemRow["Name"].ToString(),
                                                        ImageUrl = CharItemRow["ImageUrl"] == DBNull.Value ? null : CharItemRow["ImageUrl"].ToString(),
                                                        Description = CharItemRow["Description"] == DBNull.Value ? null : CharItemRow["Description"].ToString()
                                                    };
                                                    i.CharacterId = combatant.CharacterId;
                                                    combatant.Character.CharacterBuffAndEffects.Add(i);
                                                }
                                            }
                                        }
                                    }
                                    combat.CombatantList.Add(combatant);
                                }                                
                                
                            }
                            if (ds.Tables[3].Rows.Count > 0)                            {                                combat.CurrentCombatantTurnID = ds.Tables[3].Rows[0][0] == DBNull.Value ? 0 : Convert.ToInt32(ds.Tables[3].Rows[0][0]);                            }
                            if (ds.Tables[4].Rows.Count > 0)                            {                                combat.HasCharacterChangedTurn = ds.Tables[4].Rows[0][0]== DBNull.Value ? false : Convert.ToBoolean(ds.Tables[4].Rows[0][0]);                            }
                        }
                    }
                }

            }
            catch (Exception ex)
            {
                throw ex;
            }
            return combat;


        }
    }
}