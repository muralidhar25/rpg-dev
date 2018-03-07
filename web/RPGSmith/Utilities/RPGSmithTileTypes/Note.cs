using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace RPGSmith.Utilities.RPGSmithTileTypes
{
    public class Note
    {
        public int ClientId { get; set; }
        public int NoteId { get; set; }
        public int CharacterProfileId { get; set; }
        public string UserId { get; set; }
        public string Name { get; set; }
        [AllowHtml]
        public string Text { get; set; }
    }
}