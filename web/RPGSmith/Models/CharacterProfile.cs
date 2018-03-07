namespace RPGSmith.Web.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public partial class CharacterProfile
    {    
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int CampaignId { get; set; }
        public string CampaignName { get; set; }

        [Required]
        [StringLength(128)]
        public string Name { get; set; }

        public string Portrait { get; set; }
        
        // This has to be here for BreezeJS to work, but it doesn't need to be mapped.
        public UserProfile User { get; set; }

        public IList<Layout> Layouts { get; set; }

        public IList<Counter> Counters { get; set; }
        public IList<Note> Notes { get; set; }


        public Campaign Campaign { get; set; }
        public IList<CharacterCoreStat> CoreStats { get; set; }
    }
}
