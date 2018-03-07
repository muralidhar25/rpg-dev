using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using RPGSmith.Data;
using RPGSmith.Data.Models;
using RPGSmith.Web.ViewModels;
using RPGSmith.Models;
using System.Xml;
using RPGSmith.Web.Utilities;
using RPGSmith.Utilities.RPGSmithTypes;

namespace RPGSmith.DomainServices
{
    public class RPGSmithTypeService
    {
        private readonly RPGSmithContext _context;
        public RPGSmithTypeService()
        {
            RPGSmithContext dbContext = new RPGSmithContext();
            _context = dbContext;
        }
        #region RPGSmithTypes
        public IEnumerable<RPGSmithTypeViewModel> GetRPGSmithTypes()
        {
            IEnumerable<RPGSmithType> _rpgSmithType = _context.RPGSmithTypes.ToList();
            List<RPGSmithTypeViewModel> rpgsmithtype = new List<RPGSmithTypeViewModel>();

            foreach (var type in _rpgSmithType)
            {
                RPGSmithTypeViewModel model = new RPGSmithTypeViewModel();
                model.TypeId = type.TypeID;
                model.Name = type.Name;
                model.AllowedValues = type.AllowedValues;
				model.Description = type.Description;
				model.Examples = type.Examples;

                Units units = new Units();
                var selectedUnit = String.Empty;
                if (type.Units != null && type.Units != "")
                {
                    units = Utility.ConvertUnitsXMLtoClass(type.TypeID, type.Units, selectedUnit);
                }
                model.Units = units.availableUnits;
                rpgsmithtype.Add(model);

            }
            return rpgsmithtype;
        }
        public IEnumerable<RPGSmithTypeViewModel> GetRPGSmithTypesForCoreStat()
        {
            //Getting RPGSmith Type for Core Stat From db
            IEnumerable<RPGSmithType> _rpgSmithType = _context.RPGSmithTypes.Where(p => p.IsCoreStat == true).ToList();
            List<RPGSmithTypeViewModel> rpgsmithtype = new List<RPGSmithTypeViewModel>();
            if (_rpgSmithType.Count() == 0) return rpgsmithtype;
            foreach (var type in _rpgSmithType)
            {
                RPGSmithTypeViewModel model = new RPGSmithTypeViewModel();
                model.TypeId = type.TypeID;
                model.Name = type.Name;
                model.AllowedValues = type.AllowedValues;
				model.Description = type.Description;
				model.Examples = type.Examples;

                Units units = new Units();
                var selectedUnit = String.Empty;
                if (type.Units != null && type.Units != "")
                {
                    units = Utility.ConvertUnitsXMLtoClass(type.TypeID, type.Units, selectedUnit);
                }
                model.Units = units.availableUnits;
                rpgsmithtype.Add(model);

            }
            return rpgsmithtype;
        }
        public List<string> ConvertXMLtoClass(string _xml)
        {

            XmlDocument doc = new XmlDocument();
            doc.LoadXml(_xml);
            XmlNode _XmlNode = doc.DocumentElement;
            List<string> _units = new List<string>();
            if (_XmlNode.Attributes["type"].Value.ToLower() == "units")
            {
                XmlNodeList unitOptionsList = _XmlNode.ChildNodes;

                foreach (XmlNode unitOption in unitOptionsList)
                {
                    _units.Add(unitOption.InnerText);
                }
            }
            return _units;
         }
        #endregion
        
    }
}