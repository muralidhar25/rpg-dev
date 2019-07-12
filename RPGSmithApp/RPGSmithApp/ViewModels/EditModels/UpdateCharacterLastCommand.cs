using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels.EditModels
{
    public class UpdateCharacterLastCommand
    {
        public int CharacterId { get; set; }
        public string LastCommand { get; set; }
        public string LastCommandResult { get; set; }
        public string LastCommandValues { get; set; }
        public int LastCommandTotal { get; set; }
    }

    public class UpdateRulesetLastCommand
    {
        public int RuleSetId { get; set; }
        public string LastCommand { get; set; }
        public string LastCommandResult { get; set; }
        public string LastCommandValues { get; set; }
        public int LastCommandTotal { get; set; }
    }
}
