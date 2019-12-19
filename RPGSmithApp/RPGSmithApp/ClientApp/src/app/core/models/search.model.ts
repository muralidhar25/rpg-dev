// ====================================================
// Account settings modal
// ====================================================

export class Search {
    constructor(searchText?: string, filterText?: string) {
        this.searchText = searchText;
        this.filterText = filterText;
        
    }

    public searchText: string;
    public filterText: string;
   

}

export class BasicSearch {
  constructor(searchHeadingText?: string, searchType?: number, searchString?: string, characterID?: number, rulesetID?: number,
    itemFilters?: ItemFilter, spellFilters?: SpellFilter, abilityFilters?: AbilityFilter, everything?: EverythingFilter,
    buffAndEffectFilters?: BuffAndEffectFilter, monsterFilters?: MonsterFilter, lootFilters?: LootFilter, handoutFilters?: HandoutFilter) {
    this.searchHeadingText = searchHeadingText ? searchHeadingText : '';
    this.searchType = searchType ? searchType : 0;
    this.searchString = searchString ? searchString : '';
    this.characterID = characterID ? characterID : 0;
    this.rulesetID = rulesetID ? rulesetID : 0;
    this.itemFilters = itemFilters ? itemFilters : new ItemFilter();
    this.spellFilters = spellFilters ? spellFilters : new SpellFilter();
    this.abilityFilters = abilityFilters ? abilityFilters : new AbilityFilter();
    this.buffAndEffectFilters = buffAndEffectFilters ? buffAndEffectFilters : new BuffAndEffectFilter();
    this.monsterFilters = monsterFilters ? monsterFilters : new MonsterFilter();
    this.lootFilters = lootFilters ? lootFilters : new LootFilter();
    this.handoutFilters = handoutFilters ? handoutFilters : new HandoutFilter();
    this.everythingFilters = everything ? everything : new EverythingFilter();
  }
  public searchHeadingText: string;
  public searchType: number;
  public searchString: string;
  public characterID: number;
  public rulesetID: number;
  public itemFilters: ItemFilter;
  public spellFilters: SpellFilter;
  public abilityFilters: AbilityFilter;
  public everythingFilters: EverythingFilter;
  public buffAndEffectFilters :BuffAndEffectFilter;
  public monsterFilters:MonsterFilter;
  public lootFilters :LootFilter;
  public handoutFilters: HandoutFilter;
}
export class ItemFilter {
  constructor(isItemName?: boolean, isItemTags?: boolean, isItemStats?: boolean, isItemDesc?: boolean, isItemRarity?: boolean,
    isItemSpellAssociated?: boolean, isItemAbilityAssociated?: boolean, isGMOnly?: boolean) {

    this.isItemName = isItemName ? isItemName : false;
    this.isItemTags = isItemTags ? isItemTags : false;
    this.isItemStats = isItemStats ? isItemStats : false;
    this.isItemDesc = isItemDesc ? isItemDesc : false;
    this.isItemRarity = isItemRarity ? isItemRarity : false;
    this.isItemSpellAssociated = isItemSpellAssociated ? isItemSpellAssociated : false;
    this.isItemAbilityAssociated = isItemAbilityAssociated ? isItemAbilityAssociated : false;
    this.isGMOnly = isGMOnly ? isGMOnly : false;

  }

  public isItemName: boolean;
  public isItemTags: boolean;
  public isItemStats: boolean;
  public isItemDesc: boolean;
  public isItemRarity: boolean;
  public isItemSpellAssociated: boolean;
  public isItemAbilityAssociated: boolean;
  public isGMOnly: boolean;
}
export class SpellFilter {
  constructor(isSpellName?: boolean, isSpellTags?: boolean, isSpellStats?: boolean, isSpellDesc?: boolean, isSpellClass?: boolean,
    isSpellSchool?: boolean, isSpellLevel?: boolean, isSpellCastingTime?: boolean, isSpellEffectDesc?: boolean, isSpellHitEffect?: boolean,
    isSpellMissEffect?: boolean, isGMOnly?: boolean) {
    this.isSpellName = isSpellName ? isSpellName : false;
    this.isSpellTags = isSpellTags ? isSpellTags : false;
    this.isSpellStats = isSpellStats ? isSpellStats : false;
    this.isSpellDesc = isSpellDesc ? isSpellDesc : false;
    this.isSpellClass = isSpellClass ? isSpellClass : false;
    this.isSpellSchool = isSpellSchool ? isSpellSchool : false;
    this.isSpellLevel = isSpellLevel ? isSpellLevel : false;
    this.isSpellCastingTime = isSpellCastingTime ? isSpellCastingTime : false;
    this.isSpellEffectDesc = isSpellEffectDesc ? isSpellEffectDesc : false;
    this.isSpellHitEffect = isSpellHitEffect ? isSpellHitEffect : false;
    this.isSpellMissEffect = isSpellMissEffect ? isSpellMissEffect : false;
    this.isGMOnly = isGMOnly ? isGMOnly : false;

  }

  public isSpellName: boolean;
  public isSpellTags: boolean;
  public isSpellStats: boolean;
  public isSpellDesc: boolean;
  public isSpellClass: boolean;
  public isSpellSchool: boolean;
  public isSpellLevel: boolean;
  public isSpellCastingTime: boolean;
  public isSpellEffectDesc: boolean;
  public isSpellHitEffect: boolean;
  public isSpellMissEffect: boolean;
  public isGMOnly: boolean;
}
export class AbilityFilter {
  constructor(isAbilityName?: boolean, isAbilityTags?: boolean, isAbilityStats?: boolean, isAbilityDesc?: boolean, isAbilityLevel?: boolean, isGMOnly?: boolean) {

    this.isAbilityName = isAbilityName ? isAbilityName : false;
    this.isAbilityTags = isAbilityTags ? isAbilityTags : false;
    this.isAbilityStats = isAbilityStats ? isAbilityStats : false;
    this.isAbilityDesc = isAbilityDesc ? isAbilityDesc : false;
    this.isAbilityLevel = isAbilityLevel ? isAbilityLevel : false;
    this.isGMOnly = isGMOnly ? isGMOnly : false;
  }

  public isAbilityName: boolean;
  public isAbilityTags: boolean;
  public isAbilityStats: boolean;
  public isAbilityDesc: boolean;
  public isAbilityLevel: boolean;
  public isGMOnly: boolean;
}
export class BuffAndEffectFilter {
  constructor(isBuffAndEffectName?: boolean, isBuffAndEffectTags?: boolean, isBuffAndEffectStats?: boolean, isBuffAndEffectDesc?: boolean, isGMOnly?: boolean) {

    this.isBuffAndEffectName = isBuffAndEffectName ? isBuffAndEffectName : false;
    this.isBuffAndEffectTags = isBuffAndEffectTags ? isBuffAndEffectTags : false;
    this.isBuffAndEffectStats = isBuffAndEffectStats ? isBuffAndEffectStats : false;
    this.isBuffAndEffectDesc = isBuffAndEffectDesc ? isBuffAndEffectDesc : false;
    this.isGMOnly = isGMOnly ? isGMOnly : false;
  }

  public isBuffAndEffectName: boolean;
  public isBuffAndEffectTags: boolean;
  public isBuffAndEffectStats: boolean;
  public isBuffAndEffectDesc: boolean;
  public isGMOnly: boolean;
}
export class LootFilter {
  constructor(isLootName?: boolean, isLootTags?: boolean, isLootStats?: boolean, isLootDesc?: boolean,
    isLootRarity?: boolean, isLootItemAssociated?: boolean, isLootSpellAssociated?: boolean, isLootAbilityAssociated?: boolean, isGMOnly?: boolean) {

    this.isLootName = isLootName ? isLootName : false;
    this.isLootTags = isLootTags ? isLootTags : false;
    this.isLootStats = isLootStats ? isLootStats : false;
    this.isLootDesc = isLootDesc ? isLootDesc : false;

    this.isLootRarity = isLootRarity ? isLootRarity : false;
    this.isLootItemAssociated = isLootItemAssociated ? isLootItemAssociated : false;
    this.isLootSpellAssociated = isLootSpellAssociated ? isLootSpellAssociated : false;
    this.isLootAbilityAssociated = isLootAbilityAssociated ? isLootAbilityAssociated : false;    
    this.isGMOnly = isGMOnly ? isGMOnly : false;    

  }

  public isLootName: boolean;
  public isLootTags: boolean;
  public isLootStats: boolean;
  public isLootDesc: boolean;

  public isLootRarity: boolean;
  public isLootItemAssociated: boolean;
  public isLootSpellAssociated: boolean;
  public isLootAbilityAssociated: boolean;
  public isGMOnly: boolean;
  
}
export class MonsterFilter {
  constructor(isMonsterName?: boolean, isMonsterTags?: boolean, isMonsterStats?: boolean, isMonsterDesc?: boolean,
    isMonsterHealth?: boolean, isMonsterAC?: boolean, isMonsterChallengeRating?: boolean, isMonsterXPValue?: boolean,
    isMonsterItemAssociated?: boolean, isMonsterSpellAssociated?: boolean, isMonsterBEAssociated?: boolean, isMonsterAbilityAssociated?: boolean, isGMOnly?: boolean) {

    this.isMonsterName = isMonsterName ? isMonsterName : false;
    this.isMonsterTags = isMonsterTags ? isMonsterTags : false;
    this.isMonsterStats = isMonsterStats ? isMonsterStats : false;
    this.isMonsterDesc = isMonsterDesc ? isMonsterDesc : false;

    this.isMonsterHealth = isMonsterHealth ? isMonsterHealth : false;
    this.isMonsterAC = isMonsterAC ? isMonsterAC : false;
    this.isMonsterChallengeRating = isMonsterChallengeRating ? isMonsterChallengeRating : false;
    this.isMonsterXPValue = isMonsterXPValue ? isMonsterXPValue : false;
    this.isMonsterItemAssociated = isMonsterItemAssociated ? isMonsterItemAssociated : false;
    this.isMonsterSpellAssociated = isMonsterSpellAssociated ? isMonsterSpellAssociated : false;
    this.isMonsterBEAssociated = isMonsterBEAssociated ? isMonsterBEAssociated : false;
    this.isMonsterAbilityAssociated = isMonsterAbilityAssociated ? isMonsterAbilityAssociated : false;
    this.isGMOnly = isGMOnly ? isGMOnly : false;


  }

  public isMonsterName: boolean;
  public isMonsterTags: boolean;
  public isMonsterStats: boolean;
  public isMonsterDesc: boolean;

  public isMonsterHealth: boolean;
  public isMonsterAC: boolean;
  public isMonsterChallengeRating: boolean;
  public isMonsterXPValue: boolean;
  public isMonsterItemAssociated: boolean;
  public isMonsterSpellAssociated: boolean;
  public isMonsterBEAssociated: boolean;
  public isMonsterAbilityAssociated: boolean;
  public isGMOnly: boolean;

}
export class HandoutFilter {
  constructor(isHandoutName?: boolean, isHandoutFileType?: boolean) {

    this.isHandoutName = isHandoutName ? isHandoutName : false;
    this.isHandoutFileType = isHandoutFileType ? isHandoutFileType : false;
  }
  public isHandoutName: boolean;
  public isHandoutFileType: boolean;
}

export class EverythingFilter {
  constructor(isEverythingName?: boolean, isEverythingTags?: boolean, isEverythingStats?: boolean, isEverythingDesc?: boolean, isGMOnly?: boolean) {

    this.isEverythingName = isEverythingName ? isEverythingName : false;
    this.isEverythingTags = isEverythingTags ? isEverythingTags : false;
    this.isEverythingStats = isEverythingStats ? isEverythingStats : false;
    this.isEverythingDesc = isEverythingDesc ? isEverythingDesc : false;
    this.isGMOnly = isGMOnly ? isGMOnly : false;
    
  }

  public isEverythingName: boolean;
  public isEverythingTags: boolean;
  public isEverythingStats: boolean;
  public isEverythingDesc: boolean;
  public isGMOnly: boolean;
  
}
