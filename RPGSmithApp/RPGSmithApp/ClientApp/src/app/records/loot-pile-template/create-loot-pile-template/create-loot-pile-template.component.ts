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
import { CreateLootPileTemplate } from '../../../core/models/view-models/loot-pile-template.model';
import { AddLootPileComponent } from '../../loot-pile/add-loot-pile/add-loot-pile.component';
import { randomization } from '../../../core/models/view-models/randomization.model ';
import { DiceService } from '../../../core/services/dice.service';
import { CustomDice } from '../../../core/models/view-models/custome-dice.model';
import { RulesetService } from '../../../core/services/ruleset.service';
import { SingleItemMonsterComponent } from '../../monster-template/single-item/single-item-monster.component';
import { ServiceUtil } from '../../../core/services/service-util';
import { randomizationSearch } from '../../../core/models/view-models/randomizationSearch.model';

@Component({
  selector: 'app-create-loot-pile-template',
  templateUrl: './create-loot-pile-template.component.html',
  styleUrls: ['./create-loot-pile-template.component.scss']
})
export class CreateLootPileTemplateComponent implements OnInit {

  isLoading = false;
  title: string;
  ruleSetId: number;
  showWebButtons: boolean = false;
  createLootPileTemplateModal: any = new CreateLootPileTemplate();
  fileToUpload: File = null;
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

  randomizationInfo = [];
  randomization: randomization = new randomization();
  randomizationSearchInfo = [];
  randomizationSearch: randomizationSearch = new randomizationSearch();
  customDices: CustomDice[] = [];
  isGM: boolean = false;
  CurrencyTypesList = [];
  searchFilter: boolean = false;

  recordsOptions = [{ id: 1, name: 'All Unique' }, { id: 2, name: 'Allow Duplicates' }];
  selectedRecord = [];
  searchFields = [{ id: 1, name: 'Name' }, { id: 2, name: 'Tags' }, { id: 3, name: 'Rarity' }, { id: 4, name: 'Asc. Spells' }, { id: 5, name: 'Asc. Abilities' },
  { id: 6, name: 'Description' }, { id: 7, name: 'Stats' }, { id: 8, name: 'GM Only' }];

  selectedSearchFields = [];

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
    private location: PlatformLocation,
    private rulesetService: RulesetService) {

    location.onPopState(() => this.modalService.hide(1));
    this.route.params.subscribe(params => { this.ruleSetId = params['id']; });

    this.sharedService.getCommandData().subscribe(diceCommand => {
      //if (diceCommand.parentIndex === -1) {
      //  this.createLootPileTemplateModal.gold = diceCommand.command;
      //} else if (diceCommand.parentIndex === -2) {
      //  this.createLootPileTemplateModal.silver = diceCommand.command;
      //} else if (diceCommand.parentIndex === -3) {
      //  this.createLootPileTemplateModal.copper = diceCommand.command;
      //} else if (diceCommand.parentIndex === -4) {
      //  this.createLootPileTemplateModal.platinum = diceCommand.command;
      //} else if (diceCommand.parentIndex === -5) {
      //  this.createLootPileTemplateModal.electrum = diceCommand.command;
      //}
      if (diceCommand.parentIndex <= -10) {
        let index = (diceCommand.parentIndex + 10) * -1 == -0 ? 0 : (diceCommand.parentIndex + 10) * -1;
        this.randomizationInfo[index].qty = diceCommand.command;
      }
      else {
        if (diceCommand.parentIndex <= -20) {
          let index = (diceCommand.parentIndex + 20) * -1 == -0 ? 0 : (diceCommand.parentIndex + 20) * -1;
          this.randomizationSearchInfo[index].qty = diceCommand.command;
        }
      }

    });

    // GET dice results for Currency Quantity
    this.sharedService.getCommandResultForCurrency().subscribe(diceResult => {
      if (diceResult) {
        this.createLootPileTemplateModal.lootTemplateCurrency.map((currency, index) => {
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
      this.title = this.bsModalRef.content.title;
      let _view = this.button = this.bsModalRef.content.button;
      let _lootPileVM = this.bsModalRef.content.lootPileVM;
      let currencyList = this.bsModalRef.content.currencyTypesList;


      let isEditingWithoutDetail = this.bsModalRef.content.isEditingWithoutDetail ? true : false;
      if (isEditingWithoutDetail) {
        this.isLoading = true;
        this.lootService.getTemplateDetailById<any>(_lootPileVM)
          .subscribe(data => {
            if (data) {
              //this.RuleSet = data.ruleSet;
              _lootPileVM = data;

              this.createLootPileTemplateModal = _lootPileVM;
              this.ruleSetId = this.bsModalRef.content.ruleSetId;
              this.createLootPileTemplateModal.ruleSetId = this.ruleSetId;

              this.createLootPileTemplateModal.lootTemplateCurrency = this.createLootPileTemplateModal.lootTemplateCurrency ?
                (this.createLootPileTemplateModal.lootTemplateCurrency.length > 0 ? this.createLootPileTemplateModal.lootTemplateCurrency : currencyList)
                : currencyList;

              if (this.createLootPileTemplateModal.metatags !== '' && this.createLootPileTemplateModal.metatags !== undefined)
                this.metatags = this.createLootPileTemplateModal.metatags.split(",");
              this.bingImageUrl = this.createLootPileTemplateModal.imageUrl;

              this.rulesetService.getCustomDice(this.ruleSetId)
                .subscribe(data => {
                  this.customDices = data
                }, error => {
                  let Errors = Utilities.ErrorDetail("", error);
                  if (Errors.sessionExpire) {
                    this.authService.logout(true);
                  }
                });
              this.isLoading = false;
              this.initialize();

            }
          }, error => {
            this.isLoading = false;
            let Errors = Utilities.ErrorDetail("", error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            }
          }, () => { });
      } else {
        this.createLootPileTemplateModal = _lootPileVM;
        //this.itemMasterFormModal = this.itemMasterService.itemMasterModelData(_itemTemplateVM, _view);
        //this._ruleSetId = this.itemMasterFormModal.ruleSetId;
        this.ruleSetId = this.bsModalRef.content.ruleSetId;
        this.createLootPileTemplateModal.ruleSetId = this.ruleSetId;

        this.createLootPileTemplateModal.lootTemplateCurrency = this.createLootPileTemplateModal.lootTemplateCurrency ?
          (this.createLootPileTemplateModal.lootTemplateCurrency.length > 0 ? this.createLootPileTemplateModal.lootTemplateCurrency : currencyList)
          : currencyList;

        if (this.createLootPileTemplateModal.metatags !== '' && this.createLootPileTemplateModal.metatags !== undefined)
          this.metatags = this.createLootPileTemplateModal.metatags.split(",");
        this.bingImageUrl = this.createLootPileTemplateModal.imageUrl;

        this.rulesetService.getCustomDice(this.ruleSetId)
          .subscribe(data => {
            this.customDices = data
          }, error => {
            let Errors = Utilities.ErrorDetail("", error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            }
          });
        this.initialize();
      }
    }, 0);
  }

  private initialize() {
    let _randomization = new randomization();
    _randomization.percentage = null;
    _randomization.qty = null;
    this.randomizationInfo.push(_randomization);


    let _randomizationSearch = new randomizationSearch();
    _randomizationSearch.qty = null;
    _randomizationSearch.records = null;
    _randomizationSearch.matchingString = null;
    _randomizationSearch.searchFields = null;
    this.randomizationSearchInfo.push(_randomizationSearch);


    if (this.button == "UPDATE" || this.button == VIEW.DUPLICATE.toUpperCase()) {
      this.randomizationInfo = this.createLootPileTemplateModal.lootTemplateRandomizationEngines;
      //////////////////////////////
      this.randomizationInfo = ServiceUtil.GetRandomizationEngineForMultipleItemSelection(this.randomizationInfo);
      /////////////////////////////

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
          }
          //x.selectedItem.push({ image: x.itemMaster.itemImage, itemId: x.itemMaster.itemMasterId, text: x.itemMaster.itemName })
        });
      }
    }

    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      if (user.isGm) {
        this.isGM = user.isGm;
      }
      //this.isLoading = true;
      if (!this.createLootPileTemplateModal.imageUrl) {
        this.imageSearchService.getDefaultImage<any>('item')
          .subscribe(data => {
            this.defaultImageSelected = data.imageUrl.result
            //this.isLoading = false;
          }, error => {
            //this.isLoading = false;
          },
            () => { });
      }
    }
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
    lootPile.lootTemplateRandomizationEngines = [];
    this.randomizationInfo.map((x: randomization, index) => {

      if (x.selectedItem) {
        if (x.selectedItem.length) {
          //_randomization1.itemMasterId = +x.selectedItem[0].itemId;
          x.selectedItem.map(reItem => {
            let _randomization1 = new randomization();
            _randomization1.percentage = +x.percentage;
            _randomization1.qty = x.qty ? DiceService.rollDiceExternally(this.alertService, x.qty, this.customDices) : 0;
            _randomization1.isOr = x.isOr ? true : false;
            _randomization1.itemMasterId = reItem.itemId;
            _randomization1.sortOrder = index;
            lootPile.lootTemplateRandomizationEngines.push(_randomization1);
          });
        }

      }

    })
    this.randomizationInfo;

    //for validation of randomization
    let validate = this.validateRandomization(lootPile);

    if (validate) {
      this.validateSubmit(lootPile);
    }

  }
  validateSubmit(lootPile: any) {
    let tagsValue = this.metatags.map(x => {
      if (x.value == undefined) return x;
      else return x.value;
    });
    lootPile.metatags = tagsValue.join(', ');

    if (lootPile.ruleSetId == 0 || lootPile.ruleSetId === undefined)
      lootPile.ruleSetId = this.ruleSetId;

    let _msg = lootPile.lootTemplateId == 0 || lootPile.lootTemplateId === undefined ? "Creating Random Loot.." : "Updating Random Loot..";
    if (this.button === VIEW.DUPLICATE.toUpperCase()) _msg = "Duplicating Random Loot..";
    this.alertService.startLoadingMessage("", _msg);

    if (this.fileToUpload != null) {
      this.fileUpload(lootPile);
    }
    else if (this.bingImageUrl !== this.createLootPileTemplateModal.imageUrl) {
      try {
        var regex = /(?:\.([^.]+))?$/;
        var extension = regex.exec(this.createLootPileTemplateModal.imageUrl)[1];
        extension = extension ? extension : 'jpg';
      } catch{ }
      this.fileUploadFromBing(this.createLootPileTemplateModal.imageUrl, extension, lootPile);
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
            this.createLootPileTemplateModal.imageUrl = data.ImageUrl;
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
            this.createLootPileTemplateModal.imageUrl = data.ImageUrl;
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
          //this.submit(itemMaster);
        },
        error => {
          //this.submit(itemMaster);
        });
  }

  private submit(lootPile: any) {
    if (this.button == VIEW.DUPLICATE.toUpperCase()) {
      this.duplicateLootPileTemplate(lootPile);
    } else {
      if (this.defaultImageSelected && !this.createLootPileTemplateModal.imageUrl) {
        let model = Object.assign({}, lootPile)
        model.imageUrl = this.defaultImageSelected
        this.addEditLootPile(model);
      } else {
        this.addEditLootPile(lootPile);
      }
    }
  }

  addEditLootPile(modal: any) {

    //currency START
    if (modal && modal.lootTemplateCurrency) {
      modal.lootTemplateCurrency.map(currency => {
        if (currency.command) {
          currency.amount = currency.command ? DiceService.rollDiceExternally(this.alertService, currency.command, this.customDices) : 0;
        }
      });
    }
    //currency END

    this.randomizationSearchInfo.map((x, index) => {
      x.sortOrder = index;
      x.qty = x.qty ? DiceService.rollDiceExternally(this.alertService, x.qty, this.customDices) : 0;
    });

    modal.ruleSetId = this.ruleSetId;
    modal.randomizationSearchInfo = this.randomizationSearchInfo;

    // modal.userID = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER).id
    this.isLoading = true;
    this.lootService.createLootPileTemplate<any>(modal)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let message = modal.lootTemplateId == 0 || modal.lootTemplateId === undefined ? "Random Loot has been created successfully." : " Random Loot has been updated successfully.";
          if (data !== "" && data !== null && data !== undefined && isNaN(parseInt(data))) message = data;
          this.alertService.showMessage(message, "", MessageSeverity.success);
          //if (modal.lootTemplateId == 0 || modal.lootTemplateId === undefined) {
          //  this.appService.updateChatWithLootMessage(true); //loot created...
          //}
          //if (data) {
          let id = data;
          if (!isNaN(parseInt(id))) {
            this.router.navigate(['/ruleset/loot-pile-details', id]);
            //this.event.emit({ lootTemplateId: id });
            this.sharedService.updateItemMasterDetailList(true);
          }
          //else
          //this.sharedService.updateItemMasterDetailList(true);
          //}
          //else {
          this.sharedService.updateItemMasterDetailList(true);
          //}
          this.sharedService.updateItemsList(true);

          this.close();
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

  duplicateLootPileTemplate(modal: any) {
    modal.RuleSetId = this.ruleSetId;
    this.isLoading = true;
    this.lootService.duplicateLootPileTemplate<any>(modal)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let message = " Random Loot has been duplicated successfully.";
          if (data !== "" && data !== null && data !== undefined)
            message = data;
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.sharedService.updateItemsList(true);
          //this.appService.updateChatWithLootMessage(true);
          this.sharedService.updateItemMasterDetailList(true);
          this.close();
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

  readTempUrl(event: any) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (event: any) => {
        this.createLootPileTemplateModal.imageUrl = event.target.result;
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
    this.bsModalRef.content.rulesetId = this.ruleSetId;
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
    this.bsModalRef.content.rulesetId = this.ruleSetId;
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
    this.bsModalRef.content.title = 'item';
    this.bsModalRef.content.image = img;
    this.bsModalRef.content.view = view;
    this.bsModalRef.content.errorImage = '../assets/images/DefaultImages/Item.jpg';
    //this.bsModalRef.content.imageChangedEvent = this.imageChangedEvent; //base 64 || URL
    this.bsModalRef.content.event.subscribe(data => {
      this.createLootPileTemplateModal.imageUrl = data.base64;
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

  //addItems(itemMaster: any) {
  //  debugger
  //  this.bsModalRef = this.modalService.show(AddLootPileComponent, {
  //    class: 'modal-primary modal-md',
  //    ignoreBackdropClick: true,
  //    keyboard: false
  //  });

  //  this.bsModalRef.content.title = 'Select Item';
  //  this.bsModalRef.content.button = 'SELECT';
  //  //this.bsModalRef.content.rulesetId = this._ruleSetId;
  //  //this.bsModalRef.content.itemId = itemMaster.lootId;
  //  //this.bsModalRef.content.itemName = itemMaster.containerName;
  //  //this.bsModalRef.content.contains = itemMaster.contains;
  //  //this.bsModalRef.content.containerItemId = itemMaster.containerItemId;

  //  //this.bsModalRef.content.event.subscribe(data => {
  //  //  debugger
  //  //  this.createLootPileTemplateModal.itemList = data.multiItemMasters;
  //  //});
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
    let _randomization = new randomization();
    _randomization.percentage = null;
    _randomization.qty = null;
    _randomization.isOr = true;
    _randomization.selectedItem = [];

    let indexToInsert = i + 1;
    _randomization.sortOrder = indexToInsert;
    this.randomizationInfo.splice(indexToInsert, 0, _randomization);

    // add remaining percentage out of 100
    let AndArray = [];
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
    });
    let currentOrCount = 0;

    AndArray.map((and) => {
      let isCurrentOrInWhichItemIsInsert = false;
      let totalPercent: number = 100;
      and.map((or) => {

        totalPercent = totalPercent - (+or.percentage);
        currentOrCount = currentOrCount + 1;
        if (currentOrCount == indexToInsert) {
          isCurrentOrInWhichItemIsInsert = true;
        }
      })
      if (totalPercent <= 100 && currentOrCount >= indexToInsert && isCurrentOrInWhichItemIsInsert) {
        this.randomizationInfo[indexToInsert].percentage = totalPercent;
      }

    });

  }

  // Parent OR method
  randomizationOR(i) {
    this.commonOR(i);
  }

  // Child or method
  randomizationOr(i) {
    this.commonOR(i);
  }
  randomizationAnd() {
    let _randomization = new randomization();
    _randomization.percentage = null;
    _randomization.qty = null;
    _randomization.isOr = false;
    this.randomizationInfo.push(_randomization);
  }
  removeRandom(item, index) {
    if (this.randomizationInfo[index].isOr) {
      this.randomizationInfo.splice(index, 1);
    } else {
      this.randomizationInfo.splice(index, 1);
      if (this.randomizationInfo[index]) {
        if (this.randomizationInfo[index].isOr) {
          this.randomizationInfo[index].isOr = false;
        }
      }
    }
  }
  SelectItem(item, i) {

    this.bsModalRef = this.modalService.show(SingleItemMonsterComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Add Item';
    this.bsModalRef.content.button = 'ADD';
    this.bsModalRef.content.rulesetID = this.ruleSetId;
    this.bsModalRef.content.SelectedItems = item.selectedItem;
    this.bsModalRef.content.event.subscribe(data => {
      if (data) {

        item.selectedItem = data;
      }
    });
  }
  validateRandomization(mt) {
    //if (!mt.isRandomizationEngine) {
    //  return true;
    //}

    let isValidPrecentage = true;
    let isValidItem = true;
    let isPercentageFieldsAreValid = true;
    let isQtyFieldsAreValid = true;

    let isCurrencyHavingValues = false;
    let isItemSelected = false;
    let isHavingPercentageOrQty = false;

    let AndArray = [];
    let OrArray = [];


    if (this.createLootPileTemplateModal && this.createLootPileTemplateModal.lootTemplateCurrency) {
      this.createLootPileTemplateModal.lootTemplateCurrency.map(c => {
        if (c.command) {
          isCurrencyHavingValues = true;
        }
      });
    }


    this.randomizationInfo.map((item, index) => {
      if (item.percentage != null && item.qty != null) {
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
      }

    });
    AndArray.map((and) => {
      if (!isCurrencyHavingValues) {
        let totalPercent: number = 0;
        and.map((or) => {
          if (or.percentage == undefined || or.percentage == null || or.percentage == '') {
            isPercentageFieldsAreValid = false;
          }
          if (or.qty == undefined || or.qty == null || or.qty == '') {
            isQtyFieldsAreValid = false;
          }
          totalPercent = totalPercent + (+or.percentage);
          if (!or.selectedItem || !or.selectedItem.length) {
            isValidItem = false;
          }
        })
        if (totalPercent > 100) {
          isValidPrecentage = false;
        }
      }

    });

    this.randomizationInfo.map(x => {
      if (!x.percentage || !x.qty && !x.selectedItem && !x.selectedItem.length && !isCurrencyHavingValues) {
        //isValidItem = false;
        isItemSelected = false;
      }
      if (x.selectedItem && x.selectedItem.length) {
        isItemSelected = true;
      }
      if (x.percentage || x.qty) {
        isHavingPercentageOrQty = true;
      } else {
        isHavingPercentageOrQty = false;
      }
    });
    if (!isCurrencyHavingValues && !isItemSelected) {
      let message = "Please select item or Currency and try again.";
      this.alertService.showMessage(message, "", MessageSeverity.error);
      return false;
    }
    if (isHavingPercentageOrQty) {
      let isHavingItem = false;
      this.randomizationInfo.map(x => {
        if (x.selectedItem && x.selectedItem.length) {
          isHavingItem = true;
        }
      });
      if (!isHavingItem) {
        let message = "Please select item and try again.";
        this.alertService.showMessage(message, "", MessageSeverity.error);
        return false;
      }
    }

    if (isItemSelected) {
      let validPercentageOrQty = true;
      this.randomizationInfo.map(x => {
        if (x.percentage == null || x.qty == null) {
          validPercentageOrQty = false;
        }
      });
      if (!validPercentageOrQty) {
        let message = "Please fill Percentage or Quantity and try again.";
        this.alertService.showMessage(message, "", MessageSeverity.error);
        return false;
      }
    }

    //if (!isPercentageFieldsAreValid || !isQtyFieldsAreValid || !isValidItem) {
    //  let message = "Please select item and try again.";
    //  this.alertService.showMessage(message, "", MessageSeverity.error);
    //}
    if (isValidPrecentage && isValidItem && isPercentageFieldsAreValid && isQtyFieldsAreValid) {
      return true;
    }
    else {
      if (!isValidItem) {
        let message = "Please select item and try again.";
        this.alertService.showMessage(message, "", MessageSeverity.error);
      }
      if (!isValidPrecentage) {
        let message = "Total percent chance for a section can't exceed 100%, Please adjust these values and try again.";
        this.alertService.showMessage(message, "", MessageSeverity.error);
      }
      return false;
    }
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

  SwitchTo() {
    this.searchFilter = !this.searchFilter;
  }

  randomizationSearchAnd() {
    let _randomizationSearch = new randomizationSearch();
    _randomizationSearch.qty = null;
    _randomizationSearch.records = null;
    _randomizationSearch.matchingString = null;
    _randomizationSearch.searchFields = null;
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
