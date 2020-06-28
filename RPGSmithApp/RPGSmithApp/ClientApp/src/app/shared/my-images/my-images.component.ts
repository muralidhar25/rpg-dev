import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Router } from '@angular/router';
import { BingImage } from '../../core/models/bing-image.model';
import { AuthService } from '../../core/auth/auth.service';
import { AlertService, MessageSeverity, DialogType } from '../../core/common/alert.service';
import { ConfigurationService } from '../../core/common/configuration.service';
import { SharedService } from '../../core/services/shared.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { ImageSearchService } from '../../core/services/shared/image-search.service';
import { UserService } from '../../core/common/user.service';
import { User } from '../../core/models/user.model';
import { DBkeys } from '../../core/common/db-keys';
import { Utilities } from '../../core/common/utilities';
import { ImageViewerComponent } from '../image-interface/image-viewer/image-viewer.component';
import { PlatformLocation } from '@angular/common';

@Component({
    selector: 'app-my-images',
    templateUrl: './my-images.component.html',
    styleUrls: ['./my-images.component.scss']
})
export class MyImagesComponent implements OnInit {
    query: string = '';
    title: string;
    userid: string;
    Options: any;
    page?: number = -1;
    pagesize?: number = -1;
    isLoading = false;
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

    constructor(
        private router: Router, private alertService: AlertService, private bsModalRef: BsModalRef,
        private authService: AuthService, private configurations: ConfigurationService,
        private modalService: BsModalService, private localStorage: LocalStoreManager,
        private sharedService: SharedService, private imageSearchService: ImageSearchService,
        private userService: UserService

      , private location: PlatformLocation) {
      location.onPopState(() => this.modalService.hide(1)); }

    ngOnInit() {
        setTimeout(() => {
            this.title = this.bsModalRef.content.title ? this.bsModalRef.content.title : 'My Images';
            //this.query = this.bsModalRef.content.query ? this.bsModalRef.content.query : '';
            // this.defaultText = this.bsModalRef.content.defaultText ? this.bsModalRef.content.defaultText : 'Web';
            this.Initialize();
        }, 0);
    }
    private Initialize() {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        else {
          this.userid = user.id;
          this.availableSpace = user.storageSpace;
            //this.searchBing(this.query);
            //this.Options = [{ value: IMAGE.MYIMAGES, selected: false }];
            //    this.Options.map((ele) => {
            //        ele.selected = ele.value == IMAGE.MYIMAGES ? true : false;
            //    })
          this.MyImageCount = 39;
          this.previousContainerMyImageNumber = 0;
          this.isMyImagesLoading = false;
          this.hideShowMoreMyImage = false;
            this.searchMyImages(this.query, user.id);
            this.userService.getBlobSpaceUsed<number>(user.id)
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
    }

    submitForm() {
        //if (this.defaultText === IMAGE.MYIMAGES) {
        //searchMyImages
        let q = this.query;
        let _myImages = this.blobMyImagesBLOB;
        this.blobMyImages = _myImages.filter(function (item) {
            return (item.absoluteUri.indexOf(q) > -1) || (item.absolutePath.indexOf(q) > -1);
        });
        //}
    }

    searchMyImages(_query: string, userId: string) {
        this.isLoading = true;
        //this.blobStockImages = [];
        this.blobMyImages = [];

        //this.imageSearchService.getBlobMyImagesSearch<any>(_query, userId)
        //    .subscribe(data => {
        //        this.blobMyImagesBLOB = this.blobMyImages = data.result.items;
        //        this.isLoading = false;
        //    }, error => {
        //        console.log("searchMyImages Error: ", error);
        //        this.isLoading = false;
        //        this.alertService.stopLoadingMessage();
        //        let Errors = Utilities.ErrorDetail("My Images Api", error);
        //        if (Errors.sessionExpire) this.authService.logout(true);
        //        else this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        //    },
        //        () => { });

        this.imageSearchService.getBlobMyImagesSearchPaging<any>(_query, userId, this.MyImageCount, this.previousContainerMyImageNumber)
            .subscribe(data => {
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
        //console.log('scrolled')
        let _query = "";
        this.isMyImagesLoading = true;
        this.imageSearchService.getBlobMyImagesSearchPaging<any>(_query, this.userid, this.MyImageCount, this.previousContainerMyImageNumber)
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


    close() {
        this.bsModalRef.hide();
        this.destroyModalOnInit()
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
    deleteImagePrompt() {
        let message = "Are you sure you would like to delete the selected images?";

        this.alertService.showDialog(message,
            DialogType.confirm, () => this.deleteImage(), null, 'Yes', 'No');
    }
    deleteImage() {
        this.isLoading = true;
        let deletedImages = this.blobMyImages.filter((val) => { return val.isSelected === true });
        this.blobMyImages = this.blobMyImages.filter((val) => { return val.isSelected === false });
        let model = deletedImages.map((blob) => {
            let name = blob.absolutePath.substring(blob.absolutePath.lastIndexOf('/') + 1);
            return { blobName: name, userContainerName: blob.container}
        })
        this.imageSearchService.deleteImages<any>(model)
            .subscribe(data => {
                this.isLoading = false;
            }, error => {
                console.log("searchMyImages Error: ", error);
                this.isLoading = false;
                this.alertService.stopLoadingMessage();
                let Errors = Utilities.ErrorDetail("Delete Images Api", error);
                if (Errors.sessionExpire) this.authService.logout(true);
                else this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
            },
                () => { });
    }

    imageCheckClick(image, event) {
        image.isSelected = event.target.checked;
        let deletedImages = this.blobMyImages.filter((val) => { return val.isSelected === true });

        if (deletedImages.length > 0)
            this.showDeleteBtn = true;
        else
            this.showDeleteBtn = false;
    }
    //mouseDown(image, event) {
    //    let time = new Date();
    //    time.setMilliseconds(time.getMilliseconds() + 1000); //600 miliseconds delay to start the numbering
    //    this.isMouseDown = true;
    //    this.interval = setInterval(() => {
    //        if (time < new Date()) {
    //            if (this.isMouseDown) {
    //                //alert(2)
    //                this.imageCheckClick(image, event);
    //                console.log('down');
    //            }
    //        }
    //    }, 100);
    //}
    //mouseUp() {
    //    this.isMouseDown = false;
    //    clearInterval(this.interval);
    //    this.interval = undefined;
    //}
    //ShowImage(image) {
    //    alert(1);
    //}
    UploadImages(event: any) {                
        let imgList: any[] = [];

        if (event.target.files && event.target.files[0]) {
            imgList = event.target.files;
            this.isLoading = true;            
            this.imageSearchService.uploadImages<any>(imgList,this.userid)
                .subscribe(data => {
                    this.isLoading = false;
                    this.Initialize();
                }, error => {
                    console.log("searchMyImages Error: ", error);
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let Errors = Utilities.ErrorDetail("Upload Images Api", error);
                    if (Errors.sessionExpire) this.authService.logout(true);
                    else this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                },
                    () => { });
        }
    }
    ViewImage(img) {
        if (img) {
            this.bsModalRef = this.modalService.show(ImageViewerComponent, {
                class: 'modal-primary modal-md',
                ignoreBackdropClick: true,
                keyboard: false
            });
            this.bsModalRef.content.ViewImageUrl = img.absoluteUri;
            this.bsModalRef.content.ViewImageAlt = 'Image';
            this.bsModalRef.content.DestroyOtherModals = false;
        }
    }
}
