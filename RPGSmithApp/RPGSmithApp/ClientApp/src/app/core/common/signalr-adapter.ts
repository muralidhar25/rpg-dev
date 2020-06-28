
import { Observable} from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs/observable/of';
import * as signalR from "@aspnet/signalr";
import { ParticipantResponse } from '../../ng-chat/core/participant-response';
import { ChatAdapter } from '../../ng-chat/core/chat-adapter';
import { Message } from '../../ng-chat/core/message';
import { Utilities } from './utilities';
import { EndpointFactory } from './endpoint-factory.service';
import { ConfigurationService } from './configuration.service';
import { AuthService } from '../auth/auth.service';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment.prod';


export class SignalRAdapter extends ChatAdapter {
  public userId: string;

  private hubConnection: signalR.HubConnection
  public static serverBaseUrl: string = ConfigurationService.appbaseUrl + "/"; // Set this to 'https://localhost:5001/' if running locally

  constructor(private user: any, private http: HttpClient) {
    super();

    this.initializeConnection();
  }

  private initializeConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${SignalRAdapter.serverBaseUrl}chat`)
      .build();

    this.hubConnection
      .start()
      .then(() => {
        this.joinRoom();

        this.initializeListeners();
      })
      .catch(err => console.log(`Error while starting SignalR connection: ${err}`));
  }

  private initializeListeners(): void {
    
    this.hubConnection.on("generatedUserId", (userId) => {
      // With the userId set the chat will be rendered
      this.userId = userId;
    });

    this.hubConnection.on("messageReceived", (participant, message) => {
      // Handle the received message to ng-chat
      
      this.onMessageReceived(participant, message);
    });

    this.hubConnection.on("friendsListChanged", (participantsResponse: Array<ParticipantResponse>) => {
      // Handle the received response to ng-chat
      this.onFriendsListChanged(participantsResponse.filter(x => x.participant.id != this.userId));
    });
  }

  joinRoom(): void {
    if (this.hubConnection && this.hubConnection.state == signalR.HubConnectionState.Connected) {
      this.hubConnection.send("join", this.user.userName);
    }
  }

  listFriends(): Observable<ParticipantResponse[]> {
    // List connected users to show in the friends list
    // Sending the userId from the request body as this is just a demo 
    return this.http
      .post(`${SignalRAdapter.serverBaseUrl}api/chat/listFriends`, { currentUserId: this.userId }, this.getRequestHeaders())
      .pipe(
        map((res: any) => res),
        catchError((error: any) => Observable.throw(error.error || 'Server error'))
      );
  }

  getMessageHistory(destinataryId: any): Observable<Message[]> {
    // This could be an API call to your web application that would go to the database
    // and retrieve a N amount of history messages between the users.
    return of([]);
  }
  
  sendMessage(message: Message): void {
    if (this.hubConnection && this.hubConnection.state == signalR.HubConnectionState.Connected)
      this.hubConnection.send("sendMessage", message);
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
