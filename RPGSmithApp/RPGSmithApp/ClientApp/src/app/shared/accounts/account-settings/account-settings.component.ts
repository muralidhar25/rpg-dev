import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { AlertService, MessageSeverity, DialogType } from '../../../core/common/alert.service';
import { AuthService } from "../../../core/auth/auth.service";
import { ConfigurationService } from '../../../core/common/configuration.service';
import { Utilities } from '../../../core/common/utilities';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { SharedService } from "../../../core/services/shared.service";
import { UserService } from "../../../core/common/user.service";
import { User } from '../../../core/models/user.model';
import { DBkeys } from '../../../core/common/db-keys';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { AccountSettings } from '../../../core/models/account.model';
import { VIEW, TILES } from '../../../core/models/enums';
import { BingSearchComponent } from '../../image-interface/bing-search/bing-search.component';
import { ImageSelectorComponent } from '../../image-interface/image-selector/image-selector.component';
import { FileUploadService } from "../../../core/common/file-upload.service";
import { setTimeout } from 'timers';
import { DeleteAccountComponent } from '../delete-account/delete-account.component';
import { AppService1 } from '../../../app.service';
import { PlatformLocation } from '@angular/common';

@Component({
    selector: 'settings',
    templateUrl: './account-settings.component.html',
    styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {

    showWebButtons: boolean;
    accountSettings: any = new AccountSettings();
    userFormModal: any = new User();
    fileToUpload: File = null;
    isLoading: boolean = false;
    showExistMsg: boolean = false;
    userExist: boolean = false;
    userExistMsg: string;
    socialLogin: string = null;
    hasEmail: boolean = false;
    uploadFromBing: boolean = false;
    bingImageUrl: string;
    bingImageExt: string;
    imageChangedEvent: any = '';
    croppedImage: any = '';
    imageErrorMessage: string = 'high resolution images will affect loading times and diminish performance';
    usedSpace: string = '0';
  availableSpace: number = 0;  
    constructor(
        private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
        private bsModalRef: BsModalRef, private modalService: BsModalService, private sharedService: SharedService,
      private userService: UserService, private localStorage: LocalStoreManager, private fileUploadService: FileUploadService,
      public appService: AppService1

      , private location: PlatformLocation) {
      location.onPopState(() => this.modalService.hide(1)); 
    }

    ngOnInit() {
        this.initialize();
    }

    private initialize() {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        else {
          this.availableSpace = user.storageSpace;
            this.isLoading = true;
            this.userService.getBlobSpaceUsed<number>(user.id)
                .subscribe(
                    data => {
                        this.usedSpace = data.toFixed(2);
                    },
                    error => {
                        let Errors = Utilities.ErrorDetail("Unable to Delete", error);
                        if (Errors.sessionExpire) {
                            this.authService.logout(true);
                        }
                }, () => { });

            this.userService.getUserById(user.id)
                .subscribe(
              data => {                      
                        //console.log(data);
                        this.userFormModal = data;
                        this.localStorage.saveSyncedSessionData(data, DBkeys.CURRENT_USER);
                        this.hasEmail = this.authService.hasEmailFb;
                        this.socialLogin = this.authService.socialLogin;
                        this.bingImageUrl = this.userFormModal.profileImage;
                this.isLoading = false;
                if (this.userFormModal.autoRenewDate) {
                  let date = new Date(this.userFormModal.autoRenewDate.replace('T', ' '));
                  //let string = this.formatAMPM(date);
                  let string = ' ' + date.toDateString().replace(' ', '##').split('##')[1];
                  this.userFormModal.autoRenewDate = string;

                }
                    },
                    error => {
                        this.isLoading = false;
                        this.alertService.stopLoadingMessage();

                        let Errors = Utilities.ErrorDetail("Unable to Delete", error);
                        if (Errors.sessionExpire) {
                            this.authService.logout(true);
                        }
                        else
                            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

                }, () => { });

            this.socialLogin = this.authService.socialLogin;
        }
  }

    checkAvailability(userModal: any) {
        if (userModal.userName.trim() == '' || userModal.userName == undefined || userModal.userName == null) {
            this.showExistMsg = true;
            let isExist: boolean = true;
            this.userExistMsg = "Please enter a username.";
            this.userExist = isExist;
        }
      if (!/^[a-zA-Z0-9._\\-]{2,}$/g.test(userModal.userName)) {
          this.showExistMsg = true;
          let isExist: boolean = true;
        this.userExistMsg = "Please provide a valid Username, no spaces or special characters allowed.";
          this.userExist = isExist;      
        }   
        else {
            this.userService.checkAvailability<any>(userModal)
                .subscribe(
                    data => {
                        this.showExistMsg = true;
                        let isExist: boolean = data.isUserExist;
                        this.userExistMsg = isExist ? "Username Already Exists." : "Username is Available.";
                        this.userExist = isExist;
                    },
                    error => {
                        this.showExistMsg = false;
                    }
                );
        }
    }

    fileInput(files: FileList) {
        this.fileToUpload = files.item(0);
    }

    validateImageSize() {
        if ((this.fileToUpload.size / 1024) <= 250) {
            return true;
        }
        return false;
    }

    submitForm() {
        this.validateSubmit();
    }

    validateSubmit() {
        this.isLoading = true;
        if (this.fileToUpload != null) {
            /*image upload then submit */
            this.fileUpload();
        }
        else if (this.bingImageUrl !== this.userFormModal.profileImage) {
            try {
                var regex = /(?:\.([^.]+))?$/;
                var extension = regex.exec(this.userFormModal.profileImage)[1];
                extension = extension ? extension : 'jpg';
            } catch{ }
            this.fileUploadFromBing(this.userFormModal.profileImage, extension);
        }
        else {
            this.submit();
        }
    }

    private fileUploadFromBing(file: string, ext: string) {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout(true);
        else {
            this.fileUploadService.fileUploadFromURL<any>(user.id, file, ext)
                .subscribe(
                    data => {
                        this.userFormModal.profileImage = data.ImageUrl;
                        //this.charactersFormModal.thumbnailUrl = data.ThumbnailUrl;
                        this.submit();
                    },
                    error => {
                        let Errors = Utilities.ErrorDetail('Error', error);
                        if (Errors.sessionExpire) {
                            this.authService.logout(true);
                        } else this.submit();
                    });
        }
    }

    fileUpload() {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout(true);
        else {
            this.fileUploadService.fileUploadByUser<any>(user.id, this.fileToUpload)
                .subscribe(
                    data => {
                        this.userFormModal.profileImage = data.ImageUrl;
                        //this.charactersFormModal.thumbnailUrl = data.ThumbnailUrl;
                        this.submit();
                    },
                    error => {
                        let Errors = Utilities.ErrorDetail('Error', error);
                        if (Errors.sessionExpire) {
                            this.authService.logout(true);
                        } else this.submit();
                    });
        }
    }

    private fileUploadOLD() {
        this.isLoading = true;
        this.alertService.startLoadingMessage("", "Updating Account Setting");
        //file upload
        this.userService.fileUpload(this.fileToUpload)
            .subscribe(
                data => {
                    //console.log(data);
                    this.userFormModal.profileImage = data.ProfileImage;
                    this.submit();
                },
                error => {
                    console.log(error);
                    this.submit();
                });
    }

    private submit() {
      this.isLoading = true;
      let URL: string = window.location.origin;      
      if (this.socialLogin != 'facebook') {
        if (!/^[a-zA-Z0-9._\\-]{2,}$/g.test(this.userFormModal.userName)) {
          this.alertService.showMessage("Please provide a valid Username, no spaces or special characters allowed.", "", MessageSeverity.error);
          this.isLoading = false;
          return false;
        }        
      }      
        this.userService.updateAccountSetting<any>(this.userFormModal, URL)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    this.localStorage.saveSyncedSessionData(data.data, DBkeys.CURRENT_USER);
                    if (data.message == 'Please confirm your email account.')
                        this.alertService.showMessage(data.message, "", MessageSeverity.warn);
                    else
                        this.alertService.showMessage(data.message, "", MessageSeverity.success);

                    this.bsModalRef.hide();
                  this.destroyModalOnInit();
                  this.appService.updateAccountSetting1(true);
                    this.sharedService.updateAccountSetting(true);
                },
                error => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let _message = "Unable to Update settings";
                    let Errors = Utilities.ErrorDetail(_message, error);
                    if (Errors.sessionExpire) {
                        //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                }
            );
    }

    changePassowrd() {
        this.bsModalRef.hide();
        this.bsModalRef = this.modalService.show(ChangePasswordComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
    }

    deleteAccount() {
        this.bsModalRef.hide();
        this.bsModalRef = this.modalService.show(DeleteAccountComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.userdata = this.userFormModal;
        this.bsModalRef.content.socialLogin = this.socialLogin;

        //this.bsModalRef.content.event.subscribe(data => {
        //    return data === true;
        //});
        return false;
    }

    close() {
        this.bsModalRef.hide();
        this.destroyModalOnInit();
    }

    showButtons() {
        this.showWebButtons = true;
    }

    hideButtons() {
        this.showWebButtons = false;
    }

    readTempUrl(event: any) {
        if (event.target.files && event.target.files[0]) {
            var reader = new FileReader();

            reader.onload = (event: any) => {
                this.userFormModal.profileImage = event.target.result;
            }

            reader.readAsDataURL(event.target.files[0]);
            this.imageChangedEvent = event;
        }
  }

    private destroyModalOnInit(): void {
        try {
            this.modalService.hide(1);
            document.body.classList.remove('modal-open');
            //$(".modal-backdrop").remove();
        } catch (err) { }
    }
    cropImage(img: string, OpenDirectPopup: boolean, view: string) {
        this.bsModalRef = this.modalService.show(ImageSelectorComponent, {
            class: 'modal-primary modal-sm selectPopUpModal',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'default';
        this.bsModalRef.content.image = img;
        this.bsModalRef.content.view = view;
        this.bsModalRef.content.errorImage = '../assets/images/DefaultImages/AccountProfile.jpg';
        //this.bsModalRef.content.imageChangedEvent = this.imageChangedEvent; //base 64 || URL
        this.bsModalRef.content.event.subscribe(data => {
            this.userFormModal.profileImage = data.base64;
            this.fileToUpload = data.file;
            this.showWebButtons = false;
        });
    }
    fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;
    }
    imageCropped(image: string) {
        this.croppedImage = image;
    }
    imageLoaded() {
        // show cropper
    }
    loadImageFailed() {
        // show message
  }
  changeAutoRenew(e) {
    if (!e.target.checked) {
      e.target.checked = true;
      this.userFormModal.isSubscriptionAutoRenew = true;                                   
      this.alertService.showDialog("Unchecking this box will cancel your GM subscription on " + this.userFormModal.autoRenewDate + ", and you will not incur further charges for this account type. You will continue to have GM account privileges until this date at which time your account will convert to a 'Player' account. Would you like to proceed and cancel your subscription?",
        DialogType.confirm, () => { this.userFormModal.isSubscriptionAutoRenew = e.target.checked = false; }, () => { this.userFormModal.isSubscriptionAutoRenew = e.target.checked == true;}, "Yes", "No");
    }
  }
}
