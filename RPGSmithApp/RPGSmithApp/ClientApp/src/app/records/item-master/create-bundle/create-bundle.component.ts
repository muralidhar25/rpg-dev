import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { ImageError, VIEW } from '../../../core/models/enums';
import { Utilities } from '../../../core/common/utilities';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ItemMasterService } from '../../../core/services/item-master.service';
import { SharedService } from '../../../core/services/shared.service';
import { AbilityService } from '../../../core/services/ability.service';
import { FileUploadService } from '../../../core/common/file-upload.service';
import { CommonService } from '../../../core/services/shared/common.service';
import { ImageSearchService } from '../../../core/services/shared/image-search.service';
import { SpellsService } from '../../../core/services/spells.service';
import { User } from '../../../core/models/user.model';
import { DBkeys } from '../../../core/common/db-keys';
import { ImageSelectorComponent } from '../../../shared/image-interface/image-selector/image-selector.component';
import { PlatformLocation } from '@angular/common';
import { AddItemMasterComponent } from '../add-item/add-item.component';
import { Bundle } from '../../../core/models/view-models/bundle.model';

@Component({
  selector: 'app-create-bundle',
  templateUrl: './create-bundle.component.html',
  styleUrls: ['./create-bundle.component.scss']
})


export class CreateBundleComponent implements OnInit {
  isLoading = false;
  title: string;
  _ruleSetId: number;
  showWebButtons: boolean = false;
  bundleFormModal: Bundle = new Bundle();
  fileToUpload: File = null;
  numberRegex = "^(?:[0-9]+(?:\.[0-9]{0,8})?)?$";// "^((\\+91-?)|0)?[0-9]{0,2}$"; 
  fromDetail: boolean = false;
  percentReduced: boolean = false;
  weightWithContent: boolean = false;

  abilitiesList = [];
  selectedAbilities = [];
  spellsList = [];
  selectedSpells = [];
  metatags = [];
  uploadFromBing: boolean = false;
  bingImageUrl: string;
  bingImageExt: string;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  imageErrorMessage: string = ImageError.MESSAGE
  defaultImageSelected: string = '';
  button: string
  isFromCharacterId: any;
  SelectedItemsList: any[] = [];
  itemsList: any[] = [];
  isGM: boolean = false;

  options(placeholder?: string, initOnClick?: boolean): Object {
    return Utilities.optionsFloala(160, placeholder, initOnClick);
  }
  constructor(
    private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
    private sharedService: SharedService,
    private itemMasterService: ItemMasterService,
    private fileUploadService: FileUploadService,
    private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1));
    this.route.params.subscribe(params => { this._ruleSetId = params['id']; });


    this.sharedService.shouldUpdateAddItemMastersList().subscribe(sharedServiceJson => {
      if (sharedServiceJson) {
        if (sharedServiceJson.length) {

          sharedServiceJson.map((x) => {
            x.quantityToAdd = 1
            this.SelectedItemsList.push(x)
            this.quantityChanged();
          })

        }
      }
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.fromDetail = this.bsModalRef.content.fromDetail == undefined ? false : this.bsModalRef.content.fromDetail;
      this.title = this.bsModalRef.content.title;
      let _view = this.button = this.bsModalRef.content.button;
      let _bundleVM = this.bsModalRef.content.bundleVM;

      let isEditingWithoutDetail = this.bsModalRef.content.isEditingWithoutDetail ? true : false;
      if (isEditingWithoutDetail) {
        this.isLoading = true;
        this.itemMasterService.getBundleById<any[]>(_bundleVM)
          .subscribe(data => {
            if (data)
              _bundleVM = this.itemMasterService.bundleModelData(data, "UPDATE");
            let mod: any = data;
            //this.bundleItems = mod.itemMasterBundleItems;

            this.bundleFormModal = this.itemMasterService.bundleModelData(_bundleVM, _view);

            if (this.bsModalRef.content.button == 'UPDATE' || 'DUPLICATE') {
              this._ruleSetId = this.bsModalRef.content.rulesetID ? this.bsModalRef.content.rulesetID : this.bundleFormModal.ruleSetId;
            }
            else {
              this._ruleSetId = this.bundleFormModal.ruleSetId;
            }

            if (this.bundleFormModal.metatags !== '' && this.bundleFormModal.metatags !== undefined)
              this.metatags = this.bundleFormModal.metatags.split(",");
            this.bingImageUrl = this.bundleFormModal.bundleImage;

            this.initialize();

          }, error => {
            this.isLoading = false;
            let Errors = Utilities.ErrorDetail("", error);
            if (Errors.sessionExpire) {
              //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
              this.authService.logout(true);
            }
          }, () => { });

      } else {
        this.bundleFormModal = this.itemMasterService.bundleModelData(_bundleVM, _view);

        if (this.bsModalRef.content.button == 'UPDATE' || 'DUPLICATE') {
          this._ruleSetId = this.bsModalRef.content.rulesetID ? this.bsModalRef.content.rulesetID : this.bundleFormModal.ruleSetId;
        }
        else {
          this._ruleSetId = this.bundleFormModal.ruleSetId;
        }

        if (this.bundleFormModal.metatags !== '' && this.bundleFormModal.metatags !== undefined)
          this.metatags = this.bundleFormModal.metatags.split(",");
        this.bingImageUrl = this.bundleFormModal.bundleImage;

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

      if (!this.bundleFormModal.bundleImage) {
        this.defaultImageSelected = 'https://rpgsmithsa.blob.core.windows.net/stock-defimg-items/Backpack.jpg';
        //this.imageSearchService.getDefaultImage<any>('item')
        //  .subscribe(data => {
        //    this.defaultImageSelected = 'https://rpgsmithsa.blob.core.windows.net/stock-defimg-items/Backpack.jpg';
        //    //this.isLoading = false;
        //  }, error => {
        //  },
        //    () => { });
      }
      this.itemMasterService.getItemMasterByRuleset_add<any>(this._ruleSetId, false)
        .subscribe(data => {
          this.itemsList = data.ItemMaster;

          this.itemsList.forEach(function (val) { val.showIcon = false; val.selected = false; });
          if (this.bundleFormModal.view === VIEW.EDIT || this.bundleFormModal.view === VIEW.DUPLICATE) {
            this.itemMasterService.getBundleItems<any>(this.bundleFormModal.bundleId)
              .subscribe(data => {

                if (data) {
                  if (data.length) {
                    this.SelectedItemsList = [];
                    this.bundleFormModal.totalWeight = 0;
                    data.map((x) => {
                      let item = this.itemsList.filter(y => y.itemMasterId == x.itemMasterId)[0];
                      if (item) {
                        item.quantityToAdd = x.quantity;
                        this.SelectedItemsList.push(item)
                        this.quantityChanged();
                      }
                    });
                  }
                }

              }, error => {
                this.isLoading = false;
                let Errors = Utilities.ErrorDetail("", error);
                if (Errors.sessionExpire) {
                  //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                  this.authService.logout(true);
                }
              }, () => { });
          }
          this.isLoading = false;
        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
        }, () => { });

    }
  }

  itemRarity(_rarity: string) {
    this.bundleFormModal.rarity = _rarity;
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
  validateSubmit(itemMaster: any) {
    let tagsValue = this.metatags.map(x => {
      if (x.value == undefined) return x;
      else return x.value;
    });
    itemMaster.metatags = tagsValue.join(', ');

    if (itemMaster.ruleSetId == 0 || itemMaster.ruleSetId === undefined)
      itemMaster.ruleSetId = this._ruleSetId;


    this.isLoading = true;
    let _msg = itemMaster.bundleId == 0 || itemMaster.bundleId === undefined ? "Creating Bundle.." : "Updating Bundle..";
    if (this.bundleFormModal.view === VIEW.DUPLICATE) _msg = "Duplicating Bundle..";
    this.alertService.startLoadingMessage("", _msg);

    if (this.fileToUpload != null) {
      this.fileUpload(itemMaster);
    }
    else if (this.bingImageUrl !== this.bundleFormModal.bundleImage) {
      try {
        var regex = /(?:\.([^.]+))?$/;
        var extension = regex.exec(this.bundleFormModal.bundleImage)[1];
        extension = extension ? extension : 'jpg';
      } catch{ }
      this.fileUploadFromBing(this.bundleFormModal.bundleImage, extension, itemMaster);
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
            this.bundleFormModal.bundleImage = data.ImageUrl;
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
            this.bundleFormModal.bundleImage = data.ImageUrl;
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

  private submit(itemMaster) {
    if (!this.bundleFormModal.bundleImage) {
      this.bundleFormModal.bundleImage = 'https://rpgsmithsa.blob.core.windows.net/stock-defimg-items/Backpack.jpg';
      itemMaster.itemImage = 'https://rpgsmithsa.blob.core.windows.net/stock-defimg-items/Backpack.jpg';
    }
    //console.log(this.bundleFormModal.bundleImage);
    itemMaster.bundleItems = this.SelectedItemsList.map((x) => {

      return { itemMasterId: x.itemMasterId, quantity: x.quantityToAdd };
    })

    if (this.bundleFormModal.view === VIEW.DUPLICATE) {
      this.duplicateItemMaster(itemMaster);
    }
    else {
      if (this.defaultImageSelected && !this.bundleFormModal.bundleImage) {
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

    if (modal.bundleItems) {
      if (modal.bundleItems.length) {
        modal.bundleItems = modal.bundleItems.filter(x => x.quantity);
      }
    }

    this.isLoading = true;
    this.itemMasterService.createBundle<any>(modal)
      .subscribe(
        data => {

          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let message = modal.bundleId == 0 || modal.bundleId === undefined ? "Bundle has been created successfully." : "Bundle has been updated successfully.";
          //if (data !== "" && data !== null && data !== undefined && isNaN(parseInt(data))) message = data;
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.close();
          if (this.fromDetail) {
            if (data) {
              let id = data;
              if (!isNaN(parseInt(id))) {
                this.router.navigate(['/ruleset/detail-details', id]);
                this.event.emit({ bundleId: id });
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
            this.sharedService.updateItemMasterList(true);
          }
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = modal.bundleId == 0 || modal.bundleId === undefined ? "Unable to Create " : "Unable to Update ";
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

    if (modal.bundleItems) {
      if (modal.bundleItems.length) {
        modal.bundleItems = modal.bundleItems.filter(x => x.quantity);
      }
    }
    this.itemMasterService.duplicateBundle<any>(modal)
      .subscribe(
        data => {

          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let message = "Bundle has been duplicated successfully.";
          //if (data !== "" && data !== null && data !== undefined)
          //  message = data;
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.close();
          if (this.fromDetail) {
            this.router.navigate(['/ruleset/item-master', this._ruleSetId]);
          }
          else {
            this.sharedService.updateItemMasterList(true);
          }
        }, error => {
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
        this.bundleFormModal.bundleImage = event.target.result;
      }

      reader.readAsDataURL(event.target.files[0]);
      this.imageChangedEvent = event;
    }
  }

  close() {
    this.bsModalRef.hide();
    this.destroyModalOnInit();

  }
  addContainerItem(itemMaster: any) {

    this.bsModalRef = this.modalService.show(AddItemMasterComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });

    this.bsModalRef.content.rulesetId = this._ruleSetId;
    let ItemList = Object.assign([], this.itemsList);
    this.SelectedItemsList.map((x) => {
      ItemList = ItemList.filter(y => y.itemMasterId != x.itemMasterId);
    })
    this.bsModalRef.content.itemsList = ItemList;
  }
  quantityChanged() {
    let totalWeight: number = 0;

    this.SelectedItemsList.map((x) => {
      if (+x.quantityToAdd) {
        totalWeight += (+x.quantityToAdd * +x.weight);
      }
    })
    this.bundleFormModal.totalWeight = totalWeight;

  }
  removeItemFromBundle(item: any) {

    this.SelectedItemsList = this.SelectedItemsList.filter(x => x.itemMasterId != item.itemMasterId);
    this.quantityChanged();
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
    this.bsModalRef.content.errorImage = 'https://rpgsmithsa.blob.core.windows.net/stock-defimg-items/Backpack.jpg';
    //this.bsModalRef.content.imageChangedEvent = this.imageChangedEvent; //base 64 || URL
    this.bsModalRef.content.event.subscribe(data => {
      this.bundleFormModal.bundleImage = data.base64;
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

