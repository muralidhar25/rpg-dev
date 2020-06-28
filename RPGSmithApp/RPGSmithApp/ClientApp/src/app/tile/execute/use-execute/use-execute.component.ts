import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { PlatformLocation } from '@angular/common';

@Component({
    selector: 'use-execute',
    templateUrl: './use-execute.component.html',
    styleUrls: ['./use-execute.component.scss']
})
export class UseExecuteComponent implements OnInit {

    imageUrl: string;
    title: any;
    viewTile: string;
    executeTile: any;

    executeFormModel: any;

  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService, private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1)); }

    ngOnInit() {

        setTimeout(() => {
            this.viewTile = this.bsModalRef.content.tileName;
            this.executeFormModel = this.bsModalRef.content.executeTile;
            this.imageUrl = this.executeFormModel.linkType == 'Spell' ? this.executeFormModel.spell.spell.imageUrl : this.executeFormModel.linkType == 'Ability' ? this.executeFormModel.ability.ability.imageUrl : this.executeFormModel.linkType == 'Item' ? this.executeFormModel.item.itemImage : '';
            this.title = this.executeFormModel.linkType == 'Spell' ? this.executeFormModel.spell.spell.name : this.executeFormModel.linkType == 'Ability' ? this.executeFormModel.ability.ability.name : this.executeFormModel.linkType == 'Item' ? this.executeFormModel.item.name : '';
            this.executeTile = this.executeFormModel.linkType == 'Spell' ? this.executeFormModel.spell.spell : this.executeFormModel.linkType == 'Ability' ? this.executeFormModel.ability.ability : this.executeFormModel.linkType == 'Item' ? this.executeFormModel.item : {};

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
