﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class CustomDiceResult
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CustomDiceResultId { get; set; }


        [Column(TypeName = "nvarchar(2048)")]
        public string Name { get; set; }
        
        [Column(TypeName = "nvarchar(2048)")]
        public string DisplayContent { get; set; }

        public int CustomDiceId { get; set; }
        public virtual CustomDice CustomDice { get; set; }
    }
}
