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
}

