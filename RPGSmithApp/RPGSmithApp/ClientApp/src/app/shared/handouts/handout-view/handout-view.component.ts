import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ImageSearchService } from '../../../core/services/shared/image-search.service';
import { HandoutFileViewComponent } from '../handout-file-view/handout-file-view.component';
import { User } from '../../../core/models/user.model';
import { DBkeys } from '../../../core/common/db-keys';
import { RulesetService } from '../../../core/services/ruleset.service';
import { Utilities } from '../../../core/common/utilities';

import { BingImage } from '../../../core/models/bing-image.model';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { ConfigurationService } from '../../../core/common/configuration.service';
import { SharedService } from '../../../core/services/shared.service';
import { UserService } from '../../../core/common/user.service';
import { PlatformLocation } from '@angular/common';
import { ImageViewerComponent } from '../../image-interface/image-viewer/image-viewer.component';

@Component({
  selector: 'app-handout-view',
  templateUrl: './handout-view.component.html',
  styleUrls: ['./handout-view.component.scss']
})
export class HandoutViewComponent implements OnInit {
  isLoading = false;
  //Imagelist = [];
  ruleSetId: number;
  //backURL: string = '/character';
  //bsModalRef: BsModalRef;
  query: string = '';
  title: string;
  userid: string;
  Options: any;
  page?: number = -1;
  pagesize?: number = -1;
  blobMyImages: any = [];
  blobMyImagesBLOB: any = [];
  showDeleteBtn: boolean = false;
  bingImages = new Array<BingImage>();
  isMouseDown: boolean = false;
  interval: any;
  usedSpace: string = '0';
  availableSpace: number = 0; 
  MyImageCount: number = 39;
  previousContainerMyImageNumber: number = 0;
  isMyImagesLoading: boolean = false;
  hideShowMoreMyImage: boolean = false;
  //changes
  imagemap: string = 'image';
  createdById: any;
  textmap: string = 'text';
  videomap: string = 'video';
  pdfmap: string = 'application/pdf';
  docmap: string = 'application/msword';
  prefixToGetFolderContent: string = '';

  constructor(
    private router: Router, private alertService: AlertService, private bsModalRef: BsModalRef,
    private authService: AuthService, private configurations: ConfigurationService,
    private modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService, private imageSearchService: ImageSearchService,
    private userService: UserService, private rulesetService: RulesetService,
    private location: PlatformLocation
  ) {
    location.onPopState(() => this.modalService.hide(1));
  }

  ngOnInit() {
    setTimeout(() => {
      this.title = this.bsModalRef.content.title ? this.bsModalRef.content.title : 'HandOuts';
      //console.log(this.bsModalRef.content.rulesetId);
      this.ruleSetId = this.bsModalRef.content.rulesetId;
      this.Initialize();
    }, 0);
  }

  Initialize() {
    this.isLoading = true;
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.userid = user.id;
      this.availableSpace = user.storageSpace;
      this.rulesetService.getRulesetById<any>(this.ruleSetId)
        .subscribe(data => {
          if (data) {
            this.createdById = data.createdBy;
            this.MyImageCount = 39;
            this.previousContainerMyImageNumber = 0;
            this.isMyImagesLoading = false;
            this.hideShowMoreMyImage = false;
            this.searchMyImages(this.query, this.createdById);

            this.userService.getBlobSpaceUsed<number>(this.userid)
              .subscribe(
                data => {
                  this.usedSpace = data.toFixed(2);
                },
                error => {
                  let Errors = Utilities.ErrorDetail("Get Usage", error);
                  if (Errors.sessionExpire) {
                    this.authService.logout(true);
                  }
                }, () => { });
          }
        }, error => {
          this.isLoading = true;
            let Errors = Utilities.ErrorDetail("", error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            }
        }, () => { })
     
    }
  }

  searchMyImages(_query: string, userId: string) {
    this.isLoading = true;
    //this.blobStockImages = [];
    this.blobMyImages = [];

    this.imageSearchService.getListOfUploads<any>(userId, this.MyImageCount, this.previousContainerMyImageNumber, this.prefixToGetFolderContent, this.ruleSetId)
      .subscribe(data => {
        //console.log(data.result);
        this.blobMyImagesBLOB = this.blobMyImages = data.result.blobResponse.items;
        this.isLoading = false;
        this.previousContainerMyImageNumber = data.result.previousContainerImageNumber;
        if (data.result.blobResponse.items.length < 39) {
          this.hideShowMoreMyImage = true;
        }
      }, error => {
        console.log("searchMyImages Error: ", error);
        this.isLoading = false;
        this.alertService.stopLoadingMessage();
        let Errors = Utilities.ErrorDetail("My Images Api", error);
        if (Errors.sessionExpire) this.authService.logout(true);
        else this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
      },
        () => { });
  }

  onScroll() {
    if (!this.hideShowMoreMyImage) {
      this.moreMyImages();
    }
  }
  moreMyImages() {
    let _query = "";
    this.isMyImagesLoading = true;

    this.imageSearchService.getListOfUploads<any>(this.userid, this.MyImageCount, this.previousContainerMyImageNumber, this.prefixToGetFolderContent, this.ruleSetId)
      .subscribe(data => {

        this.blobMyImagesBLOB = this.blobMyImagesBLOB.concat(data.result.blobResponse.items);
        this.blobMyImages = this.blobMyImages.concat(data.result.blobResponse.items);
        this.isLoading = false;
        this.previousContainerMyImageNumber = data.result.previousContainerImageNumber;
        this.isLoading = false;
        this.isMyImagesLoading = false;
        if (data.result.blobResponse.items.length < 39) {
          this.hideShowMoreMyImage = true;
        }
      }, error => {
        this.isMyImagesLoading = false;
        console.log("searchMyImages Error: ", error);
        this.isLoading = false;
        this.alertService.stopLoadingMessage();
        let Errors = Utilities.ErrorDetail("My Images Api", error);
        if (Errors.sessionExpire) this.authService.logout(true);
        else this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

      },
        () => { });
  }


  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //const modalContainer = document.querySelector('modal-container');
      //if (modalContainer !== null) {
      //    modalContainer.parentNode.removeChild(modalContainer);
      //}
    } catch (err) { }
  }

  close() {
    this.bsModalRef.hide();
    this.destroyModalOnInit()
  }


  submitForm() {
    //if (this.defaultText === IMAGE.MYIMAGES) {
    //searchMyImages
    let q = this.query;
    //console.log(q);
    
    let _myImages = this.blobMyImagesBLOB;
    
    this.blobMyImages = _myImages.filter((item) => {
      //console.log(item);
       return item.absoluteUri.indexOf(q) > -1 || item.absolutePath.indexOf(q) > -1
    });
    //}
  }
  ViewImage(item) {
    if (item.isFolder) {
      this.OpenFolder(item.name);
    }
    else {
      //if (item.contentType.indexOf("image") > -1) {
      //  this.bsModalRef = this.modalService.show(ImageViewerComponent, {
      //    class: 'modal-primary modal-md',
      //    ignoreBackdropClick: true,
      //    keyboard: false
      //  });
      //  this.bsModalRef.content.ViewImageUrl = item.absoluteUri;
      //  this.bsModalRef.content.ViewImageAlt = 'Image';
      //  this.bsModalRef.content.DestroyOtherModals = false;
      //} else {
      //  this.bsModalRef = this.modalService.show(HandoutFileViewComponent, {
      //    class: 'modal-primary modal-lg',
      //    ignoreBackdropClick: true,
      //    keyboard: false
      //  });
      //  this.bsModalRef.content.ViewDetails = item;
      //}
      this.download(item.absoluteUri, item.name);
    }
    
  }
  OpenFolder(name) {
    this.blobMyImages.map((val) => { val.isSelected = false })
    this.showDeleteBtn = false;
    this.prefixToGetFolderContent = name;
    this.Initialize();
  }
  backToRoot() {
    this.blobMyImages.map((val) => { val.isSelected = false })
    this.showDeleteBtn = false;
    this.prefixToGetFolderContent = "";
    this.Initialize();
  }
  download(url, downloadName) {
    window.open(url);
    //this.alertService.startLoadingMessage("", "Downloading file...");
    //fetch(new Request("/api/Image/ConvertImageURLToBase64?url=" + url)).then((response) => {
    //  response.text().then((base64) => {
    //    let a = document.createElement("a");
    //    document.body.appendChild(a);
    //    let hrefurl: any = base64;
    //    a.href = hrefurl;
    //    a.download = downloadName;
    //    a.target = "_blank"
    //    a.click();
    //    document.body.removeChild(a);
    //    this.alertService.stopLoadingMessage();
    //  }).catch(() => {
    //    this.alertService.stopLoadingMessage();
    //    this.alertService.showMessage("Some error occured.", "", MessageSeverity.error);
    //  });
    //});
  }
  getFolderName(name: string) {
    if (name) {
      return name.replace('/', '');

    }
    return name;
  }
}
