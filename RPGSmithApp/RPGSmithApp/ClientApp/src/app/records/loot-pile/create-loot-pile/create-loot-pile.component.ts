import { Component, OnInit, EventEmitter } from '@angular/core';
import { Utilities } from '../../../core/common/utilities';
import { ImageError, VIEW, SYSTEM_GENERATED_MSG_TYPE, CHATACTIVESTATUS } from '../../../core/models/enums';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { PlatformLocation } from '@angular/common';
import { ImageSearchService } from '../../../core/services/shared/image-search.service';
import { FileUploadService } from '../../../core/common/file-upload.service';
import { ItemMasterService } from '../../../core/services/item-master.service';
import { SharedService } from '../../../core/services/shared.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AlertService, MessageSeverity, DialogType } from '../../../core/common/alert.service';
import { User } from '../../../core/models/user.model';
import { DBkeys } from '../../../core/common/db-keys';
import { DiceComponent } from '../../../shared/dice/dice/dice.component';
import { ImageSelectorComponent } from '../../../shared/image-interface/image-selector/image-selector.component';
import { LootService } from '../../../core/services/loot.service';
import { AppService1 } from '../../../app.service';
import { AddLootPileComponent } from '../add-loot-pile/add-loot-pile.component';
import { CreateLootPile } from '../../../core/models/view-models/loot-pile-create.model';
import { AddItemsLootPileComponent } from '../add-items-loot-pile/add-items-loot-pile.component';
import { CommonService } from '../../../core/services/shared/common.service';

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
  OldSelectedItems: any[] = [];
  itemQty: number[] = [];
  _view: any;
  isGM: boolean = false;

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
    private commonService: CommonService) {

    location.onPopState(() => this.modalService.hide(1));
    this.route.params.subscribe(params => { this.ruleSetId = params['id']; });

    this.sharedService.getCommandData().subscribe(diceCommand => {
      if (diceCommand.parentIndex === -1) {
        this.createLootPileModal.gold = diceCommand.command;
      } else if (diceCommand.parentIndex === -2) {
        this.createLootPileModal.silver = diceCommand.command;
      } else if (diceCommand.parentIndex === -3) {
        this.createLootPileModal.copper = diceCommand.command;
      } else if (diceCommand.parentIndex === -4) {
        this.createLootPileModal.platinum = diceCommand.command;
      } else if (diceCommand.parentIndex === -5) {
        this.createLootPileModal.electrum = diceCommand.command;
      }
    });

  }

  ngOnInit() {

    setTimeout(() => {
      this.fromDetail = this.bsModalRef.content.fromDetail == undefined ? false : this.bsModalRef.content.fromDetail;
      this.title = this.bsModalRef.content.title;
      this._view = this.button = this.bsModalRef.content.button;
      let _lootPileVM = this.bsModalRef.content.lootPileVM;
      let currencyList = this.bsModalRef.content.currencyTypesList;
      //this.itemMasterFormModal = this.itemMasterService.itemMasterModelData(_itemTemplateVM, _view);

      let isEditingWithoutDetail = this.bsModalRef.content.isEditingWithoutDetail ? true : false;
      if (isEditingWithoutDetail) {
        this.isLoading = true;
        this.itemMasterService.getLootPile<any>(_lootPileVM)
          .subscribe(data => {
            if (data) {
              //this.RuleSet = data.lootPileRuleSet;
              let RuleSet = data.lootPileRuleSet;
              this.lootPileItems = data.lootPileItems;
              _lootPileVM = this.itemMasterService.itemMasterModelData(data, "UPDATE");
              _lootPileVM.ruleSet = RuleSet;

              _lootPileVM = { lootId: _lootPileVM.lootId, ruleSetId: _lootPileVM.ruleSetId, name: _lootPileVM.itemName, imageUrl: _lootPileVM.itemImage, description: _lootPileVM.itemVisibleDesc, metatags: _lootPileVM.metatags, visible: _lootPileVM.isVisible, itemList: _lootPileVM.lootPileItems }

              this.createLootPileModal = _lootPileVM;

              let lootCrncy = Object.assign([], this.createLootPileModal.itemMasterLootCurrency);
              if (currencyList) {
                currencyList.map(rulesetCurrency => {
                  if (this.createLootPileModal.itemMasterLootCurrency && this.createLootPileModal.itemMasterLootCurrency.length) {
                    let monsters = this.createLootPileModal.itemMasterLootCurrency.find(x => x.currencyTypeId == rulesetCurrency.currencyTypeId);
                    if (!monsters) {
                      lootCrncy.push({
                        itemMasterLootCurrencyId: 0,
                        amount: null,
                        command: null,
                        name: rulesetCurrency.name,
                        baseUnit: rulesetCurrency.baseUnit,
                        weightValue: rulesetCurrency.weightValue,
                        sortOrder: rulesetCurrency.sortOrder,
                        lootId: this.createLootPileModal.lootId,
                        currencyTypeId: rulesetCurrency.currencyTypeId,
                        isDeleted: rulesetCurrency.isDeleted,
                        itemMasterLoot: null
                      });
                    } else {
                      monsters.name = rulesetCurrency.name;
                      monsters.amount = monsters.amount ? monsters.amount : null;
                    }
                  }
                });
              }

              this.createLootPileModal.itemMasterLootCurrency = lootCrncy && lootCrncy.length ? lootCrncy : currencyList;

              //this.createLootPileModal.itemMasterLootCurrency = this.createLootPileModal.itemMasterLootCurrency ?
              //  (this.createLootPileModal.itemMasterLootCurrency.length > 0 ? this.createLootPileModal.itemMasterLootCurrency : currencyList)
              //  : currencyList;

              //this._ruleSetId = this.itemMasterFormModal.ruleSetId;
              if (_lootPileVM.itemList) {
                this.selectedItems = Object.assign([], _lootPileVM.itemList);
                if (this.selectedItems && this.selectedItems.length) {
                  this.OldSelectedItems = Object.assign([], this.selectedItems);
                  this.selectedItems.map((x) => {
                    this.lootPileItems.push(x);
                  });
                  this.lootPileItems.sort(function (a, b) {
                    if (a.itemName < b.itemName) { return -1; }
                    if (a.itemName > b.itemName) { return 1; }
                    return 0;
                  });
                }
              }

              this.ruleSetId = this.bsModalRef.content.ruleSetId;
              if (this.createLootPileModal.metatags) {
                if (this.createLootPileModal.metatags !== '' && this.createLootPileModal.metatags !== undefined)
                  this.metatags = this.createLootPileModal.metatags.split(",");
              }
              this.bingImageUrl = this.createLootPileModal.imageUrl;
              this.GetLootPileItemsToAdd();
              this.initialize();
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
        this.createLootPileModal = _lootPileVM;

        let lootCrncy = Object.assign([], this.createLootPileModal.itemMasterLootCurrency);
        if (currencyList) {
          currencyList.map(rulesetCurrency => {
            if (this.createLootPileModal.itemMasterLootCurrency && this.createLootPileModal.itemMasterLootCurrency.length) {
              let monsters = this.createLootPileModal.itemMasterLootCurrency.find(x => x.currencyTypeId == rulesetCurrency.currencyTypeId);
              if (!monsters) {
                lootCrncy.push({
                  itemMasterLootCurrencyId: 0,
                  amount: null,
                  command: null,
                  name: rulesetCurrency.name,
                  baseUnit: rulesetCurrency.baseUnit,
                  weightValue: rulesetCurrency.weightValue,
                  sortOrder: rulesetCurrency.sortOrder,
                  lootId: this.createLootPileModal.lootId,
                  currencyTypeId: rulesetCurrency.currencyTypeId,
                  isDeleted: rulesetCurrency.isDeleted,
                  itemMasterLoot: null
                });
              } else {
                monsters.name = rulesetCurrency.name;
                monsters.amount = monsters.amount ? monsters.amount : null;
              }
            }
          });
        }

        this.createLootPileModal.itemMasterLootCurrency = lootCrncy && lootCrncy.length ? lootCrncy : currencyList;

        //this.createLootPileModal.itemMasterLootCurrency = this.createLootPileModal.itemMasterLootCurrency ?
        //  (this.createLootPileModal.itemMasterLootCurrency.length > 0 ? this.createLootPileModal.itemMasterLootCurrency : currencyList)
        //  : currencyList;

        //this._ruleSetId = this.itemMasterFormModal.ruleSetId;
        if (_lootPileVM.itemList) {
          this.selectedItems = Object.assign([], _lootPileVM.itemList);
          if (this.selectedItems && this.selectedItems.length) {
            this.OldSelectedItems = Object.assign([], this.selectedItems);
            this.selectedItems.map((x) => {
              this.lootPileItems.push(x);
            })
            this.lootPileItems.sort(function (a, b) {
              if (a.itemName < b.itemName) { return -1; }
              if (a.itemName > b.itemName) { return 1; }
              return 0;
            });
          }
        }

        this.ruleSetId = this.bsModalRef.content.ruleSetId;
        if (this.createLootPileModal.metatags) {
          if (this.createLootPileModal.metatags !== '' && this.createLootPileModal.metatags !== undefined)
            this.metatags = this.createLootPileModal.metatags.split(",");
        }

        this.bingImageUrl = this.createLootPileModal.imageUrl;

        this.GetLootPileItemsToAdd();
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
        if (data) {
          if (data.length) {
            data.map((x) => {
              this.lootPileItems.push(x);
            });
            this.lootPileItems.sort(function (a, b) {
              if (a.itemName < b.itemName) { return -1; }
              if (a.itemName > b.itemName) { return 1; }
              return 0;
            });
          }
        }


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
    let removeItemFlag = false;
    let lootNames = '';
    if (this.button == "UPDATE" && this.OldSelectedItems && this.OldSelectedItems.length && this.selectedItems && this.selectedItems.length) {
      this.OldSelectedItems.map((x) => {
        if (!this.selectedItems.find(item => item.lootId == x.lootId)) {
          removeItemFlag = true;
          lootNames += x.itemName + '</br>';
        }
      })

    }
    else if (this.button == "UPDATE" && this.OldSelectedItems && this.OldSelectedItems.length && this.selectedItems && this.selectedItems.length == 0) {
      this.OldSelectedItems.map((x) => {
        lootNames += x.itemName + '</br>';
      })
      removeItemFlag = true;
    }
    if (removeItemFlag) {
      //let message = 'Removing this Loot Item from the Pile will delete the item, If you want to move the item elsewhere use the "Move Loot" function. Would you like to proceed and delete this loot item?';
      let message = "Removing Loot Item(s) from this Pile will delete the item. If you would like to move the loot item(s) elsewhere use the 'Move Loot' function. Would you like to proceed and delete the loot item(s) listed below?</br></br>"

        + lootNames;
      this.alertService.showDialog(message,
        DialogType.confirm, () => this.validateSubmit(lootPile), null, 'Yes', 'No');
    }
    else {
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

    this.isLoading = true;
    let _msg = lootPile.lootId == 0 || lootPile.lootId === undefined ? "Creating Loot Pile.." : "Updating Loot Pile..";
    if (this.button == VIEW.DUPLICATE.toUpperCase()) _msg = "Duplicating loot Pile Template..";
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
    if (lootPile.itemMasterLootCurrency) {
      lootPile.itemMasterLootCurrency = lootPile.itemMasterLootCurrency.map(x => {
        x.amount = x.command ? (x.amount ? x.amount : 0) : 0; return x;
      });
    }
    let lootItems = [];
    let ItemTemplates = [];
    let lootTemplates = [];
    if (this.selectedItems) {
      this.selectedItems.map(x => {
        //lootItems.push({ itemMasterId: x.itemMasterId, qty: x.qty, isBundle: x.isBundle });
        if (x.lootId) {
          lootItems.push(x);
        }
        else if (x.itemMasterId) {
          ItemTemplates.push(x);
        }
        else if (x.lootTemplateId) {
          lootTemplates.push(x);
        }

      });
    }
    lootPile.lootItemsList = lootItems;
    lootPile.itemTemplateList = ItemTemplates;
    lootPile.lootTemplateList = lootTemplates;

    let lootPileVM = {
      lootId: lootPile.lootId,
      ruleSetId: lootPile.ruleSetId,
      itemName: lootPile.name,
      itemImage: lootPile.imageUrl,
      itemVisibleDesc: lootPile.description,
      gmOnly: lootPile.gmOnly,
      metatags: lootPile.metatags,
      isVisible: lootPile.visible,
      lootPileItems: lootPile.lootItemsList,
      itemTemplateToDeploy: lootPile.itemTemplateList,
      lootTemplateToDeploy: lootPile.lootTemplateList,
      itemMasterLootCurrency: lootPile.itemMasterLootCurrency
    }

    if (this.button == VIEW.DUPLICATE.toUpperCase()) {
      this.duplicateItemMaster(lootPileVM);
    } else {
      if (this.defaultImageSelected && !this.createLootPileModal.imageUrl) {
        let model = Object.assign({}, lootPileVM)
        model.itemImage = this.defaultImageSelected
        this.addEditLootPile(model);
      } else {
        this.addEditLootPile(lootPileVM);
      }
    }

  }

  addEditLootPile(modal: any) {
    modal.ruleSetId = this.ruleSetId;
    // modal.userID = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER).id
    this.isLoading = true;
    this.lootService.createLootPile<any>(modal)
      .subscribe(async (data) => {
        await this.commonService.deleteRecordFromIndexedDB("loot", 'ItemMaster', 'lootId', modal, false);
        this.isLoading = false;
        this.alertService.stopLoadingMessage();
        let message = modal.lootId == 0 || modal.lootId === undefined ? "Loot Pile has been created successfully." : " Loot Pile has been updated successfully.";
        if (data !== "" && data !== null && data !== undefined && isNaN(parseInt(data))) message = data;
        this.alertService.showMessage(message, "", MessageSeverity.success);

        this.event.emit(true);

        this.close();

        if (modal.lootId == 0 || modal.lootId === undefined) {
          if (modal.isVisible) {
            if (this.localStorage.localStorageGetItem(DBkeys.ChatInNewTab) && (this.localStorage.localStorageGetItem(DBkeys.ChatActiveStatus) == CHATACTIVESTATUS.ON)) {
              let ChatWithDiceRoll = [];
              if (this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow)) {
                ChatWithDiceRoll = this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow);
              }
              let chatMsgObject = { type: SYSTEM_GENERATED_MSG_TYPE.CHAT_WITH_LOOT_MESSAGE, obj: true }
              ChatWithDiceRoll.push(chatMsgObject);
              this.localStorage.localStorageSetItem(DBkeys.ChatMsgsForNewChatWindow, ChatWithDiceRoll);
            } else {
              this.appService.updateChatWithLootMessage(true); //loot created...
            }
          }

        }
        //if (this.fromDetail) {
        //if (data) {
        let id = data;
        if (!isNaN(parseInt(id))) {
          this.router.navigate(['/ruleset/loot-pile-details', id]);
          this.event.emit({ lootPileId: id });
          this.sharedService.updateItemMasterDetailList(true);
        }
        //else
        this.sharedService.updateItemMasterDetailList(true);
        //}
        //else {
        this.sharedService.updateItemMasterDetailList(true);
        //}
        //}
        this.sharedService.updateItemsList(true);
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
    modal.RuleSetId = this.ruleSetId;
    this.isLoading = true;
    this.lootService.duplicateLootPile<any>(modal)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let message = " Loot Pile has been duplicated successfully.";
          if (data !== "" && data !== null && data !== undefined)
            message = data;
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.close();
          //if (this.fromDetail)
          //  this.router.navigate(['/ruleset/item-master', this._ruleSetId]);
          //else
          this.sharedService.updateItemsList(true);
          if (modal.isVisible) {
            if (this.localStorage.localStorageGetItem(DBkeys.ChatInNewTab) && (this.localStorage.localStorageGetItem(DBkeys.ChatActiveStatus) == CHATACTIVESTATUS.ON)) {
              let ChatWithDiceRoll = [];
              if (this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow)) {
                ChatWithDiceRoll = this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow);
              }
              let chatMsgObject = { type: SYSTEM_GENERATED_MSG_TYPE.CHAT_WITH_LOOT_MESSAGE, obj: true }
              ChatWithDiceRoll.push(chatMsgObject);
              this.localStorage.localStorageSetItem(DBkeys.ChatMsgsForNewChatWindow, ChatWithDiceRoll);
            } else {
              this.appService.updateChatWithLootMessage(true);
            }

          }
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

  //addItems(itemMaster: any) {
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

  //  this.bsModalRef.content.event.subscribe(data => {
  //    debugger
  //    this.createLootPileModal.itemList = data.multiItemMasters;
  //  });
  //}

  get itemSettings() {
    return {
      primaryKey: "lootId",
      labelKey: "itemName",
      text: "Search Loot",
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

  selectedLootPileItemsListChanged(event) { }

  SelectLootPileItems() {
    this.bsModalRef = this.modalService.show(AddItemsLootPileComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Add Loot';
    this.bsModalRef.content.button = 'ADD';
    this.bsModalRef.content.LootPileDetail = this.createLootPileModal;
    this.bsModalRef.content.selectedItems = this.selectedItems;
    this.bsModalRef.content.ViewType = this._view;
    this.bsModalRef.content.event.subscribe(data => {
      if (data) {
        this.selectedItems = data;
      }
    });
  }



}
