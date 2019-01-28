import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { SocialLoginService } from 'ngx-social-login';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { LocalStoreManager } from '../../../services/local-store-manager.service';
import { ConfigurationService } from '../../../services/configuration.service';
import { Utilities } from '../../../services/utilities';

@Component({
  selector: 'account-terms',
  templateUrl: './account-terms.component.html',
  styleUrls: ['./account-terms.component.scss']
})
export class AccountTermsComponent implements OnInit {

    termsCondition: boolean = false;
    checkEmail: boolean = false;
    newsletter: boolean = false;
    termscondition: string;
    LogoImage: string ="../../../../assets/images/"+ Utilities.LogoImage;
    public event: EventEmitter<any> = new EventEmitter();

    constructor(
        private bsModalRef: BsModalRef,
        private modalService: BsModalService,
        private configuration: ConfigurationService
    ) {
    }

    ngOnInit() {
        this.termscondition= this.configuration.baseUrl + '/termscondition';
  }

    submitForm() {
            let result = {
                termsCondition: this.termsCondition,
                checkEmail: this.checkEmail,
                newsletter: this.newsletter
            }
            this.close();
            this.event.emit(result);       
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

    redirectToPage(path: string) {
        //this.bsModalRef.hide();
        //this.router.navigate([path]);
        window.open(this.configuration.baseUrl + path, "_blank");
    }

}
