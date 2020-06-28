import { Component, OnInit, OnDestroy, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { ImageError, VIEW } from '../../../core/models/enums';
import { Utilities } from '../../../core/common/utilities';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SharedService } from '../../../core/services/shared.service';
import { AbilityService } from '../../../core/services/ability.service';
import { FileUploadService } from '../../../core/common/file-upload.service';
import { CommonService } from '../../../core/services/shared/common.service';
import { ImageSearchService } from '../../../core/services/shared/image-search.service';
import { SpellsService } from '../../../core/services/spells.service';
import { User } from '../../../core/models/user.model';
import { DBkeys } from '../../../core/common/db-keys';
import { DiceComponent } from '../../../shared/dice/dice/dice.component';
import { ImageSelectorComponent } from '../../../shared/image-interface/image-selector/image-selector.component';
import { PlatformLocation } from '@angular/common';
import { Bundle } from '../../../core/models/view-models/bundle.model';
import { MonsterTemplateService } from '../../../core/services/monster-template.service';
import { AddMonsterComponent } from '../../monster/Add-monster/add-monster.component';
import { AddMonsterTemplateComponent } from '../add-monster-template/add-monster-template.component';

@Component({
  selector: 'app-monster-group',
  templateUrl: './monster-group.component.html',
  styleUrls: ['./monster-group.component.scss']
})


export class CreateMonsterGroupComponent implements OnInit {
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
  SelectedMonstersList: any[] = [];
  monstersList: any[] = [];

  addToCombat: boolean = false;
  isGM: boolean = false;

  options(placeholder?: string, initOnClick?: boolean): Object {
    return Utilities.optionsFloala(160, placeholder, initOnClick);
  }
  constructor(
    private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
    private sharedService: SharedService, private commonService: CommonService, private abilityService: AbilityService,
    private monsterTemplateService: MonsterTemplateService, private spellsService: SpellsService,
    private fileUploadService: FileUploadService, private imageSearchService: ImageSearchService,
    private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1));
    this.route.params.subscribe(params => { this._ruleSetId = params['id']; });


    this.sharedService.shouldUpdateAddMonsterTemplatesList().subscribe(sharedServiceJson => {
      if (sharedServiceJson) {
        if (sharedServiceJson.length) {
          
          sharedServiceJson.map((x) => {
            x.quantityToAdd = 1
            this.SelectedMonstersList.push(x)
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
        this.monsterTemplateService.getBundleById<any[]>(_bundleVM)
          .subscribe(data => {
            if (data)
              _bundleVM = this.monsterTemplateService.bundleModelData(data, "UPDATE");
            let mod: any = data;
            //this.bundleItems = mod.monsterTemplateBundleItems;

            this.bundleFormModal = this.monsterTemplateService.bundleModelData(_bundleVM, _view);
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
        this.bundleFormModal = this.monsterTemplateService.bundleModelData(_bundleVM, _view);
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
        this.defaultImageSelected = './assets/images/DefaultImages/monster.jpg';
        //this.imageSearchService.getDefaultImage<any>('item')
        //  .subscribe(data => {
        //    this.defaultImageSelected = './assets/images/DefaultImages/monster.jpg';
        //    //this.isLoading = false;
        //  }, error => {
        //  },
        //    () => { });
      }
      this.monsterTemplateService.getMonsterTemplateByRuleset_add<any>(this._ruleSetId, false)
        .subscribe(data => {
          this.monstersList = data.MonsterTemplate;
          this.monstersList.forEach(function (val) { val.showIcon = false; val.selected = false; });
          if (this.bundleFormModal.view === VIEW.EDIT || this.bundleFormModal.view === VIEW.DUPLICATE) {
            this.monsterTemplateService.getBundleItems<any>(this.bundleFormModal.bundleId)
              .subscribe(data => {
                
                if (data) {
                  if (data.length) {
                    this.SelectedMonstersList = [];
                    this.bundleFormModal.totalWeight = 0;
                    data.map((x) => {
                      let item = this.monstersList.filter(y => y.monsterTemplateId == x.monsterTemplateId)[0];
                      item.quantityToAdd = x.quantity;
                      this.SelectedMonstersList.push(item)
                      this.quantityChanged();
                    })
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
  validateSubmit(monsterTemplate: any) { 
    let tagsValue = this.metatags.map(x => {
      if (x.value == undefined) return x;
      else return x.value;
    });
    monsterTemplate.metatags = tagsValue.join(', ');

    if (monsterTemplate.ruleSetId == 0 || monsterTemplate.ruleSetId === undefined)
      monsterTemplate.ruleSetId = this._ruleSetId;   
    
    this.isLoading = true;
    let _msg = monsterTemplate.bundleId == 0 || monsterTemplate.bundleId === undefined ? "Creating Group.." : "Updating Group..";
    if (this.bundleFormModal.view === VIEW.DUPLICATE) _msg = "Duplicating Group..";
    this.alertService.startLoadingMessage("", _msg);

    if (this.fileToUpload != null) {
      this.fileUpload(monsterTemplate);
    }
    else if (this.bingImageUrl !== this.bundleFormModal.bundleImage) {
      try {
        var regex = /(?:\.([^.]+))?$/;
        var extension = regex.exec(this.bundleFormModal.bundleImage)[1];
        extension = extension ? extension : 'jpg';
      } catch{ }
      this.fileUploadFromBing(this.bundleFormModal.bundleImage, extension, monsterTemplate);
    }
    else {
      this.submit(monsterTemplate);
    }
  }
  submitForm(monsterTemplate: any) {
    this.validateSubmit(monsterTemplate);
  }

  private fileUploadFromBing(file: string, ext: string, monsterTemplate: any) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout(true);
    else {
      this.fileUploadService.fileUploadFromURL<any>(user.id, file, ext)
        .subscribe(
          data => {
            this.bundleFormModal.bundleImage = data.ImageUrl;
            //this.rulesetFormModal.thumbnailUrl = data.ThumbnailUrl;
            this.submit(monsterTemplate);
          },
          error => {
            let Errors = Utilities.ErrorDetail('Error', error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            } else this.submit(monsterTemplate);
          });
    }
  }

  private fileUpload(monsterTemplate: any) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout(true);
    else {
      this.fileUploadService.fileUploadByUser<any>(user.id, this.fileToUpload)
        .subscribe(
          data => {
            this.bundleFormModal.bundleImage = data.ImageUrl;
            this.submit(monsterTemplate);
          },
          error => {
            let Errors = Utilities.ErrorDetail('Error', error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            } else this.submit(monsterTemplate);
          });
    }
  }

  private fileUploadOLD(monsterTemplate: any) {
    //file upload
    this.monsterTemplateService.fileUpload(this.fileToUpload)
      .subscribe(
        data => {
          monsterTemplate.imageUrl = data.ImageUrl;
          this.submit(monsterTemplate);
        },
        error => {
          this.submit(monsterTemplate);
        });
  }

  private submit(monsterTemplate) {
    if (!this.bundleFormModal.bundleImage) {
      this.bundleFormModal.bundleImage = './assets/images/DefaultImages/monster.jpg';
      monsterTemplate.imageUrl = './assets/images/DefaultImages/monster.jpg';
    }
    //console.log(this.bundleFormModal.bundleImage);
    monsterTemplate.bundleItems = this.SelectedMonstersList.map((x) => {
      
      return { monsterTemplateId: x.monsterTemplateId, quantity: x.quantityToAdd};
    })
    
    if (this.bundleFormModal.view === VIEW.DUPLICATE) {
      this.duplicateMonsterTemplate(monsterTemplate);
    }
    else {
      if (this.defaultImageSelected && !this.bundleFormModal.bundleImage) {
        let model = Object.assign({}, monsterTemplate)
        model.imageUrl = this.defaultImageSelected
        this.addEditMonsterTemplate(model);
      } else {
        this.addEditMonsterTemplate(monsterTemplate);
      }

    }
  }

  addEditMonsterTemplate(modal: any) {
    modal.RuleSetId = this._ruleSetId;
    // modal.userID = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER).id
    
    if (modal.bundleItems) {
      if (modal.bundleItems.length) {
        modal.bundleItems = modal.bundleItems.filter(x => x.quantity);
      }
    }
    
    this.isLoading = true;
    this.monsterTemplateService.createBundle<any>(modal)
      .subscribe(
      data => {
          
          this.isLoading = false;
        this.alertService.stopLoadingMessage();
        let message = modal.bundleId == 0 || modal.bundleId === undefined ? "Group has been created successfully." : "Group has been updated successfully.";
          //if (data !== "" && data !== null && data !== undefined && isNaN(parseInt(data))) message = data;
          this.alertService.showMessage(message, "", MessageSeverity.success);
        this.close();
          if (this.fromDetail) {
            if (data) {
              let id = data;
              if (!isNaN(parseInt(id))) {
                this.router.navigate(['/ruleset/detail-details', id]);
                this.event.emit({ bundleId: id });
              }
              else
                this.sharedService.updateMonsterTemplateDetailList(true);
              this.sharedService.updateMonsterTemplateList(true);
            }
            else {
              this.sharedService.updateMonsterTemplateDetailList(true);
              this.sharedService.updateMonsterTemplateList(true);
            }
          }
          else
            this.sharedService.updateMonsterTemplateList(true);
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

  duplicateMonsterTemplate(modal: any) {
    modal.RuleSetId = this._ruleSetId;
    this.isLoading = true;
    
    if (modal.bundleItems) {
      if (modal.bundleItems.length) {
        modal.bundleItems = modal.bundleItems.filter(x => x.quantity);
      }
    }
    this.monsterTemplateService.duplicateBundle<any>(modal)
      .subscribe(
      data => {
          
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let message = "Group has been duplicated successfully.";
          //if (data !== "" && data !== null && data !== undefined)
          //  message = data;
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.close();
          if (this.fromDetail)
            this.router.navigate(['/ruleset/monster-template', this._ruleSetId]);
        else
            this.sharedService.updateMonsterTemplateList(true);
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
  addContainerItem(monsterTemplate: any) {
    
    this.bsModalRef = this.modalService.show(AddMonsterTemplateComponent, {
        class: 'modal-primary modal-md',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef.content.title = 'Add Monsters';
      this.bsModalRef.content.button = 'ADD';
    this.bsModalRef.content.rulesetID = this._ruleSetId;

    let MonsterList = Object.assign([], this.monstersList);
    this.SelectedMonstersList.map((x) => {
      MonsterList = MonsterList.filter(y => y.monsterTemplateId != x.monsterTemplateId);
    })
    this.bsModalRef.content.itemsList = MonsterList;


    //this.bsModalRef = this.modalService.show(AddItemMasterComponent, {
    //  class: 'modal-primary modal-md',
    //  ignoreBackdropClick: true,
    //  keyboard: false
    //});

    //this.bsModalRef.content.rulesetId = this._ruleSetId;
    //let ItemList = Object.assign([], this.itemsList);
    //this.SelectedItemsList.map((x) => {
    //  ItemList = ItemList.filter(y => y.itemMasterId != x.itemMasterId);
    //})
    //this.bsModalRef.content.itemsList = ItemList;
  }
  quantityChanged() {
    let totalWeight:number = 0;

    this.SelectedMonstersList.map((x) => {
      if (+x.quantityToAdd) {
        totalWeight += (+x.quantityToAdd * +x.weight);
      }
    })
    this.bundleFormModal.totalWeight = totalWeight;
    
  }
  removeItemFromBundle(monsterTemplate: any) {
    
    this.SelectedMonstersList = this.SelectedMonstersList.filter(x => x.monsterTemplateId != monsterTemplate.monsterTemplateId);
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
    this.bsModalRef.content.errorImage = './assets/images/DefaultImages/monster.jpg';
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

  AddtoCombat(event) {
    this.bundleFormModal.addToCombat = event.target.checked;
  }
}

