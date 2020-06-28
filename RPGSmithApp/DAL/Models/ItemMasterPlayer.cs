using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class ItemMasterPlayer
    {
        [Column(TypeName = "nvarchar(50)")]
        public string PlayerId { get; set; }

        public int ItemMasterId { get; set; }
        [Required]
        public bool isVisable { get; set; }
        public bool? IsDeleted { get; set; }

        public virtual ApplicationUser Player { get; set; }
        public virtual ItemMaster ItemMaster { get; set; }
    }
}
