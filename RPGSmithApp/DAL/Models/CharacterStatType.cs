namespace DAL.Models
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public class CharacterStatType
    {      

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public short CharacterStatTypeId { get; set; }

        public short TypeId { get; set; }

        [MaxLength(255, ErrorMessage = "The field Name must be string with maximum length of 255 characters")]
        [Column(TypeName = "nvarchar(255)")]
        public string StatTypeName { get; set; }

        public string StatTypeDesc { get; set; }

        public bool isNumeric { get; set; }

        public virtual ICollection<CharacterStat> CharacterStats { get; set; }
    }
}
