import { Component, OnInit, EventEmitter } from '@angular/core';
import { Utilities } from '../../../core/common/utilities';
import { ImageError, VIEW } from '../../../core/models/enums';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { PlatformLocation } from '@angular/common';
import { ImageSearchService } from '../../../core/services/shared/image-search.service';
import { FileUploadService } from '../../../core/common/file-upload.service';
import { ItemMasterService } from '../../../core/services/item-master.service';
import { SharedService } from '../../../core/services/shared.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { User } from '../../../core/models/user.model';
import { DBkeys } from '../../../core/common/db-keys';
import { DiceComponent } from '../../../shared/dice/dice/dice.component';
import { ImageSelectorComponent } from '../../../shared/image-interface/image-selector/image-selector.component';
import { LootService } from '../../../core/services/loot.service';
import { AppService1 } from '../../../app.service';
import { AddLootPileComponent } from '../add-loot-pile/add-loot-pile.component';
import { CreateLootPile } from '../../../core/models/view-models/loot-pile-create.model';

@Component({
  selector: 'app-create-loot-pile',
  templateUrl: './create-loot-pile.component.html',
  styleUrls: ['./create-loot-pile.component.scss']
})
export class CreateLootPileComponent implements OnInit {

  isLoading = false;
  title: string;
  ruleSetId: number;
  showWebButtons: boolean = false;
  createLootPileModal: any = new CreateLootPile();
  fileToUpload: File = null;
  fromDetail: boolean = false;
  percentReduced: boolean = false;
  weightWithContent: boolean = false;

  metatags = [];
  uploadFromBing: boolean = false;
  bingImageUrl: string;
  bingImageExt: string;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  imageErrorMessage: string = ImageError.MESSAGE
  defaultImageSelected: string = '';
  button: string
  itemList: any[] = [];
  lootPileItems: any[] = [];
  selectedItems: any[] = [];
  itemQty: number[] = [];

  public event: EventEmitter<any> = new EventEmitter();

  options(placeholder?: string, initOnClick?: boolean): Object {
    return Utilities.optionsFloala(160, placeholder, initOnClick);
  }
  constructor(private router: Router,
    private bsModalRef: BsModalRef,
    private alertService: AlertService,
    private authService: AuthService,
    public modalService: BsModalService,
    private localStorage: LocalStoreManager,
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private itemMasterService: ItemMasterService,
    private fileUploadService: FileUploadService,
    private imageSearchService: ImageSearchService,
    private lootService: LootService, private appService: AppService1,
    private location: PlatformLocation) {

    location.onPopState(() => this.modalService.hide(1));
    this.route.params.subscribe(params => { this.ruleSetId = params['id']; });

  }

  ngOnInit() {

    setTimeout(() => {
      this.fromDetail = this.bsModalRef.content.fromDetail == undefined ? false : this.bsModalRef.content.fromDetail;
      this.title = this.bsModalRef.content.title;
      let _view = this.button = this.bsModalRef.content.button;
      let _lootPileVM = this.bsModalRef.content.lootPileVM;
      //this.itemMasterFormModal = this.itemMasterService.itemMasterModelData(_itemTemplateVM, _view);
      debugger
      //this._ruleSetId = this.itemMasterFormModal.ruleSetId;

      this.ruleSetId = this.bsModalRef.content.ruleSetId;

      if (this.createLootPileModal.metatags !== '' && this.createLootPileModal.metatags !== undefined)
        this.metatags = this.createLootPileModal.metatags.split(",");
      this.bingImageUrl = this.createLootPileModal.imageUrl;

      this.GetLootPileItemsToAdd();
      this.initialize();
    }, 0);
  }

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;

      if (!this.createLootPileModal.imageUrl) {
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


  GetLootPileItemsToAdd() {
    this.isLoading = true;
    this.lootService.getLootPileItemsToAdd<any>(this.ruleSetId)
      .subscribe(data => {
        this.lootPileItems = data;
        this.lootPileItems.map(x => {
          x.qty = '';
        });
        this.isLoading = false;
      }, error => {
        this.isLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          this.authService.logout(true);
        }
      }, () => { })
  }

  removeTag(tagData: any, tag: any, index: number): void {
    tagData.splice(index, 1);
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

  submitForm(lootPile: any) {
    debugger
    this.validateSubmit(lootPile);
  }
  validateSubmit(lootPile: any) {
    debugger;
    let tagsValue = this.metatags.map(x => {
      if (x.value == undefined) return x;
      else return x.value;
    });
    lootPile.metatags = tagsValue.join(', ');

    if (lootPile.ruleSetId == 0 || lootPile.ruleSetId === undefined)
      lootPile.ruleSetId = this.ruleSetId;

    //if (!itemMaster.isContainer) {
    //  itemMaster.containerWeightMax = 0;
    //  itemMaster.containerVolumeMax = 0;
    //  itemMaster.containerWeightModifier = 'None';
    //  itemMaster.containerItems = [];
    //}
    //else {
    //  itemMaster.containerItems = itemMaster.contains;
    //}

    this.isLoading = true;
    let _msg = lootPile.lootPileId == 0 || lootPile.lootPileId === undefined ? "Creating Loot Item Template.." : "Updating Loot Item Template..";
    this.alertService.startLoadingMessage("", _msg);

    if (this.fileToUpload != null) {
      this.fileUpload(lootPile);
    }
    else if (this.bingImageUrl !== this.createLootPileModal.imageUrl) {
      try {
        var regex = /(?:\.([^.]+))?$/;
        var extension = regex.exec(this.createLootPileModal.imageUrl)[1];
        extension = extension ? extension : 'jpg';
      } catch{ }
      this.fileUploadFromBing(this.createLootPileModal.imageUrl, extension, lootPile);
    }
    else {
      this.submit(lootPile);
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
            this.createLootPileModal.imageUrl = data.ImageUrl;
            this.submit(itemMaster);
          },
          error => {
            let Errors = Utilities.ErrorDetail('Error', error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            }
            else this.submit(itemMaster);
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
            this.createLootPileModal.imageUrl = data.ImageUrl;
            this.submit(itemMaster);
          },
          error => {
            let Errors = Utilities.ErrorDetail('Error', error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            }
            else this.submit(itemMaster);
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

  private submit(lootPile: any) {
    let lootItems = [];
    if (this.selectedItems) {
      this.selectedItems.map(x => {
        //lootItems.push({ itemMasterId: x.itemMasterId, name: x.itemName, ImageUrl: x.itemImage, IsBundle: x.isBundle });
        lootItems.push({ itemMasterId: x.itemMasterId, qty: x.qty });
      });
    } 
    lootPile.itemList = lootItems;
    debugger
    let lootPileVM = { ruleSetId: lootPile.ruleSetId, itemName: lootPile.name, itemImage: lootPile.imageUrl, itemVisibleDesc: lootPile.description, metatags: lootPile.metatags, isVisible: lootPile.visible, lootPileItems: lootPile.itemList }
    if (this.defaultImageSelected && !this.createLootPileModal.imageUrl) {
      let model = Object.assign({}, lootPileVM)
      model.itemImage = this.defaultImageSelected
      this.addEditLootPile(model);
    } else {
      this.addEditLootPile(lootPileVM);
    }
  }

  addEditLootPile(modal: any) {
    modal.ruleSetId = this.ruleSetId;
    // modal.userID = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER).id
    this.isLoading = true;
    this.lootService.createLootPile<any>(modal)
      .subscribe(
        data => {
          debugger
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let message = modal.itemMasterId == 0 || modal.itemMasterId === undefined ? "Loot Item Template has been created successfully." : " Loot Item Template has been updated successfully.";
          if (data !== "" && data !== null && data !== undefined && isNaN(parseInt(data))) message = data;
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.close();
          if (modal.lootId == 0 || modal.lootId === undefined) {
            this.appService.updateChatWithLootMessage(true); //loot created...
          }

          if (this.fromDetail) {
            if (data) {
              let id = data;
              if (!isNaN(parseInt(id))) {
                this.router.navigate(['/ruleset/loot-pile-details', id]);
                this.event.emit({ lootPileId: id });
                //this.sharedService.updateItemMasterDetailList(true);                
              }
              //else
              //this.sharedService.updateItemMasterDetailList(true);
            }
            else {
              //this.sharedService.updateItemMasterDetailList(true);
            }
          }
          //else this.sharedService.updateItemsList(true);
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

  readTempUrl(event: any) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (event: any) => {
        this.createLootPileModal.imageUrl = event.target.result;
      }
      reader.readAsDataURL(event.target.files[0]);
      this.imageChangedEvent = event;
    }
  }

  close() {
    this.bsModalRef.hide();
    this.destroyModalOnInit();

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
    this.bsModalRef.content.rulesetId = this.ruleSetId;
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
      this.createLootPileModal.imageUrl = data.base64;
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

  addItems(itemMaster: any) {
    this.bsModalRef = this.modalService.show(AddLootPileComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });

    this.bsModalRef.content.title = 'Select Item';
    this.bsModalRef.content.button = 'SELECT';
    //this.bsModalRef.content.rulesetId = this._ruleSetId;
    //this.bsModalRef.content.itemId = itemMaster.lootId;
    //this.bsModalRef.content.itemName = itemMaster.containerName;
    //this.bsModalRef.content.contains = itemMaster.contains;
    //this.bsModalRef.content.containerItemId = itemMaster.containerItemId;

    this.bsModalRef.content.event.subscribe(data => {
      debugger
      this.createLootPileModal.itemList = data.multiItemMasters;
    });
  }

  get itemSettings() {
    return {
      primaryKey: "itemMasterId",
      labelKey: "itemName",
      text: "Search item(s)",
      enableCheckAll: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: false,
      limitSelection: false,
      enableSearchFilter: false,
      classes: "myclass custom-class ",
      showCheckbox: true,
      position: "bottom"
    };
  }



}
