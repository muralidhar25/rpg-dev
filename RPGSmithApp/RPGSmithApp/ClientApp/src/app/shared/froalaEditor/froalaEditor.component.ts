import { Component, OnInit, OnDestroy, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { Router, NavigationExtras } from "@angular/router";

import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap';
import { Utilities } from '../../core/common/utilities';
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-froalaEditor',
  templateUrl: './froalaEditor.component.html',
  styleUrls: ['./froalaEditor.component.scss']
})
export class froalaEditorComponent implements OnInit {

    richtextValue: string;
    characterStatId: number;
    characterStatName: string;
    options: Object = Utilities.options;

    constructor(
        private bsModalRef: BsModalRef, private modalService: BsModalService
      , private location: PlatformLocation) {
      location.onPopState(() => this.modalService.hide(1)); }

    ngOnInit() {

    }

    private initialize() {

    }


    close() {
        this.bsModalRef.hide();
    }

    public event: EventEmitter<any> = new EventEmitter();


    submitForm() {
        this.event.emit({ richtextValue: this.richtextValue, id: this.characterStatId });
    }


}
