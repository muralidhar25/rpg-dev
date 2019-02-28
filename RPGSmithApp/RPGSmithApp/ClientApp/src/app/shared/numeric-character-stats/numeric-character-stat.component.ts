import { Component, OnInit, EventEmitter } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { AlertService } from "../../core/common/alert.service";
import { AuthService } from "../../core/auth/auth.service";
import { SharedService } from "../../core/services/shared.service";
import { CommonService } from "../../core/services/shared/common.service";
import { CharacterStatService } from "../../core/services/character-stat.service";
import { CharactersCharacterStatService } from "../../core/services/characters-character-stat.service";
import { LocalStoreManager } from "../../core/common/local-store-manager.service";
import { DBkeys } from "../../core/common/db-keys";
import { User } from "../../core/models/user.model";
import { Utilities } from "../../core/common/utilities";
import { PlatformLocation } from "@angular/common";


@Component({
  selector: 'app-numeric-character-stat',
  templateUrl: './numeric-character-stat.component.html',
  styleUrls: ['./numeric-character-stat.component.scss']
})

export class NumericCharacterStatComponent implements OnInit {

  characterId: number;
  numericCharacterStats: any[] = [];
  page: number = 1;
  pageSize: number = 6;
  isFirst: boolean = true;
  isLoading = false;
  rulesetId: number;
  scrollLoading: boolean = false;

  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    private bsModalRef: BsModalRef, private modalService: BsModalService, private localStorage: LocalStoreManager, private charactersCharacterStatService: CharactersCharacterStatService,
    private sharedService: SharedService, private commonService: CommonService, private characterStatService: CharacterStatService

    , private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1));
    this.initialize();
  }

  ngOnInit() {
    this.initialize();
    //this.characterId = this.bsModalRef.content.characterId;
    if (this.rulesetId == undefined)
      this.rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
  }

  private initialize() {
    setTimeout(() => {
      let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
      if (user == null)
        this.authService.logout();
      else {
        this.isLoading = true;
        if (this.characterId) {
          this.charactersCharacterStatService.getNumericCharactersCharacterStat<any[]>(this.characterId, this.page, this.pageSize)
            .subscribe(data => {
              this.numericCharacterStats = [];
              data.forEach((val) => {
                val.inventoryWeight = 0;
                val.icon = this.characterStatService.getIcon(val.characterStat.characterStatType.statTypeName);
                this.numericCharacterStats.push(val);
              });

              let InventoryWeight = this.numericCharacterStats.filter(val => val.charactersCharacterStatId === -1);
              if (InventoryWeight.length == 0)
                this.getInventoryWeight();
              else this.isLoading = false;
            }, error => {
              let Errors = Utilities.ErrorDetail("", error);
              if (Errors.sessionExpire) {
                this.authService.logout(true);
              }
              this.isLoading = false;
            }, () => {

            });
        }
        else {
          this.charactersCharacterStatService.getNumericCharactersCharacterStatRuleset<any[]>(this.rulesetId, this.page, this.pageSize)
            .subscribe(data => {

              this.numericCharacterStats = [];
              data.forEach((val) => {
                val.inventoryWeight = 0;
                val.icon = this.characterStatService.getIcon(val.characterStatType.statTypeName);
                this.numericCharacterStats.push(val);
              });
              this.getInventoryWeight();
            }, error => {
              let Errors = Utilities.ErrorDetail("", error);
              if (Errors.sessionExpire) {
                this.authService.logout(true);
              }
              this.isLoading = false;
            }, () => {

            });
        }
      }

    }, 0);
  }

  private getInventoryWeight() {
    this.isLoading = true;
    this.charactersCharacterStatService.getCharactersById<any>(this.characterId)
      .subscribe(data => {
        this.isLoading = false;
        let inventoryWeight = {
          'calculationResult': 0,
          'character': null,
          'characterId': data.characterId,
          'characterStat': {
            'characterStatTypeId': -1,
            'characterStatType': {
              'characterStatTypeId': -1,
              'characterStats': null,
              'isNumeric': false,
              'statTypeDesc': "",
              'statTypeName': "InventoryWeight"
            },
            'createdBy': data.createdBy,
            'ruleSetId': data.ruleSet ? data.ruleSet.ruleSetId : 0,
            'statDesc': "",
            'statName': "Inventory Weight"
          },
          'characterStatId': -1,
          'characterStatTiles': null,
          'charactersCharacterStatId': -1,
          'choice': null,
          'command': null,
          'current': 0,
          'icon': "icon-calculation",
          'isDeleted': false,
          'maximum': 0,
          'multiChoice': null,
          'number': 0,
          'onOff': false,
          'richText': null,
          'subValue': 0,
          'text': null,
          'value': 0,
          'yesNo': false,
          'inventoryWeight': data.inventoryWeight
        };
        this.numericCharacterStats = this.numericCharacterStats.filter(val => val.charactersCharacterStatId !== -1);
        this.numericCharacterStats.push(inventoryWeight);
        this.numericCharacterStats.forEach((val) => {
          val.inventoryWeight = data.inventoryWeight;
        });

      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        this.isLoading = false;
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      }, () => { });
  }

  onScroll() {
    this.scrollLoading = true;
    ++this.page;
    if (this.characterId) {
      this.charactersCharacterStatService.getNumericCharactersCharacterStat<any[]>(this.characterId, this.page, this.pageSize)
        .subscribe(data => {

          data.forEach((val) => {
            val.icon = this.characterStatService.getIcon(val.characterStat.characterStatType.statTypeName);
          });

          for (var i = 0; i < data.length; i++) {
            this.numericCharacterStats.push(data[i]);
          }
          this.scrollLoading = false;
        }, error => {
          this.scrollLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        }, () => {

        });
    } else {
      this.charactersCharacterStatService.getNumericCharactersCharacterStatRuleset<any[]>(this.rulesetId, this.page, this.pageSize)
        .subscribe(data => {

          data.forEach((val) => {
            val.icon = this.characterStatService.getIcon(val.characterStatType.statTypeName);
          });

          for (var i = 0; i < data.length; i++) {
            this.numericCharacterStats.push(data[i]);
          }
          this.scrollLoading = false;
        }, error => {
          this.scrollLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        }, () => {

        });
    }
  }


  close() {
    this.bsModalRef.hide();
    return false;
  }


  public event: EventEmitter<any> = new EventEmitter();

  selectCharacterStat(chartype: any, name: any, type: any, characterStat: any) {

    let statName: any;
    let value: any;

    if (chartype == "Current & Max" && type == 1) {
      statName = "[" + name + "(c)]";
      value = characterStat.current ? characterStat.current : 0;
    }
    else if (chartype == "Current & Max" && type == 2) {
      statName = "[" + name + "(m)]";
      value = characterStat.maximum ? characterStat.maximum : 0;
    }
    else if (chartype == "Value & Sub-Value" && type == 1) {
      statName = "[" + name + "(v)]";
      value = characterStat.value ? characterStat.value : 0;
    }
    else if (chartype == "Value & Sub-Value" && type == 2) {
      statName = "[" + name + "(s)]";
      value = characterStat.subValue ? characterStat.subValue : 0;
    }
    else if (chartype == "InventoryWeight" && type == 1) {
      statName = "[" + chartype + "]";
      value = characterStat.inventoryWeight ? characterStat.inventoryWeight : 0;
    }
    else if (chartype == "Number") {
      statName = "[" + name + "]";
      value = characterStat.number ? characterStat.number : 0;
    }
    else if (chartype == "Calculation") {
      statName = "[" + name + "]";
      value = characterStat.calculationResult ? characterStat.calculationResult : 0;
    }
    else if (chartype == "Combo") {
      statName = "[" + name + "]";
      value = characterStat.defaultValue ? characterStat.defaultValue : 0;
    }
    else {
      statName = "[" + name + "]";
      value = 0;
    }

    this.bsModalRef.hide();
    this.event.emit({
      selectedStat: statName,
      selectedStatValue: value,
      charactersCharacterStatId: characterStat.charactersCharacterStatId
    });
  }

}
