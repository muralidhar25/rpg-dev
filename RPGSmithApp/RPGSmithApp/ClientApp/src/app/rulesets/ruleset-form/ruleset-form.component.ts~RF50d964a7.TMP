import { Component, OnInit, OnDestroy, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule, NgForm } from '@angular/forms';
import { Router, NavigationExtras } from "@angular/router";
import 'rxjs/add/operator/finally';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { ImageError, VIEW, RecordType } from '../../core/models/enums';
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
import { RulesetRecordCount } from '../../core/models/view-models/ruleset-record-count.model';
import { CampaignUploadComponent } from '../campaign-upload/campaign-upload.component';
import * as XLSX from 'xlsx';

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
    return Utilities.optionsFloala(160, placeholder, initOnClick, false, false);
  }
  RcustomDices: CustomDice[] = [];
  RdefaultDices: DefaultDice[] = [];
  RdiceTray: DiceTray[] = [];
  IsGm: boolean = false;
  viewBtn = VIEW;

  ruleSetId: number;
  rulesetRecordCount: any = new RulesetRecordCount();

  ruleset: any = new Ruleset();
  recordType = RecordType;
  count: any = 10;
  RuleSet: any;

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
      this.RuleSet = this.bsModalRef.content.RuleSet;

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
          autoDeleteItems: _rulesetModel.autoDeleteItems,

          currencyName: _rulesetModel.currencyName,
          currencyWeight: _rulesetModel.currencyWeight ? _rulesetModel.currencyWeight : undefined,
          currencyBaseUnit: _rulesetModel.currencyBaseUnit,
          currencyTypeVM: Object.assign([], _rulesetModel.currencyTypeVM),
          //_rulesetModel.currencyTypeVM,

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
          isBuffAndEffectEnabled: true,
          autoDeleteItems: false,
          currencyTypeVM: [],
          currencyWeight: undefined,
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

    try {
      modal.currencyWeight = modal.currencyWeight ? modal.currencyWeight : 0;
      modal.currencyTypeVM.forEach((currency, index) => {
        currency.sortOrder = index;
        currency.weightLabel = modal.weightLabel;
      });
    } catch (err) { }

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

    try {
      modal.currencyWeight = modal.currencyWeight ? modal.currencyWeight : 0;
      modal.currencyTypeVM.forEach((currency, index) => {
        currency.sortOrder = index;
        currency.weightLabel = modal.weightLabel;
      });
    } catch (err) { }


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

  close(ruleset: Ruleset, form: NgForm) {
    this.bsModalRef.hide();
    this.destroyModalOnInit();
    if (ruleset.view == VIEW.MANAGE) {
      this.manageRuleset(ruleset)
    }
    //form.resetForm();
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

  addCurrency(currencyToAdd) {
    let currencyLimit = this.rulesetFormModal.currencyTypeVM ? this.rulesetFormModal.currencyTypeVM.length : 0;
    if (currencyLimit < 9) {
      let newCurrecyToAdd = currencyToAdd == undefined ? [] : currencyToAdd;
      newCurrecyToAdd.push({ name: '', weightValue: '', baseUnit: '' });
      this.rulesetFormModal.currencyTypeVM = newCurrecyToAdd;
    }
  }

  removeCurrency(currency: any): void {
    this.rulesetFormModal.currencyTypeVM
      .splice(this.rulesetFormModal.currencyTypeVM.indexOf(currency), 1);
  }

  setAutoDeleteItems(checked: boolean) {
    this.rulesetFormModal.autoDeleteItems = checked;
  }

  Export(ruleSetId, rType: RecordType) {
    let parentRuleSetId = this.RuleSet && this.RuleSet.parentRuleSetId ? this.RuleSet.parentRuleSetId : 0;
    let msg = "Exporting Records...";
    this.alertService.startLoadingMessage("", msg);

    this.rulesetService.ExportRecord({ ruleSetId: ruleSetId, recordType: rType, parentRuleSetId: parentRuleSetId })
      .subscribe((data: any) => {
        let monsterTemplates = [];
        //let monsterAbilities = [];
        //let monsterSpells = [];
        //let monsterBE = [];
        //let monsterItems = [];
        //let monsterCommands = [];
        //let associateMonsters = [];
        //let monsterCurrency = [];
        if (data.result) {
          data.result.map(x => {
            monsterTemplates.push({
              //monsterTemplateId: x.monsterTemplateId,
              Name: x.name,
              ImageUrl: x.imageUrl,
              Health: x.health,
              ArmorClass: x.armorClass,
              ChallangeRating: x.challangeRating,
              XPValue: x.xpValue,
              Initiative: x.initiativeCommand,
              Tags: x.metatags,
              Description: x.description,
              Stats: x.stats,
              GMOnly: x.gmOnly,
              Command: x.command,
              CommandName: x.commandName,
              Command1: x.monsterTemplateCommands.length > 0 ? x.monsterTemplateCommands[0].command : '',
              CommandName1: x.monsterTemplateCommands.length > 0 ? x.monsterTemplateCommands[0].name : '',
              Command2: x.monsterTemplateCommands.length > 1 ? x.monsterTemplateCommands[1].command : '',
              CommandName2: x.monsterTemplateCommands.length > 1 ? x.monsterTemplateCommands[1].name : '',
              Command3: x.monsterTemplateCommands.length > 2 ? x.monsterTemplateCommands[2].command : '',
              CommandName3: x.monsterTemplateCommands.length > 2 ? x.monsterTemplateCommands[2].name : '',
              Command4: x.monsterTemplateCommands.length > 3 ? x.monsterTemplateCommands[3].command : '',
              CommandName4: x.monsterTemplateCommands.length > 3 ? x.monsterTemplateCommands[3].name : '',
              Command5: x.monsterTemplateCommands.length > 4 ? x.monsterTemplateCommands[4].command : '',
              CommandName5: x.monsterTemplateCommands.length > 4 ? x.monsterTemplateCommands[4].name : '',
              Command6: x.monsterTemplateCommands.length > 5 ? x.monsterTemplateCommands[5].command : '',
              CommandName6: x.monsterTemplateCommands.length > 5 ? x.monsterTemplateCommands[5].name : '',
              Command7: x.monsterTemplateCommands.length > 6 ? x.monsterTemplateCommands[6].command : '',
              CommandName7: x.monsterTemplateCommands.length > 6 ? x.monsterTemplateCommands[6].name : '',
              Command8: x.monsterTemplateCommands.length > 7 ? x.monsterTemplateCommands[7].command : '',
              CommandName8: x.monsterTemplateCommands.length > 7 ? x.monsterTemplateCommands[7].name : '',
              Command9: x.monsterTemplateCommands.length > 8 ? x.monsterTemplateCommands[8].command : '',
              CommandName9: x.monsterTemplateCommands.length > 8 ? x.monsterTemplateCommands[8].name : '',
              Command10: x.monsterTemplateCommands.length > 9 ? x.monsterTemplateCommands[9].command : '',
              CommandName10: x.monsterTemplateCommands.length > 9 ? x.monsterTemplateCommands[9].name : ''
            });
            //if (x.monsterTemplateAbilities && x.monsterTemplateAbilities.length) {
            //  x.monsterTemplateAbilities.map(ability => {
            //    monsterAbilities.push({ monsterTemplateId: ability.monsterTemplateId, abilityId: ability.abilityId });
            //  });
            //}
            //if (x.monsterTemplateSpells && x.monsterTemplateSpells.length) {
            //  x.monsterTemplateSpells.map(spell => {
            //    monsterSpells.push({ monsterTemplateId: spell.monsterTemplateId, spellId: spell.spellId });
            //  });
            //}
            //if (x.monsterTemplateBuffAndEffects && x.monsterTemplateBuffAndEffects.length) {
            //  x.monsterTemplateBuffAndEffects.map(buffEffect => {
            //    monsterBE.push({ monsterTemplateId: buffEffect.monsterTemplateId, buffAndEffectId: buffEffect.buffAndEffectId });
            //  });
            //}
            //if (x.monsterTemplateItemMasters && x.monsterTemplateItemMasters.length) {
            //  x.monsterTemplateItemMasters.map(item => {
            //    monsterItems.push({ monsterTemplateId: item.monsterTemplateId, itemMasterId: item.itemMasterId, qty: item.qty });
            //  });
            //}
            //if (x.monsterTemplateCommands && x.monsterTemplateCommands.length) {
            //  debugger
            //  x.monsterTemplateCommands.map(command => {
            //    monsterTemplates.push({ drcommandname: command.name, decommand: command.command });
            // });
            //}
            //if (x.monsterTemplateMonsters && x.monsterTemplateMonsters.length) {
            //  x.monsterTemplateMonsters.map(monster => {
            //    associateMonsters.push({ monsterTemplateId: monster.monsterTemplateId, associateMonsterTemplateId: monster.associateMonsterTemplateId });
            //  });
            //}
            //if (x.monsterTemplateCurrency && x.monsterTemplateCurrency.length) {
            //  x.monsterTemplateCurrency.map(currency => {
            //    monsterCurrency.push({
            //      monsterTemplateId: currency.monsterTemplateId, monsterTemplateCurrencyId: currency.monsterTemplateCurrencyId, amount: currency.amount,
            //      command: currency.command, name: currency.name, baseUnit: currency.baseUnit, weightValue: currency.weightValue,
            //      sortOrder: currency.sortOrder, currencyTypeId: currency.currencyTypeId
            //    });
            //  });
            //}
          });
        }

        const workBook = XLSX.utils.book_new(); // create a new blank book
        const MonsterTemplates = XLSX.utils.json_to_sheet(monsterTemplates);
        //const Abilities = XLSX.utils.json_to_sheet(monsterAbilities);
        //const Spells = XLSX.utils.json_to_sheet(monsterSpells);
        //const BuffEffects = XLSX.utils.json_to_sheet(monsterBE);
        //const Items = XLSX.utils.json_to_sheet(monsterItems);
        //const Commands = XLSX.utils.json_to_sheet(monsterCommands);
        //const AssociateMonsters = XLSX.utils.json_to_sheet(associateMonsters);
        //const Currency = XLSX.utils.json_to_sheet(monsterCurrency);

        XLSX.utils.book_append_sheet(workBook, MonsterTemplates, 'MonsterTemplates'); // add the worksheet to the book
        //XLSX.utils.book_append_sheet(workBook, Abilities, 'Abilities');
        //XLSX.utils.book_append_sheet(workBook, Spells, 'Spells');
        //XLSX.utils.book_append_sheet(workBook, BuffEffects, 'BuffEffects');
        //XLSX.utils.book_append_sheet(workBook, Items, 'Items');
        //XLSX.utils.book_append_sheet(workBook, Commands, 'Commands');
        //XLSX.utils.book_append_sheet(workBook, AssociateMonsters, 'AssociateMonsters');
        //XLSX.utils.book_append_sheet(workBook, Currency, 'Currency');
        XLSX.writeFile(workBook, 'MonsterTemplates.xlsx'); // initiate a file download in browser
        ////this.excelService.exportAsExcelFile(data, 'Export Monster');
        //this.downloadFile(_data)
        ////this.exportToCsv(data)
        this.alertService.stopLoadingMessage();
        let message = "Exported Sucessfully"
        this.alertService.showMessage(message, "", MessageSeverity.success);
      }, error => {
        this.alertService.stopLoadingMessage();
      }, () => { });
  }

  //downloadFile(data, filename = 'Monsters') {
  //  let csvData = this.ConvertToCSV(data, ['monsterId', 'monsterTemplateId', 'ruleSetId', 'name', 'imageUrl', 'metatags', 'isDeleted', 'healthCurrent', 'armorClass', 'xpValue', 'challangeRating', 'addToCombatTracker', 'command', 'commandName', 'description', 'stats', 'parentMonsterId', 'initiativeCommand', 'isRandomizationEngine', 'characterId', 'gmOnly', 'parentMonster', 'ruleSet', 'character', 'monsterTemplate', 'monsterAbilitys', , 'monsterSpells', , 'monsterBuffAndEffects', 'monsterMonsters', 'itemMasterMonsterItems']);
  //  //console.log(csvData)
  //  let utcDate = new Date().toString()
  //  try {
  //    utcDate = new Date().toJSON();
  //  } catch (err) { }
  //  filename = filename + '-' + utcDate + '.csv';
  //  data = data ? data : 'No Result Found.';

  //  if (navigator.msSaveBlob) {
  //    let blob = new Blob([data], {
  //      "type": "text/csv;charset=utf8;"
  //    });
  //    navigator.msSaveBlob(blob, filename);
  //  }
  //  else {
  //    let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
  //    let $link = document.createElement("a");
  //    let url = URL.createObjectURL(blob);
  //    $link.setAttribute("target", "_blank");
  //    $link.setAttribute("href", url);
  //    $link.setAttribute("download", filename);
  //    $link.style.visibility = "hidden";
  //    document.body.appendChild($link);
  //    $link.click();
  //    document.body.removeChild($link);
  //  }
  //}

  csvFile;
  csvName = 'Choose File';
  csvMonsterData = [];
  Import() {
    this.bsModalRef = this.modalService.show(CampaignUploadComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "File Upload";
    this.bsModalRef.content.RecordType = RecordType.MONSTERS;
    this.bsModalRef.content.RulesetId = this.rulesetFormModal.ruleSetId;
    this.bsModalRef.content.Monstercount = this.rulesetRecordCount.monsterTemplateCount;
    this.bsModalRef.content.event.subscribe(result => {
      if (result) {
        this.bsModalRef.hide();
        this.appService.updateRulesetDetails(true);
      }
    });

  }

  async handleFileInput(file, _type) {
    if (this.checkfile(file[0], _type)) {
      if (_type == 'csv') {
        this.csvFile = file;
        this.csvName = file[0].name
      }

      let reader = new FileReader();
      reader.onload = (e) => {
        try {
          let _resultData = e.target["result"];
          let _result = this.csvJSON(_resultData)
          this.csvMonsterData = _result;
        } catch (err) {
          let message = "Invalid JSON file selected.=Error";
          this.alertService.showMessage(message, "", MessageSeverity.error);
        }
      }
      reader.readAsText(file[0], "UTF-8");
      reader.onerror = function (error) {
        console.log('Error: ', error);
      };
    }
  }
  csvJSON(csvText) {
    let lines = [];
    const linesArray = csvText.split('\n');
    linesArray.forEach((e: any) => {
      const row = e.replace(/[\s]+[,]+|[,]+[\s]+/g, ',').trim();
      lines.push(row);
    });
    lines.splice(lines.length - 1, 1);
    let result = [];
    const headers = lines[0].split(",");

    for (let i = 1; i < lines.length; i++) {
      const obj = {};
      const currentline = lines[i].split(",");
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j] == "null" || currentline[j] == "NULL" ? undefined : currentline[j];
      }
      result.push(obj);
    }
    return result;
  }

  // For Reading CSV File
  readCSV(event) {
    const reader = new FileReader();
    reader.readAsText(event.files[0]);
    reader.onload = () => {
      const text = reader.result;
      const csvToJson = this.csvJSON(text);
      console.log(csvToJson);
    };
  }

  //async handleFileInput(event) {
  //    let _selectedFile = event.target.files[0];
  //    if (this.checkfile(_selectedFile)) {
  //        this.fileName = _selectedFile.name;
  //        let reader = new FileReader();
  //        //reader.readAsDataURL(_selectedFile);
  //        reader.onload = (e) => {
  //            try {
  //                // this.fileToUpload = this.stringToJson(reader.result)
  //                let _result = JSON.parse(reader.result.toString());
  //                _result.dataFlowJson = JSON.stringify(_result.dataFlowJson);
  //                _result.exampleData = JSON.stringify(_result.exampleData);
  //                this.fileToUpload = _result;
  //            } catch (err) {
  //                alert('Invalid JSON file selected.=Error');
  //                this.clear();
  //            }
  //        }
  //        reader.readAsText(_selectedFile, "UTF-8");
  //        reader.onerror = function (error) {
  //            console.log('Error: ', error);
  //        };
  //    }
  //}

  checkfile(sender, _type): boolean {
    try {
      var validExts = _type == 'csv' ? new Array(".csv") : new Array(".xlsx", ".xls", ".csv");
      var fileExt = sender.name;
      fileExt = fileExt.substring(fileExt.lastIndexOf('.'));
      if (validExts.indexOf(fileExt) < 0) {
        let message = "Invalid file selected, valid files are of " + validExts.toString() + " types.";
        this.alertService.showMessage(message, "", MessageSeverity.error);
        //this.toastr.error("Invalid file selected, please select valid file eg. " + validExts.toString() + "", 'Validation Error!');
        return false;
      }
      else return true;
    }
    catch (err) {
      return false;
    }
  }

  ConvertToCSV(objArray, headerList) {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = '';
    for (let index in headerList) {
      row += headerList[index] + ',';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';
    for (let i = 0; i < array.length; i++) {
      let line = '';//(i + 1) + '';
      for (let index in headerList) {
        let head = headerList[index];
        line += headerList.length == (index + 1) ? array[i][head] : array[i][head] + ',';
      }
      str += line + '\r\n';
    }
    return str;
  }



}
