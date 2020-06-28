import { Component, OnInit, EventEmitter } from '@angular/core';
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef, } from 'ngx-bootstrap';
import { AlertService } from '../../../core/common/alert.service';
import { AuthService } from '../../../core/auth/auth.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { DBkeys } from '../../../core/common/db-keys';
import { User } from '../../../core/models/user.model';
import { PlatformLocation } from '@angular/common';
import { CharactersCharacterStatService } from '../../../core/services/characters-character-stat.service';
import { STAT_TYPE } from '../../../core/models/enums';
import { CharacterStatService } from '../../../core/services/character-stat.service';
import { CharacterStats } from '../../../core/models/view-models/character-stats.model';

@Component({
  selector: 'app-stat',
  templateUrl: './stat.component.html',
  styleUrls: ['./stat.component.scss']
})
export class EditorStatComponent implements OnInit {

  public event: EventEmitter<any> = new EventEmitter();

  limitText: string = "Show more";
  limit: number = 4;
  rulesetId: number;
  characterId: number;
  isLoading: boolean = true;
  title: string;
  statsList: Array<any> = [];
  query: string = '';
  characterStatId: any;
  characterStatName: string;
  STAT_TYPE = STAT_TYPE;
  selectedStatList: any[] = [];

  constructor(private bsModalRef: BsModalRef,
    private modalService: BsModalService, public localStorage: LocalStoreManager, private authService: AuthService,
    public characterStatService: CharactersCharacterStatService, public cStatService: CharacterStatService,private alertService: AlertService, private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1));
    this.rulesetId = this.localStorage.localStorageGetItem('rulesetId');
  }

  ngOnInit() {

    setTimeout(() => {
      this.characterId = this.bsModalRef.content.characterId;
      this.title = this.bsModalRef.content.title;

      this.Initialize();
      try {
        document.getElementsByClassName('modal-md modal-with-max-zindex')[0].parentElement.style.zIndex = '99999999999';
      } catch (e) {

      }
    }, 0);
  }

  private Initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      if (this.characterId > 0) {
        this.characterStatService.getCharactersCharacterStat_StatList<any[]>(this.characterId, -1, -1) //100=>for testing
          .subscribe(data => {
            this.statsList = data;
            if (this.statsList.length) {
              this.statsList.map((x) => {
                x.selected = false;
              });
            }
            this.isLoading = false;
          }, error => {
            this.isLoading = false;
          }, () => { });
      }
      else {
        this.cStatService.getCharacterStatsByRuleset<any[]>(this.rulesetId) //100=>for testing
          .subscribe(data => {
            this.statsList = data;
            if (this.statsList.length) {
              this.statsList.map((x) => {
                x.characterStat = new CharacterStats();
                x.characterStat.statName = x.statName;
                x.selected = false;
              });
            }
            this.isLoading = false;
          }, error => {
            this.isLoading = false;
          }, () => { });
        }
      }
  }

  showMoreCommands(_limit: number, _limitText: string) {
    if (_limitText == "Show more") {
      this.limitText = "Show less";
      this.limit = _limit;
    } else {
      this.limitText = "Show more";
      this.limit = 4;
    }
  }

  getStatValueEdit(event: any, stat: any) {
    this.characterStatId = stat.characterStatId
    this.characterStatName = stat.characterStat.statName;
    //this.statsList.map(x => {
    //  if (x.characterStatId == stat.characterStatId) {
    //    x.selected = true;
    //  } else {
    //    x.selected = false;
    //  }
    //});
    this.statsList.map(x => {
      if (x.characterStatId == stat.characterStatId) {
        x.selected = event.target.checked;
      }
    });
  }

  submitForm() {
    //if (this.characterStatId) {
    //  this.event.emit('[' + this.characterStatName + ']');
    //}
    this.statsList.map(x => {
      if (x.selected) {
        this.selectedStatList.push({ characterStatName: x.characterStat.statName });
      }
    });
    if (this.characterStatId) {
      this.event.emit(this.selectedStatList);
    }
    this.close();
  }

  close() {
    this.bsModalRef.hide();
    //this.destroyModalOnInit()
  }

  //private destroyModalOnInit(): void {
  //  try {
  //    this.modalService.hide(1);
  //    document.body.classList.remove('modal-open');
  //    //$(".modal-backdrop").remove();
  //  } catch (err) { }
  //}
}
