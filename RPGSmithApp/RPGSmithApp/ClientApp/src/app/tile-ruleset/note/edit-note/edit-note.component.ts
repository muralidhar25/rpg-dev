import { Component, OnInit, HostListener } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { NoteTile } from '../../../core/models/tiles/note-tile.model';
import { RulesetDashboardPage } from '../../../core/models/view-models/ruleset-dashboard-page.model';
import { Utilities } from '../../../core/common/utilities';
import { RulesetNoteTileComponent } from '../note.component';
import { VIEW } from '../../../core/models/enums';
import { PlatformLocation } from '@angular/common';
import { DiceRollComponent } from '../../../shared/dice/dice-roll/dice-roll.component';
import { Characters } from '../../../core/models/view-models/characters.model';

@Component({
  selector: 'edit-note',
  templateUrl: './edit-note.component.html',
  styleUrls: ['./edit-note.component.scss']
})
export class RulesetEditNoteComponent implements OnInit {
    
    noteFormModel:any = new NoteTile();
    tileModel: any;
    rulesetId: number;
    pageId: number;
    pageDefaultData = new RulesetDashboardPage();
    options: Object = Utilities.options;

  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService, private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1));
  }

  @HostListener('document:click', ['$event.target'])
  documentClick(target: any) {
    try {
      if (target.className && target.className == "Editor_Command a-hyperLink") {
        this.GotoCommand(target.attributes["data-editor"].value);
      }
    } catch (err) { }
  }

  ngOnInit() {
      debugger
        setTimeout(() => {
            this.tileModel = this.bsModalRef.content.tile;
            this.noteFormModel = this.bsModalRef.content.noteTile;
            this.rulesetId = this.bsModalRef.content.rulesetId;
            this.pageId = this.bsModalRef.content.pageId;
            this.pageDefaultData = this.bsModalRef.content.pageDefaultData;
        }, 0);
    }

    edit() {
        let _tile = Object.assign({}, this.tileModel);
        this.close();

        this.bsModalRef = this.modalService.show(RulesetNoteTileComponent, {
            class: 'modal-primary modal-lg',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = "Edit Note Tile";
        this.bsModalRef.content.tile = _tile;
        this.bsModalRef.content.rulesetId = this.rulesetId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.EDIT;
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
  

  GotoCommand(cmd) {
    // TODO get char ID
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.tile = -2;
    this.bsModalRef.content.characterId = 0;
    this.bsModalRef.content.character = new Characters();
    this.bsModalRef.content.command = cmd;
  }
   
}
