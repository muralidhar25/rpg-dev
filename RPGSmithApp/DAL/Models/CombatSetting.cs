using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class CombatSetting
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int? CombatId { get; set; }
        public virtual Combat Combat { get; set; }

        public string PcInitiativeFormula { get; set; }
        public bool RollInitiativeForPlayer { get; set; }
        public bool RollInitiativeEveryRound { get; set; }
        public int GameRoundLength { get; set; }
        public bool XPDistributionforDeletedMonster { get; set; }
        public string CharcterXpStats { get; set; }
        public string CharcterHealthStats { get; set; }
        public bool AccessMonsterDetails { get; set; }
        public bool GroupInitiative { get; set; }
        public string GroupInitFormula { get; set; }
        public bool DropItemsForDeletedMonsters { get; set; }
        public bool MonsterVisibleByDefault { get; set; }
        public bool DisplayMonsterRollResultInChat { get; set; }
        public bool ShowMonsterHealth { get; set; }
        public bool SeeMonsterBuffEffects { get; set; }
        public bool SeeMonsterItems { get; set; }

        public bool IsDeleted { get; set; }
    }
}
