// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

using AspNet.Security.OpenIdConnect.Primitives;
using AutoMapper;
using DAL.Models;
using DAL.Models.SPModels;
using DAL.Services;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using RPGSmithApp.ViewModels;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace RPGSmithApp.Helpers
{
    public static class Utilities
    {
        static ILoggerFactory _loggerFactory;
        static Guid DefaultCoreRulesetID =new Guid("AFC1CD25-4E0D-45C2-987C-5D8DF276FC52");
        public static void ConfigureLogger(ILoggerFactory loggerFactory)
        {
            _loggerFactory = loggerFactory;
        }


        public static ILogger CreateLogger<T>()
        {
            if (_loggerFactory == null)
            {
                throw new InvalidOperationException($"{nameof(ILogger)} is not configured. {nameof(ConfigureLogger)} must be called before use");
                //_loggerFactory = new LoggerFactory().AddConsole().AddDebug();
            }

            return _loggerFactory.CreateLogger<T>();
        }


        public static void QuickLog(string text, string filename)
        {
            string dirPath = Path.GetDirectoryName(filename);

            if (!Directory.Exists(dirPath))
                Directory.CreateDirectory(dirPath);

            using (StreamWriter writer = File.AppendText(filename))
            {
                writer.WriteLine($"{DateTime.Now} - {text}");
            }
        }



        public static string GetUserId(ClaimsPrincipal user)
        {
            return user.FindFirst(OpenIdConnectConstants.Claims.Subject)?.Value?.Trim();
        }



        public static string[] GetRoles(ClaimsPrincipal identity)
        {
            return identity.Claims
                .Where(c => c.Type == OpenIdConnectConstants.Claims.Role)
                .Select(c => c.Value)
                .ToArray();
        }

        public static string ModelStateError(ModelStateDictionary modelState)
        {
            string errorMsg = string.Empty;
            foreach (var state in modelState.Values)
            {
                foreach (var error in state.Errors)
                {
                    if (string.IsNullOrEmpty(error.ErrorMessage))
                    {
                        if (error.Exception != null)
                            if (error.Exception.Message.ToString().ToLower().Contains("system.decimal"))
                                return "Please enter valid numeric value. ";

                        continue;
                    }
                    errorMsg += error.ErrorMessage.TrimEnd('.') +  ". ";
                }
            }
            return errorMsg == "" ? "Something went wrong. Please try again." : errorMsg;
        }
        public static System.Drawing.Image Resize(System.Drawing.Image current, int maxWidth, int maxHeight)
        {
            int width, height;
            #region reckon size           
            if (current.Width > maxWidth || current.Height > maxHeight)
            {
                double widthRatio = (double)current.Width / (double)maxWidth;
                double heightRatio = (double)current.Height / (double)maxHeight;
                double ratio = Math.Max(widthRatio, heightRatio);
                width = (int)(current.Width / ratio);
                height = (int)(current.Height / ratio);

            }
            else
            {
                width = current.Width;
                height = current.Height;
            }
            #endregion

            #region get resized bitmap 
            var canvas = new Bitmap(width, height);

            using (var graphics = Graphics.FromImage(canvas))
            {
                graphics.CompositingQuality = CompositingQuality.HighSpeed;
                graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
                graphics.CompositingMode = CompositingMode.SourceCopy;
                graphics.DrawImage(current, 0, 0, width, height);
            }

            return canvas;
            #endregion
        }

        public static byte[] ToByteArray(System.Drawing.Image current)
        {
            using (var stream = new MemoryStream())
            {
                current.Save(stream, current.RawFormat);
                return stream.ToArray();
            }
        }
        public static IList<T> CleanModel<T>(IList<T> model)
        {
            try {
                JsonSerializerSettings settings = new JsonSerializerSettings
                {
                    ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
                    Formatting = Formatting.Indented
                };

                string json = JsonConvert.SerializeObject(model, settings);
                return JsonConvert.DeserializeObject<IList<T>>(json);
            }
            catch (Exception ex) {
                return model;
            }
           
        }
        public static T CleanModel<T>(T model)
        {
            try {
                JsonSerializerSettings settings = new JsonSerializerSettings
                {
                    ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
                    Formatting = Formatting.Indented
                };

                string json = JsonConvert.SerializeObject(model, settings);
                return JsonConvert.DeserializeObject<T>(json);
            }
            catch (Exception ex) {
                return model;
            }

           
        }
        //public static void CleanModel<IList<T>>(IList<T> model)
        //{
        //    JsonSerializerSettings settings = new JsonSerializerSettings
        //    {
        //        ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
        //        Formatting = Formatting.Indented
        //    };

        //    string json = JsonConvert.SerializeObject(model, settings);
        //    return JsonConvert.DeserializeObject<IList<T>>(json);
        //}
        public static bool AddDefaultCoreRuleset(string UserID, IRuleSetService _ruleSetService) {            
            //    Guid RulesetSharecode = DefaultCoreRulesetID;
            //RuleSet _ruleset = _ruleSetService.GetRuleSetBySharecode(RulesetSharecode).Result;
            //int oldRulesetID = _ruleset.RuleSetId;
            //    var _addRuleset = new RuleSetViewModel()
            //    {
            //        RuleSetName = _ruleset.RuleSetName,
            //        RuleSetDesc = _ruleset.RuleSetDesc,
            //        DefaultDice = _ruleset.DefaultDice,
            //        CurrencyLabel = _ruleset.CurrencyLabel,
            //        WeightLabel = _ruleset.WeightLabel,
            //        DistanceLabel = _ruleset.DistanceLabel,
            //        SortOrder = _ruleset.SortOrder,
            //        VolumeLabel = _ruleset.VolumeLabel,
            //        ImageUrl = _ruleset.ImageUrl,
            //        ThumbnailUrl = _ruleset.ThumbnailUrl,
            //        IsAbilityEnabled = _ruleset.IsAbilityEnabled,
            //        IsItemEnabled = _ruleset.IsItemEnabled,
            //        IsSpellEnabled = _ruleset.IsSpellEnabled,
            //        IsAllowSharing = _ruleset.IsAllowSharing,

            //        IsCoreRuleset = _ruleset.IsCoreRuleset,
            //        ParentRuleSetId = _ruleset.RuleSetId
            //    };
            //    var _rulesetData = Mapper.Map<RuleSet>(_addRuleset);
            //    _rulesetData.isActive = true;
            //    _rulesetData.ShareCode = null;//Guid.NewGuid(); //not used in sp
            //    _rulesetData.OwnerId = UserID;
            //    _rulesetData.CreatedBy = UserID;
            //    _rulesetData.CreatedDate = DateTime.Now;

            //    _addRuleset.IsCoreRuleset = false;//not used in sp

            //RuleSet res = _ruleSetService.AddCoreRuleset(_rulesetData, _ruleset.RuleSetId, UserID).Result;
            //_ruleSetService.CopyCustomDiceToNewRuleSet(oldRulesetID, res.RuleSetId);
            //    if (res != null)
            //    {
            //        return true;
            //    }            
            return false;
        }
        public static List<CustomDiceViewModel> MapCustomDice(List<CustomDice> list)
        {
            List<CustomDiceViewModel> result = new List<CustomDiceViewModel>();
            foreach (var dice in list)
            {
                CustomDiceViewModel Cdice = new CustomDiceViewModel()
                {
                    CustomDiceId = dice.CustomDiceId,
                    Icon = dice.Icon,
                    IsNumeric = dice.IsNumeric,
                    Name = dice.Name,
                    CustomDicetype=dice.CustomDicetype,
                    RuleSetId = dice.RuleSetId
                };
                List<CustomDiceResultViewModel> diceResList = new List<CustomDiceResultViewModel>();
                foreach (var res in dice.CustomDiceResults)
                {
                    CustomDiceResultViewModel CDres = new CustomDiceResultViewModel()
                    {
                        CustomDiceResultId = res.CustomDiceResultId,
                        CustomDiceId = res.CustomDiceId,
                        Name = res.Name,
                        DisplayContent=res.DisplayContent
                    };
                    diceResList.Add(CDres);
                }
                Cdice.Results = diceResList;
                result.Add(Cdice);
            }
            return result;
        }
        public  static RuleSetViewModel GetRuleset(int rulesetId, IRuleSetService _ruleSetService)
        {
            var _ruleset = _ruleSetService.GetRuleSetById(rulesetId).Result;
            return new RuleSetViewModel()
            {
                RuleSetName = _ruleset.RuleSetName,
                RuleSetDesc = _ruleset.RuleSetDesc,
                DefaultDice = _ruleset.DefaultDice,
                CurrencyLabel = _ruleset.CurrencyLabel,
                WeightLabel = _ruleset.WeightLabel,
                DistanceLabel = _ruleset.DistanceLabel,
                SortOrder = _ruleset.SortOrder,
                VolumeLabel = _ruleset.VolumeLabel,
                ImageUrl = _ruleset.ImageUrl,
                ThumbnailUrl = _ruleset.ThumbnailUrl,
                IsAbilityEnabled = _ruleset.IsAbilityEnabled,
                IsItemEnabled = _ruleset.IsItemEnabled,
                IsSpellEnabled = _ruleset.IsSpellEnabled,
                IsAllowSharing = _ruleset.IsAllowSharing,

                IsCoreRuleset = _ruleset.IsCoreRuleset,
                ParentRuleSetId = rulesetId
            };
        }
        public static  List<CharactersCharacterStatViewModel> GetCharCharStatViewModelList(List<CharactersCharacterStat> data, ICharacterStatChoiceService _characterStatChoiceService)
        {
            List<CharactersCharacterStatViewModel> CharactersCharacterStatVievModels = new List<CharactersCharacterStatViewModel>();

            CharactersCharacterStatViewModel CharactersCharacterStatVievModel;
            foreach (CharactersCharacterStat item in data)
            {
                CharactersCharacterStatVievModel = new CharactersCharacterStatViewModel()
                {
                    CalculationResult = item.CalculationResult,
                    CharacterId = item.CharacterId,
                    CharactersCharacterStatId = item.CharactersCharacterStatId,
                    CharacterStatId = item.CharacterStatId,
                    Choice = item.Choice,
                    Command = item.Command,
                    Current = item.Current,
                    IsDeleted = item.IsDeleted,
                    Maximum = item.Maximum,
                    MultiChoice = item.MultiChoice,
                    Number = item.Number,
                    OnOff = item.OnOff,
                    RichText = item.RichText,
                    SubValue = item.SubValue,
                    Text = item.Text,
                    Value = item.Value,
                    YesNo = item.YesNo,
                    ComboText = item.ComboText,
                    DefaultValue = item.DefaultValue,
                    Minimum = item.Minimum,
                    Display = item.Display,
                    IsCustom = item.IsCustom,
                    IsOn = item.IsOn,
                    IsYes = item.IsYes,
                    ShowCheckbox = item.ShowCheckbox,
                    LinkType = item.LinkType,
                    CharacterStat = new CharacterStat()
                    {
                        CharacterStatId = item.CharacterStat.CharacterStatId,
                        CharacterStatType = item.CharacterStat.CharacterStatType,
                        CharacterStatTypeId = item.CharacterStat.CharacterStatTypeId,
                        CreatedBy = item.CharacterStat.CreatedBy,
                        CreatedDate = item.CharacterStat.CreatedDate,
                        OwnerId = item.CharacterStat.OwnerId,
                        StatName = item.CharacterStat.StatName,
                        StatDesc = item.CharacterStat.StatDesc,
                        SortOrder = item.CharacterStat.SortOrder,
                        RuleSetId = item.CharacterStat.RuleSetId,
                        ParentCharacterStatId = item.CharacterStat.ParentCharacterStatId,
                        isMultiSelect = item.CharacterStat.isMultiSelect,
                        IsDeleted = item.CharacterStat.IsDeleted,
                        isActive = item.CharacterStat.isActive,
                        CharacterStatCalcs = item.CharacterStat.CharacterStatCalcs,
                        IsChoiceNumeric = item.CharacterStat.IsChoiceNumeric,
                        IsChoicesFromAnotherStat = item.CharacterStat.IsChoicesFromAnotherStat,
                        SelectedChoiceCharacterStatId = item.CharacterStat.SelectedChoiceCharacterStatId,
                        //CharactersCharacterStats= item.CharacterStat.CharactersCharacterStats,
                        CharacterStatChoices = item.CharacterStat.CharacterStatChoices.Select(z => new CharacterStatChoice
                        {
                            CharacterStatChoiceId = z.CharacterStatChoiceId,
                            CharacterStatId = z.CharacterStatId,
                            IsDeleted = z.IsDeleted,
                            StatChoiceValue = z.StatChoiceValue
                        }).ToList(),
                        //CharacterStatCombos= new CharacterStatCombo() {
                        //    CharacterStatComboId = item.CharacterStat.CharacterStatCombos.CharacterStatComboId ,
                        //    CharacterStatId= item.CharacterStat.CharacterStatCombos.CharacterStatId,
                        //    DefaultValue= item.CharacterStat.CharacterStatCombos.DefaultValue,
                        //    IsDeleted= item.CharacterStat.CharacterStatCombos.IsDeleted,
                        //    Maximum= item.CharacterStat.CharacterStatCombos.Maximum,
                        //    Minimum= item.CharacterStat.CharacterStatCombos.Minimum
                        //} ,
                        CharacterStatConditions = item.CharacterStat.CharacterStatConditions.OrderBy(z => z.SortOrder).ToList(),
                        CharacterStatDefaultValues = item.CharacterStat.CharacterStatDefaultValues,
                    },
                    Character = new Character()
                    {
                        CharacterId = item.Character.CharacterId,
                        CharacterName = item.Character.CharacterName,
                        ImageUrl = item.Character.ImageUrl,
                        InventoryWeight = item.Character.InventoryWeight,
                        ParentCharacterId = item.Character.ParentCharacterId,
                        RuleSetId = item.Character.RuleSetId,
                        UserId = item.Character.UserId
                    }

                };
                //List<CharacterStatDefaultValue> CharacterStatDefaultValuesList = 
                //    _characterStatDefaultValueService.GetCharacterStatDefaultValue((int)CharactersCharacterStatVievModel.CharacterStatId).Result;
                //CharactersCharacterStatVievModel.CharacterStat.CharacterStatDefaultValues = new List<CharacterStatDefaultValue>();
                //if (CharacterStatDefaultValuesList != null)
                //{
                //    if (CharacterStatDefaultValuesList.Count>0)
                //    {

                //        foreach (var defv in CharacterStatDefaultValuesList)
                //        {
                //            var CharStatDefValues = new CharacterStatDefaultValue()
                //            {
                //                CharacterStatDefaultValueId = defv.CharacterStatDefaultValueId,
                //                CharacterStatId = defv.CharacterStatId,
                //                DefaultValue = defv.DefaultValue,
                //                Maximum = defv.Maximum,
                //                Minimum = defv.Minimum,
                //                Type = defv.Type,
                //                CharacterStat=null,
                //            };
                //            CharactersCharacterStatVievModel.CharacterStat.CharacterStatDefaultValues.Add(CharStatDefValues);
                //        }
                //    }
                //}


                if (CharactersCharacterStatVievModel.IsCustom)
                {
                    //--Uncomment if user want to  display custom toggle data over character character screen.----------//

                    //CharactersCharacterStatVievModel.CharacterCustomToggle = new List<CharacterCustomToggle>();
                    //CharacterStatToggle CharacterStatToggle = _charactersCharacterStatServic.GetCharacterStatToggleList((int)CharactersCharacterStatVievModel.CharacterStatId);
                    //if (CharacterStatToggle!=null)
                    //{
                    //    foreach (var toggle in CharacterStatToggle.CustomToggles)
                    //    {
                    //        CharactersCharacterStatVievModel.CharacterCustomToggle.Add(new CharacterCustomToggle()
                    //        {
                    //            CustomToggleId = toggle.CustomToggleId,
                    //            Image = toggle.Image,
                    //            IsDeleted = toggle.IsDeleted,
                    //            ToggleText = toggle.ToggleText,
                    //        });
                    //    }
                    //}

                }
                //CharactersCharacterStatVievModel = Mapper.Map<CharactersCharacterStatViewModel>(item);

                if (item.CharacterStat.CharacterStatType.StatTypeName == "Choice" && item.CharacterStat.isMultiSelect == true && (item.MultiChoice != null || item.MultiChoice != string.Empty))
                {
                    CharactersCharacterStatVievModel.SelectedCharacterChoices = _characterStatChoiceService.GetByIds(item.MultiChoice);
                }

                if (item.CharacterStat.CharacterStatType.StatTypeName == "Choice" && item.CharacterStat.isMultiSelect == false && (item.Choice != null || item.Choice != string.Empty))
                {
                    CharactersCharacterStatVievModel.SelectedCharacterChoices = _characterStatChoiceService.GetByIds(item.Choice);
                }

                CharactersCharacterStatVievModels.Add(CharactersCharacterStatVievModel);
            }

            return CharactersCharacterStatVievModels;
        }

    }
}
