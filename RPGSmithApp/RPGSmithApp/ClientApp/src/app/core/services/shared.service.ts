import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class SharedService {
  removeHighlight: any;

  private ruleset = new Subject<any>();
  private character = new Subject<any>();
  private characterStat = new Subject<any>();
  private rulesetsCount = new Subject<any>();
  private charactersCount = new Subject<any>();
  private itemMaster = new Subject<any>();
  private spellsList = new Subject<any>();
  private abilityList = new Subject<any>();
  private itemsList = new Subject<any>();
  private accountSetting = new Subject<any>();
  private containerItem = new Subject<any>();
  private containsItem = new Subject<any>();
  private dice = new Subject<any>();
  private diceCommand = new Subject<any>();
  private charactersCharacterStats = new Subject<any>();
  private layouts = new Subject<any>();
  private pages = new Subject<any>();
  private customeDice = new Subject<any>();
  private ShareLayout = new Subject<any>();
  private buffAndEffectList = new Subject<any>();
  private Buff = new Subject<any>();
  private MonsterTemplate = new Subject<any>();
  private Monster = new Subject<any>();
  private MonsterDrop = new Subject<any>();
  private MonsterTemplateDetail = new Subject<any>();
  private AddMonsterTemplatesList = new Subject<any>();
  private CombatantList = new Subject<any>();
  private MonsterVisibility = new Subject<any>();
  private diceSaveResult = new Subject<any>();
  private LootList = new Subject<any>();
  private CommandResultForCurrency = new Subject<any>();
  
  
  private MonsterBuffEffect = new Subject<any>();
  private CharacterBuffEffect = new Subject<any>();
  private updateMonstersInCombat = new Subject<any>();
  private EditorCommand = new Subject<any>();


  updateManageOpen(accountSetting: any) {
    this.accountSetting.next(accountSetting);
  }

  useUpdateManageOpen(): Observable<any> {
    return this.accountSetting.asObservable();
  }

  updateAccountSetting(accountSetting: any) {
    this.accountSetting.next(accountSetting);
  }

  shouldUpdateAccountSetting(): Observable<any> {
    return this.accountSetting.asObservable();
  }

  updateRulesetList(ruleset: any) {
    this.ruleset.next(ruleset);
  }

  shouldUpdateRulesetList(): Observable<any> {
    return this.ruleset.asObservable();
  }

  updateRulesetDashboard(page: any) {
    this.pages.next(page);
  }


  shouldUpdateRulesetDashboard(): Observable<any> {
    return this.pages.asObservable();
  }

  updateCharacterList(character: any) {
    this.character.next(character);
  }

  shouldUpdateCharacterList(): Observable<any> {
    return this.character.asObservable();
  }

  updateCharacterStatList(characterStat: any) {
    this.characterStat.next(characterStat);
  }

  shouldUpdateCharacterStattList(): Observable<any> {
    return this.characterStat.asObservable();
  }

  updateRulesetsCount(rulesetsCount: any) {
    this.rulesetsCount.next(rulesetsCount);
  }

  shouldRulesetsCount(): Observable<any> {
    return this.rulesetsCount.asObservable();
  }

  updateCharactersCount(charactersCount: any) {
    this.charactersCount.next(charactersCount);
  }

  shouldCharactersCount(): Observable<any> {
    return this.charactersCount.asObservable();
  }

  updateItemMasterList(itemMaster: any) {
    this.itemMaster.next(itemMaster);
  }

  shouldUpdateItemMasterList(): Observable<any> {
    return this.itemMaster.asObservable();
  }

  updateItemMasterDetailList(itemMaster: any) {
    this.itemMaster.next(itemMaster);
  }

  shouldUpdateItemMasterDetailList(): Observable<any> {
    return this.itemMaster.asObservable();
  }

  updateSpellList(spellsList: any) {
    this.spellsList.next(spellsList);
  }

  shouldUpdateSpellList(): Observable<any> {
    return this.spellsList.asObservable();
  }

  updateAbilityList(abilityList: any) {
    this.abilityList.next(abilityList);
  }

  shouldUpdateAbilityList(): Observable<any> {
    return this.abilityList.asObservable();
  }

  updateItemsList(itemsList: any) {
    this.itemsList.next(itemsList);
  }

  shouldUpdateItemsList(): Observable<any> {
    return this.itemsList.asObservable();
  }

  UpdateCharacterAbilityList(abilityList: any) {
    this.abilityList.next(abilityList);
  }

  shouldUpdateCharacterAbilityList(): Observable<any> {
    return this.abilityList.asObservable();
  }

  UpdateCharacterSpellList(spellsList: any) {
    this.spellsList.next(spellsList);
  }

  shouldUpdateCharacterSpellList(): Observable<any> {
    return this.spellsList.asObservable();
  }

  UpdateContainerItem(containerItem: any) {
    this.containerItem.next(containerItem);
  }

  shouldUpdateContainerItem(): Observable<any> {
    return this.containerItem.asObservable();
  }

  UpdateContainsItem(containsItem: any) {
    this.containerItem.next(containsItem);
  }

  shouldUpdateContainsItem(): Observable<any> {
    return this.containsItem.asObservable();
  }

  UpdateDice(dice: any) {
    this.dice.next(dice);
  }

  shouldUpdateDice(): Observable<any> {
    return this.dice.asObservable();
  }
  setCommandData(diceItem: any) {
    this.diceCommand.next(diceItem);
  }

  getCommandData(): Observable<any> {
    return this.diceCommand.asObservable();
  }

  updateCharactersCharacterStats(characterStats: any) {
    this.charactersCharacterStats.next(characterStats);
  }

  shouldUpdateCharactersCharacterStats(): Observable<any> {
    return this.charactersCharacterStats.asObservable();
  }

  updateCharacterDashboardLayout(layout: any) {
    this.layouts.next(layout);
  }


  shouldUpdateCharacterDashboardLayout(): Observable<any> {
    return this.layouts.asObservable();
  }

  updateCharacterDashboardPage(page: any) {
    this.pages.next(page);
  }


  shouldUpdateCharacterDashboardPage(): Observable<any> {
    return this.pages.asObservable();
  }

  //
  updateRulesetDashboardLayout(layout: any) {
    this.layouts.next(layout);
  }


  shouldUpdateRulesetDashboardLayout(): Observable<any> {
    return this.layouts.asObservable();
  }

  updateRulesetDashboardPage(page: any) {
    this.pages.next(page);
  }

  shouldUpdateRulesetDashboardPage(): Observable<any> {
    return this.pages.asObservable();
  }

  updateCustomeDice(CustomeDice: any) {
    this.pages.next(CustomeDice);
  }

  shouldUpdateCustomeDice(): Observable<any> {
    return this.pages.asObservable();
  }
  updateAddItemMastersList(itemsList: any) {
    this.itemsList.next(itemsList);
  }

  shouldUpdateAddItemMastersList(): Observable<any> {
    return this.itemsList.asObservable();
  }

  updateShareLayout(data: any) {
    this.ShareLayout.next(data);
  }

  shouldUpdateShareLayout(): Observable<any> {
    return this.ShareLayout.asObservable();
  }

  updateBuffAndEffectList(abilityList: any) {
    this.buffAndEffectList.next(abilityList);
  }

  shouldUpdateBuffAndEffectList(): Observable<any> {
    return this.buffAndEffectList.asObservable();
  }
  updateCharactersCharacterStatsBuffs(data: any) {
    this.Buff.next(data);
  }

  shouldUpdateCharactersCharacterStatsBuffs(): Observable<any> {
    return this.Buff.asObservable();
  }

  updateMonsterTemplateList(data: any) {
    this.MonsterTemplate.next(data);
  }

  shouldUpdateMonsterTemplateList(): Observable<any> {
    return this.MonsterTemplate.asObservable();
  }
  updateMonsterList(data: any) {
    this.Monster.next(data);
  }

  shouldUpdateMonsterList(): Observable<any> {
    return this.Monster.asObservable();
  }
  updateDropMonsterList(data: any) {
    this.MonsterDrop.next(data);
  }

  shouldUpdateDropMonsterList(): Observable<any> {
    return this.MonsterDrop.asObservable();
  }
  updateMonsterTemplateDetailList(data: any) {
    this.MonsterTemplateDetail.next(data);
  }

  shouldUpdateMonsterTemplateDetailList(): Observable<any> {
    return this.MonsterTemplateDetail.asObservable();
  }
  updateAddMonsterTemplatesList(itemsList: any) {
    this.AddMonsterTemplatesList.next(itemsList);
  }

  shouldUpdateAddMonsterTemplatesList(): Observable<any> {
    return this.AddMonsterTemplatesList.asObservable();
  }

  updateCombatantList(combatantList: any) {
    this.CombatantList.next(combatantList);
  }

  shouldUpdateCombatantList(): Observable<any> {
    return this.CombatantList.asObservable();
  }

  updateMonsterVisibility(combatantList: any) {
    this.MonsterVisibility.next(combatantList);
  }

  shouldUpdateMonsterVisibility(): Observable<any> {
    return this.MonsterVisibility.asObservable();
  }
  UpdateDiceSaveResults(dice: any) {
    this.diceSaveResult.next(dice);
  }

  shouldUpdateDiceSaveResults(): Observable<any> {
    return this.diceSaveResult.asObservable();
  }

  updateMonsterBuffEffect(combatantList: any) {
    this.MonsterBuffEffect.next(combatantList);
  }

  shouldUpdateMonsterBuffEffect(): Observable<any> {
    return this.MonsterBuffEffect.asObservable();
  }

  updateCharacterBuffEffect(combatantList: any) {
    this.CharacterBuffEffect.next(combatantList);
  }

  shouldUpdateCharacterBuffEffect(): Observable<any> {
    return this.CharacterBuffEffect.asObservable();
  }

  updateCombatantListForAddDeleteMonsters(combatantListFlag: any, selectedDeployedMonsters: any=undefined) {
    let result = { flag: combatantListFlag, selectedDeployedMonsters: selectedDeployedMonsters}
    this.updateMonstersInCombat.next(result);
  }

  shouldUpdateCombatantListForAddDeleteMonsters(): Observable<any> {
    return this.updateMonstersInCombat.asObservable();
  }

  updateEditorCommand(command: any) {
    this.EditorCommand.next(command);
  }

  shouldUpdateEditorCommand(): Observable<any> {
    return this.EditorCommand.asObservable();
  }

  updateLootList(loot: any) {
    this.LootList.next(loot);
  }

  shouldUpdateLootList(): Observable<any> {
    return this.LootList.asObservable();
  }


  setCommandResultForCurrency(diceItem: any) {
    this.CommandResultForCurrency.next(diceItem);
  }

  getCommandResultForCurrency(): Observable<any> {
    return this.CommandResultForCurrency.asObservable();
  }
  

  
}

