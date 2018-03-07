using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Data;
using System.IO;
using RPGSmith.Data;
using RPGSmith.Data.Models;
using RPGSmith.Web.ViewModels;
using System.Text;
namespace RPGSmith.Controllers
{
    public class CharecterRuleSetImportExportController : Controller
    {
        RPGSmithContext _context = new RPGSmithContext();

        [HttpPost]
        public ActionResult Import(FormCollection fc)
        {
            ResponseViewModel response = new ResponseViewModel();

            try
            {
                string filedata = "";
                int characterProfileId = 0;
                string filename = "";

                foreach (var key in fc.AllKeys)
                {
                    if (key == "filedata")
                    {
                        // var value = fc[key];
                        filedata = fc[key];
                    }
                    else if (key == "characterProfileId")
                    {
                        //var value = fc[key];
                        characterProfileId = Convert.ToInt32(fc[key]);
                    }
                }

                foreach (var key in fc.AllKeys)
                {
                    switch (key)
                    {
                        case "filedata":
                            filedata = fc[key];
                            break;
                        case "characterProfileId":
                            characterProfileId = Convert.ToInt32(fc[key]);
                            break;
                        case "filename":

                            if (fc[key] != "")
                            {
                                filename = fc[key];
                            }
                            else
                            {
                                filename = "";
                            }

                            break;
                    }
                }


                // Note: Validation
                string Error = "";

                Error = ValidateFileName(filename);

                if (Error == "")
                {

                    if (filedata != "" && Convert.ToInt32(characterProfileId) != 0)
                    {
                        DataTable dtRuleset = new DataTable();
                        dtRuleset.Columns.Add("Type", typeof(string));
                        dtRuleset.Columns.Add("RulesetId", typeof(string));
                        dtRuleset.Columns.Add("RulesetName", typeof(string));
                        dtRuleset.Columns.Add("UserName", typeof(string));
                        dtRuleset.Columns.Add("CreatedDate", typeof(string));

                        DataTable dtContents = new DataTable();
                        dtContents.Columns.Add("Type", typeof(string));
                        dtContents.Columns.Add("ContentId", typeof(string));
                        dtContents.Columns.Add("ItemId", typeof(string));
                        dtContents.Columns.Add("ContentTypeId", typeof(string));
                        dtContents.Columns.Add("Value", typeof(string));
                        dtContents.Columns.Add("NewItemId", typeof(string));


                        DataTable dtItemSpells = new DataTable();
                        dtItemSpells.Columns.Add("Type", typeof(string));
                        dtItemSpells.Columns.Add("ItemId", typeof(string));
                        dtItemSpells.Columns.Add("SpellId", typeof(string));
                        dtItemSpells.Columns.Add("Value", typeof(string));
                        dtItemSpells.Columns.Add("NewItemId", typeof(string));
                        dtItemSpells.Columns.Add("NewSpellId", typeof(string));

                        string FData = filedata;
                        FData = FData.Replace("data:;base64,", "");
                        byte[] profileimagewByte = Convert.FromBase64String(FData);

                        var reader = new StreamReader(new MemoryStream(profileimagewByte), Encoding.UTF8);

                        while (!reader.EndOfStream)
                        {
                            var line = reader.ReadLine();
                            var values = line.Split(',');

                            int CaseId = 0;
                            if ((FormatCSV(values[0]) == "R"))
                            {
                                CaseId = 1;
                            }
                            else if (((FormatCSV(values[0]) == "IP") || (FormatCSV(values[0]) == "I")) || ((FormatCSV(values[0]) == "SP") || (FormatCSV(values[0]) == "S")) || ((FormatCSV(values[0]) == "AP") || (FormatCSV(values[0]) == "A")))
                            {
                                CaseId = 2;
                            }

                            else if ((FormatCSV(values[0]) == "ISP"))
                            {
                                CaseId = 3;
                            }

                            switch (CaseId)
                            {
                                case 1:
                                    dtRuleset.Rows.Add(FormatCSV((values[0])), FormatCSV((values[1])), FormatCSV((values[2])), FormatCSV((values[3])), FormatCSV((values[4])));
                                    break;
                                case 2:
                                    dtContents.Rows.Add(FormatCSV(values[0]), FormatCSV(values[1]), FormatCSV(values[2]), FormatCSV(values[3]), FormatCSV(values[4]), FormatCSV(values[5]));
                                    break;
                                case 3:
                                    dtItemSpells.Rows.Add(FormatCSV(values[0]), FormatCSV(values[1]), FormatCSV(values[2]), "", "", "");
                                    break;
                            }

                        }

                        //Note : Ruleset Id to save data

                        if (dtContents.Rows.Count > 0)
                        {
                            saveRulesetContentData(dtRuleset, dtContents, dtItemSpells, characterProfileId);

                            response.PayLoad = "Sucess";
                            response.StatusCode = 200;
                            response.ErrorMessage = "";

                            return Json(response, JsonRequestBehavior.AllowGet);

                        }
                        else
                        {

                        }

                    }
                    else
                    {
                        response.PayLoad = "";
                        response.StatusCode = 200;
                        response.ErrorMessage = "No Data found";

                        return Json(response, JsonRequestBehavior.AllowGet);
                    }
                }
                else
                {
                    response.PayLoad = "";
                    response.StatusCode = 200;
                    response.ErrorMessage = Error;

                    return Json(response, JsonRequestBehavior.AllowGet);
                }

            }

            catch (Exception ex)
            {
                response.ErrorMessage = ex.Message;

            }

            return Json(response, JsonRequestBehavior.AllowGet);

            // return View();
        }


        // public string Validate(string filename, string filedata, int rulesetId)
        public string ValidateFileName(string filename)
        {
            string ErrorMessage = "";
            try
            {
                if (filename == "undefined" || filename == "")
                {
                    ErrorMessage = "Please Select File for Import";
                }
                else
                {
                    // var supportedTypes = new[] { "txt", "doc", "docx", "pdf", "xls", "xlsx" };
                    var supportedTypes = new[] { "zip" };
                    var fileExt = System.IO.Path.GetExtension(filename).Substring(1);
                    if (supportedTypes.Contains(fileExt))
                    {
                        ErrorMessage = "";
                    }
                    else
                    {
                        ErrorMessage = "Please upload valid zip file";
                    }

                    return ErrorMessage;
                }

            }
            catch (Exception ex)
            {
                return ex.Message;
            }
            return ErrorMessage;
        }



        public void saveRulesetContentData(DataTable dtRuleset, DataTable dtContents, DataTable dtItemSpells, int charecterProfileId)
        {
            try
            {
                if (dtContents.Rows.Count > 0)
                {
                    int NewItemContentId = 0;
                    int NewSpellContentId = 0;
                    int NewAbilityContentId = 0;

                    string ItemContentId = "";
                    string SpellContentId = "";
                    string AbilityContentId = "";

                    string userId = "";
                    var UserDetails = (from a in _context.CharacterProfiles
                                       where a.CharacterProfileId == charecterProfileId
                                       select a
                                  ).FirstOrDefault();

                    if (UserDetails != null)
                    {
                        userId = UserDetails.UserId;
                    }
                    else
                    {
                        userId = "";
                    }


                    for (int j = 0; j < dtContents.Rows.Count; j++)
                    {
                        int value = 0;

                        if ((dtContents.Rows[j]["Type"].ToString()) == "I" || (dtContents.Rows[j]["Type"].ToString() == "IP"))
                        {
                            value = 1;
                        }
                        else if ((dtContents.Rows[j]["Type"].ToString()) == "S" || (dtContents.Rows[j]["Type"].ToString() == "SP"))
                        {
                            value = 2;
                        }
                        else if ((dtContents.Rows[j]["Type"].ToString()) == "A" || (dtContents.Rows[j]["Type"].ToString() == "AP"))
                        {
                            value = 3;
                        }

                        //int value = 5;
                        switch (value)
                        {
                            case 1:

                                if (((dtContents.Rows[j]["Type"].ToString()) == "I") && ((dtContents.Rows[j]["Value"].ToString()) == "Start"))
                                {
                                    if (NewItemContentId == 0)
                                    {
                                        // && (dtContents.Rows[j]["ContentId"].ToString() == ItemContentId)

                                        RPGSmith.Data.Models.CharacterItem objCharacterItems = new RPGSmith.Data.Models.CharacterItem();
                                        objCharacterItems.CharacterProfileId = charecterProfileId;
                                        objCharacterItems.UserId = userId;
                                        objCharacterItems.ContentId = 0;
                                        objCharacterItems.Authored = DateTime.Now;
                                        _context.CharacterItems.Add(objCharacterItems);
                                        _context.SaveChanges();

                                        NewItemContentId = objCharacterItems.CharacterItemId;
                                        ItemContentId = (dtContents.Rows[j]["ContentId"].ToString());


                                        //dtContents.Rows[j]["NewItemId"] = objItem.ItemId;
                                        DataRow[] foundRows;
                                        string filter = "ItemId =" + ItemContentId;
                                        foundRows = dtItemSpells.Select(filter);

                                        foreach (DataRow dr in foundRows)
                                        {
                                            dtItemSpells.Rows[dr.Table.Rows.IndexOf(dr)]["NewItemId"] = NewItemContentId;
                                        }


                                    }
                                }
                                else if ((dtContents.Rows[j]["Type"].ToString() == "I") && (dtContents.Rows[j]["ContentId"].ToString() == ItemContentId) && (dtContents.Rows[j]["Value"].ToString() == "End"))
                                {
                                    NewItemContentId = 0;
                                    break;
                                }
                                else
                                {
                                    if ((dtContents.Rows[j]["Type"].ToString()) == "IP")
                                    {
                                        if (NewItemContentId != 0)
                                        {

                                            CharacterItemProperty objCharacterItemProperty = new CharacterItemProperty();
                                            objCharacterItemProperty.CharacterItemId = NewItemContentId;
                                            objCharacterItemProperty.Name = "";
                                            objCharacterItemProperty.TypeId = Convert.ToInt32((dtContents.Rows[j]["ContentTypeId"].ToString()));
                                            objCharacterItemProperty.Value = (dtContents.Rows[j]["Value"].ToString());
                                            objCharacterItemProperty.Description = "";
                                            _context.CharacterItemProperties.Add(objCharacterItemProperty);
                                            _context.SaveChanges();


                                            //DataRow[] foundRows;
                                            //string filter = "ItemId =" + dtContents.Rows[j]["ItemId"];

                                            //foundRows = dtItemSpells.Select(filter);
                                            //foreach (DataRow dr in foundRows)
                                            //{
                                            //    dtItemSpells.Rows[dr.Table.Rows.IndexOf(dr)]["NewItemId"] = objCharacterItemProperty.Id;
                                            //}

                                        }

                                    }
                                }


                                break;
                            case 2:

                                //if ((dtContents.Rows[j]["Type"].ToString()) == "S" || (dtContents.Rows[j]["Type"].ToString() == "SP"))
                                //{
                                if (((dtContents.Rows[j]["Type"].ToString()) == "S") && ((dtContents.Rows[j]["Value"].ToString()) == "Start"))
                                {
                                    if (NewSpellContentId == 0)
                                    {
                                        RPGSmith.Data.Models.CharacterSpell objCharacterSpell = new RPGSmith.Data.Models.CharacterSpell();
                                        objCharacterSpell.CharacterProfileId = charecterProfileId;
                                        objCharacterSpell.UserId = userId;
                                        objCharacterSpell.ContentId = 0;
                                        objCharacterSpell.Authored = DateTime.Now;
                                        _context.CharacterSpells.Add(objCharacterSpell);
                                        _context.SaveChanges();

                                        NewSpellContentId = objCharacterSpell.CharacterSpellId;
                                        SpellContentId = (dtContents.Rows[j]["ContentId"].ToString());

                                        DataRow[] foundRows;
                                        string filter = "SpellId =" + SpellContentId;
                                        foundRows = dtItemSpells.Select(filter);

                                        foreach (DataRow dr in foundRows)
                                        {
                                            dtItemSpells.Rows[dr.Table.Rows.IndexOf(dr)]["NewSpellId"] = NewSpellContentId;
                                        }

                                    }

                                }
                                else if ((dtContents.Rows[j]["Type"].ToString() == "S") && (dtContents.Rows[j]["ContentId"].ToString() == SpellContentId) && (dtContents.Rows[j]["Value"].ToString() == "End"))
                                {
                                    NewSpellContentId = 0;
                                    break;
                                }
                                else
                                {
                                    if ((dtContents.Rows[j]["Type"].ToString()) == "SP")
                                    {
                                        if (NewSpellContentId != 0)
                                        {
                                            CharacterSpellProperty objCharacterSpellProperty = new CharacterSpellProperty();
                                            objCharacterSpellProperty.CharacterSpellId = NewSpellContentId;
                                            objCharacterSpellProperty.Name = "";
                                            objCharacterSpellProperty.TypeId = Convert.ToInt32((dtContents.Rows[j]["ContentTypeId"].ToString()));
                                            objCharacterSpellProperty.Value = (dtContents.Rows[j]["Value"].ToString());
                                            objCharacterSpellProperty.Description = "";
                                            _context.CharacterSpellProperties.Add(objCharacterSpellProperty);
                                            _context.SaveChanges();


                                            //DataRow[] foundRows;
                                            //string filter = "ItemId =" + dtContents.Rows[j]["ItemId"];
                                            //foundRows = dtItemSpells.Select(filter);

                                            //foreach (DataRow dr in foundRows)
                                            //{
                                            //    dtItemSpells.Rows[dr.Table.Rows.IndexOf(dr)]["NewSpellId"] = objCharacterSpellProperty.Id;
                                            //}
                                        }

                                    }
                                }

                                //}

                                break;
                            case 3:

                                //if ((dtContents.Rows[j]["Type"].ToString()) == "A" || (dtContents.Rows[j]["Type"].ToString() == "AP"))
                                //{
                                if (((dtContents.Rows[j]["Type"].ToString()) == "A") && ((dtContents.Rows[j]["Value"].ToString()) == "Start"))
                                {
                                    if (NewAbilityContentId == 0)
                                    {
                                        RPGSmith.Data.Models.CharacterAbility objCharacterAbility = new RPGSmith.Data.Models.CharacterAbility();
                                        objCharacterAbility.CharacterProfileId = charecterProfileId;
                                        objCharacterAbility.UserId = userId;
                                        objCharacterAbility.ContentId = 0;
                                        objCharacterAbility.Authored = DateTime.Now;
                                        _context.CharacterAbilities.Add(objCharacterAbility);
                                        _context.SaveChanges();

                                        NewAbilityContentId = objCharacterAbility.CharacterAbilityId;
                                        AbilityContentId = (dtContents.Rows[j]["ContentId"].ToString());

                                    }

                                }
                                else if ((dtContents.Rows[j]["Type"].ToString() == "A") && (dtContents.Rows[j]["ContentId"].ToString() == AbilityContentId) && (dtContents.Rows[j]["Value"].ToString() == "End"))
                                {
                                    NewAbilityContentId = 0;
                                    break;
                                }
                                else
                                {
                                    if ((dtContents.Rows[j]["Type"].ToString()) == "AP")
                                    {
                                        if (NewAbilityContentId != 0)
                                        {
                                            CharacterAbilityProperty objCharacterAbilityProperty = new CharacterAbilityProperty();
                                            objCharacterAbilityProperty.CharacterAbilityId = NewAbilityContentId;
                                            objCharacterAbilityProperty.Name = "";
                                            objCharacterAbilityProperty.TypeId = Convert.ToInt32((dtContents.Rows[j]["ContentTypeId"].ToString()));
                                            objCharacterAbilityProperty.Value = (dtContents.Rows[j]["Value"].ToString());
                                            objCharacterAbilityProperty.Description = "";
                                            _context.CharacterAbilityProperties.Add(objCharacterAbilityProperty);
                                            _context.SaveChanges();

                                        }

                                    }


                                }

                                // }

                                break;
                            default:
                                break;
                        }

                    }

                    if (dtItemSpells.Rows.Count > 0)
                    {
                        for (int j = 0; j < dtItemSpells.Rows.Count; j++)
                        {
                            if (dtItemSpells.Rows[j]["NewItemId"].ToString() != "" && dtItemSpells.Rows[j]["NewSpellId"].ToString() != "")
                            {
                                //charecterItemspell objcharecterItemspell = new charecterItemspell();
                                CharacterItemSpell objCharacterItemSpell = new CharacterItemSpell();
                                objCharacterItemSpell.CharacterItemId = Convert.ToInt32((dtItemSpells.Rows[j]["NewItemId"].ToString()));
                                objCharacterItemSpell.CharacterSpellId = Convert.ToInt32((dtItemSpells.Rows[j]["NewSpellId"].ToString()));
                                _context.CharacterItemSpells.Add(objCharacterItemSpell);
                                _context.SaveChanges();
                            }
                        }
                    }

                }
                else
                {
                    return;
                }
            }
            catch (Exception ex)
            {

                throw;
            }
        }

        public static string FormatCSV(string input)
        {
            try
            {
                string Find = "";
                string Replace = "";

                //Source = input;
                Find = "\"";
                Replace = "";

                input = ReplaceFirstOccurrence(input, Find, Replace);
                input = ReplaceLastOccurrence(input, Find, Replace);

                return input;
            }
            catch
            {
                throw;
            }
        }

        public static string ReplaceFirstOccurrence(string Source, string Find, string Replace)
        {
            int Place = Source.IndexOf(Find);
            string result = Source.Remove(Place, Find.Length).Insert(Place, Replace);
            return result;
        }

        public static string ReplaceLastOccurrence(string Source, string Find, string Replace)
        {
            int Place = Source.LastIndexOf(Find);
            string result = Source.Remove(Place, Find.Length).Insert(Place, Replace);
            return result;
        }

    }
}