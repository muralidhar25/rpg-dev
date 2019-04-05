using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class CustomDice
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CustomDiceId { get; set; }

        [Required]
        [Column(TypeName = "nvarchar(100)")]
        public string Name { get; set; }

        [Required]
        [Column(TypeName = "nvarchar(50)")]
        public string Icon { get; set; }

        public bool IsNumeric { get; set; }

        public int RuleSetId { get; set; }

        public CustomDicetypeEnum CustomDicetype { get; set; }
        //UPDATE[CustomDices] SET CUSTOMDICETYPE=1 WHERE[IsNumeric]=1
        //UPDATE[CustomDices] SET CUSTOMDICETYPE=2 WHERE[IsNumeric]=0
        //SELECT* FROM[dbo].[CustomDiceResults] WHERE CUSTOMDICEID IN(SELECT CustomDiceId  FROM[dbo].[CustomDices] WHERE[IsNumeric]= 1)
        public virtual RuleSet RuleSet { get; set; }

        public virtual ICollection<CustomDiceResult> CustomDiceResults { get; set; }
    }
    public enum CustomDicetypeEnum
    {
        Numeric = 1, Text = 2, Image = 3
    }
}
