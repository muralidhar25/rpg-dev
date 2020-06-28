import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { CharactersService } from '../../core/services/characters.service';
import { AuthService } from '../../core/auth/auth.service';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { Utilities } from '../../core/common/utilities';
import { MonsterTemplateService } from '../../core/services/monster-template.service';
import { SharedService } from '../../core/services/shared.service';


@Component({
  selector: 'app-assign-to-character',
  templateUrl: './assign-to-character.component.html',
  styleUrls: ['./assign-to-character.component.scss']
})
export class AssignToCharacterComponent implements OnInit {

  ruleSetId: number;
  characters: any = [];
  isLoading = false;
  selectedcharacter: any;
  monster: any;
  monsterName: string;
  monsterImage: any;
  assignAsAlly: boolean = false;

  public event: EventEmitter<any> = new EventEmitter();

  constructor(
    private bsModalRef: BsModalRef,
    private charactersService: CharactersService,
    private authService: AuthService,
    private alertService: AlertService,
    private monsterTemplateService: MonsterTemplateService,
    private sharedService: SharedService

  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.monster = this.bsModalRef.content.monster ? this.bsModalRef.content.monster : [];
      this.ruleSetId = this.bsModalRef.content.rulesetId;
      this.monsterName = this.bsModalRef.content.monster ? this.bsModalRef.content.monster.name : '';
      this.monsterImage = this.bsModalRef.content.monster ? this.bsModalRef.content.monster.imageUrl : '';
      this.assignAsAlly = this.bsModalRef.content.assignAsAlly ? this.bsModalRef.content.assignAsAlly : false

      this.initialize();
    }, 0);

  }

  initialize() {
    this.isLoading = true;
    //this.charactersService.getCharactersByRuleSetId<any>(this.ruleSetId, this.isFromLootGiveScreen)
    this.charactersService.getCharactersByRuleSetId<any>(this.ruleSetId, true)
      .subscribe(data => {
        this.characters = data;
        this.isLoading = false;
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      }, () => { });
  }

  setCharacter(_selectedcharacter: any) {
    this.selectedcharacter = _selectedcharacter;
  }

  Assign() {
    if (!(this.selectedcharacter && this.selectedcharacter.characterId)) {
      this.alertService.showMessage("Please select atleast one Character and try again.", "", MessageSeverity.error);
      return false;
    }
    
    if (this.selectedcharacter && this.selectedcharacter.characterId) {
      if (this.assignAsAlly) {
        this.close();
        this.event.emit(this.selectedcharacter.characterId);
      } else {
        let model = { characterId: this.selectedcharacter.characterId, monsterId: this.monster.monsterId };

        //API Call for assign monster to character
        this.isLoading = true;
        this.monsterTemplateService.assignMonsterTocharacter<any>(model)
          .subscribe(data => {
            // console.log(data);
            this.close();
            this.sharedService.updateMonsterList(true);
            this.isLoading = false;
          }, error => {
            this.isLoading = false;
            let Errors = Utilities.ErrorDetail("", error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            }
          }, () => { });
      }
        
      } else {
        let message = 'Please select atleast one Character and try again.';
        this.alertService.showMessage(message, "", MessageSeverity.error);
      }
  }

  close() {
    this.bsModalRef.hide();
    if (this.assignAsAlly) {
      this.event.emit(0);
    }
  }
}
