namespace RPGSmith.Web.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public partial class Layout
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int CharacterId { get; set; }
        public int UserId { get; set; }
        [Required]
        [StringLength(128)]
        public string Name { get; set; }
    
        public CharacterProfile Character { get; set; }
        public IList<Tab> Tabs { get; set; }
    }
}
