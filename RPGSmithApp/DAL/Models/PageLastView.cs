using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
   public class PageLastView
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PageLastViewId { get; set; }

        [Required]
        public string PageName { get; set; }
        [Required]
        public string ViewType { get; set; }
        
        public string UserId { get; set; }

     //   public virtual ApplicationUser AspNetUser { get; set; }

    }
}
