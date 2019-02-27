import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { NoteTile } from '../../../core/models/tiles/note-tile.model';
import { CharacterDashboardPage } from '../../../core/models/view-models/character-dashboard-page.model';
import { Utilities } from '../../../core/common/utilities';
import { NoteTileComponent } from '../note.component';
import { VIEW } from '../../../core/models/enums';

@Component({
  selector: 'edit-note',
  templateUrl: './edit-note.component.html',
  styleUrls: ['./edit-note.component.scss']
})
export class EditNoteComponent implements OnInit {
    
    noteFormModel:any = new NoteTile();
    tileModel: any;
    characterId: number;
    pageId: number;
    pageDefaultData = new CharacterDashboardPage();
    options: Object = Utilities.options;

    constructor(private bsModalRef: BsModalRef, private modalService: BsModalService) { }

    ngOnInit() {
        setTimeout(() => {
            this.tileModel = this.bsModalRef.content.tile;
            this.noteFormModel = this.bsModalRef.content.noteTile;
            this.characterId = this.bsModalRef.content.characterId;
            this.pageId = this.bsModalRef.content.pageId;
            this.pageDefaultData = this.bsModalRef.content.pageDefaultData;
        }, 0);
    }

    edit() {
        let _tile = Object.assign({}, this.tileModel);
        this.close();

        this.bsModalRef = this.modalService.show(NoteTileComponent, {
            class: 'modal-primary modal-lg modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = "Edit Note Tile";
        this.bsModalRef.content.tile = _tile;
        this.bsModalRef.content.characterId = this.characterId;
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
