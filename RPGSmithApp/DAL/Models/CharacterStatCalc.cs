namespace DAL.Models
{
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public class CharacterStatCalc
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CharacterStatCalcId { get; set; }
       
        public string StatCalculation { get; set; }
        public string StatCalculationIds { get; set; }

        public int CharacterStatId { get; set; }

        public bool? IsDeleted { get; set; }

        public virtual CharacterStat CharacterStat { get; set; }
    }
}
