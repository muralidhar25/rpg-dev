import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { PlatformLocation } from '@angular/common';
import { ImageSearchService } from '../../../core/services/shared/image-search.service';
import { Utilities } from '../../../core/common/utilities';
import { AuthService } from '../../../core/auth/auth.service';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { AppService1 } from '../../../app.service';

@Component({
  selector: 'app-handout-rename',
  templateUrl: './handout-rename.component.html',
  styleUrls: ['./handout-rename.component.scss']
})
export class HandoutRenameComponent implements OnInit {
    //imageUrl: string;
    //imageAlt: string;
  DestroyOtherModals: boolean = true;  
  userid: string = '';
  rulesetId: number = 0;
  fileName: string;
  fileExtension: string;
  prefixToGetFolderContent: string = '';
  file: any;
  isLoading: boolean = false;
  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService, private authService: AuthService, private appService: AppService1
    , private location: PlatformLocation, private imageSearchService: ImageSearchService, private alertService: AlertService,) {
    location.onPopState(() => this.modalService.hide(1));
    }

    ngOnInit() {
      setTimeout(() => {
        this.rulesetId = this.bsModalRef.content.rulesetId;
        this.prefixToGetFolderContent = this.bsModalRef.content.prefixToGetFolderContent;
        this.userid = this.bsModalRef.content.userid;
        this.file=this.bsModalRef.content.file ;
        this.DestroyOtherModals = this.bsModalRef.content.DestroyOtherModals ? this.bsModalRef.content.DestroyOtherModals : true;
            this.Initialize();
        }, 0);        
    }
    Initialize() {
      let fileName = this.file.absolutePath.substring(this.file.absolutePath.lastIndexOf('/') + 1);
      let fileExtension = fileName.substr(fileName.lastIndexOf('.') + 1)

    
      if (fileName === fileExtension) {
        this.fileName = fileName
        this.fileExtension = "";
      } else {
        this.fileName = fileName.substr(0,fileName.lastIndexOf('.'))
        this.fileExtension = "." + fileExtension;
      }
      
    }
    close() {
        this.bsModalRef.hide();
        if (this.DestroyOtherModals) {
            this.destroyModal();
        }
  }
  
  RenameFile() {
    this.isLoading = true;
    let fileName = this.file.absolutePath.substring(this.file.absolutePath.lastIndexOf('/') + 1);
    this.alertService.startLoadingMessage("", "Renaming file...");
    this.imageSearchService.renameFile<any>(this.userid, this.rulesetId, fileName, (this.fileName + this.fileExtension), this.prefixToGetFolderContent)
      .subscribe(data => {
        this.alertService.stopLoadingMessage();
        this.isLoading = false;
        this.close();
        this.appService.updateImagesList(true);
      }, error => {
        // this.currentCopiedFile = undefined;
        console.log("searchMyImages Error: ", error);
        this.isLoading = false;
        this.alertService.stopLoadingMessage();
        let Errors = Utilities.ErrorDetail("My Images Api", error);
        if (Errors.sessionExpire) this.authService.logout(true);
        else this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

      },
        () => { });
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
