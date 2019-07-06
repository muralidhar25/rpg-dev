import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { PlatformLocation } from '@angular/common';
import { MonsterTemplate } from '../../../core/models/view-models/monster-template.model';
import { ImageError, VIEW } from '../../../core/models/enums';
import { Utilities } from '../../../core/common/utilities';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SharedService } from '../../../core/services/shared.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { CommonService } from '../../../core/services/shared/common.service';
import { ImageSearchService } from '../../../core/services/shared/image-search.service';
import { FileUploadService } from '../../../core/common/file-upload.service';
import { MonsterTemplateService } from '../../../core/services/monster-template.service';
import { User } from '../../../core/models/user.model';
import { DBkeys } from '../../../core/common/db-keys';
import { DiceComponent } from '../../../shared/dice/dice/dice.component';
import { ImageSelectorComponent } from '../../../shared/image-interface/image-selector/image-selector.component';
import { DiceService } from '../../../core/services/dice.service';
import { AddItemMonsterComponent } from '../Add-items-monster/add-item-monster.component';
import { CustomDice } from '../../../core/models/view-models/custome-dice.model';
import { RulesetService } from '../../../core/services/ruleset.service';
import { SingleItemMonsterComponent } from '../single-item/single-item-monster.component';
import { randomization } from '../../../core/models/view-models/randomization.model ';
import { forEach } from '@angular/router/src/utils/collection';
import { debounce } from 'rxjs/operator/debounce';
import { isEmpty } from 'rxjs/operators';
import { ServiceUtil } from '../../../core/services/service-util';

@Component({
  selector: 'app-create-monster-template',
  templateUrl: './create-monster-template.component.html',
  styleUrls: ['./create-monster-template.component.scss']
})
export class CreateMonsterTemplateComponent implements OnInit {

  title: string;
  showWebButtons: boolean = false;
  isLoading = false;
  _ruleSetId: number;
  monsterTemplateFormModal: MonsterTemplate = new MonsterTemplate();
  fileToUpload: File = null;
  commandList = [];
  metatags = [];
  level = [];
  fromDetail: boolean = false;
  numberRegex = "^(?:[0-9]+(?:\.[0-9]{0,8})?)?$";// "^((\\+91-?)|0)?[0-9]{0,2}$"; 
  uploadFromBing: boolean = false;
  bingImageUrl: string;
  bingImageExt: string;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  imageErrorMessage: string = ImageError.MESSAGE;
  defaultImageSelected: string = '';
  button: string
  buffAndEffectsList = [];
  selectedBuffAndEffects = [];
  abilitiesList = [];
  selectedAbilities = [];
  spellsList = [];
  selectedSpells = [];
  associateMonsterTemplateList = [];
  selectedAssociateMonsterTemplates = [];
  SelectedItemsList = [];
  isCreatingFromMonsterScreen: boolean = false;
  customDices: CustomDice[] = [];

  randomizationInfo = [];
  randomization: randomization = new randomization();
  itemsList = [];
  selectedItems = [];

  options(placeholder?: string): Object {
    return Utilities.optionsFloala(160, placeholder);
  }

  constructor(
    private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
    private sharedService: SharedService, private commonService: CommonService,
    private monsterTemplateService: MonsterTemplateService,
    private fileUploadService: FileUploadService, private imageSearchService: ImageSearchService, private rulesetService: RulesetService,

    private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1));
    this.route.params.subscribe(params => { this._ruleSetId = params['id']; });

    this.sharedService.getCommandData().subscribe(diceCommand => {
      if (diceCommand.parentIndex === -1) {
        this.monsterTemplateFormModal.command = diceCommand.command;
      } else if (diceCommand.parentIndex === -2) {
        this.monsterTemplateFormModal.health = diceCommand.command;
      } else if (diceCommand.parentIndex === -3) {
        this.monsterTemplateFormModal.armorClass = diceCommand.command;
      } else if (diceCommand.parentIndex === -4) {
        this.monsterTemplateFormModal.challangeRating = diceCommand.command;
      } else if (diceCommand.parentIndex === -5) {
        this.monsterTemplateFormModal.xPValue = diceCommand.command;
      } else if (diceCommand.parentIndex === -6) {
        this.monsterTemplateFormModal.initiativeCommand = diceCommand.command;
      } else if (diceCommand.parentIndex <= -10) {
        debugger;
        let index = (diceCommand.parentIndex + 10) * -1 == -0 ? 0 : (diceCommand.parentIndex + 10) * -1;
        this.randomizationInfo[index].qty = diceCommand.command;
      } else {
        if (this.monsterTemplateFormModal.monsterTemplateCommandVM.length > 0) {
          this.monsterTemplateFormModal.monsterTemplateCommandVM.forEach(item => {
            var index = this.monsterTemplateFormModal.monsterTemplateCommandVM.indexOf(item);
            if (index === diceCommand.parentIndex) {
              this.monsterTemplateFormModal.monsterTemplateCommandVM[index].command = diceCommand.command;
            }
          });
        }
      }
    });
  }

  ngOnInit() {
    setTimeout(() => {
      debugger
      this.isCreatingFromMonsterScreen = this.bsModalRef.content.isCreatingFromMonsterScreen
      this.fromDetail = this.bsModalRef.content.fromDetail == undefined ? false : this.bsModalRef.content.fromDetail;
      this.title = this.bsModalRef.content.title;
      let _view = this.button = this.bsModalRef.content.button;
      let _monsterTemplateVM = this.bsModalRef.content.monsterTemplateVM;
      this.monsterTemplateFormModal = this.monsterTemplateService.MonsterTemplateModelData(_monsterTemplateVM, _view);
      if (this.isCreatingFromMonsterScreen && this.monsterTemplateFormModal.view == VIEW.DUPLICATE && this.bsModalRef.content.isCreatingFromMonsterDetailScreen) {
        this.monsterTemplateFormModal = this.monsterTemplateService.MonsterTemplateModelData(_monsterTemplateVM.monsterTemplate, _view);
        //this.monsterTemplateFormModal.randomizationEngine = [];
        //if (_monsterTemplateVM.monsterTemplate.monsterTemplateRandomizationEngine) {
        //  this.monsterTemplateFormModal.randomizationEngine = _monsterTemplateVM.monsterTemplate.monsterTemplateRandomizationEngine.map((re) => {

        //    var randomizationEngine: randomization = new randomization();
        //    randomizationEngine.randomizationEngineId = re.randomizationEngine.randomizationEngineId;
        //    randomizationEngine.percentage = re.randomizationEngine.percentage;
        //    randomizationEngine.sortOrder = re.randomizationEngine.sortOrder;
        //    randomizationEngine.itemMasterId = re.randomizationEngine.itemMasterId;
        //    randomizationEngine.isOr = re.randomizationEngine.isOr;
        //    randomizationEngine.isDeleted = re.randomizationEngine.isDeleted;
        //    randomizationEngine.qty = re.randomizationEngine.qty;
        //    randomizationEngine.selectedItem = [];
            
        //    randomizationEngine.selectedItem.push(
        //      {
        //        text: re.randomizationEngine.itemMaster?re.randomizationEngine.itemMaster.itemName:'',
        //        itemId: re.itemMasterId,
        //        image: re.randomizationEngine.itemMaster?re.randomizationEngine.itemMaster.itemImage:'',
        //      }
        //    );
            

        //    return randomizationEngine;

            
        //  });
        //}
        
      }

      this.selectedBuffAndEffects = this.monsterTemplateFormModal.monsterTemplateBuffAndEffects.map(x => { return x.buffAndEffect; });
      this.selectedAbilities = this.monsterTemplateFormModal.monsterTemplateAbilities.map(x => { return x.buffAndEffect; });
      this.selectedAssociateMonsterTemplates = this.monsterTemplateFormModal.monsterTemplateAssociateMonsterTemplates.map(x => { return x.buffAndEffect; });
      this.selectedSpells = this.monsterTemplateFormModal.monsterTemplateSpells.map(x => { return x.buffAndEffect; });

      try {
        if (this.monsterTemplateFormModal.metatags !== '' && this.monsterTemplateFormModal.metatags !== undefined)
          this.metatags = this.monsterTemplateFormModal.metatags.split(",");

      } catch (err) { }
      this.bingImageUrl = this.monsterTemplateFormModal.imageUrl;
      if (!this.monsterTemplateFormModal.imageUrl) {
        this.imageSearchService.getDefaultImage<any>('item')
          .subscribe(data => {
            this.defaultImageSelected = data.imageUrl.result
          }, error => {
          },
            () => { });
      }
      if (this.bsModalRef.content.button == 'UPDATE' || 'DUPLICATE') {
        this._ruleSetId = this.bsModalRef.content.rulesetID ? this.bsModalRef.content.rulesetID : this.monsterTemplateFormModal.ruleSetId;
      }
      else {
        this._ruleSetId = this.monsterTemplateFormModal.ruleSetId;
      }
      this.rulesetService.getCustomDice(this._ruleSetId)
        .subscribe(data => {
          this.customDices = data

        }, error => {
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        })
      this.initialize();
    }, 0);
  }

  private initialize() {

    //insert in randomizationInfo array
    let _randomization = new randomization();
    _randomization.percentage = null;
    _randomization.qty = null;
    this.randomizationInfo.push(_randomization);
    //this.randomizationInfo = [
    //  {
    //    isDeleted: undefined,
    //    isOr: null,
    //    itemMasterId: undefined,
    //    percentage: "30",
    //    qty: "7",
    //    randomizationEngineId: undefined,
    //    selectedItem: [
    //      { text: "1 loot", itemId: 8880, image: "https://rpgsmithsa.blob.core.windows.net/stock-defimg-items/Quiver.jpg" }
    //    ]
    //  },

    //  {
    //    isDeleted: undefined,
    //    isOr: true,
    //    itemMasterId: undefined,
    //    percentage: "1",
    //    qty: "7",
    //    randomizationEngineId: undefined,
    //    selectedItem: [
    //      { text: "1111 dup be", itemId: 8967, image: "https://rpgsmithsa.blob.core.windows.net/stock-defimg-items/Potion.jpg"}
    //    ]
    //  },
    //  {
    //    isDeleted: undefined,
    //    isOr: false,
    //    itemMasterId: undefined,
    //    percentage: "4",
    //    qty: "9",
    //    randomizationEngineId: undefined,
    //    selectedItem: [
    //      { text: "1111", itemId: 9005, image: "https://rpgsmithsa.blob.core.windows.net/stock-defimg-items/Armor.jpg" }
    //    ]
    //  }
    //];

    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      if (this.monsterTemplateFormModal.monsterTemplateId) {
        this.isLoading = true;
        this.monsterTemplateService.getMonsterTemplateAssociateRecords_sp<any>(this.monsterTemplateFormModal.monsterTemplateId, this._ruleSetId)
          .subscribe(data => {
            this.monsterTemplateFormModal.monsterTemplateCommandVM = data.monsterTemplateCommands;
            this.buffAndEffectsList = data.buffAndEffectsList;
            this.selectedBuffAndEffects = data.selectedBuffAndEffects;
            this.abilitiesList = data.abilityList;
            this.selectedAbilities = data.selectedAbilityList;
            this.spellsList = data.spellList;
            this.selectedSpells = data.selectedSpellList;
            this.associateMonsterTemplateList = data.monsterTemplatesList;

            this.selectedAssociateMonsterTemplates = data.selectedMonsterTemplates;
            debugger
            this.randomizationInfo = data.randomizationEngine;
            if (!this.randomizationInfo.length) {
              let _randomization = new randomization();
              _randomization.percentage = null;
              _randomization.qty = null;
              this.randomizationInfo.push(_randomization);
            } else {
              this.randomizationInfo.map((x) => {
                x.selectedItem = [];
              });
              this.randomizationInfo.map((x, index) => {
                if (index == 0) {
                  x.isOr = undefined;
                }
                x.selectedItem.push({ image: x.itemMaster.itemImage, itemId: x.itemMaster.itemMasterId, text: x.itemMaster.itemName })
              });
            }

            this.SelectedItemsList = data.selectedItemMasters.map((x) => {
              return { text: x.name, itemId: x.itemMasterId, image: x.imageUrl, quantity: x.qty }
            });
            this.isLoading = false;
          }, error => { }, () => { this.isLoading = false; });
      }
      else {
        this.isLoading = true;
        this.monsterTemplateService.getMonsterTemplateAssociateRecords_sp<any>(0, this._ruleSetId)
          .subscribe(data => {
            //  this.monsterTemplateFormModal.abilityCommandVM = data;
            this.buffAndEffectsList = data.buffAndEffectsList;
            this.abilitiesList = data.abilityList;
            this.spellsList = data.spellList;
            this.associateMonsterTemplateList = data.monsterTemplatesList;
            // this.selectedBuffAndEffects = data.selectedBuffAndEffects;
            this.isLoading = false;
          }, error => { }, () => { this.isLoading = false; });
      }
    }
  }

  addCommand(monsterTemplateCommand: any): void {
    debugger;
    let _monsterTemplateCommand = monsterTemplateCommand == undefined ? [] : monsterTemplateCommand;
    _monsterTemplateCommand.push({ monsterTemplateCommandId: 0, command: '', name: '' });
    this.monsterTemplateFormModal.monsterTemplateCommandVM = _monsterTemplateCommand;
    //this.monsterTemplateFormModal.monsterTemplateCommandVM = _monsterTemplateCommand;
  }

  removeCommand(command: any): void {
    this.monsterTemplateFormModal.monsterTemplateCommandVM
      .splice(this.monsterTemplateFormModal.monsterTemplateCommandVM.indexOf(command), 1);
  }

  //setEnableDisable(checked: boolean) {
  //    this.monsterTemplateFormModal.isEnabled = checked;
  //}

  //setCharacterEnableDisable(checked: boolean) {
  //    this.isFromCharacterAbilityEnable = checked;
  //}

  fileInput(_files: FileList) {
    this.fileToUpload = _files.item(0);
    this.showWebButtons = false;
  }
  removeTag(tagData: any, tag: any, index: number): void {
    tagData.splice(index, 1);
  }
  validateImageSize() {
    if ((this.fileToUpload.size / 1024) <= 250) {
      return true;
    }
    return false;
  }
  validateSubmit(monsterTemplate: MonsterTemplate) {
    //if (ability.maxNumberOfUses && ability.currentNumberOfUses) {
    //    if (ability.currentNumberOfUses > ability.maxNumberOfUses) {
    //        this.alertService.showMessage("", "Current number of uses cannot be greater than max number of uses.", MessageSeverity.error);
    //        return false;
    //    }
    //}

    //monsterTemplate.isFromCharacterAbilityId = ability.isFromCharacterAbilityId;

    if (monsterTemplate.ruleSetId === 0 || monsterTemplate.ruleSetId === undefined)
      monsterTemplate.ruleSetId = this._ruleSetId;

    monsterTemplate.monsterTemplateBuffAndEffectVM = this.selectedBuffAndEffects.map(x => {
      return { buffAndEffectId: x.buffAndEffectId, monsterTemplateId: monsterTemplate.monsterTemplateId };
    });
    monsterTemplate.monsterTemplateAbilityVM = this.selectedAbilities.map(x => {
      return { abilityId: x.abilityId, monsterTemplateId: monsterTemplate.monsterTemplateId };
    });
    monsterTemplate.monsterTemplateSpellVM = this.selectedSpells.map(x => {
      return { spellId: x.spellId, monsterTemplateId: monsterTemplate.monsterTemplateId };
    });
    monsterTemplate.monsterTemplateAssociateMonsterTemplateVM = this.selectedAssociateMonsterTemplates.map(x => {
      return { associateMonsterTemplateId: x.monsterTemplateId, monsterTemplateId: monsterTemplate.monsterTemplateId };
    });
    monsterTemplate.monsterTemplateItemMasterVM = this.SelectedItemsList.map(x => {
      return { itemMasterId: x.itemId, qty: x.quantity, monsterTemplateId: monsterTemplate.monsterTemplateId };
    });


    this.isLoading = true;
    let _msg = monsterTemplate.monsterTemplateId === 0 || monsterTemplate.monsterTemplateId === undefined ? "Creating Monster Template.." : "Updating Monster Template..";
    if (this.monsterTemplateFormModal.view === VIEW.DUPLICATE) _msg = "Duplicating Monster Template..";
    this.alertService.startLoadingMessage("", _msg);

    let tagsValue = this.metatags.map(x => {
      debugger;
      if (x.value == undefined) return x;
      else return x.value;
    });
    monsterTemplate.metatags = tagsValue.join(', ');

    let levelValue = this.level.map(x => {
      if (x.value == undefined) return x;
      else return x.value;
    });


    if (this.fileToUpload != null) {
      this.fileUpload(monsterTemplate);
    }
    else if (this.bingImageUrl !== this.monsterTemplateFormModal.imageUrl) {
      try {
        var regex = /(?:\.([^.]+))?$/;
        var extension = regex.exec(this.monsterTemplateFormModal.imageUrl)[1];
        extension = extension ? extension : 'jpg';
      } catch{ }
      this.fileUploadFromBing(this.monsterTemplateFormModal.imageUrl, extension, monsterTemplate);
    }
    else {
      this.submit(monsterTemplate);
    }


  }
  submitForm(monsterTemplate: MonsterTemplate) {
    monsterTemplate.randomizationEngine = [];    this.randomizationInfo.map((x: randomization, index) => {      //let _randomization = new randomization(undefined, +x.percentage, +x.sortOrder, +x.itemMasterId, x.isOr, x.isDeleted, +x.qty,undefined,undefined);      //monsterTemplate.randomizationEngine.push(_randomization1);      let _randomization1 = new randomization();      _randomization1.percentage = +x.percentage;      _randomization1.qty = x.qty;      _randomization1.isOr = x.isOr ? true : false;      //_randomization1.randomizationEngineId = x.randomizationEngineId;      if (x.selectedItem) {
        if (x.selectedItem.length) {
          _randomization1.itemMasterId = +x.selectedItem[0].itemId;
        }

      }      _randomization1.sortOrder = index;      monsterTemplate.randomizationEngine.push(_randomization1);    })    this.randomizationInfo;    //for validation of randomization    let validate = this.validateRandomization(monsterTemplate);

    if (validate) {
      this.validateSubmit(monsterTemplate);
    }
  }
  private fileUploadFromBing(file: string, ext: string, monsterTemplate: any) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout(true);
    else {
      this.fileUploadService.fileUploadFromURL<any>(user.id, file, ext)
        .subscribe(
          data => {
            this.monsterTemplateFormModal.imageUrl = data.ImageUrl;
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
            this.monsterTemplateFormModal.imageUrl = data.ImageUrl;
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

  private submit(monsterTemplate: any) {
    debugger
    if (this.monsterTemplateFormModal.view === VIEW.DUPLICATE) {
      this.duplicateMonsterTemplate(monsterTemplate);
    }
    //else if (this.monsterTemplateFormModal.view === VIEW.EDIT && this.isFromCharacter) {
    //this.enableAbility(this.isFromCharacterAbilityId, this.isFromCharacterAbilityEnable);
    //}
    else {
      if (this.defaultImageSelected && !this.monsterTemplateFormModal.imageUrl) {
        let model = Object.assign({}, monsterTemplate)
        model.imageUrl = this.defaultImageSelected
        this.addEditMonsterTemplate(model);
      } else {
        this.addEditMonsterTemplate(monsterTemplate);
      }

    }
  }

  private addEditMonsterTemplate(modal: MonsterTemplate) {
    debugger
    modal.ruleSetId = this._ruleSetId;
    this.isLoading = true;
    let armorClass: number = 0;
    let health: number = 0;
    let challangeRating: number = 0;
    let xpValue: number = 0;
    let reItems: any;
    if (this.isCreatingFromMonsterScreen) {
      armorClass = modal.armorClass ? DiceService.rollDiceExternally(this.alertService, modal.armorClass, this.customDices) : 0;
      health = modal.health ? DiceService.rollDiceExternally(this.alertService, modal.health, this.customDices) : 0;
      challangeRating = modal.challangeRating ? DiceService.rollDiceExternally(this.alertService, modal.challangeRating, this.customDices) : 0;
      xpValue = modal.xPValue ? DiceService.rollDiceExternally(this.alertService, modal.xPValue, this.customDices) : 0;
      modal.REitems = ServiceUtil.getItemsFromRandomizationEngine(modal.randomizationEngine, this.alertService);
      if (modal.REitems && modal.REitems.length) {
        modal.REitems.map((re) => {
          re.deployCount = 1;
        });
      }
    }
    this.monsterTemplateService.createMonsterTemplate<any>(modal, this.isCreatingFromMonsterScreen, armorClass, health, challangeRating, xpValue)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let message = modal.monsterTemplateId == 0 || modal.monsterTemplateId === undefined ? "Monster Template has been created successfully." : "Monster Template has been updated successfully.";
          //if (data !== "" && data !== null && data !== undefined && isNaN(parseInt(data))) message = data;
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.close();

          //if (this.fromDetail)
          // this.router.navigate(['/ruleset/ability-details', modal.abilityId]);
          if (this.fromDetail) {
            if (data) {
              let id = data;
              if (!isNaN(parseInt(id))) {
                this.router.navigate(['/ruleset/monster-template-details', id]);
                this.event.emit({ monsterTemplateId: id });
                //this.sharedService.updateItemMasterDetailList(true);
              }
              else {

                this.sharedService.updateMonsterTemplateList(true);
                this.sharedService.updateMonsterList(true);

              }
            }
            else {
              this.sharedService.updateMonsterTemplateList(true);
              this.sharedService.updateMonsterList(true);
            }
          }
          else {
            this.sharedService.updateMonsterTemplateList(true);
            this.sharedService.updateMonsterList(true);
          }
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = modal.monsterTemplateId == 0 || modal.monsterTemplateId === undefined ? "Unable to Create " : "Unable to Update ";
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

  private duplicateMonsterTemplate(modal: MonsterTemplate) {
    modal.ruleSetId = this._ruleSetId;
    this.isLoading = true;
    let armorClass: number = 0;
    let health: number = 0;
    let challangeRating: number = 0;
    let xpValue: number = 0;

    //let reItems: any;
    //if (this.isCreatingFromMonsterScreen) {
    //  armorClass = modal.armorClass ? DiceService.rollDiceExternally(this.alertService, modal.armorClass, this.customDices) : 0;
    //  health = modal.health ? DiceService.rollDiceExternally(this.alertService, modal.health, this.customDices) : 0;
    //  challangeRating = modal.challangeRating ? DiceService.rollDiceExternally(this.alertService, modal.challangeRating, this.customDices) : 0;
    //  xpValue = modal.xPValue ? DiceService.rollDiceExternally(this.alertService, modal.xPValue, this.customDices) : 0;
      
    //}
    if (this.isCreatingFromMonsterScreen) {
      armorClass = modal.armorClass ? DiceService.rollDiceExternally(this.alertService, modal.armorClass, this.customDices) : 0;
      health = modal.health ? DiceService.rollDiceExternally(this.alertService, modal.health, this.customDices) : 0;
      challangeRating = modal.challangeRating ? DiceService.rollDiceExternally(this.alertService, modal.challangeRating, this.customDices) : 0;
      xpValue = modal.xPValue ? DiceService.rollDiceExternally(this.alertService, modal.xPValue, this.customDices) : 0;
      modal.REitems = ServiceUtil.getItemsFromRandomizationEngine(modal.randomizationEngine, this.alertService);
      if (modal.REitems && modal.REitems.length) {
        modal.REitems.map((re) => {
          re.deployCount = 1;
        });
      }
    }
    this.monsterTemplateService.duplicateMonsterTemplate<any>(modal, this.isCreatingFromMonsterScreen, armorClass, health, challangeRating, xpValue)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let message = "Monster Template has been duplicated successfully.";
          if (data !== "" && data !== null && data !== undefined) message = data;
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.close();
          this.sharedService.updateMonsterTemplateList(true);

          this.sharedService.updateMonsterList(true);
          //this.sharedService.UpdateCharacterAbilityList(true);
          if (this.fromDetail)
            this.router.navigate(['/ruleset/monster-template', this._ruleSetId]);

        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = "Unable to Duplicate ";
          let Errors = Utilities.ErrorDetail(_message, error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

        });
  }

  //private enableAbility(characterAbilityId: number, isEnabled: boolean) {

  //    this.isLoading = true;
  //    let enableTxt = isEnabled ? 'Enable' : 'Disable';
  //    this.alertService.startLoadingMessage("", enableTxt + " an Ability");

  //    this.charactermonsterTemplateService.toggleEnableCharacterAbility(characterAbilityId)
  //        .subscribe(
  //            data => {
  //                this.isLoading = false;
  //                this.alertService.stopLoadingMessage();
  //                this.alertService.showMessage("Ability has been " + enableTxt + "d successfully.", "", MessageSeverity.success);
  //                this.bsModalRef.hide();
  //                this.sharedService.UpdateCharacterAbilityList(true);
  //            },
  //            error => {
  //                this.isLoading = false;
  //                this.alertService.stopLoadingMessage();
  //                let Errors = Utilities.ErrorDetail("Unable to " + enableTxt, error);
  //                if (Errors.sessionExpire) {
  //                    this.authService.logout(true);
  //                }
  //                else
  //                    this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
  //            });
  //}

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
        this.monsterTemplateFormModal.imageUrl = event.target.result;
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
    this.bsModalRef.content.characterId = 0;
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
    this.bsModalRef.content.title = 'monsterTemplate';
    this.bsModalRef.content.image = img;
    this.bsModalRef.content.view = view;
    this.bsModalRef.content.errorImage = '../assets/images/DefaultImages/Item.jpg';
    //this.bsModalRef.content.imageChangedEvent = this.imageChangedEvent; //base 64 || URL
    this.bsModalRef.content.event.subscribe(data => {
      this.monsterTemplateFormModal.imageUrl = data.base64;
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
      classes: "myclass custom-class ",
      showCheckbox: true,
      position: "top"
    };
  }
  get spellsSettings() {
    return {
      primaryKey: "spellId",
      labelKey: "name",
      text: "Search spell(s)",
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
  get associateMonsterTemplatesSettings() {
    return {
      primaryKey: "monsterTemplateId",
      labelKey: "name",
      text: "Search Monster(s)",
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

  get listSettings() {
    return {
      primaryKey: "itemMasterId",
      labelKey: "name",
      text: "Search Item",
      enableCheckAll: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: false,
      limitSelection: false,
      enableSearchFilter: true,
      classes: "myclass custom-class ",
      showCheckbox: true,
      position: "bottom"
    }
  }


  getHealthResult(e) {
    debugger
  }
  getArmorClassResult(e) {
    debugger
  }
  getChallangeRatingResult(e) {
    debugger
  }
  getXPValueResult(e) {
    debugger
  }
  isValidSingleNumberCommand(command, randomization_Item = undefined) {
    if (command) {
        if (command.toLowerCase().indexOf(' and') > -1) {
        if (randomization_Item) {
          randomization_Item.isValidQty = false;
        }
        return false;
      }
      if (command.indexOf('"') > -1) {
        if (randomization_Item) {
          randomization_Item.isValidQty = false;
        }
        return false;
      }
      if (command.indexOf("'") > -1) {
        if (randomization_Item) {
          randomization_Item.isValidQty = false;
        }
        return false;
      }
    }
    try {
      let number = DiceService.rollDiceExternally(this.alertService, command, this.customDices);
      if (isNaN(number)) {
        if (randomization_Item) {
          randomization_Item.isValidQty = false;
        }
        return false;
      }
      else {
        if (randomization_Item) {
          randomization_Item.isValidQty = true;
        }
        return true;
      }
    }
    catch (e) {
      if (randomization_Item) {
        randomization_Item.isValidQty = false;
      }
      return false;
    }
  }
  selectedBuffAndEffectsListChanged(item) {
  }
  SelectBuffAndEffects() {

    this.bsModalRef = this.modalService.show(AddItemMonsterComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Add Items';
    this.bsModalRef.content.button = 'ADD';
    //this.bsModalRef.content.itemVM = { characterId: this.characterId };
    //this.bsModalRef.content.characterItems = this.ItemsList;

    this.bsModalRef.content.rulesetID = this._ruleSetId;
    this.bsModalRef.content.SelectedItemsList = this.SelectedItemsList;
    // this.bsModalRef.content.characterID = this.characterId;

    this.bsModalRef.content.event.subscribe(data => {
      if (data) {
        this.SelectedItemsList = data;
      }
    });

  }

  isValidQuantity() {
    // debugger;
    let res: boolean = false;
    this.randomizationInfo.forEach(item => {
      if (!item.isValidQty) {
        res = true;
      }
    });
    return res;
  }

  percentage(e, item) {
    item.percentage = e.target.value;
  }
  quantity(e, item) {
    item.qty = e.target.value;
  }

  commonOR(i) {
    let _randomization = new randomization();    _randomization.percentage = null;    _randomization.qty = null;    _randomization.isOr = true;    _randomization.selectedItem = [];    let index = i + 1;    _randomization.sortOrder = index;    this.randomizationInfo.splice(index, 0, _randomization);
  }

  // Parent OR method
  randomizationOR(i) {
    this.commonOR(i);
  }

  // Child or method
  randomizationOr(i) {    this.commonOR(i);    //console.log(i);    //if (i) {    //  let _randomization = new randomization();    //  _randomization.isOr = true;    //  _randomization.selectedItem = [];    //  let index = i + 1;    //  console.log('inif', index);    //  _randomization.sortOrder = index;    //  this.randomizationInfo.splice(index, 0, _randomization);    //  console.log(this.randomizationInfo);    //} else {    //  let _randomization = new randomization();    //  _randomization.isOr = true;    //  _randomization.sortOrder = i;    //  _randomization.selectedItem = [];    //  this.randomizationInfo.push(_randomization);    //  //this.randomizationInfo.splice(1, 0, _randomization);    //  console.log('randomizationInfo', this.randomizationInfo);    //}  }  randomizationAnd() {    let _randomization = new randomization();    _randomization.percentage = null;    _randomization.qty = null;    _randomization.isOr = false;    this.randomizationInfo.push(_randomization);  }  removeRandom(item, index) {    if (index > -1) {      this.randomizationInfo.splice(index, 1);    }  }  SelectItem(item, i) {    this.bsModalRef = this.modalService.show(SingleItemMonsterComponent, {      class: 'modal-primary modal-md',      ignoreBackdropClick: true,      keyboard: false    });    this.bsModalRef.content.title = 'Add Item';    this.bsModalRef.content.button = 'ADD';    this.bsModalRef.content.rulesetID = this._ruleSetId;    this.bsModalRef.content.SelectedItems = item.selectedItem;    this.bsModalRef.content.event.subscribe(data => {      if (data) {        item.selectedItem = data;      }    });  }  validateRandomization(mt) {    let total: number = 0;    for (let i = 0; i < this.randomizationInfo.length; i++) {      if (this.randomizationInfo[i].selectedItem == null && mt.isRandomizationEngine) {        let message = "Please select item and try again.";
        this.alertService.showMessage(message, "", MessageSeverity.error);
        return false;
      }      else if (this.randomizationInfo[i].isOr == true || this.randomizationInfo[i].isOr == null) {        total += +this.randomizationInfo[i].percentage;        if (total > 100) {          let message = "Total percent chance for a section can't exceed 100%, Please adjust these values and try again.";          this.alertService.showMessage(message, "", MessageSeverity.error);          return false;        }      } else {        if (total > 100) {          let message = "Total percent chance for a section can't exceed 100%, Please adjust these values and try again.";          this.alertService.showMessage(message, "", MessageSeverity.error);          return false;        } else {          total = 0;          total = this.randomizationInfo[i].percentage;          return true;        }      }      return true;    }  }
}
