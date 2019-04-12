using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.Models
{     
    public class MarketPlace
    {
        public MarketPlaceType MarketPlaceId { get; set; }
        public decimal Price { get; set; }
        public int qty { get; set; }        
        public string SourceToken { get; set; }
        public string Description { get; set; }
    }
    public class MarketPlaceItems
    {
        public int Id { get; set; }
        public MarketPlaceType MarketPlaceId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Tag { get; set; }
        public decimal Price { get; set; }
        public int Qty { get; set; }
        public string Image { get; set; }
        public bool Subscribed { get; set; }
    }
    public enum MarketPlaceType
    {
        GMPERMANENT = 1,
        GM_1_YEAR = 2,
        CAMPAIGN_SLOT = 3,        
        PLAYER_SLOT = 4,
        CHARACTER_SLOT = 5,
        REMOVE_ADDS = 6,
        ADDITIONAL_STORAGE = 7,
        BUY_US_A_COFFEE = 8,
        RULESET_SLOT = 9,
    }
    public enum SlotType {
        RULESET_SLOT = 1,
        CAMPAIGN_SLOT = 2,
        CHARACTER_SLOT = 3,
        PLAYER_SLOT = 4,
    }
}
