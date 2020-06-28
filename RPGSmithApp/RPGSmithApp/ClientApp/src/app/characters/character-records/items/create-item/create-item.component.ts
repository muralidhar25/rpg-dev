import { Component, OnInit, OnDestroy, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { ItemMaster } from '../../../../core/models/view-models/item-master.model';
import { ImageError, VIEW } from '../../../../core/models/enums';
import { Utilities } from '../../../../core/common/utilities';
import { AlertService, MessageSeverity } from '../../../../core/common/alert.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { LocalStoreManager } from '../../../../core/common/local-store-manager.service';
import { SharedService } from '../../../../core/services/shared.service';
import { ItemMasterService } from '../../../../core/services/item-master.service';
import { ImageSearchService } from '../../../../core/services/shared/image-search.service';
import { SpellsService } from '../../../../core/services/spells.service';
import { CommonService } from '../../../../core/services/shared/common.service';
import { AbilityService } from '../../../../core/services/ability.service';
import { FileUploadService } from '../../../../core/common/file-upload.service';
import { ItemsService } from '../../../../core/services/items.service';
import { DBkeys } from '../../../../core/common/db-keys';
import { User } from '../../../../core/models/user.model';
import { AddContainerComponent } from '../add-container/add-container.component';
import { AddContainerItemComponent } from '../add-container-item/add-container-item.component';
import { ImageSelectorComponent } from '../../../../shared/image-interface/image-selector/image-selector.component';
import { DiceComponent } from '../../../../shared/dice/dice/dice.component';
import { RulesetService } from '../../../../core/services/ruleset.service';


@Component({
    selector: 'app-create-item',
    templateUrl: './create-item.component.html',
    styleUrls: ['./create-item.component.scss']
})
export class CreateItemComponent implements OnInit {

    isLoading = false;
    title: string;
    _ruleSetId: number;
    showWebButtons: boolean = false;
    itemMasterFormModal: any = new ItemMaster();
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
    defaultImageSelected: string = '';
  button: string
  isGM_Only: boolean = false;
  ruleSet: any;
    options(placeholder?: string, initOnClick?: boolean): Object {
        return Utilities.optionsFloala(160, placeholder, initOnClick);
    }

    constructor(
        private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
        public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
        private sharedService: SharedService, private commonService: CommonService, private abilityService: AbilityService,
        private itemMasterService: ItemMasterService, private itemsService: ItemsService, private spellsService: SpellsService,
      private fileUploadService: FileUploadService, private imageSearchService: ImageSearchService,
      private rulesetService: RulesetService
    ) {
        this.route.params.subscribe(params => { this._ruleSetId = params['id']; });

        this.sharedService.shouldUpdateContainerItem().subscribe(sharedData => {

            this.itemMasterFormModal.containerItemId = sharedData.containerItemId;
            this.itemMasterFormModal.containedIn = sharedData.containerItemId;
            this.itemMasterFormModal.containerName = sharedData.itemName;
            try {
                this.itemMasterFormModal.selected = sharedData.selected;
                if (this.itemMasterFormModal.selected) this.itemMasterFormModal.contains = sharedData.Contains;
                this.itemMasterFormModal.contains = this.itemMasterFormModal.contains.filter(item => item.itemId !== sharedData.containerItemId);
            } catch (err) { }
        });
        this.sharedService.shouldUpdateContainsItem().subscribe(sharedData => {
            this.itemMasterFormModal.selected = sharedData.selected;
            this.itemMasterFormModal.contains = sharedData.Contains;
        });

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
            this.isFromCharacter = this.bsModalRef.content.isFromCharacter == undefined ? false : this.bsModalRef.content.isFromCharacter;
            this.isFromCharacterId = this.bsModalRef.content.isFromCharacterId == undefined ? 0 : this.bsModalRef.content.isFromCharacterId;
            this.title = this.bsModalRef.content.title;
            let _view = this.button = this.bsModalRef.content.button;
          let _itemsVM = this.bsModalRef.content.itemsVM;
          this.isGM_Only = this.bsModalRef.content.isGM_Only;

            this.itemMasterFormModal = this.itemsService.itemMasterModelData(_itemsVM, _view);
            if (this._ruleSetId == undefined)
                this._ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
            this.itemMasterFormModal.ruleSetId = this._ruleSetId;
            this.itemMasterFormModal.item = {};
            this.itemMasterFormModal.isFromCharacter = this.isFromCharacter;
          this.itemMasterFormModal.isFromCharacterId = this.isFromCharacterId;

          this.rulesetService.getRulesetById<any>(this._ruleSetId).subscribe(data => {
            if (data) {
              this.ruleSet = data;
            }
          }, error => { });

            this.percentReduced = this.itemMasterFormModal.containerWeightModifier == 'Percent of Contents' ? true : false;
            this.weightWithContent = this.itemMasterFormModal.containerWeightModifier == 'Maximum Weight of' ? true : false;
            this.selectedAbilities = this.itemMasterFormModal.itemMasterAbilities.map(x => { return x.ability; });
            this.selectedSpells = this.itemMasterFormModal.itemMasterSpell.map(x => { return x.spell; });
          this.selectedBuffAndEffects = this.itemMasterFormModal.itemMasterBuffAndEffects.map(x => { return x.buffAndEffect; });

            if (this.itemMasterFormModal.metatags !== '' && this.itemMasterFormModal.metatags !== undefined)
                this.metatags = this.itemMasterFormModal.metatags.split(",");
            this.itemMasterFormModal.contains = [];
            this.bingImageUrl = this.itemMasterFormModal.itemImage;
          this.initialize();
        }, 0);
    }

    private initialize() {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        else {
            this.isLoading = true;
            
            this.itemsService.getAbilitySpellForItems_sp<any>(this.isFromCharacterId, this.itemMasterFormModal.ruleSetId, this.itemMasterFormModal.itemId)
                .subscribe(data => {
                    
                    this.abilitiesList = data.abilityList;
                    this.spellsList = data.spellList;
                  this.buffAndEffectsList = data.buffAndEffectsList;
                    this.selectedAbilities = data.selectedAbilityList.map(x => { return x; });
                    this.selectedSpells = data.selectedSpellList.map(x => { return x; });
                  this.selectedBuffAndEffects = data.selectedBuffAndEffects.map(x => { return x; });
                    this.itemMasterFormModal.itemMasterCommandVM = data.selectedItemCommand;
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

            if (!this.itemMasterFormModal.itemImage) {
                this.imageSearchService.getDefaultImage<any>('item')
                    .subscribe(data => {
                        this.defaultImageSelected = data.imageUrl.result
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
            this.itemMasterFormModal.containerWeightMax = 0;
            this.itemMasterFormModal.containerVolumeMax = 0;
            this.itemMasterFormModal.containerWeightModifier = 'None';
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

    addCommand(itemCommand: any): void {
        let _itemCommand = itemCommand == undefined ? [] : itemCommand;
        _itemCommand.push({ itemMasterCommandId: 0, command: '', name: '' });
        this.itemMasterFormModal.itemMasterCommandVM = _itemCommand;
    }

    removeCommand(command: any): void {
        this.itemMasterFormModal.itemMasterCommandVM
            .splice(this.itemMasterFormModal.itemMasterCommandVM.indexOf(command), 1);
    }

    removeContainsItem(item: any) {
        const index: number = this.itemMasterFormModal.contains.indexOf(item);
        if (index !== -1) {
            this.itemMasterFormModal.contains.splice(index, 1);
        }
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

    setTotalWeight(weight, quantity) {
        try {
            weight = weight == undefined || weight == '' || weight == null ? 0 : +weight;
            quantity = quantity == undefined || quantity == '' || quantity == null || quantity < 1 ? 1 : +quantity;
            this.itemMasterFormModal.weight = weight;
            this.itemMasterFormModal.quantity = quantity;
            this.itemMasterFormModal.totalWeight = (weight * quantity).toFixed(3);
        } catch (err) { }
    }

    onChangeContainer(event) {
        if (event.target.checked) {
            this.itemMasterFormModal.quantity = 1;
            this.setTotalWeight(this.itemMasterFormModal.weight, this.itemMasterFormModal.quantity);
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

    submitForm(itemMaster: any) {
        this.setTotalWeight(itemMaster.weight, itemMaster.quantity);
        this.validateSubmit(itemMaster);
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
            itemMaster.contains = [];
            itemMaster.containerItems = [];
        } else
            itemMaster.containerItems = itemMaster.contains;

        if (itemMaster.itemMasterAbilities.length == 0 && itemMaster.itemMasterAbilityVM.length > 0)
            itemMaster.itemMasterAbilities = itemMaster.itemMasterAbilityVM;
        else if (itemMaster.itemMasterAbilities.length > 0 && itemMaster.itemMasterAbilityVM.length == 0)
            itemMaster.itemMasterAbilityVM = itemMaster.itemMasterAbilities;
        if (itemMaster.itemMasterSpell.length == 0 && itemMaster.itemMasterSpellVM.length > 0)
            itemMaster.itemMasterSpell = itemMaster.itemMasterSpellVM;
        else if (itemMaster.itemMasterSpell.length > 0 && itemMaster.itemMasterSpellVM.length == 0)
            itemMaster.itemMasterSpellVM = itemMaster.itemMasterSpell;

        itemMaster.item = {
            itemId: this.itemMasterFormModal.view === VIEW.EDIT ? itemMaster.itemId : 0,
            name: itemMaster.itemName,
            description: itemMaster.description,
            gmOnly: itemMaster.gmOnly,
            itemImage: itemMaster.itemImage,
            characterId: itemMaster.isFromCharacterId,
            itemMasterId: itemMaster.itemMasterId,
            containerItemId: itemMaster.containerItemId,
            containedIn: itemMaster.containerItemId,
            quantity: itemMaster.quantity,
            totalWeight: itemMaster.totalWeight,
            isIdentified: itemMaster.isIdentified,
            isVisible: itemMaster.isVisible,
            isEquipped: itemMaster.isEquipped
        }

        if (!itemMaster.character) {
            itemMaster.character = {
                ruleSetId: itemMaster.ruleSetId,
                characterId: itemMaster.characterId,
                characterName: "-"
            }
        }
        
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

    private fileUploadFromBing(file: string, ext: string, itemMaster: any) {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout(true);
        else {
            this.fileUploadService.fileUploadFromURL<any>(user.id, file, ext)
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
    private fileUpload(itemMaster: any) {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout(true);
        else {
            this.fileUploadService.fileUploadByUser<any>(user.id, this.fileToUpload)
                .subscribe(
                    data => {
                        this.itemMasterFormModal.itemImage= data.ImageUrl;
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
        this.isLoading = true;
        //file upload
        this.itemMasterService.fileUpload(this.fileToUpload)
            .subscribe(
                data => {
                   
                    itemMaster.itemImage = data.ImageUrl;
                    this.submit(itemMaster);
                }, error => { this.submit(itemMaster); });
    }

    private submit(itemMaster: any) {
        
        if (this.itemMasterFormModal.view === VIEW.DUPLICATE) {
            this.duplicateItemMaster(itemMaster);
        }
        else if (this.itemMasterFormModal.view === VIEW.EDIT) {
            this.updateItem(itemMaster.item);
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
        this.isLoading = true;
        
        this.itemMasterService.createItemMaster<any>(modal)
            .subscribe(
            data => {
                    
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    //let message = "A new '" + modal.itemName + "' Item Template has been created for this item. Any future updates to the item will not affect the Item Template. If you wish to update the item template you may do so from the Rule Sets interface.";
                    let message = "An Item Template has been created for this at the Rule Set.";
                    if (data !== "" && data !== null && data !== undefined) message = data;
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                    this.bsModalRef.hide();
                    this.destroyModalOnInit();
                    this.sharedService.updateItemsList(true);
                    if (this.fromDetail)
                        this.router.navigate(['/character/inventory-details', modal.itemMasterId]);
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

    updateItem(modal: any) {
        this.isLoading = true;
        this.itemsService.updateItem<any>(modal)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let message = "Item has been updated successfully";
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                    this.bsModalRef.hide();
                    this.destroyModalOnInit();
                    this.sharedService.updateItemsList(true);
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

    duplicateItemMaster(modal: any) {
        this.isLoading = true;
        
        this.itemMasterService.duplicateItemMaster<any>(modal)
            .subscribe(
            data => {
                
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    //let message = "The '" + modal.itemName + "' Item Template has been duplicated for this item. Any future updates to the item will not affect the Item Template. If you wish to update the item template you may do so from the Rule Sets interface.";
                    let message = "An Item Template has been duplicated for this at the Rule Set.";
                    if (data !== "" && data !== null && data !== undefined) message = data;
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                    this.bsModalRef.hide();
                    this.destroyModalOnInit();
                    this.sharedService.updateItemsList(true);
                    if (this.fromDetail)
                        this.router.navigate(['/ruleset/item-master', modal.ruleSetId]);
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

    addContainer(itemId: number) {

        this.bsModalRef = this.modalService.show(AddContainerComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });

        this.bsModalRef.content.title = 'Select Container';
        this.bsModalRef.content.button = 'SELECT';
        this.bsModalRef.content.characterId = this.isFromCharacterId;
        this.bsModalRef.content.itemId = itemId;
        this.bsModalRef.content.containerItemId = this.itemMasterFormModal.containerItemId;
    }

    removeContainer() {
        this.itemMasterFormModal.containerName = '';
        this.itemMasterFormModal.containerItemId = 0;
    }

    addContainerItem(itemMaster: any) {

        this.bsModalRef = this.modalService.show(AddContainerItemComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });

        this.bsModalRef.content.title = 'Select Item';
        this.bsModalRef.content.button = 'SELECT';
        this.bsModalRef.content.characterId = this.isFromCharacterId;
        this.bsModalRef.content.itemId = 0;
        this.bsModalRef.content.itemName = itemMaster.containerName;
        this.bsModalRef.content.contains = itemMaster.contains;
        this.bsModalRef.content.containerItemId = itemMaster.containerItemId;
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
    readTempUrl(event: any) {
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
        this.bsModalRef.content.characterId = this.isFromCharacterId;
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
}
