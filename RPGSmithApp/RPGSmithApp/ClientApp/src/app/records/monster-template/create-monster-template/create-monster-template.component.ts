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
import { randomizationSearch } from '../../../core/models/view-models/randomizationSearch.model';

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
  isGM: boolean = false;
  ruleSet: any;
  currencyList = [];
  searchFilter: boolean = false;
  randomizationSearchInfo = [];
  randomizationSearch: randomizationSearch = new randomizationSearch();
  isMatchingString: boolean = true;

  recordsOptions = [{ id: 1, name: 'All Unique' }, { id: 2, name: 'Allow Duplicates' }];
  selectedRecord = [];
  searchFields = [{ id: 1, name: 'Name' }, { id: 2, name: 'Tags' }, { id: 3, name: 'Rarity' }, { id: 4, name: 'Asc. Spells' }, { id: 5, name: 'Asc. Abilities' },
  { id: 6, name: 'Description' }, { id: 7, name: 'Stats' }, { id: 8, name: 'GM Only' }];

  selectedSearchFields = [];
  options(placeholder?: string): Object {
    return Utilities.optionsFloala(160, placeholder);
  }

  constructor(
    private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
    private sharedService: SharedService,
    private monsterTemplateService: MonsterTemplateService,
    private fileUploadService: FileUploadService, private rulesetService: RulesetService,
    private location: PlatformLocation, private commonService: CommonService) {
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
      } else if (diceCommand.parentIndex <= -50) {
        let index = (diceCommand.parentIndex + 50) * -1 == -0 ? 0 : (diceCommand.parentIndex + 50) * -1;
        this.randomizationSearchInfo[index].qty = diceCommand.command;
      } else if (diceCommand.parentIndex <= -10) {
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

    // GET dice results for Currency Quantity
    this.sharedService.getCommandResultForCurrency().subscribe(diceResult => {
      if (diceResult) {
        this.monsterTemplateFormModal.monsterTemplateCurrency.map((currency, index) => {
          if (index == diceResult.parentIndex) {
            currency.amount = diceResult.characterCommandModel.lastResult;
            currency.command = diceResult.characterCommandModel.command;
          }
        });
      }
    });
  }

  ngOnInit() {
    setTimeout(() => {
      let _view = this.button = this.bsModalRef.content.button;
      let monsterIdToDuplicate = this.bsModalRef.content.monsterIdToDuplicate ? this.bsModalRef.content.monsterIdToDuplicate : 0;

      let monsterId = this.bsModalRef.content.monsterTemplateVM;
      let isEditingWithoutDetail = this.bsModalRef.content.isEditingWithoutDetail ? true : false;
      this.currencyList = this.bsModalRef.content.currencyTypesList;

      let ruleSetId: number = this.localStorage.getDataObject(DBkeys.RULESET_ID);
      this.rulesetService.getRulesetById<any>(ruleSetId).subscribe(data => {
        if (data) {
          this.ruleSet = data;
        }
      }, error => { });

      if (isEditingWithoutDetail) {
        this.isLoading = true;
        let monsterTemplateId = this.bsModalRef.content.monsterTemplateVM;
        this.monsterTemplateService.getMonsterTemplateById<any>(monsterTemplateId)
          .subscribe(data => {
            if (data) {
              this.monsterTemplateFormModal = this.monsterTemplateService.MonsterTemplateModelData(data, "UPDATE");
              //this.xpValue = data.xpValue;
              this.monsterTemplateFormModal.xPValue = data.xpValue;

              if (!this.monsterTemplateFormModal.ruleset) {
                this.monsterTemplateFormModal.ruleset = data.ruleSet;
              }
              this._ruleSetId = this.monsterTemplateFormModal.ruleSetId;
              this.isLoading = false;
              this.preInitialize();
            }
            //this.monsterTemplateService.getMonsterTemplateAssociateRecords_sp<any>(monsterTemplateId, this._ruleSetId)
            //  .subscribe(data => {

            //    this.selectedBuffAndEffects = data.selectedBuffAndEffects;
            //    this.selectedAbilities = data.selectedAbilityList;
            //    this.selectedSpells = data.selectedSpellList;

            //    this.monsterTemplateDetail.randomizationEngine = data.randomizationEngine;
            //    if (this.monsterTemplateDetail.isRandomizationEngine) {
            //      this.selectedItemMasters = [];
            //      data.randomizationEngine.map(x => {
            //        this.selectedItemMasters.push({ imageUrl: x.itemMaster.itemImage, itemId: 0, itemMasterId: x.itemMaster.itemMasterId, name: x.itemMaster.itemName, qty: 1, ruleSetId: this.monsterTemplateDetail.ruleSetId })
            //      });
            //    } else {
            //      this.selectedItemMasters = data.selectedItemMasters;
            //    }
            //    // this.associateMonsterTemplateList = data.monsterTemplatesList;
            //    this.selectedAssociateMonsterTemplates = data.selectedMonsterTemplates;
            //    this.isLoading = false;
            //  }, error => {
            //    this.isLoading = false;
            //  }, () => { });
          }, error => {
            this.isLoading = false;
            let Errors = Utilities.ErrorDetail("", error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            }
          }, () => { });
      }
      else if (this.bsModalRef.content.isFromCombatScreen) {
        this.isLoading = true;
        this.monsterTemplateService.getMonsterById<any>(monsterIdToDuplicate)
          .subscribe(data => {
            this.isLoading = false;
            if (data) {
              data.addToCombatTracker = true;
              this.monsterTemplateFormModal = this.monsterTemplateService.MonsterTemplateModelData(data, _view);
              if (this.isCreatingFromMonsterScreen && this.monsterTemplateFormModal.view == VIEW.DUPLICATE && this.bsModalRef.content.isCreatingFromMonsterDetailScreen) {
                this.monsterTemplateFormModal = this.monsterTemplateService.MonsterTemplateModelData(data.monsterTemplate, _view);
              }
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
      }
      else {
        this.preInitialize();
      }
    }, 0);
  }

  preInitialize() {
    this.isCreatingFromMonsterScreen = this.bsModalRef.content.isCreatingFromMonsterScreen
    this.fromDetail = this.bsModalRef.content.fromDetail == undefined ? false : this.bsModalRef.content.fromDetail;
    this.title = this.bsModalRef.content.title;
    let _view = this.button = this.bsModalRef.content.button;
    if (!this.bsModalRef.content.isFromCombatScreen && !this.bsModalRef.content.isEditingWithoutDetail) {
      let _monsterTemplateVM = this.bsModalRef.content.monsterTemplateVM;

      this.monsterTemplateFormModal = this.monsterTemplateService.MonsterTemplateModelData(_monsterTemplateVM, _view);

      let monsterCrncy = Object.assign([], this.monsterTemplateFormModal.monsterTemplateCurrency);
      if (this.currencyList) {
        this.currencyList.map(rulesetCurrency => {
          if (this.monsterTemplateFormModal.monsterTemplateCurrency && this.monsterTemplateFormModal.monsterTemplateCurrency.length) {
            let monsters = this.monsterTemplateFormModal.monsterTemplateCurrency.find(x => x.currencyTypeId==rulesetCurrency.currencyTypeId);
            if (!monsters) {
              monsterCrncy.push({
                monsterTemplateCurrencyId: 0,
                amount: null,
                command: null,
                name: rulesetCurrency.name,
                baseUnit: rulesetCurrency.baseUnit,
                weightValue: rulesetCurrency.weightValue,
                sortOrder: rulesetCurrency.sortOrder,
                monsterTemplateId: this.monsterTemplateFormModal.monsterTemplateId,
                currencyTypeId: rulesetCurrency.currencyTypeId,
                isDeleted: rulesetCurrency.isDeleted,
                monsterTemplate: null
              });
            } else {
              monsters.name = rulesetCurrency.name;
            }
          }
        });
      }

      //this.monsterTemplateFormModal.monsterTemplateCurrency = this.monsterTemplateFormModal.monsterTemplateCurrency ?
      //  (this.monsterTemplateFormModal.monsterTemplateCurrency.length > 0 ? this.monsterTemplateFormModal.monsterTemplateCurrency : this.currencyList)
      //  : this.currencyList;
      this.monsterTemplateFormModal.monsterTemplateCurrency = monsterCrncy && monsterCrncy.length ? monsterCrncy : this.currencyList;

      if (this.isCreatingFromMonsterScreen && this.monsterTemplateFormModal.view == VIEW.DUPLICATE && this.bsModalRef.content.isCreatingFromMonsterDetailScreen) {
        this.monsterTemplateFormModal = this.monsterTemplateService.MonsterTemplateModelData(_monsterTemplateVM.monsterTemplate, _view);
      }
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
      this.defaultImageSelected = '../assets/images/DefaultImages/monster.jpg';

      //get defult image from API
      //this.imageSearchService.getDefaultImage<any>('item')
      //  .subscribe(data => {
      //    //this.defaultImageSelected = data.imageUrl.result                      

      //  }, error => {
      //  },
      //    () => { });
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
  }

  private initialize() {

    //insert in randomizationInfo array
    let _randomization = new randomization();
    _randomization.percentage = null;
    _randomization.qty = null;
    this.randomizationInfo.push(_randomization);

    if (this.bsModalRef.content.button == 'CREATE') {
      let _randomizationSearch = new randomizationSearch();
      _randomizationSearch.qty = null;
      _randomizationSearch.qtyString = null;
      _randomizationSearch.records = [{ id: 2, name: 'Allow Duplicates' }];
      _randomizationSearch.itemRecord = null;
      _randomizationSearch.matchingString = null;
      _randomizationSearch.searchFields = [{ id: 1, name: 'Name' }, { id: 2, name: 'Tags' }];
      this.randomizationSearchInfo.push(_randomizationSearch);
    }

    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      if (user.isGm) {
        this.isGM = user.isGm;
      }
      if (this.monsterTemplateFormModal.monsterTemplateId) {
        this.isLoading = true;
        let rulesetid = this._ruleSetId; //check if is coreRuleset or not
        if (this._ruleSetId != this.monsterTemplateFormModal.ruleSetId) {
          rulesetid = this.monsterTemplateFormModal.ruleSetId;
        }
        this.monsterTemplateService.getMonsterTemplateAssociateRecords_sp<any>(this.monsterTemplateFormModal.monsterTemplateId, rulesetid)
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
            this.randomizationInfo = data.randomizationEngine;
            this.randomizationSearchInfo = [];

            /////////////////////////////////////
            //let RandomEngineList = [];
            //let SortOrderNumberList:number[] =
            //  this.randomizationInfo.map((re) => {
            //    return re.sortOrder
            //  })
            //let sortOrder_num = 0;

            //let get_UniqueValuesFromArray = (list) => list.filter((v, i) => list.indexOf(v) === i);

            //let SortOrderNumberList_Unique = get_UniqueValuesFromArray(SortOrderNumberList)
            //if (SortOrderNumberList_Unique && SortOrderNumberList_Unique.length) {
            //  RandomEngineList =
            //    SortOrderNumberList_Unique.map((SortNumber, index) => {
            //      let commonRE = this.randomizationInfo.filter(x => x.sortOrder === SortNumber)
            //      if (commonRE && commonRE.length) {
            //        let RandomEngine = new randomization();
            //        RandomEngine.isDeleted = commonRE[0].isDeleted;
            //        RandomEngine.isOr = commonRE[0].isOr;

            //        RandomEngine.percentage = commonRE[0].percentage;
            //        RandomEngine.qty = commonRE[0].qty;
            //        RandomEngine.randomizationEngineId = commonRE[0].randomizationEngineId;
            //        RandomEngine.sortOrder = SortNumber;

            //        RandomEngine.selectedItem = [];

            //        commonRE.map((C_RE) => {
            //          RandomEngine.selectedItem.push({ image: C_RE.itemMaster.itemImage, itemId: C_RE.itemMaster.itemMasterId, text: C_RE.itemMaster.itemName });
            //        });

            //        return RandomEngine;
            //      }
            //    });
            //}
            //this.randomizationInfo = RandomEngineList;


            this.randomizationInfo = ServiceUtil.GetRandomizationEngineForMultipleItemSelection(this.randomizationInfo);


            /////////////////////////////////////

            if (!this.randomizationInfo.length) {
              let _randomization = new randomization();
              _randomization.percentage = null;
              _randomization.qty = null;
              this.randomizationInfo.push(_randomization);
            } else {
              //this.randomizationInfo.map((x) => {
              //  x.selectedItem = [];
              //});
              this.randomizationInfo.map((x, index) => {
                if (index == 0) {
                  x.isOr = undefined;
                  x.qty = x.quantityString;
                } else {
                  x.qty = x.quantityString;
                }
                //x.selectedItem.push({ image: x.itemMaster.itemImage, itemId: x.itemMaster.itemMasterId, text: x.itemMaster.itemName })
              });
            }
            if (this.bsModalRef.content.button == 'UPDATE' || 'DUPLICATE') {
              if (data.monsterTemplateRandomizationSearch && data.monsterTemplateRandomizationSearch.length) {
                this.searchFilter = !this.searchFilter;
                //this.randomizationSearchInfo = data.monsterTemplateRandomizationSearch;

                data.monsterTemplateRandomizationSearch.map(x => {
                  if (x.fields && x.fields.length) {
                    x.fields.map(f => {
                      f.id = this.searchFields.find(y => y.name == f.name).id;
                    });
                  }
                  let _randomizationSearch = new randomizationSearch();
                  _randomizationSearch.randomizationSearchEngineId = x.randomizationSearchId;
                  _randomizationSearch.qty = x.quantityString;
                  _randomizationSearch.qtyString = x.quantityString;
                  _randomizationSearch.records = x.itemRecord == 'All Unique' ? [{ id: 1, name: x.itemRecord }] : [{ id: 2, name: x.itemRecord }];
                  _randomizationSearch.itemRecord = null;
                  _randomizationSearch.matchingString = x.string;
                  _randomizationSearch.searchFields = x.fields;
                  _randomizationSearch.isAnd = x.isAnd ? x.isAnd : undefined;
                  this.randomizationSearchInfo.push(_randomizationSearch);
                });
              } else {
                let _randomizationSearch = new randomizationSearch();
                _randomizationSearch.qty = null;
                _randomizationSearch.qtyString = null;
                _randomizationSearch.records = [{ id: 2, name: 'Allow Duplicates' }];
                _randomizationSearch.itemRecord = null;
                _randomizationSearch.matchingString = null;
                _randomizationSearch.searchFields = [{ id: 1, name: 'Name' }, { id: 2, name: 'Tags' }];
                this.randomizationSearchInfo.push(_randomizationSearch);
              }
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
    this.isMatchingString = true;
    if (this.randomizationSearchInfo && this.randomizationSearchInfo.length) {
      this.randomizationSearchInfo.map(x => {
        if (this.searchFilter && !x.matchingString) {
          this.isMatchingString = false;
        }
      });
    }

    if (!this.isMatchingString) {
      let msg = "Please fill Matching string and try again";
      this.alertService.showMessage(msg, '', MessageSeverity.error);
    } else {

      if (monsterTemplate.isRandomizationEngine) {        let REitems = this.get_AND_ItemsCountFromRandomizationEngine(monsterTemplate.randomizationEngine, this.alertService);
        if (REitems > 200) {
          this.alertService.showMessage("The maximum number of items has been reached, 200. Please delete some items and try again.", "", MessageSeverity.error);
          return false;
        }

      } else if (this.SelectedItemsList && this.SelectedItemsList.length > 200) {
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
      monsterTemplate.monsterTemplateItemMasterVM = this.SelectedItemsList.map(x => {
        return { itemMasterId: x.itemId, qty: x.quantity, monsterTemplateId: monsterTemplate.monsterTemplateId };
      });


      this.isLoading = true;
      let _msg = monsterTemplate.monsterTemplateId === 0 || monsterTemplate.monsterTemplateId === undefined ? "Creating Monster Template.." : "Updating Monster Template..";
      if (this.monsterTemplateFormModal.view === VIEW.DUPLICATE) _msg = "Duplicating Monster Template..";
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


  }
  submitForm(monsterTemplate: MonsterTemplate) {
    monsterTemplate.randomizationEngine = [];    this.randomizationInfo.map((x: randomization, index) => {      //let _randomization = new randomization(undefined, +x.percentage, +x.sortOrder, +x.itemMasterId, x.isOr, x.isDeleted, +x.qty,undefined,undefined);      //monsterTemplate.randomizationEngine.push(_randomization1);      if (x.selectedItem) {
        if (x.selectedItem.length) {
          //_randomization1.itemMasterId = +x.selectedItem[0].itemId;
          x.selectedItem.map(reItem => {            let _randomization1 = new randomization();            _randomization1.percentage = +x.percentage;            _randomization1.quantityString = x.qty;            _randomization1.qty = x.qty ? DiceService.rollDiceExternally(this.alertService, x.qty, this.customDices) : x.qty;            _randomization1.isOr = x.isOr ? true : false;            //_randomization1.randomizationEngineId = x.randomizationEngineId;
            _randomization1.itemMasterId = reItem.itemId;            _randomization1.sortOrder = index;            monsterTemplate.randomizationEngine.push(_randomization1);          });
        }

      }    })    this.randomizationInfo;    //for validation of randomization    let validate = this.validateRandomization(monsterTemplate);

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
    if (this.monsterTemplateFormModal.view === VIEW.DUPLICATE) {
      try {
        if (monsterTemplate && monsterTemplate.monsterTemplateCurrency) {
          monsterTemplate.monsterTemplateCurrency.map(currency => {
            if (currency.command) {
              currency.amount = currency.command ? DiceService.rollDiceExternally(this.alertService, currency.command, this.customDices) : 0;
            }
          });
        }
      } catch (err) { }
      this.duplicateMonsterTemplate(monsterTemplate);
    }
    //else if (this.monsterTemplateFormModal.view === VIEW.EDIT && this.isFromCharacter) {
    //this.enableAbility(this.isFromCharacterAbilityId, this.isFromCharacterAbilityEnable);
    //}
    else {

      try {
        if (this.monsterTemplateFormModal && this.monsterTemplateFormModal.monsterTemplateCurrency) {
          this.monsterTemplateFormModal.monsterTemplateCurrency.map(currency => {
            if (currency.command) {
              currency.amount = currency.command ? DiceService.rollDiceExternally(this.alertService, currency.command, this.customDices) : 0;
            }
          });
        }
      } catch (err) { }

      if (this.defaultImageSelected && !this.monsterTemplateFormModal.imageUrl) {
        let model = Object.assign({}, monsterTemplate)
        model.imageUrl = this.defaultImageSelected
        this.addEditMonsterTemplate(model);
      } else {
        this.addEditMonsterTemplate(monsterTemplate);
      }

    }
  }

  private addEditMonsterTemplate(modal: any) {

    this.randomizationSearchInfo.map((x, index) => {
      x.sortOrder = index;
      x.quantityString = ServiceUtil.DeepCopy(x.qty);
      x.qty = x.qty ? DiceService.rollDiceExternally(this.alertService, x.qty, this.customDices) : 1;
      x.itemRecord = x.records ? (x.records.length > 0 ? x.records[0].name : "") : "";
    });

    modal.randomizationSearchInfo = this.randomizationSearchInfo;

    modal.ruleSetId = this._ruleSetId;
    this.isLoading = true;
    let armorClass: number = 0;
    let health: number = 0;
    let challangeRating: number = 0;
    let xpValue: number = 0;
    let reItems: any;
    if (this.searchFilter) {
      modal.randomizationEngine = [];
    } else {
      modal.randomizationSearchInfo = [];
    }
    if (this.isCreatingFromMonsterScreen) {
      armorClass = modal.armorClass ? DiceService.rollDiceExternally(this.alertService, modal.armorClass, this.customDices) : 0;
      health = modal.health ? DiceService.rollDiceExternally(this.alertService, modal.health, this.customDices) : 0;
      challangeRating = modal.challangeRating ? DiceService.rollDiceExternally(this.alertService, modal.challangeRating, this.customDices) : 0;
      xpValue = modal.xPValue ? DiceService.rollDiceExternally(this.alertService, modal.xPValue, this.customDices) : 0;

      let r_engine = ServiceUtil.GetRandomizationEngineForMultipleItemSelection(modal.randomizationEngine);
      modal.REitems = ServiceUtil.getItemsFromRandomizationEngine_WithMultipleSeletion(r_engine, this.alertService);

      if (modal.REitems && modal.REitems.length) {
        modal.REitems.map((re) => {
          re.deployCount = 1;
        });
      }
    }

    if (modal && modal.monsterTemplateCurrency) {
      modal.monsterTemplateCurrency.map(currency => {
        if (currency.command) {
          currency.amount = currency.command ? DiceService.rollDiceExternally(this.alertService, currency.command, this.customDices) : 0;
        }
      });
    }

    this.monsterTemplateService.createMonsterTemplate<any>(modal, this.isCreatingFromMonsterScreen, armorClass, health, challangeRating, xpValue)
      .subscribe(async (data) => {
        await this.commonService.deleteRecordFromIndexedDB("monsterTemplates", 'monsterTemplates', 'monsterTemplateId', modal, false);
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
                this.sharedService.updateMonsterTemplateDetailList(true);
              }
              else {
                this.sharedService.updateMonsterTemplateDetailList(true);
                this.sharedService.updateMonsterTemplateList(true);
                this.sharedService.updateMonsterList(true);

              }
            }
            else {
              this.sharedService.updateMonsterTemplateDetailList(true);
              this.sharedService.updateMonsterTemplateList(true);
              this.sharedService.updateMonsterList(true);
            }
          }
          else {
            this.event.emit(true);
            this.sharedService.updateMonsterTemplateDetailList(true);
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

  private duplicateMonsterTemplate(modal: any) {
    if (this.randomizationSearchInfo) {
      this.randomizationSearchInfo.map(x => {
        x.randomizationSearchEngineId = 0;
      });
    }
    modal.randomizationSearchInfo = this.randomizationSearchInfo;
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

      if (this.monsterTemplateFormModal && this.monsterTemplateFormModal.monsterTemplateCurrency) {
        this.monsterTemplateFormModal.monsterTemplateCurrency.map(currency => {
          if (currency.command) {
            currency.amount = currency.command ? DiceService.rollDiceExternally(this.alertService, currency.command, this.customDices) : 0;
          }
        });
      }

      let r_engine = ServiceUtil.GetRandomizationEngineForMultipleItemSelection(modal.randomizationEngine);
      modal.REitems = ServiceUtil.getItemsFromRandomizationEngine_WithMultipleSeletion(r_engine, this.alertService);
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

          this.sharedService.updateCombatantListForAddDeleteMonsters(true);
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
    this.bsModalRef.content.parentCommand = command ? command.toString() : "";
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
    this.bsModalRef.content.parentCommand = currency.command ? currency.command.toString() : "";
    this.bsModalRef.content.inputIndex = index;
    this.bsModalRef.content.characterId = 0;
    this.bsModalRef.content.rulesetId = this._ruleSetId;
    this.bsModalRef.content.isFromCurrency = true;
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
    this.bsModalRef.content.image = img ? img : '../assets/images/DefaultImages/monster.jpg';
    this.bsModalRef.content.view = view;
    this.bsModalRef.content.errorImage = '../assets/images/DefaultImages/monster.jpg';
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

  //isValidQuantity() {
  //  // debugger;
  //  let res: boolean = false;
  //  this.randomizationInfo.forEach(item => {
  //    if (!item.isValidQty) {
  //      res = true;
  //    }
  //  });
  //  return res;
  //}

  percentage(e, item) {
    item.percentage = e.target.value;
  }
  quantity(e, item) {
    item.qty = e.target.value;
  }
  matchingString(e, item) {
    item.matchingString = e.target.value;
  }

  commonOR(i) {
    let _randomization = new randomization();    _randomization.percentage = null;    _randomization.qty = null;    _randomization.isOr = true;    _randomization.selectedItem = [];    let indexToInsert = i + 1;    _randomization.sortOrder = indexToInsert;    this.randomizationInfo.splice(indexToInsert, 0, _randomization);    // add remaining percentage out of 100    let AndArray = [];
    let OrArray = [];
    this.randomizationInfo.map((item, index) => {
      if (index == 0) {
        OrArray.push(item);
      }
      if (item.isOr && index != 0) {
        OrArray.push(item);
      }
      if ((!item.isOr && index != 0) || index == this.randomizationInfo.length - 1) {
        AndArray.push(OrArray);
        OrArray = [];
        OrArray.push(item);

        if (!item.isOr && index == this.randomizationInfo.length - 1) {
          AndArray.push(OrArray);
        }

      }
    });    let currentOrCount = 0;    AndArray.map((and) => {      let isCurrentOrInWhichItemIsInsert = false;      let totalPercent: number = 100;      and.map((or) => {        totalPercent = totalPercent - (+or.percentage);        currentOrCount = currentOrCount + 1;        if (currentOrCount == indexToInsert) {
          isCurrentOrInWhichItemIsInsert = true;
        }      })      if (totalPercent <= 100 && currentOrCount >= indexToInsert && isCurrentOrInWhichItemIsInsert) {
        this.randomizationInfo[indexToInsert].percentage = totalPercent;
      }    });

  }

  // Parent OR method
  randomizationOR(i) {
    this.commonOR(i);
  }

  // Child or method
  randomizationOr(i) {    this.commonOR(i);  }  randomizationAnd() {    let _randomization = new randomization();    _randomization.percentage = null;    _randomization.qty = null;    _randomization.isOr = false;    this.randomizationInfo.push(_randomization);  }  removeRandom(item, index) {    if (this.randomizationInfo[index].isOr) {
      this.randomizationInfo.splice(index, 1);
    } else {
      this.randomizationInfo.splice(index, 1);
      if (this.randomizationInfo[index]) {
        if (this.randomizationInfo[index].isOr) {
          this.randomizationInfo[index].isOr = false;
        }
      }
    }    //if (index > -1 && item.isOr) {    //  this.randomizationInfo.splice(index, 1);    //}    //else {    //  let AndArray = [];
    //  let OrArray = [];
    //  this.randomizationInfo.map((item, index) => {

    //    if (index == 0) {
    //      OrArray.push(item);
    //    }
    //    if (item.isOr && index != 0) {
    //      OrArray.push(item);
    //    }
    //    if ((!item.isOr && index != 0) || index == this.randomizationInfo.length - 1) {
    //      AndArray.push(OrArray);
    //      OrArray = [];
    //      OrArray.push(item);

    //      if (!item.isOr && index == this.randomizationInfo.length - 1) {
    //        AndArray.push(OrArray);
    //      }

    //    }

    //  });    //  let currentOrCount = 0;    //  let currentOrCount_Delete = 0;    //  AndArray.map((and) => {    //    let isCurrentOrInWhichItemIsDeleted = false;    //    and.map((or) => {    //      currentOrCount = currentOrCount + 1;    //      if (currentOrCount == index) {
    //        isCurrentOrInWhichItemIsDeleted = true;
    //      }    //    })    //    if (isCurrentOrInWhichItemIsDeleted) {
    //      and.map((or) => {    //        currentOrCount_Delete = currentOrCount_Delete + 1;    //        this.randomizationInfo.splice(currentOrCount_Delete, 1);    //      })
    //    }    //  });    //}  }  SelectItem(item, i) {    this.bsModalRef = this.modalService.show(SingleItemMonsterComponent, {      class: 'modal-primary modal-md',      ignoreBackdropClick: true,      keyboard: false    });    this.bsModalRef.content.title = 'Add Item';    this.bsModalRef.content.button = 'ADD';    this.bsModalRef.content.rulesetID = this._ruleSetId;    this.bsModalRef.content.SelectedItems = item.selectedItem;    this.bsModalRef.content.event.subscribe(data => {      if (data) {        item.selectedItem = data;      }    });  }  validateRandomization(mt) {    if (!mt.isRandomizationEngine) {
      return true;
    }    let isValidPrecentage = true;    let isValidItem = true;    let isPercentageFieldsAreValid = true;    let isQtyFieldsAreValid = true;    let AndArray = [];
    let OrArray = [];
    this.randomizationInfo.map((item, index) => {

      if (index == 0) {
        OrArray.push(item);
      }
      if (item.isOr && index != 0) {
        OrArray.push(item);
      }
      if ((!item.isOr && index != 0) || index == this.randomizationInfo.length - 1) {
        AndArray.push(OrArray);
        OrArray = [];
        OrArray.push(item);

        if (!item.isOr && index == this.randomizationInfo.length - 1) {
          AndArray.push(OrArray);
        }

      }

    });    AndArray.map((and) => {      let totalPercent: number = 0;      and.map((or) => {        if (or.percentage == undefined || or.percentage == null || or.percentage == '') {
          isPercentageFieldsAreValid = false;
        }        if (or.qty == undefined || or.qty == null || or.qty == '') {
          isQtyFieldsAreValid = false;
        }        totalPercent = totalPercent + (+or.percentage);        if (!or.selectedItem || !or.selectedItem.length) {
          isValidItem = false;
        }      })      if (totalPercent > 100) {
        isValidPrecentage = false;
      }    })    if (isValidPrecentage && isValidItem && isPercentageFieldsAreValid && isQtyFieldsAreValid) {
      return true;
    }
    else if (this.searchFilter) {
      return true;
    }    else {      if (!isValidItem) {
        let message = "Please select item and try again.";
        this.alertService.showMessage(message, "", MessageSeverity.error);
      }      if (!isValidPrecentage) {
        let message = "Total percent chance for a section can't exceed 100%, Please adjust these values and try again.";        this.alertService.showMessage(message, "", MessageSeverity.error);
      }      return false;    }  }

  get_AND_ItemsCountFromRandomizationEngine(REList, alertService) {
    let AndArray = [];
    let OrArray = [];
    REList.map((item, index) => {

      if (index == 0) {
        OrArray.push(item);
      }
      if (item.isOr && index != 0) {
        OrArray.push(item);
      }
      if ((!item.isOr && index != 0) || index == REList.length - 1) {
        AndArray.push(OrArray);
        OrArray = [];
        OrArray.push(item);

        if (!item.isOr && index == REList.length - 1) {
          AndArray.push(OrArray);
        }
      }


    });

    return AndArray.length;

  }

  SwitchTo(isSearchMode) {
    if (isSearchMode) {
      this.searchFilter = false;
    } else {
      this.searchFilter = true;
    }
  }

  randomizationSearchAnd() {
    let _randomizationSearch = new randomizationSearch();
    _randomizationSearch.qty = null;
    _randomizationSearch.qtyString = null;
    _randomizationSearch.records = [{ id: 2, name: 'Allow Duplicates' }];
    _randomizationSearch.itemRecord = null;
    _randomizationSearch.matchingString = null;
    _randomizationSearch.searchFields = [{ id: 1, name: 'Name' }, { id: 2, name: 'Tags' }];
    _randomizationSearch.isAnd = true;
    this.randomizationSearchInfo.push(_randomizationSearch);
  }

  removeRandomSearch(item, index) {
    if (this.randomizationSearchInfo[index].isAnd) {
      this.randomizationSearchInfo.splice(index, 1);
    }
  }

  get recordsSettings() {
    return {
      primaryKey: "id",
      labelKey: "name",
      text: "Record",
      enableCheckAll: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: true,
      limitSelection: false,
      enableSearchFilter: false,
      classes: "myclass custom-class",
      showCheckbox: false,
      position: "top"
    };
  }

  get searchFieldSettings() {
    return {
      primaryKey: "id",
      labelKey: "name",
      text: "Search Fields",
      enableCheckAll: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: false,
      limitSelection: false,
      enableSearchFilter: false,
      classes: "myclass custom-class",
      showCheckbox: true,
      position: "top"
    };
  }

}
