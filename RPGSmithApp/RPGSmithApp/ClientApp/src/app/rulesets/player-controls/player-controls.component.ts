import { Component, OnInit } from '@angular/core';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';

@Component({
  selector: 'app-player-controls',
  templateUrl: './player-controls.component.html',
  styleUrls: ['./player-controls.component.scss']
})
export class PlayerControlsComponent implements OnInit {
  pausegame: boolean = true;
  itemcreations: boolean = true;
  spellcreations: boolean = true;
  abilitycreations: boolean = true;
  itemadditions: boolean = true;
  spelladditions: boolean = true;
  abilityadditions: boolean = true;
 
  constructor(private bsModalRef: BsModalRef) { }

  ngOnInit() {
    console.log('p controls works');
  }
  close() {
    this.bsModalRef.hide();
    // this.destroyModalOnInit();
  }

  setpauseGame(checked:boolean) {
    console.log(checked,'setpauseGame');
    this.pausegame = checked;
  }
 
  AllowItemCreation(checked : boolean ) {
    console.log(checked, 'AllowItemCreation');
    this.itemcreations = checked;
  }

  AllowSpellcreation(checked: boolean) {
    console.log(checked, 'AllowSpellcreation');
    this.spellcreations = checked;
  }

  AllowAbilityCreation(checked: boolean) {
    console.log(checked, 'AllowAbilityCreation');
    this.abilitycreations = checked;
  }
  AllowItemAdditions(checked: boolean) {
    console.log(checked, 'AllowItemAddations');
    this.itemadditions = checked;
  }
  playerspellAdition(checked: boolean) {
    console.log(checked, 'playerspellAdition');
    this.spelladditions = checked;
  }
 
  playerAbilityAdditions(checked: boolean) {
    console.log(checked, 'playerAbilityAdditions');
    this.abilityadditions = checked;
  }
}
