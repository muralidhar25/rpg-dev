using DAL.Models;
using DAL.Services;
using DAL.Services.RulesetTileServices;
using RPGSmithApp.Helpers.CoreRuleset;
using RPGSmithApp.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.Helpers
{
    public interface ICommonFuncsCoreRuleSet {
        CharacterStatViewModel GetCharacterStatViewModel(CharacterStat CharacterStat);
        RuleSetViewModel GetRuleSetViewModel(RuleSet ruleSet,string UserID=null);
        //RulesetRecordCount GetRulesetRecordCounts(int Id);
    }
    public class CommonFuncsCoreRuleSet: ICommonFuncsCoreRuleSet
    {
        private readonly IRuleSetService _ruleSetService;
        private readonly IAbilityService _abilityService;
        private readonly IItemMasterService _itemMasterService;
        private readonly ISpellService _spellService;
        private readonly ICharacterStatService _characterStatService;
        private readonly IRulesetDashboardLayoutService _rulesetDashboardLayoutService;
        private readonly ICoreRuleset _coreRulesetService;

        public CommonFuncsCoreRuleSet(IRuleSetService ruleSetService,
            ICharacterStatService characterStatService,
            IAbilityService abilityService,
            IItemMasterService itemMasterService,
            ISpellService spellService,
            IRulesetDashboardLayoutService rulesetDashboardLayoutService,
            ICoreRuleset coreRulesetService)
        {
            _ruleSetService = ruleSetService;
            _characterStatService = characterStatService;
            _abilityService = abilityService;
            _itemMasterService = itemMasterService;
            _spellService = spellService;
            _rulesetDashboardLayoutService = rulesetDashboardLayoutService;
            _coreRulesetService = coreRulesetService;
        }
        public CharacterStatViewModel GetCharacterStatViewModel(CharacterStat CharacterStat)
        {
            var characterStatsVM = new CharacterStatViewModel
            {
                CharacterStatId = CharacterStat.CharacterStatId,
                RuleSetId = CharacterStat.RuleSetId,
                StatName = CharacterStat.StatName,
                StatDesc = CharacterStat.StatDesc,
                isMultiSelect = CharacterStat.isMultiSelect,
                isActive = CharacterStat.isActive,
                SortOrder = CharacterStat.SortOrder,
                CreatedDate = CharacterStat.CreatedDate,
                ModifiedDate = CharacterStat.ModifiedDate,
                StatIdentifier = CharacterStat.StatIdentifier,
                ParentCharacterStatId = CharacterStat.ParentCharacterStatId,
                AddToModScreen= CharacterStat.AddToModScreen,
                IsChoiceNumeric= CharacterStat.IsChoiceNumeric,
                IsChoicesFromAnotherStat = CharacterStat.IsChoicesFromAnotherStat,
                SelectedChoiceCharacterStatId = CharacterStat.SelectedChoiceCharacterStatId,
                CharacterStatTypeViewModel = CharacterStat.CharacterStatType == null ? new CharacterStatTypeViewModel() :
                    new CharacterStatTypeViewModel()
                    {
                        CharacterStatTypeId = CharacterStat.CharacterStatType.CharacterStatTypeId,
                        isNumeric = CharacterStat.CharacterStatType.isNumeric,
                        StatTypeDesc = CharacterStat.CharacterStatType.StatTypeDesc,
                        StatTypeName = CharacterStat.CharacterStatType.StatTypeName,
                    },
                CharacterStatComboViewModel = CharacterStat.CharacterStatCombos == null ? new CharacterStatComboViewModel() :
                    new CharacterStatComboViewModel()
                    {
                        CharacterStatComboId = CharacterStat.CharacterStatCombos.CharacterStatComboId,
                        Maximum = CharacterStat.CharacterStatCombos.Maximum,
                        Minimum = CharacterStat.CharacterStatCombos.Minimum,
                        DefaultValue = CharacterStat.CharacterStatCombos.DefaultValue,
                        DefaultText = CharacterStat.CharacterStatCombos.DefaultText
                    },
                CharacterStatToggleViewModel = CharacterStat.CharacterStatToggles == null ? new CharacterStatToggleViewModel() :
                    new CharacterStatToggleViewModel()
                    {
                        CharacterStatToggleId = CharacterStat.CharacterStatToggles.CharacterStatToggleId,
                        Display = CharacterStat.CharacterStatToggles.Display,
                        ShowCheckbox = CharacterStat.CharacterStatToggles.ShowCheckbox,
                        IsCustom = CharacterStat.CharacterStatToggles.IsCustom,
                        OnOff = CharacterStat.CharacterStatToggles.OnOff,
                        YesNo = CharacterStat.CharacterStatToggles.YesNo
                    }
                
            };

            if (CharacterStat.CharacterStatCalcs != null)
            {
                characterStatsVM.CharacterStatCalsComndViewModel = CharacterStat.CharacterStatCalcs.Select(x => new CharacterStatCalsComndViewModel()
                {
                    Id = x.CharacterStatCalcId,
                    CalculationCommandValue = x.StatCalculation
                }).ToList();
            }

            if (CharacterStat.CharacterStatChoices != null)
            {
                characterStatsVM.CharacterStatChoicesViewModels = CharacterStat.CharacterStatChoices.Select(x => new CharacterStatChoicesViewModel()
                {
                    CharacterStatChoiceId = x.CharacterStatChoiceId,
                    StatChoiceValue = x.StatChoiceValue
                }).ToList();
            }

            if (CharacterStat.CharacterStatToggles != null)
            {
                List<CustomToggleViewModel> CustomToggleViewModelList = new List<CustomToggleViewModel>();
                if (CharacterStat.CharacterStatToggles.CustomToggles != null)
                {
                    foreach(var ct in CharacterStat.CharacterStatToggles.CustomToggles)
                    {
                        CustomToggleViewModelList.Add(new CustomToggleViewModel
                        {
                            CustomToggleId = ct.CustomToggleId,
                            Image = ct.Image,
                            ToggleText = ct.ToggleText
                        });
                    }
                    characterStatsVM.CharacterStatToggleViewModel.customToggles = CustomToggleViewModelList;
                }
            }
            if (CharacterStat.CharacterStatDefaultValues != null)
            {
                List<CharacterStatDefaultValueViewModel> ModelList = new List<CharacterStatDefaultValueViewModel>();
                if (CharacterStat.CharacterStatDefaultValues.Count>0)
                {
                    foreach (var df in CharacterStat.CharacterStatDefaultValues)
                    {
                        ModelList.Add(new CharacterStatDefaultValueViewModel
                        {
                            CharacterStatDefaultValueId = df.CharacterStatDefaultValueId,
                            CharacterStatId = df.CharacterStatId,
                            DefaultValue = df.DefaultValue,
                            Maximum = df.Maximum,
                            Minimum = df.Minimum,
                            Type = df.Type,                            
                        });
                    }
                    characterStatsVM.CharacterStatDefaultValueViewModel = ModelList;
                }
            }
            if (CharacterStat.CharacterStatConditions != null)
            {
                List<CharacterStatConditionViewModel> ModelList = new List<CharacterStatConditionViewModel>();
                if (CharacterStat.CharacterStatConditions.Count > 0)
                {
                    foreach (var cd in CharacterStat.CharacterStatConditions)
                    {
                        ModelList.Add(new CharacterStatConditionViewModel
                        {
                            CharacterStatConditionId = cd.CharacterStatConditionId,
                            CompareValue = cd.CompareValue,
                            CharacterStatId = cd.CharacterStatId,
                            //IfClauseStatId = cd.IfClauseStatId,
                            //IfClauseStattype = cd.IfClauseStattype,
                            Result = cd.Result,
                            ConditionOperatorID = cd.ConditionOperatorID,
                            SortOrder = cd.SortOrder,                            
                            IfClauseStatText=cd.IfClauseStatText,
                            IsNumeric =cd.IsNumeric
                        });
                    }
                    characterStatsVM.CharacterStatConditionViewModel = ModelList.OrderBy(z=>z.SortOrder).ToList();
                }
            }
            return characterStatsVM;
        }

        public RuleSetViewModel GetRuleSetViewModel(RuleSet ruleSet, string UserID = null)
        {
            var ruleSetViewModel = new RuleSetViewModel
            {
                RuleSetId = ruleSet.RuleSetId,
                RuleSetName = ruleSet.RuleSetName,
                RuleSetDesc = ruleSet.RuleSetDesc,
                isActive = ruleSet.isActive,
                DefaultDice = ruleSet.DefaultDice,
                CurrencyLabel = ruleSet.CurrencyLabel,
                WeightLabel = ruleSet.WeightLabel,
                DistanceLabel = ruleSet.DistanceLabel,
                SortOrder = ruleSet.SortOrder,
                VolumeLabel = ruleSet.VolumeLabel,
                ImageUrl = ruleSet.ImageUrl,
                ThumbnailUrl = ruleSet.ThumbnailUrl,
                IsAbilityEnabled = ruleSet.IsAbilityEnabled,
                IsItemEnabled = ruleSet.IsItemEnabled,
                IsSpellEnabled = ruleSet.IsSpellEnabled,
                IsAllowSharing = ruleSet.IsAllowSharing,
                ShareCode = ruleSet.ShareCode,
                IsCoreRuleset = ruleSet.IsCoreRuleset,
                ParentRuleSetId = ruleSet.ParentRuleSetId,

                ItemMasters = ruleSet.ItemMasters,
                Spells = ruleSet.Spells,
                Abilities = ruleSet.Abilities,
                CreatedOn=ruleSet.CreatedDate.ToString("MM-dd-yy"),
                CreatedBy= ruleSet.CreatedBy,
                // ImageFileName = FileStreamResult(new MemoryStream(ruleSet.RuleSetImage), "image/jpeg")
                //RuleSetImage = ruleSet.RuleSetImage
                RecordCount = _coreRulesetService.GetRulesetRecordCounts(ruleSet.RuleSetId),
                customDices=Utilities.MapCustomDice(_ruleSetService.GetCustomDice(ruleSet.RuleSetId)),
                diceTray=_ruleSetService.GetDiceTray(ruleSet.RuleSetId),
                defaultDices = _ruleSetService.GetDefaultDices(),
                CoreRulesetAdminImageUrl= _ruleSetService.GetUserImageFromRulesetID(ruleSet.RuleSetId),
                Price=ruleSet.Price,
                IsAlreadyPurchased=_ruleSetService.IsRulesetAlreadyPurchased(ruleSet.RuleSetId, UserID)
            };

            return ruleSetViewModel;
        }
        //public RulesetRecordCount GetRulesetRecordCounts(int Id)
        //{
        //    try
        //    {
        //        if (_coreRulesetService.IsCopiedFromCoreRuleset(Id))
        //        {
        //            return _coreRulesetService.GetRulesetRecordCounts(Id);
        //        }
        //        else
        //        {
        //            int spellcount = _spellService.GetCountByRuleSetId(Id);
        //            int abilitycount = _abilityService.GetCountByRuleSetId(Id);
        //            int itemmastercount = _itemMasterService.GetCountByRuleSetId(Id);
        //            int characterstatcount = _characterStatService.GetCountByRuleSetId(Id);
        //            int layoutcount = _rulesetDashboardLayoutService.GetCountByRuleSetId(Id);

        //            return new RulesetRecordCount()
        //            {
        //                SpellCount = spellcount,
        //                AbilityCount = abilitycount,
        //                ItemMasterCount = itemmastercount,
        //                CharacterStatCount = characterstatcount,
        //                LayoutCount = layoutcount
        //            };
        //        }
        //    }
        //    catch
        //    {
        //        return new RulesetRecordCount();
        //    }
        //}
    }
}
