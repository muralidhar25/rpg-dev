import { Component, OnInit } from '@angular/core';
import { RulesetTextTileComponent } from '../text.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { CharacterDashboardPage } from '../../../core/models/view-models/character-dashboard-page.model';
import { TextTile } from '../../../core/models/tiles/text-tile.model';
import { CommandTile } from '../../../core/models/tiles/command-tile.model';
import { VIEW } from '../../../core/models/enums';

@Component({
  selector: 'app-edit-text',
  templateUrl: './edit-text.component.html',
  styleUrls: ['./edit-text.component.scss']
})
export class RulesetEditTextComponent implements OnInit {
  textTileData: any;
  textUrl: string;
  title: any;
  tileName: any;
  viewTile: string;
  tileModel: any;
  rulesetId: number;
  pageId: number;
  pageDefaultData = new CharacterDashboardPage();

  textFormModel = new TextTile();
  executeFormModel: any;
  commandFormModel = new CommandTile();
  titleBgColor: any;
  titleTextColor: any;
  bodyBgColor: any;
  isSharedLayout: boolean = false;

  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService) { }

  ngOnInit() {
    
    setTimeout(() => {
      debugger
      this.rulesetId = this.bsModalRef.content.rulesetId;
      this.pageId = this.bsModalRef.content.pageId;
      this.pageDefaultData = this.bsModalRef.content.pageDefaultData;

      this.viewTile = this.bsModalRef.content.tileName;


     // this.textFormModel = this.bsModalRef.content.textTile;
      this.title = this.textFormModel.title;
      //this.tileModel = this.bsModalRef.content.tile;

      this.textFormModel = Object.assign({}, this.bsModalRef.content.textTile);
    

      this.tileModel = Object.assign({}, this.bsModalRef.content.tile); 

      this.titleBgColor = this.textFormModel.titleBgColor;
      this.titleTextColor = this.textFormModel.titleTextColor;
      this.bodyBgColor = this.textFormModel.bodyBgColor;
      this.isSharedLayout = this.bsModalRef.content.isSharedLayout;
    }, 0);
  }

  edit() {
    let _tile = Object.assign({}, this.tileModel);
    this.close();
    this.bsModalRef = this.modalService.show(RulesetTextTileComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.tile = _tile;
    this.bsModalRef.content.textTile = _tile.textTiles;
    this.bsModalRef.content.tileName = 'image';
    this.bsModalRef.content.rulesetId = this.rulesetId;
    this.bsModalRef.content.view = VIEW.MANAGE;

    this.bsModalRef.content.pageId = this.pageId
    this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
    //this.bsModalRef = this.modalService.show(RulesetTextTileComponent, {
    //  class: 'modal-primary modal-md',
    //  ignoreBackdropClick: true,
    //  keyboard: false
    //});

    //this.bsModalRef.content.title = "Edit text Tile";
    //this.bsModalRef.content.tile = _tile;
    //this.bsModalRef.content.characterId = this.characterId;
    //this.bsModalRef.content.pageId = this.pageId;
    //this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
    //this.bsModalRef.content.view = VIEW.EDIT;
  }

  close() {
    this.bsModalRef.hide();
    //this.destroyModalOnInit();
  }

  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }

}

