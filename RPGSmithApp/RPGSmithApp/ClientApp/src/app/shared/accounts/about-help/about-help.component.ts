// ====================================================
// About Help Component
// ====================================================

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { ConfigurationService } from '../../../core/common/configuration.service';
import { Utilities } from '../../../core/common/utilities';
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-help',
  templateUrl: './about-help.component.html',
  styleUrls: ['./about-help.component.scss']
})
export class AboutHelpComponent implements OnInit {
    appVersion: string;
    appBuildNo: string;
    PublishedDate: string;
    LogoImage: string = '../assets/images/' + Utilities.LogoImage;
  constructor(
    private route: ActivatedRoute,
    private bsModalRef: BsModalRef,
    private modalService: BsModalService,
      private router: Router,
      private configuration: ConfigurationService

    , private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1)); 
  }

    ngOnInit() {

        setTimeout(() => {
            this.appVersion = this.configuration.appVersion;
            this.appBuildNo = this.configuration.appBuildNo;
            this.PublishedDate = this.configuration.PublishedDate;
        }, 0);
  }

  openHelp(){
    window.open('http://rpgsmith.com/help', '_blank');
  }

  openVideos(){
    window.open('http://rpgsmith.com/vids', '_blank');
  }

  openTermsCondition(){
    this.close();
    this.router.navigate(['/termscondition']);
    // window.open(window.location.origin + '/termscondition', '_blank');
  }

  openPrivacyPolicy(){
    this.close();
    this.router.navigate(['/privacypolicy']);
    // window.open(window.location.origin + '/privacypolicy', '_blank');
  }

  openNews(){
    window.open('http://rpgsmith.com/news', '_blank');
  }

  openDonate(){
      window.open('https://rpgsmith.com/bugs', '_blank');
  }

  close() {
    this.bsModalRef.hide();
  }

}
