
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs/observable/of';
import * as signalR from "@aspnet/signalr";
import { IChatGroupAdapter } from '../../ng-chat/core/chat-group-adapter';
import { ChatAdapter } from '../../ng-chat/core/chat-adapter';
import { ParticipantResponse } from '../../ng-chat/core/participant-response';
import { Message } from '../../ng-chat/core/message';
import { Group } from '../../ng-chat/core/group';
import { Utilities } from './utilities';
import { EndpointFactory } from './endpoint-factory.service';
import { ConfigurationService } from './configuration.service';
import { User } from '../models/user.model';
import { DBkeys } from './db-keys';
import {  ChatConnection } from '../models/chat.model';
import { LocalStoreManager } from './local-store-manager.service';
import { ServiceUtil } from '../services/service-util';

export class SignalRGroupAdapter extends ChatAdapter implements IChatGroupAdapter {
  public userId: string;

  private hubConnection: signalR.HubConnection
  public static serverBaseUrl: string = ConfigurationService.appbaseUrl + "/"; // Set this to 'https://localhost:5001/' if running locally

 
  constructor(private user: any, private http: HttpClient, private localStorage: LocalStoreManager, private IsRuleset: boolean) {
    super();
    
    this.initializeConnection();
  }

  private initializeConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${SignalRGroupAdapter.serverBaseUrl}groupchat`)
      .build();

    this.hubConnection
      .start()
      .then(() => {
        this.joinRoom(this.IsRuleset);

        this.initializeListeners();
      })
      .catch(err => console.log(`Error while starting SignalR connection: ${err}`));
  }

  private initializeListeners(): void {

    
    this.hubConnection.on("generatedUserId", (userId) => {
      
      // With the userId set the chat will be rendered
      this.userId = userId;
      //let currentUserChatConnections: ChatConnection[] = this.localStorage.getDataObject<ChatConnection[]>(DBkeys.chatConnections);
      //if (!currentUserChatConnections) {
      //  currentUserChatConnections = [];
      //}

      //let characterID = 0;
      //let isRuleset = false;
      //let rulesetID = 0;
      //if (ServiceUtil.IsCurrentlyRulesetOpen(this.localStorage)) {
      //  rulesetID = ServiceUtil.GetCurrentRulesetID(this.localStorage);
      //  isRuleset = true;
      //}
      //else if (ServiceUtil.IsCurrentlyRulesetOpen(this.localStorage) == false) {
      //  characterID = ServiceUtil.GetCurrentCharacterID(this.localStorage);
      //}
      //let currentConnection: ChatConnection = { characterID: characterID, connectionID: userId, isRuleset: isRuleset, rulesetID: rulesetID };
      //if (currentUserChatConnections.filter(x => x.isRuleset == true && x.rulesetID == rulesetID).length && rulesetID) {
      //  currentUserChatConnections=currentUserChatConnections.filter(x => !(x.isRuleset == true && x.rulesetID == rulesetID));
      //}
      //if (currentUserChatConnections.filter(x => x.isRuleset == false && x.characterID == characterID).length && characterID ) {
      //  currentUserChatConnections=currentUserChatConnections.filter(x => !(x.isRuleset == false && x.characterID == characterID));
      //}
      //currentUserChatConnections.push(currentConnection);
      //this.localStorage.saveSyncedSessionData(currentUserChatConnections, DBkeys.chatConnections);
      //this.user.isConnectionIDProvided = true;
    });

    this.hubConnection.on("messageReceived", (participant, message) => {
      // Handle the received message to ng-chat
      //console.log("messageReceived-participant", participant)
      //console.log("messageReceived-message", message)
      this.onMessageReceived(participant, message);
    });

    this.hubConnection.on("friendsListChanged", (participantsResponse: Array<ParticipantResponse>) => {
      // Use polling for the friends list for this simple group example
      // If you want to use push notifications you will have to send filtered messages through your hub instead of using the "All" broadcast channel
      //this.onFriendsListChanged(participantsResponse.filter(x => x.participant.id != this.userId));
    });
  }

  joinRoom(IsRuleset: boolean): void {
    if (this.hubConnection && this.hubConnection.state == signalR.HubConnectionState.Connected) {
      //let currentUserChatConnections: ChatConnection[] = this.localStorage.getDataObject<ChatConnection[]>(DBkeys.chatConnections);
      //if (!currentUserChatConnections) {
      //  currentUserChatConnections = [];
      //}
      //if (IsRuleset) {
      //  if (currentUserChatConnections.filter(x => x.isRuleset == true && x.rulesetID == this.user.campaignID).length) {
      //    this.userId = currentUserChatConnections.filter(x => x.isRuleset == true && x.rulesetID == this.user.campaignID)[0].connectionID;
      //  }
      //}
      //else {
      //  if (currentUserChatConnections.filter(x => x.isRuleset == false && x.characterID == this.user.characterID).length) {
      //    this.userId = currentUserChatConnections.filter(x => x.isRuleset == false && x.characterID == this.user.characterID)[0].connectionID;
      //  }
      //}
      //if (!this.userId) {
      //  this.hubConnection.send("join", this.user);
      //}
      this.hubConnection.send("join", this.user);
      //if (!sessionStorage.getItem(DBkeys.chatConnectionID)) {
        
        //this.user.id = sessionStorage.getItem(DBkeys.chatConnectionID);
       // this.user.isConnectionIDProvided = true;
      //}
      
    }
  }

  listFriends(): Observable<ParticipantResponse[]> {
    // List connected users to show in the friends list
    // Sending the userId from the request body as this is just a demo
    //if (this.localStorage.localStorageGetItem(DBkeys.ChatHttpFailure)) {
    //  this.localStorage.localStorageSetItem(DBkeys.ChatHttpFailure, false);
    //}    
    return this.http
      .post(`${SignalRGroupAdapter.serverBaseUrl}api/chat/listFriends`, { currentUserId: this.userId }, this.getRequestHeaders())
      .pipe(
      map((res: any) => { this.localStorage.localStorageSetItem(DBkeys.ChatHttpFailure, false);return res }),
        catchError((error: any) => Observable.throw(error || 'Server error'))      
      );
  }
  LeaveChat(): Observable<ParticipantResponse[]> {
    this.hubConnection.stop();
    return null;
    //return this.http
    //  .post(`${SignalRGroupAdapter.serverBaseUrl}api/chat/leaveChat`, { currentUserId: this.userId }, this.getRequestHeaders())
    //  .pipe(
    //    map((res: any) => res),
    //    catchError((error: any) => Observable.throw(error || 'Server error'))
    //  );
  }
  getMessageHistory(participant: any): Observable<Message[]> {
    // This could be an API call to your web application that would go to the database
    // and retrieve a N amount of history messages between the users.
    //return of([]);
    return this.http
      .post(`${SignalRGroupAdapter.serverBaseUrl}api/chat/getChatHistory?currentUserID=${this.userId}`, JSON.stringify(participant), this.getRequestHeaders())
      .pipe(
        map((res: any) => res),
        catchError((error: any) => Observable.throw(error || 'Server error'))
      );
  }

  sendMessage(message: Message): void {
    if (this.hubConnection && this.hubConnection.state == signalR.HubConnectionState.Connected)
      //console.log("sendMessage", message);
      this.hubConnection.send("sendMessage", message);
  }

  groupCreated(group: Group): void {
    this.hubConnection.send("groupCreated", group);
  }
  protected getRequestHeaders(): { headers: HttpHeaders | { [header: string]: string | string[]; } } {
    let headers;
    if (Utilities.IsIEorEdge) {
      headers = new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem("access_token"),
        'Content-Type': 'application/json',
        'Accept': `application/vnd.iman.v${EndpointFactory.apiVersion}+json, application/json, text/plain, */*`,
        'App-Version': ConfigurationService.appVersion,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT'
      });
    }
    else {
      headers = new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem("access_token"),
        'Content-Type': 'application/json',
        'Accept': `application/vnd.iman.v${EndpointFactory.apiVersion}+json, application/json, text/plain, */*`,
        'App-Version': ConfigurationService.appVersion
      });
    }


    return { headers: headers };
  }
}
