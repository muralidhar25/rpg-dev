import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { AlertService } from '../../../core/common/alert.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SharedService } from '../../../core/services/shared.service';



@Component({
  selector: 'app-combat-visibility',
  templateUrl: './change-combat-visibility.component.html',
  styleUrls: ['./change-combat-visibility.component.scss']
})
export class CombatVisibilityComponent implements OnInit {

  defaultColorList: any = [];
  title: string;
  visibility: boolean;
  public event: EventEmitter<any> = new EventEmitter();

  constructor(
    private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService,
    private sharedService: SharedService) {
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
      this.visibility = this.bsModalRef.content.visibility;
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
    this.close();
  }

  ShowVisibility() {
    console.log("ShowVisibility");
    this.visibility = true;
    
  }
  HideVisibility() {
    console.log("HideVisibility");
    this.visibility = false;
  }
  close() {
    this.bsModalRef.hide();
  }

}
