﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class SpellCommand
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SpellCommandId { get; set; }
        public string Command { get; set; }

        [MaxLength(255, ErrorMessage = "The field Name must be string with maximum length of 255 characters")]
        [Column(TypeName = "nvarchar(255)")]
        public string Name { get; set; }
     
        public int SpellId { get; set; }
        public bool? IsDeleted { get; set; }

        public virtual Spell Spell { get; set; }
    }
}
