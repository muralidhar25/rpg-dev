import { Component, OnInit} from '@angular/core';
import { Router,  ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef} from 'ngx-bootstrap';
import { ImageError, VIEW } from '../../../core/models/enums';
import { Utilities } from '../../../core/common/utilities';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SharedService } from '../../../core/services/shared.service';
import { CommonService } from '../../../core/services/shared/common.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { ItemsService } from '../../../core/services/items.service';
import { ItemMasterService } from '../../../core/services/item-master.service';
import { FileUploadService } from '../../../core/common/file-upload.service';
import { SpellsService } from '../../../core/services/spells.service';
import { AbilityService } from '../../../core/services/ability.service';
import { Items } from '../../../core/models/view-models/items.model';
import { DBkeys } from '../../../core/common/db-keys';
import { User } from '../../../core/models/user.model';
import { DiceComponent } from '../../../shared/dice/dice/dice.component';
import { ImageSelectorComponent } from '../../../shared/image-interface/image-selector/image-selector.component';
import { AddMonsterContainerComponent } from '../add-container/add-container.component';
import { RulesetService } from '../../../core/services/ruleset.service';

@Component({
    selector: 'app-edit-item',
    templateUrl: './edit-item.component.html',
    styleUrls: ['./edit-item.component.scss']
})
export class EditMonsterItemComponent implements OnInit {

    isLoading = false;
    title: string;
    _ruleSetId: number;
    showWebButtons: boolean = false;
    ItemFormModal: any = new Items();
    fileToUpload: File = null;
    numberRegex = "^(?:[0-9]+(?:\.[0-9]{0,8})?)?$";// "^((\\+91-?)|0)?[0-9]{0,2}$"; 
    fromDetail: boolean = false;
    isFromCharacter: boolean = false;
    isFromCharacterId: number;
    percentReduced: boolean = false;
    weightWithContent: boolean = false;

    abilitiesList = [];
    selectedAbilities = [];
    spellsList = [];
  buffAndEffectsList = [];
    selectedSpells = [];
  selectedBuffAndEffects = [];
    metatags = [];
    uploadFromBing: boolean = false;
    bingImageUrl: string;
    bingImageExt: string;
    imageChangedEvent: any = '';
    croppedImage: any = '';
    imageErrorMessage: string = ImageError.MESSAGE
    button:string
    options(placeholder?: string, initOnClick?: boolean): Object {
        return Utilities.optionsFloala(160, placeholder, initOnClick);
    }

    constructor(
        private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
        public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
        private sharedService: SharedService, private commonService: CommonService, private abilityService: AbilityService,
        private itemMasterService: ItemMasterService, private itemsService: ItemsService, private spellsService: SpellsService,
      private fileUploadService: FileUploadService,
      private rulesetService: RulesetService) {
        this.route.params.subscribe(params => { this._ruleSetId = params['id']; });
      this.sharedService.shouldUpdateContainerItem().subscribe(sharedData => {
            this.ItemFormModal.containerItemId = sharedData.containerItemId;
            this.ItemFormModal.containedIn = sharedData.containerItemId;
            this.ItemFormModal.containerName = sharedData.itemName;

            try {
                this.ItemFormModal.selected = sharedData.selected;
                if (this.ItemFormModal.selected) this.ItemFormModal.contains = sharedData.Contains;
                this.ItemFormModal.contains = this.ItemFormModal.contains.filter(item => item.itemId !== sharedData.containerItemId);
            } catch (err) { }
        });
        this.sharedService.shouldUpdateContainsItem().subscribe(sharedData => {
            try {
                this.ItemFormModal.contains = sharedData.Contains;
                this.ItemFormModal.selected = sharedData.selected;
            } catch (err) { }
        });
        this.sharedService.getCommandData().subscribe(diceCommand => {
            if (diceCommand.parentIndex === -1) {
                this.ItemFormModal.command = diceCommand.command;
            } else {
                if (this.ItemFormModal.itemCommandVM.length > 0) {
                    this.ItemFormModal.itemCommandVM.forEach(item => {
                        var index = this.ItemFormModal.itemCommandVM.indexOf(item);
                        if (index === diceCommand.parentIndex) {
                            this.ItemFormModal.itemCommandVM[index].command = diceCommand.command;
                        }
                    });
                }
            }
        });
    }


    ngOnInit() {
        setTimeout(() => {            
            this.title = this.bsModalRef.content.title;
            let _view = this.button= this.bsModalRef.content.button;
          let _itemVM = this.bsModalRef.content.itemVM;
          let isEditingWithoutDetail = this.bsModalRef.content.isEditingWithoutDetail;
          if (isEditingWithoutDetail) {
            let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
            this.isLoading = true;
            this.itemMasterService.getMonsterItemById<any>(_itemVM.itemId)
              .subscribe(data => {
                if (data)
                //this.monsterId = data.monsterId;
                //this.RuleSet = data.ruleSet;
                _itemVM = this.itemMasterService.itemMasterModelData(data, "UPDATE");
                //this.ItemDetail.forEach(function (val) { val.showIcon = false; });
                this.rulesetService.GetCopiedRulesetID(_itemVM.ruleSetId, user.id).subscribe(data => {

                  let id: any = data
                  //this.ruleSetId = id;
                  this._ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
                  this.isLoading = false;

                  if (this._ruleSetId == undefined)
                    this._ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

                  this.setInitialValues(_itemVM, _view);

                  this.initialize();

                }, error => {
                  this.isLoading = false;
                  let Errors = Utilities.ErrorDetail("", error);
                  if (Errors.sessionExpire) {
                    this.authService.logout(true);
                  }
                }, () => { });

              }, error => {
                this.isLoading = false;
                let Errors = Utilities.ErrorDetail("", error);
                if (Errors.sessionExpire) {
                  this.authService.logout(true);
                }
              }, () => { });
          } else {
            if (this._ruleSetId == undefined)
              this._ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

            this.setInitialValues(_itemVM, _view);

            this.initialize();
          }
        }, 0);
    }

    private setInitialValues(itemVM, view) {
        debugger
      this.ItemFormModal = this.itemsService.monsterItemModelData(itemVM, view);
        this.ItemFormModal.ruleSetId = this._ruleSetId;

        this.percentReduced = this.ItemFormModal.containerWeightModifier == 'Percent of Contents' ? true : false;
        this.weightWithContent = this.ItemFormModal.containerWeightModifier == 'Maximum Weight of' ? true : false;

        try {
            if (this.ItemFormModal.itemAbilities !== null && this.ItemFormModal.itemAbilities !== undefined)
                this.selectedAbilities = this.ItemFormModal.itemAbilities.map(x => { return x.ability; });

            if (this.ItemFormModal.itemSpells !== null && this.ItemFormModal.itemSpells !== undefined)
            this.selectedSpells = this.ItemFormModal.itemSpells.map(x => { return x.spell; });

          if (this.ItemFormModal.itemBuffAndEffects !== null && this.ItemFormModal.itemBuffAndEffects !== undefined)
            this.selectedBuffAndEffects = this.ItemFormModal.itemBuffAndEffects.map(x => { return x.buffAndEffect; });

            if (this.ItemFormModal.metatags !== '' && this.ItemFormModal.metatags !== undefined)
                this.metatags = this.ItemFormModal.metatags.split(",");
            else this.metatags = [];

            let _contains = this.ItemFormModal.containerItems.map(item => {
                return { text: item.name, value: item.itemId, itemId: item.itemId };
            });
            this.ItemFormModal.contains = _contains;

        } catch (err) { }
        this.bingImageUrl = this.ItemFormModal.itemImage;
    }

    private initialize() {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        else {
            this.isLoading = true;
            
            this.itemsService.getAbilitySpellForItems_sp<any>(this.ItemFormModal.characterId, this.ItemFormModal.ruleSetId, this.ItemFormModal.itemId)
                .subscribe(data => {
                    
                    this.abilitiesList = data.abilityList;
                  this.spellsList = data.spellList;
                  this.buffAndEffectsList = data.buffAndEffectsList;
                   // this.selectedAbilities = data.selectedAbilityList.map(x => { return x; });
                 // this.selectedSpells = data.selectedSpellList.map(x => { return x; });
                 // this.selectedBuffAndEffects = data.selectedBuffAndEffects.map(x => { return x; });
                  //  this.ItemFormModal.itemCommandVM = data.selectedItemCommand;
                    this.isLoading = false;
                }, error => { }, () => { });

            //this.abilityService.getAbilityByRuleset<any[]>(this._ruleSetId)
            //    .subscribe(data => {
            //        this.abilitiesList = data;
            //        this.isLoading = false;
            //    }, error => { this.isLoading = false; }, () => { });
            //this.spellsService.getspellsByRuleset<any[]>(this._ruleSetId)
            //    .subscribe(data => {
            //        this.spellsList = data;
            //        this.isLoading = false;
            //    }, error => { this.isLoading = false; }, () => { });
        }
    }

    itemRarity(_rarity: string) {
        this.ItemFormModal.rarity = _rarity;
    }

    IsContainer(_isContainer: boolean) {
        //reset fields if item is not container
        this.ItemFormModal.isContainer = _isContainer;
        if (!_isContainer) {
            this.ItemFormModal.containerWeightMax = 0;
            this.ItemFormModal.containerVolumeMax = 0;
            this.ItemFormModal.containerWeightModifier = 'None';
            //this.ItemFormModal.contains = [];
        }
    }

    removeTag(tagData: any, tag: any, index: number): void {
        tagData.splice(index, 1);
    }

    onSelectWeightReduction(event) {

        if (event.currentTarget.value == 'Percent of Contents') {
            this.percentReduced = true;
            this.weightWithContent = false;
            this.ItemFormModal.totalWeightWithContents = 0;
        }
        else if (event.currentTarget.value == 'Maximum Weight of') {
            this.weightWithContent = true;
            this.percentReduced = false;
            this.ItemFormModal.percentReduced = 0;
        } else {
            this.weightWithContent = false;
            this.percentReduced = false;
            this.ItemFormModal.percentReduced = 0;
            this.ItemFormModal.totalWeightWithContents = 0;
        }

        this.ItemFormModal.containerWeightModifier = event.currentTarget.value;
    }

    setTotalWeight(weight, quantity) {

        weight = weight == undefined || weight == '' || weight == null ? 0 : +weight;
        quantity = quantity == undefined || quantity == '' || quantity == null || quantity < 1 ? 1 : +quantity;
        this.ItemFormModal.weight = weight;
        this.ItemFormModal.quantity = quantity;
        this.ItemFormModal.totalWeight = (weight * quantity).toFixed(3);
    }

    addCommand(itemCommand: any): void {
        let _itemCommand = itemCommand == undefined ? [] : itemCommand;
        _itemCommand.push({ itemCommandId: 0, command: '', name: '' });
        this.ItemFormModal.itemCommandVM = _itemCommand;
    }

    removeCommand(command: any): void {
        this.ItemFormModal.itemCommandVM
            .splice(this.ItemFormModal.itemCommandVM.indexOf(command), 1);
    }

    removeContainsItem(item: any) {
        const index: number = this.ItemFormModal.contains.indexOf(item);
        if (index !== -1) {
            this.ItemFormModal.contains.splice(index, 1);
        }
    }

    setAssociatedSpell(event, itemId) {
        if (event.currentTarget.value == 'Select Spell') {
            this.ItemFormModal.itemSpellVM = [];
        }
        else {
            let _itemSpellVM = [];
            let _spellId: number = event.currentTarget.value;
            _itemSpellVM.push({ itemId: itemId, spellId: +_spellId });
            this.ItemFormModal.itemSpellVM = _itemSpellVM;
        }
    }

    setAssociatedAbility(event, itemId) {
        if (event.currentTarget.value == 'Select Ability') {
            this.ItemFormModal.itemAbilityVM = [];
        }
        else {
            let _itemAbilityVM = [];
            let _abilityId: number = event.currentTarget.value;
            _itemAbilityVM.push({ itemId: itemId, abilityId: +_abilityId });
            this.ItemFormModal.itemAbilityVM = _itemAbilityVM;
        }
    }
    
    onChangeContainer(event) {
        if (event.target.checked) {
            this.ItemFormModal.quantity = 1;
            this.setTotalWeight(this.ItemFormModal.weight, this.ItemFormModal.quantity);
        }
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

    validateSubmit(item: any) {
        
        item.itemAbilities = this.selectedAbilities.map(x => {
            return { abilityId: x.abilityId, itemId: item.itemId };
        });

        item.itemSpells = this.selectedSpells.map(x => {
            return { spellId: x.spellId, itemId: item.itemId };
      });
      item.itemBuffAndEffects = this.selectedBuffAndEffects.map(x => {
        return { buffAndEffectId: x.buffAndEffectId, itemId: item.itemId };
      });

        let tagsValue = this.metatags.map(x => {
            if (x.value == undefined) return x;
            else return x.value;
        });
        item.metatags = tagsValue.join(', ');
        
        if (!item.character) {
            item.character = {
                ruleSetId: item.ruleSetId,
                characterId: item.characterId,
                characterName: "-"
            }
        }

        if (!item.isContainer) {
            item.containerWeightMax = 0;
            item.containerVolumeMax = 0;
            item.containerWeightModifier = 'None';
            item.contains = [];
            item.containerItems = [];
        } else
            item.containerItems = item.contains;

        this.isLoading = true;
        let _msg = item.itemId == 0 || item.itemId === undefined ? "Creating Item.." : "Updating Item..";
        if (this.ItemFormModal.view === VIEW.DUPLICATE) _msg = "Duplicating Item..";
        this.alertService.startLoadingMessage("", _msg);

        if (this.fileToUpload != null) {
            this.fileUpload(item);
        }
        else if (this.bingImageUrl !== this.ItemFormModal.itemImage) {
            try {
                var regex = /(?:\.([^.]+))?$/;
                var extension = regex.exec(this.ItemFormModal.itemImage)[1];
                extension = extension ? extension : 'jpg';
            } catch{ }
            this.fileUploadFromBing(this.ItemFormModal.itemImage, extension, item);
        }      
        else {
            this.submit(item);
        }
    }

    submitForm(item: any) {
        this.validateSubmit(item);
    }

    private fileUploadFromBing(file: string, ext: string, itemMaster: any) {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout(true);
        else {
            this.fileUploadService.fileUploadFromURL<any>(user.id, file, ext)
                .subscribe(
                    data => {
                        this.ItemFormModal.itemImage = data.ImageUrl;
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
                        this.ItemFormModal.itemImage = data.ImageUrl;
                        //this.charactersFormModal.thumbnailUrl = data.ThumbnailUrl;
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

    private fileUploadOLD(item: any) {
        this.isLoading = true;
        //file upload
        this.itemsService.fileUpload(this.fileToUpload)
            .subscribe(
                data => {
                    //console.log(data);
                    item.itemImage = data.ImageUrl;
                    this.submit(item);
                }, error => {
                    item.itemImage = null;
                    this.submit(item);
                });
    }

    private submit(item: any) {

        if (this.ItemFormModal.view === VIEW.DUPLICATE) {
            this.duplicateItem(item);
        }
        else {
            this.updateItem(item);
        }
    }

    updateItem(modal: any) {
        this.isLoading = true;
        
      this.itemsService.updateMonsterItem<any>(modal)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let message = "Item has been updated successfully";
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                    this.bsModalRef.hide();
                    this.destroyModalOnInit();
                  this.sharedService.updateMonsterTemplateDetailList(true);
                },
                error => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let _message = "Unable to Update ";
                    let Errors = Utilities.ErrorDetail(_message, error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                },
        );
    }

    duplicateItem(modal: any) {
        this.isLoading = true;
        this.itemsService.duplicateItem<any>(modal)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let message = "Item has been duplicated successfully.";
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                    this.bsModalRef.hide();
                    this.destroyModalOnInit();
                    this.sharedService.updateItemsList(true);
                    this.router.navigate(['/character/inventory', modal.characterId]);
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

    addContainer(item: any) {

        this.bsModalRef = this.modalService.show(AddMonsterContainerComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });

        this.bsModalRef.content.title = 'Select Container';
        this.bsModalRef.content.button = 'SELECT';
      this.bsModalRef.content.rulesetId = this.ItemFormModal.ruleSetId;
        this.bsModalRef.content.itemId = item.itemId;
        this.bsModalRef.content.containerItemId = item.containerItemId;
    }

    removeContainer() {
        this.ItemFormModal.containerName = '';
        this.ItemFormModal.containerItemId = 0;
        this.ItemFormModal.containedIn = 0;
    }

    //addContainerItem(item: any) {

    //    this.bsModalRef = this.modalService.show(AddContainerItemComponent, {
    //        class: 'modal-primary modal-md',
    //        ignoreBackdropClick: true,
    //        keyboard: false
    //    });

    //    this.bsModalRef.content.title = 'Select Item';
    //    this.bsModalRef.content.button = 'SELECT';
    //    this.bsModalRef.content.characterId = item.characterId;
    //    this.bsModalRef.content.itemId = item.itemId;
    //    this.bsModalRef.content.itemName = item.containerName;
    //    this.bsModalRef.content.contains = item.contains;
    //    this.bsModalRef.content.containerItemId = item.containerItemId;
        
    //}

    resetToOriginal(ItemFormModal: Items) {
        
        this.isLoading = true;
        this.itemsService.resetItemToOriginal(ItemFormModal)
            .subscribe(
            data => {
                
                    this.isLoading = false;
                    this.setInitialValues(data, 'UPDATE')
                },
                error => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let Errors = Utilities.ErrorDetail("Unable to Reset", error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                },
        );
    }

    get abilitiesSettings() {
        return {
            primaryKey: "abilityId",
            labelKey: "name",
            text: "Search abiliti(es)",
            enableCheckAll: false,
            selectAllText: 'Select All',
            unSelectAllText: 'Deselect All',
            singleSelection: false,
            limitSelection: false,
            enableSearchFilter: true,
            classes: "myclass custom-class",
            showCheckbox: true,
            position: "top",
        };
    }

    get spellsSettings() {
        return {
            primaryKey: "spellId",
            labelKey: "name",
            text: "Search Spell(s)",
            enableCheckAll: false,
            selectAllText: 'Select All',
            unSelectAllText: 'Deselect All',
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
    readTempUrl(event: any) {
        if (event.target.files && event.target.files[0]) {
            var reader = new FileReader();

            reader.onload = (event: any) => {
                this.ItemFormModal.itemImage = event.target.result;
            }

            reader.readAsDataURL(event.target.files[0]);
            this.imageChangedEvent = event;
        }
    }

    close() {
        this.bsModalRef.hide();
        this.destroyModalOnInit();
    }

    onInputBlurred(event: any) {
          
    }
    onItemRemoved(event: any) {
        
    }
    onItemAdded(event: any) {
        
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
        this.bsModalRef.content.characterId = this.ItemFormModal.characterId;
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
            this.ItemFormModal.itemImage = data.base64;
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
}
