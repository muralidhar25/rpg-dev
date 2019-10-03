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

namespace DAL.Services
{
    public class MonsterTemplateService : IMonsterTemplateService
    {
        private readonly IRepository<MonsterTemplate> _repo;
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IItemMasterService _itemMasterService;
        public MonsterTemplateService(
            ApplicationDbContext context, 
            IRepository<MonsterTemplate> repo, 
            IConfiguration configuration, 
            IItemMasterService itemMasterService
            )
        {
            _repo = repo;
            _context = context;
            this._configuration = configuration;
            this._itemMasterService = itemMasterService;           
        }

        public async Task<MonsterTemplate> Create(MonsterTemplate item)
        {
            return await _repo.Add(item);
        }
        public async Task<bool> DeleteMonster(int monsterId)
        {
            //remove monsters Items
            var monsterItems = _context.ItemMasterMonsterItems.Where(x => x.MonsterId == monsterId).ToList();
            foreach (var item in monsterItems)
            {
                item.IsDeleted = true;
            }

            //remove monsters Spells
            var monsterSpells = _context.MonsterSpells.Where(x => x.MonsterId == monsterId).ToList();
            foreach (var item in monsterSpells)
            {
                item.IsDeleted = true;
            }

            //remove monsters Abilities
            var monsterAbilities = _context.MonsterAbilitys.Where(x => x.MonsterId == monsterId).ToList();
            foreach (var item in monsterAbilities)
            {
                item.IsDeleted = true;
            }

            //remove monsters B&E
            var monsterBE = _context.MonsterBuffAndEffects.Where(x => x.MonsterId == monsterId).ToList();
            foreach (var item in monsterBE)
            {
                item.IsDeleted = true;
            }

            //remove monsters Commands
            var monsterCmds = _context.MonsterCommands.Where(x => x.MonsterId == monsterId).ToList();
            foreach (var item in monsterCmds)
            {
                item.IsDeleted = true;
            }

            var monster = _context.Monsters.Where(x => x.MonsterId == monsterId).FirstOrDefault();
            if (monster != null)
            {
                monster.IsDeleted = true;
            }

            try
            {
                _context.SaveChanges();
                await AssignMonsterTocharacter(new AssociateMonsterToCharacter { CharacterId = null, MonsterId = monsterId });
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public async Task<bool> Delete(int id)
        {
            // Remove associated Commands
            var MTC = _context.MonsterTemplateCommands.Where(x => x.MonsterTemplateId == id && x.IsDeleted != true).ToList();

            foreach (MonsterTemplateCommand item in MTC)
            {
                item.IsDeleted = true;
            }

            // Remove deployed Monsters
            var m = _context.Monsters.Where(x => x.MonsterTemplateId == id && x.IsDeleted != true).ToList();

            foreach (Monster item in m)
            {
                item.IsDeleted = true;
            }

            // Remove associated Buffs
            var mtbe = _context.MonsterTemplateBuffAndEffects.Where(x => x.MonsterTemplateId == id && x.IsDeleted != true).ToList();

            foreach (MonsterTemplateBuffAndEffect item in mtbe)
            {
                item.IsDeleted = true;
            }

            // Remove associated Ability
            var mta = _context.MonsterTemplateAbilities.Where(x => x.MonsterTemplateId == id && x.IsDeleted != true).ToList();

            foreach (MonsterTemplateAbility item in mta)
            {
                item.IsDeleted = true;
            }

            // Remove associated Spell
            var mts = _context.MonsterTemplateSpells.Where(x => x.MonsterTemplateId == id && x.IsDeleted != true).ToList();

            foreach (MonsterTemplateSpell item in mts)
            {
                item.IsDeleted = true;
            }

            // Remove associated monsterTemplates
            var mtm = _context.MonsterTemplateMonsters.Where(x => x.MonsterTemplateId == id && x.IsDeleted != true).ToList();

            foreach (MonsterTemplateMonster item in mtm)
            {
                item.IsDeleted = true;
            }

            // Remove Itemmasters
            var mti = _context.MonsterTemplateItemMasters.Where(x => x.MonsterTemplateId == id && x.IsDeleted != true).ToList();

            foreach (MonsterTemplateItemMaster item in mti)
            {
                item.IsDeleted = true;
            }

            // Remove Randomization engine
            var mt = _context.MonsterTemplates.FirstOrDefault(x => x.MonsterTemplateId == id);
            if (mt.IsRandomizationEngine)
            {
                var mrEngineList = _context.MonsterTemplateRandomizationEngines.Where(x => x.MonsterTemplateId == id && x.IsDeleted != true).ToList();
                foreach (var MRE in mrEngineList)
                {
                    var re = _context.RandomizationEngines.Where(x => x.RandomizationEngineId == MRE.RandomizationEngineId).FirstOrDefault();
                    if (re != null)
                    {
                        re.IsDeleted = true;
                    }
                    MRE.IsDeleted = true;
                }

            }

            // Remove Monster Template
            var monsterTemplate = await _repo.Get(id);

            if (monsterTemplate == null)
                return false;

            monsterTemplate.IsDeleted = true;

            try
            {
                _context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }


            //  return await _repo.Remove(id);

        }



        public MonsterTemplate GetById(int? id)
        {
            MonsterTemplate monsterTemplate = _context.MonsterTemplates
                .Include(d => d.RuleSet)
                .Include(d => d.MonsterTemplateCommands)
                //.Include(d => d.MonsterTemplateAbilities)
                //.Include(d => d.MonsterTemplateSpells)
                //.Include(d => d.MonsterTemplateBuffAndEffects)
                //.Include(d => d.MonsterTemplateMonsters)
                //.Include(d => d.MonsterTemplateItemMasters)
                .Where(x => x.MonsterTemplateId == id && x.IsDeleted != true)

                .FirstOrDefault();

            if (monsterTemplate == null) return monsterTemplate;

            monsterTemplate.MonsterTemplateCommands = monsterTemplate.MonsterTemplateCommands.Where(p => p.IsDeleted != true).ToList();

            return monsterTemplate;
        }
        public Monster GetMonsterById(int? id, bool IsGettingDetailsForDetailScreenAPI)
        {
            Monster monster = _context.Monsters
                .Include(d => d.RuleSet)
                .Include(d => d.MonsterTemplate)
                .Include(d => d.Character)
                //.ThenInclude(d => d.MonsterTemplateRandomizationEngine)
                //.ThenInclude(d=>d.RandomizationEngine)
                //.ThenInclude(d=>d.ItemMaster)

                .Where(x => x.MonsterId == id && x.IsDeleted != true).FirstOrDefault();

            if (monster == null) return monster;
            //if (monster.MonsterTemplate!=null)
            //{
            //    if (monster.MonsterTemplate.MonsterTemplateRandomizationEngine != null)
            //    {
            //        monster.MonsterTemplate.MonsterTemplateRandomizationEngine =
            //            monster.MonsterTemplate.MonsterTemplateRandomizationEngine.Where(x => x.IsDeleted != true).ToList();
                    
            //    }
                

            //}
            
            if (IsGettingDetailsForDetailScreenAPI)
            {
                monster.MonsterTemplate.Command = monster.Command;
                monster.MonsterTemplate.CommandName = monster.CommandName;
                monster.MonsterTemplate.Description = monster.Description;
                monster.MonsterTemplate.gmOnly = monster.gmOnly;
                monster.MonsterTemplate.InitiativeCommand = monster.InitiativeCommand;
                monster.MonsterTemplate.Stats = monster.Stats;
            }





            return monster;
        }


        public async Task<MonsterTemplate> Update(MonsterTemplate item,
            List<MonsterTemplateAbility> MonsterTemplateAbilityVM,
            List<MonsterTemplateMonster> MonsterTemplateMonsterVM,
            List<MonsterTemplateBuffAndEffect> MonsterTemplateBuffAndEffectVM,
            List<MonsterTemplateItemMaster> MonsterTemplateItemMasterVM,
            List<MonsterTemplateSpell> MonsterTemplateSpellVM,
            List<RandomizationEngine> RandomizationEngine,
            bool IsFromMonsterTemplateScreen = true)
        {
            var monsterTemplate = _context.MonsterTemplates.FirstOrDefault(x => x.MonsterTemplateId == item.MonsterTemplateId);

            if (monsterTemplate == null)
                return monsterTemplate;

            if (IsFromMonsterTemplateScreen)
            {
                monsterTemplate.Name = item.Name;
                monsterTemplate.ImageUrl = item.ImageUrl;
                monsterTemplate.Metatags = item.Metatags;
            }


            monsterTemplate.Command = item.Command;
            monsterTemplate.CommandName = item.CommandName;
            monsterTemplate.Description = item.Description;
            monsterTemplate.gmOnly = item.gmOnly;
            monsterTemplate.Stats = item.Stats;




            monsterTemplate.ArmorClass = item.ArmorClass;
            monsterTemplate.ChallangeRating = item.ChallangeRating;
            monsterTemplate.XPValue = item.XPValue;
            monsterTemplate.Health = item.Health;
            monsterTemplate.InitiativeCommand = item.InitiativeCommand;
            monsterTemplate.IsRandomizationEngine = item.IsRandomizationEngine;


            //try
            //{
            //    _context.SaveChanges();
            //}
            //catch (Exception ex)
            //{
            //    throw ex;
            //}
            _context.MonsterTemplateAbilities.RemoveRange(_context.MonsterTemplateAbilities.Where(x => x.MonsterTemplateId == item.MonsterTemplateId));
            _context.MonsterTemplateSpells.RemoveRange(_context.MonsterTemplateSpells.Where(x => x.MonsterTemplateId == item.MonsterTemplateId));
            _context.MonsterTemplateBuffAndEffects.RemoveRange(_context.MonsterTemplateBuffAndEffects.Where(x => x.MonsterTemplateId == item.MonsterTemplateId));
            _context.MonsterTemplateMonsters.RemoveRange(_context.MonsterTemplateMonsters.Where(x => x.MonsterTemplateId == item.MonsterTemplateId));
            if (IsFromMonsterTemplateScreen)
            {
                _context.MonsterTemplateItemMasters.RemoveRange(_context.MonsterTemplateItemMasters.Where(x => x.MonsterTemplateId == item.MonsterTemplateId));

                if (monsterTemplate.IsRandomizationEngine)
                {
                    var mrEngineList = _context.MonsterTemplateRandomizationEngines.Where(x => x.MonsterTemplateId == item.MonsterTemplateId && x.IsDeleted != true).ToList();
                    foreach (var MRE in mrEngineList)
                    {
                        var re = _context.RandomizationEngines.Where(x => x.RandomizationEngineId == MRE.RandomizationEngineId).FirstOrDefault();
                        if (re != null)
                        {
                            re.IsDeleted = true;
                        }
                        MRE.IsDeleted = true;
                    }
                    _context.SaveChanges();

                    if (RandomizationEngine != null && RandomizationEngine.Count > 0)
                    {
                        insertRandomizationEngines(RandomizationEngine, item.MonsterTemplateId);
                    }

                }
            }


            try
            {
                _context.SaveChanges();

                List<MonsterTemplateAbility> Alist = new List<MonsterTemplateAbility>();
                foreach (var be in MonsterTemplateAbilityVM)
                {
                    MonsterTemplateAbility obj = new MonsterTemplateAbility()
                    {
                        AbilityId = be.AbilityId,
                        MonsterTemplateId = item.MonsterTemplateId
                    };
                    Alist.Add(obj);
                }
                _context.MonsterTemplateAbilities.AddRange(Alist);

                List<MonsterTemplateSpell> Slist = new List<MonsterTemplateSpell>();
                foreach (var be in MonsterTemplateSpellVM)
                {
                    MonsterTemplateSpell obj = new MonsterTemplateSpell()
                    {
                        SpellId = be.SpellId,
                        MonsterTemplateId = item.MonsterTemplateId
                    };
                    Slist.Add(obj);
                }
                _context.MonsterTemplateSpells.AddRange(Slist);

                List<MonsterTemplateBuffAndEffect> Blist = new List<MonsterTemplateBuffAndEffect>();
                foreach (var be in MonsterTemplateBuffAndEffectVM)
                {
                    MonsterTemplateBuffAndEffect obj = new MonsterTemplateBuffAndEffect()
                    {
                        BuffAndEffectId = be.BuffAndEffectId,
                        MonsterTemplateId = item.MonsterTemplateId
                    };
                    Blist.Add(obj);
                }
                _context.MonsterTemplateBuffAndEffects.AddRange(Blist);

                List<MonsterTemplateMonster> Mlist = new List<MonsterTemplateMonster>();
                foreach (var be in MonsterTemplateMonsterVM)
                {
                    MonsterTemplateMonster obj = new MonsterTemplateMonster()
                    {
                        AssociateMonsterTemplateId = be.AssociateMonsterTemplateId,
                        MonsterTemplateId = item.MonsterTemplateId
                    };
                    Mlist.Add(obj);
                }
                _context.MonsterTemplateMonsters.AddRange(Mlist);


                if (IsFromMonsterTemplateScreen)
                {
                    List<MonsterTemplateItemMaster> Ilist = new List<MonsterTemplateItemMaster>();
                    foreach (var be in MonsterTemplateItemMasterVM)
                    {
                        MonsterTemplateItemMaster obj = new MonsterTemplateItemMaster()
                        {
                            ItemMasterId = be.ItemMasterId,
                            MonsterTemplateId = item.MonsterTemplateId,
                            Qty = be.Qty
                        };
                        Ilist.Add(obj);
                    }
                    _context.MonsterTemplateItemMasters.AddRange(Ilist);
                    _context.SaveChanges();
                }

            }
            catch (Exception ex)
            {
                throw ex;
            }

            return monsterTemplate;
        }

        public async Task<Monster> UpdateMonster(Monster model,
            List<MonsterTemplateAbility> monsterAbilityVM,
            List<MonsterTemplateMonster> monsterAssociateMonsterVM,
            List<MonsterTemplateBuffAndEffect> monsterBuffAndEffectVM,
            List<MonsterTemplateSpell> monsterSpellVM,
            List<MonsterTemplateCommand> monsterCommandVM,
            List<ItemMasterForMonsterTemplate> monsterTemplateItemVM)
        {
            //return null;
            var item = GetMonsterById(model.MonsterId, false);
            if (item == null) return model;

            item.Name = model.Name;
            item.ImageUrl = model.ImageUrl;
            item.Metatags = model.Metatags;
            item.HealthCurrent = model.HealthCurrent;
            item.HealthMax = model.HealthMax;
            item.ArmorClass = model.ArmorClass;
            item.XPValue = model.XPValue;
            item.ChallangeRating = model.ChallangeRating;

            item.Command = model.Command;
            item.CommandName = model.CommandName;
            item.Description = model.Description;
            item.gmOnly = model.gmOnly;
            item.InitiativeCommand = model.InitiativeCommand;
            item.Stats = model.Stats;


            //try
            //{
            //    _context.SaveChanges();
            //}
            //catch (Exception ex)
            //{
            //    throw ex;
            //}
            _context.MonsterAbilitys.RemoveRange(_context.MonsterAbilitys.Where(x => x.MonsterId == item.MonsterId));
            _context.MonsterSpells.RemoveRange(_context.MonsterSpells.Where(x => x.MonsterId == item.MonsterId));
            _context.MonsterBuffAndEffects.RemoveRange(_context.MonsterBuffAndEffects.Where(x => x.MonsterId == item.MonsterId));
            _context.MonsterMonsters.RemoveRange(_context.MonsterMonsters.Where(x => x.MonsterId == item.MonsterId));
            _context.MonsterCommands.RemoveRange(_context.MonsterCommands.Where(x => x.MonsterId == item.MonsterId));

            try
            {
                _context.SaveChanges();

                List<MonsterAbility> Alist = new List<MonsterAbility>();
                foreach (var be in monsterAbilityVM)
                {
                    MonsterAbility obj = new MonsterAbility()
                    {
                        AbilityId = be.AbilityId,
                        MonsterId = item.MonsterId
                    };
                    Alist.Add(obj);
                }
                _context.MonsterAbilitys.AddRange(Alist);

                List<MonsterSpell> Slist = new List<MonsterSpell>();
                foreach (var be in monsterSpellVM)
                {
                    MonsterSpell obj = new MonsterSpell()
                    {
                        SpellId = be.SpellId,
                        MonsterId = item.MonsterId
                    };
                    Slist.Add(obj);
                }
                _context.MonsterSpells.AddRange(Slist);

                List<MonsterBuffAndEffect> Blist = new List<MonsterBuffAndEffect>();
                foreach (var be in monsterBuffAndEffectVM)
                {
                    MonsterBuffAndEffect obj = new MonsterBuffAndEffect()
                    {
                        BuffAndEffectId = be.BuffAndEffectId,
                        MonsterId = item.MonsterId
                    };
                    Blist.Add(obj);
                }
                _context.MonsterBuffAndEffects.AddRange(Blist);

                List<MonsterMonster> Mlist = new List<MonsterMonster>();
                foreach (var be in monsterAssociateMonsterVM)
                {
                    MonsterMonster obj = new MonsterMonster()
                    {
                        AssociateMonsterId = be.AssociateMonsterTemplateId,
                        MonsterId = item.MonsterId
                    };
                    Mlist.Add(obj);
                }
                _context.MonsterMonsters.AddRange(Mlist);

                List<MonsterCommand> Clist = new List<MonsterCommand>();
                foreach (var be in monsterCommandVM)
                {
                    MonsterCommand obj = new MonsterCommand()
                    {
                        Command = be.Command,
                        Name = be.Name,
                        MonsterId = item.MonsterId
                    };
                    Clist.Add(obj);
                }
                _context.MonsterCommands.AddRange(Clist);


                var itemsList = _context.ItemMasterMonsterItems.Where(x => x.MonsterId == item.MonsterId && x.IsDeleted != true).ToList();
                foreach (var MI in itemsList)
                {
                    if (!monsterTemplateItemVM.Where(x => x.ItemId == MI.ItemId).Any())
                    {
                        MI.IsDeleted = true;
                    }
                }
                foreach (var MI in monsterTemplateItemVM)
                {
                    if (MI.ItemId == 0)
                    {
                        int qtyToSave = MI.Qty;
                        var ItemMasterMonsterItem = //_itemMasterService.GetItemMasterById(MI.ItemMasterId);
                        _context.ItemMasters.Where(x => x.ItemMasterId == MI.ItemMasterId && x.IsDeleted != true)
                            .Select(x => new ItemMasterMonsterItem()
                            {
                                Command = x.Command,
                                CommandName = x.CommandName,
                                ContainerVolumeMax = x.ContainerVolumeMax,
                                ContainerWeightMax = x.ContainerWeightMax,
                                ContainerWeightModifier = x.ContainerWeightModifier,
                                IsConsumable = x.IsConsumable,
                                IsContainer = x.IsContainer,
                                IsEquipped = false,
                                IsIdentified = false,
                                IsMagical = x.IsMagical,
                                IsVisible = false,
                                ItemCalculation = x.ItemCalculation,
                                ItemImage = x.ItemImage,
                                ItemName = x.ItemName,
                                ItemStats = x.ItemStats,
                                ItemVisibleDesc = x.ItemVisibleDesc,
                                Metatags = x.Metatags,
                                PercentReduced = x.PercentReduced,
                                Quantity = qtyToSave,
                                Rarity = x.Rarity,
                                TotalWeight = qtyToSave * x.Weight,
                                Value = x.Value,
                                Volume = x.Volume,
                                Weight = x.Weight,
                                TotalWeightWithContents = x.TotalWeightWithContents,
                                ItemMasterId = MI.ItemMasterId,
                                MonsterId = item.MonsterId,
                                RuleSetId=model.RuleSetId
                            })
                            .FirstOrDefault();
                        if (ItemMasterMonsterItem != null)
                        {
                            _context.ItemMasterMonsterItems.Add(ItemMasterMonsterItem);

                            var Abilitys = _context.ItemMasterAbilities.Where(x => x.ItemMasterId == MI.ItemMasterId && x.IsDeleted != true).ToList();
                            foreach (var a in Abilitys)
                            {
                                _context.ItemMasterMonsterItemAbilitys.Add(new ItemMasterMonsterItemAbility()
                                {
                                    AbilityId = a.AbilityId,
                                    ItemMasterMonsterItemId = ItemMasterMonsterItem.ItemId
                                });
                            }

                            var Spells = _context.ItemMasterSpells.Where(x => x.ItemMasterId == MI.ItemMasterId && x.IsDeleted != true).ToList();
                            foreach (var a in Spells)
                            {
                                _context.ItemMasterMonsterItemSpells.Add(new ItemMasterMonsterItemSpell()
                                {
                                    SpellId = a.SpellId,
                                    ItemMasterMonsterItemId = ItemMasterMonsterItem.ItemId
                                });
                            }

                            var BEs = _context.ItemMasterBuffAndEffects.Where(x => x.ItemMasterId == MI.ItemMasterId && x.IsDeleted != true).ToList();
                            foreach (var a in BEs)
                            {
                                _context.ItemMasterMonsterItemBuffAndEffects.Add(new ItemMasterMonsterItemBuffAndEffect()
                                {
                                    BuffAndEffectId = a.BuffAndEffectId,
                                    ItemMasterMonsterItemId = ItemMasterMonsterItem.ItemId
                                });
                            }

                            var cmds = _context.ItemMasterCommands.Where(x => x.ItemMasterId == MI.ItemMasterId && x.IsDeleted != true).ToList();
                            foreach (var a in cmds)
                            {
                                _context.ItemMasterMonsterItemCommands.Add(new ItemMasterMonsterItemCommand()
                                {
                                    Command = a.Command,
                                    Name = a.Name,
                                    ItemMasterMonsterItemId = ItemMasterMonsterItem.ItemId
                                });
                            }

                            //_context.SaveChanges();
                        }

                    }
                }

                _context.SaveChanges();

                var combats = _context.Combats.Where(x => x.CampaignId == model.RuleSetId && x.IsDeleted != true).ToList();
                foreach (var c in combats)
                {
                    MarkCombatAsUpdated(c.Id);
                }

                //var imcIds = new List<int>();

                //if (monsterTemplateItemMasterVM.Count > 0)
                //    imcIds.AddRange(monsterTemplateItemMasterVM.Select(x => x.Id).ToList());

                //if (monsterTemplateItemMasterVM != null && monsterTemplateItemMasterVM.Count > 0)
                //{
                //    if (imcIds.Count > 0)
                //    {
                //        foreach (var id in imcIds)
                //        {
                //            if (monsterTemplateItemMasterVM.Where(x => x.Id == id).FirstOrDefault() == null)
                //                await _iItemMasterCommandService.DeleteItemMasterCommand(id);
                //        }
                //    }

                //    foreach (var imcViewModels in model.ItemMasterCommandVM)
                //    {
                //        if (imcViewModels.ItemMasterCommandId > 0)
                //        {
                //            await _iItemMasterCommandService.UdateItemMasterCommand(new ItemMasterCommand()
                //            {
                //                ItemMasterCommandId = imcViewModels.ItemMasterCommandId,
                //                Command = imcViewModels.Command,
                //                Name = imcViewModels.Name,
                //                ItemMasterId = imcViewModels.ItemMasterId
                //            });
                //        }
                //        else
                //        {
                //            await _iItemMasterCommandService.InsertItemMasterCommand(new ItemMasterCommand()
                //            {
                //                Command = imcViewModels.Command,
                //                Name = imcViewModels.Name,
                //                ItemMasterId = result.ItemMasterId
                //            });
                //        }
                //    }
                //}
                //else
                //{
                //    if (imcIds.Count > 0)
                //    {
                //        foreach (var id in imcIds)
                //        {
                //            await _iItemMasterCommandService.DeleteItemMasterCommand(id);
                //        }
                //    }
                //}

            }
            catch (Exception ex)
            {
                throw ex;
            }

            return model;
        }

        public int GetCountByRuleSetId(int ruleSetId)
        {
            return (_context.MonsterTemplates.Where(x => x.RuleSetId == ruleSetId && x.IsDeleted != true).Count()
                + _context.MonsterTemplateBundles.Where(x => x.RuleSetId == ruleSetId && x.IsDeleted != true).Count()
                );
        }
        public int GetMonsterCountByRuleSetId(int rulesetId)
        {
            return _context.Monsters.Where(x => x.RuleSetId == rulesetId && x.IsDeleted != true).Count();
        }
        public int Core_GetMonsterCountByRuleSetId(int rulesetId, int parentID) {
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC Ruleset_GetRecordCounts @RulesetID = '" + ruleSetId + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataTable dt = new DataTable();
            try
            {
                connection.Open();
                command = new SqlCommand("Ruleset_GetRecordCounts", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@RulesetID", rulesetId);
                command.CommandType = CommandType.StoredProcedure;

                adapter.SelectCommand = command;

                adapter.Fill(dt);
                command.Dispose();
                connection.Close();
            }
            catch (Exception ex)
            {
                command.Dispose();
                connection.Close();
            }


            SP_RulesetRecordCount res = new SP_RulesetRecordCount();
            if (dt.Rows.Count > 0)
            {
                res.MonsterCount = Convert.ToInt32(dt.Rows[0]["MonsterCount"]);
            }
            return res.MonsterCount;
        }
        public int Core_GetCountByRuleSetId(int ruleSetId, int parentID)
        {
            //var idsToRemove = _context.Abilities.Where(p => (p.RuleSetId == ruleSetId) && p.ParentAbilityId != null).Select(p => p.ParentAbilityId).ToArray();

            //var recsToRemove = _context.Abilities.Where(p => idsToRemove.Contains(p.AbilityId)).ToList();

            //var res = _context.Abilities.Where(x => (x.RuleSetId == ruleSetId || x.RuleSetId == parentID) && x.IsDeleted != true)
            //    .Except(recsToRemove);
            //return res.Count();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC Ruleset_GetRecordCounts @RulesetID = '" + ruleSetId + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataTable dt = new DataTable();
            try
            {
                connection.Open();
                command = new SqlCommand("Ruleset_GetRecordCounts", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@RulesetID", ruleSetId);
                command.CommandType = CommandType.StoredProcedure;

                adapter.SelectCommand = command;

                adapter.Fill(dt);
                command.Dispose();
                connection.Close();
            }
            catch (Exception ex)
            {
                command.Dispose();
                connection.Close();
            }


            SP_RulesetRecordCount res = new SP_RulesetRecordCount();
            if (dt.Rows.Count > 0)
            {
                res.MonsterTemplateCount = Convert.ToInt32(dt.Rows[0]["MonsterTemplateCount"]);
            }
            return res.MonsterTemplateCount;
        }

        public async Task<bool> CheckDuplicateMonsterTemplate(string value, int? ruleSetId, int? monsterTemplateId = 0)
        {
            //var items = _repo.GetAll();
            //if (items.Result == null || items.Result.Count == 0) return false;
            //else if (ruleSetId > 0)
            //{
            //    return items.Result.Where(x => x.Name.ToLower() == value.ToLower() && x.RuleSetId == ruleSetId && x.AbilityId!=abilityId && x.IsDeleted!=true).FirstOrDefault() == null ? false : true;
            //}
            //else
            //    return items.Result.Where(x => x.Name.ToLower() == value.ToLower()).FirstOrDefault() == null ? false : true;

            if (ruleSetId > 0)
            {
                return _context.MonsterTemplates.Where(x => x.Name.ToLower() == value.ToLower() && x.RuleSetId == ruleSetId && x.MonsterTemplateId != monsterTemplateId && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
            }
            else
                return _context.MonsterTemplates.Where(x => x.Name.ToLower() == value.ToLower()).FirstOrDefault() == null ? false : true;
        }

        public async Task<bool> CheckDuplicateMonster(string name, int? ruleSetId, int? monsterId = 0)
        {
            if (ruleSetId > 0)
            {
                return _context.Monsters.Where(x => x.Name.ToLower() == name.ToLower() && x.RuleSetId == ruleSetId && x.MonsterId != monsterId && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
            }
            else
                return _context.Monsters.Where(x => x.Name.ToLower() == name.ToLower()).FirstOrDefault() == null ? false : true;
        }


        public bool Core_MonsterTemplateWithParentIDExists(int monsterTemplateId, int RulesetID)
        {
            if (_context.MonsterTemplates.Where(x => x.MonsterTemplateId == monsterTemplateId && x.ParentMonsterTemplateId != null && x.IsDeleted != true).Any())
            {
                return true;
            }
            else
            {
                var model = _context.MonsterTemplates.Where(x => x.MonsterTemplateId == monsterTemplateId && x.ParentMonsterTemplateId == null && x.IsDeleted != true);
                if (model.FirstOrDefault().RuleSetId == RulesetID)
                {
                    return true;
                }
            }
            return false;
        }
        public async Task<MonsterTemplate> Core_CreateMonsterTemplate(MonsterTemplate monsterTemplate)
        {
            monsterTemplate.ParentMonsterTemplateId = monsterTemplate.MonsterTemplateId;
            monsterTemplate.MonsterTemplateId = 0;
            return await _repo.Add(monsterTemplate);
        }

        public MonsterTemplateWithFilterCount SP_GetMonsterTemplateByRuleSetId(int rulesetId, int page, int pageSize, int sortType = 1)
        {
            int FilterAplhabetCount = 0;
            int FilterCRCount = 0;
            int FilterHealthCount = 0;
            MonsterTemplateWithFilterCount result = new MonsterTemplateWithFilterCount();

            List<MonsterTemplate_Bundle> _monsterTemplateList = new List<MonsterTemplate_Bundle>();
            RuleSet ruleset = new RuleSet();
            result.MonsterTemplates_Bundle = _monsterTemplateList;
            result.FilterAplhabetCount = FilterAplhabetCount;
            result.FilterCRCount = FilterCRCount;
            result.FilterHealthCount = FilterHealthCount;

            short num = 0;
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("MonsterTemplate_GetByRulesetID", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@RulesetID", rulesetId);
                command.Parameters.AddWithValue("@page", page);
                command.Parameters.AddWithValue("@size", pageSize);
                command.Parameters.AddWithValue("@SortType", sortType);
                command.Parameters.AddWithValue("@includeBundles", true);
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



            if (ds.Tables[1].Rows.Count > 0)
                ruleset = _repo.GetRuleset(ds.Tables[1], num);

            if (ds.Tables[0].Rows.Count > 0)
            {

                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    MonsterTemplate_Bundle _MonsterTemplate = new MonsterTemplate_Bundle();
                    _MonsterTemplate.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    _MonsterTemplate.Stats = row["Stats"] == DBNull.Value ? null : row["Stats"].ToString();
                    _MonsterTemplate.Metatags = row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString();
                    _MonsterTemplate.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                    _MonsterTemplate.CommandName = row["CommandName"] == DBNull.Value ? null : row["CommandName"].ToString();
                    _MonsterTemplate.Description = row["Description"] == DBNull.Value ? null : row["Description"].ToString();
                    _MonsterTemplate.gmOnly = row["gmOnly"] == DBNull.Value ? null : row["gmOnly"].ToString();
                    _MonsterTemplate.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    _MonsterTemplate.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);


                    _MonsterTemplate.MonsterTemplateId = row["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateId"].ToString());
                    _MonsterTemplate.ParentMonsterTemplateId = row["ParentMonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ParentMonsterTemplateId"].ToString());
                    _MonsterTemplate.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString());

                    _MonsterTemplate.Health = row["Health"] == DBNull.Value ? null : row["Health"].ToString();
                    _MonsterTemplate.ArmorClass = row["ArmorClass"] == DBNull.Value ? null : row["ArmorClass"].ToString();
                    _MonsterTemplate.ChallangeRating = row["ChallangeRating"] == DBNull.Value ? null : row["ChallangeRating"].ToString();
                    _MonsterTemplate.XPValue = row["XPValue"] == DBNull.Value ? null : row["XPValue"].ToString();
                    _MonsterTemplate.InitiativeCommand = row["InitiativeCommand"] == DBNull.Value ? null : row["InitiativeCommand"].ToString();
                    _MonsterTemplate.IsRandomizationEngine = row["IsRandomizationEngine"] == DBNull.Value ? false : Convert.ToBoolean(row["IsRandomizationEngine"]);

                    _MonsterTemplate.IsBundle = row["IsBundle"] == DBNull.Value ? false : Convert.ToBoolean(row["IsBundle"]);

                    _MonsterTemplate.RuleSet = ruleset;
                    _MonsterTemplate.BundleItems = new List<MonsterTemplate_BundleItemsWithRandomItems>();
                    if (ds.Tables.Count > 2 && _MonsterTemplate.IsBundle)
                    {
                        if (ds.Tables[2].Rows.Count > 0)
                        {
                            foreach (DataRow BundleItemRow in ds.Tables[2].Rows)
                            {
                                int monsterBundleId = BundleItemRow["BundleID"] == DBNull.Value ? 0 : Convert.ToInt32(BundleItemRow["BundleID"]);
                                if (monsterBundleId == _MonsterTemplate.MonsterTemplateId)
                                {
                                    MonsterTemplate_BundleItemsWithRandomItems obj = new MonsterTemplate_BundleItemsWithRandomItems()
                                    {
                                        BundleId = monsterBundleId,
                                        BundleItemId = BundleItemRow["BundleItemId"] == DBNull.Value ? 0 : Convert.ToInt32(BundleItemRow["BundleItemId"]),
                                        MonsterTemplateId = BundleItemRow["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(BundleItemRow["MonsterTemplateId"]),
                                        Quantity = BundleItemRow["Quantity"] == DBNull.Value ? 0 : Convert.ToInt32(BundleItemRow["Quantity"]),
                                        MonsterTemplate = new MonsterTemplate_WithRandomItems()
                                        {
                                            ArmorClass = BundleItemRow["ArmorClass"] == DBNull.Value ? "0" : BundleItemRow["ArmorClass"].ToString(),
                                            ChallangeRating = BundleItemRow["ChallangeRating"] == DBNull.Value ? "0" : BundleItemRow["ChallangeRating"].ToString(),
                                            XPValue = BundleItemRow["XPValue"] == DBNull.Value ? "0" : BundleItemRow["XPValue"].ToString(),
                                            Health = BundleItemRow["Health"] == DBNull.Value ? "0" : BundleItemRow["Health"].ToString(),
                                            RuleSetId = rulesetId,
                                            IsRandomizationEngine = BundleItemRow["IsRandomizationEngine"] == DBNull.Value ? false : Convert.ToBoolean(BundleItemRow["IsRandomizationEngine"]),
                                            RandomizationEngine = new List<RandomizationEngine>()
                                        }
                                    };
                                    //obj.MonsterTemplate.RandomizationEngine
                                    if (ds.Tables[3].Rows.Count > 0)
                                    {
                                        foreach (DataRow RErow in ds.Tables[3].Rows)
                                        {
                                            int MT_ID = RErow["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["MonsterTemplateId"]);
                                            if (obj.MonsterTemplateId == MT_ID)
                                            {
                                                RandomizationEngine RE = new RandomizationEngine();
                                                RE.RandomizationEngineId = RErow["RandomizationEngineId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["RandomizationEngineId"]);
                                                RE.Qty = RErow["Qty"] == DBNull.Value ? string.Empty : RErow["Qty"].ToString();
                                                RE.Percentage = RErow["Percentage"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["Percentage"]);
                                                RE.SortOrder = RErow["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["SortOrder"]);
                                                RE.ItemMasterId = RErow["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["ItemMasterId"]);
                                                RE.IsOr = RErow["IsOr"] == DBNull.Value ? false : Convert.ToBoolean(RErow["IsOr"]);
                                                RE.IsDeleted = RErow["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(RErow["IsDeleted"]);

                                                RE.ItemMaster = new ItemMaster()
                                                {
                                                    ItemMasterId = RErow["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["ItemMasterId"]),
                                                    ItemName = RErow["ItemName"] == DBNull.Value ? null : RErow["ItemName"].ToString(),
                                                    ItemImage = RErow["ItemImage"] == DBNull.Value ? null : RErow["ItemImage"].ToString()
                                                };
                                                obj.MonsterTemplate.RandomizationEngine.Add(RE);
                                            }
                                        }
                                    }

                                    _MonsterTemplate.BundleItems.Add(obj);
                                }

                            }
                        }
                    }


                    _MonsterTemplate.RandomizationEngine = new List<RandomizationEngine>();
                    if (ds.Tables[3].Rows.Count > 0)
                    {
                        foreach (DataRow RErow in ds.Tables[3].Rows)
                        {
                            int MT_ID = RErow["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["MonsterTemplateId"]);
                            if (MT_ID == _MonsterTemplate.MonsterTemplateId && !_MonsterTemplate.IsBundle)
                            {
                                RandomizationEngine RE = new RandomizationEngine();
                                RE.RandomizationEngineId = RErow["RandomizationEngineId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["RandomizationEngineId"]);
                                RE.Qty = RErow["Qty"] == DBNull.Value ? string.Empty : RErow["Qty"].ToString();
                                RE.Percentage = RErow["Percentage"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["Percentage"]);
                                RE.SortOrder = RErow["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["SortOrder"]);
                                RE.ItemMasterId = RErow["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["ItemMasterId"]);
                                RE.IsOr = RErow["IsOr"] == DBNull.Value ? false : Convert.ToBoolean(RErow["IsOr"]);
                                RE.IsDeleted = RErow["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(RErow["IsDeleted"]);

                                RE.ItemMaster = new ItemMaster()
                                {
                                    ItemMasterId = RErow["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["ItemMasterId"]),
                                    ItemName = RErow["ItemName"] == DBNull.Value ? null : RErow["ItemName"].ToString(),
                                    ItemImage = RErow["ItemImage"] == DBNull.Value ? null : RErow["ItemImage"].ToString()
                                };
                                _MonsterTemplate.RandomizationEngine.Add(RE);
                            }
                        }
                    }

                    if (ds.Tables[4].Rows.Count > 0)
                    {
                        FilterAplhabetCount = ds.Tables[4].Rows[0][0] == DBNull.Value ? 0 : Convert.ToInt32(ds.Tables[4].Rows[0][0]);
                    }
                    if (ds.Tables[5].Rows.Count > 0)
                    {
                        FilterCRCount = ds.Tables[5].Rows[0][0] == DBNull.Value ? 0 : Convert.ToInt32(ds.Tables[5].Rows[0][0]);
                    }
                    if (ds.Tables[6].Rows.Count > 0)
                    {
                        FilterHealthCount = ds.Tables[6].Rows[0][0] == DBNull.Value ? 0 : Convert.ToInt32(ds.Tables[6].Rows[0][0]);
                    }

                    _monsterTemplateList.Add(_MonsterTemplate);
                }
            }
            result.MonsterTemplates_Bundle = _monsterTemplateList;
            result.FilterAplhabetCount = FilterAplhabetCount;
            result.FilterCRCount = FilterCRCount;
            result.FilterHealthCount = FilterHealthCount;
            return result;
        }

        public List<MonsterTemplateCommand> SP_GetMonsterTemplateCommands(int monsterTemplateId)
        {
            List<MonsterTemplateCommand> _monsterTemplateCommand = new List<MonsterTemplateCommand>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;


            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("MonsterTemplate_GetCommands", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@MonsterTemplateId", monsterTemplateId);
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
                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    MonsterTemplateCommand _cmd = new MonsterTemplateCommand();

                    _cmd.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                    _cmd.MonsterTemplateId = row["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateId"].ToString());
                    _cmd.MonsterTemplateCommandId = row["MonsterTemplateCommandId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateCommandId"].ToString());
                    _cmd.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                    _cmd.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();

                    _monsterTemplateCommand.Add(_cmd);
                }
            }

            return _monsterTemplateCommand;
        }
        public List<MonsterCommand> SP_GetMonsterCommands(int monsterId) {
            List<MonsterCommand> _monsterCommand = new List<MonsterCommand>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;


            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("Monster_GetCommands", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@MonsterId", monsterId);
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
                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    MonsterCommand _cmd = new MonsterCommand();

                    _cmd.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                    _cmd.MonsterId = row["MonsterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterId"].ToString());
                    _cmd.MonsterCommandId = row["MonsterCommandId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterCommandId"].ToString());
                    _cmd.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                    _cmd.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();

                    _monsterCommand.Add(_cmd);
                }
            }

            return _monsterCommand;
        }
        public SP_AssociateForMonsterTemplate SP_GetAssociateRecords(int monsterTemplateId, int rulesetId, int MonsterID)
        {
            SP_AssociateForMonsterTemplate res = new SP_AssociateForMonsterTemplate();
            res.abilityList = new List<Ability>();
            res.selectedAbilityList = new List<Ability>();
            res.spellList = new List<Spell>();
            res.selectedSpellList = new List<Spell>();
            res.buffAndEffectsList = new List<BuffAndEffect>();
            res.selectedBuffAndEffects = new List<BuffAndEffect>();
            res.monsterTemplatesList = new List<MonsterTemplate>();
            res.selectedMonsterTemplates = new List<MonsterTemplate>();
            res.monsterTemplateCommands = new List<MonsterTemplateCommand>();
            res.selectedItemMasters = new List<ItemMasterForMonsterTemplate>();
            res.RandomizationEngine = new List<RandomizationEngine>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;


            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("MonsterTemplate_GetAssociateRecords", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@MonsterTemplateId", monsterTemplateId);
                command.Parameters.AddWithValue("@RulesetID", rulesetId);
                command.Parameters.AddWithValue("@MonsterID", MonsterID);
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
                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    MonsterTemplateCommand _cmd = new MonsterTemplateCommand();

                    _cmd.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                    _cmd.MonsterTemplateId = row["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateId"].ToString());
                    _cmd.MonsterTemplateCommandId = row["MonsterTemplateCommandId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateCommandId"].ToString());
                    _cmd.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                    _cmd.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();

                    res.monsterTemplateCommands.Add(_cmd);
                }
            }
            if (ds.Tables[1].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[1].Rows)
                {
                    Ability i = new Ability();
                    i.AbilityId = row["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(row["AbilityId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.abilityList.Add(i);
                }

            }
            if (ds.Tables[2].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[2].Rows)
                {
                    Spell i = new Spell();
                    i.SpellId = row["SpellId"] == DBNull.Value ? 0 : Convert.ToInt32(row["SpellId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.spellList.Add(i);
                }

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

                    res.buffAndEffectsList.Add(i);/////////
                }

            }
            if (ds.Tables[4].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[4].Rows)
                {
                    MonsterTemplate i = new MonsterTemplate();
                    i.MonsterTemplateId = row["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.monsterTemplatesList.Add(i);/////////
                }

            }
            if (ds.Tables[5].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[5].Rows)
                {
                    Ability i = new Ability();
                    i.AbilityId = row["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(row["AbilityId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.selectedAbilityList.Add(i);
                }

            }
            if (ds.Tables[6].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[6].Rows)
                {
                    Spell i = new Spell();
                    i.SpellId = row["SpellId"] == DBNull.Value ? 0 : Convert.ToInt32(row["SpellId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.selectedSpellList.Add(i);
                }

            }
            if (ds.Tables[7].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[7].Rows)
                {
                    BuffAndEffect i = new BuffAndEffect();
                    i.BuffAndEffectId = row["BuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(row["BuffAndEffectId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.selectedBuffAndEffects.Add(i);///////
                }

            }
            if (ds.Tables[8].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[8].Rows)
                {
                    MonsterTemplate i = new MonsterTemplate();
                    i.MonsterTemplateId = row["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.selectedMonsterTemplates.Add(i);///////
                }

            }
            if (ds.Tables[9].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[9].Rows)
                {
                    ItemMasterForMonsterTemplate i = new ItemMasterForMonsterTemplate();
                    DataColumnCollection columns = ds.Tables[9].Columns;
                    if (columns.Contains("ItemId"))
                    {
                        i.ItemId = row["ItemId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemId"]);
                    }

                    i.ItemMasterId = row["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemMasterId"]);
                    i.ImageUrl = row["ItemImage"] == DBNull.Value ? null : row["ItemImage"].ToString();
                    i.Name = row["ItemName"] == DBNull.Value ? null : row["ItemName"].ToString();
                    i.Qty = row["Qty"] == DBNull.Value ? 0 : Convert.ToInt32(row["Qty"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);

                    res.selectedItemMasters.Add(i);///////
                }
            }
            if (ds.Tables[10].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[10].Rows)
                {
                    RandomizationEngine i = new RandomizationEngine();
                    i.RandomizationEngineId = row["RandomizationEngineId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RandomizationEngineId"]);
                    i.Percentage = row["Percentage"] == DBNull.Value ? 0 : Convert.ToInt32(row["Percentage"]);
                    i.Qty = row["Qty"] == DBNull.Value ? string.Empty : row["Qty"].ToString();
                    i.SortOrder = row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(row["SortOrder"]);
                    i.ItemMasterId = row["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemMasterId"]);
                    i.IsOr = row["IsOr"] == DBNull.Value ? false : Convert.ToBoolean(row["IsOr"]);
                    i.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);

                    i.ItemMaster = new ItemMaster()
                    {
                        ItemMasterId = row["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemMasterId"]),
                        ItemName = row["ItemName"] == DBNull.Value ? null : row["ItemName"].ToString(),
                        ItemImage = row["ItemImage"] == DBNull.Value ? null : row["ItemImage"].ToString()
                    };


                    res.RandomizationEngine.Add(i);
                }

            }
            return res;
        }



        public SP_AssociateForMonsterTemplate SP_GetMonsterAssociateRecords(int monsterID, int rulesetId)
        {
            SP_AssociateForMonsterTemplate res = new SP_AssociateForMonsterTemplate();
            res.abilityList = new List<Ability>();
            res.selectedAbilityList = new List<Ability>();
            res.spellList = new List<Spell>();
            res.selectedSpellList = new List<Spell>();
            res.buffAndEffectsList = new List<BuffAndEffect>();
            res.selectedBuffAndEffects = new List<BuffAndEffect>();
            res.monsterTemplatesList = new List<MonsterTemplate>();
            res.selectedMonsterTemplates = new List<MonsterTemplate>();
            res.monsterTemplateCommands = new List<MonsterTemplateCommand>();
            res.selectedItemMasters = new List<ItemMasterForMonsterTemplate>();
            res.itemMasterList = new List<ItemMasterForMonsterTemplate>();
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
            if (ds.Tables[0].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    MonsterTemplateCommand _cmd = new MonsterTemplateCommand();

                    _cmd.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                    _cmd.MonsterTemplateId = row["MonsterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterId"].ToString());
                    _cmd.MonsterTemplateCommandId = row["MonsterCommandId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterCommandId"].ToString());
                    _cmd.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                    _cmd.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();

                    res.monsterTemplateCommands.Add(_cmd);
                }
            }
            if (ds.Tables[1].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[1].Rows)
                {
                    Ability i = new Ability();
                    i.AbilityId = row["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(row["AbilityId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.abilityList.Add(i);
                }

            }
            if (ds.Tables[2].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[2].Rows)
                {
                    Spell i = new Spell();
                    i.SpellId = row["SpellId"] == DBNull.Value ? 0 : Convert.ToInt32(row["SpellId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.spellList.Add(i);
                }

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

                    res.buffAndEffectsList.Add(i);/////////
                }

            }
            if (ds.Tables[4].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[4].Rows)
                {
                    MonsterTemplate i = new MonsterTemplate();
                    i.MonsterTemplateId = row["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.monsterTemplatesList.Add(i);/////////
                }

            }
            if (ds.Tables[5].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[5].Rows)
                {
                    Ability i = new Ability();
                    i.AbilityId = row["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(row["AbilityId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.selectedAbilityList.Add(i);
                }

            }
            if (ds.Tables[6].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[6].Rows)
                {
                    Spell i = new Spell();
                    i.SpellId = row["SpellId"] == DBNull.Value ? 0 : Convert.ToInt32(row["SpellId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.selectedSpellList.Add(i);
                }

            }
            if (ds.Tables[7].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[7].Rows)
                {
                    BuffAndEffect i = new BuffAndEffect();
                    i.BuffAndEffectId = row["BuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(row["BuffAndEffectId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.selectedBuffAndEffects.Add(i);///////
                }

            }
            if (ds.Tables[8].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[8].Rows)
                {
                    MonsterTemplate i = new MonsterTemplate();
                    i.MonsterTemplateId = row["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.selectedMonsterTemplates.Add(i);///////
                }

            }
            if (ds.Tables[9].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[9].Rows)
                {
                    ItemMasterForMonsterTemplate i = new ItemMasterForMonsterTemplate();
                    DataColumnCollection columns = ds.Tables[9].Columns;
                    if (columns.Contains("ItemId"))
                    {
                        i.ItemId = row["ItemId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemId"]);
                    }

                    i.ItemMasterId = row["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemMasterId"]);
                    i.ImageUrl = row["ItemImage"] == DBNull.Value ? null : row["ItemImage"].ToString();
                    i.Name = row["ItemName"] == DBNull.Value ? null : row["ItemName"].ToString();
                    i.Qty = row["Qty"] == DBNull.Value ? 0 : Convert.ToInt32(row["Qty"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);

                    res.selectedItemMasters.Add(i);///////
                }

            }
            if (ds.Tables[10].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[10].Rows)
                {
                    ItemMasterForMonsterTemplate i = new ItemMasterForMonsterTemplate();



                    i.ItemMasterId = row["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemMasterId"]);
                    i.ImageUrl = row["ItemImage"] == DBNull.Value ? null : row["ItemImage"].ToString();
                    i.Name = row["ItemName"] == DBNull.Value ? null : row["ItemName"].ToString();
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);

                    res.itemMasterList.Add(i);///////
                }

            }
            return res;
        }

        public void addRemoveMonsterRecords(List<AddRemoveRecords> model, int monsterId, string type)
        {
            if (type == "I")
            {
                var itemsList = _context.ItemMasterMonsterItems.Where(x => x.MonsterId == monsterId && x.IsDeleted != true).ToList();
                foreach (var MI in itemsList)
                {
                    if (!model.Where(x => x.ItemId == MI.ItemId && x.Selected == true).Any())
                    {
                        MI.IsDeleted = true;
                    }
                }
                foreach (var MI in model)
                {
                    if (MI.ItemId == 0 && MI.Selected == true)
                    {
                        int qtyToSave = 1;
                        var ItemMasterMonsterItem = //_itemMasterService.GetItemMasterById(MI.ItemMasterId);
                        _context.ItemMasters.Where(x => x.ItemMasterId == MI.ItemMasterId && x.IsDeleted != true)
                            .Select(x => new ItemMasterMonsterItem()
                            {
                                Command = x.Command,
                                CommandName = x.CommandName,
                                ContainerVolumeMax = x.ContainerVolumeMax,
                                ContainerWeightMax = x.ContainerWeightMax,
                                ContainerWeightModifier = x.ContainerWeightModifier,
                                IsConsumable = x.IsConsumable,
                                IsContainer = x.IsContainer,
                                IsEquipped = false,
                                IsIdentified = false,
                                IsMagical = x.IsMagical,
                                IsVisible = false,
                                ItemCalculation = x.ItemCalculation,
                                ItemImage = x.ItemImage,
                                ItemName = x.ItemName,
                                ItemStats = x.ItemStats,
                                ItemVisibleDesc = x.ItemVisibleDesc,
                                Metatags = x.Metatags,
                                PercentReduced = x.PercentReduced,
                                Quantity = qtyToSave,
                                Rarity = x.Rarity,
                                TotalWeight = qtyToSave * x.Weight,
                                Value = x.Value,
                                Volume = x.Volume,
                                Weight = x.Weight,
                                TotalWeightWithContents = x.TotalWeightWithContents,
                                ItemMasterId = MI.ItemMasterId,
                                MonsterId = monsterId,

                            })
                            .FirstOrDefault();
                        if (ItemMasterMonsterItem != null)
                        {
                            _context.ItemMasterMonsterItems.Add(ItemMasterMonsterItem);

                            var Abilitys = _context.ItemMasterAbilities.Where(x => x.ItemMasterId == MI.ItemMasterId && x.IsDeleted != true).ToList();
                            foreach (var a in Abilitys)
                            {
                                _context.ItemMasterMonsterItemAbilitys.Add(new ItemMasterMonsterItemAbility()
                                {
                                    AbilityId = a.AbilityId,
                                    ItemMasterMonsterItemId = ItemMasterMonsterItem.ItemId
                                });
                            }

                            var Spells = _context.ItemMasterSpells.Where(x => x.ItemMasterId == MI.ItemMasterId && x.IsDeleted != true).ToList();
                            foreach (var a in Spells)
                            {
                                _context.ItemMasterMonsterItemSpells.Add(new ItemMasterMonsterItemSpell()
                                {
                                    SpellId = a.SpellId,
                                    ItemMasterMonsterItemId = ItemMasterMonsterItem.ItemId
                                });
                            }

                            var BEs = _context.ItemMasterBuffAndEffects.Where(x => x.ItemMasterId == MI.ItemMasterId && x.IsDeleted != true).ToList();
                            foreach (var a in BEs)
                            {
                                _context.ItemMasterMonsterItemBuffAndEffects.Add(new ItemMasterMonsterItemBuffAndEffect()
                                {
                                    BuffAndEffectId = a.BuffAndEffectId,
                                    ItemMasterMonsterItemId = ItemMasterMonsterItem.ItemId
                                });
                            }

                            var cmds = _context.ItemMasterCommands.Where(x => x.ItemMasterId == MI.ItemMasterId && x.IsDeleted != true).ToList();
                            foreach (var a in cmds)
                            {
                                _context.ItemMasterMonsterItemCommands.Add(new ItemMasterMonsterItemCommand()
                                {
                                    Command = a.Command,
                                    Name = a.Name,
                                    ItemMasterMonsterItemId = ItemMasterMonsterItem.ItemId
                                });
                            }


                        }

                    }
                }
                _context.SaveChanges();
            }
            if (type == "A")
            {
                _context.MonsterAbilitys.RemoveRange(_context.MonsterAbilitys.Where(x => x.MonsterId == monsterId));
                List<MonsterAbility> Alist = new List<MonsterAbility>();
                foreach (var be in model)
                {
                    if (be.Selected == true)
                    {
                        MonsterAbility obj = new MonsterAbility()
                        {
                            AbilityId = be.AbilityId,
                            MonsterId = monsterId
                        };
                        Alist.Add(obj);
                    }
                }
                _context.MonsterAbilitys.AddRange(Alist);
                _context.SaveChanges();
            }
            if (type == "S")
            {
                _context.MonsterSpells.RemoveRange(_context.MonsterSpells.Where(x => x.MonsterId == monsterId));
                List<MonsterSpell> Slist = new List<MonsterSpell>();
                foreach (var be in model)
                {
                    if (be.Selected == true)
                    {
                        MonsterSpell obj = new MonsterSpell()
                        {
                            SpellId = be.SpellId,
                            MonsterId = monsterId
                        };
                        Slist.Add(obj);
                    }
                }
                _context.MonsterSpells.AddRange(Slist);
                _context.SaveChanges();
            }
            if (type == "B")
            {
                _context.MonsterBuffAndEffects.RemoveRange(_context.MonsterBuffAndEffects.Where(x => x.MonsterId == monsterId));
                List<MonsterBuffAndEffect> Blist = new List<MonsterBuffAndEffect>();
                foreach (var be in model)
                {
                    if (be.Selected == true)
                    {
                        MonsterBuffAndEffect obj = new MonsterBuffAndEffect()
                        {
                            BuffAndEffectId = be.BuffAndEffectId,
                            MonsterId = monsterId
                        };
                        Blist.Add(obj);
                    }
                }
                _context.MonsterBuffAndEffects.AddRange(Blist);
                _context.SaveChanges();

                var monster = _context.Monsters.Where(x => x.MonsterId == monsterId && x.IsDeleted != true).FirstOrDefault();
                var combats = _context.Combats.Where(x => x.CampaignId == monster.RuleSetId && x.IsDeleted != true).ToList();
                foreach (var c in combats)
                {
                    MarkCombatAsUpdated(c.Id);
                }
            }
            if (type == "M")
            {
                _context.MonsterMonsters.RemoveRange(_context.MonsterMonsters.Where(x => x.MonsterId == monsterId));
                List<MonsterMonster> Mlist = new List<MonsterMonster>();
                foreach (var be in model)
                {
                    if (be.Selected == true)
                    {
                        MonsterMonster obj = new MonsterMonster()
                        {
                            AssociateMonsterId = be.MonsterTemplateId,
                            MonsterId = monsterId
                        };
                        Mlist.Add(obj);
                    }

                }
                _context.MonsterMonsters.AddRange(Mlist);
                _context.SaveChanges();
            }
        }
        public void MarkCombatAsUpdated(int combatId)
        {   //same code also written on combatService.cs and buffandeffectervice.cs
            try
            {
                var updateCombatFlagRec = _context.CombatUpdates.Where(x => x.CombatId == combatId).FirstOrDefault();
                if (updateCombatFlagRec != null)
                {
                    if (!updateCombatFlagRec.IsUpdated)
                    {
                        updateCombatFlagRec.IsUpdated = true;
                        _context.SaveChanges();
                    }
                }
                else
                {
                    _context.CombatUpdates.Add(new CombatUpdate { CombatId = combatId, IsUpdated = true });
                    _context.SaveChanges();
                }
            }
            catch (Exception ex) { }
        }
        public List<MonsterTemplateAbility> insertAssociateAbilities(List<MonsterTemplateAbility> MonsterTemplateAbilityVM)
        {
            try
            {
                _context.MonsterTemplateAbilities.AddRange(MonsterTemplateAbilityVM);
                _context.SaveChanges();
            }
            catch (Exception ex) { }

            return MonsterTemplateAbilityVM;
        }
        public List<MonsterTemplateSpell> insertAssociateSpells(List<MonsterTemplateSpell> MonsterTemplateSpellVM)
        {
            try
            {
                _context.MonsterTemplateSpells.AddRange(MonsterTemplateSpellVM);
                _context.SaveChanges();
            }
            catch (Exception ex) { }

            return MonsterTemplateSpellVM;
        }
        public List<MonsterTemplateBuffAndEffect> insertAssociateBuffAndEffects(List<MonsterTemplateBuffAndEffect> MonsterTemplateBuffAndEffectVM)
        {
            try
            {
                _context.MonsterTemplateBuffAndEffects.AddRange(MonsterTemplateBuffAndEffectVM);
                _context.SaveChanges();
            }
            catch (Exception ex) { }

            return MonsterTemplateBuffAndEffectVM;
        }
        public List<MonsterTemplateMonster> insertAssociateMonsterTemplates(List<MonsterTemplateMonster> MonsterTemplateMonsterVM)
        {
            try
            {
                _context.MonsterTemplateMonsters.AddRange(MonsterTemplateMonsterVM);
                _context.SaveChanges();

            }
            catch (Exception ex)
            {
            }
            return MonsterTemplateMonsterVM;
        }
        public List<MonsterTemplateItemMaster> insertAssociateItemMasters(List<MonsterTemplateItemMaster> MonsterTemplateItemMasterVM)
        {
            try
            {
                _context.MonsterTemplateItemMasters.AddRange(MonsterTemplateItemMasterVM);
                _context.SaveChanges();

            }
            catch (Exception ex) { }
            return MonsterTemplateItemMasterVM;
        }
        public List<RandomizationEngine> insertRandomizationEngines(List<RandomizationEngine> RandomizationEngine, int MonsterTemplateId)
        {
            try
            {
                foreach (var Ritem in RandomizationEngine)
                {
                    Ritem.ItemMaster = null;
                    if (Ritem.ItemMasterId != 0)
                    {
                        Ritem.RandomizationEngineId = 0;
                        _context.RandomizationEngines.Add(Ritem);
                        _context.MonsterTemplateRandomizationEngines.Add(new MonsterTemplateRandomizationEngine()
                        {
                            MonsterTemplateId = MonsterTemplateId,
                            RandomizationEngineId = Ritem.RandomizationEngineId
                        });
                    }

                }
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
            }
            return RandomizationEngine;
        }

        private static int Getindex(int index)
        {
            index = index + 1;
            return index;
        }
        public void deployMonster(DeployMonsterTemplate model)
        {
            string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;


            //assign datatable for list records of dice results.
            int index = 0;
            List<numbersList> healthCurrent = model.healthCurrent.Select(x => new numbersList()
            {
                RowNum = index = Getindex(index),
                Number = x
            }).ToList();

            index = 0;
            List<numbersList> healthMax = model.healthMax.Select(x => new numbersList()
            {
                RowNum = index = Getindex(index),
                Number = x
            }).ToList();

            index = 0;
            List<numbersList> armorClass = model.armorClass.Select(x => new numbersList()
            {
                RowNum = index = Getindex(index),
                Number = x
            }).ToList();

            index = 0;
            List<numbersList> xpValue = model.xpValue.Select(x => new numbersList()
            {
                RowNum = index = Getindex(index),
                Number = x
            }).ToList();

            index = 0;
            List<numbersList> challangeRating = model.challangeRating.Select(x => new numbersList()
            {
                RowNum = index = Getindex(index),
                Number = x
            }).ToList();

            DataTable DT_reItems = new DataTable();
            if (model.REItems != null)
            {
                if (model.REItems.Count > 0)
                {
                    DT_reItems = utility.ToDataTable<REItems>(model.REItems);
                }
                else
                {
                    model.REItems.Add(new REItems() { itemMasterId = 0, qty = 0 });
                    DT_reItems = utility.ToDataTable<REItems>(model.REItems);
                }
            }
            else
            {
                model.REItems.Add(new REItems() { itemMasterId = 0, qty = 0 });
                DT_reItems = utility.ToDataTable<REItems>(model.REItems);
            }


            DataTable DT_healthCurrent = new DataTable();

            if (healthCurrent.Count > 0)
            {
                DT_healthCurrent = utility.ToDataTable<numbersList>(healthCurrent);
            }


            DataTable DT_healthMax = new DataTable();

            if (healthMax.Count > 0)
            {
                DT_healthMax = utility.ToDataTable<numbersList>(healthMax);
            }


            DataTable DT_armorClass = new DataTable();

            if (armorClass.Count > 0)
            {
                DT_armorClass = utility.ToDataTable<numbersList>(armorClass);
            }


            DataTable DT_xpValue = new DataTable();

            if (xpValue.Count > 0)
            {
                DT_xpValue = utility.ToDataTable<numbersList>(xpValue);
            }


            DataTable DT_challangeRating = new DataTable();

            if (challangeRating.Count > 0)
            {
                DT_challangeRating = utility.ToDataTable<numbersList>(challangeRating);
            }




            using (SqlConnection con = new SqlConnection(consString))
            {

                using (SqlCommand cmd = new SqlCommand("MonsterTemplate_Deploy"))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Connection = con;
                    cmd.Parameters.AddWithValue("@RulesetID", model.rulesetId);
                    cmd.Parameters.AddWithValue("@MonsterTemplateId", model.monsterTemplateId);
                    cmd.Parameters.AddWithValue("@Qty", model.qty);
                    cmd.Parameters.AddWithValue("@HealthCurrentList", DT_healthCurrent);
                    cmd.Parameters.AddWithValue("@HealthMaxList", DT_healthMax);
                    cmd.Parameters.AddWithValue("@ArmorClassList", DT_armorClass);
                    cmd.Parameters.AddWithValue("@XPValueList", DT_xpValue);
                    cmd.Parameters.AddWithValue("@ChallangeRatingList", DT_challangeRating);
                    cmd.Parameters.AddWithValue("@AddToCombat", model.addToCombat);
                    cmd.Parameters.AddWithValue("@REItems", DT_reItems);
                    //cmd.Parameters.AddWithValue("@IsBundle", model.isBundle);

                    con.Open();
                    try
                    {
                        var a = cmd.ExecuteNonQuery();
                    }
                    catch (Exception ex)
                    {
                        con.Close();
                        throw ex;
                    }
                    con.Close();

                }
            }
        }


        public MonstersWithFilterCount SP_GetMonstersByRuleSetId(int rulesetId, int page, int pageSize, int sortType = 1, int? characterId=null)
        {
            int FilterAplhabetCount=0;
            int FilterCRCount=0;
            int FilterHealthCount=0;
            MonstersWithFilterCount result = new MonstersWithFilterCount();
        List<MonsterWithItemCount> _monsterList = new List<MonsterWithItemCount>();
            RuleSet ruleset = new RuleSet();

            result.Monsters = _monsterList;
            result.FilterAplhabetCount = FilterAplhabetCount;
            result.FilterCRCount = FilterCRCount;
            result.FilterHealthCount = FilterHealthCount;

            short num = 0;
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("Monster_GetByRulesetID", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@RulesetID", rulesetId);
                command.Parameters.AddWithValue("@page", page);
                command.Parameters.AddWithValue("@size", pageSize);
                command.Parameters.AddWithValue("@SortType", sortType);
                command.Parameters.AddWithValue("@CharacterID", characterId);
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



            if (ds.Tables[1].Rows.Count > 0)
                ruleset = _repo.GetRuleset(ds.Tables[1], num);

            if (ds.Tables[0].Rows.Count > 0)
            {
                int? nullInt = null;
                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    MonsterWithItemCount _monster = new MonsterWithItemCount()
                    {
                        AddToCombatTracker = row["AddToCombatTracker"] == DBNull.Value ? false : Convert.ToBoolean(row["AddToCombatTracker"]),
                        ArmorClass = row["ArmorClass"] == DBNull.Value ? 0 : Convert.ToInt32(row["ArmorClass"].ToString()),
                        ChallangeRating = row["ChallangeRating"] == DBNull.Value ? 0 : Convert.ToInt32(row["ChallangeRating"].ToString()),
                        HealthCurrent = row["HealthCurrent"] == DBNull.Value ? 0 : Convert.ToInt32(row["HealthCurrent"].ToString()),
                        HealthMax = row["HealthMax"] == DBNull.Value ? 0 : Convert.ToInt32(row["HealthMax"].ToString()),
                        ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString(),
                        IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]),
                        Metatags = row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString(),
                        MonsterId = row["MonsterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterId"].ToString()),
                        MonsterTemplateId = row["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateId"].ToString()),
                        Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString(),
                        RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString()),
                        XPValue = row["XPValue"] == DBNull.Value ? 0 : Convert.ToInt32(row["XPValue"].ToString()),
                        ItemsCount = row["ItemsCount"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemsCount"].ToString()),
                        Command= row["Command"] == DBNull.Value ? null : row["Command"].ToString(),
                        CommandName = row["CommandName"] == DBNull.Value ? null : row["CommandName"].ToString(),
                        CharacterId = row["CharacterId"] == DBNull.Value ? nullInt : Convert.ToInt32(row["CharacterId"].ToString()),
                    };




                    MonsterTemplate_Bundle _MonsterTemplate = new MonsterTemplate_Bundle();
                    _MonsterTemplate.Stats = row["Stats"] == DBNull.Value ? null : row["Stats"].ToString();
                    _MonsterTemplate.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                    _MonsterTemplate.CommandName = row["CommandName"] == DBNull.Value ? null : row["CommandName"].ToString();
                    _MonsterTemplate.Description = row["Description"] == DBNull.Value ? null : row["Description"].ToString();
                    _MonsterTemplate.gmOnly = row["gmOnly"] == DBNull.Value ? null : row["gmOnly"].ToString();
                    _MonsterTemplate.MonsterTemplateId = row["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateId"].ToString());
                    _MonsterTemplate.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString());
                    _MonsterTemplate.Health = row["MTHealth"] == DBNull.Value ? null : row["MTHealth"].ToString();
                    _MonsterTemplate.ArmorClass = row["MTArmorClass"] == DBNull.Value ? null : row["MTArmorClass"].ToString();
                    _MonsterTemplate.ChallangeRating = row["MTChallangeRating"] == DBNull.Value ? null : row["MTChallangeRating"].ToString();
                    _MonsterTemplate.XPValue = row["MTXPValue"] == DBNull.Value ? null : row["MTXPValue"].ToString();
                    _MonsterTemplate.InitiativeCommand = row["InitiativeCommand"] == DBNull.Value ? null : row["InitiativeCommand"].ToString();
                    _MonsterTemplate.IsRandomizationEngine = row["MTIsRandomizationEngine"] == DBNull.Value ? false : Convert.ToBoolean(row["MTIsRandomizationEngine"]);

                    _MonsterTemplate.RandomizationEngine = new List<RandomizationEngine>();
                    if (ds.Tables[2].Rows.Count > 0)
                    {
                        foreach (DataRow RErow in ds.Tables[2].Rows)
                        {
                            int MT_ID = RErow["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["MonsterTemplateId"]);
                            if (MT_ID == _MonsterTemplate.MonsterTemplateId && !_MonsterTemplate.IsBundle)
                            {
                                RandomizationEngine RE = new RandomizationEngine();
                                RE.RandomizationEngineId = RErow["RandomizationEngineId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["RandomizationEngineId"]);
                                RE.Qty = RErow["Qty"] == DBNull.Value ? string.Empty : RErow["Qty"].ToString();
                                RE.Percentage = RErow["Percentage"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["Percentage"]);
                                RE.SortOrder = RErow["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["SortOrder"]);
                                RE.ItemMasterId = RErow["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["ItemMasterId"]);
                                RE.IsOr = RErow["IsOr"] == DBNull.Value ? false : Convert.ToBoolean(RErow["IsOr"]);
                                RE.IsDeleted = RErow["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(RErow["IsDeleted"]);

                                RE.ItemMaster = new ItemMaster()
                                {
                                    ItemMasterId = RErow["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["ItemMasterId"]),
                                    ItemName = RErow["ItemName"] == DBNull.Value ? null : RErow["ItemName"].ToString(),
                                    ItemImage = RErow["ItemImage"] == DBNull.Value ? null : RErow["ItemImage"].ToString()
                                };
                                _MonsterTemplate.RandomizationEngine.Add(RE);
                            }
                        }
                    }

                    if (ds.Tables[3].Rows.Count > 0)
                    {
                        FilterAplhabetCount = ds.Tables[3].Rows[0][0] == DBNull.Value ? 0 : Convert.ToInt32(ds.Tables[3].Rows[0][0]);                       
                    }
                    if (ds.Tables[4].Rows.Count > 0)
                    {
                        FilterCRCount = ds.Tables[4].Rows[0][0] == DBNull.Value ? 0 : Convert.ToInt32(ds.Tables[4].Rows[0][0]);
                    }
                    if (ds.Tables[5].Rows.Count > 0)
                    {
                        FilterHealthCount = ds.Tables[5].Rows[0][0] == DBNull.Value ? 0 : Convert.ToInt32(ds.Tables[5].Rows[0][0]);
                    }

                    _monster.RuleSet = ruleset;
                    _monster.MonsterTemplate = _MonsterTemplate;
                    _monsterList.Add(_monster);
                }
            }
            result.Monsters = _monsterList;
            result.FilterAplhabetCount = FilterAplhabetCount;
            result.FilterCRCount = FilterCRCount;
            result.FilterHealthCount = FilterHealthCount;
            return result;
        }

        public async Task enableCombatTracker(int monsterId, bool enableCombatTracker)
        {
            var monster = await _context.Monsters.Where(x => x.MonsterId == monsterId && x.IsDeleted != true).FirstOrDefaultAsync();
            if (monster != null)
            {
                monster.AddToCombatTracker = enableCombatTracker;
                await _context.SaveChangesAsync();
            }
        }
        //public List<BuffAndEffect> GetByRuleSetId_add(int rulesetId)
        //{
        //    List<BuffAndEffect> buffAndEffectList = new List<BuffAndEffect>();
        //    string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
        //    //string qry = "EXEC AbilitiesByRuleSetId_add @RulesetID = '" + rulesetId + "'";

        //    SqlConnection connection = new SqlConnection(connectionString);
        //    SqlCommand command = new SqlCommand();
        //    SqlDataAdapter adapter = new SqlDataAdapter();
        //    DataSet ds = new DataSet();
        //    try
        //    {
        //        connection.Open();
        //        command = new SqlCommand("BuffAndEffectsByRuleSetId_add", connection);

        //        // Add the parameters for the SelectCommand.
        //        command.Parameters.AddWithValue("@RulesetID", rulesetId);
        //        command.CommandType = CommandType.StoredProcedure;

        //        adapter.SelectCommand = command;

        //        adapter.Fill(ds);
        //        command.Dispose();
        //        connection.Close();
        //    }
        //    catch (Exception ex)
        //    {
        //        command.Dispose();
        //        connection.Close();
        //    }

        //    if (ds.Tables[0].Rows.Count > 0)
        //    {
        //        foreach (DataRow row in ds.Tables[0].Rows)
        //        {
        //            BuffAndEffect _buffAndEffect = new BuffAndEffect();
        //            _buffAndEffect.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
        //            _buffAndEffect.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();
        //            _buffAndEffect.BuffAndEffectId = row["BuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(row["BuffAndEffectId"].ToString());
        //            _buffAndEffect.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString());

        //            buffAndEffectList.Add(_buffAndEffect);
        //        }
        //    }
        //    return buffAndEffectList;
        //}
        public async Task<MonsterTemplate> Core_CreateMonsterTemplateUsingMonster(int monsterTemplateId, int rulesetID)
        {
            MonsterTemplate model = GetById(monsterTemplateId);// GetItemMasterById(ItemMasterID);
            MonsterTemplate monsterTemplate = new MonsterTemplate()

            {
                MonsterTemplateId = model.MonsterTemplateId,
                Command = model.Command,
                Metatags = model.Metatags,
                RuleSetId = rulesetID,
                ArmorClass = model.ArmorClass,
                ChallangeRating = model.ChallangeRating,
                CommandName = model.CommandName,
                Description = model.Description,
                gmOnly = model.gmOnly,
                Health = model.Health,
                ImageUrl = model.ImageUrl,
                InitiativeCommand = model.InitiativeCommand,

                IsRandomizationEngine = model.IsRandomizationEngine,
                //MonsterTemplateAbilities = model.MonsterTemplateAbilities,
                //MonsterTemplateBuffAndEffects = model.MonsterTemplateBuffAndEffects,
                //MonsterTemplateCommands = model.MonsterTemplateCommands,
                //MonsterTemplateItemMasters = model.MonsterTemplateItemMasters,
                //MonsterTemplateMonsters = model.MonsterTemplateMonsters,
                //MonsterTemplateSpells = model.MonsterTemplateSpells,
                Name = model.Name,



                Stats = model.Stats,
                XPValue = model.XPValue,
            };



            MonsterTemplate CreatedItemMaster = await Core_CreateMonsterTemplate(monsterTemplate);
            return CreatedItemMaster;
        }

        public List<ItemMasterForMonsterTemplate> getMonsterItemsToDrop(int monsterId)
        {
            return _context.ItemMasterMonsterItems.Where(x => x.MonsterId == monsterId && x.IsDeleted != true).Include(x => x.ItemMaster).Select(x => new ItemMasterForMonsterTemplate()
            {


                ItemId = x.ItemId,
                ImageUrl = x.ItemMaster.ItemImage,
                ItemMasterId = x.ItemMasterId,
                Name = x.ItemMaster.ItemName,
                Qty = (int)x.Quantity,
                RuleSetId = x.ItemMaster.RuleSetId
            }).ToList();
        }
        public async Task<int> DropItemsToLoot(List<ItemMasterForMonsterTemplate> list, int monsterId)
        {
            foreach (var item in list)
            {
                var ItemMasterLootSpells = new List<ItemMasterLootSpell>();
                var ItemMasterLootAbilitys = new List<ItemMasterLootAbility>();
                var ItemMasterLootBuffAndEffects = new List<ItemMasterLootBuffAndEffect>();
                var ItemMasterLootCommands = new List<ItemMasterLootCommand>();

                var ItemMasterMonsterItem = _context.ItemMasterMonsterItems.Where(x => x.ItemId == item.ItemId)
                    .Include(x => x.ItemMasterCommand)
                    .Include(x => x.ItemMasterAbilities)
                    .Include(x => x.ItemMasterSpell)
                    .Include(x => x.itemMasterBuffAndEffects)
                    .FirstOrDefault();
                if (ItemMasterMonsterItem != null)
                {
                    ItemMasterMonsterItem.IsDeleted = true;
                    if (ItemMasterMonsterItem.ItemMasterCommand != null && ItemMasterMonsterItem.ItemMasterCommand.Count > 0)
                    {
                        foreach (var record in ItemMasterMonsterItem.ItemMasterCommand)
                        {
                            ItemMasterLootCommand rec = new ItemMasterLootCommand()
                            {
                                Command = record.Command,
                                Name = record.Name
                            };
                            ItemMasterLootCommands.Add(rec);
                        }
                    }
                    if (ItemMasterMonsterItem.ItemMasterAbilities != null && ItemMasterMonsterItem.ItemMasterAbilities.Count > 0)
                    {
                        foreach (var record in ItemMasterMonsterItem.ItemMasterAbilities)
                        {
                            ItemMasterLootAbility rec = new ItemMasterLootAbility()
                            {
                                AbilityId = record.AbilityId
                            };
                            ItemMasterLootAbilitys.Add(rec);
                        }
                    }
                    if (ItemMasterMonsterItem.ItemMasterSpell != null && ItemMasterMonsterItem.ItemMasterSpell.Count > 0)
                    {
                        foreach (var record in ItemMasterMonsterItem.ItemMasterSpell)
                        {
                            ItemMasterLootSpell rec = new ItemMasterLootSpell()
                            {
                                SpellId = record.SpellId
                            };
                            ItemMasterLootSpells.Add(rec);
                        }
                    }
                    if (ItemMasterMonsterItem.itemMasterBuffAndEffects != null && ItemMasterMonsterItem.itemMasterBuffAndEffects.Count > 0)
                    {
                        foreach (var record in ItemMasterMonsterItem.itemMasterBuffAndEffects)
                        {
                            ItemMasterLootBuffAndEffect rec = new ItemMasterLootBuffAndEffect()
                            {
                                BuffAndEffectId = record.BuffAndEffectId
                            };
                            ItemMasterLootBuffAndEffects.Add(rec);
                        }
                    }
                }
                _context.SaveChanges();
                ItemMaster obj = _context.ItemMasters.Where(x => x.ItemMasterId == item.ItemMasterId).FirstOrDefault();
                if (obj != null)
                {
                    int rulesetId = ItemMasterMonsterItem.RuleSetId != null ? (int)ItemMasterMonsterItem.RuleSetId : obj.RuleSetId;
                    var monster = _context.Monsters.Where(x => x.MonsterId == monsterId).FirstOrDefault();
                    if (monster != null)
                    {
                        rulesetId = monster.RuleSetId;
                    }

                    LootPileViewModel monsterLootPile = _itemMasterService.getMonsterLootPile(monsterId, rulesetId);


                    _itemMasterService.CreateItemMasterLoot(obj, new ItemMasterLoot()
                    {
                        IsShow = true,
                        Quantity = ItemMasterMonsterItem.Quantity,
                        Command = ItemMasterMonsterItem.Command,
                        CommandName = ItemMasterMonsterItem.CommandName,
                        ContainerVolumeMax = ItemMasterMonsterItem.ContainerVolumeMax,
                        ContainerWeightMax = ItemMasterMonsterItem.ContainerWeightMax,
                        ContainerWeightModifier = ItemMasterMonsterItem.ContainerWeightModifier,
                        IsConsumable = ItemMasterMonsterItem.IsConsumable,
                        IsContainer = ItemMasterMonsterItem.IsContainer,
                        IsIdentified = ItemMasterMonsterItem.IsIdentified,
                        IsMagical = ItemMasterMonsterItem.IsMagical,
                        IsVisible = ItemMasterMonsterItem.IsVisible,
                        ItemCalculation = ItemMasterMonsterItem.ItemCalculation,
                        ItemImage = ItemMasterMonsterItem.ItemImage,
                        ItemName = ItemMasterMonsterItem.ItemName,
                        ItemStats = ItemMasterMonsterItem.ItemStats,
                        ItemVisibleDesc = ItemMasterMonsterItem.ItemVisibleDesc,
                        Metatags = ItemMasterMonsterItem.Metatags,
                        PercentReduced = ItemMasterMonsterItem.PercentReduced,
                        Rarity = ItemMasterMonsterItem.Rarity,
                        RuleSetId = rulesetId,
                        TotalWeight = ItemMasterMonsterItem.TotalWeight,
                        TotalWeightWithContents = ItemMasterMonsterItem.TotalWeightWithContents,
                        Value = ItemMasterMonsterItem.Value,
                        Volume = ItemMasterMonsterItem.Volume,
                        Weight = ItemMasterMonsterItem.Weight,
                        LootPileId= monsterLootPile.LootId,

                    },
                    ItemMasterLootSpells,
                   ItemMasterLootAbilitys,
                    ItemMasterLootBuffAndEffects,
                   ItemMasterLootCommands, rulesetId
                    );
                }
            }

            int pendingItemsCount = 0;
            if (monsterId > 0)
            {
                pendingItemsCount = _context.ItemMasterMonsterItems.Where(x => x.MonsterId == monsterId && x.IsDeleted != true).Count();
            }
            return pendingItemsCount;
        }
        public List<MonsterTemplate_Bundle> GetMonsterTemplatesByRuleSetId_add(int rulesetId, bool includeBundles = false)
        {
            List<MonsterTemplate_Bundle> monsterList = new List<MonsterTemplate_Bundle>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            // string qry = "EXEC ItemMasterGetAllDetailsByRulesetID_add @RulesetID = '" + rulesetId + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("MonsterTemplateGetAllDetailsByRulesetID_add", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@RulesetID", rulesetId);
                command.Parameters.AddWithValue("@includeBundles", includeBundles);
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
                foreach (DataRow ItemRow in ds.Tables[0].Rows)
                {
                    MonsterTemplate_Bundle MonsterTemp = new MonsterTemplate_Bundle()
                    {
                        ArmorClass = ItemRow["ArmorClass"] == DBNull.Value ? null : ItemRow["ArmorClass"].ToString(),
                        ChallangeRating = ItemRow["ChallangeRating"] == DBNull.Value ? null : ItemRow["ChallangeRating"].ToString(),
                        Command = ItemRow["Command"] == DBNull.Value ? null : ItemRow["Command"].ToString(),
                        CommandName = ItemRow["CommandName"] == DBNull.Value ? null : ItemRow["CommandName"].ToString(),
                        Description = ItemRow["Description"] == DBNull.Value ? null : ItemRow["Description"].ToString(),
                        gmOnly = ItemRow["gmOnly"] == DBNull.Value ? null : ItemRow["gmOnly"].ToString(),
                        Health = ItemRow["Health"] == DBNull.Value ? null : ItemRow["Health"].ToString(),
                        ImageUrl = ItemRow["ImageUrl"] == DBNull.Value ? null : ItemRow["ImageUrl"].ToString(),
                        InitiativeCommand = ItemRow["InitiativeCommand"] == DBNull.Value ? null : ItemRow["InitiativeCommand"].ToString(),
                        IsDeleted = ItemRow["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(ItemRow["IsDeleted"]),
                        IsRandomizationEngine = ItemRow["IsRandomizationEngine"] == DBNull.Value ? false : Convert.ToBoolean(ItemRow["IsRandomizationEngine"]),
                        Metatags = ItemRow["Metatags"] == DBNull.Value ? null : ItemRow["Metatags"].ToString(),
                        MonsterTemplateId = ItemRow["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(ItemRow["MonsterTemplateId"]),
                        Name = ItemRow["Name"] == DBNull.Value ? null : ItemRow["Name"].ToString(),
                        ParentMonsterTemplateId = ItemRow["ParentMonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(ItemRow["ParentMonsterTemplateId"]),
                        RuleSetId = rulesetId,
                        Stats = ItemRow["Stats"] == DBNull.Value ? null : ItemRow["Stats"].ToString(),
                        XPValue = ItemRow["XPValue"] == DBNull.Value ? null : ItemRow["XPValue"].ToString(),
                        IsBundle = ItemRow["IsBundle"] == DBNull.Value ? false : Convert.ToBoolean(ItemRow["IsBundle"]),
                        BundleItems = new List<MonsterTemplate_BundleItemsWithRandomItems>()
                    };
                    if (ds.Tables.Count > 1 && MonsterTemp.IsBundle)
                    {
                        if (ds.Tables[1].Rows.Count > 0)
                        {
                            foreach (DataRow BundleItemRow in ds.Tables[1].Rows)
                            {
                                int monsterBundleId = BundleItemRow["BundleID"] == DBNull.Value ? 0 : Convert.ToInt32(BundleItemRow["BundleID"]);
                                if (monsterBundleId == MonsterTemp.MonsterTemplateId)
                                {
                                    MonsterTemplate_BundleItemsWithRandomItems obj = new MonsterTemplate_BundleItemsWithRandomItems()
                                    {
                                        BundleId = monsterBundleId,
                                        BundleItemId = BundleItemRow["BundleItemId"] == DBNull.Value ? 0 : Convert.ToInt32(BundleItemRow["BundleItemId"]),
                                        MonsterTemplateId = BundleItemRow["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(BundleItemRow["MonsterTemplateId"]),
                                        Quantity = BundleItemRow["Quantity"] == DBNull.Value ? 0 : Convert.ToInt32(BundleItemRow["Quantity"]),
                                        MonsterTemplate = new MonsterTemplate_WithRandomItems()
                                        {
                                            ArmorClass = BundleItemRow["ArmorClass"] == DBNull.Value ? "0" : BundleItemRow["ArmorClass"].ToString(),
                                            ChallangeRating = BundleItemRow["ChallangeRating"] == DBNull.Value ? "0" : BundleItemRow["ChallangeRating"].ToString(),
                                            XPValue = BundleItemRow["XPValue"] == DBNull.Value ? "0" : BundleItemRow["XPValue"].ToString(),
                                            Health = BundleItemRow["Health"] == DBNull.Value ? "0" : BundleItemRow["Health"].ToString(),
                                            RuleSetId = rulesetId,
                                            IsRandomizationEngine = BundleItemRow["IsRandomizationEngine"] == DBNull.Value ? false : Convert.ToBoolean(BundleItemRow["IsRandomizationEngine"]),
                                            RandomizationEngine = new List<RandomizationEngine>()
                                        }
                                    };

                                    //Randomization Add for Bundles/Group
                                    if (ds.Tables[2].Rows.Count > 0)
                                    {
                                        foreach (DataRow RErow in ds.Tables[2].Rows)
                                        {
                                            int MT_ID = RErow["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["MonsterTemplateId"]);
                                            if (obj.MonsterTemplateId == MT_ID)
                                            {
                                                RandomizationEngine RE = new RandomizationEngine();
                                                RE.RandomizationEngineId = RErow["RandomizationEngineId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["RandomizationEngineId"]);
                                                RE.Qty = RErow["Qty"] == DBNull.Value ? string.Empty : RErow["Qty"].ToString();
                                                RE.Percentage = RErow["Percentage"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["Percentage"]);
                                                RE.SortOrder = RErow["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["SortOrder"]);
                                                RE.ItemMasterId = RErow["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["ItemMasterId"]);
                                                RE.IsOr = RErow["IsOr"] == DBNull.Value ? false : Convert.ToBoolean(RErow["IsOr"]);
                                                RE.IsDeleted = RErow["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(RErow["IsDeleted"]);

                                                RE.ItemMaster = new ItemMaster()
                                                {
                                                    ItemMasterId = RErow["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["ItemMasterId"]),
                                                    ItemName = RErow["ItemName"] == DBNull.Value ? null : RErow["ItemName"].ToString(),
                                                    ItemImage = RErow["ItemImage"] == DBNull.Value ? null : RErow["ItemImage"].ToString()
                                                };
                                                obj.MonsterTemplate.RandomizationEngine.Add(RE);
                                            }
                                        }
                                    }
                                    MonsterTemp.BundleItems.Add(obj);
                                }

                            }
                        }
                    }

                    if (!MonsterTemp.IsBundle)
                    {
                        MonsterTemp.RandomizationEngine = new List<RandomizationEngine>();
                        if (ds.Tables[2].Rows.Count > 0)
                        {
                            foreach (DataRow RErow in ds.Tables[2].Rows)
                            {
                                int MT_ID = RErow["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["MonsterTemplateId"]);
                                if (MT_ID == MonsterTemp.MonsterTemplateId && !MonsterTemp.IsBundle)
                                {
                                    RandomizationEngine RE = new RandomizationEngine();
                                    RE.RandomizationEngineId = RErow["RandomizationEngineId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["RandomizationEngineId"]);
                                    RE.Qty = RErow["Qty"] == DBNull.Value ? string.Empty : RErow["Qty"].ToString();
                                    RE.Percentage = RErow["Percentage"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["Percentage"]);
                                    RE.SortOrder = RErow["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["SortOrder"]);
                                    RE.ItemMasterId = RErow["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["ItemMasterId"]);
                                    RE.IsOr = RErow["IsOr"] == DBNull.Value ? false : Convert.ToBoolean(RErow["IsOr"]);
                                    RE.IsDeleted = RErow["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(RErow["IsDeleted"]);

                                    RE.ItemMaster = new ItemMaster()
                                    {
                                        ItemMasterId = RErow["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["ItemMasterId"]),
                                        ItemName = RErow["ItemName"] == DBNull.Value ? null : RErow["ItemName"].ToString(),
                                        ItemImage = RErow["ItemImage"] == DBNull.Value ? null : RErow["ItemImage"].ToString()
                                    };
                                    MonsterTemp.RandomizationEngine.Add(RE);
                                }
                            }
                        }
                    }
                    monsterList.Add(MonsterTemp);
                }
            }
            return monsterList;

        }
        public bool Core_BundleWithParentIDExists(int bundleId, int rulesetID)
        {
            if (_context.MonsterTemplateBundles.Where(x => x.BundleId == bundleId && x.ParentMonsterTemplateBundleId != null).Any())
            {
                return true;
            }
            else
            {
                var model = _context.MonsterTemplateBundles.Where(x => x.BundleId == bundleId && x.ParentMonsterTemplateBundleId == null);
                if (model.FirstOrDefault().RuleSetId == rulesetID)
                {
                    return true;
                }
            }
            return false;
        }
        public ItemMasterMonsterItem GetMonsterItemDetailByItemId(int itemId)
        {
            return _context.ItemMasterMonsterItems.Where(x => x.ItemId == itemId && x.IsDeleted != true).FirstOrDefault();
        }
        public void AddMonsters(List<DeployMonsterTemplate> model)
        {
            foreach (var item in model)
            {
                try
                {
                    deployMonster(item);
                }
                catch (Exception ex)
                {

                }

            }

        }

        public void DeleteMultiMonsterTemplates(List<MonsterTemplate_Bundle> model, int rulesetId) {
            int index = 0;
            List<numbersList> dtList = model.Where(x => x.IsBundle).Select(x => new numbersList()
            {
                RowNum = index = Getindex(index),
                Number = x.MonsterTemplateId
            }).ToList();


            DataTable DT_List = new DataTable();

            if (dtList.Count > 0)
            {
                DT_List = utility.ToDataTable<numbersList>(dtList);
            }
            else
            {
                var emptyList = new List<numbersList>();
                emptyList.Add(new numbersList { RowNum = 0, Number = 0 });
                DT_List = utility.ToDataTable<numbersList>(emptyList);
            }

            index = 0;
            List<numbersList> dtList1 = model.Where(x => !x.IsBundle).Select(x => new numbersList()
            {
                RowNum = index = Getindex(index),
                Number = x.MonsterTemplateId
            }).ToList();


            DataTable DT_List1 = new DataTable();

            if (dtList1.Count > 0)
            {
                DT_List1 = utility.ToDataTable<numbersList>(dtList1);
            }
            else
            {
                var emptyList = new List<numbersList>();
                emptyList.Add(new numbersList { RowNum = 0, Number = 0 });
                DT_List = utility.ToDataTable<numbersList>(emptyList);
            }


            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            int rowseffectesd = 0;
            SqlConnection con1 = new SqlConnection(connectionString);
            con1.Open();
            SqlCommand cmd1 = new SqlCommand("Ruleset_DeleteMultiMonsterTemplates", con1);
            cmd1.CommandType = CommandType.StoredProcedure;

            cmd1.Parameters.AddWithValue("@RecordIdsList", DT_List1);
            cmd1.Parameters.AddWithValue("@RulesetID", rulesetId);

            rowseffectesd = cmd1.ExecuteNonQuery();
            con1.Close();


            SqlConnection con = new SqlConnection(connectionString);
            con.Open();
            SqlCommand cmd = new SqlCommand("Ruleset_DeleteMultiMonsterTemplateBundles", con);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@RecordIdsList", DT_List);
            cmd.Parameters.AddWithValue("@RulesetID", rulesetId);

            rowseffectesd = cmd.ExecuteNonQuery();
            con.Close();


        }
        public void DeleteMultiMonsters(List<Monster> model, int rulesetId) {

            int index = 0;
            List<numbersList> dtList = model.Select(x => new numbersList()
            {
                RowNum = index = Getindex(index),
                Number = x.MonsterId
            }).ToList();


            DataTable DT_List = new DataTable();

            if (dtList.Count > 0)
            {
                DT_List = utility.ToDataTable<numbersList>(dtList);
            }
            else
            {
                var emptyList = new List<numbersList>();
                emptyList.Add(new numbersList { RowNum = 0, Number = 0 });
                DT_List = utility.ToDataTable<numbersList>(emptyList);
            }


            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            int rowseffectesd = 0;
            SqlConnection con = new SqlConnection(connectionString);
            con.Open();
            SqlCommand cmd = new SqlCommand("Ruleset_DeleteMultiMonsters", con);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@RecordIdsList", DT_List);
            cmd.Parameters.AddWithValue("@RulesetID", rulesetId);

            rowseffectesd = cmd.ExecuteNonQuery();
            con.Close();
        }
        
        public async Task AssignMonsterTocharacter(AssociateMonsterToCharacter model)
        {
            try
            {
                var monster = _context.Monsters.Where(x => x.MonsterId == model.MonsterId && x.IsDeleted != true).FirstOrDefault();
                var combatants = _context.CombatantLists.Where(x => x.MonsterId == model.MonsterId && x.IsDeleted != true).ToList();
                if (monster !=null)
                {
                    monster.CharacterId = model.CharacterId;
                    if (model.CharacterId==null)
                    {
                        var linkCharacterTiles = _context.CharacterLinkTiles.Where(x => x.AllyId == model.MonsterId && x.IsDeleted != true).ToList();
                        foreach (var tile in linkCharacterTiles)
                        {
                            tile.AllyId = null;
                        }
                        var executeCharacterTiles = _context.CharacterExecuteTiles.Where(x => x.AllyId == model.MonsterId && x.IsDeleted != true).ToList();
                        foreach (var tile in executeCharacterTiles)
                        {
                            tile.AllyId = null;
                        }
                        
                        foreach (var combatant in combatants)
                        {
                            combatant.VisibilityColor = "red";
                        }
                        
                    }

                    _context.SaveChanges();

                    if (combatants.Any() && model.CharacterId == null)
                    {
                        var combats_Ids = combatants.Select(x => x.CombatId).Distinct().ToList();
                        foreach (var combat in combats_Ids)
                        {
                            if (combat > 0)
                            {
                                MarkCombatAsUpdated((int)combat);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        public async Task<Monster> duplicateMonster(Monster model)
        {
            //Spells
            List<CommonID> dtSpellIDs = model.MonsterSpells.Select(x => new CommonID() { ID = x.SpellId }).ToList();
            DataTable DT_SpellIDs = new DataTable();
            if (dtSpellIDs.Count > 0)
            {
                DT_SpellIDs = utility.ToDataTable<CommonID>(dtSpellIDs);
            }
            else
            {
                var emptyList = new List<CommonID>();
                emptyList.Add(new CommonID { ID = 0 });
                DT_SpellIDs = utility.ToDataTable<CommonID>(emptyList);
            }

            //Ability
            List<CommonID> dtAbilityIDs = model.MonsterAbilitys.Select(x => new CommonID() { ID = x.AbilityId }).ToList();
            DataTable DT_AbilityIDs = new DataTable();
            if (dtAbilityIDs.Count > 0)
            {
                DT_AbilityIDs = utility.ToDataTable<CommonID>(dtAbilityIDs);
            }
            else
            {
                var emptyList = new List<CommonID>();
                emptyList.Add(new CommonID { ID = 0 });
                DT_AbilityIDs = utility.ToDataTable<CommonID>(emptyList);
            }

            //Buff Effect
            List<CommonID> dtBuff_EffectIDs = model.MonsterBuffAndEffects.Select(x => new CommonID() { ID = x.BuffAndEffectId }).ToList();
            DataTable DT_Buff_EffectIDs = new DataTable();
            if (dtBuff_EffectIDs.Count > 0)
            {
                DT_Buff_EffectIDs = utility.ToDataTable<CommonID>(dtBuff_EffectIDs);
            }
            else
            {
                var emptyList = new List<CommonID>();
                emptyList.Add(new CommonID { ID = 0 });
                DT_Buff_EffectIDs = utility.ToDataTable<CommonID>(emptyList);
            }

            //Items
            List<CommonID> dtItemIDs = model.ItemMasterMonsterItems.Select(x => new CommonID() { ID = x.ItemId }).ToList();
            DataTable DT_ItemIDs = new DataTable();
            if (dtItemIDs.Count > 0)
            {
                DT_ItemIDs = utility.ToDataTable<CommonID>(dtItemIDs);
            }
            else
            {
                var emptyList = new List<CommonID>();
                emptyList.Add(new CommonID { ID = 0 });
                DT_ItemIDs = utility.ToDataTable<CommonID>(emptyList);
            }

            //Associate Monsters
            List<CommonID> dtMonsterIDs = model.MonsterMonsters.Select(x => new CommonID() { ID = x.AssociateMonsterId }).ToList();
            DataTable DT_MonsterIDs = new DataTable();
            if (dtMonsterIDs.Count > 0)
            {
                DT_MonsterIDs = utility.ToDataTable<CommonID>(dtMonsterIDs);
            }
            else
            {
                var emptyList = new List<CommonID>();
                emptyList.Add(new CommonID { ID = 0 });
                DT_MonsterIDs = utility.ToDataTable<CommonID>(emptyList);
            }

            //Associate Commands
            List<Commands> dtCommandIDs = model.MonsterCommands.Select(x => new Commands() { Command = x.Command,CommandName=x.Name }).ToList();
            DataTable DT_CommandIDs = new DataTable();
            if (dtCommandIDs.Count > 0)
            {
                DT_CommandIDs = utility.ToDataTable<Commands>(dtCommandIDs);
            }
            else
            {
                var emptyList = new List<Commands>();
                emptyList.Add(new Commands { Command ="", CommandName = ""});
                DT_CommandIDs = utility.ToDataTable<Commands>(emptyList);
            }

            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            int MonsterIdDuplicated = 0;
            SqlConnection con1 = new SqlConnection(connectionString);
            con1.Open();
            SqlCommand cmd1 = new SqlCommand("Monster_Duplicate", con1);
            cmd1.CommandType = CommandType.StoredProcedure;

            cmd1.Parameters.AddWithValue("@MonsterName", model.Name);
            cmd1.Parameters.AddWithValue("@RulesetID", model.RuleSetId);
            cmd1.Parameters.AddWithValue("@MonsterTemplateId", model.MonsterTemplateId);
            cmd1.Parameters.AddWithValue("@MonsterImageUrl", model.ImageUrl);
            cmd1.Parameters.AddWithValue("@MonsterMetatags", model.Metatags);
            cmd1.Parameters.AddWithValue("@HealthCurrent", model.HealthCurrent);
            cmd1.Parameters.AddWithValue("@HealthMax", model.HealthMax);
            cmd1.Parameters.AddWithValue("@ArmorClass", model.ArmorClass);
            cmd1.Parameters.AddWithValue("@XPValue", model.XPValue);
            cmd1.Parameters.AddWithValue("@ChallangeRating", model.ChallangeRating);
            cmd1.Parameters.AddWithValue("@AddToCombat", model.AddToCombatTracker);
            cmd1.Parameters.AddWithValue("@MonsterCommand", model.Command);
            cmd1.Parameters.AddWithValue("@MonsterCommandName", model.CommandName);
            cmd1.Parameters.AddWithValue("@MonsterDescription", model.Description);
            cmd1.Parameters.AddWithValue("@MonsterInitiativeCommand", model.InitiativeCommand);
            cmd1.Parameters.AddWithValue("@MonsterStats", model.Stats);
            cmd1.Parameters.AddWithValue("@MonsterGmOnly", model.gmOnly);
            cmd1.Parameters.AddWithValue("@_AssociatedSpells", DT_SpellIDs);
            cmd1.Parameters.AddWithValue("@_AssociatedAbilities", DT_AbilityIDs);
            cmd1.Parameters.AddWithValue("@_AssociatedBuffs", DT_Buff_EffectIDs);
            cmd1.Parameters.AddWithValue("@_AssociatedMonsters", DT_MonsterIDs);
            cmd1.Parameters.AddWithValue("@_AssociatedCommands", DT_CommandIDs);
            cmd1.Parameters.AddWithValue("@_AssociatedItems", DT_ItemIDs);
            cmd1.Parameters.AddWithValue("@CharacterID", model.CharacterId);

            MonsterIdDuplicated = (int)cmd1.ExecuteScalar();
            con1.Close();

            return new Monster (){ MonsterId= MonsterIdDuplicated };
        }

    }
}
