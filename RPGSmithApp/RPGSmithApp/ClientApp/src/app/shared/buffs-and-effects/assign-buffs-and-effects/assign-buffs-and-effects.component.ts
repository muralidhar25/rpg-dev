import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { PlatformLocation } from '@angular/common';
import { BuffAndEffectService } from '../../../core/services/buff-and-effect.service';
import { Utilities } from '../../../core/common/utilities';
import { AuthService } from '../../../core/auth/auth.service';
import { BuffAndEffect } from '../../../core/models/view-models/buff-and-effect.model';
import { CharactersService } from '../../../core/services/characters.service';
import { Characters } from '../../../core/models/view-models/characters.model';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';



@Component({
  selector: 'app-assign-buffs-and-effects',
  templateUrl: './assign-buffs-and-effects.component.html',
  styleUrls: ['./assign-buffs-and-effects.component.scss']
})
export class AssignBuffAndEffectComponent implements OnInit {

  public event: EventEmitter<any> = new EventEmitter();
  isLoading: boolean = false;
  BuffAndEffectToAssign: any;
  ruleSetId: number;
  characters: any[] = [];
  selectercharacters: Characters[] = [];
  allSelected: boolean = false;
  itemsList: any;
  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService, private location: PlatformLocation,
    private buffAndEffectService: BuffAndEffectService, private authService: AuthService, private charactersService: CharactersService,
    private alertService: AlertService) {
    location.onPopState(() => this.modalService.hide(1));
  }

  ngOnInit() {
    setTimeout(() => {
      this.BuffAndEffectToAssign = this.bsModalRef.content.BuffAndEffectToAssign;
      this.ruleSetId = this.bsModalRef.content.ruleSetId;
      this.initialize();
    }, 0);
  }
  initialize() {    
    this.isLoading = true;
    this.buffAndEffectService.getOnlyCharactersByRuleSetId<any>(this.ruleSetId, this.BuffAndEffectToAssign.buffAndEffectId)
      .subscribe(data => {
        this.characters = data;
        this.selectercharacters = this.characters.filter((x: any) => x.selected)

        this.allSelected = true;
        this.characters.map(x => {
          if (x.selected == false)
            this.allSelected = false;
        })
        
        this.isLoading = false;
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      }, () => { });
  }
  close() {
    this.bsModalRef.hide();
  }
  setCharacter(e: any, _selectedcharacter: any) {
    _selectedcharacter.selected = e.target.checked;
    debugger
    if (e.target.checked) {
      this.selectercharacters.push(_selectedcharacter);
    }
    else {
      this.selectercharacters = this.selectercharacters.filter(x => x.characterId != _selectedcharacter.characterId) ;

    }
    this.allSelected = true;
    this.characters.map(x => {
      if (x.selected == false)
        this.allSelected = false;
    })
  }
  selectDeselectFilters(selected) {    
    this.allSelected = selected;

    if (this.allSelected) {

      this.characters.map((item) => {
        item.selected = true;
       
      })

    }
    else {
      this.characters.map((item) => {
        item.selected = false;
      })

    }
  }
  Assign() {    
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Assigning Buffs & Effects to characters.");
    let buffs: BuffAndEffect[] = [];
    buffs.push(this.BuffAndEffectToAssign)
    this.selectercharacters = this.characters.filter(x => x.selected == true);
    debugger
    let nonSelectedCharacters:Characters[] = this.characters.map(x => {
      if (this.selectercharacters.filter(SC => SC.characterId == x.characterId).length) {

      }
      else {
        return x;
      }
      
    })

   
    nonSelectedCharacters = nonSelectedCharacters.filter(SC => SC)
    debugger
    this.buffAndEffectService.assignBuffAndEffectToCharacter<any>(buffs, this.selectercharacters, nonSelectedCharacters,[],0)
      .subscribe(data => {
        this.isLoading = false;
        this.alertService.stopLoadingMessage();
        this.alertService.showMessage("Buffs & Effects assigned successfully.", "", MessageSeverity.success);
        if (this.selectercharacters) {
          if (this.selectercharacters.length) {
            this.event.emit(true);
          }
          else if (this.selectercharacters.length==0) {
            this.event.emit(false);
          }
        }
        this.close();
      }, error => {
        this.isLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          this.authService.logout(true);
        }
      }, () => { });
  }
}
