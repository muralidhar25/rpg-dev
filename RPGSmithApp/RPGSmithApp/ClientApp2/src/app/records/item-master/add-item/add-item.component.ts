import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { AlertService, MessageSeverity, DialogType } from '../../../core/common/alert.service';
import { AuthService } from "../../../core/auth/auth.service";

@Component({
    selector: 'app-add-item',
    templateUrl: './add-item.component.html',
    styleUrls: ['./add-item.component.scss']
})
export class AddItemMasterComponent implements OnInit {

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
