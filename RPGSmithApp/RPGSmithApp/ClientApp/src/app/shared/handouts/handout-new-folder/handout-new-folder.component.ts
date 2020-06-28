import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { PlatformLocation } from '@angular/common';
import { ImageSearchService } from '../../../core/services/shared/image-search.service';
import { Utilities } from '../../../core/common/utilities';
import { AuthService } from '../../../core/auth/auth.service';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { AppService1 } from '../../../app.service';

@Component({
  selector: 'app-handout-new-folder',
  templateUrl: './handout-new-folder.component.html',
  styleUrls: ['./handout-new-folder.component.scss']
})
export class HandoutNewFolderComponent implements OnInit {
    //imageUrl: string;
    //imageAlt: string;
  DestroyOtherModals: boolean = true;
  isAnyFileSelected: boolean = false;
  isLoading: boolean = false;
  folderName: string = '';
  files: any[]=[];
  userid: string = '';
  rulesetId: number = 0;
  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService, private authService: AuthService, private appService: AppService1
    , private location: PlatformLocation, private imageSearchService: ImageSearchService, private alertService: AlertService,) {
    location.onPopState(() => this.modalService.hide(1));
    }

    ngOnInit() {
      setTimeout(() => {
        this.rulesetId = this.bsModalRef.content.rulesetId;
            this.Initialize();
        }, 0);        
    }
    Initialize() {
      this.userid = this.bsModalRef.content.userid;
        this.DestroyOtherModals = this.bsModalRef.content.DestroyOtherModals ? this.bsModalRef.content.DestroyOtherModals : true;
    }
    close() {
        this.bsModalRef.hide();
        if (this.DestroyOtherModals) {
            this.destroyModal();
        }
  }
  selectFile(e) {
    debugger
    if (e.target.files.length > 0) {
      this.isAnyFileSelected = true;
      this.files=e.target.files;
    }
    else {
      this.isAnyFileSelected = false;
    }
  }
  CreateFolder() {
    if (this.folderName.indexOf('/') > -1) {
      this.alertService.showStickyMessage('', "Invalid folder name. It should not contain '/' or '\\'.", MessageSeverity.error);
    }
    else if (this.folderName.indexOf('\\') > -1) {
      this.alertService.showStickyMessage('', "Invalid folder name. It should not contain '/' or '\\'.", MessageSeverity.error);
    }
    else {
      //if (this.files && this.files[0]) {
      let imgList = this.files;
      this.isLoading = true;
      this.alertService.startLoadingMessage("", "Creating Folder...");
      this.imageSearchService.uploadHandoutFolder<any>(imgList, this.userid, this.folderName, this.rulesetId)
        .subscribe(data => {
          this.alertService.stopLoadingMessage();
          if (data) {
            if (data.result) {
              this.isLoading = false;
              this.close();
              this.appService.updateImagesList(true);
              //this.Initialize();
            }
          }

        }, error => {
          console.log("searchMyImages Error: ", error);
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Upload Images Api", error);
          if (Errors.sessionExpire) this.authService.logout(true);
          else this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        },
          () => { });
      //}
    }

  }
    private destroyModal(): void {
        try {
            for (var i = 0; i < document.getElementsByClassName('selectPopUpModal').length; i++) {
                document.getElementsByClassName('selectPopUpModal')[i].parentElement.classList.remove('modal')
                document.getElementsByClassName('selectPopUpModal')[i].parentElement.classList.remove('fade')
                document.getElementsByClassName('selectPopUpModal')[i].parentElement.classList.remove('show')
                //document.getElementsByClassName('selectPopUpModal')[i].parentElement.remove()
                document.getElementsByClassName('selectPopUpModal')[i].parentElement.style.display = 'none'
            }
        } catch (err) { }
    }
}
