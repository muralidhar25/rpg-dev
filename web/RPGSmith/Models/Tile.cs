namespace RPGSmith.Web.Models
{
    //using Newtonsoft.Json;
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public partial class Tile
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }
        public int TabId { get; set; }
        public int UserId { get; set; }
        public int TypeId { get; set; }
        public Nullable<int> EntityId { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }        
        public string Style { get; set; }

        public Tab Tab { get; set; }
    }
}
