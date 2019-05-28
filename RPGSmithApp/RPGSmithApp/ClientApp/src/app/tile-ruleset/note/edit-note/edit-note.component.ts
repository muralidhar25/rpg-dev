import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { NoteTile } from '../../../core/models/tiles/note-tile.model';
import { RulesetDashboardPage } from '../../../core/models/view-models/ruleset-dashboard-page.model';
import { Utilities } from '../../../core/common/utilities';
import { RulesetNoteTileComponent } from '../note.component';
import { VIEW } from '../../../core/models/enums';
import { PlatformLocation } from '@angular/common';

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
    location.onPopState(() => this.modalService.hide(1)); }

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

   
}
