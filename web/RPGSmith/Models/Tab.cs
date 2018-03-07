namespace RPGSmith.Web.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public partial class Tab
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int LayoutId { get; set; }
        public int UserId { get; set; }
        [Required]
        [StringLength(128)]
        public string Name { get; set; }
        public short Order { get; set; }
    
        public Layout Layout { get; set; }
        public IList<Tile> Tiles { get; set; }
    }
}
