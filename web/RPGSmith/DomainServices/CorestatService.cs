using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using RPGSmith.Web.ViewModels;
using RPGSmith.Data;
using RPGSmith.Data.Models;
using RPGSmith.Web.Utilities;
using RPGSmith.Utilities;
using System.Xml;

namespace RPGSmith.DomainServices
{
    public class CorestatService
    {
        RPGSmithContext context = new RPGSmithContext();
        #region Character Core Stats
        public CharacterViewModel GetCorestatsByCharacter(int CharacterProfileId)
        {
            //Declare Model
            CharacterViewModel model = new CharacterViewModel();
            //Getting CoreStats data Related Character
            var dbresult = (from charcters in context.CharacterProfiles
                            join _corestats in context.CoreStats
                            on charcters.RulesetId equals _corestats.RulesetID
                            join rpgtype in context.RPGSmithTypes on _corestats.TypeId equals rpgtype.TypeID
                            where charcters.CharacterProfileId == CharacterProfileId
                            select new { Id = charcters.CharacterProfileId, CharacterName = charcters.Name, UserId = charcters.UserId, campaignId = charcters.CampaignId, Portrait = charcters.Portrait, RulesetId = charcters.RulesetId, CorestatId = _corestats.CorestatID, Name = _corestats.Name, TypeId = _corestats.TypeId, Description = _corestats.Description, Metadata = _corestats.Metadata, units = rpgtype.Units }).ToList();
            if (dbresult.Count == 0) return model;
            model.Id = dbresult[0].Id;
            model.Name = dbresult[0].CharacterName;
            model.CampaignId = dbresult[0].campaignId;
            model.RulesetId = Convert.ToInt32(dbresult[0].RulesetId);
            model.CorestatValues = new List<CorestatValues>();
            List<CoreStatValue> lstCoreStats = new List<CoreStatValue>();
            var CharacterCoreStatValues = context.CoreStatValues.Where(p => p.CharacterProfileId == CharacterProfileId).ToList();
            bool IsCoreStatValuesAvailable = false;
            //Checking CoreStatValues are Available or Not
            foreach (var _characterCoreStatValue in CharacterCoreStatValues)
            {
                IsCoreStatValuesAvailable = (_characterCoreStatValue.Value != null && _characterCoreStatValue.Value != "")
                                            ? true : false;
            }
            for (var i = 0; i < dbresult.Count; i++)
            {
                var item = dbresult[i];
                CorestatValues values = new CorestatValues();
                var selectedUnit = String.Empty;
                var _tempCustomeTypeValue = new CustomTypes();
                //Checking CoreStatValues are Available or Not
                switch (IsCoreStatValuesAvailable)
                {
                    case false:
                        _tempCustomeTypeValue = (item.TypeId == 16 && item.Metadata != null && item.Metadata != "" &&
                                                 item.Metadata != "System.Xml.XmlDocument")
                                                ? Utility.ConvertTypeMetaDataXMLtoClass(item.TypeId, item.Metadata)
                                                : Utility.GetTypeClassMetaData(item.TypeId);
                        break;
                    case true:
                        lstCoreStats = CharacterCoreStatValues.Where(p => p.CharacterProfileId == item.Id && p.CorestatID == item.CorestatId).ToList();
                        _tempCustomeTypeValue = (item.TypeId == 16 && item.Metadata != null && item.Metadata != "" &&
                                                 item.Metadata != "System.Xml.XmlDocument") ? Utility.ConvertTypeMetaDataXMLtoClass
                                                 (item.TypeId, item.Metadata) : lstCoreStats.Count == 0 ? Utility.GetTypeClassMetaData(item.TypeId)
                                                 : Utility.ConvertTypeValueXMLtoClass(item.TypeId, lstCoreStats[0].Value, item.units);
                        break;
                }
                model.CorestatValues.Add(new CorestatValues()
                {
                    CharacterId = item.Id,
                    Id = lstCoreStats.Count > 0 ? lstCoreStats[0].Id : 0,
                    Name = item.Name,
                    CorestatId = item.CorestatId,
                    TypeId = Convert.ToInt32(item.TypeId),
                    Description = item.Description,
                    Value = _tempCustomeTypeValue,
                });
                if (item.units != null && item.units != "")
                {
                    values.Units = (IsCoreStatValuesAvailable == true && lstCoreStats.Count > 0)
                                    ? Utility.ConvertUnitsXMLtoClass(item.TypeId, item.units, lstCoreStats[0].Value)
                                    : Utility.ConvertUnitsXMLtoClass(item.TypeId, item.units, "");
                }
            }
            return model;
        }
        public CharacterViewModel AddOrUpdateCoreStatValues(CharacterViewModel _CharacterViewModel)
        {
            var Message = string.Empty;
            //Checking CoreStat List is not empty and CharacterProfileId
            if (_CharacterViewModel.CorestatValues.Count > 0 && _CharacterViewModel.Id > 0)
            {
                CoreStatValue coreStatValue = new CoreStatValue();
                XmlDocument _tempitemPropertyValue = new XmlDocument();
                foreach (var _coreStatValue in _CharacterViewModel.CorestatValues)
                {
                    //Getting CoreStatValues Details by CoreStatValueId
                    var _CoreStatValueDetails = context.CoreStatValues.Where(p => p.Id == _coreStatValue.Id).SingleOrDefault();
                    _tempitemPropertyValue = null;

                    switch (_CoreStatValueDetails)
                    {
                        //Adding CoreStatValues
                        case null:
                            coreStatValue.CharacterProfileId = _CharacterViewModel.Id;
                            coreStatValue.CorestatID = _coreStatValue.CorestatId;
                            _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(_coreStatValue.TypeId, _coreStatValue.Value, "");
                            if (_tempitemPropertyValue != null)
                            {
                                coreStatValue.Value = _tempitemPropertyValue.OuterXml;
                            }
                            context.CoreStatValues.Add(coreStatValue);
                            context.SaveChanges();
                            _coreStatValue.Id = coreStatValue.Id;
                             Message = "CoreStatValues Inserted Successfully";
                            break;
                        //Updating CoreStatValues
                        default:
                            _CoreStatValueDetails.Id = _coreStatValue.Id;
                            _CoreStatValueDetails.CharacterProfileId = _coreStatValue.CharacterId;
                            _CoreStatValueDetails.CorestatID = _coreStatValue.CorestatId;
                            _tempitemPropertyValue = Utility.ConvertTypeValueClasstoXML(_coreStatValue.TypeId, _coreStatValue.Value, "");
                            if (_tempitemPropertyValue != null)
                            {
                                _CoreStatValueDetails.Value = _tempitemPropertyValue.OuterXml;
                            }
                            else {
                                _CoreStatValueDetails.Value = null;
                            }
                            context.SaveChanges();
                            Message = "CoreStatValues Updated Successfully";
                            break;
                    }
                }

            }
            return _CharacterViewModel;
        }
        #endregion
    }
}
