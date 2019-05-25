import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { PlatformLocation } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-handout-file-view',
  templateUrl: './handout-file-view.component.html',
  styleUrls: ['./handout-file-view.component.scss']
})
export class HandoutFileViewComponent implements OnInit {
  viewDetails: any;
  iframe: any;
  constructor(
    private bsModalRef: BsModalRef,
    private modalService: BsModalService,
    private location: PlatformLocation,
    private sanitizer: DomSanitizer
  ) {
    
  }

  ngOnInit() {
   
    setTimeout(() => {
      this.viewDetails = this.bsModalRef.content.ViewDetails;
      this.initialize();
    }, 0);
  }
  close() {
    this.bsModalRef.hide();
  }

  initialize() {
    //console.log(this.viewDetails);
    if (this.viewDetails.contentType == "application/pdf"
      || this.viewDetails.contentType.indexOf("text") > -1
      || this.viewDetails.contentType.indexOf("video") >  -1 
    ) {
      this.iframe = this.sanitizer.bypassSecurityTrustResourceUrl(this.viewDetails.absoluteUri);
    } else {
      this.iframe = this.sanitizer.bypassSecurityTrustResourceUrl(this.viewDetails.absoluteUri);
        setTimeout(() => {
        this.close()
      }, 500);
    }
    //if (this.viewDetails.contentType == "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    //  || this.viewDetails.contentType == "application/msword"
    //  || this.viewDetails.contentType == "application/vnd.openxmlformats-officedocument.presentationml.slideshow") {
    //  this.iframe = this.sanitizer.bypassSecurityTrustResourceUrl(this.viewDetails.absoluteUri);
    //  setTimeout(() => {
    //    this.close()
    //  }, 500);
    //} else {
    //console.log(this.viewDetails.absoluteUri);
    //  this.iframe = this.sanitizer.bypassSecurityTrustResourceUrl(this.viewDetails.absoluteUri);
    //}
  }

}
