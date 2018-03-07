using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace RPGSmith.Web.Models
{
    public class RuleSet
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RulesetID { get; set; }
        public string Name { get; set; }
        public int UserId { get; set; }
        public DateTime Authored { get; set; }
        public DateTime Edited { get; set; }


    }
}
