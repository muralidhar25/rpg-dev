import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Ability } from '../../core/models/view-models/ability.model';
import { ImageError, VIEW } from '../../core/models/enums';
import { Utilities } from '../../core/common/utilities';
import { SharedService } from '../../core/services/shared.service';
import { AbilityService } from '../../core/services/ability.service';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { AuthService } from '../../core/auth/auth.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { CharacterAbilityService } from '../../core/services/character-abilities.service';
import { FileUploadService } from '../../core/common/file-upload.service';
import { ImageSearchService } from '../../core/services/shared/image-search.service';
import { DBkeys } from '../../core/common/db-keys';
import { User } from '../../core/models/user.model';
import { ImageSelectorComponent } from '../image-interface/image-selector/image-selector.component';
import { DiceComponent } from '../dice/dice/dice.component';
import { PlatformLocation } from '@angular/common';
import { RulesetService } from '../../core/services/ruleset.service';
import { CommonService } from '../../core/services/shared/common.service';

@Component({
  selector: 'app-create-abilities',
  templateUrl: './create-abilities.component.html',
  styleUrls: ['./create-abilities.component.scss']
})
export class CreateAbilitiesComponent implements OnInit {

  title: string;
  showWebButtons: boolean = false;
  isLoading = false;
  _ruleSetId: number;
  abilityFormModal: any = new Ability();
  fileToUpload: File = null;
  commandList = [];
  metatags = [];
  level = [];
  fromDetail: boolean = false;
  isFromCharacter: boolean = false;
  isFromCharacterId: number;
  isFromCharacterAbilityId: number;
  isFromCharacterAbilityCurrent: number;
  isFromCharacterAbilityMax: number;
  isFromCharacterAbilityEnable: boolean = false;
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
  isGM: boolean = false;
  isGM_Only: boolean = false;
  ruleSet: any;
  options(placeholder?: string): Object {
    return Utilities.optionsFloala(160, placeholder);
  }

  constructor(
    private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
    private sharedService: SharedService,
    private abilityService: AbilityService, private characterAbilityService: CharacterAbilityService,
    private fileUploadService: FileUploadService, private imageSearchService: ImageSearchService,
    private rulesetService: RulesetService,
    private location: PlatformLocation,
    private commonService: CommonService) {
    location.onPopState(() => this.modalService.hide(1));
    this.route.params.subscribe(params => { this._ruleSetId = params['id']; });

    this.sharedService.getCommandData().subscribe(diceCommand => {

      if (diceCommand.parentIndex === -1) {
        this.abilityFormModal.command = diceCommand.command;
      } else {
        if (this.abilityFormModal.abilityCommandVM.length > 0) {
          this.abilityFormModal.abilityCommandVM.forEach(item => {
            var index = this.abilityFormModal.abilityCommandVM.indexOf(item);
            if (index === diceCommand.parentIndex) {
              this.abilityFormModal.abilityCommandVM[index].command = diceCommand.command;
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
      this.isFromCharacterAbilityId = this.bsModalRef.content.isFromCharacterAbilityId == undefined ? 0 : this.bsModalRef.content.isFromCharacterAbilityId;
      this.isFromCharacterAbilityEnable = this.bsModalRef.content.isFromCharacterAbilityEnable == undefined ? false : this.bsModalRef.content.isFromCharacterAbilityEnable;
      this.isFromCharacterAbilityCurrent = this.bsModalRef.content.isFromCharacterAbilityCurrent == undefined ? 0 : this.bsModalRef.content.isFromCharacterAbilityCurrent;
      this.isFromCharacterAbilityMax = this.bsModalRef.content.isFromCharacterAbilityMax == undefined ? 0 : this.bsModalRef.content.isFromCharacterAbilityMax;
      this.title = this.bsModalRef.content.title;
      let _view = this.button = this.bsModalRef.content.button;
      let _abilityVM = this.bsModalRef.content.abilityVM;
      let isEditingWithoutDetail = this.bsModalRef.content.isEditingWithoutDetail ? true : false;
      this.isGM_Only = this.bsModalRef.content.isGM_Only;

      let ruleSetId: number = this.localStorage.getDataObject(DBkeys.RULESET_ID);
      this.rulesetService.getRulesetById<any>(ruleSetId).subscribe(data => {
        if (data) {
          this.ruleSet = data;
        }
      }, error => { });

      if (isEditingWithoutDetail) {
        if (this.isFromCharacter) {
          this.isLoading = true;
          let userID = this.bsModalRef.content.userID;

          this.characterAbilityService.getCharacterAbilityById_Cache<any>(_abilityVM.characterAbilityId)
            .subscribe(data => {
              _abilityVM = this.characterAbilityService.abilityModelDetailData(data, "UPDATE");
              _abilityVM.currentNumberOfUses = data.currentNumberOfUses ? data.currentNumberOfUses : 0;
              _abilityVM.maxNumberOfUses = data.maxNumberOfUses ? data.maxNumberOfUses : 0;
              //this.characterId = data.characterId;
              //this.character = data.character;
              //this.gameStatus(this.character.characterId);



              this.abilityFormModal = this.abilityService.abilityModelData(_abilityVM, _view);
              this.abilityFormModal.isFromCharacter = this.isFromCharacter;
              this.abilityFormModal.isFromCharacterId = this.isFromCharacterId;
              this.abilityFormModal.isFromCharacterAbilityId = this.isFromCharacterAbilityId;
              this.abilityFormModal.characterId = this.abilityFormModal.characterId ? this.abilityFormModal.characterId : this.isFromCharacterId;
              this.abilityFormModal.currentNumberOfUses = this.abilityFormModal.currentNumberOfUses ? this.abilityFormModal.currentNumberOfUses : 0;
              this.abilityFormModal.maxNumberOfUses = this.abilityFormModal.maxNumberOfUses ? this.abilityFormModal.maxNumberOfUses : 0;

              this.selectedBuffAndEffects = this.abilityFormModal.abilityBuffAndEffects.map(x => { return x.buffAndEffect; });

              try {
                if (this.abilityFormModal.metatags !== '' && this.abilityFormModal.metatags !== undefined)
                  this.metatags = this.abilityFormModal.metatags.split(",");
                if (this.abilityFormModal.level !== '' && this.abilityFormModal.level !== undefined)
                  this.level = this.abilityFormModal.level.split(",");
              } catch (err) { }
              this.bingImageUrl = this.abilityFormModal.imageUrl;
              if (!this.abilityFormModal.imageUrl) {
                this.imageSearchService.getDefaultImage<any>('ability')
                  .subscribe(data => {
                    this.defaultImageSelected = data.imageUrl.result
                  }, error => {
                  },
                    () => { });
              }


              this.rulesetService.GetCopiedRulesetID(_abilityVM.ruleSetId, userID).subscribe(data => {
                let id: any = data
                this._ruleSetId = id;

                if (this.bsModalRef.content.button == 'UPDATE' || 'DUPLICATE') {
                  this._ruleSetId = this.bsModalRef.content.rulesetID ? this.bsModalRef.content.rulesetID : this.abilityFormModal.ruleSetId;
                }
                else {
                  this._ruleSetId = this.abilityFormModal.ruleSetId;
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
          this.isLoading = true;
          let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
          this.abilityService.getAbilityById_Cache<any>(_abilityVM.abilityId)
            .subscribe(data => {
              if (data)
                _abilityVM = this.abilityService.abilityModelData(data, "UPDATE");
              if (!_abilityVM.ruleset) {
                _abilityVM.ruleset = data.ruleSet;
              }

              this._ruleSetId = _abilityVM.ruleSetId;

              //this.AbilityDetail.forEach(function (val) { val.showIcon = false; });
              this._ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

              this.abilityFormModal = this.abilityService.abilityModelData(_abilityVM, _view);
              this.abilityFormModal.isFromCharacter = this.isFromCharacter;
              this.abilityFormModal.isFromCharacterId = this.isFromCharacterId;
              this.abilityFormModal.isFromCharacterAbilityId = this.isFromCharacterAbilityId;
              this.abilityFormModal.characterId = this.abilityFormModal.characterId ? this.abilityFormModal.characterId : this.isFromCharacterId;
              this.abilityFormModal.currentNumberOfUses = this.isFromCharacter ? this.isFromCharacterAbilityCurrent : this.abilityFormModal.currentNumberOfUses;
              this.abilityFormModal.maxNumberOfUses = this.isFromCharacter ? this.isFromCharacterAbilityMax : this.abilityFormModal.maxNumberOfUses;

              this.selectedBuffAndEffects = this.abilityFormModal.abilityBuffAndEffects.map(x => { return x.buffAndEffect; });

              try {
                if (this.abilityFormModal.metatags !== '' && this.abilityFormModal.metatags !== undefined)
                  this.metatags = this.abilityFormModal.metatags.split(",");
                if (this.abilityFormModal.level !== '' && this.abilityFormModal.level !== undefined)
                  this.level = this.abilityFormModal.level.split(",");
              } catch (err) { }
              this.bingImageUrl = this.abilityFormModal.imageUrl;

              if (!this.abilityFormModal.imageUrl) {
                this.imageSearchService.getDefaultImage<any>('ability')
                  .subscribe(data => {
                    this.defaultImageSelected = data.imageUrl.result
                  }, error => {
                  },
                    () => { });
              }

              if (this.bsModalRef.content.button == 'UPDATE' || 'DUPLICATE') {
                this._ruleSetId = this.bsModalRef.content.rulesetID ? this.bsModalRef.content.rulesetID : this.abilityFormModal.ruleSetId;
              }
              else {
                this._ruleSetId = this.abilityFormModal.ruleSetId;
              }
              this.isLoading = false;

              this.initialize();

              ////this.rulesetService.GetCopiedRulesetID(_abilityVM.ruleSetId, user.id).subscribe(data => {
              ////  let id: any = data
              ////  //this.ruleSetId = id;
              ////  this._ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
              ////  //this.isLoading = false;

              ////  this.initialize();
              ////}, error => {
              ////  this.isLoading = false;
              ////  let Errors = Utilities.ErrorDetail("", error);
              ////  if (Errors.sessionExpire) {
              ////    //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
              ////    this.authService.logout(true);
              ////  }
              ////}, () => { });

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
        this.abilityFormModal = this.abilityService.abilityModelData(_abilityVM, _view);
        this.abilityFormModal.isFromCharacter = this.isFromCharacter;
        this.abilityFormModal.isFromCharacterId = this.isFromCharacterId;
        this.abilityFormModal.isFromCharacterAbilityId = this.isFromCharacterAbilityId;
        this.abilityFormModal.characterId = this.abilityFormModal.characterId ? this.abilityFormModal.characterId : this.isFromCharacterId;
        this.abilityFormModal.currentNumberOfUses = this.isFromCharacter ? this.isFromCharacterAbilityCurrent : this.abilityFormModal.currentNumberOfUses;
        this.abilityFormModal.maxNumberOfUses = this.isFromCharacter ? this.isFromCharacterAbilityMax : this.abilityFormModal.maxNumberOfUses;

        this.selectedBuffAndEffects = this.abilityFormModal.abilityBuffAndEffects.map(x => { return x.buffAndEffect; });

        try {
          if (this.abilityFormModal.metatags !== '' && this.abilityFormModal.metatags !== undefined)
            this.metatags = this.abilityFormModal.metatags.split(",");
          if (this.abilityFormModal.level !== '' && this.abilityFormModal.level !== undefined)
            this.level = this.abilityFormModal.level.split(",");
        } catch (err) { }
        this.bingImageUrl = this.abilityFormModal.imageUrl;
        if (!this.abilityFormModal.imageUrl) {
          this.imageSearchService.getDefaultImage<any>('ability')
            .subscribe(data => {
              this.defaultImageSelected = data.imageUrl.result
            }, error => {
            },
              () => { });
        }
        if (this.bsModalRef.content.button == 'UPDATE' || 'DUPLICATE') {
          this._ruleSetId = this.bsModalRef.content.rulesetID ? this.bsModalRef.content.rulesetID : this.abilityFormModal.ruleSetId;
        }
        else {
          this._ruleSetId = this.abilityFormModal.ruleSetId;
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
      if (this.abilityFormModal.abilityId) {
        this.isLoading = true;
        this.abilityService.getAbilityCommands_sp<any>(this.abilityFormModal.abilityId, this._ruleSetId)
          .subscribe(data => {
            this.abilityFormModal.abilityCommandVM = data.abilityCommands;
            this.buffAndEffectsList = data.buffAndEffectsList;
            this.selectedBuffAndEffects = data.selectedBuffAndEffects;
            this.isLoading = false;
          }, error => { }, () => { this.isLoading = false; });
      }
      else {
        this.isLoading = true;
        this.abilityService.getAbilityCommands_sp<any>(0, this._ruleSetId)
          .subscribe(data => {
            //  this.abilityFormModal.abilityCommandVM = data;
            this.buffAndEffectsList = data.buffAndEffectsList;
            // this.selectedBuffAndEffects = data.selectedBuffAndEffects;
            this.isLoading = false;
          }, error => { }, () => { this.isLoading = false; });
      }
    }
  }

  addCommand(abilityCommand: any): void {
    let _abilityCommandId = abilityCommand == undefined ? [] : abilityCommand;
    _abilityCommandId.push({ abilityCommandId: 0, command: '', name: '' });
    this.abilityFormModal.abilityCommandVM = _abilityCommandId;
  }

  removeCommand(command: any): void {
    this.abilityFormModal.abilityCommandVM
      .splice(this.abilityFormModal.abilityCommandVM.indexOf(command), 1);
  }

  setEnableDisable(checked: boolean) {
    this.abilityFormModal.isEnabled = checked;
  }

  setCharacterEnableDisable(checked: boolean) {
    this.isFromCharacterAbilityEnable = checked;
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
  validateSubmit(ability: any) {
    if (ability.maxNumberOfUses && ability.currentNumberOfUses) {
      if (ability.currentNumberOfUses > ability.maxNumberOfUses) {
        this.alertService.showMessage("", "Current number of uses cannot be greater than max number of uses.", MessageSeverity.error);
        return false;
      }
    }

    ability.isFromCharacterAbilityId = ability.isFromCharacterAbilityId;

    if (ability.ruleSetId === 0 || ability.ruleSetId === undefined)
      ability.ruleSetId = this._ruleSetId;

    ability.abilityBuffAndEffectVM = this.selectedBuffAndEffects.map(x => {
      return { buffAndEffectId: x.buffAndEffectId, abilityId: ability.abilityId };
    });


    this.isLoading = true;
    let _msg = ability.abilityId === 0 || ability.abilityId === undefined ? "Creating Ability.." : "Updating Ability..";
    if (this.abilityFormModal.view === VIEW.DUPLICATE) _msg = "Duplicating Ability..";
    this.alertService.startLoadingMessage("", _msg);

    let tagsValue = this.metatags.map(x => {
      if (x.value == undefined) return x;
      else return x.value;
    });
    ability.metatags = tagsValue.join(', ');

    let levelValue = this.level.map(x => {
      if (x.value == undefined) return x;
      else return x.value;
    });
    ability.level = levelValue.join(', ');

    if (this.fileToUpload != null) {
      this.fileUpload(ability);
    }
    else if (this.bingImageUrl !== this.abilityFormModal.imageUrl) {
      try {
        var regex = /(?:\.([^.]+))?$/;
        var extension = regex.exec(this.abilityFormModal.imageUrl)[1];
        extension = extension ? extension : 'jpg';
      } catch{ }
      this.fileUploadFromBing(this.abilityFormModal.imageUrl, extension, ability);
    }
    else {
      this.submit(ability);
    }


  }
  submitForm(ability: any) {
    this.validateSubmit(ability);
  }
  private fileUploadFromBing(file: string, ext: string, ability: any) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout(true);
    else {
      this.fileUploadService.fileUploadFromURL<any>(user.id, file, ext)
        .subscribe(
          data => {
            this.abilityFormModal.imageUrl = data.ImageUrl;
            //this.rulesetFormModal.thumbnailUrl = data.ThumbnailUrl;
            this.submit(ability);
          },
          error => {
            let Errors = Utilities.ErrorDetail('Error', error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            } else this.submit(ability);
          });
    }
  }
  private fileUpload(ability: any) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout(true);
    else {
      this.fileUploadService.fileUploadByUser<any>(user.id, this.fileToUpload)
        .subscribe(
          data => {
            this.abilityFormModal.imageUrl = data.ImageUrl;
            this.submit(ability);
          },
          error => {
            let Errors = Utilities.ErrorDetail('Error', error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            } else this.submit(ability);
          });
    }
  }

  private fileUploadOLD(ability: any) {
    //file upload
    this.abilityService.fileUpload(this.fileToUpload)
      .subscribe(
        data => {
          ability.imageUrl = data.ImageUrl;
          this.submit(ability);
        },
        error => {
          this.submit(ability);
        });
  }

  private submit(ability: any) {
    if (this.abilityFormModal.view === VIEW.DUPLICATE) {
      this.duplicateAbility(ability);
    }
    //else if (this.abilityFormModal.view === VIEW.EDIT && this.isFromCharacter) {
    //this.enableAbility(this.isFromCharacterAbilityId, this.isFromCharacterAbilityEnable);
    //}
    else {
      if (this.defaultImageSelected && !this.abilityFormModal.imageUrl) {
        let model = Object.assign({}, ability)
        model.imageUrl = this.defaultImageSelected
        this.addEditAbility(model);
      } else {
        this.addEditAbility(ability);
      }

    }
  }

  private addEditAbility(modal: Ability) {
    modal.ruleSetId = this._ruleSetId;
    this.isLoading = true;
    this.abilityService.createAbility<any>(modal)
      .subscribe(async (data) => {
        await this.commonService.deleteRecordFromIndexedDB("ability", 'Abilities', 'abilityId', modal, false);
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let message = modal.abilityId == 0 || modal.abilityId === undefined ? "Ability has been created successfully." : "Ability has been updated successfully.";
          if (data !== "" && data !== null && data !== undefined && isNaN(parseInt(data))) message = data;
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.close();

          //if (this.fromDetail)
          // this.router.navigate(['/ruleset/ability-details', modal.abilityId]);
          if (this.fromDetail) {
            if (data) {
              let id = data;
              if (!isNaN(parseInt(id))) {
                this.router.navigate(['/ruleset/ability-details', id]);
                this.event.emit({ abilityId: id });
                //this.sharedService.updateItemMasterDetailList(true);
              }
              else {
                if (modal.isFromCharacter) this.sharedService.UpdateCharacterAbilityList(true);
                else this.sharedService.updateAbilityList(true);
              }
            }
            else {
              if (modal.isFromCharacter) this.sharedService.UpdateCharacterAbilityList(true);
              else this.sharedService.updateAbilityList(true);
            }
          }
          else {
            this.event.emit(true);
            if (modal.isFromCharacter) this.sharedService.UpdateCharacterAbilityList(true);
            else this.sharedService.updateAbilityList(true);
          }
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = modal.abilityId == 0 || modal.abilityId === undefined ? "Unable to Create " : "Unable to Update ";
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

  private duplicateAbility(modal: Ability) {
    modal.ruleSetId = this._ruleSetId;
    this.isLoading = true;
    this.abilityService.duplicateAbility<any>(modal)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let message = "Ability has been duplicated successfully.";
          if (data !== "" && data !== null && data !== undefined) message = data;
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.close();
          this.sharedService.updateAbilityList(true);
          this.sharedService.UpdateCharacterAbilityList(true);
          if (this.isFromCharacter) {
            this.router.navigate(['/character/ability', this.isFromCharacterId]);
          }
          else if (this.fromDetail) {
            this.router.navigate(['/ruleset/ability', this._ruleSetId]);
          }

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

  private enableAbility(characterAbilityId: number, isEnabled: boolean) {

    this.isLoading = true;
    let enableTxt = isEnabled ? 'Enable' : 'Disable';
    this.alertService.startLoadingMessage("", enableTxt + " an Ability");

    this.characterAbilityService.toggleEnableCharacterAbility(characterAbilityId)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("Ability has been " + enableTxt + "d successfully.", "", MessageSeverity.success);
          this.bsModalRef.hide();
          this.sharedService.UpdateCharacterAbilityList(true);
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Unable to " + enableTxt, error);
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
        this.abilityFormModal.imageUrl = event.target.result;
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
    this.bsModalRef.content.title = 'ability';
    this.bsModalRef.content.image = img;
    this.bsModalRef.content.view = view;
    this.bsModalRef.content.errorImage = '../assets/images/DefaultImages/ability.jpg';
    //this.bsModalRef.content.imageChangedEvent = this.imageChangedEvent; //base 64 || URL
    this.bsModalRef.content.event.subscribe(data => {
      this.abilityFormModal.imageUrl = data.base64;
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
}
