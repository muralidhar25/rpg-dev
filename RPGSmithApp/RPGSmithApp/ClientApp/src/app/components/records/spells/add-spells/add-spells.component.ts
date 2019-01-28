import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { AlertService, MessageSeverity, DialogType } from '../../../../services/alert.service';
import { AuthService } from "../../../../services/auth.service";

@Component({
    selector: 'app-add-spell',
    templateUrl: './add-spells.component.html',
    styleUrls: ['./add-spells.component.scss']
})
export class AddSpellsComponent implements OnInit {

    constructor(
        private route: ActivatedRoute, private alertService: AlertService, private bsModalRef: BsModalRef, 
        private modalService: BsModalService
    ) {
    }

    ngOnInit() {
        
    }

    close() {
        this.bsModalRef.hide();
    }

}
