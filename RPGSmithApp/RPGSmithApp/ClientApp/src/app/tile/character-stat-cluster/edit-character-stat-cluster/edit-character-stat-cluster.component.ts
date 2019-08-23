import { Component, OnInit, HostListener } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { STAT_TYPE, VIEW } from '../../../core/models/enums';
import { Characters } from '../../../core/models/view-models/characters.model';
import { CharacterStatTile, currentMax, choice, valSubVal } from '../../../core/models/tiles/character-stat-tile.model';
import { CharactersCharacterStat } from '../../../core/models/view-models/characters-character-stats.model';
import { CharacterDashboardPage } from '../../../core/models/view-models/character-dashboard-page.model';
import { Utilities } from '../../../core/common/utilities';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { SharedService } from '../../../core/services/shared.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { AuthService } from '../../../core/auth/auth.service';
import { CharactersCharacterStatService } from '../../../core/services/characters-character-stat.service';
import { DBkeys } from '../../../core/common/db-keys';
import { CharacterStats } from '../../../core/models/view-models/character-stats.model';
import { DiceRollComponent } from '../../../shared/dice/dice-roll/dice-roll.component';

import { PlatformLocation } from '@angular/common';
import { CharacterStatTileComponent } from '../../character-stat/character-stat.component';

@Component({
  selector: 'app-edit-character-stat-cluster',
  templateUrl: './edit-character-stat-cluster.component.html',
  styleUrls: ['./edit-character-stat-cluster.component.scss']
})

export class EditCharacterStatClusterComponent implements OnInit {

    STAT_TYPE = STAT_TYPE;
    rulesetId: number;
    Character: Characters;
    CharacterID: number;
    CharacterStatTile: CharacterStatTile;
    CharacterStatTypeID: number;
    CharacterStatTypeDesc: string;
    title: string;
    valText: string;
    valRichText: string;
    valNumber: string;
    valCurrentMax: currentMax = new currentMax();
    selectedChoiceId: number;
    valChoice: choice;
    valChoices: choice[] = [];
  selectedValChoices: choice[] = [];
    valValueSubValue: valSubVal;
    valOnOff: boolean;
    valYesNo: boolean;
    valCalculationResult: string;
    valCalculationFormula: string;
    valCommand: string;
    valtitle: string;
    defValNumber: string;
    defValCurrentMax: currentMax;
    defValValueSubValue: valSubVal;
    defaultCharacterStats: any;
    tile: any;
    charactersCharacterStat: CharactersCharacterStat;
    pageId: number;
    pageDefaultData = new CharacterDashboardPage();
    showRichEditor: boolean = false;
    isMouseDown: boolean = false;
    interval: any;
  isNotValidNumber: boolean = false;
  isSharedLayout: boolean = false;
    
  options(placeholder?: string, initOnClick?: boolean): Object {
    //console.log(Utilities.optionsFloala(200, placeholder, initOnClick, true))
        return Utilities.optionsFloala(200, placeholder, initOnClick,true);
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === 13 && (this.CharacterStatTypeID === STAT_TYPE.RichText && this.showRichEditor) || (this.CharacterStatTypeID !== STAT_TYPE.Calculation && this.CharacterStatTypeID !== STAT_TYPE.RichText && this.CharacterStatTypeID !== STAT_TYPE.Condition)) {
        this.saveStat(this.CharacterStatTypeID);     
    }
  }

    constructor(
        private bsModalRef: BsModalRef, private alertService: AlertService, private sharedService: SharedService,
        private authService: AuthService, private modalService: BsModalService, private localStorage: LocalStoreManager,
      private CCService: CharactersCharacterStatService, private location: PlatformLocation) {
      location.onPopState(() => this.modalService.hide(1));
    }

    ngOnInit() {

        setTimeout(() => {
            
            if (this.rulesetId == undefined)
                this.rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
            
            this.tile = this.bsModalRef.content.tile;
            this.CharacterStatTile = this.bsModalRef.content.characterStatTile;     
            this.Character = this.bsModalRef.content.character; //this.CharacterStatTile.charactersCharacterStat.character
            this.CharacterID = this.bsModalRef.content.characterId;//this.CharacterStatTile.charactersCharacterStat.character.characterId
            //this.defaultCharacterStats = this.CharacterStatTile.charactersCharacterStat.character.charactersCharacterStats;

            this.pageId = this.bsModalRef.content.pageId;
          this.pageDefaultData = this.bsModalRef.content.pageDefaultData;
          this.showRichEditor = this.bsModalRef.content.showEditor ? this.bsModalRef.content.showEditor : false;
          this.isSharedLayout = this.bsModalRef.content.isSharedLayout;
            this.Initialize();
        }, 0);
  }
  get multichoiceSettings() {
    return {
      primaryKey: "key",
      labelKey: "value",
      text: "select choice(s)",
      enableCheckAll: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: false,
      limitSelection: false,
      enableSearchFilter: true,
      classes: "myclass custom-class ",
      showCheckbox: true,
      position: "bottom"
    };
  }

  get singlechoiceSettings() {
    return {
      primaryKey: "key",
      labelKey: "value",
      text: "select choice",
      enableCheckAll: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: true,
      limitSelection: false,
      enableSearchFilter: true,
      classes: "myclass custom-class ",
      showCheckbox: false,
      position: "bottom"
    };
  }
    private Initialize(CharacterStatTypeID?: number) {
        
    }



}
