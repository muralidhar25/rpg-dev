namespace DAL.Models
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public class RuleSetGenre
    {
        public RuleSetGenre()
        {
            RuleSets = new HashSet<RuleSet>();
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public short RuleSetGenreId { get; set; }

        [MaxLength(255, ErrorMessage = "The field Name must be string with maximum length of 255 characters")]
        [Column(TypeName = "nvarchar(255)")]
        public string GenreName { get; set; }

        public virtual ICollection<RuleSet> RuleSets { get; set; }
    }
}
