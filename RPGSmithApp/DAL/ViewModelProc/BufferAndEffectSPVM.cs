using DAL.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.ViewModelProc
{
  public class BufferAndEffectSPVM
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BuffAndEffectId { get; set; }
        public int RuleSetId { get; set; }
        public string Name { get; set; }
        public string Command { get; set; }
        public string Description { get; set; }
        public string Stats { get; set; }
        public string ImageUrl { get; set; }
        public string Metatags { get; set; }
        public int? ParentBuffAndEffectId { get; set; }
        public bool? IsDeleted { get; set; }
        public string CommandName { get; set; }
        public string gmOnly { get; set; }
        [NotMapped]
        public BuffAndEffect ParentBuffAndEffect { get; set; }
        [NotMapped]
        public RuleSet RuleSet { get; set; }
        [NotMapped]
        public ICollection<BuffAndEffectCommand> BuffAndEffectCommand { get; set; }
         public bool IsAssignedToAnyCharacter { get; set; }
   
}
}
