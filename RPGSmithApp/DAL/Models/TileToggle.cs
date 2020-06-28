using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DAL.Models
{
    public class TileToggle
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TileToggleId { get; set; }

        public bool YesNo { get; set; }
        public bool OnOff { get; set; }
        public bool Display { get; set; }
        public bool ShowCheckbox { get; set; }
        public bool IsCustom { get; set; }
        public bool IsDeleted { get; set; }
        
        public virtual ICollection<TileCustomToggle> TileCustomToggles { get; set; }
    }
    public class TileCustomToggle
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TileCustomToggleId { get; set; }

        public string ToggleText { get; set; }
        public string Image { get; set; }
        public bool IsDeleted { get; set; }

        public int TileToggleId { get; set; }
        public virtual TileToggle TileToggle { get; set; }
    }
}
// INSERT INTO [TileTypes] ([Name],[ImageUrl],[IsDeleted]) values ('ToggleTile',null,null)