import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AppService1 {
  removeHighlight: any;


  private accountSetting = new Subject<any>();
  private text = new Subject<any>();
  private character = new Subject<any>();
  private item = new Subject<any>();
  private rulesetDetails = new Subject<any>();
  private images = new Subject<any>();
  private diceRollMessage = new Subject<any>();
  private lootMessage = new Subject<any>();
  private halfScreen = new Subject<any>();
  private CurrentParticipants = new Subject<any>();
  private ToggleChatList = new Subject<any>();
  private AddRemove = new Subject<any>();
  private CharacterSlotsCount = new Subject<any>();
  private TakenByLootMessage = new Subject<any>();
  private LootMessageClicked = new Subject<any>();
  private ChatRemoveIntervals = new Subject<any>();
  private UpdateChatFromCombat = new Subject<any>();
  private OpenChatForCharacter = new Subject<any>();
  private CommandFromCharacterStat = new Subject<any>();
  private CombatStarted = new Subject<any>();
  private OpenChatInNewTab = new Subject<any>();
  private StartChatInNewTab = new Subject<any>();
  private StartChatInPreviousTab = new Subject<any>();
  private SaveLogStat = new Subject<any>();
  private CloseNotificationInterval = new Subject<any>();
  private StartNotificationInterval = new Subject<any>();
  private GetCurrentCharacterStatData = new Subject<any>();
  private ShowIcons = new Subject<any>();
  private GetValuesForNotification = new Subject<any>();
  private HavingParticipant = new Subject<any>();
  private ShowChatBtn = new Subject<any>();
  private ClearChatWindow = new Subject<any>();
  private FilterSearchRecords = new Subject<any>();
  private NewTab = new Subject<any>();
  private CloseCombatChat = new Subject<any>();
  private OpenCombatChat = new Subject<any>();
  private RefreshCombatantDetail = new Subject<any>();
  private RefreshCombatantForChat = new Subject<any>();

  private MonsterForPlayerView = new Subject<any>();
  public objectStore: any;

  isCampaignLoading = new Subject<any>();

  updateAccountSetting1(accountSetting: any) {
    this.accountSetting.next(accountSetting);
  }
  shouldUpdateAccountSetting1(): Observable<any> {
    return this.accountSetting.asObservable();
  }
  updateInvitationlist(accountSetting: any) {
    this.accountSetting.next(accountSetting);
  }
  shouldupdateInvitationlist(): Observable<any> {
    return this.accountSetting.asObservable();
  }
  updateSearchText(text: string) {
    this.text.next(text);
  }
  shouldUpdateSearchText(): Observable<any> {
    return this.text.asObservable();
  }
  updateCharacterList(character: any) {
    this.character.next(character);
  }

  shouldUpdateCharacterList(): Observable<any> {
    return this.character.asObservable();
  }
  updateItemsList(character: any) {
    this.item.next(character);
  }

  shouldUpdateItemsList(): Observable<any> {
    return this.item.asObservable();
  }

  updateImagesList(obj: any) {
    this.images.next(obj);
  }

  shouldUpdateImagesList(): Observable<any> {
    return this.images.asObservable();
  }
  //updateCharactersCount(charactersCount: any) {
  //  this.charactersCount.next(charactersCount);
  //}

  //shouldCharactersCount(): Observable<any> {
  //  return this.charactersCount.asObservable();
  //}
  updateRulesetDetails(rulesetDetails: any) {
    this.rulesetDetails.next(rulesetDetails);
  }
  shouldUpdateRulesetDetails(): Observable<any> {
    return this.rulesetDetails.asObservable();
  }

  updateChatWithDiceRoll(diceRoll: any) {
    this.diceRollMessage.next(diceRoll);
  }
  shouldUpdateChatWithDiceRoll(): Observable<any> {
    return this.diceRollMessage.asObservable();
  }
  updateChatWithLootMessage(data: any) {
    this.lootMessage.next(data);
  }
  shouldUpdateChatWithLootMessage(): Observable<any> {
    return this.lootMessage.asObservable();
  }
  updateChatHalfScreen(data: any) {
    this.halfScreen.next(data);
  }
  shouldUpdateChatHalfScreen(): Observable<any> {
    return this.halfScreen.asObservable();
  }
  updateChatCurrentParticipants(data: any) {
    this.CurrentParticipants.next(data);
  }
  shouldUpdateChatCurrentParticipants(): Observable<any> {
    return this.CurrentParticipants.asObservable();
  }

  updateToggleChatParticipantList(data: any) {
    this.ToggleChatList.next(data);
  }
  shouldUpdateToggleChatParticipantList(): Observable<any> {
    return this.ToggleChatList.asObservable();
  }
  UpdateAddRemove(data: any) {
    this.AddRemove.next(data);
  }
  shouldUpdateAddRemove(): Observable<any> {
    return this.AddRemove.asObservable();
  }
  updateCharacterSlotsCount(data: any) {
    this.CharacterSlotsCount.next(data);
  }

  shouldUpdateCharacterSlotsCount(): Observable<any> {
    return this.CharacterSlotsCount.asObservable();
  }
  updateChatWithTakenByLootMessage(data: any) {
    this.TakenByLootMessage.next(data);
  }
  shouldUpdateChatWithTakenByLootMessage(): Observable<any> {
    return this.TakenByLootMessage.asObservable();
  }
  updateLootMessageClicked(data: any) {
    this.LootMessageClicked.next(data);
  }
  shouldUpdateLootMessageClicked(): Observable<any> {
    return this.LootMessageClicked.asObservable();
  }

  updateChatRemoveIntervals(data: any) {
    this.ChatRemoveIntervals.next(data);
  }
  shouldUpdateChatRemoveIntervals(): Observable<any> {
    return this.ChatRemoveIntervals.asObservable();
  }

  updateChatFromCombat(data: any) {
    this.UpdateChatFromCombat.next(data);
  }
  shouldUpdateChatFromCombat(): Observable<any> {
    return this.UpdateChatFromCombat.asObservable();
  }

  updateOpenChatForCharacter(data: any) {
    this.OpenChatForCharacter.next(data);
  }
  shouldUpdateOpenChatForCharacter(): Observable<any> {
    return this.OpenChatForCharacter.asObservable();
  }

  updateDiceCommandFromCharacterStat(command: any) {
    this.CommandFromCharacterStat.next(command);
  }

  shouldUpdateDiceCommandFromCharacterStat(): Observable<any> {
    return this.CommandFromCharacterStat.asObservable();
  }

  updateCombatStarted(command: any) {
    this.CombatStarted.next(command);
  }

  shouldUpdateCombatStarted(): Observable<any> {
    return this.CombatStarted.asObservable();
  }

  updateOpenChatInNewTab(chat: any) {
    this.OpenChatInNewTab.next(chat);
  }

  shouldUpdateOpenChatInNewTab(): Observable<any> {
    return this.OpenChatInNewTab.asObservable();
  }

  updateStartChatInNewTab(chat: any) {
    this.StartChatInNewTab.next(chat);
  }

  shouldUpdateStartChatInNewTab(): Observable<any> {
    return this.StartChatInNewTab.asObservable();
  }

  updateOpenChatInPreviousTab(chat: any) {
    this.StartChatInPreviousTab.next(chat);
  }

  shouldUpdateOpenChatInPreviousTab(): Observable<any> {
    return this.StartChatInPreviousTab.asObservable();
  }

  updateSaveLogStat(logStat: any) {
    this.SaveLogStat.next(logStat);
  }

  shouldUpdateSaveLogStat(): Observable<any> {
    return this.SaveLogStat.asObservable();
  }

  updatCloseNotificationInterval(notification: any) {
    this.CloseNotificationInterval.next(notification);
  }

  shouldUpdatCloseNotificationInterval(): Observable<any> {
    return this.CloseNotificationInterval.asObservable();
  }

  updateStartNotificationInterval(notification: any) {
    this.StartNotificationInterval.next(notification);
  }

  shouldUpdateStartNotificationInterval(): Observable<any> {
    return this.StartNotificationInterval.asObservable();
  }
  updateMonsterForPlayerView(modal: any) {
    this.MonsterForPlayerView.next(modal);
  }

  shouldUupdateMonsterForPlayerView(): Observable<any> {
    return this.MonsterForPlayerView.asObservable();
  }
  updateGetCurrentCharacterStatData(modal: any) {
    this.GetCurrentCharacterStatData.next(modal);
  }

  shouldUpdateGetCurrentCharacterStatData(): Observable<any> {
    return this.GetCurrentCharacterStatData.asObservable();
  }
  updateShowIcons(modal: any) {
    this.ShowIcons.next(modal);
  }

  shouldUpdateShowIcons(): Observable<any> {
    return this.ShowIcons.asObservable();
  }
  updateGetValuesForNotification(modal: any) {
    this.GetValuesForNotification.next(modal);
  }

  shouldUpdateGetValuesForNotification(): Observable<any> {
    return this.GetValuesForNotification.asObservable();
  }

  updateHavingParticipant(modal: any) {
    this.HavingParticipant.next(modal);
  }

  shouldUpdateHavingParticipant(): Observable<any> {
    return this.HavingParticipant.asObservable();
  }

  updateShowChatBtn(modal: any) {
    this.ShowChatBtn.next(modal);
  }

  shouldUpdateShowChatBtn(): Observable<any> {
    return this.ShowChatBtn.asObservable();
  }

  updateClearChatWindow(modal: any) {
    this.ClearChatWindow.next(modal);
  }

  shouldUpdateClearChatWindow(): Observable<any> {
    return this.ClearChatWindow.asObservable();
  }

  updateFilterSearchRecords(modal: any) {
    this.FilterSearchRecords.next(modal);
  }

  shouldUpdateFilterSearchRecords(): Observable<any> {
    return this.FilterSearchRecords.asObservable();
  }

  updateOpenWindowInNewTab(modal: any) {
    this.NewTab.next(modal);
  }

  shouldUpdateOpenWindowInNewTab(): Observable<any> {
    return this.NewTab.asObservable();
  }

  updateOpenCombatChat(modal: any) {
    this.OpenCombatChat.next(modal);
  }

  shouldUpdateOpenCombatChat(): Observable<any> {
    return this.OpenCombatChat.asObservable();
  }

  updateCloseCombatChat(modal: any) {
    this.CloseCombatChat.next(modal);
  }

  shouldUpdateCloseCombatChat(): Observable<any> {
    return this.CloseCombatChat.asObservable();
  }

  updateCombatantDetailFromChat(modal: any) {
    this.RefreshCombatantDetail.next(modal);
  }

  shouldUpdateCombatantDetailFromChat(): Observable<any> {
    return this.RefreshCombatantDetail.asObservable();
  }

  updateCombatantDetailFromGM(modal: any) {
    this.RefreshCombatantForChat.next(modal);
  }

  shouldUpdateCombatantDetailFromGM(): Observable<any> {
    return this.RefreshCombatantForChat.asObservable();
  }

}

