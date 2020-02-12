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
import { AlertService, MessageSeverity } from '../core/common/alert.service';
import { CustomDice } from '../core/models/view-models/custome-dice.model';
import { Utilities } from '../core/common/utilities';
import { RulesetService } from '../core/services/ruleset.service';
import { AuthService } from '../core/auth/auth.service';
import { DiceService } from '../core/services/dice.service';
import { CharactersService } from '../core/services/characters.service';
import { Characters } from '../core/models/view-models/characters.model';
import { SharedService } from '../core/services/shared.service';
import { CombatService } from '../core/services/combat.service';
import { CombatSettings } from '../core/models/view-models/combatSettings.model';
import { COMBAT_SETTINGS, combatantType, STAT_TYPE, CombatItemsType } from '../core/models/enums';
import { CharactersCharacterStat } from '../core/models/view-models/characters-character-stats.model';



@Component({
  selector: 'combat-chat',
  templateUrl: 'combat-chat.component.html',
  styleUrls: [
    'assets/icons.css',
    'assets/loading-spinner.css',
    'assets/combat-chat.component.default.css',
    'assets/themes/combat-chat.theme.default.scss',
    'assets/themes/combat-chat.theme.dark.scss'
  ],
  encapsulation: ViewEncapsulation.None
})

export class CombatChat implements OnInit, IChatController {

  isHavingParticipant: boolean = false;
  combatants: any[] = [];
  roundCounter: number; gametime: any;
  rulesetModel: Ruleset = new Ruleset();
  settings: CombatSettings = new CombatSettings();
  COMBAT_SETTINGS = COMBAT_SETTINGS;
  showCombatOptions: boolean = false;
  CombatId: number = 0;
  characterId: any;
  DummyValueForCharHealthStat: number = -9999;
  charXPStatNames: string[] = [];
  charHealthStatNames: string[] = [];
  CombatItemsType = CombatItemsType;
  isLoading: boolean = false;
  currentCombatant: any;
  CurrentInitiativeValue: number;
  isRulesetCombat: boolean = true;
  getLatestDetails: any;

  constructor(public sanitizer: DomSanitizer, private _httpClient: HttpClient, private localStorage: LocalStoreManager, private appService: AppService1, private router: Router,
    private alertService: AlertService,
    private rulesetService: RulesetService,
    private characterService: CharactersService,
    private authService: AuthService,
    private combatService: CombatService) {
    this.appService.shouldUpdateChatWithDiceRoll().subscribe((serviceUpdatedData) => {

      let serviceData = Object.assign({}, serviceUpdatedData);

      if (serviceData) {
        let isDeckDocMessage = false;
        serviceData.characterMultipleCommands.map(cmd => {
          if (cmd && cmd.calculationArray && cmd.calculationArray.length) {
            cmd.calculationArray.map(diceMsg => {
              if (diceMsg.dice && (diceMsg.dice == "DECK" || diceMsg.dice == "DOC")) {
                isDeckDocMessage = true;
              }
            });
          }
        });

        if (serviceData.priPubArray && serviceData.priPubArray.length > 0) {
          let characterMultipleCommandsArray: any[] = serviceData.characterMultipleCommands;
          let updatedCommandsList = [];
          let upldatedCommand = "";

          characterMultipleCommandsArray.forEach((_cmd, indx) => {
            if (serviceData.priPubArray[indx].type == 'public') {
              updatedCommandsList.push(_cmd);
              upldatedCommand += serviceData.priPubArray[indx].command;
              if ((characterMultipleCommandsArray.length - 1) !== indx) {
                upldatedCommand += " AND ";
              };
            }
          })
          serviceData.characterMultipleCommands = updatedCommandsList;
          serviceData.characterCommandModel.command = upldatedCommand;
        }
        this.sendDiceRolledToChatGroup(serviceData, isDeckDocMessage);
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
    this.appService.shouldUpdateChatWithTakenByLootMessage().subscribe((serviceData) => {
      if (serviceData) {
        //this.sendLootMessageToChatGroup(true, serviceData);
        let characterName = serviceData.characterName;        let multipleLoots = serviceData.lootItems;        this.sendLootMessageToChatGroup(true, characterName, multipleLoots);
      }
    });
    this.appService.shouldUpdateChatRemoveIntervals().subscribe((serviceData) => {
      if (serviceData && this.fetchFriendsListInterval) {

        clearInterval(this.fetchFriendsListInterval);
      }
    });

    this.appService.shouldUpdateChatFromCombat().subscribe((serviceData) => {

      if (serviceData) {
        this.sendCombatMessageToChatGroup(serviceData);
      }
    });
    this.appService.shouldUpdateOpenChatForCharacter().subscribe((characterId) => {

      if (characterId) {
        this.openChatForCharacter(characterId);
      }
    });

    this.appService.shouldUpdateDiceCommandFromCharacterStat().subscribe(result => {
      if (result) {
        let characterid = ServiceUtil.GetCurrentCharacterID(this.localStorage);
        if (!characterid) {
          characterid = 0;
        }
        this.characterService.getDiceRollModel(this.ruleset.ruleSetId, characterid)
          .subscribe((data: any) => {

            let _customDices = data.customDices;
            this.customDices = DiceService.BindDeckCustomDices(_customDices);
            this.statdetails = { charactersCharacterStat: data.charactersCharacterStats, character: data.character };
            this.charactersCharacterStats = data.charactersCharacterStats;
            this.character = data.character;
            //var ressss = ServiceUtil.getFinalCalculationString(inputString, statDetails, charactersCharacterStats, character)
            //this.getFinalCommandString(command, statdetails, data.charactersCharacterStats, data.character)

          }, error => {
            let Errors = Utilities.ErrorDetail("", error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            }
          });
      }
    });

    this.appService.shouldUpdateClearChatWindow().subscribe(isChatDeleted => {
      if (isChatDeleted) {
        let openedWindow = this.windows.find(x => x.participant.displayName == "Everyone");
        if (openedWindow) {
          this.onCloseChatWindow(openedWindow);
        }
      }
    });

    if (this.localStorage.localStorageGetItem(DBkeys.ChatInNewTab)) {
      this.changeIcon = true;
    } else {
      this.changeIcon = false;
    }

    this.appService.shouldUpdateCombatantDetailFromGM().subscribe(isFromGM => {
      if (isFromGM) {
        this.getCombatantDetails(false);
      }
    });

  }

  // Exposes enums for the ng-template
  public ChatParticipantType = ChatParticipantType;
  public ChatParticipantStatus = ChatParticipantStatus;
  public MessageType = MessageType;
  //recentMessageCount: number = 0;
  IsDefaultGroupCreated: boolean = false;
  //willDownPress: boolean = false

  customDices: CustomDice[] = [];
  statdetails: any;
  charactersCharacterStats: any[];
  character: Characters = new Characters();
  changeIcon: boolean = false;

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
  public audioSource: string = '../assets/images/sounds/notification.wav';

  @Input() // chat dice roll sound
  public diceRollAudioSource1: string = '../assets/images/sounds/1.wav';
  @Input() // chat dice roll sound
  public diceRollAudioSource2: string = '../assets/images/sounds/2.wav';
  @Input() // chat dice roll sound
  public diceRollAudioSource3: string = '../assets/images/sounds/3.wav';
  @Input() // chat dice roll sound
  public diceRollAudioSource4: string = '../assets/images/sounds/4.wav';
  @Input() // chat dice roll sound
  public diceRollAudioSource5: string = '../assets/images/sounds/5.wav';
  @Input() // chat dice roll sound
  public diceRollAudioSource6: string = '../assets/images/sounds/6.wav';
  @Input() // chat dice roll sound
  public diceRollAudioSource7: string = '../assets/images/sounds/7.wav';
  @Input() // chat dice roll sound
  public diceRollAudioSource8: string = '../assets/images/sounds/8.wav';
  @Input() // chat dice roll sound
  public diceRollAudioSource9: string = '../assets/images/sounds/9.wav';
  @Input() // chat dice roll sound
  public diceRollAudioSource10: string = '../assets/images/sounds/10.wav';
  @Input() // chat DECK/DOC sound
  public deckDoc_diceRollAudioSource: string = '../assets/images/sounds/DOC.wav';

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
  private diceRollAudioFile1: HTMLAudioElement;
  private diceRollAudioFile2: HTMLAudioElement;
  private diceRollAudioFile3: HTMLAudioElement;
  private diceRollAudioFile4: HTMLAudioElement;
  private diceRollAudioFile5: HTMLAudioElement;
  private diceRollAudioFile6: HTMLAudioElement;
  private diceRollAudioFile7: HTMLAudioElement;
  private diceRollAudioFile8: HTMLAudioElement;
  private diceRollAudioFile9: HTMLAudioElement;
  private diceRollAudioFile10: HTMLAudioElement;
  private deckDoc_diceRollAudioFile11: HTMLAudioElement;

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
    this.appService.shouldUpdateHavingParticipant().subscribe(participants => {
      if (participants) {
        this.isHavingParticipant = true;
      }
    });

    this.participants = this.filterCampaignParticipants(this.participants)
    if (this.searchInput.length > 0) {
      // Searches in the friend list by the inputted search string
      return this.participants.filter(x => x.displayName.toUpperCase().includes(this.searchInput.toUpperCase()));
    }
    if (this.participants && this.participants.length) {
      this.isHavingParticipant = true;
    }
    this.appService.updateShowChatBtn(this.participants);
    return this.participants;
  }

  filterCampaignParticipants(participants) {
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
        if (this.localStorage.localStorageGetItem(DBkeys.IsGMCampaignChat)) {
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
        else if (this.localStorage.localStorageGetItem(DBkeys.IsGMCampaignChat) == false) {
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

  fetchFriendsListInterval: any;

  @ViewChildren('chatMessages') chatMessageClusters: any;

  @ViewChildren('chatWindowInput') chatWindowInputs: any;

  @ViewChild('nativeFileInput') nativeFileInput: ElementRef;

  ngOnInit() {
    this.getCombatantDetails();
    if (!this.isRulesetCombat) {
      this.getLatestDetails = setInterval(() => {
        this.getCombatantDetails(false);
      }, 4000);
    } else {
      if (this.getLatestDetails) {
        clearInterval(this.getLatestDetails)
      }
    }
    this.bootstrapChat();
    if (this.router.url.toLowerCase().indexOf("character/tiles") > -1 || this.router.url.toLowerCase().indexOf("ruleset/dashboard") > -1) {
      this.isCollapsed = true;
    }

    //this.rulesetService.getCustomDice(this.ruleset.ruleSetId)
    //  .subscribe(data => {
    //    this.customDices = data;
    //  }, error => {
    //    let Errors = Utilities.ErrorDetail("", error);
    //    if (Errors.sessionExpire) {
    //      this.authService.logout(true);
    //    }
    //  });
    let characterid = ServiceUtil.GetCurrentCharacterID(this.localStorage);
    if (!characterid) {
      characterid = 0;
    }
    this.characterService.getDiceRollModel(this.ruleset.ruleSetId, characterid)
      .subscribe((data: any) => {
        let _customDices = data.customDices;
        this.customDices = DiceService.BindDeckCustomDices(_customDices);
        this.statdetails = { charactersCharacterStat: data.charactersCharacterStats, character: data.character };
        this.charactersCharacterStats = data.charactersCharacterStats;
        this.character = data.character;
        //var ressss = ServiceUtil.getFinalCalculationString(inputString, statDetails, charactersCharacterStats, character)
        //this.getFinalCommandString(command, statdetails, data.charactersCharacterStats, data.character)

      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      });
  }
  // chat-window-input
  //@HostListener('window:keyup', ['$event'])
  //keyEvent(event: any) {
  //  if (event.keyCode === 38 && event.target.className.indexOf("ng-chat-send-text-input") > -1) {   // Up Arrow
  //    this.UpArrow(this.windows);
  //  }
  //  else if (event.keyCode === 40 && event.target.className.indexOf("ng-chat-send-text-input") > -1) {   // Down Arrow
  //    this.DowmArrow();
  //  }
  //}

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

          if (this.localStorage.localStorageGetItem(DBkeys.IsConnected)) {
            this.fetchFriendsListInterval = setInterval(() => this.fetchFriendsList(false), this.pollingInterval);
          }
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
        //else {
        //  if (this.windows && this.windows.length) {
        //    this.windows.map((w) => {

        //      let _windowParticipant = this.participants.find(
        //        (x: any) => x.campaignID == w.participant.campaignID
        //          && x.characterCampaignID == w.participant.characterCampaignID
        //          && x.characterID == w.participant.characterID && !x.chattingTo && x.displayName != "Everyone");
        //      if (w.participant.id) {

        //      }
        //    })
        //  }
        //}
      });
  }

  fetchMessageHistory(window: Window) {

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

    //window.isLoadingHistory = false;
    if (true) {
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

  }

  private onFetchMessageHistoryLoaded(messages: Message[], window: Window, direction: ScrollDirection, forceMarkMessagesAsSeen: boolean = false): void {

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
      else if (participant.participantType == ChatParticipantType.User && (chatWindow[1])) {
        chatWindow[0].messages.push(message);

        this.scrollChatWindow(chatWindow[0], ScrollDirection.Bottom);

        if (chatWindow[0].hasFocus) {
          this.markMessagesAsRead([message]);
          this.onMessagesSeen.emit([message]);
        }
      }
      this.emitMessageSound(chatWindow[0], message);

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

    //console.log('openChatWindow');

    // Is this window opened?
    let openedWindow = this.windows.find(x => x.participant.id == participant.id);
    let Old_openedWindow_Forparticipant = null;
    let _participant: any = participant;
    if (!_participant.chattingTo && participant.displayName != "Everyone") { // check to fix #904 (Point 5)
      Old_openedWindow_Forparticipant =
        this.windows.find(
          (x: any) => x.participant.campaignID == _participant.campaignID
            && x.participant.characterCampaignID == _participant.characterCampaignID
            && x.participant.characterID == _participant.characterID
            && !x.participant.chattingTo && x.participant.displayName != "Everyone"
        )
    }

    if (!openedWindow) {
      if (invokedByUserClick) {
        this.onParticipantClicked.emit(participant);
      }
      if (this.windows.length && _participant.chattingTo && participant.displayName == "Everyone") {
        let everyoneWindowList = this.windows.filter(x => x.participant.displayName == "Everyone");
        if (everyoneWindowList.length) {
          let oldEveryoneWindowList = everyoneWindowList[0]
          this.onCloseChatWindow(oldEveryoneWindowList);
        }
      }

      // Refer to issue #58 on Github 
      let collapseWindow = invokedByUserClick ? false : !this.maximizeWindowOnNewMessage;

      let newChatWindow: Window = new Window(participant, this.historyEnabled, collapseWindow);

      if (Old_openedWindow_Forparticipant) {// To fix #904 (Point 5) get messages from old opened window to show them in new window
        let messagesFromOldWindow = Old_openedWindow_Forparticipant.messages;
        if (messagesFromOldWindow && messagesFromOldWindow.length) {
          messagesFromOldWindow.map((msg) => {
            if (msg.toId == this.userId) {
              msg.fromId = participant.id;
            }

          });
          newChatWindow.messages = messagesFromOldWindow;
          //close old window
          this.onCloseChatWindow(Old_openedWindow_Forparticipant);
        }
      }


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
    if (this.diceRollAudioSource1 && this.diceRollAudioSource1.length > 0) {
      this.diceRollAudioFile1 = new Audio();
      this.diceRollAudioFile1.src = this.diceRollAudioSource1;
      this.diceRollAudioFile1.load();
    }
    if (this.diceRollAudioSource2 && this.diceRollAudioSource2.length > 0) {
      this.diceRollAudioFile2 = new Audio();
      this.diceRollAudioFile2.src = this.diceRollAudioSource2;
      this.diceRollAudioFile2.load();
    }
    if (this.diceRollAudioSource3 && this.diceRollAudioSource3.length > 0) {
      this.diceRollAudioFile3 = new Audio();
      this.diceRollAudioFile3.src = this.diceRollAudioSource3;
      this.diceRollAudioFile3.load();
    }
    if (this.diceRollAudioSource4 && this.diceRollAudioSource4.length > 0) {
      this.diceRollAudioFile4 = new Audio();
      this.diceRollAudioFile4.src = this.diceRollAudioSource4;
      this.diceRollAudioFile4.load();
    }
    if (this.diceRollAudioSource5 && this.diceRollAudioSource5.length > 0) {
      this.diceRollAudioFile5 = new Audio();
      this.diceRollAudioFile5.src = this.diceRollAudioSource5;
      this.diceRollAudioFile5.load();
    }
    if (this.diceRollAudioSource6 && this.diceRollAudioSource6.length > 0) {
      this.diceRollAudioFile6 = new Audio();
      this.diceRollAudioFile6.src = this.diceRollAudioSource6;
      this.diceRollAudioFile6.load();
    }
    if (this.diceRollAudioSource7 && this.diceRollAudioSource7.length > 0) {
      this.diceRollAudioFile7 = new Audio();
      this.diceRollAudioFile7.src = this.diceRollAudioSource7;
      this.diceRollAudioFile7.load();
    }
    if (this.diceRollAudioSource8 && this.diceRollAudioSource8.length > 0) {
      this.diceRollAudioFile8 = new Audio();
      this.diceRollAudioFile8.src = this.diceRollAudioSource8;
      this.diceRollAudioFile8.load();
    }
    if (this.diceRollAudioSource9 && this.diceRollAudioSource9.length > 0) {
      this.diceRollAudioFile9 = new Audio();
      this.diceRollAudioFile9.src = this.diceRollAudioSource9;
      this.diceRollAudioFile9.load();
    }
    if (this.diceRollAudioSource10 && this.diceRollAudioSource10.length > 0) {
      this.diceRollAudioFile10 = new Audio();
      this.diceRollAudioFile10.src = this.diceRollAudioSource10;
      this.diceRollAudioFile10.load();
    }
    if (this.deckDoc_diceRollAudioSource && this.deckDoc_diceRollAudioSource.length > 0) {
      this.deckDoc_diceRollAudioFile11 = new Audio();
      this.deckDoc_diceRollAudioFile11.src = this.deckDoc_diceRollAudioSource;
      this.deckDoc_diceRollAudioFile11.load();
    }


  }

  // Emits a message notification audio if enabled after every message received
  private emitMessageSound(window: Window, message: Message): void {
    if (this.audioEnabled && !window.hasFocus) {
      let isChatDiceRollMessage = false;
      let isDeckDocMessage = false;
      if (message && message.message && message.message.indexOf('ng-chat-diceRoll-message') > -1) {
        isChatDiceRollMessage = true;
      }
      if (message && message.message && message.message.indexOf('ng-chat-deck-doc-dice-msg') > -1) {
        isDeckDocMessage = true;
      }

      if (!isChatDiceRollMessage && this.audioFile) {
        this.audioFile.play();
      }
      else if (isChatDiceRollMessage) {
        if (isDeckDocMessage) {
          this.PlayDiceRollSound(true);
        } else {
          this.PlayDiceRollSound();
        }

      }

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

  SendMessage(window: Window) {
    let _participant: any = window.participant;
    if (!_participant.chattingTo && _participant.displayName != "Everyone")// To fix #904 (Point 5) Remove Old Participant reference
    {
      let currentWindowParticipantPresentInParticipantList = this.participants.find(x => x.id == _participant.id);
      if (!currentWindowParticipantPresentInParticipantList) {
        let NewParticipantToReplace = this.participants.find(
          (x: any) => x.campaignID == _participant.campaignID
            && x.characterCampaignID == _participant.characterCampaignID
            && x.characterID == _participant.characterID && !x.chattingTo && x.displayName != "Everyone");
        if (NewParticipantToReplace) {
          var newwindow = this.openChatWindow(NewParticipantToReplace, true, true);
          if (newwindow && newwindow.length) {
            let newWindowToOpen = newwindow[0];
            newWindowToOpen.newMessage = window.newMessage;
            window = newWindowToOpen;
          }
        }

      }
    }
    if (window.newMessage && window.newMessage.trim() != "") {
      window.recentMessageCount = 0;
      //let actualMsg = window.newMessage;
      window.newMessage = this.getMessageWithDiceIntegration(window.newMessage, window);
      if (window.newMessage && window.newMessage.trim() != "") {
        let message = new Message();

        message.fromId = this.userId;
        //if (actualMsg.indexOf("/pri") > -1 || actualMsg.indexOf("/private") > -1) {
        //  message.toId = 0;
        //} else {
        message.toId = window.participant.id;
        //}

        message.message = window.newMessage;
        message.dateSent = new Date();
        if (true) {
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
    }
  }

  getMessageWithDiceIntegration(message, window) {
    try {
      let isStringWithCommand: boolean = false;
      let isStringWithCommand_Pri: boolean = false;
      let isStringWithCommand_Private: boolean = false;
      let isStringWithCommand_Pub: boolean = false;
      let isStringWithCommand_Public: boolean = false;
      var msg = message;
      msg = msg.trim();
      isStringWithCommand = msg.toLowerCase().startsWith("/r");
      isStringWithCommand_Pri = msg.toLowerCase().startsWith("/pri");
      isStringWithCommand_Private = msg.toLowerCase().startsWith("/private");
      isStringWithCommand_Pub = msg.toLowerCase().startsWith("/pub");
      isStringWithCommand_Public = msg.toLowerCase().startsWith("/public");
      if (isStringWithCommand || isStringWithCommand_Pri || isStringWithCommand_Private || isStringWithCommand_Pub || isStringWithCommand_Public) {
        //msg = msg.substr(2);
        if (isStringWithCommand) {
          msg = msg.substr(2).trim();
          if (!msg) return message;
        } else {
          msg = DiceService.replacePriPub(msg);
          if (!msg) return message;
        }
        let characterid = ServiceUtil.GetCurrentCharacterID(this.localStorage);
        if (characterid > 0) {
          /////////////////////////////////////////////////////////////////
          //this.customDices
          if (window.participant.characterID > 0) {
            if (characterid) {
              let localStorage_variable = this.localStorage.localStorageGetItem(DBkeys.CHAR_CHAR_STAT_DETAILS);
              if (localStorage_variable && localStorage_variable.characterId > 0 && localStorage_variable.charactersCharacterStats && localStorage_variable.charactersCharacterStats.length) {
                let localStorage_CharCharStats: any[] = localStorage_variable.charactersCharacterStats

                if (localStorage_CharCharStats) {
                  this.statdetails.charactersCharacterStat = localStorage_CharCharStats;
                  this.charactersCharacterStats = localStorage_CharCharStats;
                }
              }
            }
            msg = ServiceUtil.getFinalCalculationString(msg, this.statdetails, this.charactersCharacterStats, this.character)
          }

        }
        var diceResult = DiceService.rollDiceExternally(this.alertService, msg, this.customDices, true)
        if (isStringWithCommand) {
          let msgWithoutR = message.substr(2);
          diceResult.characterCommandModel.command = msgWithoutR;
        } else {
          diceResult.characterCommandModel.command = message;
        }
        ///////////////
        let isDeckDocMessage = false;
        diceResult.characterMultipleCommands.map(cmd => {
          if (cmd && cmd.calculationArray && cmd.calculationArray.length) {
            cmd.calculationArray.map(diceMsg => {
              if (diceMsg.dice && (diceMsg.dice == "DECK" || diceMsg.dice == "DOC")) {
                isDeckDocMessage = true;
              }
            });
          }
        });
        ////////////////

        if ((diceResult &&
          diceResult.characterMultipleCommands &&
          diceResult.characterMultipleCommands[0] &&
          (+diceResult.characterMultipleCommands[0].calculationResult || diceResult.characterMultipleCommands[0].calculationResult == 0)) || isDeckDocMessage) {
          // this.sendDiceRolledToChatGroup(diceResult);
          if (this.audioEnabled && !window.hasFocus) {
            if (isDeckDocMessage) {
              this.PlayDiceRollSound(true);
            } else {
              this.PlayDiceRollSound();
            }
          }

          return this.generateDiceRolledMessage(diceResult, isDeckDocMessage);
        }
        return msg;
      }
    } catch (err) { }
    return message;
  }

  /*  Monitors pressed keys on a chat window
      - Dispatches a message when the ENTER key is pressed
      - Tabs between windows on TAB or SHIFT + TAB
      - Closes the current focused window on ESC
  */
  onChatInputTyped(event: any, window: Window): void {
    switch (event.keyCode) {
      case 13:
        this.SendMessage(window);
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

    //if (!this.isSmallScreen()) {
    window.isCollapsed = !window.isCollapsed;
    this.scrollChatWindow(window, ScrollDirection.Bottom);
    if (window.isCollapsed) {
      this.appService.updateChatHalfScreen(false);
    }

    //collaspe participant list with chat window if in mobile screen
    if (this.isSmallScreen()) {
      this.isCollapsed = window.isCollapsed;
    }
    //}
    //else {
    //  this.isCollapsed = window.isCollapsed;
    //}
  }
  ShowThisMessage(window: Window, message: Message, index: number): boolean {

    if (message.isSystemGenerated) {
      if (index == 0) {
        return true; // First message, good to show the thumbnail
      }
      else {
        // Check if the previous message belongs to the same user, if it belongs there is no need to show the avatar again to form the message cluster
        if (window.messages[index - 1].message != message.message) {
          return true;
        }
      }
      return false;
    }
    return true;
  }
  // Asserts if a user avatar is visible in a chat cluster
  isAvatarVisible(window: Window, message: Message, index: number): boolean {
    // console.log("window.messages", window.messages);
    if (window.messages[index - 1]) {
      if (window.messages[index - 1].fromId === window.messages[index].fromId
        && window.messages[index - 1].message == "<span class='ng-chat-orange-text  LootAvailable'>New Loot is Available</span>"
        && window.messages[index].message != "<span class='ng-chat-orange-text  LootAvailable'>New Loot is Available</span>"
      ) {
        return true;
      }
      else if (window.messages[index - 1].fromId === window.messages[index].fromId
        && window.messages[index - 1].message.indexOf("Loot</span>") > -1
        && window.messages[index].message.indexOf("Loot</span>") == -1
      ) {
        return true;
      }
    }
    if (message.message == "<span class='ng-chat-orange-text LootAvailable'>New Loot is Available</span>") {
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
      } else {
        //let CurrentLoggedinUser = this.localStorage.getDataObject<any>(DBkeys.CURRENT_USER)
        //if (CurrentLoggedinUser) {
        //  if (CurrentLoggedinUser.profileImage) {
        //    return CurrentLoggedinUser.profileImage;
        //  }
        //}
        let chatList = this.participants.filter(x => x.displayName == "Everyone")
        if (chatList) {
          try {
            let currentChatGroup: any = chatList[0];
            return currentChatGroup.chattingTo.filter(x => x.id == this.userId)[0].avatar
          }
          catch (e) {
            return '';
          }
        }
        return '';
      }
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
  sendDiceRolledToChatGroup(diceR: any, isDeckDocMessage) {
    //console.log('sendDiceRolledToChatGroup', diceR);
    if (this.participants && this.participants.length) {
      try {

        let message = new Message();
        message.fromId = this.userId;
        message.toId = this.participants.filter(x => x.displayName == "Everyone")[this.participants.filter(x => x.displayName == "Everyone").length - 1].id;
        //message.isSystemGenerated = true;

        message.message = this.generateDiceRolledMessage(diceR, isDeckDocMessage);
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
      } catch (e) { }
    }
  }
  generateDiceRolledMessage(diceR, isDeckDocMessage) {
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
        if (x.calculationStringColor) {
          ExpandResult += "<span class='ng-chat-grey-text'>" + x.calculationStringColor + "</span> " + (x.calculationStringColor ? '=' : '') + " <b>" + _beforeResult + " <u>" + (x.calculationResult || x.calculationResult == 0 ? x.calculationResult : '') + "</u> " + _afterResult + "</b><br/>";
        } else {
          ExpandResult += "<span class='ng-chat-grey-text'>" + x.calculationString + "</span> " + (x.calculationString ? '=' : '') + " <b>" + _beforeResult + " <u>" + (x.calculationResult || x.calculationResult == 0 ? x.calculationResult : '') + "</u> " + _afterResult + "</b><br/>";
        }

        CollaspedResult += "<b>" + _beforeResult + " <u>" + (x.calculationResult || x.calculationResult == 0 ? x.calculationResult : '') + "</u> " + _afterResult + "</b><br/>";
      })
    }
    let isDeckDocClass = '';
    if (isDeckDocMessage) {
      isDeckDocClass = 'ng-chat-deck-doc-dice-msg'
    }
    ExpandedMessage = "<span class='" + isDeckDocClass + " ng-chat-diceRoll-message ng-chat-message-expand d-none'><span class='ng-chat-orange-text'>Rolled: </span><span class='ng-chat-grey-text command-toRoll-text'>" + commandModel.command + "</span><br/><span class='ng-chat-orange-text'>Result: </span>" + ExpandResult + "</span>";
    CollaspedMessage = "<span class='" + isDeckDocClass + " ng-chat-diceRoll-message ng-chat-message-collaspe'><span class='ng-chat-orange-text'>Result: </span>" + CollaspedResult + "</span>";
    return CollaspedMessage + ExpandedMessage;
  }
  //sendLootMessageToChatGroup(isLootTakenByCharacter = false, CharacterName = '') {
  //  if (this.participants && this.participants.length) {
  //    try {

  //      let message = new Message();
  //      message.fromId = this.userId;
  //      message.toId = this.participants.filter(x => x.displayName == "Everyone")[this.participants.filter(x => x.displayName == "Everyone").length - 1].id;
  //      if (isLootTakenByCharacter) {
  //        message.message = "<span class='ng-chat-orange-text LootTaken'>" + CharacterName + " Has Taken Loot</span>";
  //      }
  //      else {
  //        message.message = "<span class='ng-chat-orange-text LootAvailable'>New Loot is Available</span>";
  //      }
  //      message.dateSent = new Date();
  //      message.isSystemGenerated = true;
  //      //window.messages.push(message);
  //      this.windows.map((x) => {
  //        if (!x.isCollapsed && x.participant.displayName == "Everyone") {
  //          x.messages.push(message);
  //          this.scrollChatWindow(x, ScrollDirection.Bottom);
  //        }
  //      })
  //      this.adapter.sendMessage(message);
  //    }
  //    catch (e) {

  //    }
  //  }
  //}

  sendLootMessageToChatGroup(isLootTakenByCharacter = false, CharacterName = '', multipleLoots = undefined) {    if (this.participants && this.participants.length) {      try {        let message = new Message();        message.fromId = this.userId;        message.toId = this.participants.filter(x => x.displayName == "Everyone")[this.participants.filter(x => x.displayName == "Everyone").length - 1].id;        if (isLootTakenByCharacter) {          message.message = "<span class='ng-chat-orange-text LootTaken'>" + CharacterName + " Has Taken Loot</span>";          if (multipleLoots && multipleLoots.length) {            let ExpandedMessageContent = '';            multipleLoots.map((loot) => {              ExpandedMessageContent += '<span class="ng-chat-grey-text">' + CharacterName + ' has taken ' + loot.name + '</sapn></br>';            })            let ExpandedMessage = "<span class=' ng-chat-message-expand d-none'>" + ExpandedMessageContent + "</span>";            let CollaspedMessage = "<span class='ng-chat-message-collaspe'><span class='ng-chat-orange-text LootTaken'>" + CharacterName + " Has Taken Loot</span></span>";            message.message = CollaspedMessage + ExpandedMessage;          }        }        else {          message.message = "<span class='ng-chat-orange-text LootAvailable'>New Loot is Available</span>";        }        message.dateSent = new Date();        message.isSystemGenerated = true;        //window.messages.push(message);        this.windows.map((x) => {          if (!x.isCollapsed && x.participant.displayName == "Everyone") {            x.messages.push(message);            this.scrollChatWindow(x, ScrollDirection.Bottom);          }        })        this.adapter.sendMessage(message);      }      catch (e) {      }    }  }
  sendCombatMessageToChatGroup(combatMessage) {
    if (this.participants && this.participants.length) {
      try {

        let message = new Message();
        message.fromId = this.userId;
        message.toId = this.participants.filter(x => x.displayName == "Everyone")[this.participants.filter(x => x.displayName == "Everyone").length - 1].id;

        message.message = "<span class='ng-chat-orange-text combatTracker'>" + combatMessage + "</span>";

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
      catch (e) {

      }
    }
  }
  toggleNotificationSound() {
    this.audioEnabled = !this.audioEnabled;
  }
  toggleDiceResult(e) {

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
  onMessageClick() {
    this.appService.updateLootMessageClicked(true);
  }
  openChatForCharacter(characterId) {
    //if (this.participants.filter(x => x. == "Everyone")) { //check if character is online

    //}
    try {

      if (this.participants.filter((x: any) => x.characterID == characterId && !x.chattingTo).length) {
        if (this.participants.filter((x: any) => x.characterID == characterId && !x.chattingTo && x.status == ChatParticipantStatus.Online).length) {
          this.openChatWindow(this.participants.filter((x: any) => x.characterID == characterId && !x.chattingTo && x.status == ChatParticipantStatus.Online)[0], true, true);
        }
        else {
          //character is offline.
          this.alertService.showMessage("Selected character is offine.", '', MessageSeverity.error)
        }
      }
      else {
        //character not found in chat window.
      }

      let message = new Message();
      message.fromId = this.userId;
      message.toId = this.participants.filter(x => x.displayName == "Everyone")[this.participants.filter(x => x.displayName == "Everyone").length - 1].id;


    }
    catch (e) {
      //some error occured.
    }
  }

  PlayDiceRollSound(isDeckDocMessage = false) {
    let num = Math.floor(Math.random() * 10) + 1;
    if (isDeckDocMessage) {
      num = 11;
    }
    switch (num) {
      case 1:
        if (this.diceRollAudioFile1) {
          this.diceRollAudioFile1.play();
        }
        break;
      case 2:
        if (this.diceRollAudioFile2) {
          this.diceRollAudioFile2.play();
        }
        break;
      case 3:
        if (this.diceRollAudioFile3) {
          this.diceRollAudioFile3.play();
        }
        break;
      case 4:
        if (this.diceRollAudioFile4) {
          this.diceRollAudioFile4.play();
        }
        break;
      case 5:
        if (this.diceRollAudioFile5) {
          this.diceRollAudioFile5.play();
        }
        break;
      case 6:
        if (this.diceRollAudioFile6) {
          this.diceRollAudioFile6.play();
        }
        break;
      case 7:
        if (this.diceRollAudioFile7) {
          this.diceRollAudioFile7.play();
        }
        break;
      case 8:
        if (this.diceRollAudioFile8) {
          this.diceRollAudioFile8.play();
        }
        break;
      case 9:
        if (this.diceRollAudioFile9) {
          this.diceRollAudioFile9.play();
        }
        break;
      case 10:
        if (this.diceRollAudioFile10) {
          this.diceRollAudioFile10.play();
        }
      case 11:
        if (this.deckDoc_diceRollAudioFile11) {
          this.deckDoc_diceRollAudioFile11.play();
        }

        break;

      default:
        if (this.audioFile) {
          this.audioFile.play();
        }
        break;
    }
  }

  onKeyUp(event: any, window: Window): void {
    switch (event.keyCode) {
      case 38:  // Up Arrow
        this.UpArrow(window);
        break;
      case 40:  // Down Arrow
        this.DowmArrow(window);
        break;
    }
  }

  UpArrow(window) {
    if (!window.newMessage) {
      window.recentMessageCount = 0;
    }
    let diceMsgs = this.getSentMessages(window);
    if (window.recentMessageCount < diceMsgs.length) {
      window.recentMessageCount = window.recentMessageCount + 1;
      window.newMessage = diceMsgs[window.recentMessageCount - 1];
    }
  }

  DowmArrow(window) {
    if (!window.newMessage) {
      window.recentMessageCount = 0;
    }
    let diceMsgs = this.getSentMessages(window);
    if (window.recentMessageCount != 0) {
      window.recentMessageCount = window.recentMessageCount - 1;
      window.newMessage = diceMsgs[window.recentMessageCount - 1];
    }
  }

  getSentMessages(window) {
    let lastMsg = '';
    let sentMsgs = [];
    let diceMsgs = [];
    if (window.messages) {
      window.messages.map(x => {
        if (x.fromId == this.userId && !x.isSystemGenerated) {
          sentMsgs.push(x);
        }
        //if (!x.isSystemGenerated) {
        //  lastMsg = x.message;
        //}
      });

      //sentMsgs.map(sm => {
      //  if (sm.message.indexOf("ng-chat-diceRoll-message") > -1) {
      //    sm.message = sm.message.replace(/\"/g, "'");
      //    let txt = this.getMessageText(sm.message);
      //    if (txt) {
      //      diceMsgs.push('/r ' +txt);
      //    }
      //  }
      //});
      //if (!(lastMsg.indexOf("ng-chat-diceRoll-message") > -1)) {
      //  diceMsgs.push(lastMsg);
      //}

      sentMsgs.map(sm => {
        sm.message = sm.message.replace(/\"/g, "'");
        if (sm.message.indexOf("ng-chat-diceRoll-message") > -1) {
          let txt = this.getMessageText(sm.message);
          if (txt) {
            if (DiceService.checkPrivatePublicCommand(txt)) {
              diceMsgs.push(txt);
            } else {
              //if (txt.startsWith('/r')) {
              //  diceMsgs.push(txt);
              //} else {
              diceMsgs.push('/r ' + txt);
              //}
            }
          }
        } else {
          diceMsgs.push(sm.message);
        }
      });

      diceMsgs = diceMsgs.reverse();
      return diceMsgs;
    }
  }

  getMessageText(msg) {
    try {      let frag = document.createRange().createContextualFragment(msg);      let firstDiv = frag.querySelector('.command-toRoll-text');      if (firstDiv) {
        msg = firstDiv.textContent;
      } else {        msg = '';
      }
      frag = null;
      firstDiv = null;

    }
    catch (e) {

    }
    return msg;
  }

  openChatInNewTab() {
    this.appService.updateOpenChatInNewTab(true);
  }
  openChatInPreviousTab() {
    this.appService.updateOpenChatInPreviousTab(true);
  }

  closeCombatChat() {
    this.appService.updateCloseCombatChat(true);
  }

  getCombatantDetails(showLoader = true) {
    this.isRulesetCombat = this.localStorage.localStorageGetItem(DBkeys.IsRulesetCombat);
    if (showLoader) {
      this.isLoading = true;
    }
    this.combatService.getCombatDetails(this.ruleset.ruleSetId, false, 0).subscribe(res => {
      if (res) {
        let combatModal: any = res;
        this.roundCounter = combatModal.round;
        this.showCombatOptions = combatModal.isStarted;
        this.CombatId = combatModal.id
        this.rulesetModel = combatModal.campaign;
        //this.setHeaderValues(this.rulesetModel);
        this.settings = combatModal.combatSettings;

        this.combatants = combatModal.combatantList;

        let characterFlag = false;
        this.charXPStatNames = [];
        this.charHealthStatNames = [];
        this.combatants.map(x => {
          if (x.type == combatantType.CHARACTER && !characterFlag) {
            characterFlag = true;
            if (x.character.diceRollViewModel && x.character.diceRollViewModel.charactersCharacterStats && x.character.diceRollViewModel.charactersCharacterStats.length) {
              x.character.diceRollViewModel.charactersCharacterStats.map(ccs => {
                if (ccs.characterStat && ccs.characterStat.statName) {
                  if (ccs.characterStat.characterStatTypeId == STAT_TYPE.Number) {
                    this.charXPStatNames.push('[' + ccs.characterStat.statName + ']');
                    this.charHealthStatNames.push('[' + ccs.characterStat.statName + ']');
                  }
                  else if (ccs.characterStat.characterStatTypeId == STAT_TYPE.CurrentMax) {
                    this.charHealthStatNames.push('[' + ccs.characterStat.statName + ']');
                  }
                  else if (ccs.characterStat.characterStatTypeId == STAT_TYPE.ValueSubValue) {
                    this.charHealthStatNames.push('[' + ccs.characterStat.statName + ']');
                  }
                  else if (ccs.characterStat.characterStatTypeId == STAT_TYPE.Combo) {
                    this.charHealthStatNames.push('[' + ccs.characterStat.statName + ']');
                  }
                }
              });
            }

          }
        });

        let isFrameSelected_Flag = false;
        this.combatants.map((x) => {
          //for character layer View
          x.isOwnPlayer = true;

          x.initiativeValue = x.initiative;
          if (!x.combatId) {
            x.combatId = combatModal.id;
          }
          if (!x.visibilityColor) {
            if (x.type == CombatItemsType.CHARACTER) {
              x.visibilityColor = "green";
            }
            else if (x.type == CombatItemsType.MONSTER) {
              x.visibilityColor = "red";
            }
          }

          if (x.type == CombatItemsType.CHARACTER) {
            if (x.character.diceRollViewModel.charactersCharacterStats) {
              let statFoundFlag: boolean = false;
              let charStat: CharactersCharacterStat = null;
              this.settings.charcterHealthStats.split(/\[(.*?)\]/g).map((rec) => {
                if (rec && !statFoundFlag) {
                  let charStatList = x.character.diceRollViewModel.charactersCharacterStats.filter(x => x.characterStat.statName.toUpperCase() == rec.toUpperCase());
                  if (charStatList.length) {
                    charStat = charStatList[0];
                  }
                  statFoundFlag = true;
                }
              });

              x.character.healthCurrent = this.DummyValueForCharHealthStat;
              x.character.healthMax = this.DummyValueForCharHealthStat;
              if (charStat) {
                x.character.charStat = charStat;
                x.character.healthStatId = charStat.charactersCharacterStatId;
                if (charStat.characterStat.characterStatTypeId == STAT_TYPE.CurrentMax) {
                  x.character.healthCurrent = +charStat.current;
                  x.character.healthMax = +charStat.maximum;
                }
                else if (charStat.characterStat.characterStatTypeId == STAT_TYPE.ValueSubValue) {
                  x.character.healthCurrent = +charStat.value;
                  x.character.healthMax = +charStat.subValue;
                }
                else if (charStat.characterStat.characterStatTypeId == STAT_TYPE.Number) {
                  x.character.healthCurrent = +charStat.number;
                }
                else if (charStat.characterStat.characterStatTypeId == STAT_TYPE.Combo) {
                  x.character.healthCurrent = +charStat.defaultValue;
                }
              }
            }
          }

          if (x.isCurrentSelected) {
            //this.frameClick(x);
            isFrameSelected_Flag = true
          }
        });

        // Game Time
        //this.gametime = this.time_convert(this.settings.gameRoundLength);
        //if (!isFrameSelected_Flag) {
        //  if (this.combatants.length) {
        //    this.frameClick(this.combatants[0]);
        //  }
        //}

        //this.isCharacterItemEnabled = combatModal.isCharacterItemEnabled;
        //this.isCharacterSpellEnabled = combatModal.isCharacterSpellEnabled;
        //this.isCharacterAbilityEnabled = combatModal.isCharacterAbilityEnabled;

        //let curretnCombatantList = this.combatants.filter(x => x.isCurrentTurn);
        //if (curretnCombatantList.length) {
        //  this.curretnCombatant = curretnCombatantList[0];
        //  let valueofinitiative = this.curretnCombatant.initiativeValue;
        //  this.CurrentInitiativeValue = valueofinitiative;
        //}

        //if (this.roundCounter > 1) {
        //  ////convert time
        //  let roundTime = this.settings.gameRoundLength * this.roundCounter;
        //  this.gametime = this.time_convert(roundTime);
        //}

        //if (!(selectedDeployedMonsters && selectedDeployedMonsters.length)) {

        //  selectedDeployedMonsters = [];
        //  let monsterCombatants = this.combatants.filter(x => (x.type == combatantType.MONSTER && x.initiative == null));
        //  monsterCombatants.map((m) => {
        //    selectedDeployedMonsters.push(m.monster);
        //  })
        //}
        //if (selectedDeployedMonsters && selectedDeployedMonsters.length) {
        //  let resultOfGroupInitiative = 0;
        //  let resultOfGroupInitiativeFilled_Flag = false;
        //  selectedDeployedMonsters.map((rec_deployedMonster) => {

        //    this.combatants.map((rec_C) => {

        //      if (rec_C.type == combatantType.MONSTER && rec_C.monsterId == rec_deployedMonster.monsterId) {

        //        if (this.settings && this.settings.groupInitiative) {

        //          rec_C.initiativeCommand = this.settings.groupInitFormula;
        //        }

        //        let res: any;

        //        // Start code to get common value for monsters
        //        if (this.settings && this.settings.groupInitiative) {
        //          let monsterInitativeValue = [];
        //          this.combatants.map(x => {
        //            if (x.type == combatantType.MONSTER) {
        //              monsterInitativeValue.push(x.initiativeValue);
        //            }
        //          });

        //          var mostCommon = 1;
        //          var m = 0;
        //          var mostCommonInitativeValue;
        //          for (var i = 0; i < monsterInitativeValue.length; i++) {
        //            for (var j = i; j < monsterInitativeValue.length; j++) {
        //              if (monsterInitativeValue[i] == monsterInitativeValue[j])
        //                m++;
        //              if (mostCommon < m) {
        //                mostCommon = m;
        //                mostCommonInitativeValue = monsterInitativeValue[i];
        //              }
        //            }
        //            m = 0;
        //          }
        //          res = mostCommonInitativeValue;

        //          //this.combatants.map(x => {
        //          //  if (x.type == combatantType.MONSTER) {
        //          //    x.initiativeValue = mostCommonInitativeValue;
        //          //  }
        //          //});
        //        }
        //        else {
        //          res = DiceService.rollDiceExternally(this.alertService, rec_C.initiativeCommand, this.customDices);
        //        }
        //        // End code to get common value for monsters



        //        if (this.settings && this.settings.groupInitiative && !resultOfGroupInitiativeFilled_Flag) {
        //          if (isNaN(res)) {
        //            resultOfGroupInitiative = 0;
        //          } else {
        //            resultOfGroupInitiative = res;
        //          }
        //          resultOfGroupInitiativeFilled_Flag = true;
        //        }
        //        if (this.settings && this.settings.groupInitiative && resultOfGroupInitiativeFilled_Flag) {
        //          rec_C.initiativeValue = resultOfGroupInitiative;
        //        } else {
        //          if (isNaN(res)) {
        //            rec_C.initiativeValue = 0;
        //          } else {
        //            rec_C.initiativeValue = res;
        //          }
        //        }

        //        rec_C.initiative = rec_C.initiativeValue;
        //        rec_deployedMonster.initiativeValue = rec_C.initiativeValue;

        //      }
        //    });
        //  });

        //  selectedDeployedMonsters.sort((a, b) => b.initiativeValue - a.initiativeValue);

        //  let Oldcombatants = Object.assign([], this.combatants);
        //  let newcombatants = [];
        //  selectedDeployedMonsters.map((rec_deployedMonster) => {
        //    if (Oldcombatants.find(x => x.monsterId != rec_deployedMonster.monsterId)) {
        //      newcombatants.push(Oldcombatants.find(x => x.type == combatantType.MONSTER && x.monsterId == rec_deployedMonster.monsterId));

        //    }
        //    Oldcombatants = Oldcombatants.filter(x => x.monsterId != rec_deployedMonster.monsterId);


        //  })
        //  newcombatants.map((rec_deployedMonster) => {
        //    var insertedIndex = Oldcombatants.push(rec_deployedMonster);
        //    insertedIndex = insertedIndex - 1;

        //    let combatant_List = Object.assign([], Oldcombatants);
        //    combatant_List.sort((a, b) => b.initiativeValue - a.initiativeValue || a.type.localeCompare(b.type));

        //    let NewIndexToAdd = combatant_List.findIndex(x => x.type == combatantType.MONSTER && x.monsterId == rec_deployedMonster.monsterId);

        //    Oldcombatants.splice(insertedIndex, 1);
        //    Oldcombatants.splice((NewIndexToAdd), 0, rec_deployedMonster);
        //  })
        //  Oldcombatants.map((rec, rec_index) => {
        //    rec.sortOrder = rec_index + 1;
        //  });
        //  this.combatants = Oldcombatants;
        //  if (this.showCombatOptions) {
        //    this.combatService.saveSortOrder(this.combatants).subscribe(res => {

        //      this.combatService.saveCombatantList(this.combatants, this.ruleset.ruleSetId).subscribe(res => {
        //        this.combatService.markCombatAsUpdatedFlag(this.CombatId).subscribe(res => {

        //        }, error => {

        //        });

        //      }, error => {
        //        let Errors = Utilities.ErrorDetail("", error);
        //        if (Errors.sessionExpire) {
        //          this.authService.logout(true);
        //        } else {
        //          this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        //        }
        //      });

        //    }, error => {
        //      let Errors = Utilities.ErrorDetail("", error);
        //      if (Errors.sessionExpire) {
        //        this.authService.logout(true);
        //      } else {
        //        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        //      }
        //    });

        //  }

        //}
        //if (!this.refreshPCDataModel) {
        //  this.refreshPCDataModelPageData();
        //}
        //this.BindMonstersName();
        this.isLoading = false;
      }
    }, error => {
      this.isLoading = false;
      let Errors = Utilities.ErrorDetail("", error);
      if (Errors.sessionExpire) {
        this.authService.logout(true);
      } else {
        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
      }
    });
  }

  prevTurn() {
    let skipIsCurrentTurnCheck: boolean = false;
    let skipIsCurrentTurnCheck_Count: number = 0;
    for (let i = 0; i < this.combatants.length; i++) {
      if ((this.combatants[i].isCurrentTurn && this.combatants[i - 1]) || skipIsCurrentTurnCheck) {
        this.combatants[i].isCurrentTurn = false;

        let indexToSetCurrentTurn = i - 1;

        this.combatants[indexToSetCurrentTurn].isCurrentTurn = true;
        this.currentCombatant = this.combatants[indexToSetCurrentTurn];
        let valueofinitiative = this.combatants[indexToSetCurrentTurn].initiativeValue;
        this.CurrentInitiativeValue = valueofinitiative;

        if (this.combatants[indexToSetCurrentTurn].delayTurn) {
          // this.combatants[i].isCurrentTurn = true;
          this.prevTurn();
          break;
        }

        this.SaveCombatantTurn(this.currentCombatant, this.roundCounter);
        //this.frameClick(this.currentCombatant)


        return;
      }

      else if (!this.combatants[i - 1] && this.roundCounter > 1 && this.combatants[i].isCurrentTurn) {
        let index = this.combatants.length - 1;
        this.combatants[i].isCurrentTurn = false;
        //if (this.combatants[i + index].delayTurn) {
        //  goToPreviousTurn = true;
        //  continue;
        //}
        this.currentCombatant = this.combatants[i + index];
        this.combatants[i + index].isCurrentTurn = true;
        let valueofinitiative = this.combatants[i + index].initiativeValue;
        this.CurrentInitiativeValue = valueofinitiative;

        if (this.combatants[i + index].delayTurn) {
          // this.combatants[i].isCurrentTurn = true;
          this.roundCounter = this.roundCounter - 1;
          //convert time
          let roundTime = this.settings.gameRoundLength * this.roundCounter;
          this.gametime = this.time_convert(roundTime);
          this.prevTurn();
          break;
        }

        this.roundCounter = this.roundCounter - 1;
        //convert time
        let roundTime = this.settings.gameRoundLength * this.roundCounter;
        this.gametime = this.time_convert(roundTime);
        this.SaveCombatantTurn(this.currentCombatant, this.roundCounter);
        //this.frameClick(this.curretnCombatant)
        return;
      }
    }

  }
  nextTurn(DontSave: boolean = false) {
    let skipIsCurrentTurnCheck: boolean = false;
    for (let i = 0; i < this.combatants.length; i++) {
      if ((this.combatants[i].isCurrentTurn == true && this.combatants[i + 1]) || (skipIsCurrentTurnCheck && this.combatants[i + 1])) {
        this.combatants[i].isCurrentTurn = false;
        if (this.combatants[i + 1].delayTurn) {
          skipIsCurrentTurnCheck = true;
          continue;
        }
        this.combatants[i + 1].isCurrentTurn = true;
        this.currentCombatant = this.combatants[i + 1];
        let valueofinitiative = this.combatants[i + 1].initiativeValue;
        this.CurrentInitiativeValue = valueofinitiative;
        if (!DontSave) {
          this.SaveCombatantTurn(this.currentCombatant, this.roundCounter);
        }
        //this.frameClick(this.currentCombatant)
        return;
      }
      else if (!this.combatants[i + 1]) {
        //if (this.roundCounter != 0 && this.settings.rollInitiativeEveryRound) {
        //  //this.Init(true);
        //}
        this.combatants[i].isCurrentTurn = false;
        if (this.combatants[i - i].delayTurn) {
          i = -1;
          skipIsCurrentTurnCheck = true;
          this.roundCounter = this.roundCounter + 1;
          //convert time
          let roundTime = this.settings.gameRoundLength * this.roundCounter;
          this.gametime = this.time_convert(roundTime);
          continue;
        }
        this.combatants[i - i].isCurrentTurn = true;
        this.currentCombatant = this.combatants[i - i];
        let valueofinitiative = this.combatants[i - i].initiativeValue;
        this.CurrentInitiativeValue = valueofinitiative;

        this.roundCounter = this.roundCounter + 1;
        //convert time
        let roundTime = this.settings.gameRoundLength * this.roundCounter;
        this.gametime = this.time_convert(roundTime);
        if (!DontSave) {
          this.SaveCombatantTurn(this.currentCombatant, this.roundCounter);
        }
        //this.frameClick(this.curretnCombatant)
        return;
      }

    }
  }

  //game Time conversion
  time_convert(value) {
    let pad = function (num, size) { return ('000' + num).slice(size * -1); };
    let time = value;
    let hours = Math.floor(time / 60 / 60);
    let minutes = Math.floor(time / 60) % 60;
    let seconds = Math.floor(time - minutes * 60);
    if (hours) {
      return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2)
    } else {
      return pad(minutes, 2) + ':' + pad(seconds, 2)
    }
  }

  // Current Turn
  SaveCombatantTurn(curretnCombatant, roundCount) {
    this.combatService.saveCombatantTurn(curretnCombatant, roundCount).subscribe(res => {
      let result = res;
      this.appService.updateCombatantDetailFromChat(true);
    }, error => {
      let Errors = Utilities.ErrorDetail("", error);
      if (Errors.sessionExpire) {
        this.authService.logout(true);
      } else {
        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
      }
    });
  }

}
