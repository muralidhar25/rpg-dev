using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RPGSmith.DomainServices;
using RPGSmith.Utilities.RPGSmithTypes;
using RPGSmith.Utilities.RPGSmithTileTypes;
using System.Xml;
using RPGSmith.Data;
using RPGSmith.Utilities;
using RPGSmith.Web.ViewModels;
using RPGSmith.ViewModels;

namespace RPGSmith.Web.Utilities
{
    public static class Utility
    {
        static RPGSmithContext _utilityContext;
        static Utility()
        {
            RPGSmithContext dbContext = new RPGSmithContext();
            _utilityContext = dbContext;
        }

        /// <summary>
        /// This method is used to convert the units stored in XML string to Class.
        /// </summary>
        /// <param name="typeID"></param>
        /// <param name="_xml"></param>
        /// <returns>List of units in string</returns>
        public static Units ConvertUnitsXMLtoClass(int? typeID, string _xml, string _selectedUnitValueXml)
        {

            XmlDocument doc = new XmlDocument();
            Units _units = new Units();
            if (_xml == null || _xml == "")
            {
                return _units;
            }
            doc.LoadXml(_xml);
            XmlNode _XmlNode = doc.DocumentElement;
            string TypeIdWithIsMetaData = typeID + "_" + _XmlNode.Attributes["isMetaData"].Value;
            switch (TypeIdWithIsMetaData)
            {
                case "7_1":
                    XmlNodeList _unitWeightOptionsList = _XmlNode.ChildNodes;
                    _units.availableUnits = new List<string>();

                    foreach (XmlNode unitOption in _unitWeightOptionsList)
                    {
                        _units.availableUnits.Add(unitOption.InnerText);
                    }
                    if (_selectedUnitValueXml != "")
                    {
                        XmlDocument docUnitValue = new XmlDocument();
                        docUnitValue.LoadXml(_selectedUnitValueXml);
                        XmlElement root = docUnitValue.DocumentElement;
                        string s = root.LastChild.InnerText;
                        _units.selectedUnit = s;
                    }
                    break;
                case "7_0":
                    XmlNode _unitSelectedOptions = _XmlNode.FirstChild;
                    _units.selectedUnit = _unitSelectedOptions.Value;
                    break;
                case "8_1":
                    XmlNodeList _unitImageOptionslst = _XmlNode.ChildNodes;
                    _units.availableUnits = new List<string>();

                    foreach (XmlNode unitOption in _unitImageOptionslst)
                    {
                        _units.availableUnits.Add(unitOption.InnerText);
                    }
                    break;
                case "8_0":
                    XmlNode _unitSelectedOption = _XmlNode.FirstChild;
                    _units.selectedUnit = _unitSelectedOption.InnerText;
                    break;
                case "12_1":
                    XmlNodeList _unitHeightOptionsList = _XmlNode.ChildNodes;
                    _units.availableUnits = new List<string>();

                    foreach (XmlNode unitOption in _unitHeightOptionsList)
                    {
                        _units.availableUnits.Add(unitOption.InnerText);
                    }
                    if (_selectedUnitValueXml != "")
                    {
                        XmlDocument docUnitValue = new XmlDocument();
                        docUnitValue.LoadXml(_selectedUnitValueXml);
                        XmlElement root = docUnitValue.DocumentElement;
                        string s = root.LastChild.InnerText;
                        _units.selectedUnit = s;
                    }
                    break;
                case "12_0":
                    XmlNode _unitHeightSelectedOptions = _XmlNode.FirstChild;
                    _units.selectedUnit = _unitHeightSelectedOptions.InnerText;
                    break;
                case "13_1":
                    XmlNodeList _unitVolumeOptionsList = _XmlNode.ChildNodes;
                    _units.availableUnits = new List<string>();

                    foreach (XmlNode unitOption in _unitVolumeOptionsList)
                    {
                        _units.availableUnits.Add(unitOption.InnerText);
                    }
                    break;
                case "13_0":
                    XmlNode _unitVolumeSelectedOptions = _XmlNode.FirstChild;
                    _units.selectedUnit = _unitVolumeSelectedOptions.InnerText;
                    break;
                case "15_1":
                    XmlNodeList _unitDefaultDiceOptionsList = _XmlNode.ChildNodes;
                    _units.availableUnits = new List<string>();

                    foreach (XmlNode unitOption in _unitDefaultDiceOptionsList)
                    {
                        _units.availableUnits.Add(unitOption.InnerText);
                    }
                    break;
                case "15_0":
                    XmlNode _unitDefaultDiceSelectedOptions = _XmlNode.FirstChild;
                    _units.selectedUnit = _unitDefaultDiceSelectedOptions.InnerText;
                    break;

            }
            return _units;
        }


        /// <summary>
        /// This method is used to convert the units from Object to XML string.
        /// </summary>
        /// <param name="typeID"></param>
        /// <param name="_xml"></param>
        /// <returns>List of units in string</returns>

        public static XmlDocument ConvertUnitsClasstoXML(int? typeID, Units units)
        {

            XmlDocument _doc = new XmlDocument();

            XmlElement _root = _doc.CreateElement("root");

            _root.SetAttribute("typeID", typeID.ToString());
            _root.SetAttribute("isMetaData", "0");

            XmlElement _xmlvalue;
            _xmlvalue = _doc.CreateElement("selectedunit");
            _xmlvalue.InnerText = units.selectedUnit;
            _root.AppendChild(_xmlvalue);

            return _doc;

        }

        /// <summary>
        /// This method is used to get the type to Class for Metadata Only.
        /// </summary>
        /// <param name="typeID"></param>
        /// <returns></returns>
        public static CustomTypes GetTypeClassMetaData(int? typeID)
        {
            CustomTypes _customtypes = new CustomTypes();
            if (typeID == null) return _customtypes;
            switch (typeID)
            {
                case 1:
                    Text _tempTextResult = new Text();
                    _customtypes.Text = _tempTextResult;
                    break;
                case 2:
                    Choice _tempChoiceResult = new Choice();
                    _tempChoiceResult.selectedchoice = "";
                    _customtypes.Choices = _tempChoiceResult;
                    break;
                case 3:
                    OnOrOff _tempOnOrOffResult = new OnOrOff();
                    _customtypes.OnOrOff = _tempOnOrOffResult;
                    break;
                case 4:
                    YesOrNo _tempYesOrNoResult = new YesOrNo();
                    _customtypes.YesOrNo = _tempYesOrNoResult;
                    break;
                case 5:
                    ValueAndSubValue _tempValueAndSubValueResult = new ValueAndSubValue();
                    _customtypes.ValueAndSubValue = _tempValueAndSubValueResult;
                    break;
                case 6:
                    CurrentAndMaxValue _tempCurrentAndMaxValueResult = new CurrentAndMaxValue();
                    _customtypes.CurrentAndMaxValue = _tempCurrentAndMaxValueResult;
                    break;
                case 7:
                    Weight _tempWeightResult = new Weight();
                    var selectedUnit = String.Empty;
                    Units _units = ConvertUnitsXMLtoClass(typeID, _utilityContext.RPGSmithTypes.Where(x => x.TypeID == typeID).Select(x => x.Units).FirstOrDefault(), selectedUnit);
                    _tempWeightResult.units = _units;
                    _customtypes.Weight = _tempWeightResult;
                    break;
                case 8:
                    Image _tempImageResult = new Image();
                    _customtypes.Image = _tempImageResult;
                    break;
                case 12:
                    Height _tempHeightResult = new Height();
                    var selectedHeighUnit = String.Empty;
                    Units _Heighunits = ConvertUnitsXMLtoClass(typeID, _utilityContext.RPGSmithTypes.Where(x => x.TypeID == typeID).Select(x => x.Units).FirstOrDefault(), selectedHeighUnit);
                    _tempHeightResult.units = _Heighunits;
                    _customtypes.Height = _tempHeightResult;
                    break;
                case 13:
                    Volume _tempVolumeResult = new Volume();
                    var selectedVolumeUnit = String.Empty;
                    Units _Volumeunits = ConvertUnitsXMLtoClass(typeID, _utilityContext.RPGSmithTypes.Where(x => x.TypeID == typeID).Select(x => x.Units).FirstOrDefault(), selectedVolumeUnit);
                    _tempVolumeResult.units = _Volumeunits;
                    _customtypes.Volume = _tempVolumeResult;
                    break;
                case 14:
                    Number _tempNumberResult = new Number();
                    _customtypes.Number = _tempNumberResult;
                    break;
                case 15:
                    DefaultDice _tempDefaultDiceResult = new DefaultDice();
                    _tempDefaultDiceResult.value = string.Empty;
                    _customtypes.DefaultDice = _tempDefaultDiceResult;
                    break;
                case 16:
                    Calculation _tempCalculationResult = new Calculation();
                    _tempCalculationResult.formulae = string.Empty;
                    _customtypes.Calculation = _tempCalculationResult;

                    Choice _tempResultChoice = new Choice();
                    _tempResultChoice.selectedchoice = "";
                    _customtypes.Choices = _tempResultChoice;
                    break;
            }
            return _customtypes;
        }

        public static RPGSmith.Utilities.TileTypes GetTileTypeClassMetaData(int? tileTypeID)
        {
            RPGSmith.Utilities.TileTypes _tileTypes = new RPGSmith.Utilities.TileTypes();
            switch (tileTypeID)
            {
                case 1:
                    Note _tempresultNote = new Note();
                    _tileTypes.Note = _tempresultNote;
                    break;
                case 2:
                    Counter _tempresultCounter = new Counter();
                    _tileTypes.Counter = _tempresultCounter;
                    break;
                case 3:
                    Attributes _tempresultAttributes = new Attributes();
                    _tempresultAttributes.CoreStatValue = new CustomTypes();
                    _tileTypes.Attribute = _tempresultAttributes;
                    break;
                case 4:
                    Link _tempresultLink = new Link();
                    _tileTypes.Link = _tempresultLink;
                    break;
                case 5:
                    Execute _tempresultExecute = new Execute();
                    _tileTypes.Execute = _tempresultExecute;
                    break;
                case 6:
                    Command _tempresultCommand = new Command();
                    _tileTypes.Command = _tempresultCommand;
                    break;
                case 7:
                    ImageTile _tempresultImage = new ImageTile();
                    _tempresultImage.Imagepath = "";
                    _tempresultImage.Name = "";
                    _tileTypes.Imagetile = _tempresultImage;
                    break;
            }
            return _tileTypes;
        }

        public static XmlDocument ConvertRuleSetPropertyValueClasstoXML(int? typeID, Object _value, Units _units)
        {
            XmlDocument _doc = new XmlDocument();

            XmlElement _root = _doc.CreateElement("root");
            _root.SetAttribute("entity", "RuleSetProperty");
            _root.SetAttribute("isMetaData", "0");

            bool _resultPresent = false;

            if (_value != null)
            {
                _resultPresent = true;
                XmlElement _xmlselectedvalue = null;
                switch(typeID)
                {

                }
                if (typeID == 1)
                {
                    _xmlselectedvalue = _doc.CreateElement("value");
                    _xmlselectedvalue.InnerText = ((CustomTypes)_value).Text.value;
                }
                else if (typeID == 2)
                {
                    _xmlselectedvalue = _doc.CreateElement("value");
                    _xmlselectedvalue.InnerText = ((CustomTypes)_value).Choices.selectedchoice;
                }
                else if (typeID == 3)
                {
                    _xmlselectedvalue = _doc.CreateElement("value");
                    _xmlselectedvalue.InnerText = ((CustomTypes)_value).OnOrOff.value.ToString();
                }
                else if (typeID == 4)
                {
                    _xmlselectedvalue = _doc.CreateElement("value");
                    _xmlselectedvalue.InnerText = ((CustomTypes)_value).YesOrNo.value.ToString();
                }
                else if (typeID == 5)
                {
                    _xmlselectedvalue = _doc.CreateElement("value");
                    _xmlselectedvalue.InnerText = Convert.ToString(((CustomTypes)_value).ValueAndSubValue.value);
                    _xmlselectedvalue = _doc.CreateElement("subvalue");
                    _xmlselectedvalue.InnerText = Convert.ToString(((CustomTypes)_value).ValueAndSubValue.subvalue);
                }
                else if (typeID == 6)
                {
                    _xmlselectedvalue = _doc.CreateElement("currentvalue");
                    _xmlselectedvalue.InnerText = ((CustomTypes)_value).CurrentAndMaxValue.CurrentValue.ToString();
                    _xmlselectedvalue = _doc.CreateElement("currentvalue");
                    _xmlselectedvalue.InnerText = ((CustomTypes)_value).CurrentAndMaxValue.MaxValue.ToString();
                }
                else if (typeID == 7)
                {
                    _xmlselectedvalue = _doc.CreateElement("value");
                    _xmlselectedvalue.InnerText = ((CustomTypes)_value).Weight.value.ToString();
                }
                else if (typeID == 8)
                {
                    _xmlselectedvalue = _doc.CreateElement("value");
                    _xmlselectedvalue.InnerText = ((CustomTypes)_value).Image.image;
                }
                else if (typeID == 15)
                {
                    _xmlselectedvalue = _doc.CreateElement("value");
                    _xmlselectedvalue.InnerText = ((CustomTypes)_value).DefaultDice.value;
                }

                _xmlselectedvalue.SetAttribute("type", typeID.ToString());

                _root.AppendChild(_xmlselectedvalue);
            }

            if (_units != null)
            {
                _resultPresent = true;
                XmlElement _xmlselectedunit = _doc.CreateElement("selectedunit");
                _xmlselectedunit.SetAttribute("type", typeID.ToString());
                _xmlselectedunit.InnerText = _units.selectedUnit;

                _root.AppendChild(_xmlselectedunit);
            }

            if (!_resultPresent)
            {
                _doc = null;
            }
            else
            {
                _doc.AppendChild(_root);
            }

            return _doc;
        }
        // Used for Ruleset Serverside Validation srinivas
        public static XmlDocument ConvertRuleSetPropertyValueClasstoXMLValidate(int? typeID, Object _value, Units _units)
        {
            XmlDocument _doc = new XmlDocument();

            XmlElement _root = _doc.CreateElement("root");
            _root.SetAttribute("entity", "RuleSetProperty");
            _root.SetAttribute("isMetaData", "0");

            bool _resultPresent = false;

            if (_value != null)
            {
                _resultPresent = true;
                XmlElement _xmlselectedvalue = null;
                switch (typeID)
                {

                }
                if (typeID == 1)
                {
                    _xmlselectedvalue = _doc.CreateElement("value");
                    _xmlselectedvalue.InnerText = ((CustomTypes)_value).Text.value;
                }
                else if (typeID == 2)
                {
                    _xmlselectedvalue = _doc.CreateElement("value");
                    _xmlselectedvalue.InnerText = ((CustomTypes)_value).Choices.selectedchoice;
                }
                else if (typeID == 3)
                {
                    _xmlselectedvalue = _doc.CreateElement("value");
                    _xmlselectedvalue.InnerText = ((CustomTypes)_value).OnOrOff.value.ToString();
                }
                else if (typeID == 4)
                {
                    _xmlselectedvalue = _doc.CreateElement("value");
                    _xmlselectedvalue.InnerText = ((CustomTypes)_value).YesOrNo.value.ToString();
                }
                else if (typeID == 5)
                {
                    _xmlselectedvalue = _doc.CreateElement("value");
                    _xmlselectedvalue.InnerText = Convert.ToString(((CustomTypes)_value).ValueAndSubValue.value);
                    _xmlselectedvalue = _doc.CreateElement("subvalue");
                    _xmlselectedvalue.InnerText = Convert.ToString(((CustomTypes)_value).ValueAndSubValue.subvalue);
                }
                else if (typeID == 6)
                {
                    _xmlselectedvalue = _doc.CreateElement("currentvalue");
                    _xmlselectedvalue.InnerText = ((CustomTypes)_value).CurrentAndMaxValue.CurrentValue.ToString();
                    _xmlselectedvalue = _doc.CreateElement("currentvalue");
                    _xmlselectedvalue.InnerText = ((CustomTypes)_value).CurrentAndMaxValue.MaxValue.ToString();
                }
                else if (typeID == 7)
                {
                    _xmlselectedvalue = _doc.CreateElement("value");
                    if ((_units.selectedUnit != null && _units.selectedUnit != ""))
                    {
                        ((CustomTypes)_value).Weight.units.selectedUnit = _units.selectedUnit;
                    }
                    _xmlselectedvalue.InnerText = (_units.selectedUnit != null && _units.selectedUnit != "") ? ((CustomTypes)_value).Weight.units.selectedUnit.ToString() : ""; ((CustomTypes)_value).Weight.value.ToString();


                }
                else if (typeID == 8)
                {
                    _xmlselectedvalue = _doc.CreateElement("value");
                    _xmlselectedvalue.InnerText = ((CustomTypes)_value).Image.image;
                }
                else if (typeID == 15)
                {
                    _xmlselectedvalue = _doc.CreateElement("value");
                    _xmlselectedvalue.InnerText = ((CustomTypes)_value).DefaultDice.value;
                }

                _xmlselectedvalue.SetAttribute("type", typeID.ToString());

                _root.AppendChild(_xmlselectedvalue);
            }

            if (_units != null)
            {
                _resultPresent = true;
                XmlElement _xmlselectedunit = _doc.CreateElement("selectedunit");
                _xmlselectedunit.SetAttribute("type", typeID.ToString());
                _xmlselectedunit.InnerText = _units.selectedUnit;

                _root.AppendChild(_xmlselectedunit);
            }

            if (!_resultPresent)
            {
                _doc = null;
            }
            else
            {
                _doc.AppendChild(_root);
            }

            return _doc;
        }

        public static RuleSetViewModel ConvertXMLtoRuleSetPropertyValueClass(int? typeID, List<RPGSmith.Data.Models.Item> ItemsValuesList, List<RPGSmith.Data.Models.Spell> SpellsValuesList, List<RPGSmith.Data.Models.Ability> AbilityValuesList)
        {
            RuleSetViewModel model = new RuleSetViewModel();
            model.Items = new List<Items>();
            model.Spells = new List<Spells>();
            model.Abilities = new List<Abilities>();
            Items _items = new Items();
            _items.ItemProperties = new List<ItemProperties>();
            Spells _spells = new Spells();
            _spells.SpellProperties = new List<SpellProperties>();
            Abilities _abilities = new Abilities();
            _abilities.AbilityProperties = new List<AbilityProperties>();
            switch (typeID)
            {
                case 1:
                    foreach (var _itemValues in ItemsValuesList)
                    {
                        if (_itemValues.value != null)
                        {
                            XmlDocument docUnitValue = new XmlDocument();
                            docUnitValue.LoadXml(_itemValues.value);
                            XmlElement root = docUnitValue.DocumentElement;
                            string _itemsValue = root.LastChild.InnerText;
                            _items.ItemProperties.Add(new ItemProperties()
                            {
                                TypeId = typeID,
                                Name = _itemsValue,
                                // Description = 
                            });
                        }

                    }
                    model.Items.Add(_items);
                    break;
                case 2:
                    foreach (var _spellValues in SpellsValuesList)
                    {
                        if (_spellValues.value != null)
                        {
                            XmlDocument docUnitValue = new XmlDocument();
                            docUnitValue.LoadXml(_spellValues.value);
                            XmlElement root = docUnitValue.DocumentElement;
                            string _spellsValue = root.LastChild.InnerText;
                            _spells.SpellProperties.Add(new SpellProperties()
                            {
                                TypeId = typeID,
                                Name = _spellsValue
                            });
                        }
                    }
                    model.Spells.Add(_spells);
                    break;
                case 3:
                    foreach (var _abilityValues in AbilityValuesList)
                    {
                        if (_abilityValues.value != null)
                        {
                            XmlDocument docUnitValue = new XmlDocument();
                            docUnitValue.LoadXml(_abilityValues.value);
                            XmlElement root = docUnitValue.DocumentElement;
                            string _abilityValue = root.LastChild.InnerText;
                            _abilities.AbilityProperties.Add(new AbilityProperties()
                            {
                                TypeId = typeID,
                                Name = _abilityValue
                            });
                        }
                    }
                    model.Abilities.Add(_abilities);
                    break;
            }
            return model;
        }

        public static CustomTypes ConvertTypeMetaDataXMLtoClass(int? typeID, string _typeXML)
        {
            CustomTypes _result = new CustomTypes();
            XmlDocument _doc = new XmlDocument();
         
            if (_typeXML != null && _typeXML != "" && _typeXML != "System.Xml.XmlDocument")
            {
                _doc.LoadXml(_typeXML);

            }
            XmlNode _XmlNode = _doc.DocumentElement;
            switch (typeID)
            {
                case 1:
                    Text _tempresultText = new Text();
                    if (_typeXML != null && _typeXML != "")
                    {

                    }
                    _result.Text = _tempresultText;
                    break;
                case 2:
                    Choice _tempresult = new Choice();
                    List<Choices> choices = new List<Choices>();
                    if (_typeXML != null && _typeXML != "")
                    {
                        foreach (XmlElement val in _XmlNode.ChildNodes)
                        {
                            choices.Add(new Choices()
                            {
                                ChoiceName = val.InnerText
                            });
                        }
                        _tempresult.choices = choices;
                        _tempresult.selectedchoice = "";
                        _result.Choices = _tempresult;
                    }
                    break;
                case 3:
                    OnOrOff _tempresultOnOrOff = new OnOrOff();
                    if (_typeXML != null && _typeXML != "")
                    {

                    }
                    _result.OnOrOff = _tempresultOnOrOff;
                    break;
                case 4:
                    YesOrNo _tempresultYesOrNo = new YesOrNo();
                    if (_typeXML != null && _typeXML != "")
                    {

                    }
                    _result.YesOrNo = _tempresultYesOrNo;
                    break;
                case 5:
                    ValueAndSubValue _tempresultValueAndSubValue = new ValueAndSubValue();
                    if (_typeXML != null && _typeXML != "")
                    {

                    }
                    _result.ValueAndSubValue = _tempresultValueAndSubValue;
                    break;
                case 6:
                    CurrentAndMaxValue _tempresultCurrentAndMaxValue = new CurrentAndMaxValue();
                    _result.CurrentAndMaxValue = _tempresultCurrentAndMaxValue;
                    break;
                case 7:
                    Weight _tempresultWeight = new Weight();
                    var selectedWeightUnit = String.Empty;
                    if (_typeXML != null && _typeXML != "")
                    {
                        Units _unitsWeight = ConvertUnitsXMLtoClass(typeID, _utilityContext.RPGSmithTypes.Where(x => x.TypeID == typeID).Select(x => x.Units).FirstOrDefault(), _typeXML);
                        _tempresultWeight.units = _unitsWeight;
                        _result.Weight = _tempresultWeight;
                    }
                    break;
                case 8:
                    Image _tempresultImage = new Image();
                    if (_typeXML != null && _typeXML != "")
                    {

                    }
                    _result.Image = _tempresultImage;
                    break;
                case 12:
                    Height _tempresultHeight = new Height();
                    if (_typeXML != null && _typeXML != "")
                    {
                        Units _units = ConvertUnitsXMLtoClass(typeID, _utilityContext.RPGSmithTypes.Where(x => x.TypeID == typeID).Select(x => x.Units).FirstOrDefault(), _typeXML);
                        _tempresultHeight.units = _units;
                        _result.Height = _tempresultHeight;
                    }
                    break;
                case 13:
                    Volume _tempresultVolume = new Volume();
                    var selectedVolumeUnit = String.Empty;
                    if (_typeXML != null && _typeXML != "")
                    {

                    }
                    Units _unitsVolume = ConvertUnitsXMLtoClass(typeID, _utilityContext.RPGSmithTypes.Where(x => x.TypeID == typeID).Select(x => x.Units).FirstOrDefault(), selectedVolumeUnit);
                    _tempresultVolume.units = _unitsVolume;
                    _result.Volume = _tempresultVolume;
                    break;
                case 14:
                    Number _tempresultNumber = new Number();
                    if (_typeXML != null && _typeXML != "")
                    {

                    }
                    _result.Number = _tempresultNumber;
                    break;
                case 15:
                    DefaultDice _tempresultDefaultDice = new DefaultDice();
                    _tempresultDefaultDice.value = string.Empty;
                    if (_typeXML != null && _typeXML != "")
                    {

                    }
                    _result.DefaultDice = _tempresultDefaultDice;
                    break;
                case 16:
                    Calculation _tempFormula = new Calculation();
                    _tempFormula.formulae = string.Empty;
                    if (_typeXML != null && _typeXML != "")
                    {
                        _tempFormula.formulae = _doc.InnerText;
                    }
                    _result.Calculation = _tempFormula;
                    break;
            }
            if (typeID != 2)
            {
                Choice _tempChoice = new Choice();
                _tempChoice.choices = new List<Choices>();
                _result.Choices = _tempChoice;
            }
            //if (typeID == 2)
            //{


            //}
            //else if (typeID == 6)
            //{

            //}
            return _result;
        }

        public static XmlDocument ConvertTypeMetaDataClasstoXML(int typeID, Object _typeValue)
        {
            XmlDocument _doc = new XmlDocument();

            XmlElement _root = _doc.CreateElement("root");

            _root.SetAttribute("typeID", typeID.ToString());

            if (typeID == 2)
            {
                Choice choice = ((RPGSmith.Utilities.CustomTypes)_typeValue).Choices;
                //Choice choice = (Choice)_typeValue;

                XmlElement _xmlvalue;

                foreach (Choices val in choice.choices)
                {
                    _xmlvalue = _doc.CreateElement("option");
                    _xmlvalue.InnerText = val.ChoiceName;
                    _root.AppendChild(_xmlvalue);
                    _doc.AppendChild(_root);
                }

            }
            else if (typeID == 16)
            {
                Calculation calculation = ((RPGSmith.Utilities.CustomTypes)_typeValue).Calculation;

                if (calculation != null)
                {
                    XmlElement _xmlvalue = _doc.CreateElement("value");
                    _xmlvalue.InnerText = calculation.formulae;
                    _root.AppendChild(_xmlvalue);
                    _doc.AppendChild(_root);
                }
            }

            return _doc;
        }

        public static XmlDocument ConvertTypeValueClasstoXML(int? typeID, CustomTypes _typeValue, string VirtualImagePath)
        {

            XmlDocument _doc = new XmlDocument();

            XmlElement _root = _doc.CreateElement("root");
            _root.SetAttribute("entity", "ItemProperty");
            _root.SetAttribute("isMetaData", "0");

            bool _resultPresent = false;

            _root.SetAttribute("typeID", typeID.ToString());


            if (_typeValue != null)
            {
                _resultPresent = true;

                if (typeID == 1)
                {
                    Text text = _typeValue.Text;

                    if (text.value == null)
                    {
                        _resultPresent = false;
                    }
                    else
                    {
                        XmlElement _xmlvalue = _doc.CreateElement("value");
                        _xmlvalue.InnerText = text.value == null ? "" : text.value;
                        _root.AppendChild(_xmlvalue);
                    }
                }
                else if (typeID == 2)
                {
                    Choice choice = _typeValue.Choices;

                    if (choice.SelectedChoiceName == null)
                    {
                        _resultPresent = false;
                    }
                    else
                    {
                        XmlElement _xmlvalue = _doc.CreateElement("value");
                        _xmlvalue.InnerText = choice.SelectedChoiceName == null ? "" : choice.SelectedChoiceName;
                        _root.AppendChild(_xmlvalue);
                    }
                }
                else if (typeID == 3)
                {
                    OnOrOff onof = _typeValue.OnOrOff;

                    XmlElement _xmlvalue = _doc.CreateElement("value");
                    _xmlvalue.InnerText = onof.value == null ? "" : onof.value.ToString();
                    _root.AppendChild(_xmlvalue);
                }
                else if (typeID == 4)
                {
                    YesOrNo yesno = _typeValue.YesOrNo;

                    XmlElement _xmlvalue = _doc.CreateElement("value");
                    _xmlvalue.InnerText = yesno.value == null ? "" : yesno.value.ToString();
                    _root.AppendChild(_xmlvalue);
                }
                else if (typeID == 5)
                {
                    ValueAndSubValue valsubval = _typeValue.ValueAndSubValue;

                    if (valsubval.value == 0)
                    {
                        _resultPresent = false;
                    }
                    else
                    {
                        XmlElement _xmlvalue = _doc.CreateElement("value");
                        _xmlvalue.InnerText = Convert.ToString(valsubval.value);
                        _root.AppendChild(_xmlvalue);
                        _xmlvalue = _doc.CreateElement("subvalue");
                        _xmlvalue.InnerText = Convert.ToString(valsubval.subvalue);
                        _root.AppendChild(_xmlvalue);
                    }
                }
                else if (typeID == 6)
                {
                    CurrentAndMaxValue _currentAndMaxValue = _typeValue.CurrentAndMaxValue;

                    if (_currentAndMaxValue.CurrentValue == 0)
                    {
                        _resultPresent = false;
                    }
                    else
                    {
                        XmlElement _xmlvalue = _doc.CreateElement("currentvalue");
                        _xmlvalue.InnerText = _currentAndMaxValue.CurrentValue == 0 ? "" : _currentAndMaxValue.CurrentValue.ToString();
                        _root.AppendChild(_xmlvalue);
                        _xmlvalue = _doc.CreateElement("maxvalue");
                        _xmlvalue.InnerText = _currentAndMaxValue.MaxValue.ToString();
                        _root.AppendChild(_xmlvalue);
                    }
                }
                else if (typeID == 7)
                {

                    Weight _weight = _typeValue.Weight;
                    if (_weight.units == null)
                    {
                        _resultPresent = false;
                    }
                    else
                    {
                        XmlElement _xmlvalue = _doc.CreateElement("value");
                        _xmlvalue.InnerText = _weight.value == 0 ? "" : _weight.value.ToString();
                        _root.AppendChild(_xmlvalue);
                        _xmlvalue = _doc.CreateElement("selectedunit");
                        _xmlvalue.InnerText = _weight.units.selectedUnit == null ? "" : _weight.units.selectedUnit.ToString();
                        _root.AppendChild(_xmlvalue);
                    }
                }
                else if (typeID == 8)
                {
                    Image _image = _typeValue.Image;

                    if (_image.image == null)
                    {
                        _resultPresent = false;
                    }
                    else
                    {
                        XmlElement _xmlvalue = _doc.CreateElement("value");
                        _xmlvalue.InnerText = _image.image;
                        //_xmlvalue.InnerText = VirtualImagePath;
                        _root.AppendChild(_xmlvalue);
                    }
                }
                else if (typeID == 12)
                {
                    Height _height = _typeValue.Height;

                    if (_height.units.selectedUnit == null && _height.value == 0)
                    {
                        _resultPresent = false;
                    }
                    else
                    {
                        XmlElement _xmlvalue = _doc.CreateElement("value");
                        _xmlvalue.InnerText = _height.value == 0 ? "" : _height.value.ToString();
                        _root.AppendChild(_xmlvalue);
                        _xmlvalue = _doc.CreateElement("selectedunit");
                        _xmlvalue.InnerText = _height.units.selectedUnit == null ? "" : _height.units.selectedUnit.ToString();
                        _root.AppendChild(_xmlvalue);
                    }
                }
                else if (typeID == 13)
                {
                    Volume _volume = _typeValue.Volume;

                    if (_volume.units.selectedUnit == null)
                    {
                        _resultPresent = false;
                    }
                    else
                    {
                        XmlElement _xmlvalue = _doc.CreateElement("heightvalue");
                        _xmlvalue.InnerText = _volume.heightvalue == 0 ? "" : _volume.heightvalue.ToString();
                        _root.AppendChild(_xmlvalue);
                        _xmlvalue = _doc.CreateElement("lenghtvalue");
                        _xmlvalue.InnerText = _volume.lenghtvalue == 0 ? "" : _volume.lenghtvalue.ToString();
                        _root.AppendChild(_xmlvalue);
                        _xmlvalue = _doc.CreateElement("depthvalue");
                        _xmlvalue.InnerText = _volume.depthvalue == 0 ? "" : _volume.depthvalue.ToString();
                        _root.AppendChild(_xmlvalue);
                        _xmlvalue = _doc.CreateElement("selectedunit");
                        _xmlvalue.InnerText = _volume.units.selectedUnit == null ? "" : _volume.units.selectedUnit.ToString();
                        _root.AppendChild(_xmlvalue);
                    }
                }
                else if (typeID == 14)
                {
                    Number _number = _typeValue.Number;
                    XmlElement _xmlvalue = _doc.CreateElement("value");
                    _xmlvalue.InnerText = _number.value == 0 ? "" : _number.value.ToString();
                    _root.AppendChild(_xmlvalue);

                }
                else if (typeID == 15)
                {
                    DefaultDice _defaultType = _typeValue.DefaultDice;
                    XmlElement _xmlvalue = _doc.CreateElement("value");
                    _xmlvalue.InnerText = _defaultType.value == null ? "" : _defaultType.value.ToString();
                    _root.AppendChild(_xmlvalue);
                }
                else if (typeID == 16)
                {
                    Calculation _calculationType = _typeValue.Calculation;
                    XmlElement _xmlvalue = _doc.CreateElement("value");
                    _xmlvalue.InnerText = _calculationType.formulae == null ? "" : _calculationType.formulae.ToString();
                    _root.AppendChild(_xmlvalue);
                }
                else if (typeID == 19)
                {
                    Text text = _typeValue.Text;

                    //if (text.value == null)
                    //{
                    //    _resultPresent = false;
                    //}
                    //else
                    //{
                    //    XmlElement _xmlvalue = _doc.CreateElement("value");
                    //    _xmlvalue.InnerText = text.value == null ? "" : text.value;
                    //    _root.AppendChild(_xmlvalue);
                    //}

                    if (text == null)
                    {
                        XmlElement _xmlvalue = _doc.CreateElement("value");
                        _xmlvalue.InnerText = "";
                        _root.AppendChild(_xmlvalue);
                    }
                    else
                    {
                        if (text.value == null)
                        {
                            _resultPresent = false;
                        }
                        else
                        {
                            XmlElement _xmlvalue = _doc.CreateElement("value");
                            _xmlvalue.InnerText = text.value == null ? "" : text.value;
                            _root.AppendChild(_xmlvalue);
                        }
                    }


                }
            }

            if (!_resultPresent)
            {
                _doc = null;
            }
            else
            {
                _doc.AppendChild(_root);
            }

            return _doc;
        }
        public static CustomTypes ConvertTypeValueXMLtoClass(int? typeID, string _typeValue, string _typeUnits)
        {
            //Declared  Model
            CustomTypes _result = new CustomTypes();
            Units _units = new Units();
            Choice _choice = new Choice();
            switch (typeID)
            {
                case 1:
                    Text _tempresult = new Text();
                    if (_typeValue != null && _typeValue != "")
                    {
                        XmlDocument doc = new XmlDocument();
                        doc.LoadXml(_typeValue);
                        XmlNode _XmlNode = doc.DocumentElement;
                        if (Convert.ToInt32(_XmlNode.Attributes["isMetaData"].Value) == 0)
                        {
                            var _xmlNodeData = _XmlNode.SelectNodes("/root/value")[0];

                            if (_xmlNodeData != null)
                            {
                                _tempresult.value = (_xmlNodeData.InnerText == null || _xmlNodeData.InnerText == "") ? "" : _xmlNodeData.InnerText;
                            }
                        }
                    }
                    _result.Text = _tempresult;
                    break;
                case 2:
                    Choice _tempChoiceresult = new Choice();
                    if (_typeUnits != null)
                    {
                        XmlDocument _docAvailableChoices = new XmlDocument();
                        _docAvailableChoices.LoadXml(_typeUnits);
                        XmlNode _xmlNodeAvailableChoices = _docAvailableChoices.DocumentElement;
                        XmlNodeList _choiceOptionsList = _xmlNodeAvailableChoices.ChildNodes;
                        _choice.choices = new List<Choices>();
                        foreach (XmlNode choiceOption in _choiceOptionsList)
                        {
                            _choice.choices.Add(new Choices()
                            {
                                ChoiceName = choiceOption.InnerText
                            });

                        }
                        _tempChoiceresult.choices = _choice.choices;
                    }
                    if (_typeValue != null && _typeValue != "")
                    {
                        XmlDocument doc = new XmlDocument();
                        doc.LoadXml(_typeValue);
                        XmlNode _XmlNode = doc.DocumentElement;

                        if (_typeValue != null)
                        {
                            var _xmlNodeData = _XmlNode.SelectNodes("/root/value")[0];
                            if (_xmlNodeData != null)
                            {
                                _tempChoiceresult.Value = (_xmlNodeData.InnerText == null || _xmlNodeData.InnerText == "") ? "" : Convert.ToString(_xmlNodeData.InnerText);
                                _xmlNodeData = _XmlNode.SelectNodes("/root/selectedchoice")[0];
                                if (_xmlNodeData != null)
                                {
                                    _choice.SelectedChoiceName = _xmlNodeData.InnerText;
                                }
                                _tempChoiceresult.SelectedChoiceName = _choice.selectedchoice;
                            }
                        }

                    }
                    _result.Choices = _tempChoiceresult;
                    break;
                case 3:
                    OnOrOff _tempOnOrOffResult = new OnOrOff();
                    if (_typeValue != null && _typeValue != "")
                    {
                        XmlDocument doc = new XmlDocument();
                        doc.LoadXml(_typeValue);
                        XmlNode _XmlNode = doc.DocumentElement;
                        if (_typeValue != null)
                        {
                            var _xmlNodeData = _XmlNode.SelectNodes("/root/value")[0];
                            if (_xmlNodeData != null)
                            {
                                _tempOnOrOffResult.value = (_xmlNodeData.InnerText == null || _xmlNodeData.InnerText == "") ? "" : Convert.ToString(_xmlNodeData.InnerText);
                            }
                        }

                    }
                    _result.OnOrOff = _tempOnOrOffResult;
                    break;
                case 4:
                    YesOrNo _tempYesOrNoResult = new YesOrNo();
                    if (_typeValue != null && _typeValue != "")
                    {
                        XmlDocument doc = new XmlDocument();
                        doc.LoadXml(_typeValue);
                        XmlNode _XmlNode = doc.DocumentElement;
                        if (_typeValue != null)
                        {
                            var _xmlNodeData = _XmlNode.SelectNodes("/root/value")[0];
                            if (_xmlNodeData != null)
                            {
                                _tempYesOrNoResult.value = (_xmlNodeData.InnerText == null || _xmlNodeData.InnerText == "") ? "" : Convert.ToString(_xmlNodeData.InnerText);
                            }
                        }

                    }
                    _result.YesOrNo = _tempYesOrNoResult;
                    break;
                case 5:
                    ValueAndSubValue _tempValueAndSubValueResult = new ValueAndSubValue();
                    if (_typeValue != null && _typeValue != "")
                    {
                        XmlDocument doc = new XmlDocument();
                        doc.LoadXml(_typeValue);
                        XmlNode _XmlNode = doc.DocumentElement;
                        if (_typeValue != null)
                        {
                            var _xmlNodeData = _XmlNode.SelectNodes("/root/value")[0];
                            if (_xmlNodeData != null)
                            {
                                _tempValueAndSubValueResult.value = (_xmlNodeData.InnerText == null || _xmlNodeData.InnerText == "") ? 0 : Convert.ToInt32(_xmlNodeData.InnerText);
                                _tempValueAndSubValueResult.subvalue = (_xmlNodeData.InnerText == null || _xmlNodeData.InnerText == "") ? 0 : Convert.ToInt32(_xmlNodeData.NextSibling.InnerText);
                            }
                        }

                    }
                    _result.ValueAndSubValue = _tempValueAndSubValueResult;
                    break;
                case 6:
                    CurrentAndMaxValue _tempCurrentAndMaxValueResult = new CurrentAndMaxValue();
                    if (_typeValue != null && _typeValue != "")
                    {
                        XmlDocument doc = new XmlDocument();
                        doc.LoadXml(_typeValue);
                        XmlNode _XmlNode = doc.DocumentElement;
                        if (_typeValue != null)
                        {
                            var _xmlNodeData = _XmlNode.SelectNodes("/root")[0];
                            if (_xmlNodeData != null)
                            {
                                _tempCurrentAndMaxValueResult.CurrentValue = _xmlNodeData.FirstChild == null ? 0 : Convert.ToDecimal(_xmlNodeData.FirstChild.InnerText);
                                _tempCurrentAndMaxValueResult.MaxValue = _xmlNodeData.LastChild == null ? 0 : Convert.ToDecimal(_xmlNodeData.LastChild.InnerText);
                            }
                        }

                    }
                    _result.CurrentAndMaxValue = _tempCurrentAndMaxValueResult;
                    break;
                case 7:
                    Weight _tempWeightresult = new Weight();
                    if (_typeUnits != null)
                    {
                        XmlDocument _docAvailableUnits = new XmlDocument();
                        _docAvailableUnits.LoadXml(_typeUnits);
                        XmlNode _xmlNodeAvailableUnits = _docAvailableUnits.DocumentElement;
                        XmlNodeList _unitOptionsList = _xmlNodeAvailableUnits.ChildNodes;
                        _units.availableUnits = new List<string>();
                        foreach (XmlNode unitOption in _unitOptionsList)
                        {
                            _units.availableUnits.Add(unitOption.InnerText);
                        }
                        _tempWeightresult.units = _units;
                    }
                    if (_typeValue != null && _typeValue != "")
                    {
                        XmlDocument doc = new XmlDocument();
                        doc.LoadXml(_typeValue);
                        XmlNode _XmlNode = doc.DocumentElement;
                        if (_typeValue != null)
                        {
                            var _xmlNodeData = _XmlNode.SelectNodes("/root/value")[0];
                            if (_xmlNodeData != null)
                            {
                                _tempWeightresult.value = (_xmlNodeData.InnerText == null || _xmlNodeData.InnerText == "") ? 0 : Convert.ToInt32(_xmlNodeData.InnerText);
                                _xmlNodeData = _XmlNode.SelectNodes("/root/selectedunit")[0];
                                if (_xmlNodeData != null)
                                {
                                    _units.selectedUnit = _xmlNodeData.InnerText;
                                }
                                _tempWeightresult.units.selectedUnit = _units.selectedUnit;

                            }
                        }

                    }
                    _result.Weight = _tempWeightresult;
                    break;
                case 8:
                    Image _tempImageResult = new Image();
                    if (_typeValue != null && _typeValue != "")
                    {
                        XmlDocument doc = new XmlDocument();
                        doc.LoadXml(_typeValue);
                        XmlNode _XmlNode = doc.DocumentElement;
                        if (_typeValue != null)
                        {
                            var _xmlNodeData = _XmlNode.SelectNodes("/root/value")[0];
                            if (_xmlNodeData != null)
                            {
                                _tempImageResult.image = _xmlNodeData.InnerText;
                            }
                        }

                    }
                    _result.Image = _tempImageResult;
                    break;
                case 12:
                    Height _tempHeightResult = new Height();
                    if (_typeUnits != null)
                    {
                        XmlDocument _docAvailableUnits = new XmlDocument();
                        _docAvailableUnits.LoadXml(_typeUnits);
                        XmlNode _xmlNodeAvailableUnits = _docAvailableUnits.DocumentElement;
                        XmlNodeList _unitOptionsList = _xmlNodeAvailableUnits.ChildNodes;
                        _units.availableUnits = new List<string>();
                        foreach (XmlNode unitOption in _unitOptionsList)
                        {
                            _units.availableUnits.Add(unitOption.InnerText);
                        }
                        _tempHeightResult.units = _units;
                    }
                    if (_typeValue != null && _typeValue != "")
                    {
                        XmlDocument doc = new XmlDocument();
                        doc.LoadXml(_typeValue);
                        XmlNode _XmlNode = doc.DocumentElement;

                        if (_typeValue != null)
                        {
                            var _xmlNodeData = _XmlNode.SelectNodes("/root/value")[0];
                            if (_xmlNodeData != null)
                            {
                                _tempHeightResult.value = (_xmlNodeData.InnerText == null || _xmlNodeData.InnerText == "") ? 0 : Convert.ToInt32(_xmlNodeData.InnerText);
                                _xmlNodeData = _XmlNode.SelectNodes("/root/selectedunit")[0];
                                if (_xmlNodeData != null)
                                {
                                    _units.selectedUnit = _xmlNodeData.InnerText;
                                }
                                _tempHeightResult.units.selectedUnit = _units.selectedUnit;
                            }
                        }

                    }
                    _result.Height = _tempHeightResult;
                    break;
                case 13:
                    Volume _tempVolumeResult = new Volume();
                    if (_typeUnits != null)
                    {
                        XmlDocument _docAvailableUnits = new XmlDocument();
                        _docAvailableUnits.LoadXml(_typeUnits);
                        XmlNode _xmlNodeAvailableUnits = _docAvailableUnits.DocumentElement;
                        XmlNodeList _unitOptionsList = _xmlNodeAvailableUnits.ChildNodes;
                        _units.availableUnits = new List<string>();
                        foreach (XmlNode unitOption in _unitOptionsList)
                        {
                            _units.availableUnits.Add(unitOption.InnerText);
                        }
                        _tempVolumeResult.units = _units;
                    }


                    if (_typeValue != null && _typeValue != "")
                    {
                        XmlDocument doc = new XmlDocument();
                        doc.LoadXml(_typeValue);
                        XmlNode _XmlNode = doc.DocumentElement;
                        if (_typeValue != null)
                        {
                            var _xmlNodeData = _XmlNode.SelectNodes("/root/value")[0];
                            if (_xmlNodeData != null)
                            {
                                _tempVolumeResult.depthvalue = _xmlNodeData.InnerText == null ? 0 : Convert.ToInt32(_xmlNodeData.InnerText);
                                _xmlNodeData = _XmlNode.SelectNodes("/root/selectedunit")[0];
                                if (_xmlNodeData != null)
                                {
                                    _units.selectedUnit = _xmlNodeData.InnerText;
                                }
                                _tempVolumeResult.units.selectedUnit = _units.selectedUnit;
                            }
                        }

                    }
                    _result.Volume = _tempVolumeResult;
                    break;
                case 14:
                    Number _tempNumberResult = new Number();
                    if (_typeValue != null && _typeValue != "")
                    {
                        XmlDocument doc = new XmlDocument();
                        doc.LoadXml(_typeValue);
                        XmlNode _XmlNode = doc.DocumentElement;
                        if (_typeValue != null)
                        {
                            var _xmlNodeData = _XmlNode.SelectNodes("/root/value")[0];
                            if (_xmlNodeData != null)
                            {
                                _tempNumberResult.value = (_xmlNodeData.InnerText == null || _xmlNodeData.InnerText == "") ? 0 : Convert.ToInt32(_xmlNodeData.InnerText);
                            }
                        }

                    }
                    _result.Number = _tempNumberResult;
                    break;
                case 15:
                    DefaultDice _tempDefaultDiceresult = new DefaultDice();
                    if (_typeValue != null && _typeValue != "")
                    {
                        XmlDocument doc = new XmlDocument();
                        doc.LoadXml(_typeValue);
                        XmlNode _XmlNode = doc.DocumentElement;
                        if (Convert.ToInt32(_XmlNode.Attributes["isMetaData"].Value) == 0)
                        {
                            var _xmlNodeData = _XmlNode.SelectNodes("/root/value")[0];
                            if (_xmlNodeData != null)
                            {
                                _tempDefaultDiceresult.value = (_xmlNodeData.InnerText == null || _xmlNodeData.InnerText == "") ? "" : _xmlNodeData.InnerText;
                            }
                        }
                    }
                    _result.DefaultDice = _tempDefaultDiceresult;
                    break;
                case 16:
                    Calculation _tempFormula = new Calculation();
                    if (_typeValue != null && _typeValue != "")
                    {
                        XmlDocument doc = new XmlDocument();
                        doc.LoadXml(_typeValue);
                        XmlNode _XmlNode = doc.DocumentElement;
                        _tempFormula.formulae = doc.InnerText;

                    }
                    _result.Calculation = _tempFormula;
                    break;
                case 19:
                    Text _temptextresult = new Text();
                    if (_typeValue != null && _typeValue != "")
                    {
                        XmlDocument doc = new XmlDocument();
                        doc.LoadXml(_typeValue);
                        XmlNode _XmlNode = doc.DocumentElement;
                        if (Convert.ToInt32(_XmlNode.Attributes["isMetaData"].Value) == 0)
                        {
                            var _xmlNodeData = _XmlNode.SelectNodes("/root/value")[0];

                            if (_xmlNodeData != null)
                            {
                                _temptextresult.value = (_xmlNodeData.InnerText == null || _xmlNodeData.InnerText == "") ? "" : _xmlNodeData.InnerText;
                            }
                        }
                    }
                    _result.Text = _temptextresult;
                    break;

            }
            return _result;
        }
        public static Style ConvertStyleValueXMLtoClass(string _styleValue)
        {
            Style _style = new Style();
            if (_styleValue != null && _styleValue != "")
            {
                XmlDocument doc = new XmlDocument();
                doc.LoadXml(_styleValue);
                XmlNode _XmlNode = doc.DocumentElement;
                if (Convert.ToInt32(_XmlNode.Attributes["isMetaData"].Value) == 0)
                {
                    var _xmlColorNodeData = _XmlNode.SelectNodes("/root/color")[0];
                    var _xmlbodybackgroundColorNodeData = _XmlNode.SelectNodes("/root/bodybackgroundColor")[0];
                    var _xmlbodybodytextColor = _XmlNode.SelectNodes("/root/bodytextColor")[0];
                    var _xmltitlebackgroundcolor = _XmlNode.SelectNodes("/root/titlebackgroundColor")[0];
                    var _xmltitletextcolor = _XmlNode.SelectNodes("/root/titletextColor")[0];
                    var _xmlstyleNodeData = _XmlNode.SelectNodes("/root/style")[0];
                    var _xmlwidthNodeData = _XmlNode.SelectNodes("/root/width")[0];
                    var _xmlradiusNodeData = _XmlNode.SelectNodes("/root/radius")[0];
                    var _xmlshadowNodeData = _XmlNode.SelectNodes("/root/shadow")[0];

                    if (_xmlColorNodeData != null)
                    {
                        _style.color = (_xmlColorNodeData.InnerText == null || _xmlColorNodeData.InnerText == "") ? "" : _xmlColorNodeData.InnerText;
                    }
                    if (_xmlbodybackgroundColorNodeData != null)
                    {
                        _style.bodybackgroundColor = (_xmlbodybackgroundColorNodeData.InnerText == null || _xmlbodybackgroundColorNodeData.InnerText == "") ? "" : _xmlbodybackgroundColorNodeData.InnerText;
                    }
                    if (_xmlbodybodytextColor != null)
                    {
                        _style.bodytextcolor = (_xmlbodybodytextColor.InnerText == null || _xmlbodybodytextColor.InnerText == "") ? "" : _xmlbodybodytextColor.InnerText;
                    }
                    if (_xmltitlebackgroundcolor != null)
                    {
                        _style.titlebackgroundcolor = (_xmltitlebackgroundcolor.InnerText == null || _xmltitlebackgroundcolor.InnerText == "") ? "" : _xmltitlebackgroundcolor.InnerText;
                    }
                    if (_xmltitletextcolor != null)
                    {
                        _style.titletextcolor = (_xmltitletextcolor.InnerText == null || _xmltitletextcolor.InnerText == "") ? "" : _xmltitletextcolor.InnerText;
                    }
                    if (_xmlstyleNodeData != null)
                    {
                        _style.style = (_xmlstyleNodeData.InnerText == null || _xmlstyleNodeData.InnerText == "") ? "" : _xmlstyleNodeData.InnerText;
                    }
                    if (_xmlwidthNodeData != null)
                    {
                        _style.width = (_xmlwidthNodeData.InnerText == null || _xmlwidthNodeData.InnerText == "") ? "" : _xmlwidthNodeData.InnerText;
                    }
                    if (_xmlradiusNodeData != null)
                    {
                        _style.radius = (_xmlradiusNodeData.InnerText == null || _xmlradiusNodeData.InnerText == "") ? "" : _xmlradiusNodeData.InnerText;
                    }
                    if (_xmlshadowNodeData != null)
                    {
                        _style.shadow = (_xmlshadowNodeData.InnerText == null || _xmlshadowNodeData.InnerText == "") ? "" : _xmlshadowNodeData.InnerText;
                    }
                }
            }
            return _style;
        }
        public static XmlDocument ConvertStyleValueClasstoXML(Style _styleValue)
        {

            XmlDocument _doc = new XmlDocument();
            XmlElement _root = _doc.CreateElement("root");
            _root.SetAttribute("isMetaData", "0");
            XmlElement _xmlvalue = _doc.CreateElement("color");
            _xmlvalue.InnerText = _styleValue.color == null ? "" : _styleValue.color;
            _root.AppendChild(_xmlvalue);
            _xmlvalue = _doc.CreateElement("bodybackgroundColor");
            _xmlvalue.InnerText = _styleValue.bodybackgroundColor == null ? "" : _styleValue.bodybackgroundColor;
            _root.AppendChild(_xmlvalue);
            _xmlvalue = _doc.CreateElement("bodytextColor");
            _xmlvalue.InnerText = _styleValue.bodytextcolor == null ? "" : _styleValue.bodytextcolor;
            _root.AppendChild(_xmlvalue);
            _xmlvalue = _doc.CreateElement("titletextColor");
            _xmlvalue.InnerText = _styleValue.titletextcolor == null ? "" : _styleValue.titletextcolor;
            _root.AppendChild(_xmlvalue);
            _xmlvalue = _doc.CreateElement("titlebackgroundColor");
            _xmlvalue.InnerText = _styleValue.titlebackgroundcolor == null ? "" : _styleValue.titlebackgroundcolor;
            _root.AppendChild(_xmlvalue);
            _xmlvalue = _doc.CreateElement("style");
            _xmlvalue.InnerText = _styleValue.style == null ? "" : _styleValue.style;
            _root.AppendChild(_xmlvalue);
            _xmlvalue = _doc.CreateElement("width");
            _xmlvalue.InnerText = _styleValue.width == null ? "" : _styleValue.width;
            _root.AppendChild(_xmlvalue);
            _xmlvalue = _doc.CreateElement("radius");
            _xmlvalue.InnerText = _styleValue.radius == null ? "" : _styleValue.radius;
            _root.AppendChild(_xmlvalue);
            _xmlvalue = _doc.CreateElement("shadow");
            _xmlvalue.InnerText = _styleValue.shadow == null ? "" : _styleValue.shadow;
            _root.AppendChild(_xmlvalue);
            _doc.AppendChild(_root);
            return _doc;
        }
        // Validations
        public static string RuleSetValidation(RuleSetViewModel RulesetModel)
        {
            string Errorstr = "";
            var RulesetpropertyList = RulesetModel.Rulesetproperty;
            //Changed And Added By Brijesh
            foreach (var Result in RulesetpropertyList)
            {
                if (Result.IsMandotary == true)
                {
                    switch (Result.TypeId)
                    {
                        case 15:
                            if (Result.Value.DefaultDice.value == null)
                            {
                                Errorstr = Errorstr + Result.Name + ",";
                            }
                            break;
                        case 7:
                            if (Result.Units.selectedUnit == null)
                            {
                                Errorstr = Errorstr + Result.Name + ",";
                            }
                            break;
                        case 8:
                            if (Result.Value.Image.image == null)
                            {
                                Errorstr = Errorstr + Result.Name;
                            }
                            break;
                    }
                    //if (Result.TypeId == 15)
                    //{
                    //    if (Result.Value.DefaultDice.value == null)
                    //    {
                    //        Errorstr = Errorstr + Result.Name + ",";
                    //    }
                    //}
                    //else if (Result.TypeId == 7)
                    //{
                    //    if (Result.Units.selectedUnit == null)
                    //    {
                    //        Errorstr = Errorstr + Result.Name + ",";
                    //    }
                    //}
                }
            }
            //Changed And Added By Brijesh
            //var CoreStatList = RulesetModel.Corestats;
            //if (CoreStatList.Count == 0) Errorstr = Errorstr == "" ? "Please fill atleast 1 CoreStat." : Errorstr;
            //var RuleSetContentTypes = new RuleSetService().GetRuleSetContentTypes();
            //bool IsMandatoryPresent = false;
            //foreach (var ruleSetContentType in RuleSetContentTypes)
            //{
            //    if (ruleSetContentType.Mandatory == true)
            //    {
            //        IsMandatoryPresent = true;
            //        break;
            //    }
            //}
            //if (IsMandatoryPresent)
            //{
            //    Errorstr = Errorstr == "" ? "each 1 Item , Spell and Abilities." : Errorstr;
            //    if (RulesetModel.Items != null && RulesetModel.Spells != null && RulesetModel.Abilities != null) Errorstr = "";
            //}
            return Errorstr;
        }
        //Commented Code
        //public static CustomTypes GetTypeClassMetaData(int? typeID)
        //{
        //    CustomTypes _customtypes = new CustomTypes();
        //    //Object _result = null;

        //    if (typeID == 1)
        //    {
        //        Text _tempresult = new Text();
        //        _customtypes.Text = _tempresult;

        //    }
        //    else if (typeID == 2)
        //    {
        //        Choice _tempresult = new Choice();
        //        _customtypes.Choices = _tempresult;

        //    }
        //    else if (typeID == 3)
        //    {
        //        OnOrOff _tempresult = new OnOrOff();
        //        _customtypes.OnOrOff = _tempresult;

        //    }
        //    else if (typeID == 4)
        //    {
        //        YesOrNo _tempresult = new YesOrNo();
        //        _customtypes.YesOrNo = _tempresult;

        //    }
        //    else if (typeID == 5)
        //    {
        //        ValueAndSubValue _tempresult = new ValueAndSubValue();
        //        _customtypes.ValueAndSubValue = _tempresult;

        //    }
        //    else if (typeID == 6)
        //    {
        //        CurrentAndMaxValue _tempresult = new CurrentAndMaxValue();
        //        _customtypes.CurrentAndMaxValue = _tempresult;

        //    }
        //    else if (typeID == 7)
        //    {
        //        Weight _tempresult = new Weight();
        //        var selectedUnit = String.Empty;
        //        Units _units = ConvertUnitsXMLtoClass(typeID, _utilityContext.RPGSmithTypes.Where(x => x.TypeID == typeID).Select(x => x.Units).FirstOrDefault(), selectedUnit);
        //        _tempresult.units = _units;

        //        _customtypes.Weight = _tempresult;
        //    }
        //    else if (typeID == 8)
        //    {
        //        Image _tempresult = new Image();
        //        _customtypes.Image = _tempresult;
        //    }
        //    else if (typeID == 12)
        //    {
        //        Height _tempresult = new Height();
        //        var selectedUnit = String.Empty;
        //        Units _units = ConvertUnitsXMLtoClass(typeID, _utilityContext.RPGSmithTypes.Where(x => x.TypeID == typeID).Select(x => x.Units).FirstOrDefault(), selectedUnit);
        //        _tempresult.units = _units;

        //        _customtypes.Height = _tempresult;

        //    }
        //    else if (typeID == 13)
        //    {
        //        Volume _tempresult = new Volume();
        //        var selectedUnit = String.Empty;
        //        Units _units = ConvertUnitsXMLtoClass(typeID, _utilityContext.RPGSmithTypes.Where(x => x.TypeID == typeID).Select(x => x.Units).FirstOrDefault(), selectedUnit);
        //        _tempresult.units = _units;

        //        _customtypes.Volume = _tempresult;

        //    }
        //    else if (typeID == 14)
        //    {
        //        Number _tempresult = new Number();
        //        _customtypes.Number = _tempresult;

        //    }
        //    else if (typeID == 15)
        //    {
        //        DefaultDice _tempresult = new DefaultDice();
        //        _tempresult.value = string.Empty;
        //        _customtypes.DefaultDice = _tempresult;

        //    }
        //    else if (typeID == 16)
        //    {
        //        Calculation _tempresult = new Calculation();
        //        _tempresult.formulae = string.Empty;
        //        _customtypes.Calculation = _tempresult;

        //        Choice _tempresultChoice = new Choice();
        //        _customtypes.Choices = _tempresultChoice;
        //    }

        //    return _customtypes;
        //}
        //public static Units ConvertUnitsXMLtoClass(int? typeID, string _xml, string _selectedUnitValueXml)
        //{

        //    XmlDocument doc = new XmlDocument();
        //    Units _units = new Units();
        //    if (_xml == null || _xml == "")
        //    {
        //        return _units;
        //    }
        //    doc.LoadXml(_xml);
        //    XmlNode _XmlNode = doc.DocumentElement;
        //    if (typeID == 7 && Convert.ToInt32(_XmlNode.Attributes["isMetaData"].Value) == 1)
        //    {
        //        XmlNodeList _unitOptionsList = _XmlNode.ChildNodes;
        //        _units.availableUnits = new List<string>();

        //        foreach (XmlNode unitOption in _unitOptionsList)
        //        {
        //            _units.availableUnits.Add(unitOption.InnerText);
        //        }
        //        if (_selectedUnitValueXml != "")
        //        {
        //            XmlDocument docUnitValue = new XmlDocument();
        //            docUnitValue.LoadXml(_selectedUnitValueXml);
        //            XmlElement root = docUnitValue.DocumentElement;
        //            string s = root.LastChild.InnerText;
        //            _units.selectedUnit = s;
        //        }

        //    }

        //    if (typeID == 7 && Convert.ToInt32(_XmlNode.Attributes["isMetaData"].Value) == 0)
        //    {
        //        XmlNode _unitSelectedOptions = _XmlNode.FirstChild;
        //        _units.selectedUnit = _unitSelectedOptions.InnerText;
        //    }

        //    if (typeID == 8 && Convert.ToInt32(_XmlNode.Attributes["isMetaData"].Value) == 1)
        //    {
        //        XmlNodeList _unitOptionsList = _XmlNode.ChildNodes;
        //        _units.availableUnits = new List<string>();

        //        foreach (XmlNode unitOption in _unitOptionsList)
        //        {
        //            _units.availableUnits.Add(unitOption.InnerText);
        //        }
        //    }

        //    if (typeID == 8 && Convert.ToInt32(_XmlNode.Attributes["isMetaData"].Value) == 0)
        //    {
        //        XmlNode _unitSelectedOptions = _XmlNode.FirstChild;
        //        _units.selectedUnit = _unitSelectedOptions.InnerText;
        //    }
        //    if (typeID == 12 && Convert.ToInt32(_XmlNode.Attributes["isMetaData"].Value) == 1)
        //    {
        //        XmlNodeList _unitOptionsList = _XmlNode.ChildNodes;
        //        _units.availableUnits = new List<string>();

        //        foreach (XmlNode unitOption in _unitOptionsList)
        //        {
        //            _units.availableUnits.Add(unitOption.InnerText);
        //        }
        //        if (_selectedUnitValueXml != "")
        //        {
        //            XmlDocument docUnitValue = new XmlDocument();
        //            docUnitValue.LoadXml(_selectedUnitValueXml);
        //            XmlElement root = docUnitValue.DocumentElement;
        //            string s = root.LastChild.InnerText;
        //            _units.selectedUnit = s;
        //        }
        //    }

        //    if (typeID == 12 && Convert.ToInt32(_XmlNode.Attributes["isMetaData"].Value) == 0)
        //    {
        //        XmlNode _unitSelectedOptions = _XmlNode.FirstChild;
        //        _units.selectedUnit = _unitSelectedOptions.InnerText;
        //    }

        //    if (typeID == 13 && Convert.ToInt32(_XmlNode.Attributes["isMetaData"].Value) == 1)
        //    {
        //        XmlNodeList _unitOptionsList = _XmlNode.ChildNodes;
        //        _units.availableUnits = new List<string>();

        //        foreach (XmlNode unitOption in _unitOptionsList)
        //        {
        //            _units.availableUnits.Add(unitOption.InnerText);
        //        }
        //    }

        //    if (typeID == 13 && Convert.ToInt32(_XmlNode.Attributes["isMetaData"].Value) == 0)
        //    {
        //        XmlNode _unitSelectedOptions = _XmlNode.FirstChild;
        //        _units.selectedUnit = _unitSelectedOptions.InnerText;
        //    }
        //    if (typeID == 15 && Convert.ToInt32(_XmlNode.Attributes["isMetaData"].Value) == 1)
        //    {
        //        XmlNodeList _unitOptionsList = _XmlNode.ChildNodes;
        //        _units.availableUnits = new List<string>();

        //        foreach (XmlNode unitOption in _unitOptionsList)
        //        {
        //            _units.availableUnits.Add(unitOption.InnerText);
        //        }
        //    }

        //    if (typeID == 15 && Convert.ToInt32(_XmlNode.Attributes["isMetaData"].Value) == 0)
        //    {
        //        XmlNode _unitSelectedOptions = _XmlNode.FirstChild;
        //        _units.selectedUnit = _unitSelectedOptions.InnerText;
        //    }

        //    return _units;

        //}

    }

}


