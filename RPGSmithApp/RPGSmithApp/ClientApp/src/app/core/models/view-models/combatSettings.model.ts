export class CombatSettings {
  constructor(
    id?: number,
    combatId?: number,
    pcInitiativeFormula?: string,
    rollInitiativeForPlayer?: boolean,
    rollInitiativeEveryRound?: boolean,
    gameRoundLength?: number,
    xpDistributionforDeletedMonster?: boolean,
    charcterXpStats?: string,
    charcterHealthStats?: string,
    accessMonsterDetails?: boolean,
    groupInitiative?: boolean,
    groupInitFormula?: string,
    dropItemsForDeletedMonsters?: boolean,
    monsterVisibleByDefault?: boolean,
    displayMonsterRollResultInChat?: boolean,
    showMonsterHealth?: boolean,
    seeMonsterBuffEffects?: boolean,
    seeMonsterItems?: boolean,
    showMonsterNameByDefault?: boolean,
  ) {
    this.id = id;
    this.combatId = combatId;
    this.pcInitiativeFormula = pcInitiativeFormula;
    this.rollInitiativeForPlayer = rollInitiativeForPlayer;
    this.rollInitiativeEveryRound = rollInitiativeEveryRound;
    this.gameRoundLength = gameRoundLength;
    this.xpDistributionforDeletedMonster = xpDistributionforDeletedMonster;
    this.charcterXpStats = charcterXpStats;
    this.charcterHealthStats = charcterHealthStats;
    this.accessMonsterDetails = accessMonsterDetails;
    this.groupInitiative = groupInitiative;
    this.groupInitFormula = groupInitFormula;
    this.dropItemsForDeletedMonsters = dropItemsForDeletedMonsters;
    this.monsterVisibleByDefault = monsterVisibleByDefault;
    this.displayMonsterRollResultInChat = displayMonsterRollResultInChat;
    this.showMonsterHealth = showMonsterHealth;
    this.seeMonsterBuffEffects = seeMonsterBuffEffects;
    this.seeMonsterItems = seeMonsterItems;
    this.showMonsterNameByDefault = showMonsterNameByDefault;
  }

  public id: number;  public combatId: number;
  public pcInitiativeFormula: string;
  public rollInitiativeForPlayer: boolean;
  public rollInitiativeEveryRound: boolean;
  public gameRoundLength: number;
  public xpDistributionforDeletedMonster: boolean;
  public charcterXpStats: string;
  public charcterHealthStats: string;
  public accessMonsterDetails: boolean;
  public groupInitiative: boolean;
  public groupInitFormula: string;
  public dropItemsForDeletedMonsters: boolean;
  public monsterVisibleByDefault: boolean;
  public displayMonsterRollResultInChat: boolean;
  public showMonsterHealth: boolean;
  public seeMonsterBuffEffects: boolean;
  public seeMonsterItems: boolean;
  public showMonsterNameByDefault: boolean;
}
