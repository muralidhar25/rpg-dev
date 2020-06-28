import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from "@angular/router";
import { Utilities } from '../../core/common/utilities';
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { AuthService } from '../../core/auth/auth.service';
import { ConfigurationService } from '../../core/common/configuration.service';
import { CharactersService } from '../../core/services/characters.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { FileUploadService } from '../../core/common/file-upload.service';
import { CommonService } from '../../core/services/shared/common.service';
import { ImageSearchService } from '../../core/services/shared/image-search.service';
import { RulesetService } from '../../core/services/ruleset.service';
import { SharedService } from '../../core/services/shared.service';
import { User } from '../../core/models/user.model';
import { DBkeys } from '../../core/common/db-keys';
import { VIEW } from '../../core/models/enums';
import { ImageSelectorComponent } from '../../shared/image-interface/image-selector/image-selector.component';
import { Characters } from '../../core/models/view-models/characters.model';
import { PlatformLocation } from '@angular/common';
import { AppService1 } from "../../app.service";
import { marketplaceListModel } from '../../core/models/marketplace.model';
import { PaymentComponent } from '../payment/payment.component';
@Component({
  selector: 'app-characters-form',
  templateUrl: './characters-form.component.html',
  styleUrls: ['./characters-form.component.scss']
})
export class CharactersFormComponent implements OnInit {

  charactersModel = new Characters();
  charactersFormModal: any = new Characters();
  charactersForm: FormGroup;
  isLoading = false;
  showWebButtons: boolean = false;
  fileToUpload: File = null;
  page: number = 1;
  pageSize: number = 7;
  offset = (this.page - 1) * this.pageSize;
  bingImageUrl: string;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  imageErrorMessage: string = 'High resolution images will affect loading times and diminish performance. Do you still want to upload ?';
  title: string
  button: string
  rulesets: any;

  isFromRuleSetDetails: boolean;
  options(placeholder?: string, initOnClick?: boolean): Object {
    return Utilities.optionsFloala(160, placeholder, initOnClick, false, false);
  }

  layoutHeight: number;
  layoutWidth: number;

  UserRulesetsList: Ruleset[] = [];
  searchText: string = ''

  IsSecondClick: boolean = false;

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    this.layoutHeight = window.innerHeight;
    this.layoutWidth = window.innerWidth;
  }

  constructor(
    private router: Router, private alertService: AlertService, private authService: AuthService,
    private configurations: ConfigurationService, private charactersService: CharactersService,
    private bsModalRef: BsModalRef, private modalService: BsModalService, private localStorage: LocalStoreManager,
    private fileUploadService: FileUploadService, private rulesetService: RulesetService,
    private sharedService: SharedService, private commonService: CommonService, private imageSearchService: ImageSearchService,
    private location: PlatformLocation,
    public appService: AppService1) {
    location.onPopState(() => this.modalService.hide(1));
    this.onResize();
  }

  ngOnInit() {

    setTimeout(() => {

      this.title = this.bsModalRef.content.title;
      let modalContentButton = this.button = this.bsModalRef.content.button;
      let _charactersModel = this.bsModalRef.content.charactersModel;
      _charactersModel.ruleSets = this.bsModalRef.content.ruleSet;

      this.charactersFormModal.ruleSets = [];
      this.charactersFormModal = this.charactersService.characterModelData(_charactersModel, modalContentButton);
      this.UserRulesetsList = Object.assign([], this.charactersFormModal.ruleSets);

      if (this.bsModalRef.content.isFromRuleSetDetails) {
        this.isFromRuleSetDetails = this.bsModalRef.content.isFromRuleSetDetails;
        //console.log(this.bsModalRef.content.ruleset);
        this.charactersFormModal.ruleSetId = this.bsModalRef.content.ruleset.ruleSetId;
      }
      this.bingImageUrl = this.charactersFormModal.imageUrl;
      if (this.charactersFormModal.view == VIEW.ADD) {
        this.initialize();
        //this.charactersFormModal.ruleSets = this.bsModalRef.content.ruleSet;
        //this.charactersFormModal.hasRuleset = this.charactersFormModal.ruleSets == undefined ? false : this.charactersFormModal.ruleSets.length == 0 ? false : true;
      }
    }, 0);
  }

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {

      // this.rulesetService.getRulesetsByUserId(user.id)
      //     .subscribe(data => {
      //         this.charactersFormModal.ruleSets = data;
      //         this.charactersFormModal.hasRuleset = data == undefined ? false : data.length == 0 ? false : true;
      //         this.isLoading = false;
      //     }, error => { }, () => { });
      if (!this.isFromRuleSetDetails) {
        this.isLoading = true;
        this.rulesetService.getRuleSetToCreateCharacterByUserId(user.id, this.page, this.pageSize)
          .subscribe(data => {
            this.charactersFormModal.ruleSets = data;
            this.charactersFormModal.hasRuleset = data == undefined ? false : data.length == 0 ? false : true;
            this.isLoading = false;
          }, error => {
            this.isLoading = false;
            this.alertService.stopLoadingMessage();
            let Errors = Utilities.ErrorDetail("Error", error);
            if (Errors.sessionExpire) this.authService.logout(true);
          }, () => { });
      }
      //this.rulesetService.getAllRuleSetByUserId(user.id, this.page, this.pageSize)

    }
  }
  fileInput(_files: FileList) {
    this.fileToUpload = _files.item(0);
    this.showWebButtons = false;
  }

  setCharacterRuleset(_ruleset: any) {
    if (_ruleset.isAlreadyPurchased) {
      this.charactersFormModal.ruleSetId = _ruleset.ruleSetId;
    }
    else {
      if (_ruleset.price) {
        if (!this.IsSecondClick) {
          this.buyRuleset(_ruleset); ///buy
          this.IsSecondClick = true;
          setTimeout(() => {
            this.IsSecondClick = false;
          }, 1000);
        }
      }
      //else {
      this.charactersFormModal.ruleSetId = _ruleset.ruleSetId;
      //}
    }
  }
  validateImageSize() {
    if ((this.fileToUpload.size / 1024) <= 250) {
      return true;
    }
    return false;
  }
  validateSubmit() {
    if (this.charactersFormModal.ruleSetId == 0 || this.charactersFormModal.ruleSetId == undefined) {
      this.alertService.showMessage("Please select ruleset.", "Ruleset is required for adding a character.", MessageSeverity.error);
    }
    else {
      this.isLoading = true;
      let _msg = this.charactersFormModal.characterId == 0 || this.charactersFormModal.characterId === undefined ? "Creating Character..." : "Updating Character...";
      if (this.charactersFormModal.view === VIEW.DUPLICATE) _msg = "Duplicating Character...";
      this.alertService.startLoadingMessage("", _msg);

      if (this.fileToUpload != null) {
        /*image upload then submit */
        this.fileUpload();
      }
      else if (this.bingImageUrl !== this.charactersFormModal.imageUrl) {
        try {
          var regex = /(?:\.([^.]+))?$/;
          var extension = regex.exec(this.charactersFormModal.imageUrl)[1];
          extension = extension ? extension : 'jpg';
        } catch{ }
        this.fileUploadFromBing(this.charactersFormModal.imageUrl, extension);
      }
      else {
        this.submit();
      }
    }
  }
  submitForm() {
    //if (this.fileToUpload != null) {
    //    if (this.validateImageSize()) {
    //        this.validateSubmit();
    //    }
    //    else {
    //        this.alertService.showDialog(this.imageErrorMessage, DialogType.confirm, ((value) => {
    //            this.validateSubmit();
    //        }), null, 'Yes', 'No');
    //    }
    //}
    //else {
    //    this.validateSubmit();
    //}
    this.validateSubmit();
  }

  private fileUpload() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout(true);
    else {
      this.fileUploadService.fileUploadByUser<any>(user.id, this.fileToUpload)
        .subscribe(
          data => {
            this.charactersFormModal.imageUrl = data.ImageUrl;
            this.charactersFormModal.thumbnailUrl = data.ThumbnailUrl;
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
    //file upload
    this.charactersService.fileUpload(this.fileToUpload)
      .subscribe(
        data => {
          this.charactersFormModal.imageUrl = data.ImageUrl;
          this.charactersFormModal.thumbnailUrl = data.ThumbnailUrl;
          this.submit();
        },
        error => {
          console.log(error);
          this.submit();
        });
  }

  private fileUploadFromBing(file: string, ext: string) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout(true);
    else {
      this.fileUploadService.fileUploadFromURL<any>(user.id, file, ext)
        .subscribe(
          data => {
            this.charactersFormModal.imageUrl = data.ImageUrl;
            this.charactersFormModal.thumbnailUrl = data.ThumbnailUrl;
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

  private submit() {
    if (this.charactersFormModal.view === VIEW.DUPLICATE) {
      this.duplicateCharacters(this.charactersFormModal);
    }
    else {
      if (!this.charactersFormModal.imageUrl) {
        //if (!this.charactersFormModal.imageUrl) {
        this.imageSearchService.getDefaultImage<any>('char')
          .subscribe(data => {
            let model = Object.assign({}, this.charactersFormModal)
            model.imageUrl = data.imageUrl.result
            this.addEditCharacters(model);
          }, error => {
            this.addEditCharacters(this.charactersFormModal);
          },
            () => { });
        //}
      }
      else {
        this.addEditCharacters(this.charactersFormModal);
      }
    }
  }

  private addEditCharacters(modal) {
    modal.layoutHeight = this.layoutHeight;
    modal.layoutWidth = this.layoutWidth;

    let rulesetSelected = this.charactersFormModal.ruleSets.filter(x => x.ruleSetId == modal.ruleSetId);
    //let flag = true;
    if (modal.view == VIEW.ADD) {
      if (rulesetSelected) {
        if (rulesetSelected.length) {
          if (!rulesetSelected[0].isAlreadyPurchased && rulesetSelected[0].price) {
            this.alertService.stopLoadingMessage();
            this.isLoading = false;
            this.buyRuleset(rulesetSelected[0], true, modal);
          }
          //else if (rulesetSelected[0].isAlreadyPurchased) {
          //  this.SubmitAddEditCharacters(modal);
          //}
          else {
            this.SubmitAddEditCharacters(modal);
          }
        }
      }
    }
    else {
      this.SubmitAddEditCharacters(modal);
    }

    //if (flag) {
    //  this.SubmitAddEditCharacters(modal);
    //}

  }
  private SubmitAddEditCharacters(modal) {
    this.isLoading = true;
    this.charactersService.createCharacter(modal)
      .subscribe(
      (data:any) => {
          //console.log('Indata', data);
          this.isLoading = false;
          this.alertService.stopLoadingMessage();

          let message = modal.characterId == 0 || modal.characterId === undefined ? "Character has been added successfully." : "Character has been updated successfully.";
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.commonService.UpdateCounts(); /*update charaters count*/
          this.close();
          this.sharedService.updateCharacterList(true);
          this.sharedService.updateCharactersCount(true);
        this.appService.updateCharacterList(true);
        if ((modal.characterId == 0 || modal.characterId === undefined) && data>0) {
            this.localStorage.localStorageSetItem(DBkeys.IsCharacterOpenedFromCampaign, false);
            this.router.navigate(['/character/dashboard', data]);       
        }
          //this.router.navigateByUrl('/rulesets', { skipLocationChange: true }).then(() => this.router.navigate(['/ruleset']));
          // window.location.reload();
        },
        error => {

          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = modal.characterId == 0 || modal.characterId === undefined ? "Unable to Add " : "Unable to Update ";
          let Errors = Utilities.ErrorDetail(_message, error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        },
      );
  }

  private duplicateCharacters(modal) {
    this.isLoading = true;
    this.charactersService.duplicateCharacters(modal)
      .subscribe(
      (data: any) => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("Character has been duplicated successfully.", "", MessageSeverity.success);
          this.bsModalRef.hide();
          this.sharedService.updateCharacterList(true);
          if (data>0) {
            this.localStorage.localStorageSetItem(DBkeys.IsCharacterOpenedFromCampaign, false);
            this.router.navigate(['/character/dashboard', data]);
          }
          // window.location.reload();
        },
        error => {
          let _message = "Unable to Duplicate ";
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail(_message, error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        });
  }
  showButtons() {
    this.showWebButtons = true;
  }

  hideButtons() {
    this.showWebButtons = false;
  }

  close() {
    this.bsModalRef.hide();
    this.destroyModalOnInit();
  }

  manageRuleSets() {
    this.bsModalRef.hide();
    this.router.navigate(['/rulesets']);
  }

  readTempUrl(event: any) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.onload = (event: any) => {
        this.charactersFormModal.imageUrl = event.target.result;
      }

      reader.readAsDataURL(event.target.files[0]);
      this.imageChangedEvent = event;
    }
  }

  onScroll() {
    ++this.page;
    this.offset = (this.page - 1) * this.pageSize;
    this.isLoading = false;
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();


    //this.rulesetService.getAllRuleSetByUserId(user.id, this.page, this.pageSize)
    this.rulesetService.getRuleSetToCreateCharacterByUserId(user.id, this.page, this.pageSize)
      .subscribe(data => {
        let results = data;
        if (results) {
          if (results.length) {
            results.map((Rset) => {
              this.charactersFormModal.ruleSets.push(Rset);
            })
          }
        }
        //this.charactersFormModal.ruleSets = data;
        //this.charactersFormModal.hasRuleset = data == undefined ? false : data.length == 0 ? false : true;
        this.isLoading = false;
      }, error => {
        this.isLoading = false;
        this.alertService.stopLoadingMessage();
        let Errors = Utilities.ErrorDetail("Error", error);
        if (Errors.sessionExpire) this.authService.logout(true);
      }, () => { });
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
    this.bsModalRef.content.title = 'char';
    this.bsModalRef.content.image = img;
    this.bsModalRef.content.view = view;
    this.bsModalRef.content.errorImage = '../assets/images/DefaultImages/Character.jpg';
    //this.bsModalRef.content.imageChangedEvent = this.imageChangedEvent; //base 64 || URL
    this.bsModalRef.content.event.subscribe(data => {

      this.charactersFormModal.imageUrl = data.base64;
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
  buyRuleset(ruleSet, IsCreating = false, modal = null) {
    let paymentInfo: marketplaceListModel = new marketplaceListModel(-1, -1, ruleSet.ruleSetName, ruleSet.ruleSetName, '', ruleSet.price, 1, '', false);// = this.marketplacelist.filter(x => x.marketPlaceId == MarketPlaceItemsType.PLAYER_SLOT)[0];
    this.bsModalRef = this.modalService.show(PaymentComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'payment';
    this.bsModalRef.content.paymentInfo = paymentInfo;
    //this.bsModalRef.content.RulesetToPurchase = ruleSet;
    this.bsModalRef.content.event.subscribe(data => {
      let paymentDoneForItem: marketplaceListModel = data.item;
      ruleSet.isAlreadyPurchased = true;
      if (IsCreating && modal) {
        this.alertService.startLoadingMessage("", "Creating Character...");
        this.SubmitAddEditCharacters(modal);
      }
      this.rulesetService.updateUserPurchasedRuleset<any>(ruleSet)
        .subscribe(
          data => {
            this.charactersFormModal.ruleSetId = ruleSet.ruleSetId;
            //this.addRuleSetFinal(ruleSet.ruleSetId);
          },
          error => {
            // this.isLoading = false;
            this.alertService.stopLoadingMessage();
            let _message = "Unable to Add ";
            let Errors = Utilities.ErrorDetail(_message, error);
            if (Errors.sessionExpire) {
              //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
              this.authService.logout(true);
            }
            else
              this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
          });

    });
  }
}
