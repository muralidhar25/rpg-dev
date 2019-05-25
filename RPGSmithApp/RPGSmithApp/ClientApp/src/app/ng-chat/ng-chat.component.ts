import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { ChatAdapter } from './core/chat-adapter';
import { IChatController } from './core/chat-controller';
import { IChatGroupAdapter } from './core/chat-group-adapter';
import { IChatOption } from './core/chat-option';
import { IChatParticipant } from "./core/chat-participant";
import { ChatParticipantStatus } from "./core/chat-participant-status.enum";
import { ChatParticipantType } from "./core/chat-participant-type.enum";
import { DefaultFileUploadAdapter } from './core/default-file-upload-adapter';
import { IFileUploadAdapter } from './core/file-upload-adapter';
import { Group } from "./core/group";
import { Localization, StatusDescription } from './core/localization';
import { Message } from "./core/message";
import { MessageType } from "./core/message-type.enum";
import { PagedHistoryChatAdapter } from './core/paged-history-chat-adapter';
import { ParticipantResponse } from "./core/participant-response";
import { ScrollDirection } from "./core/scroll-direction.enum";
import { Theme } from './core/theme.enum';
import { User } from "./core/user";
import { Window } from "./core/window";
import { LocalStoreManager } from '../core/common/local-store-manager.service';
import { ServiceUtil } from '../core/services/service-util';
import { DBkeys } from '../core/common/db-keys';
import { Ruleset } from '../core/models/view-models/ruleset.model';
import { AppService1 } from '../app.service';
import { CharacterCommand } from '../core/models/view-models/character-command.model';
import { Router } from '@angular/router';



@Component({
  selector: 'ng-chat',
  templateUrl: 'ng-chat.component.html',
  styleUrls: [
    'assets/icons.css',
    'assets/loading-spinner.css',
    'assets/ng-chat.component.default.css',
    'assets/themes/ng-chat.theme.default.scss',
    'assets/themes/ng-chat.theme.dark.scss'
  ],
  encapsulation: ViewEncapsulation.None
})

export class NgChat implements OnInit, IChatController {
  constructor(public sanitizer: DomSanitizer, private _httpClient: HttpClient, private localStorage: LocalStoreManager, private appService: AppService1, private router: Router) {
    this.appService.shouldUpdateChatWithDiceRoll().subscribe((serviceData) => {
      if (serviceData) {
        this.sendDiceRolledToChatGroup(serviceData);
      }
    });
    this.appService.shouldUpdateChatWithLootMessage().subscribe((serviceData) => {
      if (serviceData) {
        this.sendLootMessageToChatGroup();
      }
    });

    this.appService.shouldUpdateToggleChatParticipantList().subscribe((serviceData) => {
      if (serviceData) {
        this.isCollapsed = serviceData;
      }
    });
  }

  // Exposes enums for the ng-template
  public ChatParticipantType = ChatParticipantType;
  public ChatParticipantStatus = ChatParticipantStatus;
  public MessageType = MessageType;
  IsDefaultGroupCreated: boolean = false;
  ruleset: Ruleset = this.localStorage.localStorageGetItem(DBkeys.rulesetforChat);
  @Input()
  public adapter: ChatAdapter;

  @Input()
  public groupAdapter: IChatGroupAdapter;

  @Input()
  public userId: any;

  @Input()
  public isCollapsed: boolean = false;

  @Input()
  public maximizeWindowOnNewMessage: boolean = true;

  @Input()
  public pollFriendsList: boolean = false;

  @Input()
  public pollingInterval: number = 5000;

  @Input()
  public historyEnabled: boolean = true;

  @Input()
  public emojisEnabled: boolean = true;

  @Input()
  public linkfyEnabled: boolean = true;

  @Input()
  public audioEnabled: boolean = true;

  @Input()
  public searchEnabled: boolean = true;

  @Input() // TODO: This might need a better content strategy
  public audioSource: string = 'https://raw.githubusercontent.com/rpaschoal/ng-chat/master/src/ng-chat/assets/notification.wav';

  @Input()
  public persistWindowsState: boolean = true;

  @Input()
  public title: string = this.ruleset ? this.ruleset.ruleSetName : "";

  @Input()
  public messagePlaceholder: string = "Type a message";

  @Input()
  public searchPlaceholder: string = "Search";

  @Input()
  public browserNotificationsEnabled: boolean = true;

  @Input() // TODO: This might need a better content strategy
  public browserNotificationIconSource: string = 'https://raw.githubusercontent.com/rpaschoal/ng-chat/master/src/ng-chat/assets/notification.png';

  @Input()
  public browserNotificationTitle: string = "New message from";

  @Input()
  public historyPageSize: number = 10;

  @Input()
  public localization: Localization;

  @Input()
  public hideFriendsList: boolean = false;

  @Input()
  public hideFriendsListOnUnsupportedViewport: boolean = true;

  @Input()
  public fileUploadUrl: string;

  @Input()
  public theme: Theme = Theme.Dark;

  @Input()
  public customTheme: string;

  @Input()
  public messageDatePipeFormat: string = "short";

  @Input()
  public showMessageDate: boolean = true;

  @Output()
  public onParticipantClicked: EventEmitter<IChatParticipant> = new EventEmitter<IChatParticipant>();

  @Output()
  public onParticipantChatOpened: EventEmitter<IChatParticipant> = new EventEmitter<IChatParticipant>();

  @Output()
  public onParticipantChatClosed: EventEmitter<IChatParticipant> = new EventEmitter<IChatParticipant>();

  @Output()
  public onMessagesSeen: EventEmitter<Message[]> = new EventEmitter<Message[]>();

  private browserNotificationsBootstrapped: boolean = false;

  public hasPagedHistory: boolean = false;

  // Don't want to add this as a setting to simplify usage. Previous placeholder and title settings available to be used, or use full Localization object.
  private statusDescription: StatusDescription = {
    online: 'Online',
    busy: 'Busy',
    away: 'Away',
    offline: 'Offline'
  };

  private audioFile: HTMLAudioElement;

  public searchInput: string = '';

  protected participants: IChatParticipant[];

  protected participantsResponse: ParticipantResponse[];

  private participantsInteractedWith: IChatParticipant[] = [];

  public currentActiveOption: IChatOption | null;

  protected selectedUsersFromFriendsList: User[] = [];

  public defaultWindowOptions(currentWindow: Window): IChatOption[] {
    if (this.groupAdapter && currentWindow.participant.participantType == ChatParticipantType.User) {
      return [{
        isActive: false,
        action: (chattingWindow: Window) => {

          this.selectedUsersFromFriendsList = this.selectedUsersFromFriendsList.concat(chattingWindow.participant as User);
        },
        validateContext: (participant: IChatParticipant) => {
          return participant.participantType == ChatParticipantType.User;
        },
        displayLabel: 'Add People' // TODO: Localize this
      }];
    }

    return [];
  }

  private get localStorageKey(): string {
    return `ng-chat-users-${this.userId}`; // Appending the user id so the state is unique per user in a computer.   
  };

  get filteredParticipants(): IChatParticipant[] {
    //console.log("this.participants", this.participants)
    this.participants = this.filterCampaignParticipants(this.participants)
    if (this.searchInput.length > 0) {
      // Searches in the friend list by the inputted search string
      return this.participants.filter(x => x.displayName.toUpperCase().includes(this.searchInput.toUpperCase()));
    }

    return this.participants;
  }

  filterCampaignParticipants(participants) {
    //debugger
    //console.log("participants-1", participants)
    //  let user = this.localStorage.getDataObject<any>(DBkeys.CURRENT_USER);
    let rulesetID = ServiceUtil.CurrentCharacters_RulesetID(this.localStorage);
    if (participants) {
      if (participants.length) {
        //let IsCharacter: boolean = false;
        //let IsRuleset: boolean = false;
        //let headers = this.localStorage.getDataObject<HeaderValues>(DBkeys.HEADER_VALUE);
        //if (headers) {
        //  if (headers.headerLink == 'ruleset') {
        //    IsRuleset = true;
        //  }
        //  else if (headers.headerLink == 'character') {
        //    IsCharacter = true;
        //  }
        //}
        let currentParticipantList = [];

        if (ServiceUtil.IsCurrentlyRulesetOpen(this.localStorage) == true) {
          //debugger
          currentParticipantList = participants.filter(x => x.characterCampaignID == rulesetID || (x.chattingTo && (x.campaignID == rulesetID || x.characterCampaignID == rulesetID)));
          participants = currentParticipantList;

          //if (participants.length && !this.IsDefaultGroupCreated) {
          //  this.selectedUsersFromFriendsList = [];
          //  participants.map((p) => {
          //    this.selectedUsersFromFriendsList.push(p);
          //  })

          //  this.onFriendsListActionConfirmClicked("Everyone", this.ruleset.imageUrl);
          //  this.IsDefaultGroupCreated = true;

          //}


        }
        else if (ServiceUtil.IsCurrentlyRulesetOpen(this.localStorage) == false) {
          //debugger
          let characterid = ServiceUtil.GetCurrentCharacterID(this.localStorage)
          currentParticipantList = participants.filter(x => (x.characterCampaignID == rulesetID || x.campaignID == rulesetID) || (!x.chattingTo && (x.campaignID == rulesetID || x.characterID == rulesetID)))
          participants = currentParticipantList;

          //if (participants.length && !this.IsDefaultGroupCreated) {
          //  this.selectedUsersFromFriendsList = [];
          //  participants.map((p) => {
          //    this.selectedUsersFromFriendsList.push(p);
          //  })
          //  this.onFriendsListActionConfirmClicked("Everyone", this.ruleset.imageUrl);
          //  this.IsDefaultGroupCreated = true;

          //}
        }
        else {
          participants = [];
        }
        //debugger
        let everyoneList = participants.filter(x => x.chattingTo)
        if (everyoneList.length) {
          participants = participants.filter(x => !x.chattingTo)
          participants.push(everyoneList[everyoneList.length - 1])
        }

        everyoneList = participants.filter(x => x.chattingTo)
        let newparticipants = everyoneList;

        //if (participants.filter(x => x.campaignID && !x.characterCampaignID && !x.characterID).length) {
        //  let GMParticipant = participants.filter(x => x.campaignID && !x.characterCampaignID && !x.characterID)[0];
        //  GMParticipant.displayName = GMParticipant.displayName + " (GM)";
        //  newparticipants.push(GMParticipant);
        //}
        //participants = participants.sort((a, b) =>
        //{
        //  var textA = a.displayName.toUpperCase();
        //  var textB = b.displayName.toUpperCase();
        //  return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        //})
        participants.map((x) => {
          if (!x.chattingTo) {
            newparticipants.push(x);
          }
        })
        participants = newparticipants;

        if (participants.length && !this.IsDefaultGroupCreated) {
          this.selectedUsersFromFriendsList = [];
          participants.map((p) => {
            this.selectedUsersFromFriendsList.push(p);
          })

          this.onFriendsListActionConfirmClicked("Everyone", this.ruleset.imageUrl);
          this.IsDefaultGroupCreated = true;

        }
        //console.log("participants", participants)
      }
    }

    //console.log("participants-final",participants)
    this.appService.updateChatCurrentParticipants(participants);
    return participants;
  }
  // Defines the size of each opened window to calculate how many windows can be opened on the viewport at the same time.
  public windowSizeFactor: number = 320;

  // Total width size of the friends list section
  public friendsListWidth: number = 262;

  // Available area to render the plugin
  private viewPortTotalArea: number;

  // Set to true if there is no space to display at least one chat window and 'hideFriendsListOnUnsupportedViewport' is true
  public unsupportedViewport: boolean = false;

  // File upload state
  public isUploadingFile = false;
  public fileUploadAdapter: IFileUploadAdapter;

  windows: Window[] = [];

  isBootstrapped: boolean = false;

  @ViewChildren('chatMessages') chatMessageClusters: any;

  @ViewChildren('chatWindowInput') chatWindowInputs: any;

  @ViewChild('nativeFileInput') nativeFileInput: ElementRef;

  ngOnInit() {
    console.log('Here chat is working');
    this.bootstrapChat();    
    if (this.router.url.toLowerCase().indexOf("character/tiles") > -1 || this.router.url.toLowerCase().indexOf("ruleset/dashboard") > -1) {
      this.isCollapsed = true;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.viewPortTotalArea = event.target.innerWidth;

    this.NormalizeWindows();
  }

  // Checks if there are more opened windows than the view port can display
  private NormalizeWindows(): void {
    let maxSupportedOpenedWindows = Math.ceil((this.viewPortTotalArea - (!this.hideFriendsList ? this.friendsListWidth : 0)) / this.windowSizeFactor);
    let difference = this.windows.length - maxSupportedOpenedWindows;

    if (difference >= 0) {
      this.windows.splice(this.windows.length - difference);
    }

    this.updateWindowsState(this.windows);

    // Viewport should have space for at least one chat window.
    this.unsupportedViewport = this.hideFriendsListOnUnsupportedViewport && maxSupportedOpenedWindows < 1;
  }

  // Initializes the chat plugin and the messaging adapter
  private bootstrapChat(): void {
    let initializationException = null;

    if (this.adapter != null && this.userId != null) {
      try {
        this.viewPortTotalArea = window.innerWidth;

        this.initializeTheme();
        this.initializeDefaultText();
        this.initializeBrowserNotifications();

        // Binding event listeners
        this.adapter.messageReceivedHandler = (participant, msg) => this.onMessageReceived(participant, msg);
        this.adapter.friendsListChangedHandler = (participantsResponse) => this.onFriendsListChanged(participantsResponse);

        // Loading current users list
        if (this.pollFriendsList) {
          // Setting a long poll interval to update the friends list
          this.fetchFriendsList(true);
          setInterval(() => this.fetchFriendsList(false), this.pollingInterval);
        }
        else {
          // Since polling was disabled, a friends list update mechanism will have to be implemented in the ChatAdapter.
          this.fetchFriendsList(true);
        }

        this.bufferAudioFile();

        this.hasPagedHistory = this.adapter instanceof PagedHistoryChatAdapter;

        if (this.fileUploadUrl && this.fileUploadUrl !== "") {
          this.fileUploadAdapter = new DefaultFileUploadAdapter(this.fileUploadUrl, this._httpClient);
        }

        this.isBootstrapped = true;
      }
      catch (ex) {
        initializationException = ex;
      }
    }

    if (!this.isBootstrapped) {
      console.error("ng-chat component couldn't be bootstrapped.");

      if (this.userId == null) {
        console.error("ng-chat can't be initialized without an user id. Please make sure you've provided an userId as a parameter of the ng-chat component.");
      }
      if (this.adapter == null) {
        console.error("ng-chat can't be bootstrapped without a ChatAdapter. Please make sure you've provided a ChatAdapter implementation as a parameter of the ng-chat component.");
      }
      if (initializationException) {
        console.error(`An exception has occurred while initializing ng-chat. Details: ${initializationException.message}`);
        console.error(initializationException);
      }
    }
  }

  // Initializes browser notifications
  private async initializeBrowserNotifications() {
    if (this.browserNotificationsEnabled && ("Notification" in window)) {
      if (await Notification.requestPermission()) {
        this.browserNotificationsBootstrapped = true;
      }
    }
  }

  // Initializes default text
  private initializeDefaultText(): void {
    if (!this.localization) {
      this.localization = {
        messagePlaceholder: this.messagePlaceholder,
        searchPlaceholder: this.searchPlaceholder,
        title: this.title,
        statusDescription: this.statusDescription,
        browserNotificationTitle: this.browserNotificationTitle,
        loadMessageHistoryPlaceholder: "Load older messages"
      };
    }
  }

  private initializeTheme(): void {
    if (this.customTheme) {
      this.theme = Theme.Custom;
    }
    else if (this.theme != Theme.Light && this.theme != Theme.Dark) {
      // TODO: Use es2017 in future with Object.values(Theme).includes(this.theme) to do this check
      throw new Error(`Invalid theme configuration for ng-chat. "${this.theme}" is not a valid theme value.`);
    }
  }

  // Sends a request to load the friends list
  private fetchFriendsList(isBootstrapping: boolean): void {
    this.adapter.listFriends()
      .pipe(
        map((participantsResponse: ParticipantResponse[]) => {
          this.participantsResponse = participantsResponse;

          this.participants = participantsResponse.map((response: ParticipantResponse) => {
            return response.participant;
          });
        })
      ).subscribe(() => {
        if (isBootstrapping) {
          this.restoreWindowsState();
        }
      });
  }

  fetchMessageHistory(window: Window) {
    debugger
    //// Not ideal but will keep this until we decide if we are shipping pagination with the default adapter
    //if (this.adapter instanceof PagedHistoryChatAdapter)
    //{
    //    window.isLoadingHistory = true;

    //    this.adapter.getMessageHistoryByPage(window.participant.id, this.historyPageSize, ++window.historyPage)
    //    .pipe(
    //        map((result: Message[]) => {
    //            result.forEach((message) => this.assertMessageType(message));

    //            window.messages = result.concat(window.messages);
    //            window.isLoadingHistory = false;

    //            const direction: ScrollDirection = (window.historyPage == 1) ? ScrollDirection.Bottom : ScrollDirection.Top;
    //            window.hasMoreMessages = result.length == this.historyPageSize;

    //            setTimeout(() => this.onFetchMessageHistoryLoaded(result, window, direction, true));
    //        })
    //    ).subscribe();
    //}
    //else
    //{
    //  this.adapter.getMessageHistory(window.participant.id)
    //    .pipe(
    //        map((result: Message[]) => {
    //            result.forEach((message) => this.assertMessageType(message));

    //            window.messages = result.concat(window.messages);
    //            window.isLoadingHistory = false;

    //            setTimeout(() => this.onFetchMessageHistoryLoaded(result, window, ScrollDirection.Bottom));
    //        })
    //    ).subscribe();
    //}
    this.groupAdapter.getMessageHistory(window.participant)
      .pipe(
        map((result: Message[]) => {
          result.forEach((message) => this.assertMessageType(message));

          window.messages = result.concat(window.messages);
          window.isLoadingHistory = false;

          setTimeout(() => this.onFetchMessageHistoryLoaded(result, window, ScrollDirection.Bottom));
        })
      ).subscribe();
  }

  private onFetchMessageHistoryLoaded(messages: Message[], window: Window, direction: ScrollDirection, forceMarkMessagesAsSeen: boolean = false): void {
    debugger
    this.scrollChatWindow(window, direction)

    if (window.hasFocus || forceMarkMessagesAsSeen) {
      const unseenMessages = messages.filter(m => !m.dateSeen);

      this.markMessagesAsRead(unseenMessages);
      this.onMessagesSeen.emit(unseenMessages);
    }
  }

  // Updates the friends list via the event handler
  private onFriendsListChanged(participantsResponse: ParticipantResponse[]): void {
    if (participantsResponse) {
      this.participantsResponse = participantsResponse;

      this.participants = participantsResponse.map((response: ParticipantResponse) => {
        return response.participant;
      });

      this.participantsInteractedWith = [];
    }
  }

  // Handles received messages by the adapter
  private onMessageReceived(participant: IChatParticipant, message: Message) {
    debugger
    if (participant && message) {
      let chatWindow = this.openChatWindow(participant);

      this.assertMessageType(message);

      if (!chatWindow[1] || !this.historyEnabled) {
        chatWindow[0].messages.push(message);

        this.scrollChatWindow(chatWindow[0], ScrollDirection.Bottom);

        if (chatWindow[0].hasFocus) {
          this.markMessagesAsRead([message]);
          this.onMessagesSeen.emit([message]);
        }
      }

      this.emitMessageSound(chatWindow[0]);

      // Github issue #58 
      // Do not push browser notifications with message content for privacy purposes if the 'maximizeWindowOnNewMessage' setting is off and this is a new chat window.
      if (this.maximizeWindowOnNewMessage || (!chatWindow[1] && !chatWindow[0].isCollapsed)) {
        // Some messages are not pushed because they are loaded by fetching the history hence why we supply the message here
        this.emitBrowserNotification(chatWindow[0], message);
      }
    }
  }

  // Opens a new chat whindow. Takes care of available viewport
  // Works for opening a chat window for an user or for a group
  // Returns => [Window: Window object reference, boolean: Indicates if this window is a new chat window]
  public openChatWindow(participant: IChatParticipant, focusOnNewWindow: boolean = false, invokedByUserClick: boolean = false): [Window, boolean] {
    //debugger
    //console.log('openChatWindow');
    debugger
    // Is this window opened?
    let openedWindow = this.windows.find(x => x.participant.id == participant.id);

    if (!openedWindow) {
      if (invokedByUserClick) {
        this.onParticipantClicked.emit(participant);
      }
      if (this.windows.length) {
        let everyoneWindowList = this.windows.filter(x => x.participant.displayName == "Everyone");
        if (everyoneWindowList.length) {
          let oldEveryoneWindowList = everyoneWindowList[0]
          this.onCloseChatWindow(oldEveryoneWindowList);
        }
      }

      // Refer to issue #58 on Github 
      let collapseWindow = invokedByUserClick ? false : !this.maximizeWindowOnNewMessage;

      let newChatWindow: Window = new Window(participant, this.historyEnabled, collapseWindow);
      debugger
      // Loads the chat history via an RxJs Observable
      if (this.historyEnabled) {
        this.fetchMessageHistory(newChatWindow);
      }

      this.windows.unshift(newChatWindow);

      // Is there enough space left in the view port ?
      if (this.windows.length * this.windowSizeFactor >= this.viewPortTotalArea - (!this.hideFriendsList ? this.friendsListWidth : 0)) {
        if (!this.isSmallScreen()) {
          this.windows.pop();
        }
      }

      this.updateWindowsState(this.windows);

      if (focusOnNewWindow && !collapseWindow) {
        this.focusOnWindow(newChatWindow);
      }

      this.participantsInteractedWith.push(participant);
      this.onParticipantChatOpened.emit(participant);

      return [newChatWindow, true];
    }
    else {
      // Returns the existing chat window     
      return [openedWindow, false];
    }
  }

  // Focus on the input element of the supplied window
  private focusOnWindow(window: Window, callback: Function = () => { }): void {
    let windowIndex = this.windows.indexOf(window);
    if (windowIndex >= 0) {
      setTimeout(() => {
        if (this.chatWindowInputs) {
          let messageInputToFocus = this.chatWindowInputs.toArray()[windowIndex];

          messageInputToFocus.nativeElement.focus();
        }

        callback();
      });
    }
  }

  // Scrolls a chat window message flow to the bottom
  private scrollChatWindow(window: Window, direction: ScrollDirection): void {
    if (!window.isCollapsed) {
      let windowIndex = this.windows.indexOf(window);
      setTimeout(() => {
        if (this.chatMessageClusters) {
          let targetWindow = this.chatMessageClusters.toArray()[windowIndex];

          if (targetWindow) {
            let element = this.chatMessageClusters.toArray()[windowIndex].nativeElement;
            let position = (direction === ScrollDirection.Top) ? 0 : element.scrollHeight;
            element.scrollTop = position;
          }
        }
      });
    }
  }

  // Marks all messages provided as read with the current time.
  public markMessagesAsRead(messages: Message[]): void {
    let currentDate = new Date();

    messages.forEach((msg) => {
      msg.dateSeen = currentDate;
    });
  }

  // Buffers audio file (For component's bootstrapping)
  private bufferAudioFile(): void {
    if (this.audioSource && this.audioSource.length > 0) {
      this.audioFile = new Audio();
      this.audioFile.src = this.audioSource;
      this.audioFile.load();
    }
  }

  // Emits a message notification audio if enabled after every message received
  private emitMessageSound(window: Window): void {
    if (this.audioEnabled && !window.hasFocus && this.audioFile) {
      this.audioFile.play();
    }
  }

  // Emits a browser notification
  private emitBrowserNotification(window: Window, message: Message): void {
    //if (this.browserNotificationsBootstrapped && !window.hasFocus && message) {
    //    let notification = new Notification(`${this.localization.browserNotificationTitle} ${window.participant.displayName}`, {
    //        'body': message.message,
    //        'icon': this.browserNotificationIconSource
    //    });

    //    setTimeout(() => {
    //        notification.close();
    //    }, message.message.length <= 50 ? 5000 : 7000); // More time to read longer messages
    //}
  }

  // Saves current windows state into local storage if persistence is enabled
  private updateWindowsState(windows: Window[]): void {
    if (this.persistWindowsState) {
      let participantIds = windows.map((w) => {
        return w.participant.id;
      });

      localStorage.setItem(this.localStorageKey, JSON.stringify(participantIds));
    }
  }

  private restoreWindowsState(): void {
    try {
      if (this.persistWindowsState) {
        let stringfiedParticipantIds = localStorage.getItem(this.localStorageKey);

        if (stringfiedParticipantIds && stringfiedParticipantIds.length > 0) {
          let participantIds = <number[]>JSON.parse(stringfiedParticipantIds);

          let participantsToRestore = this.participants.filter(u => participantIds.indexOf(u.id) >= 0);

          participantsToRestore.forEach((participant) => {
            this.openChatWindow(participant);
          });
        }
      }
    }
    catch (ex) {
      console.error(`An error occurred while restoring ng-chat windows state. Details: ${ex}`);
    }
  }

  // Gets closest open window if any. Most recent opened has priority (Right)
  private getClosestWindow(window: Window): Window | undefined {
    let index = this.windows.indexOf(window);

    if (index > 0) {
      return this.windows[index - 1];
    }
    else if (index == 0 && this.windows.length > 1) {
      return this.windows[index + 1];
    }
  }

  private assertMessageType(message: Message): void {
    // Always fallback to "Text" messages to avoid rendenring issues
    if (!message.type) {
      message.type = MessageType.Text;
    }
  }

  private formatUnreadMessagesTotal(totalUnreadMessages: number): string {
    if (totalUnreadMessages > 0) {

      if (totalUnreadMessages > 99)
        return "99+";
      else
        return String(totalUnreadMessages);
    }

    // Empty fallback.
    return "";
  }

  // Returns the total unread messages from a chat window. TODO: Could use some Angular pipes in the future 
  unreadMessagesTotal(window: Window): string {
    let totalUnreadMessages = 0;

    if (window) {
      totalUnreadMessages = window.messages.filter(x => x.fromId != this.userId && !x.dateSeen).length;
    }

    return this.formatUnreadMessagesTotal(totalUnreadMessages);
  }

  unreadMessagesTotalByParticipant(participant: IChatParticipant): string {
    let openedWindow = this.windows.find(x => x.participant.id == participant.id);

    if (openedWindow) {
      return this.unreadMessagesTotal(openedWindow);
    }
    else {
      let totalUnreadMessages = this.participantsResponse
        .filter(x => x.participant.id == participant.id && !this.participantsInteractedWith.find(u => u.id == participant.id) && x.metadata && x.metadata.totalUnreadMessages > 0)
        .map((participantResponse) => {
          return participantResponse.metadata.totalUnreadMessages
        })[0];

      return this.formatUnreadMessagesTotal(totalUnreadMessages);
    }
  }

  /*  Monitors pressed keys on a chat window
      - Dispatches a message when the ENTER key is pressed
      - Tabs between windows on TAB or SHIFT + TAB
      - Closes the current focused window on ESC
  */
  onChatInputTyped(event: any, window: Window): void {
    switch (event.keyCode) {
      case 13:
        if (window.newMessage && window.newMessage.trim() != "") {
          let message = new Message();

          message.fromId = this.userId;
          message.toId = window.participant.id;
          message.message = window.newMessage;
          message.dateSent = new Date();
          if (true) {
            debugger
            //JSON.stringify(obj1) === JSON.stringify(obj2) 
            let currentopendwindowParticipant = this.participants.filter(x => JSON.stringify(x) == JSON.stringify(window.participant));
            if (!currentopendwindowParticipant.length && this.participants.filter(x => x.displayName == "Everyone").length) {
              this.onCloseChatWindow(window);
              window = this.openChatWindow(this.participants.filter(x => x.displayName == "Everyone")[0])["0"];
              message.toId = window.participant.id;
            }
          }



          window.messages.push(message);
          // console.log("SendMessageVariable", message)
          this.adapter.sendMessage(message);

          window.newMessage = ""; // Resets the new message input

          this.scrollChatWindow(window, ScrollDirection.Bottom);

        }
        break;
      case 9:
        event.preventDefault();

        let currentWindowIndex = this.windows.indexOf(window);
        let messageInputToFocus = this.chatWindowInputs.toArray()[currentWindowIndex + (event.shiftKey ? 1 : -1)]; // Goes back on shift + tab

        if (!messageInputToFocus) {
          // Edge windows, go to start or end
          messageInputToFocus = this.chatWindowInputs.toArray()[currentWindowIndex > 0 ? 0 : this.chatWindowInputs.length - 1];
        }

        messageInputToFocus.nativeElement.focus();

        break;
      case 27:
        let closestWindow = this.getClosestWindow(window);

        if (closestWindow) {
          this.focusOnWindow(closestWindow, () => { this.onCloseChatWindow(window); });
        }
        else {
          this.onCloseChatWindow(window);
        }
    }
  }

  // Closes a chat window via the close 'X' button
  onCloseChatWindow(window: Window): void {
    let index = this.windows.indexOf(window);

    this.windows.splice(index, 1);

    this.updateWindowsState(this.windows);

    this.onParticipantChatClosed.emit(window.participant);

    this.appService.updateChatHalfScreen(false);

  }

  // Toggle friends list visibility
  onChatTitleClicked(event: any): void {
    this.isCollapsed = !this.isCollapsed;
  }

  // Toggles a chat window visibility between maximized/minimized
  onChatWindowClicked(window: Window): void {
    if (!this.isSmallScreen()) {
      window.isCollapsed = !window.isCollapsed;
      this.scrollChatWindow(window, ScrollDirection.Bottom);
      if (window.isCollapsed) {
        this.appService.updateChatHalfScreen(false);
      }
    }
  }

  // Asserts if a user avatar is visible in a chat cluster
  isAvatarVisible(window: Window, message: Message, index: number): boolean {
    // console.log("window.messages", window.messages);
    if (window.messages[index - 1]) {
      if (window.messages[index - 1].fromId === window.messages[index].fromId
        && window.messages[index - 1].message == "<span class='ng-chat-orange-text'>New Loot is Available</span>"
        && window.messages[index].message != "<span class='ng-chat-orange-text'>New Loot is Available</span>"
      ) {
        return true;
      }
    }
    if (message.message == "<span class='ng-chat-orange-text'>New Loot is Available</span>") {
      return false;
    }
    //if (message.fromId != this.userId){
    if (index == 0) {
      return true; // First message, good to show the thumbnail
    }
    else {
      // Check if the previous message belongs to the same user, if it belongs there is no need to show the avatar again to form the message cluster
      if (window.messages[index - 1].fromId != message.fromId) {
        return true;
      }
    }
    //}

    return false;
  }

  getChatWindowAvatar(participant: IChatParticipant, message: Message): string | null {
    if (participant.participantType == ChatParticipantType.User) {
      // return participant.avatar;
      if (message.fromId != this.userId) {
        return participant.avatar;
      } else { return ''; }
      //if (message.fromId != this.userId) {
      //  return participant.avatar;
      //} else {
      //  try {
      //   // let list: any = this.All_participants.filter(x => x.id == message.toId;
      //    if (this.All_participants.filter(x => x.id == message.toId).length) {
      //      return this.All_participants.filter(x => x.id == message.toId)[0].avatar;
      //    }
      //  } catch (e) {
      //    return '';
      //  }

      //}
      //return participant.avatar;
    }
    else if (participant.participantType == ChatParticipantType.Group) {
      let group = participant as Group;
      let userIndex = group.chattingTo.findIndex(x => x.id == message.fromId);
      // console.log("group.chattingTo[userIndex >= 0 ? userIndex : 0]", group.chattingTo[userIndex >= 0 ? userIndex : 0])
      // console.log("group", group)
      return group.chattingTo[userIndex >= 0 ? userIndex : 0].avatar;
    }

    return null;
  }

  // Toggles a window focus on the focus/blur of a 'newMessage' input
  toggleWindowFocus(window: Window): void {
    window.hasFocus = !window.hasFocus;
    if (window.hasFocus) {
      const unreadMessages = window.messages.filter(message => message.dateSeen == null && message.toId == this.userId);

      if (unreadMessages && unreadMessages.length > 0) {
        this.markMessagesAsRead(unreadMessages);
        this.onMessagesSeen.emit(unreadMessages);
      }
    }
  }

  // [Localized] Returns the status descriptive title
  getStatusTitle(status: ChatParticipantStatus): any {
    let currentStatus = status.toString().toLowerCase();

    return this.localization.statusDescription[currentStatus];
  }

  triggerOpenChatWindow(user: User): void {

    if (user) {
      this.openChatWindow(user);
    }
  }

  triggerCloseChatWindow(userId: any): void {
    let openedWindow = this.windows.find(x => x.participant.id == userId);

    if (openedWindow) {
      this.onCloseChatWindow(openedWindow);
    }
  }

  triggerToggleChatWindowVisibility(userId: any): void {
    let openedWindow = this.windows.find(x => x.participant.id == userId);

    if (openedWindow) {
      this.onChatWindowClicked(openedWindow);
    }
  }

  // Triggers native file upload for file selection from the user
  triggerNativeFileUpload(): void {
    this.nativeFileInput.nativeElement.click();
  }

  // Handles file selection and uploads the selected file using the file upload adapter
  onFileChosen(window: Window): void {
    const file: File = this.nativeFileInput.nativeElement.files[0];

    this.isUploadingFile = true;

    // TODO: Handle failure
    this.fileUploadAdapter.uploadFile(file, window.participant.id)
      .subscribe(fileMessage => {
        this.isUploadingFile = false;

        fileMessage.fromId = this.userId;

        // Push file message to current user window   
        window.messages.push(fileMessage);

        this.adapter.sendMessage(fileMessage);

        this.scrollChatWindow(window, ScrollDirection.Bottom);

        // Resets the file upload element
        this.nativeFileInput.nativeElement.value = '';
      });
  }

  onFriendsListCheckboxChange(selectedUser: User, isChecked: boolean): void {
    if (isChecked) {
      this.selectedUsersFromFriendsList.push(selectedUser);
    }
    else {
      this.selectedUsersFromFriendsList.splice(this.selectedUsersFromFriendsList.indexOf(selectedUser), 1);
    }
  }

  onFriendsListActionCancelClicked(): void {

    if (this.currentActiveOption) {
      this.currentActiveOption.isActive = false;
      this.currentActiveOption = null;
      this.selectedUsersFromFriendsList = [];
    }
  }

  onFriendsListActionConfirmClicked(grpName, imageUrl): void {
    let newGroup = new Group(this.selectedUsersFromFriendsList, grpName, imageUrl);

    //this.openChatWindow(newGroup);

    if (this.groupAdapter) {
      this.groupAdapter.groupCreated(newGroup);
    }

    // Canceling current state
    this.onFriendsListActionCancelClicked();
  }

  isUserSelectedFromFriendsList(user: User): boolean {
    return (this.selectedUsersFromFriendsList.filter(item => item.id == user.id)).length > 0
  }
  switchToFullScreen(window: Window) {
    if (window.isCollapsed) {
      window.isCollapsed = !window.isCollapsed;
    }
    window.isHalfScreen = false;
    window.isFullScreen = !window.isFullScreen;
  }
  switchToHalfScreen(window: Window) {
    if (window.isCollapsed) {
      window.isCollapsed = !window.isCollapsed;
    }
    window.isFullScreen = false;
    window.isHalfScreen = !window.isHalfScreen;
    this.appService.updateChatHalfScreen(window.isHalfScreen);
  }
  sendDiceRolledToChatGroup(diceR: any) {
    let message = new Message();
    message.fromId = this.userId;
    message.toId = this.participants.filter(x => x.displayName == "Everyone")[this.participants.filter(x => x.displayName == "Everyone").length - 1].id;
    //message.isSystemGenerated = true;
    debugger
    let diceResult = Object.assign({}, diceR)
    let commandModel: CharacterCommand = diceResult.characterCommandModel;
    let characterMultipleCommands: any[] = diceResult.characterMultipleCommands;
    let ExpandResult: string = commandModel.lastResult ? commandModel.lastResult.toString() : '0';
    let CollaspedResult: string = commandModel.lastResult ? commandModel.lastResult.toString() : '0';
    let CollaspedMessage = '';
    let ExpandedMessage = '';
    if (characterMultipleCommands.length) {
      ExpandResult = '';
      CollaspedResult = '';
      characterMultipleCommands.map((x) => {
        let _beforeResult = "";
        let _afterResult = "";
        if (x.beforeResult) {
          _beforeResult = x.beforeResult.replace(/"/g, '');
        }
        if (x.afterResult) {
          _afterResult = x.afterResult.replace(/"/g, '');
        }
        ExpandResult += "<span class='ng-chat-grey-text'>" + x.calculationString + "</span> = <b>" + _beforeResult + " <u>" + x.calculationResult + "</u> " + _afterResult + "</b><br/>";
        CollaspedResult += "<b>" + _beforeResult + " <u>" + x.calculationResult + "</u> " + _afterResult + "</b><br/>";
      })
    }
    ExpandedMessage = "<span class='ng-chat-message-expand d-none'><span class='ng-chat-orange-text'>Rolled: </span><span class='ng-chat-grey-text'>" + commandModel.command + "</span><br/><span class='ng-chat-orange-text'>Result: </span>" + ExpandResult + "</span>";
    CollaspedMessage = "<span class='ng-chat-message-collaspe'><span class='ng-chat-orange-text'>Result: </span>" + CollaspedResult + "</span>";
    message.message = CollaspedMessage + ExpandedMessage;
    message.dateSent = new Date();
    //console.log("SendMessageVariable", message)
    this.windows.map((x) => {
      if (!x.isCollapsed && x.participant.displayName == "Everyone") {
        x.messages.push(message);
        this.scrollChatWindow(x, ScrollDirection.Bottom);
      }
    })
    //window.messages.push(message);
    this.adapter.sendMessage(message);
  }
  sendLootMessageToChatGroup() {
    let message = new Message();
    message.fromId = this.userId;
    message.toId = this.participants.filter(x => x.displayName == "Everyone")[this.participants.filter(x => x.displayName == "Everyone").length - 1].id;
    message.message = "<span class='ng-chat-orange-text'>New Loot is Available</span>";
    message.dateSent = new Date();
    message.isSystemGenerated = true;
    //window.messages.push(message);
    this.windows.map((x) => {
      if (!x.isCollapsed && x.participant.displayName == "Everyone") {
        x.messages.push(message);
        this.scrollChatWindow(x, ScrollDirection.Bottom);
      }
    })
    this.adapter.sendMessage(message);
  }
  toggleNotificationSound() {
    this.audioEnabled = !this.audioEnabled;
  }
  toggleDiceResult(e) {
    debugger
    if (e.currentTarget.previousElementSibling.children) {
      if (e.currentTarget.previousElementSibling.children[0]) {
        if (e.currentTarget.previousElementSibling.children[0].classList.contains('ng-chat-message-collaspe')) {
          if (e.currentTarget.previousElementSibling.children[0].classList.contains('d-none')) {
            e.currentTarget.previousElementSibling.children[0].classList.remove('d-none');
            e.currentTarget.previousElementSibling.children[1].classList.remove('d-none');
            e.currentTarget.previousElementSibling.children[1].classList.add('d-none');
          }
          else if (e.currentTarget.previousElementSibling.children[1].classList.contains('d-none')) {
            e.currentTarget.previousElementSibling.children[0].classList.remove('d-none');
            e.currentTarget.previousElementSibling.children[1].classList.remove('d-none');
            e.currentTarget.previousElementSibling.children[0].classList.add('d-none');
          }
        }
      }
    }
  }
  isSmallScreen() {
    return (window.outerWidth < 610);
  }
}
