import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { RulesetDashboardPage } from '../../../core/models/view-models/ruleset-dashboard-page.model';
import { ImageTile } from '../../../core/models/tiles/image-tile.model';
import { CommandTile } from '../../../core/models/tiles/command-tile.model';
import { RulesetImageTileComponent } from '../image.component';
import { VIEW } from '../../../core/models/enums';
import { PlatformLocation } from '@angular/common';

@Component({
    selector: 'app-edit-image',
    templateUrl: './edit-image.component.html',
    styleUrls: ['./edit-image.component.scss']
})
export class RulesetEditImageComponent implements OnInit {
    imageTileData: any;
    imageUrl: string;
    title: any;
    tileName: any;
    viewTile: string;
    tileModel: any;
    rulesetId: number;
    pageId: number;
    pageDefaultData = new RulesetDashboardPage();

    imageFormModel = new ImageTile();
    executeFormModel: any;
    commandFormModel = new CommandTile();
    titleBgColor: any;
    titleTextColor: any;
    bodyBgColor: any;

  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService, private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1)); }

  ngOnInit() {
    debugger
        setTimeout(() => {

            this.viewTile = this.bsModalRef.content.tileName;

            if (this.viewTile === 'image') {
                this.imageFormModel = this.bsModalRef.content.imageTile;
                this.title = this.imageFormModel.title;
                this.tileModel = this.bsModalRef.content.tile;
                this.titleBgColor = this.imageFormModel.titleBgColor;
                this.titleTextColor = this.imageFormModel.titleTextColor;
                this.bodyBgColor = this.imageFormModel.bodyBgColor;
            }
            else if (this.viewTile === 'execute') {
                this.tileModel = this.bsModalRef.content.tile;
                this.executeFormModel = this.bsModalRef.content.executeTile;
                this.imageUrl = this.executeFormModel.linkType == 'Spell' ? this.executeFormModel.spell.spell.imageUrl : this.executeFormModel.linkType == 'Ability' ? this.executeFormModel.ability.ability.imageUrl : this.executeFormModel.linkType == 'Item' ? this.executeFormModel.item.itemImage : '';
                this.title = this.executeFormModel.linkType == 'Spell' ? this.executeFormModel.spell.spell.name : this.executeFormModel.linkType == 'Ability' ? this.executeFormModel.ability.ability.name : this.executeFormModel.linkType == 'Item' ? this.executeFormModel.item.name : ''
                this.titleBgColor = this.executeFormModel.titleBgColor;
                this.titleTextColor = this.executeFormModel.titleTextColor;
                this.bodyBgColor = this.executeFormModel.bodyBgColor;
            }
            else if (this.viewTile === 'command') {
                this.tileModel = this.bsModalRef.content.tile;
                this.commandFormModel = this.bsModalRef.content.commandTile;
                this.title = this.commandFormModel.title;
                this.titleBgColor = this.commandFormModel.titleBgColor;
                this.titleTextColor = this.commandFormModel.titleTextColor;
                this.bodyBgColor = this.commandFormModel.bodyBgColor;
            }

        }, 0);
    }

    edit() {
        let _tile = Object.assign({}, this.tileModel);
        this.close();

        this.bsModalRef = this.modalService.show(RulesetImageTileComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });

        this.bsModalRef.content.title = "Edit Image Tile";
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
