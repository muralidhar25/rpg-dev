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
    itemFilters?: ItemFilter, spellFilters?: SpellFilter, abilityFilters?: AbilityFilter, everything?: EverythingFilter) {
    this.searchHeadingText = searchHeadingText ? searchHeadingText : '';
    this.searchType = searchType ? searchType : 0;
    this.searchString = searchString ? searchString : '';
    this.characterID = characterID ? characterID : 0;
    this.rulesetID = rulesetID ? rulesetID : 0;
    this.itemFilters = itemFilters ? itemFilters : new ItemFilter();
    this.spellFilters = spellFilters ? spellFilters : new SpellFilter();
    this.abilityFilters = abilityFilters ? abilityFilters : new AbilityFilter();
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
}
export class ItemFilter {
  constructor(isItemName?: boolean, isItemTags?: boolean, isItemStats?: boolean, isItemDesc?: boolean, isItemRarity?: boolean,
    isItemSpellAssociated?: boolean, isItemAbilityAssociated?: boolean) {

    this.isItemName = isItemName ? isItemName : false;
    this.isItemTags = isItemTags ? isItemTags : false;
    this.isItemStats = isItemStats ? isItemStats : false;
    this.isItemDesc = isItemDesc ? isItemDesc : false;
    this.isItemRarity = isItemRarity ? isItemRarity : false;
    this.isItemSpellAssociated = isItemSpellAssociated ? isItemSpellAssociated : false;
    this.isItemAbilityAssociated = isItemAbilityAssociated ? isItemAbilityAssociated : false;

  }

  public isItemName: boolean;
  public isItemTags: boolean;
  public isItemStats: boolean;
  public isItemDesc: boolean;
  public isItemRarity: boolean;
  public isItemSpellAssociated: boolean;
  public isItemAbilityAssociated: boolean;
}
export class SpellFilter {
  constructor(isSpellName?: boolean, isSpellTags?: boolean, isSpellStats?: boolean, isSpellDesc?: boolean, isSpellClass?: boolean,
    isSpellSchool?: boolean, isSpellLevel?: boolean, isSpellCastingTime?: boolean, isSpellEffectDesc?: boolean, isSpellHitEffect?: boolean,
    isSpellMissEffect?: boolean) {
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
}
export class AbilityFilter {
  constructor(isAbilityName?: boolean, isAbilityTags?: boolean, isAbilityStats?: boolean, isAbilityDesc?: boolean, isAbilityLevel?: boolean) {

    this.isAbilityName = isAbilityName ? isAbilityName : false;
    this.isAbilityTags = isAbilityTags ? isAbilityTags : false;
    this.isAbilityStats = isAbilityStats ? isAbilityStats : false;
    this.isAbilityDesc = isAbilityDesc ? isAbilityDesc : false;
    this.isAbilityLevel = isAbilityLevel ? isAbilityLevel : false;
  }

  public isAbilityName: boolean;
  public isAbilityTags: boolean;
  public isAbilityStats: boolean;
  public isAbilityDesc: boolean;
  public isAbilityLevel: boolean;
}

export class EverythingFilter {
  constructor(isEverythingName?: boolean, isEverythingTags?: boolean, isEverythingStats?: boolean, isEverythingDesc?: boolean) {

    this.isEverythingName = isEverythingName ? isEverythingName : false;
    this.isEverythingTags = isEverythingTags ? isEverythingTags : false;
    this.isEverythingStats = isEverythingStats ? isEverythingStats : false;
    this.isEverythingDesc = isEverythingDesc ? isEverythingDesc : false;
    
  }

  public isEverythingName: boolean;
  public isEverythingTags: boolean;
  public isEverythingStats: boolean;
  public isEverythingDesc: boolean;
  
}
