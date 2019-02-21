import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { AlertService } from '../../../core/common/alert.service';

@Component({
    selector: 'app-add-abilities',
    templateUrl: './add-abilities.component.html',
    styleUrls: ['./add-abilities.component.scss']
})
export class AddAbilitiesComponent implements OnInit {

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
