import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { CharactersService } from '../../../core/services/characters.service';
import { Utilities } from '../../../core/common/utilities';
import { AuthService } from '../../../core/auth/auth.service';
import { LootService } from '../../../core/services/loot.service';
import { SharedService } from '../../../core/services/shared.service';


@Component({
  selector: 'app-giveaway',
  templateUrl: './giveaway.component.html',
  styleUrls: ['./giveaway.component.scss']
})
export class GiveawayComponent implements OnInit {

  giveAwayItem: any;
  ruleSetId: number;
  characters: any = [];
  isLoading = false;
  selectercharacter: any;
  isFromLootGiveScreen: boolean = true;

  constructor(
    private bsModalRef: BsModalRef,
    private charactersService: CharactersService,
    private authService: AuthService,
    private lootService: LootService,
    private sharedService: SharedService,

  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.giveAwayItem = this.bsModalRef.content.giveAwayItem;
      this.ruleSetId = this.giveAwayItem.ruleSet.ruleSetId;
      this.initialize();
    }, 0);
    
  }

  initialize() {
    this.isLoading = true;    
    this.charactersService.getCharactersByRuleSetId<any>(this.ruleSetId, this.isFromLootGiveScreen)
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
  
    this.selectercharacter = _selectedcharacter;
  }

  close() {
    this.bsModalRef.hide();
  }
  Give() {
    let _character = [];
    _character.push({ iD: this.selectercharacter.characterId});
   
    let lootId = this.giveAwayItem.lootId;
    this.isLoading = true;
    this.lootService.giveItemTocharacter<any>(_character,lootId)
      .subscribe(data => {        
       // console.log(data);
        this.close();
        this.sharedService.updateItemsList(true);
        this.isLoading = false;
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      }, () => { });
  }
}
