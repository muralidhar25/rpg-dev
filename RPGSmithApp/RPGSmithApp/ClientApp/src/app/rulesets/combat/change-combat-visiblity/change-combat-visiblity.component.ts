import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SharedService } from '../../../core/services/shared.service';
import { CombatService } from '../../../core/services/combat.service';
import { Utilities } from '../../../core/common/utilities';



@Component({
  selector: 'app-combat-visibility',
  templateUrl: './change-combat-visibility.component.html',
  styleUrls: ['./change-combat-visibility.component.scss']
})
export class CombatVisibilityComponent implements OnInit {

  defaultColorList: any = [];
  title: string;
  visibility: boolean;
  isLoading: boolean = false;
  currentItem: any;

  public event: EventEmitter<any> = new EventEmitter();

  constructor(
    private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService,
    private sharedService: SharedService,
    private combatService: CombatService) {
    this.defaultColorList = [
      {
        rpgCoreColorId: 1,
        titleTextColor: "#000000",
        titleBgColor: "#FFFFFF",
        bodyTextColor: "#000000",
        bodyBgColor: "white",

      },
      {
        rpgCoreColorId: 2,
        titleTextColor: "#000000",
        titleBgColor: "#D58917",
        bodyTextColor: "#000000",
        bodyBgColor: "red",

      },
      {
        rpgCoreColorId: 3,
        titleTextColor: "#000000",
        titleBgColor: "#E1B500",
        bodyTextColor: "#000000",
        bodyBgColor: "yellow",
      },
      {
        rpgCoreColorId: 4,
        titleTextColor: "#FFFFFF",
        titleBgColor: "#069774",
        bodyTextColor: "#FFFFFF",
        bodyBgColor: "orange",

      },
      {
        rpgCoreColorId: 5,
        titleTextColor: "#FFFFFF",
        titleBgColor: "#265256",
        bodyTextColor: "#FFFFFF",
        bodyBgColor: "green",

      },
      {
        rpgCoreColorId: 6,
        titleTextColor: "#FFFFFF",
        titleBgColor: "#004229",
        bodyTextColor: "#FFFFFF",
        bodyBgColor: "blue",
      },
      {
        rpgCoreColorId: 7,
        titleTextColor: "#FFFFFF",
        titleBgColor: "#2973A8",
        bodyTextColor: "#FFFFFF",
        bodyBgColor: "brown",
      },
      {
        rpgCoreColorId: 8,
        titleTextColor: "#FFFFFF",
        titleBgColor: "#04466D",
        bodyTextColor: "#FFFFFF",
        bodyBgColor: "grey",
        isDeleted: false,
        createdDate: "2018-09-18T17:10:08.33",
      },
      {
        rpgCoreColorId: 9,
        titleTextColor: "#FFFFFF",
        titleBgColor: "#663796",
        bodyTextColor: "#FFFFFF",
        bodyBgColor: "lightcyan",

      },
      {
        rpgCoreColorId: 10,
        titleTextColor: "#FFFFFF",
        titleBgColor: "#952C21",
        bodyTextColor: "#FFFFFF",
        bodyBgColor: "navy",
      }
    ]
  }

  ngOnInit() {
    setTimeout(() => {
      this.title = this.bsModalRef.content.title;
      this.visibility = this.bsModalRef.content.item.visibleToPc;
      this.currentItem = this.bsModalRef.content.item;
      console.log('visibility', this.visibility);
      let color = this.bsModalRef.content.color;
      this.defaultColorList.map((x) => {
        if (x.bodyBgColor == color) {
          x.selected = true;
        }
      })
      this.initialize();
    }, 0);
  }

  private initialize() { }

  setdefaultColor(color, index) {
    console.log('color', color);
    console.log('index', index);
    this.event.emit(color);
    this.sharedService.updateMonsterVisibility(this.visibility);
    this.currentItem.visibleToPc = this.visibility;
    this.currentItem.visibilityColor = color.bodyBgColor;
    this.saveVisibilityDetails(this.currentItem);
    this.close();
  }

  ShowVisibility() {
    this.visibility = true;
    this.close();

  }
  HideVisibility() {
    this.visibility = false;
    this.close();
  }
  close() {
    this.currentItem.visibleToPc = this.visibility;
    this.saveVisibilityDetails(this.currentItem);
    this.bsModalRef.hide();
  }

  saveVisibilityDetails(currentItem) {
    this.isLoading = true;
    this.combatService.saveVisibilityDetails(currentItem).subscribe(res => {
      let result = res;
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
      let Errors = Utilities.ErrorDetail("", error);
      if (Errors.sessionExpire) {
        this.authService.logout(true);
      } else {
        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
      }
    });
  }

}
