import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { ItemMaster } from '../../../core/models/view-models/item-master.model';
import { ImageError, VIEW } from '../../../core/models/enums';
import { Utilities } from '../../../core/common/utilities';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ItemMasterService } from '../../../core/services/item-master.service';
import { SharedService } from '../../../core/services/shared.service';
import { FileUploadService } from '../../../core/common/file-upload.service';
import { ImageSearchService } from '../../../core/services/shared/image-search.service';
import { User } from '../../../core/models/user.model';
import { DBkeys } from '../../../core/common/db-keys';
import { DiceComponent } from '../../../shared/dice/dice/dice.component';
import { ImageSelectorComponent } from '../../../shared/image-interface/image-selector/image-selector.component';
import { PlatformLocation } from '@angular/common';
import { RulesetService } from '../../../core/services/ruleset.service';
import { CommonService } from '../../../core/services/shared/common.service';

@Component({
  selector: 'app-create-item',
  templateUrl: './create-item.component.html',
  styleUrls: ['./create-item.component.scss']
})
export class CreateItemMsterComponent implements OnInit {

  isLoading = false;
  title: string;
  _ruleSetId: number;
  showWebButtons: boolean = false;
  itemMasterFormModal: any = new ItemMaster();
  fileToUpload: File = null;
  numberRegex = "^(?:[0-9]+(?:\.[0-9]{0,8})?)?$";// "^((\\+91-?)|0)?[0-9]{0,2}$"; 
  fromDetail: boolean = false;
  percentReduced: boolean = false;
  weightWithContent: boolean = false;

  abilitiesList = [];
  selectedAbilities = [];
  spellsList = [];
  buffAndEffectsList = [];
  selectedSpells = [];
  selectedBuffAndEffects: any = [];
  metatags = [];
  uploadFromBing: boolean = false;
  bingImageUrl: string;
  bingImageExt: string;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  imageErrorMessage: string = ImageError.MESSAGE
  defaultImageSelected: string = '';
  button: string
  isGM: boolean = false;
  ruleSet: any;
  options(placeholder?: string, initOnClick?: boolean): Object {
    return Utilities.optionsFloala(160, placeholder, initOnClick);
  }

  constructor(
    private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
    private sharedService: SharedService, 
    private itemMasterService: ItemMasterService,
    private fileUploadService: FileUploadService, private imageSearchService: ImageSearchService,
    private location: PlatformLocation, private rulesetService: RulesetService,
    private commonService: CommonService) {
    location.onPopState(() => this.modalService.hide(1));
    this.route.params.subscribe(params => { this._ruleSetId = params['id']; });

    this.sharedService.getCommandData().subscribe(diceCommand => {
      if (diceCommand.parentIndex === -1) {
        this.itemMasterFormModal.command = diceCommand.command;
      } else {
        if (this.itemMasterFormModal.itemMasterCommandVM.length > 0) {
          this.itemMasterFormModal.itemMasterCommandVM.forEach(item => {
            var index = this.itemMasterFormModal.itemMasterCommandVM.indexOf(item);
            if (index === diceCommand.parentIndex) {
              this.itemMasterFormModal.itemMasterCommandVM[index].command = diceCommand.command;
            }
          });
        }
      }
    });
  }

  ngOnInit() {

    setTimeout(() => {
      this.fromDetail = this.bsModalRef.content.fromDetail == undefined ? false : this.bsModalRef.content.fromDetail;
      this.title = this.bsModalRef.content.title;
      let _view = this.button = this.bsModalRef.content.button;
      let _itemTemplateVM = this.bsModalRef.content.itemMasterVM;

      let isEditingWithoutDetail = this.bsModalRef.content.isEditingWithoutDetail ? true : false;

      let ruleSetId: number = this.localStorage.getDataObject(DBkeys.RULESET_ID);
      this.rulesetService.getRulesetById<any>(ruleSetId).subscribe(data => {
        if (data) {
          this.ruleSet = data;
        }
      }, error => { });

      if (isEditingWithoutDetail) {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        this.isLoading = true;
        this.itemMasterService.getItemMasterById<any>(_itemTemplateVM)
          .subscribe(data => {
            if (data)
              //this.RuleSet = data.ruleSet;
              _itemTemplateVM = this.itemMasterService.itemMasterModelData(data, "UPDATE");

            this.itemMasterFormModal = this.itemMasterService.itemMasterModelData(_itemTemplateVM, _view);
            this.itemMasterFormModal.itemMasterCommandVM = this.itemMasterFormModal.itemMasterCommand

            if (this.bsModalRef.content.button == 'UPDATE' || 'DUPLICATE') {
              this._ruleSetId = this.bsModalRef.content.rulesetID ? this.bsModalRef.content.rulesetID : this.itemMasterFormModal.ruleSetId;
            }
            else {
              this._ruleSetId = this.itemMasterFormModal.ruleSetId;
            }
            this.percentReduced = this.itemMasterFormModal.containerWeightModifier == 'Percent of Contents' ? true : false;
            this.weightWithContent = this.itemMasterFormModal.containerWeightModifier == 'Maximum Weight of' ? true : false;
            this.selectedAbilities = this.itemMasterFormModal.itemMasterAbilities.map(x => { return x.abilitiy; });
            this.selectedSpells = this.itemMasterFormModal.itemMasterSpell.map(x => { return x.spell; });

            if (this.itemMasterFormModal.metatags !== '' && this.itemMasterFormModal.metatags !== undefined)
              this.metatags = this.itemMasterFormModal.metatags.split(",");
            this.bingImageUrl = this.itemMasterFormModal.itemImage;

            this.initialize();
          }, error => {
            this.isLoading = false;
            let Errors = Utilities.ErrorDetail("", error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            }
          }, () => { });

      } else {
        this.itemMasterFormModal = this.itemMasterService.itemMasterModelData(_itemTemplateVM, _view);
        this.itemMasterFormModal.itemMasterCommandVM = this.itemMasterFormModal.itemMasterCommand

        if (this.bsModalRef.content.button == 'UPDATE' || 'DUPLICATE') {
          this._ruleSetId = this.bsModalRef.content.rulesetID ? this.bsModalRef.content.rulesetID : this.itemMasterFormModal.ruleSetId;
        }
        else {
          this._ruleSetId = this.itemMasterFormModal.ruleSetId;
        }
        this.percentReduced = this.itemMasterFormModal.containerWeightModifier == 'Percent of Contents' ? true : false;
        this.weightWithContent = this.itemMasterFormModal.containerWeightModifier == 'Maximum Weight of' ? true : false;
        this.selectedAbilities = this.itemMasterFormModal.itemMasterAbilities.map(x => { return x.abilitiy; });
        this.selectedSpells = this.itemMasterFormModal.itemMasterSpell.map(x => { return x.spell; });

        if (this.itemMasterFormModal.metatags !== '' && this.itemMasterFormModal.metatags !== undefined)
          this.metatags = this.itemMasterFormModal.metatags.split(",");
        this.bingImageUrl = this.itemMasterFormModal.itemImage;

        this.initialize();
      }
    }, 0);
  }

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      if (user.isGm) {
        this.isGM = user.isGm;
      }
      this.isLoading = true;
      this.itemMasterService.getAbilitySpellForItemsByRuleset_sp<any[]>(this.itemMasterFormModal.ruleSetId, this.itemMasterFormModal.itemMasterId)
        .subscribe(data => {
          let dataobj: any = data
          this.abilitiesList = dataobj.abilityList;
          this.spellsList = dataobj.spellList;
          this.buffAndEffectsList = dataobj.buffAndEffectsList;

          this.selectedAbilities = dataobj.selectedAbilityList.map(x => { return x; });
          this.selectedSpells = dataobj.selectedSpellList.map(x => { return x; });
          this.selectedBuffAndEffects = dataobj.selectedBuffAndEffects.map(x => { return x; });
          this.itemMasterFormModal.itemMasterCommandVM = dataobj.selectedItemMasterCommand;
          this.isLoading = false;
        }, error => { }, () => { });
      //this.abilityService.getAbilityByRuleset<any[]>(this.itemMasterFormModal.ruleSetId)
      //    .subscribe(data => {
      //        this.abilitiesList = data;
      //    }, error => { }, () => { });
      //this.spellsService.getspellsByRuleset<any[]>(this.itemMasterFormModal.ruleSetId)
      //    .subscribe(data => {
      //        this.spellsList = data;
      //    }, error => { }, () => { });
      if (!this.itemMasterFormModal.itemImage) {
        this.imageSearchService.getDefaultImage<any>('item')
          .subscribe(data => {
            this.defaultImageSelected = data.imageUrl.result
            this.isLoading = false;
          }, error => {
          },
            () => { });
      }
    }
  }

  itemRarity(_rarity: string) {
    this.itemMasterFormModal.rarity = _rarity;
  }

  IsContainer(_isContainer: boolean) {

    this.itemMasterFormModal.isContainer = _isContainer;
    if (!_isContainer) {
      //this.itemMasterFormModal.containerWeightMax = null;
      //this.itemMasterFormModal.containerWeightModifier = null;
      //this.itemMasterFormModal.containerVolumeMax = null;
    }
  }

  removeTag(tagData: any, tag: any, index: number): void {
    tagData.splice(index, 1);
  }

  onSelectWeightReduction(event) {

    if (event.currentTarget.value == 'Percent of Contents') {
      this.percentReduced = true;
      this.weightWithContent = false;
      this.itemMasterFormModal.totalWeightWithContents = 0;
    }
    else if (event.currentTarget.value == 'Maximum Weight of') {
      this.weightWithContent = true;
      this.percentReduced = false;
      this.itemMasterFormModal.percentReduced = 0;
    } else {
      this.weightWithContent = false;
      this.percentReduced = false;
      this.itemMasterFormModal.percentReduced = 0;
      this.itemMasterFormModal.totalWeightWithContents = 0;
    }

    this.itemMasterFormModal.containerWeightModifier = event.currentTarget.value;
  }

  setAssociatedSpell(event, itemMasterId) {
    if (event.currentTarget.value == 'Select Spell') {
      this.itemMasterFormModal.itemMasterSpellVM = [];
    }
    else {
      let _itemMasterSpellVM = [];
      let _spellId: number = event.currentTarget.value;
      _itemMasterSpellVM.push({ itemMasterId: itemMasterId, spellId: +_spellId });
      this.itemMasterFormModal.itemMasterSpellVM = _itemMasterSpellVM;
    }
  }

  setAssociatedAbility(event, itemMasterId) {
    if (event.currentTarget.value == 'Select Ability') {
      this.itemMasterFormModal.itemMasterAbilityVM = [];
    }
    else {
      let _itemMasterAbilityVM = [];
      let _abilityId: number = event.currentTarget.value;
      _itemMasterAbilityVM.push({ itemMasterId: itemMasterId, abilityId: +_abilityId });
      this.itemMasterFormModal.itemMasterAbilityVM = _itemMasterAbilityVM;
    }
  }


  addCommand(itemCommand: any): void {
    let _itemCommand = itemCommand == undefined ? [] : itemCommand;
    _itemCommand.push({ itemMasterCommandId: 0, command: '', name: '' });
    this.itemMasterFormModal.itemMasterCommandVM = _itemCommand;
  }

  removeCommand(command: any): void {
    this.itemMasterFormModal.itemMasterCommandVM
      .splice(this.itemMasterFormModal.itemMasterCommandVM.indexOf(command), 1);
  }

  fileInput(_files: FileList) {
    this.fileToUpload = _files.item(0);
    this.showWebButtons = false;
  }
  validateImageSize() {
    if ((this.fileToUpload.size / 1024) <= 250) {
      return true;
    }
    return false;
  }
  validateSubmit(itemMaster: any) {
    itemMaster.itemMasterAbilityVM = this.selectedAbilities.map(x => {
      return { abilityId: x.abilityId, itemMasterId: itemMaster.itemMasterId };
    });
    itemMaster.itemMasterSpellVM = this.selectedSpells.map(x => {
      return { spellId: x.spellId, itemMasterId: itemMaster.itemMasterId };
    });
    itemMaster.itemMasterBuffAndEffectVM = this.selectedBuffAndEffects.map(x => {
      return { buffAndEffectId: x.buffAndEffectId, itemMasterId: itemMaster.itemMasterId };
    });
    let tagsValue = this.metatags.map(x => {
      if (x.value == undefined) return x;
      else return x.value;
    });
    itemMaster.metatags = tagsValue.join(', ');

    if (itemMaster.ruleSetId == 0 || itemMaster.ruleSetId === undefined)
      itemMaster.ruleSetId = this._ruleSetId;

    if (!itemMaster.isContainer) {
      itemMaster.containerWeightMax = 0;
      itemMaster.containerVolumeMax = 0;
      itemMaster.containerWeightModifier = 'None';
    }
    //if (itemMaster.itemMasterAbilities.length == 0 && itemMaster.itemMasterAbilityVM.length > 0)
    itemMaster.itemMasterAbilities = itemMaster.itemMasterAbilityVM;
    // else if (itemMaster.itemMasterAbilities.length > 0 && itemMaster.itemMasterAbilityVM.length == 0)
    //    itemMaster.itemMasterAbilityVM = itemMaster.itemMasterAbilities;
    //if (itemMaster.itemMasterSpell.length == 0 && itemMaster.itemMasterSpellVM.length > 0)
    itemMaster.itemMasterSpell = itemMaster.itemMasterSpellVM;
    //else if (itemMaster.itemMasterSpell.length > 0 && itemMaster.itemMasterSpellVM.length == 0)
    //   itemMaster.itemMasterSpellVM = itemMaster.itemMasterSpell;

    itemMaster.itemMasterBuffAndEffects = itemMaster.itemMasterBuffAndEffectVM;

    this.isLoading = true;
    let _msg = itemMaster.itemMasterId == 0 || itemMaster.itemMasterId === undefined ? "Creating Item Template.." : "Updating Item Template..";
    if (this.itemMasterFormModal.view === VIEW.DUPLICATE) _msg = "Duplicating Item Template..";
    this.alertService.startLoadingMessage("", _msg);

    if (this.fileToUpload != null) {
      this.fileUpload(itemMaster);
    }
    else if (this.bingImageUrl !== this.itemMasterFormModal.itemImage) {
      try {
        var regex = /(?:\.([^.]+))?$/;
        var extension = regex.exec(this.itemMasterFormModal.itemImage)[1];
        extension = extension ? extension : 'jpg';
      } catch{ }
      this.fileUploadFromBing(this.itemMasterFormModal.itemImage, extension, itemMaster);
    }
    else {
      this.submit(itemMaster);
    }
  }
  submitForm(itemMaster: any) {
    this.validateSubmit(itemMaster);
  }

  private fileUploadFromBing(file: string, ext: string, itemMaster: any) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout(true);
    else {
      this.fileUploadService.fileUploadFromURL<any>(user.id, file, ext)
        .subscribe(
          data => {
            this.itemMasterFormModal.itemImage = data.ImageUrl;
            //this.rulesetFormModal.thumbnailUrl = data.ThumbnailUrl;
            this.submit(itemMaster);
          },
          error => {
            let Errors = Utilities.ErrorDetail('Error', error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            } else this.submit(itemMaster);
          });
    }
  }

  private fileUpload(itemMaster: any) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout(true);
    else {
      this.fileUploadService.fileUploadByUser<any>(user.id, this.fileToUpload)
        .subscribe(
          data => {
            this.itemMasterFormModal.itemImage = data.ImageUrl;
            this.submit(itemMaster);
          },
          error => {
            let Errors = Utilities.ErrorDetail('Error', error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            } else this.submit(itemMaster);
          });
    }
  }

  private fileUploadOLD(itemMaster: any) {
    //file upload
    this.itemMasterService.fileUpload(this.fileToUpload)
      .subscribe(
        data => {
          itemMaster.itemImage = data.ImageUrl;
          this.submit(itemMaster);
        },
        error => {
          this.submit(itemMaster);
        });
  }

  private submit(itemMaster: any) {
    if (this.itemMasterFormModal.view === VIEW.DUPLICATE) {
      this.duplicateItemMaster(itemMaster);
    }
    else {
      if (this.defaultImageSelected && !this.itemMasterFormModal.itemImage) {
        let model = Object.assign({}, itemMaster)
        model.itemImage = this.defaultImageSelected
        this.addEditItemMaster(model);
      } else {
        this.addEditItemMaster(itemMaster);
      }

    }
  }

  addEditItemMaster(modal: any) {
    modal.RuleSetId = this._ruleSetId;
    // modal.userID = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER).id
    this.isLoading = true;
    this.itemMasterService.createItemMaster<any>(modal)
      .subscribe(async (data) => {
        await this.commonService.deleteRecordFromIndexedDB("itemTemplates", 'ItemMaster', 'itemMasterId', modal, false);
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let message = modal.itemMasterId == 0 || modal.itemMasterId === undefined ? "Item Template has been created successfully." : "Item Template has been updated successfully.";
          if (data !== "" && data !== null && data !== undefined && isNaN(parseInt(data))) message = data;
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.close();
          if (this.fromDetail) {
            if (data) {
              let id = data;
              if (!isNaN(parseInt(id))) {
                this.router.navigate(['/ruleset/item-details', id]);
                this.event.emit({ itemMasterId: id });
                //this.sharedService.updateItemMasterDetailList(true);
              }
              else {
                this.sharedService.updateItemMasterDetailList(true);
              }
            }
            else {
              this.sharedService.updateItemMasterDetailList(true);
            }
          }
          else {
            this.event.emit(true);
            this.sharedService.updateItemMasterList(true)
          };
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = modal.itemMasterId == 0 || modal.itemMasterId === undefined ? "Unable to Create " : "Unable to Update ";
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

  duplicateItemMaster(modal: any) {
    modal.RuleSetId = this._ruleSetId;
    this.isLoading = true;
    this.itemMasterService.duplicateItemMaster<any>(modal)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let message = "Item Template has been duplicated successfully.";
          if (data !== "" && data !== null && data !== undefined)
            message = data;
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.close();
          if (this.fromDetail) {
            this.router.navigate(['/ruleset/item-master', this._ruleSetId]);
          }
          else {
            this.sharedService.updateItemMasterList(true)
          };
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = "Unable to Duplicate ";
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

  readTempUrl(event: any) {

    //var type = event.target.files[0].type;
    //var size = event.target.files[0].size;

    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.onload = (event: any) => {
        this.itemMasterFormModal.itemImage = event.target.result;
      }

      reader.readAsDataURL(event.target.files[0]);
      this.imageChangedEvent = event;
    }
  }

  close() {
    this.bsModalRef.hide();
    this.destroyModalOnInit();

  }

  get abilitiesSettings() {
    return {
      primaryKey: "abilityId",
      labelKey: "name",
      text: "Search abiliti(es)",
      enableCheckAll: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: false,
      limitSelection: false,
      enableSearchFilter: true,
      classes: "myclass custom-class",
      showCheckbox: true,
      position: "top"
    };
  }

  get spellsSettings() {
    return {
      primaryKey: "spellId",
      labelKey: "name",
      text: "Search Spell(s)",
      enableCheckAll: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: false,
      limitSelection: false,
      enableSearchFilter: true,
      classes: "myclass custom-class ",
      showCheckbox: true,
      position: "top"
    };
  }

  get buffAndEffectsSettings() {
    return {
      primaryKey: "buffAndEffectId",
      labelKey: "name",
      text: "Search Buff & Effect(s)",
      enableCheckAll: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: false,
      limitSelection: false,
      enableSearchFilter: true,
      classes: "myclass custom-class ",
      showCheckbox: true,
      position: "top"
    };
  }

  //Here the multiselect methods
  onItemSelect(item: any) {
    // console.log(item);
  }
  OnItemDeSelect(item: any) {
    //  console.log(item);
  }
  onSelectAll(items: any) {
    //console.log(items);
  }
  onDeSelectAll(items: any) {
    //  console.log(items);
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
    this.bsModalRef.content.rulesetId = this._ruleSetId;
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
    this.bsModalRef.content.title = 'item';
    this.bsModalRef.content.image = img;
    this.bsModalRef.content.view = view;
    this.bsModalRef.content.errorImage = '../assets/images/DefaultImages/Item.jpg';
    //this.bsModalRef.content.imageChangedEvent = this.imageChangedEvent; //base 64 || URL
    this.bsModalRef.content.event.subscribe(data => {
      this.itemMasterFormModal.itemImage = data.base64;
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
  public event: EventEmitter<any> = new EventEmitter();
}
