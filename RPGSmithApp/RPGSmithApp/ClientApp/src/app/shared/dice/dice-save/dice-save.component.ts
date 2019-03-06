import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { CharacterCommand } from "../../../core/models/view-models/character-command.model";
import { AuthService } from "../../../core/auth/auth.service";
import { SharedService } from "../../../core/services/shared.service";
import { AlertService, MessageSeverity, DialogType } from "../../../core/common/alert.service";
import { CharacterCommandService } from "../../../core/services/character-command.service";
import { DiceService } from "../../../core/services/dice.service";
import { Utilities } from "../../../core/common/utilities";
import { DiceComponent } from "../dice/dice.component";
import { PlatformLocation } from "@angular/common";

@Component({
    selector: "app-dice-save",
    templateUrl: './dice-save.component.html',
    styleUrls: ['./dice-save.component.scss']
})

export class DiceSaveComponent implements OnInit {
    isLoading: boolean;
    title: string;
    view: string;
    command: string;
    diceSection: boolean;
    rollSection: boolean;
    characterCommand: any = new CharacterCommand();
    characterId: number;
    addModArray: any;
    private readonly AND_Error_Message: string = "Only 4 ‘AND’s allowed in one command string. Please update your command and try again.";
    private readonly COMMAND_Error = "Invalid Command. Please check the command string and try again.";
    private HasError: number;

    constructor(
        public modalService: BsModalService, private bsModalRef: BsModalRef, private sharedService: SharedService,
        private alertService: AlertService, private authService: AuthService,
        private characterCommandService: CharacterCommandService

      , private location: PlatformLocation) {
      location.onPopState(() => this.modalService.hide(1)); 
        this.diceSection = true;
        this.rollSection = false;
    }

    ngOnInit(){
        setTimeout(() => {
            this.title = this.bsModalRef.content.title;
            this.characterId = this.bsModalRef.content.characterId;
            this.addModArray = this.bsModalRef.content.addModArray;
            let _command = this.bsModalRef.content.characterCommand;
            _command.command = this.bsModalRef.content.command;
            _command.character = this.bsModalRef.content.character;
            _command.characterId = this.bsModalRef.content.characterId;
            this.view = this.bsModalRef.content.view;
            this.characterCommand = this.characterCommandService.commandModelData(_command, this.view);            
        }, 0);
    }

    validateCommandOnChange(command: string) {
        //add mod & validate command
        if (!command) {
            this.alertService.showMessage("Please enter a command.", "", MessageSeverity.error);
        }
        else if (command.trim() == '') {
            this.alertService.showMessage("Please enter a command.", "", MessageSeverity.error);
        }
        else {
            let commandToValidate = command.trim();
            commandToValidate = commandToValidate.toUpperCase();
            if (commandToValidate.length >= 250) {
                this.alertService.showMessage("A maximum of 250 characters is allowed for a command. Please adjust your command string and try again.", "", MessageSeverity.error);
                return false;
            }
            else {
                let AND_LIMIT = DiceService.splitWithoutEmpty(commandToValidate, 'AND');
                if (AND_LIMIT.length > 5) {
                    this.alertService.resetStickyMessage();
                    this.alertService.showStickyMessage('', this.AND_Error_Message, MessageSeverity.error);
                    setTimeout(() => { this.alertService.resetStickyMessage(); }, 1000);
                    return false;
                }

                //add mod & validate command            
                //let commandToValidate = command.trim();
                this.addModArray.map(mod => {
                    //let charactersCharacterStatId = mod.charactersCharacterStatId;
                    //let selectedStatValue = mod.selectedStatValue;
                    let selectedStat: string = mod.selectedStat;
                    commandToValidate = commandToValidate.replace(selectedStat.toUpperCase(), "D");
                });

                let isValidCommand = DiceService.validateCommandTextNew(commandToValidate);
                if (!isValidCommand) {
                    this.alertService.resetStickyMessage();
                    this.alertService.showStickyMessage('', this.COMMAND_Error, MessageSeverity.error);
                    setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
                    return false;
                }
            }
        }
    }

    submitForm(characterCommand: any) {

        let command = characterCommand.command;

        if (!command) {
            this.alertService.showMessage("Please enter a command.", "", MessageSeverity.error);
        }
        else if (command.trim() == '') {
            this.alertService.showMessage("Please enter a command.", "", MessageSeverity.error);
        }
        else {
            let commandToValidate = command.trim();
            commandToValidate = commandToValidate.toUpperCase();
            if (commandToValidate.length >= 250) {
                this.alertService.showMessage("A maximum of 250 characters is allowed for a command. Please adjust your command string and try again.", "", MessageSeverity.error);
                return false;
            }
            else {
                let AND_LIMIT = DiceService.splitWithoutEmpty(commandToValidate, 'AND');
                if (AND_LIMIT.length > 5) {
                    this.alertService.resetStickyMessage();
                    this.alertService.showStickyMessage('', this.AND_Error_Message, MessageSeverity.error);
                    setTimeout(() => { this.alertService.resetStickyMessage(); }, 1000);
                    return false;
                }

                //add mod & validate command            
                //let commandToValidate = command.trim();
                this.addModArray.map(mod => {
                    //let charactersCharacterStatId = mod.charactersCharacterStatId;
                    //let selectedStatValue = mod.selectedStatValue;
                    let selectedStat: string = mod.selectedStat;
                    commandToValidate = commandToValidate.replace(selectedStat.toUpperCase(), "D");
                });

                let isValidCommand = DiceService.validateCommandTextNew(commandToValidate);
                if (!isValidCommand) {
                    this.alertService.resetStickyMessage();
                    this.alertService.showStickyMessage('', this.COMMAND_Error, MessageSeverity.error);
                    setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
                    return false;
                }

                this.characterCommandService.addOrEdit<any>(characterCommand)
                    .subscribe(
                        data => {
                            this.isLoading = false;
                            this.alertService.stopLoadingMessage();
                            this.alertService.showMessage("Command has been saved.", "", MessageSeverity.success);
                            this.bsModalRef.hide();
                            //this.destroyModalOnInit();
                            this.sharedService.UpdateDice(true);
                        },
                        error => {
                            this.isLoading = false;
                            this.alertService.stopLoadingMessage();
                            let _message = characterCommand.view == "SAVE" ? "Unable to Add " : "Unable to Update ";
                            let Errors = Utilities.ErrorDetail(_message, error);
                            if (Errors.sessionExpire) {
                                //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                                this.authService.logout(true);
                            }
                            else
                                this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                        },
                );
            }
        }
    }

    saveDiceCommand() {
        this.bsModalRef.hide();
    }

    delete(characterCommand: CharacterCommand) {
        this.alertService.showDialog('Are you sure you want to delete this Command?',
            DialogType.confirm, () => this.deleteCommandHelper(characterCommand), null, 'Yes', 'No');
    }

    private deleteCommandHelper(characterCommand: CharacterCommand) {
        
        this.isLoading = true;
        this.characterCommandService.delete<any>(characterCommand.characterCommandId)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    this.alertService.showMessage("Command has been deleted.", "", MessageSeverity.success);
                    this.bsModalRef.hide();
                    //this.destroyModalOnInit();
                    this.sharedService.UpdateDice(true);
                },
                error => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let Errors = Utilities.ErrorDetail("Unable to delete", error);
                    if (Errors.sessionExpire) {
                        //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                },
        );
    }

    close() {
        this.bsModalRef.hide();
    }

    openDiceModal() {
        this.bsModalRef = this.modalService.show(DiceComponent, {
            class: 'modal-primary modal-md dice-screen',
            ignoreBackdropClick: true,
            keyboard: false
        });    
        this.bsModalRef.content.title = "Dice"
    }

}