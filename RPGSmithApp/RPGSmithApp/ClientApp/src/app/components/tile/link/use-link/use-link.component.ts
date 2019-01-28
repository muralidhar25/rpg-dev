import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { CommandTileComponent } from '../../command/command.component';
import { ImageTile } from '../../../../models/tiles/image-tile.model';
import { LinkTile } from '../../../../models/tiles/link-tile.model';
import { ExecuteTile } from '../../../../models/tiles/execute-tile.model';
import { CommandTile } from '../../../../models/tiles/command-tile.model';

@Component({
    selector: 'use-link',
    templateUrl: './use-link.component.html',
    styleUrls: ['./use-link.component.scss']
})
export class UseLinkComponent implements OnInit {
    imageUrl: string;
    title: any;
    viewTile: string;
    linkTile: any;

    linkFormModel: any;

    constructor(private bsModalRef: BsModalRef, private modalService: BsModalService) { }

    ngOnInit() {
        setTimeout(() => {
            this.viewTile = this.bsModalRef.content.tileName;

            this.linkFormModel = this.bsModalRef.content.tile;
            this.imageUrl = this.linkFormModel.linkType == 'Spell' ? this.linkFormModel.spell.spell.imageUrl : this.linkFormModel.linkType == 'Ability' ? this.linkFormModel.ability.ability.imageUrl : this.linkFormModel.linkType == 'Item' ? this.linkFormModel.item.itemImage : '';
            this.title = this.linkFormModel.linkType == 'Spell' ? this.linkFormModel.spell.spell.name : this.linkFormModel.linkType == 'Ability' ? this.linkFormModel.ability.ability.name : this.linkFormModel.linkType == 'Item' ? this.linkFormModel.item.name : '';
            this.linkTile  = this.linkFormModel.linkType == 'Spell' ? this.linkFormModel.spell.spell : this.linkFormModel.linkType == 'Ability' ? this.linkFormModel.ability.ability : this.linkFormModel.linkType == 'Item' ? this.linkFormModel.item : {};

        }, 0);
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
    edit() { }
}
