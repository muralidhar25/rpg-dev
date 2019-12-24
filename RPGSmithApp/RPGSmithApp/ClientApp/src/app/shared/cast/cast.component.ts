import { Component, Input, OnInit } from '@angular/core';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { Characters } from '../../core/models/view-models/characters.model';
import { AlertService, DialogType, MessageSeverity } from '../../core/common/alert.service';
import { DiceRollComponent } from '../dice/dice-roll/dice-roll.component';
import { PlatformLocation } from '@angular/common';
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { Utilities } from '../../core/common/utilities';
import { ItemsService } from '../../core/services/items.service';
import { AuthService } from '../../core/auth/auth.service';
import { SharedService } from '../../core/services/shared.service';
import { DBkeys } from '../../core/common/db-keys';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';

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
  ruleset: Ruleset = new Ruleset();
  buttonText: string;
  recordType: string;
  recordId: string;
  displayRollResultInChat_AfterAllChecks: boolean = true;
  isConsumable: boolean = false;
  charStat: any;
  constructor(
    public modalService: BsModalService, private bsModalRef: BsModalRef, private alertService: AlertService,
    private itemsService: ItemsService, private authService: AuthService, private sharedService: SharedService,
    private location: PlatformLocation, private localStorage: LocalStoreManager) {
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
      this.ruleset = this.bsModalRef.content.Ruleset ? this.bsModalRef.content.Ruleset : new Ruleset();
      this.buttonText = this.bsModalRef.content.ButtonText ? this.bsModalRef.content.ButtonText : undefined;
      this.recordType = this.bsModalRef.content.recordType;
      this.recordId = this.bsModalRef.content.recordId;
      this.isConsumable = this.bsModalRef.content.isConsumable ? true : false;
      let isHavingCharStat = this.bsModalRef.content.charStat ? true : false;
      if (isHavingCharStat) {
        this.charStat = this.bsModalRef.content.charStat;
      }
      if (this.bsModalRef.content.displayRollResultInChat_AfterAllChecks == false) {
        this.displayRollResultInChat_AfterAllChecks = this.bsModalRef.content.displayRollResultInChat_AfterAllChecks;
      } else {
        this.displayRollResultInChat_AfterAllChecks = true;
      }

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
    if (this.ruleset.ruleSetId > 0) {
      this.bsModalRef.content.characterId = 0;
      this.bsModalRef.content.character = new Characters();
      this.bsModalRef.content.command = Command.command;
      if (Command.hasOwnProperty("buffAndEffectId")) {
        this.bsModalRef.content.recordName = this.CommandData.name;
        this.bsModalRef.content.recordImage = this.CommandData.imageUrl;
        this.bsModalRef.content.recordType = this.recordType;
        this.bsModalRef.content.recordId = this.recordId;
      }
      if (Command.hasOwnProperty("monsterTemplateId")) {

        this.bsModalRef.content.recordName = this.CommandData.name;
        this.bsModalRef.content.recordImage = this.CommandData.imageUrl;
        this.bsModalRef.content.recordType = this.recordType;
        this.bsModalRef.content.recordId = this.recordId;

      }
      this.bsModalRef.content.displayRollResultInChat_AfterAllChecks = this.displayRollResultInChat_AfterAllChecks;
      this.bsModalRef.content.isFromCampaignDetail = true;
    } else {

      this.bsModalRef.content.characterId = this.character.characterId;
      this.bsModalRef.content.character = this.character;
      this.bsModalRef.content.command = Command.command;
      this.bsModalRef.content.recordType = this.recordType;
      this.bsModalRef.content.recordId = this.recordId;
      if (this.CommandData.hasOwnProperty("itemId")) {
        this.bsModalRef.content.recordName = this.CommandData.name;
        this.bsModalRef.content.recordImage = this.CommandData.itemImage;
        this.bsModalRef.content.isConsumable = this.isConsumable;
        this.bsModalRef.content.charStat = this.charStat;
        if (this.isConsumable) {

          let RuleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
          let ruleSetId;
          if (this.ruleset) {
            ruleSetId = this.ruleset.ruleSetId ? this.ruleset.ruleSetId : RuleSetId;
          }
          this.itemsService.ReduceItemQty(Command.itemId, ruleSetId).subscribe(result => {
            setTimeout(() => {
              if (result) {
                this.sharedService.updateItemsList(true);
              }
              let msg = "The " + Command.name + " has been used. " + (result ? result : 0) + " number of uses remain.";
              this.alertService.showMessage(msg, "", MessageSeverity.success);
            }, 4000);
          }, error => {
            let Errors = Utilities.ErrorDetail("", error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            }
          });
        }
      }
      else if (this.CommandData.hasOwnProperty("spellId")) {
        this.bsModalRef.content.recordName = this.CommandData.name;
        this.bsModalRef.content.recordImage = this.CommandData.imageUrl;
      }
      else if (this.CommandData.hasOwnProperty("abilityId")) {
        this.bsModalRef.content.recordName = this.CommandData.name;
        this.bsModalRef.content.recordImage = this.CommandData.imageUrl;
      }
      else if (this.CommandData.hasOwnProperty("buffAndEffectId")) {
        this.bsModalRef.content.recordName = this.CommandData.name;
        this.bsModalRef.content.recordImage = this.CommandData.imageUrl;
      }
      else if (this.CommandData.hasOwnProperty("monsterTemplateId")) {

        this.bsModalRef.content.recordName = this.CommandData.name;
        this.bsModalRef.content.recordImage = this.CommandData.imageUrl;
      }
    }

    this.bsModalRef.content.event.subscribe(result => {
    });
  }
  close() {
    this.bsModalRef.hide();
  }
}
