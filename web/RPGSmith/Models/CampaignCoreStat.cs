using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmith.Web.Models
{
    public class CampaignCoreStat
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int CampaignId { get; set; }
        public int CoreStatTypeId { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Formula { get; set; }
        public string Choices { get; set; }
    }
}
