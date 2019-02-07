import { Component, OnInit, EventEmitter } from "@angular/core";
import { Router } from '@angular/router';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { DiceSaveComponent } from '../dice-save/dice-save.component';
import { AuthService } from "./../../../core/auth/auth.service";
import { User } from '../../../core/models/user.model';
import { DICE, DICE_ICON, TILES } from '../../../core/models/enums';
import { CharacterCommand, DiceCommand } from '../../../core/models/view-models/character-command.model';
import { DiceRoll } from '../../../core/models/view-models/dice-roll.model';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { DBkeys } from "../../../core/common/db-keys";
import { CharacterCommandService } from '../../../core/services/character-command.service';
import { DiceService } from '../../../core/services/dice.service';
import { SharedService } from '../../../core/services/shared.service';
import { NumericCharacterStatComponent } from "../../numeric-character-stats/numeric-character-stat.component";
import { CharactersService } from "../../../core/services/characters.service";
import { DiceTray, CustomDice, DefaultDice } from "../../../core/models/view-models/custome-dice.model";

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

    constructor(
        public modalService: BsModalService, private bsModalRef: BsModalRef, private authService: AuthService,
        private characterCommandService: CharacterCommandService, private _diceService: DiceService,
        private localStorage: LocalStoreManager, private sharedService: SharedService, private charactersService: CharactersService
    ) {
        this.diceSection = true;
        this.rollSection = false;
    }

    ngOnInit(){
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

            let diceRollList = DiceService.diceOnRollCount(_command, this.diceTray);
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
                cmdText += ' + ' + dice.dice;
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

    onClickDice(){
        this.diceSection = true;
        this.rollSection = false;
    }

    saveDiceCommand() {
        this.close();
        this.bsModalRef = this.modalService.show(DiceSaveComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = "New Saved Command"
    }

    saveCommand(event,command) {
        this.close();
        this.characterCommandModel.parentIndex = this.parentInputIndex;
        this.sharedService.setCommandData(this.characterCommandModel);
        this.closeevent.emit(this.characterCommandModel);
    }

    close() {
        this.bsModalRef.hide();
        //this.closeevent.emit();
        this.destroyModal();
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

        this.bsModalRef = this.modalService.show(NumericCharacterStatComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.characterId = this.characterId;

        this.bsModalRef.content.event.subscribe(data => {

            if (this.characterCommandModel.command != "" && this.characterCommandModel.command != null) {
                this.characterCommandModel.command = this.characterCommandModel.command + " + " + data.selectedStat;
            } else {
                this.characterCommandModel.command = data.selectedStat;

            }

        });

    }

}
