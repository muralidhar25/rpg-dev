import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { BingImage } from '../../../core/models/bing-image.model';
import { AlertService, MessageSeverity, DialogType } from '../../../core/common/alert.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ConfigurationService } from '../../../core/common/configuration.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { SharedService } from '../../../core/services/shared.service';
import { UserService } from '../../../core/common/user.service';
import { ImageSearchService } from '../../../core/services/shared/image-search.service';
import { User } from '../../../core/models/user.model';
import { DBkeys } from '../../../core/common/db-keys';
import { Utilities } from '../../../core/common/utilities';
import { ImageViewerComponent } from '../../image-interface/image-viewer/image-viewer.component';
import { HandoutFileViewComponent } from '../handout-file-view/handout-file-view.component';
import { HandoutNewFolderComponent } from '../handout-new-folder/handout-new-folder.component';
import { AppService1 } from '../../../app.service';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Ruleset } from '../../../core/models/view-models/ruleset.model';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { HandoutRenameComponent } from '../handout-rename/handout-rename.component';

@Component({
  selector: 'app-handoutupload',
  templateUrl: './handoutupload.component.html',
  styleUrls: ['./handoutupload.component.scss']
})
export class HandoutuploadComponent implements OnInit { 
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
  //changes
   imagemap: string = 'image';
    textmap: string = 'text'; 
    videomap: string = 'video';
    pdfmap: string = 'application/pdf';
  docmap: string = 'application/msword';

  prefixToGetFolderContent: string = '';
  ruleset: Ruleset = new Ruleset();
  currentCopiedFile: any = undefined;
  isUploadingFiles = false;
  progressCompletedYet: number = 0;
  //public items = [
  //  { name: 'John', otherProperty: 'Foo' },
  //  { name: 'Joe', otherProperty: 'Bar' }
  //];
  @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;

  
  constructor(
    private router: Router, private alertService: AlertService, private bsModalRef: BsModalRef,
    private authService: AuthService, private configurations: ConfigurationService,
    private modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService, private imageSearchService: ImageSearchService, protected http: HttpClient,
    private userService: UserService, private appService: AppService1, private sanitizer: DomSanitizer,
   private location: PlatformLocation
  ) {
    location.onPopState(() => this.modalService.hide(1));
    this.appService.shouldUpdateImagesList().subscribe(serviceJson => {
      if (serviceJson) {        
        this.Initialize();
      }
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.title = this.bsModalRef.content.title ? this.bsModalRef.content.title : 'HandOuts';
      this.ruleset=this.bsModalRef.content.ruleset;
      //this.query = this.bsModalRef.content.query ? this.bsModalRef.content.query : '';
      // this.defaultText = this.bsModalRef.content.defaultText ? this.bsModalRef.content.defaultText : 'Web';
      this.Initialize();
    }, 0);
  }
  private Initialize() {
    this.isLoading = true;
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
      this.isUploadingFiles = false;
      this.progressCompletedYet = 0;
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
  ConfirmationToUploadFiles(event: any) {
    let showPopup = false;
    if (event.target.files) {
      if (event.target.files.length) {
        
        for (var i = 0; i < event.target.files.length; i++) {
          let res = this.blobMyImages.filter(item => this.getFileName(item.name) == event.target.files[i].name);
          if (res.length) {
            showPopup = true;
          }
        }
        //event.target.files.map((x) => {
        //  let res = this.blobMyImages.filter(item => item.name == x.name);
        //  if (res.length) {
        //    showPopup = true;
        //  }
        //})
      }
    }
    if (showPopup) {
      this.alertService.showDialog("Overwrite File In Destination.",
        DialogType.confirm, () => this.UploadImages(event), () => { }, "Yes", "No");
    } else {
      this.UploadImages(event)
    }
  }
  CalculateProgress(totalSpaceOfFiles:number) {    
    if (this.progressCompletedYet > 95) {
      this.progressCompletedYet=96
    }
    else {
      this.progressCompletedYet = (this.progressCompletedYet + (7000000) / totalSpaceOfFiles);
    }
    //console.log("this.progressCompletedYet", this.progressCompletedYet)
  }
  getWholeNumber(number) {
    return Math.ceil(number);
  }
  UploadImages(event: any) {
    let imgList: any[] = [];
    if (event.target.files && event.target.files[0]) {
      imgList = event.target.files;      
      this.isLoading = true;
      this.isUploadingFiles = true;
      this.progressCompletedYet = 0;
      let totalSpaceOfFiles: number = 0;
      for (var _fileIndex = 0; _fileIndex < event.target.files.length; _fileIndex++) {
        totalSpaceOfFiles = totalSpaceOfFiles + event.target.files[_fileIndex].size; //size in bytes
      }
      if (totalSpaceOfFiles <= 209715200 ) { //check of 200 MB
        //console.log("interval started");
        var ProgressTimer = setInterval(() => {
          //console.log("zz")
          this.CalculateProgress(totalSpaceOfFiles)
        }, 100);
        if (this.prefixToGetFolderContent) {
          this.imageSearchService.uploadHandoutFolder<any>(imgList, this.userid, this.prefixToGetFolderContent, this.ruleset.ruleSetId)
            .subscribe(data => {
              if (data) {
                if (data.result) {
                  this.isLoading = false;
                  this.isUploadingFiles = false;
                  //console.log("interval end1");
                  this.progressCompletedYet = 100;
                  clearInterval(ProgressTimer);
                  this.Initialize();
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
        }
        else {
          this.imageSearchService.uploadHandouts<any>(imgList, this.userid, this.ruleset.ruleSetId)
            .subscribe(data => {
              if (data) {
                if (data.result) {
                  this.isLoading = false;
                  this.isUploadingFiles = false;
                  //console.log("interval end2");
                  this.progressCompletedYet = 100;
                  clearInterval(ProgressTimer);
                  this.Initialize();
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
        }
      }
      else {
        event.target.value = "";
        this.isLoading = false;
        this.alertService.stopLoadingMessage();
        this.alertService.showStickyMessage('', "Max. 200 MB of data can be uploaded.", MessageSeverity.error);
      }
      
    }
  }

  createFolder() {   
    this.bsModalRef = this.modalService.show(HandoutNewFolderComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.userid = this.userid;
    this.bsModalRef.content.rulesetId = this.ruleset.ruleSetId;
    //this.bsModalRef.content.ViewImageAlt = 'Image';
    this.bsModalRef.content.DestroyOtherModals = false;
  }
  ViewImage(item) {
    
    //if (item.contentType.indexOf("image") > -1) {
    //    this.bsModalRef = this.modalService.show(ImageViewerComponent, {
    //      class: 'modal-primary modal-md',
    //      ignoreBackdropClick: true,
    //      keyboard: false
    //    });
    //  this.bsModalRef.content.ViewImageUrl = item.absoluteUri;
    //  this.bsModalRef.content.ViewImageAlt = 'Image';
    //  this.bsModalRef.content.DestroyOtherModals = false;
    //} else {
    //    this.bsModalRef = this.modalService.show(HandoutFileViewComponent, {
    //      class: 'modal-primary modal-lg',
    //      ignoreBackdropClick: true,
    //      keyboard: false
    //    });
    //    this.bsModalRef.content.ViewDetails = item;
    //}
    this.download(item.absoluteUri, item.name);
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
    //       
    //        this.isLoading = false;
    //        this.alertService.stopLoadingMessage();
    //        let Errors = Utilities.ErrorDetail("My Images Api", error);
    //        if (Errors.sessionExpire) this.authService.logout(true);
    //        else this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
    //    },
    //        () => { });

    this.imageSearchService.getListOfUploads<any>(userId, this.MyImageCount, this.previousContainerMyImageNumber, this.prefixToGetFolderContent, this.ruleset.ruleSetId)
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
    
    let _query = "";
    this.isMyImagesLoading = true;

    this.imageSearchService.getListOfUploads<any>(this.userid, this.MyImageCount, this.previousContainerMyImageNumber, this.prefixToGetFolderContent, this.ruleset.ruleSetId)
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
      let name = decodeURIComponent(blob.absolutePath.substring(blob.absolutePath.lastIndexOf('/') + 1)) ;
      return { blobName: name, userContainerName: blob.container }
    })
    this.blobMyImagesBLOB = this.blobMyImages;
    this.imageSearchService.deleteImages<any>(model, this.prefixToGetFolderContent)
      .subscribe(data => {      
        this.isLoading = false;
        this.blobMyImages.map((val) => { val.isSelected = false })
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
  //                
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
  isimageSelected() {
    var length = this.blobMyImages.filter((val) => { return val.isSelected === true })
    return length;
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
    //debugger
    //this.alertService.startLoadingMessage("", "Downloading file...");
    //let a = document.createElement("a");
    //document.body.appendChild(a);

    //const data = 'some text';
    //const blob = new Blob([data], { type: 'application/octet-stream' });


    window.open(url);

    //let hrefurl: any = "/api/Image/DownloadBlob?fileName=" + url + "&userId=" + this.userid + "&campaignID=" + this.ruleset.ruleSetId;
    ////hrefurl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    //a.href = hrefurl;
    //a.download = downloadName.replace('/', '_');
    //a.target = "_blank"
    //a.click();
    //document.body.removeChild(a);
   // this.alertService.stopLoadingMessage();


    //fetch(new Request("/api/Image/DownloadBlob?fileName=" + url + "&userId=" + this.userid + "&campaignID=" + this.ruleset.ruleSetId)).then((response) => {
    //  response.text().then((base64) => {
    //    debugger
    //    let a = document.createElement("a");
    //    document.body.appendChild(a);
    //    let hrefurl: any = base64;
    //    a.href = hrefurl;
    //    a.download = downloadName.replace('/','_');
    //    a.target = "_blank"
    //    a.click();
    //    document.body.removeChild(a);
    //    this.alertService.stopLoadingMessage();
    //  }).catch(() => {
    //    this.alertService.stopLoadingMessage();
    //    this.alertService.showMessage("Some error occured.", "", MessageSeverity.error);
    //    });
    //});


    //fetch(new Request("/api/Image/ConvertImageURLToBase64?url=" + url)).then((response) => {
    //  response.text().then((base64) => {
    //    let a = document.createElement("a");
    //    document.body.appendChild(a);
    //    let hrefurl: any = base64;
    //    a.href = hrefurl;
    //    a.download = downloadName.replace('/','_');
    //    a.target = "_blank"
    //    a.click();
    //    document.body.removeChild(a);
    //    this.alertService.stopLoadingMessage();
    //  }).catch(() => {
    //    this.alertService.stopLoadingMessage();
    //    this.alertService.showMessage("Some error occured.", "", MessageSeverity.error);
    //    });
    //});
  }
  getFolderName(name:string) {
    if (name) {
      return name.replace('/', '');

    }
    return name;
  }
getFileName(name:string) {
    if (name) {

      if (name.split('/').length) {
        return name.split('/')[name.split('/').length-1];
      }       
    }
    return name;
  }
  
  public isFileSelected(item: any): boolean {
    return item.isFolder === false;
  }
  public isFolderSelected(item: any): boolean {
    return item.isFolder === true;
  }
  public RenameFile(file: any) {
    this.bsModalRef = this.modalService.show(HandoutRenameComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.userid = this.userid;
    this.bsModalRef.content.rulesetId = this.ruleset.ruleSetId;
    this.bsModalRef.content.prefixToGetFolderContent = this.prefixToGetFolderContent;
    this.bsModalRef.content.DestroyOtherModals = false;
    this.bsModalRef.content.file = file;
    //this.isLoading = true
    //this.imageSearchService.renameFile<any>(this.userid, this.MyImageCount, this.previousContainerMyImageNumber, this.prefixToGetFolderContent, this.ruleset.ruleSetId)
    //  .subscribe(data => {

    //    this.blobMyImagesBLOB = this.blobMyImagesBLOB.concat(data.result.blobResponse.items);
    //    this.blobMyImages = this.blobMyImages.concat(data.result.blobResponse.items);
    //    this.isLoading = false;
    //    this.previousContainerMyImageNumber = data.result.previousContainerImageNumber;
    //    this.isLoading = false;
    //    this.isMyImagesLoading = false;
    //    if (data.result.blobResponse.items.length < 39) {
    //      this.hideShowMoreMyImage = true;
    //    }
    //  }, error => {
    //    this.isMyImagesLoading = false;
    //    console.log("searchMyImages Error: ", error);
    //    this.isLoading = false;
    //    this.alertService.stopLoadingMessage();
    //    let Errors = Utilities.ErrorDetail("My Images Api", error);
    //    if (Errors.sessionExpire) this.authService.logout(true);
    //    else this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

    //  },
    //    () => { });
  }
  public DeleteSingleFileConfirmation(file: any) {
    this.alertService.showDialog('Are you sure you want to permanently delete file "' + this.getFileName(file.name) + '".',
      DialogType.confirm, () => this.DeleteSingleFile(file), () => { }, "Yes", "No");
  }
  public DeleteSingleFile(file: any) {    
    this.isLoading = true;
    let model = [];
    let name = decodeURIComponent(file.absolutePath.substring(file.absolutePath.lastIndexOf('/') + 1));
    model.push({ blobName: name, userContainerName: file.container });
    this.alertService.startLoadingMessage("", "Deleting file...");
    this.imageSearchService.deleteImages<any>(model, this.prefixToGetFolderContent)
      .subscribe(data => {
        this.alertService.stopLoadingMessage();
        this.Initialize();
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

  public DeleteFolderConfirmation(file: any) {
    this.alertService.showDialog('Are you sure you want to permanently delete folder "' + this.getFolderName(file.name)+'".',
      DialogType.confirm, () => this.DeleteFolder(file), () => { }, "Yes", "No");
  }
  public DeleteFolder(file: any) {    
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Deleting folder...");
    this.imageSearchService.deleteFolder<any>(this.userid, this.ruleset.ruleSetId, file.name)
      .subscribe(data => {
        this.alertService.stopLoadingMessage();
        this.Initialize();
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
  public CopyFile(file: any) {
    this.currentCopiedFile = undefined;
    file.isCopied = true;
    file.CopiedFromFolder = this.prefixToGetFolderContent;
    this.currentCopiedFile = file;
  }
  public MoveFile(file: any) {
    this.currentCopiedFile = undefined;
    file.isCopied = false;
    file.CopiedFromFolder = this.prefixToGetFolderContent;
    this.currentCopiedFile = file;
  }
  public pasteFile() {
    if (this.currentCopiedFile) {
      let isCopied = this.currentCopiedFile.isCopied;
      let fileName = this.currentCopiedFile.absolutePath.substring(this.currentCopiedFile.absolutePath.lastIndexOf('/') + 1);
      let CopiedFromFolder = this.currentCopiedFile.CopiedFromFolder
      this.isLoading = true;
      this.alertService.startLoadingMessage("", "Pasting file...");
      this.imageSearchService.moveCopyFile<any>(this.userid, this.ruleset.ruleSetId, fileName, this.prefixToGetFolderContent, CopiedFromFolder, isCopied)
        .subscribe(data => {
          this.alertService.stopLoadingMessage();
          this.currentCopiedFile = undefined;
          this.Initialize();
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
  }
}
