namespace DAL.Models
{
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public class UserRuleSet
    {
        //[Key]
        public string UserId { get; set; }
        public ApplicationUser AppUser { get; set; }

      //  [Key]
        public int RuleSetId { get; set; }
        public RuleSet RuleSet { get; set; }
    }
}
