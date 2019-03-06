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
}
