using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class SpellVM
    {
        public int SpellId { get; set; }
        public int RuleSetId { get; set; }
        public string Name { get; set; }
        public string School { get; set; }
        public string Class { get; set; }
        public string Levels { get; set; }
        public string Command { get; set; }
        public string MaterialComponent { get; set; }
        public bool IsMaterialComponent { get; set; }
        public bool IsSomaticComponent { get; set; }
        public bool IsVerbalComponent { get; set; }
        public string CastingTime { get; set; }
        public string Description { get; set; }
        public string Stats { get; set; }
        public string HitEffect { get; set; }
        public string MissEffect { get; set; }
        public string EffectDescription { get; set; }
        public bool ShouldCast { get; set; }
        public string ImageUrl { get; set; }
        public bool Memorized { get; set; }
        public string Metatags { get; set; }
        public int? ParentSpellId { get; set; }
        public bool? IsDeleted { get; set; }
        public string CommandName { get; set; }
        public string gmOnly { get; set; }
        public string Command1 { get; set; }
        public string CommandName1 { get; set; }
        public string Command2 { get; set; }
        public string CommandName2 { get; set; }
        public string Command3 { get; set; }
        public string CommandName3 { get; set; }
        public string Command4 { get; set; }
        public string CommandName4 { get; set; }
        public string Command5 { get; set; }
        public string CommandName5 { get; set; }
        public string Command6 { get; set; }
        public string CommandName6 { get; set; }
        public string Command7 { get; set; }
        public string CommandName7 { get; set; }
        public string Command8 { get; set; }
        public string CommandName8 { get; set; }
        public string Command9 { get; set; }
        public string CommandName9 { get; set; }
        public string Command10 { get; set; }
        public string CommandName10 { get; set; }

    }
}
