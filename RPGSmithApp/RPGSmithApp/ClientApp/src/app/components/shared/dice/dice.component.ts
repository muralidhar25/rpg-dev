import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';

@Component({
    selector: "app-dice",
    templateUrl: './dice.component.html',
    styleUrls: ['./dice.component.scss']
})

export class DiceComponent implements OnInit {

    title: string;
    
    constructor(
        public modalService: BsModalService, private bsModalRef: BsModalRef
    ) {
    }

    ngOnInit(){
        setTimeout(() => {
            this.title = this.bsModalRef.content.title;
        }, 0);
    }

    close() {
        this.bsModalRef.hide();
    }

}