namespace DAL.Models
{
    using System;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    [Table("UpdatedReferenceValue")]
    public class UpdatedReferenceValue
    {
        public int Id { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime CreatedAt { get; set; }

        public string CreatedBy { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime ModifiedAt { get; set; }

        public string ModifiedBy { get; set; }

        public int ReferenceId { get; set; }

        public int ReferenceType { get; set; }

        [StringLength(1500)]
        public string UpdatedJsonValue { get; set; }
    }
}
