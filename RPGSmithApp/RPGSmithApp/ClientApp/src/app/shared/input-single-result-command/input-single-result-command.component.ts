import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { DiceComponent } from '../dice/dice/dice.component';
import { Characters } from '../../core/models/view-models/characters.model';
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { SharedService } from '../../core/services/shared.service';
import { DiceService } from '../../core/services/dice.service';
import { AlertService } from '../../core/common/alert.service';

@Component({
  selector: 'app-input-single-result-command',
  templateUrl: './input-single-result-command.component.html',
  styleUrls: ['./input-single-result-command.component.scss']
})
export class InputSingleResultCommandComponent implements OnInit {
  public event: EventEmitter<any> = new EventEmitter();
  commandResult: number = 0;
  @Input() _placeholder: string = '';
  @Input() characterId: number = 0;
  @Input() character: Characters = new Characters();
  @Input() rulesetId :number = 0;
  @Input() ruleset: Ruleset = new Ruleset();
  @Input() command: string = '';
  @Input() labelText: string = '';
  @Output() getResult: EventEmitter<any> = new EventEmitter<any>();

  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService, private sharedService: SharedService, private alertService: AlertService) {
    this.sharedService.getCommandData().subscribe(diceCommand => {
      this.command = diceCommand.command;
      this.commandResult = this.GetCommandResult();
      this.getResult.emit(this.commandResult)
      console.log('1',this.command )
      console.log('2',this.commandResult )
      //if (diceCommand.parentIndex === -1) {
      //  this.command = diceCommand.command;
      //} else {
      //  if (this.rulesetFormModal.rulesetCommandVM.length > 0) {
      //    this.rulesetFormModal.rulesetCommandVM.forEach(item => {
      //      var index = this.rulesetFormModal.rulesetCommandVM.indexOf(item);
      //      if (index === diceCommand.parentIndex) {
      //        this.rulesetFormModal.rulesetCommandVM[index].defaultDice = diceCommand.command;
      //      }
      //    });
      //  }
      //}
    });
  }
  ngOnInit() {

  }
  openDiceModal(index, command) {
     
    this.bsModalRef = this.modalService.show(DiceComponent, {
      class: 'modal-primary modal-md dice-screen',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.parentCommand = command;
    this.bsModalRef.content.inputIndex = index;
    if (this.characterId) {
      this.bsModalRef.content.characterId = this.characterId;
    }
    else if (this.rulesetId) {
      this.bsModalRef.content.rulesetId = this.rulesetId;
    }
    
  }
  GetCommandResult():number {
    debugger
   let aaaa:number= DiceService.rollDiceExternally(this.alertService, this.command,[])
    return aaaa;
  }
}
