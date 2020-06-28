namespace DAL.Models
{
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public class CharacterStatChoice
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CharacterStatChoiceId { get; set; }

        public string StatChoiceValue { get; set; }

        public int CharacterStatId { get; set; }

        public bool? IsDeleted { get; set; }

        public virtual CharacterStat CharacterStat { get; set; }
    }
}
