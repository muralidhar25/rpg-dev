import { Component, OnInit, EventEmitter } from "@angular/core";
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { DiceService } from "../../../core/services/dice.service";
import { CharacterCommand } from "../../../core/models/view-models/character-command.model";
import { DiceRoll } from "../../../core/models/view-models/dice-roll.model";
import { DiceTray, CustomDice, DefaultDice } from "../../../core/models/view-models/custome-dice.model";
import { AuthService } from "../../../core/auth/auth.service";
import { CharacterCommandService } from "../../../core/services/character-command.service";
import { LocalStoreManager } from "../../../core/common/local-store-manager.service";
import { SharedService } from "../../../core/services/shared.service";
import { CharactersService } from "../../../core/services/characters.service";
import { User } from "../../../core/models/user.model";
import { DBkeys } from "../../../core/common/db-keys";
import { DiceSaveComponent } from "../dice-save/dice-save.component";
import { NumericCharacterStatComponent } from "../../numeric-character-stats/numeric-character-stat.component";
import { PlatformLocation } from "@angular/common";
import { EditorCommandComponent } from "../../editor-link-button/command/command.component";
import { Characters } from "../../../core/models/view-models/characters.model";
import { Utilities } from "../../../core/common/utilities";
import { AlertService } from "../../../core/common/alert.service";

@Component({
  selector: "app-dice",
  templateUrl: './dice.component.html',
  styleUrls: ['./dice.component.scss'],
  providers: [DiceService]
})

export class DiceComponent implements OnInit {

  isLoading: boolean;
  title: string;
  diceSection: boolean;
  rollSection: boolean;
  characterId: number;
  rulesetId: number;
  parentPage: string;
  parentInputIndex: number;
  characterCommandModel: any = new CharacterCommand();
  characterCommandData: any;
  diceRollModel: any = new Array<DiceRoll>();
  diceTray: DiceTray[] = [];
  customDices: CustomDice[] = [];
  defaultDices: DefaultDice[] = [];

  isFromEditor: boolean = false;
  commandContent: string;
  commandTitle: any;
  editorHtml: any;
  character: Characters = new Characters();
  charactersCharacterStats: any;
  statdetails: any;
  isFromCurrency: boolean = false;

  constructor(
    public modalService: BsModalService, private bsModalRef: BsModalRef, private bsModalRef2: BsModalRef, private authService: AuthService,
    private characterCommandService: CharacterCommandService, private _diceService: DiceService,
    private localStorage: LocalStoreManager, private sharedService: SharedService, private charactersService: CharactersService,
    private alertService: AlertService, private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1));
    this.diceSection = true;
    this.rollSection = false;
  }

  ngOnInit() {
    setTimeout(() => {
      //this.rulesetId = 0;
      this.diceTray = [];
      this.customDices = [];
      this.defaultDices = [];
      if (this.bsModalRef.content.characterId) {
        this.characterId = this.bsModalRef.content.characterId;
      }
      else {
        this.characterId = 0;
        if (this.bsModalRef.content.rulesetId) {
          this.rulesetId = this.bsModalRef.content.rulesetId;
        }
      }

      this.isFromEditor = this.bsModalRef.content.isFromEditor ? this.bsModalRef.content.isFromEditor : false;
      this.isFromCurrency = this.bsModalRef.content.isFromCurrency ? this.bsModalRef.content.isFromCurrency : false;

      if (this.isFromEditor) {
        this.commandTitle = this.bsModalRef.content.commandTitle;
        this.commandContent = this.bsModalRef.content.commandContent;
        this.editorHtml = this.bsModalRef.content.editor;
      }

      this.isLoading = true;
      this.charactersService.getDiceTray<any>(this.rulesetId, this.characterId)
        .subscribe(data => {
          let model: any = data;

          this.customDices = model.customDices;
          this.diceTray = model.diceTray;
          this.defaultDices = model.defaultDices;

          this.BindData();
          this.isLoading = false;
        }, error => {
          this.diceTray = [];
          this.customDices = [];
          this.defaultDices = [];
          this.BindData();
          this.isLoading = false;
        }, () => { });

      try {
        document.getElementsByClassName('modal-md dice-screen modal-with-max-zindex')[0].parentElement.style.zIndex = '99999999999';
      } catch (e) { }

    }, 0);
  }
  private BindData() {
    this.title = this.bsModalRef.content.title;
    this.characterId = this.bsModalRef.content.characterId;
    this.parentInputIndex = this.bsModalRef.content.inputIndex;
    if (this.diceTray) {
      if (this.diceTray.length > 0) {
        this.diceRollModel = this.characterCommandService.DiceRollDataFromDiceTray(this.characterId, this.customDices, this.diceTray, this.defaultDices);
      }
      else {
        this.diceRollModel = this.characterCommandService.DiceRollData(this.characterId);
      }
    }
    else {
      this.diceRollModel = this.characterCommandService.DiceRollData(this.characterId);
    }
    if (this.bsModalRef.content.parentCommand !== '' || this.bsModalRef.content.parentCommand !== undefined || this.bsModalRef.content.parentCommand !== null) {
      this.characterCommandModel.command = this.bsModalRef.content.parentCommand;
      this.characterCommandModel = this.characterCommandService.commandModelData(this.characterCommandModel, "UPDATE");
      let _command = this.bsModalRef.content.parentCommand ? this.bsModalRef.content.parentCommand.toUpperCase() : '';
      this.characterCommandModel.command = this.bsModalRef.content.parentCommand;
      this.characterCommandModel.characterCommandId = 0;
      //bind command-dice
      this.generateCommandFormula(_command, this.diceRollModel);
    } else {
      this.characterCommandModel = this.characterCommandService.commandModelData({}, "ADD");
    }

    this.initialize();
  }
  private initialize() {
    this.getData();
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      this.characterCommandService.getByCharacterId<any>(this.characterId)
        .subscribe(data => {

          this.characterCommandData = data;// this.characterCommandService.commandModelData(data, "UPDATE");
          this.isLoading = false;
        }, error => {
          this.isLoading = false;
          //let Errors = Utilities.ErrorDetail("", error);
          //if (Errors.sessionExpire) {
          //    //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          //    this.authService.logout(true);
          //}
        }, () => { });
    }
  }

  generateDiceCommand(dice: DiceRoll, characterCommandModel: CharacterCommand) {

    //To get dice calculation
    characterCommandModel = DiceService.generateDiceCommand(dice, characterCommandModel);
  }

  recycleDice() {

    //characterCommandModel.command = '';
    //characterCommandModel.lastResultNumbers = '';
    //characterCommandModel.lastResult = 0;
    if (this.diceTray) {
      if (this.diceTray.length > 0) {
        this.diceRollModel = this.characterCommandService.DiceRollDataFromDiceTray(this.characterId, this.customDices, this.diceTray, this.defaultDices);
      }
      else {
        this.diceRollModel = this.characterCommandService.DiceRollData(this.characterId);
      }
    }
    else {
      this.diceRollModel = this.characterCommandService.DiceRollData(this.characterId);
    }
    this.characterCommandModel = this.characterCommandService.commandModelData({}, "ADD");
  }

  commandOnDiceClick(dice: DiceRoll) {
    // characterCommandModel: CharacterCommand
    let _command = '';

    if (!this.characterCommandModel.command || this.characterCommandModel.command == '') {
      this.characterCommandModel.command = dice.dice;
      dice.rolledCount = 1;
    }
    else {

      _command = this.characterCommandModel.command;
      let cmdText: string = '';
      let diceExist: boolean = false;
      let _addPlus: string;

      //let diceRollList = DiceService.diceOnRollCount(_command, this.diceTray);
      let diceRollList = DiceService.diceOnSelectOnRoll(_command, false, this.diceTray);
      for (var val in diceRollList) {
        _addPlus = ' + ';
        if (diceRollList.length == (Number(val) + 1)) {
          _addPlus = '';
        }

        if (diceRollList[val].dice === dice.dice) {
          if (!diceExist) {
            dice.rolledCount = Number(diceRollList[val].diceRolledCount) + 1;
            let _diceCmd = dice.rolledCount + diceRollList[val].dice;
            cmdText += _diceCmd + _addPlus;
            diceExist = true;
          } else
            cmdText += diceRollList[val].commandText + _addPlus;
        } else
          cmdText += diceRollList[val].commandText + _addPlus;
      }
      if (!diceExist) {
        if (cmdText) {
          cmdText += ' + ' + dice.dice;
        } else {
          cmdText += dice.dice;
        }
      }

      _command = cmdText
      this.characterCommandModel.command = _command;
      this.generateCommandFormula(_command, this.diceRollModel);
    }
  }

  generateCommandFormula(command: string, diceRollModel: DiceRoll[]) {
    if (!command) return;

    command = command.toUpperCase();
    let diceRollList = DiceService.diceOnRollCount(command, this.diceTray);

    diceRollModel.forEach((val) => {
      val.rolledCount = 0;
    })
    for (var val in diceRollList) {

      var _diceRollModel = diceRollModel.find((dice) => dice.dice == diceRollList[val].dice);
      _diceRollModel.rolledCount = _diceRollModel.rolledCount + Number(diceRollList[val].diceRolledCount);

    }

    //diceRollModel.forEach(function (dice) {
    //    dice.rolledCount = 0;
    //    //diceRollList.forEach(function (val) {
    //    //    if (dice.dice === val.dice && dice.rolledCount == 0) {
    //    //        dice.rolledCount = val.diceRolledCount;
    //    //        return;
    //    //    }
    //    //});
    //});

    this.sharedService.UpdateDice(true);
  }

  private getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  onClickRoll() {
    this.diceSection = false;
    this.rollSection = true;
  }

  onClickDice() {
    this.diceSection = true;
    this.rollSection = false;
  }

  saveDiceCommand() {
    this.close();
    this.bsModalRef = this.modalService.show(DiceSaveComponent, {
      class: 'modal-primary modal-md modal-with-max-zindex',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "New Saved Command"
  }

  saveCommand(event, command) {
    this.close();
    this.characterCommandModel.parentIndex = this.parentInputIndex;
    if (this.isFromCurrency) {
      var diceResult = DiceService.rollDiceExternally(this.alertService, this.characterCommandModel.command, this.customDices, true)
      diceResult.parentIndex = this.parentInputIndex;
      this.sharedService.setCommandResultForCurrency(diceResult);
    }
    this.sharedService.setCommandData(this.characterCommandModel);
    this.closeevent.emit(this.characterCommandModel);
  }

  openEditorCommandPopup() {
    if (this.isFromEditor) {
      this.bsModalRef = this.modalService.show(EditorCommandComponent, {
        class: 'modal-primary modal-md modal-with-max-zindex',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef.content.title = 'Input Command';
      this.bsModalRef.content.characterId = this.characterId;
      this.bsModalRef.content.rulesetId = this.rulesetId;
      this.bsModalRef.content.commandTitle = this.commandTitle;
      this.bsModalRef.content.commandContent = this.characterCommandModel.command;
      this.bsModalRef.content.editor = this.editorHtml;
    }
  }

  close() {
    this.bsModalRef.hide();
    //this.closeevent.emit();
    this.destroyModal();
    if (this.isFromEditor) {
      this.openEditorCommandPopup();
    }
  }

  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }

  private destroyModal(): void {
    try {
      for (var i = 0; i < document.getElementsByClassName('dice-screen').length; i++) {
        document.getElementsByClassName('dice-screen')[i].parentElement.classList.remove('modal')
        document.getElementsByClassName('dice-screen')[i].parentElement.classList.remove('fade')
        document.getElementsByClassName('dice-screen')[i].parentElement.classList.remove('show')
        //document.getElementsByClassName('dice-screen')[i].parentElement.remove()
        document.getElementsByClassName('dice-screen')[i].parentElement.style.display = 'none'
      }
    } catch (err) { }
  }

  public closeevent: EventEmitter<any> = new EventEmitter();


  addMod() {
    if (this.characterId) {
      this.charactersService.getCharactersById<any>(this.characterId)
        .subscribe(data => {
          this.character = data;
        }, error => {
        }, () => {
          this.bsModalRef2 = this.modalService.show(NumericCharacterStatComponent, {
            class: 'modal-primary modal-md modal-with-max-zindex',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef2.content.characterId = this.characterId;
          this.bsModalRef2.content.character = this.character;
          this.bsModalRef2.content.characterCharStats = this.charactersCharacterStats;

          this.bsModalRef2.content.event.subscribe(data => {

            if (this.characterCommandModel.command != "" && this.characterCommandModel.command != null) {
              this.characterCommandModel.command = this.characterCommandModel.command + " + " + data.selectedStat;
            } else {
              this.characterCommandModel.command = data.selectedStat;
            }
          });

        });
    } else {
      this.bsModalRef2 = this.modalService.show(NumericCharacterStatComponent, {
        class: 'modal-primary modal-md modal-with-max-zindex',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef2.content.characterId = this.characterId;
      //charcter 
      this.bsModalRef2.content.character = this.character;
      this.bsModalRef2.content.characterCharStats = this.charactersCharacterStats;

      this.bsModalRef2.content.event.subscribe(data => {
        data.selectedStat = data.selectedStat.toString().toUpperCase();
        //this.addModArray.push(data);
        this.characterCommandModel.command = this.characterCommandModel.command
          ? this.characterCommandModel.command + ' + ' + data.selectedStat
          : data.selectedStat;
        
        this.bsModalRef2.hide();
      });
    }

  }



  private getData() {
    this.rulesetId = this.rulesetId ? this.rulesetId : this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

    this.charactersService.getDiceRollModel<any>(this.rulesetId, this.characterId)
      .subscribe(data => {
        this.isLoading = false;
        if (data) {
          this.character = data.character;
          this.characterCommandData = data.characterCommands;
          this.charactersCharacterStats = data.charactersCharacterStats;


          if (!this.characterId) {
            this.character = new Characters();
          }

          this.charactersCharacterStats.forEach(item => {
            item.number = item.number == 0 ? "" : item.number;
            item.current = item.current == 0 ? "" : item.current;
            item.maximum = item.maximum == 0 ? "" : item.maximum;
            item.value = item.value == 0 ? "" : item.value;
            item.subValue = item.subValue == 0 ? "" : item.subValue;
          });

          this.diceRollModel = this.characterCommandService.DiceRollData(this.characterId);
          let previousCommand = this.characterCommandModel.command;
          this.characterCommandModel = this.characterCommandService.commandModelData({ characterId: this.characterId, character: this.character }, "ADD");

          this.characterCommandModel.command = this.characterCommandModel.command ? this.characterCommandModel.command : previousCommand;

          let model: any = data;
          this.statdetails = { charactersCharacterStat: model.charactersCharacterStats, character: data.character };

          this.customDices = model.customDices;

          this.customDices = DiceService.BindDeckCustomDices(this.customDices);
          this.diceTray = model.diceTrays;
          this.defaultDices = model.defaultDices;
          let ruleset = model.ruleSet;
          if (this.diceTray)
            if (this.diceTray.length > 0) {
              this.diceRollModel = this.characterCommandService.DiceRollDataFromDiceTray(this.characterId, this.customDices, this.diceTray, this.defaultDices);
              // this.diceRolledData = this.characterCommandService.DiceRollDataFromDiceTray(this.characterId, this.customDices, this.diceTray, this.defaultDices);
            }

          setTimeout(() => {
            if (this.isLoading) this.isLoading = false;
          }, 200);
        }

      }, error => {
        this.isLoading = false;
        this.character = new Characters();
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      }, () => {


      });
  }

}
