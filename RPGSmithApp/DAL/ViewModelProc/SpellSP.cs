using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.ViewModelProc
{
  public class SpellSP
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
    }
}
