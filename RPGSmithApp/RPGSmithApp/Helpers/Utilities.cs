// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

using AspNet.Security.OpenIdConnect.Primitives;
using AutoMapper;
using DAL.Models;
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
                Guid RulesetSharecode = DefaultCoreRulesetID;
            RuleSet _ruleset = _ruleSetService.GetRuleSetBySharecode(RulesetSharecode).Result;
            int oldRulesetID = _ruleset.RuleSetId;
                var _addRuleset = new RuleSetViewModel()
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
                    ParentRuleSetId = _ruleset.RuleSetId
                };
                var _rulesetData = Mapper.Map<RuleSet>(_addRuleset);
                _rulesetData.isActive = true;
                _rulesetData.ShareCode = null;//Guid.NewGuid(); //not used in sp
                _rulesetData.OwnerId = UserID;
                _rulesetData.CreatedBy = UserID;
                _rulesetData.CreatedDate = DateTime.Now;

                _addRuleset.IsCoreRuleset = false;//not used in sp

            RuleSet res = _ruleSetService.AddCoreRuleset(_rulesetData, _ruleset.RuleSetId, UserID).Result;
            _ruleSetService.CopyCustomDiceToNewRuleSet(oldRulesetID, res.RuleSetId);
                if (res != null)
                {
                    return true;
                }            
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
                    RuleSetId = dice.RuleSetId
                };
                List<CustomDiceResultViewModel> diceResList = new List<CustomDiceResultViewModel>();
                foreach (var res in dice.CustomDiceResults)
                {
                    CustomDiceResultViewModel CDres = new CustomDiceResultViewModel()
                    {
                        CustomDiceResultId = res.CustomDiceResultId,
                        CustomDiceId = res.CustomDiceId,
                        Name = res.Name
                    };
                    diceResList.Add(CDres);
                }
                Cdice.Results = diceResList;
                result.Add(Cdice);
            }
            return result;
        }
    }
}
