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
import { ImageSearchService } from '../../../core/services/shared/image-search.service';
import { FileUploadService } from '../../../core/common/file-upload.service';
import { MonsterTemplateService } from '../../../core/services/monster-template.service';
import { User } from '../../../core/models/user.model';
import { DBkeys } from '../../../core/common/db-keys';
import { DiceComponent } from '../../../shared/dice/dice/dice.component';
import { ImageSelectorComponent } from '../../../shared/image-interface/image-selector/image-selector.component';
import { DiceService } from '../../../core/services/dice.service';
import { CustomDice } from '../../../core/models/view-models/custome-dice.model';
import { RulesetService } from '../../../core/services/ruleset.service';
import { AddItemsForMonstersOnlyComponent } from '../add-items-for-monster/add-items-for-monster.component';
import { AppService1 } from '../../../app.service';
import { CommonService } from '../../../core/services/shared/common.service';

@Component({
  selector: 'app-edit-monster',
  templateUrl: './edit-monster.component.html',
  styleUrls: ['./edit-monster.component.scss']
})
export class EditMonsterComponent implements OnInit {

  title: string;
  showWebButtons: boolean = false;
  isLoading = false;
  _ruleSetId: number;
  monsterFormModal: MonsterTemplate = new MonsterTemplate();
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
  customDices: CustomDice[] = [];

  monsterItemsList = [];
  selectedMonsterItems = [];
  monsterDetail: any;
  isGM: boolean = false;
  addToCombat: boolean = false;
  characterId: number;
  isGM_Only: boolean = false;
  isFromCombatScreen: boolean = false;
  ruleSet: any;
  currencyList = [];

  options(placeholder?: string): Object {
    return Utilities.optionsFloala(160, placeholder);
  }

  constructor(
    private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
    private sharedService: SharedService,
    private monsterTemplateService: MonsterTemplateService, private appService: AppService1,
    private fileUploadService: FileUploadService, private imageSearchService: ImageSearchService, private rulesetService: RulesetService,
    private location: PlatformLocation, private commonService: CommonService) {
    location.onPopState(() => this.modalService.hide(1));
    this.route.params.subscribe(params => { this._ruleSetId = params['id']; });

    this.sharedService.getCommandData().subscribe(diceCommand => {

      if (diceCommand.parentIndex === -1) {
        this.monsterFormModal.command = diceCommand.command;
      } else if (diceCommand.parentIndex === -2) {
        this.monsterFormModal.initiativeCommand = diceCommand.command;
      } else if (diceCommand.parentIndex === -21) {
        this.monsterFormModal.gold = diceCommand.command;
      } else if (diceCommand.parentIndex === -22) {
        this.monsterFormModal.silver = diceCommand.command;
      } else if (diceCommand.parentIndex === -23) {
        this.monsterFormModal.copper = diceCommand.command;
      } else if (diceCommand.parentIndex === -24) {
        this.monsterFormModal.platinum = diceCommand.command;
      } else if (diceCommand.parentIndex === -25) {
        this.monsterFormModal.electrum = diceCommand.command;
      } else {
        if (this.monsterFormModal.monsterTemplateCommandVM.length > 0) {
          this.monsterFormModal.monsterTemplateCommandVM.forEach(item => {
            var index = this.monsterFormModal.monsterTemplateCommandVM.indexOf(item);
            if (index === diceCommand.parentIndex) {
              this.monsterFormModal.monsterTemplateCommandVM[index].command = diceCommand.command;
            }
          });
        }
      }
    });

  }

  ngOnInit() {
    setTimeout(() => {
      let _view = this.button = this.bsModalRef.content.button;
      let monsterId = this.bsModalRef.content.monsterVM;
      let isEditingWithoutDetail = this.bsModalRef.content.isEditingWithoutDetail ? true : false;
      this.isGM_Only = this.bsModalRef.content.isGM_Only;

      this.isFromCombatScreen = this.bsModalRef.content.isFromCombatScreen ? true : false;
      this.currencyList = this.bsModalRef.content.currencyTypesList;

      let ruleSetId: number = this.localStorage.getDataObject(DBkeys.RULESET_ID);
      this.rulesetService.getRulesetById<any>(ruleSetId).subscribe(data => {
        if (data) {
          this.ruleSet = data;
        }
      }, error => { });

      if (this.bsModalRef.content.isFromCombatScreen || isEditingWithoutDetail) {
        this.isLoading = true;
        this.monsterTemplateService.getMonsterById<any>(monsterId)
          .subscribe(data => {
            this.isLoading = false;
            if (data) {
              if (this.bsModalRef.content.isFromCombatScreen) {
                data.addToCombatTracker = true;
              }
              this.monsterFormModal = this.monsterTemplateService.MonsterModelData(data, _view);
              this.preInitialize()
            }
          }, error => {
            this.isLoading = false;
            let Errors = Utilities.ErrorDetail("", error);
            if (Errors.sessionExpire) {
              //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
              this.authService.logout(true);
            }
          }, () => { });
      } else {
        this.preInitialize();
      }

    }, 0);
  }

  preInitialize() {
    this.fromDetail = this.bsModalRef.content.fromDetail == undefined ? false : this.bsModalRef.content.fromDetail;
    this.title = this.bsModalRef.content.title;
    let currencyList = this.bsModalRef.content.currencyTypesList;
    let _view = this.button = this.bsModalRef.content.button;
    if (!this.bsModalRef.content.isFromCombatScreen && !this.bsModalRef.content.isEditingWithoutDetail) {
      let _monsterVM = this.bsModalRef.content.monsterVM;
      this.monsterFormModal = this.monsterTemplateService.MonsterModelData(_monsterVM, _view);

      let monsterCrncy = Object.assign([], this.monsterFormModal.monsterCurrency);
        if (this.currencyList) {
            this.currencyList.map(rulesetCurrency => {
                if (this.monsterFormModal.monsterCurrency && this.monsterFormModal.monsterCurrency.length) {
                    let monsters = this.monsterFormModal.monsterCurrency.find(x => x.currencyTypeId == rulesetCurrency.currencyTypeId);
                    if (!monsters) {
                        monsterCrncy.push({
                            monsterCurrencyId: 0,
                            amount: null,
                            command: null,
                            name: rulesetCurrency.name,
                            baseUnit: rulesetCurrency.baseUnit,
                            weightValue: rulesetCurrency.weightValue,
                            sortOrder: rulesetCurrency.sortOrder,
                            monsterTemplateId: this.monsterFormModal.monsterTemplateId,
                            currencyTypeId: rulesetCurrency.currencyTypeId,
                            isDeleted: rulesetCurrency.isDeleted,
                            monster: null
                        });
                    } else {
                        monsters.name = rulesetCurrency.name;
                        monsters.amount = monsters.amount ? monsters.amount : null;
                    }
                }
            });
        }

      this.monsterFormModal.monsterCurrency = monsterCrncy && monsterCrncy.length ? monsterCrncy : this.currencyList;

      //this.monsterFormModal.monsterCurrency = this.monsterFormModal.monsterCurrency ?
      //  (this.monsterFormModal.monsterCurrency.length > 0 ? this.monsterFormModal.monsterCurrency : currencyList)
      //  : currencyList;

    }

    this.selectedBuffAndEffects = this.monsterFormModal.monsterTemplateBuffAndEffects.map(x => { return x.buffAndEffect; });
    this.selectedAbilities = this.monsterFormModal.monsterTemplateAbilities.map(x => { return x.buffAndEffect; });
    this.selectedAssociateMonsterTemplates = this.monsterFormModal.monsterTemplateAssociateMonsterTemplates.map(x => { return x.buffAndEffect; });
    this.selectedSpells = this.monsterFormModal.monsterTemplateSpells.map(x => { return x.buffAndEffect; });

    try {
      if (this.monsterFormModal.metatags !== '' && this.monsterFormModal.metatags !== undefined)
        this.metatags = this.monsterFormModal.metatags.split(",");

    } catch (err) { }
    this.bingImageUrl = this.monsterFormModal.imageUrl;
    if (!this.monsterFormModal.imageUrl) {
      this.imageSearchService.getDefaultImage<any>('item')
        .subscribe(data => {
          this.defaultImageSelected = data.imageUrl.result
        }, error => {
        },
          () => { });
    }
    if (this.bsModalRef.content.button == 'UPDATE' || 'DUPLICATE') {
      this._ruleSetId = this.bsModalRef.content.rulesetID ? this.bsModalRef.content.rulesetID : this.monsterFormModal.ruleSetId;
    }
    else {
      this._ruleSetId = this.monsterFormModal.ruleSetId;
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
  }

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      if (user.isGm) {
        this.isGM = user.isGm;
      }
      if (this.monsterFormModal.monsterTemplateId) {
        this.isLoading = true;
        this.monsterTemplateService.getMonsterAssociateRecords_sp<any>(this.monsterFormModal.monsterId, this._ruleSetId)
          .subscribe(data => {
            this.monsterFormModal.monsterTemplateCommandVM = data.monsterTemplateCommands;
            this.buffAndEffectsList = data.buffAndEffectsList;
            this.selectedBuffAndEffects = data.selectedBuffAndEffects;
            this.abilitiesList = data.abilityList;
            this.selectedAbilities = data.selectedAbilityList;
            this.spellsList = data.spellList;
            this.selectedSpells = data.selectedSpellList;
            this.associateMonsterTemplateList = data.monsterTemplatesList;
            this.selectedAssociateMonsterTemplates = data.selectedMonsterTemplates;
            this.monsterItemsList = data.itemMasterList;
            this.selectedMonsterItems = data.selectedItemMasters;
            this.SelectedItemsList = data.selectedItemMasters;

            this.isLoading = false;
          }, error => { }, () => { this.isLoading = false; });
      }
      else {
        this.isLoading = true;
        this.monsterTemplateService.getMonsterTemplateAssociateRecords_sp<any>(0, this._ruleSetId)
          .subscribe(data => {
            //  this.monsterFormModal.abilityCommandVM = data;
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
    let _monsterTemplateCommand = monsterTemplateCommand == undefined ? [] : monsterTemplateCommand;
    _monsterTemplateCommand.push({ monsterTemplateCommandId: 0, command: '', name: '' });
    this.monsterFormModal.monsterTemplateCommandVM = _monsterTemplateCommand;
  }

  removeCommand(command: any): void {
    this.monsterFormModal.monsterTemplateCommandVM
      .splice(this.monsterFormModal.monsterTemplateCommandVM.indexOf(command), 1);
  }

  //setEnableDisable(checked: boolean) {
  //    this.monsterFormModal.isEnabled = checked;
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
    if (this.SelectedItemsList && this.SelectedItemsList.length > 200) {
      //if (this.selectedMonsterItems && this.selectedMonsterItems.length > 200) {
      this.alertService.showMessage("The maximum number of items has been reached, 200. Please delete some items and try again.", "", MessageSeverity.error);
      return false;
    }

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

    //monsterTemplate.monsterTemplateItemVM = this.selectedMonsterItems.map(x => {
    //  return { itemId: x.itemId ? x.itemId : 0, itemMasterId: x.itemMasterId, monsterTemplateId: monsterTemplate.monsterTemplateId };
    //});
    monsterTemplate.monsterTemplateItemVM = this.SelectedItemsList.map(x => {
      return { itemId: x.itemId ? x.itemId : 0, qty: x.qty, itemMasterId: x.itemMasterId, monsterTemplateId: monsterTemplate.monsterTemplateId };
    });

    this.isLoading = true;
    let _msg = monsterTemplate.monsterTemplateId === 0 || monsterTemplate.monsterTemplateId === undefined ? "Creating Monster.." : "Updating Monster..";
    if (this.monsterFormModal.view === VIEW.DUPLICATE) _msg = "Duplicating Monster..";
    this.alertService.startLoadingMessage("", _msg);

    let tagsValue = this.metatags.map(x => {
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
    else if (this.bingImageUrl !== this.monsterFormModal.imageUrl) {
      try {
        var regex = /(?:\.([^.]+))?$/;
        var extension = regex.exec(this.monsterFormModal.imageUrl)[1];
        extension = extension ? extension : 'jpg';
      } catch{ }
      this.fileUploadFromBing(this.monsterFormModal.imageUrl, extension, monsterTemplate);
    }
    else {
      this.submit(monsterTemplate);
    }


  }
  submitForm(monsterTemplate: MonsterTemplate) {
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
            this.monsterFormModal.imageUrl = data.ImageUrl;
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
            this.monsterFormModal.imageUrl = data.ImageUrl;
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
    if (monsterTemplate.monsterTemplateCurrency) {
      monsterTemplate.monsterTemplateCurrency = monsterTemplate.monsterTemplateCurrency.map(x => {
          //x.amount = x.command ? (x.amount ? x.amount : 0) : 0; return x;
          x.amount = x.amount ? x.amount : 0; return x;
      });
    }
    if (monsterTemplate.monsterCurrency) {
      monsterTemplate.monsterCurrency = monsterTemplate.monsterCurrency.map(x => {
          //x.amount = x.command ? (x.amount ? x.amount : 0) : 0; return x;
          x.amount = x.amount ? x.amount : 0; return x;
      });
    }     

    if (this.monsterFormModal.view === VIEW.DUPLICATE) {
      this.duplicateMonster(monsterTemplate);
    }
    //else if (this.monsterFormModal.view === VIEW.EDIT && this.isFromCharacter) {
    //this.enableAbility(this.isFromCharacterAbilityId, this.isFromCharacterAbilityEnable);
    //}
    else {
      if (this.defaultImageSelected && !this.monsterFormModal.imageUrl) {
        let model = Object.assign({}, monsterTemplate)
        model.imageUrl = this.defaultImageSelected
        this.addEditMonster(model);
      } else {
        this.addEditMonster(monsterTemplate);
      }

    }
  }

  private addEditMonster(modal: MonsterTemplate) {
    modal.ruleSetId = this._ruleSetId;
    this.isLoading = true;
    this.monsterTemplateService.createMonster<any>(modal)
      .subscribe(async (data) => {
        await this.commonService.deleteRecordFromIndexedDB("monsters", 'monsters', 'monsterId', modal, false);
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          if (this.isFromCombatScreen) {

            let updatedModel = Object.assign({},modal, {
            _items: this.selectedMonsterItems,
            _abilities: this.selectedAbilities,
            _buffEffects: this.selectedBuffAndEffects,
            _spells: this.selectedSpells
            });
            this.appService.updateMonsterForPlayerView(updatedModel);
          }

          let message = modal.monsterTemplateId == 0 || modal.monsterTemplateId === undefined ? "Monster has been created successfully." : modal.name + " has been updated.";
          if (data !== "" && data !== null && data !== undefined && isNaN(parseInt(data))) message = data;
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.close();
          //if (this.fromDetail)
          // this.router.navigate(['/ruleset/ability-details', modal.abilityId]);
          if (this.fromDetail) {
            if (data) {
              let id = data;
              if (!isNaN(parseInt(id))) {
                this.router.navigate(['/ruleset/monster-details', id]);
                this.event.emit({ monsterTemplateId: id });
                //this.sharedService.updateItemMasterDetailList(true);
              }
              else {
                this.sharedService.updateMonsterList(true);
              }
            }
            else {
              this.sharedService.updateMonsterList(true);
            }
          }
          else {
            this.event.emit(true);
            this.sharedService.updateMonsterList(true);
          }
          this.sharedService.updateCombatantListForAddDeleteMonsters(true);
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

  private duplicateMonster(modal: any) {
    modal.ruleSetId = this._ruleSetId;
    this.isLoading = true;
    this.monsterTemplateService.duplicateMonster<any>(modal, modal.addToCombatTracker, modal.characterId)
        .subscribe(
            data => {
                this.isLoading = false;
                this.alertService.stopLoadingMessage();
              let message = "Monster has been duplicated successfully.";
                this.alertService.showMessage(message, "", MessageSeverity.success);
                this.close();
              this.sharedService.updateMonsterList(true);
                //if (this.fromDetail)
                //    this.router.navigate(['/ruleset/monster-template', this._ruleSetId]);

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
        this.monsterFormModal.imageUrl = event.target.result;
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
    this.bsModalRef.content.parentCommand =  command ? command.toString() : "0";
    this.bsModalRef.content.inputIndex = index;
    this.bsModalRef.content.characterId = 0;
    this.bsModalRef.content.rulesetId = this._ruleSetId;
  }

  openDiceModalForCurrency(index, currency) {
    this.bsModalRef = this.modalService.show(DiceComponent, {
      class: 'modal-primary modal-md dice-screen',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.parentCommand = currency.amount ? currency.amount.toString() : "0";
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
    this.bsModalRef.content.title = 'Monster';
    this.bsModalRef.content.image = img;
    this.bsModalRef.content.view = view;
    this.bsModalRef.content.errorImage = '../assets/images/DefaultImages/monster.jpg';
    //this.bsModalRef.content.imageChangedEvent = this.imageChangedEvent; //base 64 || URL
    this.bsModalRef.content.event.subscribe(data => {
      this.monsterFormModal.imageUrl = data.base64;
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
      text: "Search Abiltiy(s)",
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
  get associateMonsterTemplatesSettings() {
    return {
      primaryKey: "monsterTemplateId",
      labelKey: "name",
      text: "Search Monster Template(s)",
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
  get monsterItemsSettings() {
    return {
      primaryKey: "itemMasterId",
      labelKey: "name",
      text: "Search Item(s)",
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
  isValidSingleNumberCommand(command) {
    if (command) {
      if (command.indexOf(' and') > -1) {
        return false;
      }
      if (command.indexOf('"') > -1) {
        return false;
      }
    }
    try {
      let number = DiceService.rollDiceExternally(this.alertService, command, this.customDices);
      if (isNaN(number)) {
        return false;
      }
      else {
        return true;
      }
    }
    catch (e) {
      return false;
    }
  }
  selectedMosnterItemsListChanged(item) {
  }
  SelectMonsterItems() {
    this.bsModalRef = this.modalService.show(AddItemsForMonstersOnlyComponent, {
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
  ArmorClassReroll(monsterFormModal: MonsterTemplate) {

    let command = monsterFormModal.armorClass;
    if (command) {
      let res = DiceService.rollDiceExternally(this.alertService, command, this.customDices);
      if (isNaN(res)) {
        this.monsterFormModal.monsterArmorClass = 0;
      }
      else {
        this.monsterFormModal.monsterArmorClass = res;
      }
    }
    else {
      this.monsterFormModal.monsterArmorClass = 0;
    }

  }
  ChallangeRatingReroll(monsterFormModal: MonsterTemplate) {

    let command = monsterFormModal.challangeRating;
    if (command) {
      let res = DiceService.rollDiceExternally(this.alertService, command, this.customDices);
      if (isNaN(res)) {
        this.monsterFormModal.monsterChallangeRating = 0;
      }
      else {
        this.monsterFormModal.monsterChallangeRating = res;
      }
    }
    else {
      this.monsterFormModal.monsterChallangeRating = 0;
    }
  }
  XPReroll(monsterFormModal: MonsterTemplate) {

    let command = monsterFormModal.xPValue;
    if (command) {
      let res = DiceService.rollDiceExternally(this.alertService, command, this.customDices);
      if (isNaN(res)) {
        this.monsterFormModal.monsterXPValue = 0;
      }
      else {
        this.monsterFormModal.monsterXPValue = res;
      }
    }
    else {
      this.monsterFormModal.monsterXPValue = 0;
    }
  }
  HealthReroll(monsterFormModal: MonsterTemplate) {
    let command = monsterFormModal.health;
    if (command) {
      let res = DiceService.rollDiceExternally(this.alertService, command, this.customDices);
      if (isNaN(res)) {
        this.monsterFormModal.monsterHealthCurrent = 0;
        this.monsterFormModal.monsterHealthMax = 0;
      }
      else {
        //this.monsterFormModal.monsterXPValue = res;
        this.monsterFormModal.monsterHealthCurrent = res;
        this.monsterFormModal.monsterHealthMax = res;
      }
    }
    else {
      //this.monsterFormModal.monsterXPValue = 0;
      this.monsterFormModal.monsterHealthCurrent = 0;
      this.monsterFormModal.monsterHealthMax = 0;
    }
  }
  isNonStaticNumber(str) {
    if (str) {
      if (isNaN(str)) {
        return true;
      }
    }

    return false;


  }
}
