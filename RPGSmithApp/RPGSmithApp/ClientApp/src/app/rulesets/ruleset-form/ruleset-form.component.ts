import { Component, OnInit, OnDestroy, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, NavigationExtras } from "@angular/router";
import 'rxjs/add/operator/finally';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { ImageError, VIEW } from '../../core/models/enums';
import { Utilities } from '../../core/common/utilities';
import { CustomDice, DefaultDice, DiceTray } from '../../core/models/view-models/custome-dice.model';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { AuthService } from '../../core/auth/auth.service';
import { ConfigurationService } from '../../core/common/configuration.service';
import { RulesetService } from '../../core/services/ruleset.service';
import { FileUploadService } from '../../core/common/file-upload.service';
import { SharedService } from '../../core/services/shared.service';
import { CommonService } from '../../core/services/shared/common.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { ImageSearchService } from '../../core/services/shared/image-search.service';
import { User } from '../../core/models/user.model';
import { DBkeys } from '../../core/common/db-keys';
import { RulesetManageComponent } from './ruleset-manage.component';
import { DiceTrayComponent } from '../../shared/dice-tray/dice-tray.component';
import { CustomDiceComponent } from '../../shared/custom-dice/custom-dice.component';
import { DiceComponent } from '../../shared/dice/dice/dice.component';
import { ImageSelectorComponent } from '../../shared/image-interface/image-selector/image-selector.component';
import { ShareRulesetComponent } from '../ruleset-helper/share-ruleset/share-ruleset.component';
import { AppService1 } from '../../app.service';
import { PlatformLocation } from '@angular/common';

@Component({
    selector: 'ruleset-form',
    templateUrl: './ruleset-form.component.html',
    styleUrls: ['./ruleset-form.component.scss']
})
export class RulesetFormComponent implements OnInit {

    rulesetModel = new Ruleset();

    @Input() _ruleset = Ruleset;
    @Output() add: EventEmitter<Ruleset> = new EventEmitter<Ruleset>();
    @Output() update: EventEmitter<Ruleset> = new EventEmitter<Ruleset>();

    rulesetForm: FormGroup;
    isLoading = false;
    showWebButtons: boolean = false;
    fileToUpload: File = null;
    rulesetFormModal: any = new Ruleset();
    uploadFromBing: boolean = false;
    bingImageUrl: string;
    bingImageExt: string;
    imageChangedEvent: any = '';
    croppedImage: any = '';
    imageErrorMessage: string = ImageError.MESSAGE;
    title: string
    button: string
    IsCopiedFromCoreRuleset: boolean = false
    options(placeholder?: string, initOnClick?: boolean): Object {
        return Utilities.optionsFloala(160, placeholder, initOnClick);
    }
    RcustomDices: CustomDice[] = [];
    RdefaultDices: DefaultDice[] = [];
  RdiceTray: DiceTray[] = [];
  IsGm: boolean = false;
    constructor(private router: Router, private alertService: AlertService,
        private authService: AuthService, private configurations: ConfigurationService,
        private rulesetService: RulesetService, private bsModalRef: BsModalRef,
        private modalService: BsModalService, private fileUploadService: FileUploadService,
        private sharedService: SharedService, private commonService: CommonService,
        private localStorage: LocalStoreManager, private imageSearchService: ImageSearchService,
      private modalService1: BsModalService, public appService: AppService1,
      private location: PlatformLocation) {
      location.onPopState(() => this.modalService.hide(1));
        this.sharedService.getCommandData().subscribe(diceCommand => {
            if (diceCommand.parentIndex === -1) {
                this.rulesetFormModal.defaultDice = diceCommand.command;
            } else {
                if (this.rulesetFormModal.rulesetCommandVM.length > 0) {
                    this.rulesetFormModal.rulesetCommandVM.forEach(item => {
                        var index = this.rulesetFormModal.rulesetCommandVM.indexOf(item);
                        if (index === diceCommand.parentIndex) {
                            this.rulesetFormModal.rulesetCommandVM[index].defaultDice = diceCommand.command;
                        }
                    });
                }
            }
        });
        this.sharedService.shouldUpdateCustomeDice().subscribe(data => {
            
            if (data.isDiceTray) {
                this.RdiceTray = [];
                this.RdiceTray = data.diceTray;
            } else {
                this.RcustomDices = [];
                this.RcustomDices = data;
            }
        });
    }

    ngOnInit() {
        setTimeout(() => {
          let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
          if (user) {
            if (user.isGm) {
              this.IsGm = true;
            }
          }
            this.title = this.bsModalRef.content.title;
            let modalContentButton = this.button = this.bsModalRef.content.button;
            let _rulesetModel = this.bsModalRef.content.rulesetModel;
            
            this.RcustomDices = Object.assign([], _rulesetModel.customDices);
            this.RdefaultDices = Object.assign([], _rulesetModel.defaultDices);
            this.RdefaultDices.map((d) => {
                
            })
            this.RdiceTray = Object.assign([], _rulesetModel.diceTray);
                
            if (modalContentButton === 'IMPORT') {
                if (_rulesetModel.isAdmin) {
                    this.IsCopiedFromCoreRuleset = false;
                }
                else {
                    this.IsCopiedFromCoreRuleset = true;
                }
            }
            else {
                this.IsCopiedFromCoreRuleset = _rulesetModel.shareCode == null ? true : false;
            }
            if (modalContentButton === 'DUPLICATE' || modalContentButton === 'UPDATE'
              || modalContentButton === 'IMPORT') {
                this.rulesetFormModal = {
                    ruleSetId: _rulesetModel.ruleSetId,
                    ruleSetName: (modalContentButton === 'UPDATE' || modalContentButton === 'IMPORT') ? _rulesetModel.ruleSetName : '',
                    ruleSetDesc: _rulesetModel.ruleSetDesc,
                    defaultDice: _rulesetModel.defaultDice,
                    currencyLabel: _rulesetModel.currencyLabel,
                    weightLabel: _rulesetModel.weightLabel,
                    distanceLabel: _rulesetModel.distanceLabel,
                    volumeLabel: _rulesetModel.volumeLabel,
                    imageUrl: _rulesetModel.imageUrl,
                    thumbnailUrl: _rulesetModel.thumbnailUrl,
                    isItemEnabled: _rulesetModel.isItemEnabled,
                    isSpellEnabled: _rulesetModel.isSpellEnabled,
                  isBuffAndEffectEnabled: _rulesetModel.isBuffAndEffectEnabled,
                    isAbilityEnabled: _rulesetModel.isAbilityEnabled,
                    isAllowSharing: _rulesetModel.isAllowSharing,
                    shareCode: _rulesetModel.shareCode,
                    //isCoreContent: _rulesetModel.isCoreContent,
                    //parentRuleSetId: _rulesetModel.parentRuleSetId,
                    view: modalContentButton === 'UPDATE' ? VIEW.EDIT
                        : (modalContentButton === 'DUPLICATE' ? VIEW.DUPLICATE
                            : (modalContentButton === 'IMPORT' ? VIEW.IMPORT : VIEW.ADD))
                }
            }
            else {
                this.rulesetFormModal = {
                    ruleSetId: 0,
                    view: VIEW.ADD,
                    isItemEnabled: true,
                    isSpellEnabled: true,
                  isAbilityEnabled: true,
                  isBuffAndEffectEnabled:true,
                  imageUrl: 'https://rpgsmithsa.blob.core.windows.net/stock-defimg-rulesets/RS.png'
                };
            }
            this.bingImageUrl = this.rulesetFormModal.imageUrl;
        }, 0);
    }

    copyShareCode(shareCode: string) {
        Utilities.copyToClipboard(shareCode);
    }

    fileInput(files: FileList) {
        this.fileToUpload = files.item(0);
        this.showWebButtons = false;
    }

    validateImageSize() {
        if ((this.fileToUpload.size / 1024) <= 250) {
            return true;
        }
        return false;
    }

    validateSubmit() {
        this.isLoading = true;
        let _msg = this.rulesetFormModal.ruleSetId == 0 || this.rulesetFormModal.ruleSetId === undefined ? "Creating Rule Set..." : "Updating Rule Set...";
        if (this.rulesetFormModal.view === VIEW.DUPLICATE) _msg = "Duplicating Rule Set...";
        if (this.rulesetFormModal.view === VIEW.IMPORT) _msg = "Importing Rule Set...";
        this.alertService.startLoadingMessage("", _msg);

        if (this.fileToUpload != null) {
            this.fileUpload();
        }
        else if (this.bingImageUrl !== this.rulesetFormModal.imageUrl) {
            try {
                var regex = /(?:\.([^.]+))?$/;
                var extension = regex.exec(this.rulesetFormModal.imageUrl)[1];
                extension = extension ? extension : 'jpg';
            } catch{ }
            this.fileUploadFromBing(this.rulesetFormModal.imageUrl, extension);
        }
        else {
            this.submit();
        }
    }

    submitForm() {
        this.validateSubmit();
    }

    private fileUploadFromBing(file: string, ext: string) {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout(true);
        else {
            this.fileUploadService.fileUploadFromURL<any>(user.id, file, ext)
                .subscribe(
                    data => {
                        this.rulesetFormModal.imageUrl = data.ImageUrl;
                        this.rulesetFormModal.thumbnailUrl = data.ImageUrl;
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

    private fileUpload() {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout(true);
        else {
            this.fileUploadService.fileUploadByUser<any>(user.id, this.fileToUpload)
                .subscribe(
                    data => {
                        this.rulesetFormModal.imageUrl = data.ImageUrl;
                        this.rulesetFormModal.thumbnailUrl = data.ImageUrl;
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
        this.rulesetService.fileUpload(this.fileToUpload)
            .subscribe(
                data => {
                    this.rulesetFormModal.imageUrl = data.ImageUrl;
                    this.rulesetFormModal.thumbnailUrl = data.ThumbnailUrl;
                    this.submit();
                },
                error => {
                    console.log(error);
                    this.submit();
                });
    }

    private submit() {

        if (this.rulesetFormModal.view === VIEW.DUPLICATE || this.rulesetFormModal.view === VIEW.IMPORT) {
            this.duplicateRuleset(this.rulesetFormModal);
        }
        else {
            if (!this.rulesetFormModal.imageUrl) {
                //if (!this.charactersFormModal.imageUrl) {
                this.imageSearchService.getDefaultImage<any>('ruleset')
                    .subscribe(data => {
                        let model = Object.assign({}, this.rulesetFormModal)
                        model.imageUrl = data.imageUrl.result
                        this.addEditRuleset(model);
                    }, error => {
                        this.addEditRuleset(this.rulesetFormModal);
                    },
                        () => { });
                //}
            }
            else {
                this.addEditRuleset(this.rulesetFormModal);
            }

        }
    }
  public event: EventEmitter<any> = new EventEmitter();
    private addEditRuleset(modal) {
      let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
      if (user == null) {
        this.authService.logout(true);
      }
         
        this.isLoading = true;
        //if (modal.ruleSetId == 0) {
        modal.customDices = this.RcustomDices;
        modal.diceTray = this.RdiceTray;
        //}
        this.rulesetService.createRuleset(modal)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.bsModalRef.hide();
                    this.destroyModalOnInit();
                    this.alertService.stopLoadingMessage();
                    let message = modal.ruleSetId == 0 || modal.ruleSetId === undefined
                        ? "Rule Set has been added successfully."
                        : "Rule Set has been updated successfully.";
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                  this.commonService.UpdateCounts(); /*update charaters count*/
                  this.appService.updateRulesetDetails(true);
                  if (user == null) {
                    this.authService.logout();
                  }
                  else {
                    if (user.isGm) {
                      this.router.navigate(['/ruleset/campaign-details/' + data.ruleSetId]);
                    } else {
                      this.router.navigate(['/ruleset/ruleset-details/' + data.ruleSetId]);
                    }
                  }
                 
                 // this.sharedService.updateRulesetList(data);
                 // this.event.emit(data);
                    //setTimeout(() => {
                    //    if ((modal.ruleSetId == 0 || modal.ruleSetId === undefined) && data !== null)
                    //        this.manageRuleset(data);
                    //}, 200);
                    
                },
                error => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();

                    let _message = modal.ruleSetId == 0 || modal.ruleSetId === undefined ? "Unable to Add " : "Unable to Update ";
                    let Errors = Utilities.ErrorDetail(_message, error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

                }
            );
    }

    private duplicateRuleset(modal) {
      let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
      if (user == null) {
        this.authService.logout(true);
      }
        

        this.isLoading = true;
        
        modal.customDices = this.RcustomDices;
        modal.diceTray = this.RdiceTray;
        
        modal.shareCode = undefined; //auto generated
        this.rulesetService.duplicateRuleset(modal)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.bsModalRef.hide();
                    this.destroyModalOnInit();
                    this.alertService.stopLoadingMessage();
                    let msgSuccess = modal.view === VIEW.IMPORT ? "Rule Set has been imported successfully."
                        : "Rule Set has been duplicated successfully.";
                    this.alertService.showMessage(msgSuccess, "", MessageSeverity.success);
                  if (user == null) {
                    this.authService.logout();
                  }
                  else {
                    if (user.isGm) {
                      this.router.navigate(['/ruleset/campaign-details/' + data.ruleSetId]);
                    } else {
                      this.router.navigate(['/ruleset/ruleset-details/' + data.ruleSetId]);
                    }
                  }
                   // this.sharedService.updateRulesetList(data);
                    // this.router.navigateByUrl('/rulesets', { skipLocationChange: true }).then(() => this.router.navigate(['/ruleset']));
                    // window.location.reload();
                    
                },
                error => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let errorSuccess = modal.view === VIEW.IMPORT ? "Unable to Import " : "Unable to Duplicate ";
                    let Errors = Utilities.ErrorDetail(errorSuccess, error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

                });
    }

    manageRuleset(ruleset: Ruleset) {
        this.bsModalRef = this.modalService.show(RulesetManageComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'Rule Set Properties';
        ruleset.view = VIEW.EDIT;
        this.bsModalRef.content.ruleset = ruleset;
        this.bsModalRef.content.recordCount = {
            abilityCount: 0,
            characterStatCount: 0,
            itemMasterCount: 0,
            spellCount: 0
        };
    }

    openDiceTray(ruleset: Ruleset) {
        
        //this.bsModalRef = undefined;
        this.bsModalRef = this.modalService.show(DiceTrayComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.ruleset = ruleset;
        this.bsModalRef.content.defaultDices = this.RdefaultDices;
        this.bsModalRef.content.diceTray = this.RdiceTray;
        this.bsModalRef.content.DTcustomDices = this.RcustomDices;
    }

    openCustonDice(ruleset: Ruleset) {
        
        this.bsModalRef = this.modalService.show(CustomDiceComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.ruleset = ruleset;       
        this.bsModalRef.content.customDices = this.RcustomDices;
        this.bsModalRef.content.CDdiceTray = this.RdiceTray;
       
        
    }

    close(ruleset: Ruleset) {
        this.bsModalRef.hide();
        this.destroyModalOnInit();
        if (ruleset.view == VIEW.MANAGE) {
            this.manageRuleset(ruleset)
        }
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
                this.rulesetFormModal.imageUrl = event.target.result;
            }

            reader.readAsDataURL(event.target.files[0]);
            this.imageChangedEvent = event;
        }
    }

    private characterStats(ruleset: Ruleset) {
        this.rulesetService.ruleset = ruleset;
      this.router.navigate(['/ruleset/character-stats', ruleset.ruleSetId]);
    }

    private itemTemplate(ruleset: Ruleset) {
        this.rulesetService.ruleset = ruleset;
        this.router.navigate(['/ruleset/item-master', ruleset.ruleSetId]);
    }

    private spell(ruleset: Ruleset) {
        this.rulesetService.ruleset = ruleset;
        this.router.navigate(['/ruleset/spell', ruleset.ruleSetId]);
    }

    private ability(ruleset: Ruleset) {
        this.rulesetService.ruleset = ruleset;
        this.router.navigate(['/ruleset/ability', ruleset.ruleSetId]);
    }

    openDiceModal(index, command) {
        this.bsModalRef = this.modalService.show(DiceComponent, {
            class: 'modal-primary modal-md dice-screen',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = "Dice";
        this.bsModalRef.content.parentCommand = command;
        this.bsModalRef.content.inputIndex = index;
        this.bsModalRef.content.rulesetId = this.rulesetFormModal.ruleSetId;
    }

    private destroyModalOnInit(): void {
        try {
            this.modalService.hide(1);
          document.body.classList.remove('modal-open');
          this.appService.updateAccountSetting1(false);
            this.sharedService.updateAccountSetting(false);
            //$(".modal-backdrop").remove();
            document.body.getElementsByClassName('modal-backdrop')[0].className = 'modal-backdrop fade in hide';
            setTimeout(function () {
                //
                //document.body.getElementsByClassName('modal-backdrop').forEach((x) => {
                //    x.removeAttribute('class');
                //})
            }, 10);
        } catch (err) { }
    }

    cropImage(img: string, OpenDirectPopup: boolean, view: string) {
        this.bsModalRef = this.modalService.show(ImageSelectorComponent, {
            class: 'modal-primary modal-sm selectPopUpModal',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'ruleset';
        this.bsModalRef.content.image = img;
        this.bsModalRef.content.view = view;
      this.bsModalRef.content.errorImage = 'https://rpgsmithsa.blob.core.windows.net/stock-defimg-rulesets/RS.png';
        //this.bsModalRef.content.imageChangedEvent = this.imageChangedEvent; //base 64 || URL
        this.bsModalRef.content.event.subscribe(data => {
            this.rulesetFormModal.imageUrl = data.base64;
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

    shareRuleset(ruleset: Ruleset) {
        this.bsModalRef = this.modalService.show(ShareRulesetComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.ruleset = ruleset;
    }

}
