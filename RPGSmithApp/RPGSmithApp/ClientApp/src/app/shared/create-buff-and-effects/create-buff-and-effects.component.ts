import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { ImageError, VIEW } from '../../core/models/enums';
import { Utilities } from '../../core/common/utilities';
import { SharedService } from '../../core/services/shared.service';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { AuthService } from '../../core/auth/auth.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { FileUploadService } from '../../core/common/file-upload.service';
import { DBkeys } from '../../core/common/db-keys';
import { User } from '../../core/models/user.model';
import { ImageSelectorComponent } from '../image-interface/image-selector/image-selector.component';
import { DiceComponent } from '../dice/dice/dice.component';
import { PlatformLocation } from '@angular/common';
import { BuffAndEffect } from '../../core/models/view-models/buff-and-effect.model';
import { BuffAndEffectService } from '../../core/services/buff-and-effect.service';
import { ServiceUtil } from '../../core/services/service-util';
import { RulesetService } from '../../core/services/ruleset.service';
import { CommonService } from '../../core/services/shared/common.service';

@Component({
  selector: 'app-create-buff-and-effects',
  templateUrl: './create-buff-and-effects.component.html',
  styleUrls: ['./create-buff-and-effects.component.scss']
})
export class CreateBuffAndEffectsComponent implements OnInit {

  title: string;
  showWebButtons: boolean = false;
  isLoading = false;
  _ruleSetId: number;
  buffAndEffectFormModal: any = new BuffAndEffect();
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
  button: string;
  characterID: number = 0;
  IsFromCharacter: boolean = false;
  selectedBuffAndEffectsList: any[] = [];
  isGM: boolean = false;
  isGM_Only: boolean = false;
  options(placeholder?: string): Object {
    return Utilities.optionsFloala(160, placeholder);
  }

  constructor(
    private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
    private sharedService: SharedService,
    private buffAndEffectService: BuffAndEffectService,
    private fileUploadService: FileUploadService,
    private rulesetService: RulesetService,
    private location: PlatformLocation,
    private commonService: CommonService) {
    location.onPopState(() => this.modalService.hide(1));
    this.route.params.subscribe(params => { this._ruleSetId = params['id']; });

    this.sharedService.getCommandData().subscribe(diceCommand => {

      if (diceCommand.parentIndex === -1) {
        this.buffAndEffectFormModal.command = diceCommand.command;
      } else {
        if (this.buffAndEffectFormModal.buffAndEffectCommandVM.length > 0) {
          this.buffAndEffectFormModal.buffAndEffectCommandVM.forEach(item => {
            var index = this.buffAndEffectFormModal.buffAndEffectCommandVM.indexOf(item);
            if (index === diceCommand.parentIndex) {
              this.buffAndEffectFormModal.buffAndEffectCommandVM[index].command = diceCommand.command;
            }
          });
        }
      }
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.characterID = this.bsModalRef.content.characterID ? this.bsModalRef.content.characterID : 0;
      this.IsFromCharacter = this.bsModalRef.content.IsFromCharacter ? this.bsModalRef.content.IsFromCharacter : false;
      this.selectedBuffAndEffectsList = this.bsModalRef.content.selectedBuffAndEffectsList ? this.bsModalRef.content.selectedBuffAndEffectsList : [];

      this.fromDetail = this.bsModalRef.content.fromDetail == undefined ? false : this.bsModalRef.content.fromDetail;
      this.title = this.bsModalRef.content.title;
      let _view = this.button = this.bsModalRef.content.button;
      let _buffAndEffectVM = this.bsModalRef.content.buffAndEffectVM;
      let isEditingWithoutDetail = this.bsModalRef.content.isEditingWithoutDetail ? true : false;
      this.isGM_Only = this.bsModalRef.content.isGM_Only;
      if (isEditingWithoutDetail) {
        if (this.IsFromCharacter) {
          this.isLoading = true;
          let userID = this.bsModalRef.content.userID;
          this.buffAndEffectService.getCharacterBuffAndEffectById<any>(_buffAndEffectVM.characterBuffAandEffectId)
            .subscribe(data => {
              if (data)
                _buffAndEffectVM = this.buffAndEffectService.BuffAndEffectsModelData(data, "UPDATE");
              if (!_buffAndEffectVM.ruleset) {
                _buffAndEffectVM.ruleset = data.ruleSet;
              }
              //this.character = data.character;
              //if (this.character) {
              //  if (this.character.characterId) {
              //    this.gameStatus(this.character.characterId);
              //    this.isAlreadyAssigned = true;
              //  }
              //}

              this._ruleSetId = _buffAndEffectVM.ruleSetId;
              this.rulesetService.GetCopiedRulesetID(_buffAndEffectVM.ruleSetId, userID).subscribe(data => {
                let id: any = data
                //this.ruleSetId = id;
                this._ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
                this.buffAndEffectFormModal = this.buffAndEffectService.BuffAndEffectsModelData(_buffAndEffectVM, _view);
                try {
                  if (this.buffAndEffectFormModal.metatags !== '' && this.buffAndEffectFormModal.metatags !== undefined)
                    this.metatags = this.buffAndEffectFormModal.metatags.split(",");

                } catch (err) { }
                this.bingImageUrl = this.buffAndEffectFormModal.imageUrl;
                if (!this.buffAndEffectFormModal.imageUrl) {
                  this.defaultImageSelected = ServiceUtil.DefaultBuffAndEffectImage;
                }
                if (this.bsModalRef.content.button == 'UPDATE' || 'DUPLICATE') {
                  this._ruleSetId = this.bsModalRef.content.rulesetID ? this.bsModalRef.content.rulesetID : this.buffAndEffectFormModal.ruleSetId;
                }
                else {
                  this._ruleSetId = this.buffAndEffectFormModal.ruleSetId;
                }
                this.isLoading = false;

                this.initialize();
              }, error => {
                this.isLoading = false;
                let Errors = Utilities.ErrorDetail("", error);
                if (Errors.sessionExpire) {
                  //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                  this.authService.logout(true);
                }
              }, () => { });

            }, error => {
              this.isLoading = false;
              let Errors = Utilities.ErrorDetail("", error);
              if (Errors.sessionExpire) {
                //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                this.authService.logout(true);
              }
            }, () => { });
        } else {
          let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
          this.isLoading = true;
          this.buffAndEffectService.getBuffAndEffectById<any>(_buffAndEffectVM.buffAndEffectId)
            .subscribe(data => {

              if (data) {
                _buffAndEffectVM = this.buffAndEffectService.BuffAndEffectsModelData(data, "UPDATE");
                if (!_buffAndEffectVM.ruleset) {
                  _buffAndEffectVM.ruleset = data.ruleSet;
                }
                _buffAndEffectVM.isAssignedToAnyCharacter = data.isAssignedToAnyCharacter;
                this._ruleSetId = _buffAndEffectVM.ruleSetId;
                this.rulesetService.GetCopiedRulesetID(_buffAndEffectVM.ruleSetId, user.id).subscribe(data => {
                  let id: any = data
                  //this.ruleSetId = id;
                  this._ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

                  this.buffAndEffectFormModal = this.buffAndEffectService.BuffAndEffectsModelData(_buffAndEffectVM, _view);
                  try {
                    if (this.buffAndEffectFormModal.metatags !== '' && this.buffAndEffectFormModal.metatags !== undefined)
                      this.metatags = this.buffAndEffectFormModal.metatags.split(",");

                  } catch (err) { }
                  this.bingImageUrl = this.buffAndEffectFormModal.imageUrl;
                  if (!this.buffAndEffectFormModal.imageUrl) {
                    this.defaultImageSelected = ServiceUtil.DefaultBuffAndEffectImage;
                  }
                  if (this.bsModalRef.content.button == 'UPDATE' || 'DUPLICATE') {
                    this._ruleSetId = this.bsModalRef.content.rulesetID ? this.bsModalRef.content.rulesetID : this.buffAndEffectFormModal.ruleSetId;
                  }
                  else {
                    this._ruleSetId = this.buffAndEffectFormModal.ruleSetId;
                  }

                  this.isLoading = false;

                  this.initialize();

                }, error => {
                  this.isLoading = false;
                  console.log();
                  let Errors = Utilities.ErrorDetail("", error);
                  if (Errors.sessionExpire) {
                    //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                    this.authService.logout(true);
                  }
                }, () => { });
              }
              else {
                this.isLoading = false;
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

      } else {
        this.buffAndEffectFormModal = this.buffAndEffectService.BuffAndEffectsModelData(_buffAndEffectVM, _view);
        try {
          if (this.buffAndEffectFormModal.metatags !== '' && this.buffAndEffectFormModal.metatags !== undefined)
            this.metatags = this.buffAndEffectFormModal.metatags.split(",");

        } catch (err) { }
        this.bingImageUrl = this.buffAndEffectFormModal.imageUrl;
        if (!this.buffAndEffectFormModal.imageUrl) {
          this.defaultImageSelected = ServiceUtil.DefaultBuffAndEffectImage;
        }
        if (this.bsModalRef.content.button == 'UPDATE' || 'DUPLICATE') {
          this._ruleSetId = this.bsModalRef.content.rulesetID ? this.bsModalRef.content.rulesetID : this.buffAndEffectFormModal.ruleSetId;
        }
        else {
          this._ruleSetId = this.buffAndEffectFormModal.ruleSetId;
        }

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
      if (this.buffAndEffectFormModal.buffAndEffectId) {
        this.isLoading = true;
        this.buffAndEffectService.getBuffAndEffectCommands_sp<any>(this.buffAndEffectFormModal.buffAndEffectId)
          .subscribe(data => {
            this.buffAndEffectFormModal.buffAndEffectCommandVM = data;
            this.isLoading = false;
          }, error => { }, () => { this.isLoading = false; });
      }
    }
  }

  addCommand(buffAndEffectCommand: any): void {
    let _buffAndEffectCommandId = buffAndEffectCommand == undefined ? [] : buffAndEffectCommand;
    _buffAndEffectCommandId.push({ buffAndEffectCommandId: 0, command: '', name: '' });
    this.buffAndEffectFormModal.buffAndEffectCommandVM = _buffAndEffectCommandId;
  }

  removeCommand(command: any): void {
    this.buffAndEffectFormModal.buffAndEffectCommandVM
      .splice(this.buffAndEffectFormModal.buffAndEffectCommandVM.indexOf(command), 1);
  }



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
  validateSubmit(buffAndEffect: any) {

    if (!this.buffAndEffectFormModal.imageUrl) {
      this.alertService.showMessage("Image field is required.", "", MessageSeverity.error);
      return false;
    }


    if (buffAndEffect.ruleSetId === 0 || buffAndEffect.ruleSetId === undefined)
      buffAndEffect.ruleSetId = this._ruleSetId;

    this.isLoading = true;
    let _msg = buffAndEffect.buffAndEffectId === 0 || buffAndEffect.buffAndEffectId === undefined ? "Creating Buff & Effect.." : "Updating Buff & Effect..";
    if (this.buffAndEffectFormModal.view === VIEW.DUPLICATE) _msg = "Duplicating Buff & Effect..";
    this.alertService.startLoadingMessage("", _msg);

    let tagsValue = this.metatags.map(x => {
      if (x.value == undefined) return x;
      else return x.value;
    });
    buffAndEffect.metatags = tagsValue.join(', ');




    if (this.fileToUpload != null) {
      this.fileUpload(buffAndEffect);
    }
    else if (this.bingImageUrl !== this.buffAndEffectFormModal.imageUrl) {
      try {
        var regex = /(?:\.([^.]+))?$/;
        var extension = regex.exec(this.buffAndEffectFormModal.imageUrl)[1];
        extension = extension ? extension : 'jpg';
      } catch{ }
      this.fileUploadFromBing(this.buffAndEffectFormModal.imageUrl, extension, buffAndEffect);
    }
    else {
      this.submit(buffAndEffect);
    }


  }
  submitForm(buffAndEffect: any) {
    this.validateSubmit(buffAndEffect);
  }
  private fileUploadFromBing(file: string, ext: string, buffAndEffect: any) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout(true);
    else {
      this.fileUploadService.fileUploadFromURL<any>(user.id, file, ext)
        .subscribe(
          data => {
            this.buffAndEffectFormModal.imageUrl = data.ImageUrl;
            //this.rulesetFormModal.thumbnailUrl = data.ThumbnailUrl;
            this.submit(buffAndEffect);
          },
          error => {
            let Errors = Utilities.ErrorDetail('Error', error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            } else this.submit(buffAndEffect);
          });
    }
  }
  private fileUpload(buffAndEffect: any) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout(true);
    else {
      this.fileUploadService.fileUploadByUser<any>(user.id, this.fileToUpload)
        .subscribe(
          data => {
            this.buffAndEffectFormModal.imageUrl = data.ImageUrl;
            this.submit(buffAndEffect);
          },
          error => {
            let Errors = Utilities.ErrorDetail('Error', error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            } else this.submit(buffAndEffect);
          });
    }
  }



  private submit(buffAndEffect: any) {

    if (this.buffAndEffectFormModal.view === VIEW.DUPLICATE) {
      this.duplicateBuffAndEffect(buffAndEffect);
    }

    else {
      if (this.defaultImageSelected && !this.buffAndEffectFormModal.imageUrl) {
        let model = Object.assign({}, buffAndEffect)
        model.imageUrl = this.defaultImageSelected
        this.addEditBuffAndEffect(model);
      } else {
        this.addEditBuffAndEffect(buffAndEffect);
      }

    }
  }

  private addEditBuffAndEffect(modal: BuffAndEffect) {
    modal.ruleSetId = this._ruleSetId;
    this.isLoading = true;
    this.buffAndEffectService.createBuffAndEffect<any>(modal, this.IsFromCharacter, this.characterID)
      .subscribe(async (data) => {
        await this.commonService.deleteRecordFromIndexedDB("buffAndEffects", 'buffAndEffects', 'buffAndEffectId', modal, false);
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let message = modal.buffAndEffectId == 0 || modal.buffAndEffectId === undefined ? "Buff & Effect has been created successfully." : "Buff & Effect has been updated successfully.";

          this.alertService.showMessage(message, "", MessageSeverity.success);


          //if (this.fromDetail)
          if (this.IsFromCharacter) {
            this.sharedService.updateCharactersCharacterStatsBuffs(data);

          }

          else if (this.fromDetail) {
            if (data) {
              let id = data;
              if (!isNaN(parseInt(id))) {
                this.router.navigate(['/ruleset/buff-effect-details', id]);
                this.event.emit({ buffAndEffectId: id });
                //this.sharedService.updateItemMasterDetailList(true);
              }
              else {
                this.sharedService.updateBuffAndEffectList(true);
              }
            }
            else {
              this.sharedService.updateBuffAndEffectList(true);
            }
          }
          else {
            this.event.emit(true);
            this.sharedService.updateBuffAndEffectList(true);
          }
          this.close();
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = modal.buffAndEffectId == 0 || modal.buffAndEffectId === undefined ? "Unable to Create " : "Unable to Update ";
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

  private duplicateBuffAndEffect(modal: BuffAndEffect) {
    modal.ruleSetId = this._ruleSetId;
    this.isLoading = true;
    this.buffAndEffectService.duplicateBuffAndEffect<any>(modal, this.IsFromCharacter, this.characterID)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let message = "Buff & Effect has been duplicated successfully.";
          if (data !== "" && data !== null && data !== undefined) message = data;
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.close();
          this.sharedService.updateBuffAndEffectList(true);
          if (this.IsFromCharacter) {

          }

          else if (this.fromDetail)
            this.router.navigate(['/ruleset/buff-effect', this._ruleSetId]);

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
        this.buffAndEffectFormModal.imageUrl = event.target.result;
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
    this.bsModalRef.content.title = 'buff-and-effect';
    this.bsModalRef.content.image = img;
    this.bsModalRef.content.view = view;
    this.bsModalRef.content.errorImage = ServiceUtil.DefaultBuffAndEffectImage;
    //this.bsModalRef.content.imageChangedEvent = this.imageChangedEvent; //base 64 || URL
    this.bsModalRef.content.event.subscribe(data => {
      this.buffAndEffectFormModal.imageUrl = data.base64;
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
