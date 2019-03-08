import { Component, Input, OnInit } from '@angular/core';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { Characters } from '../../core/models/view-models/characters.model';
import { AlertService, DialogType } from '../../core/common/alert.service';
import { DiceRollComponent } from '../dice/dice-roll/dice-roll.component';
import { PlatformLocation } from '@angular/common';

class Command {
    name: string = '';
    imageUrl: string = '';
  command: string = '';
  itemImage: string = '';
  commandName: string = '';
}


@Component({
    selector: 'app-cast',
    templateUrl: './cast.component.html',
    styleUrls: ['./cast.component.scss']
})
export class CastComponent implements OnInit {

    title: string;
    castModel: any;
    ListCommands: Command[] = []
    Command: Command = new Command();
    CommandData: any = new Command();
    character: Characters = new Characters();
    buttonText: string;
    recordType: string;
    recordId: string;
    constructor(
        public modalService: BsModalService, private bsModalRef: BsModalRef, private alertService: AlertService,
   
     private location: PlatformLocation) {
      location.onPopState(() => this.modalService.hide(1)); 
       // console.log('Here the cast controller...');
    }

    ngOnInit() {
        setTimeout(() => {
            this.title = this.bsModalRef.content.title;
            this.ListCommands = this.bsModalRef.content.ListCommands;
            this.Command = this.bsModalRef.content.Command;
            this.CommandData = this.bsModalRef.content.Command;
            this.character = this.bsModalRef.content.Character;
            this.buttonText = this.bsModalRef.content.ButtonText ? this.bsModalRef.content.ButtonText : undefined;
            this.recordType = this.bsModalRef.content.recordType;
            this.recordId = this.bsModalRef.content.recordId;
        }, 0);
    }
    useCommand(Command: any) {
        let msg = "The command value for " + Command.name
            + " has not been provided. Edit this record to input one.";
        if (Command.command == undefined || Command.command == null || Command.command == '') {
            this.alertService.showDialog(msg, DialogType.alert, () => this.useCommandHelper(Command));
        }
        else {
            //TODO
            this.useCommandHelper(Command);
        }
    }
    private useCommandHelper(Command: any) {
        this.bsModalRef.hide();
        this.bsModalRef = this.modalService.show(DiceRollComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = "Dice";
        this.bsModalRef.content.tile = -2;
        this.bsModalRef.content.characterId = this.character.characterId;
        this.bsModalRef.content.character = this.character;
        this.bsModalRef.content.command = Command.command;
        this.bsModalRef.content.recordType = this.recordType;
        this.bsModalRef.content.recordId = this.recordId;
        
        if (this.CommandData.hasOwnProperty("itemId")) {
            this.bsModalRef.content.recordName = this.CommandData.name;
            this.bsModalRef.content.recordImage = this.CommandData.itemImage;
        }
        else if (this.CommandData.hasOwnProperty("spellId")) {
            this.bsModalRef.content.recordName = this.CommandData.name;
            this.bsModalRef.content.recordImage = this.CommandData.imageUrl;
        }
        else if (this.CommandData.hasOwnProperty("abilityId")) {
            this.bsModalRef.content.recordName = this.CommandData.name;
            this.bsModalRef.content.recordImage = this.CommandData.imageUrl;
        }
        this.bsModalRef.content.event.subscribe(result => {
        });
    }
    close() {
        this.bsModalRef.hide();
    }
}
