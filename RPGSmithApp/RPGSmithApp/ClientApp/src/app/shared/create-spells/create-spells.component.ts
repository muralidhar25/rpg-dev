import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Spell } from '../../core/models/view-models/spell.model';
import { Utilities } from '../../core/common/utilities';
import { ImageError, VIEW } from '../../core/models/enums';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { AuthService } from '../../core/auth/auth.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { SharedService } from '../../core/services/shared.service';
import { SpellsService } from '../../core/services/spells.service';
import { CharacterSpellService } from '../../core/services/character-spells.service';
import { ImageSearchService } from '../../core/services/shared/image-search.service';
import { FileUploadService } from '../../core/common/file-upload.service';
import { User } from '../../core/models/user.model';
import { DBkeys } from '../../core/common/db-keys';
import { DiceComponent } from '../dice/dice/dice.component';
import { ImageSelectorComponent } from '../image-interface/image-selector/image-selector.component';
import { PlatformLocation } from '@angular/common';
import { RulesetService } from '../../core/services/ruleset.service';
import { CommonService } from '../../core/services/shared/common.service';

@Component({
  selector: 'app-create-spell',
  templateUrl: './create-spells.component.html',
  styleUrls: ['./create-spells.component.scss']
})
export class CreateSpellsComponent implements OnInit {

  title: string;
  showWebButtons: boolean = false;
  isLoading = false;
  _ruleSetId: number;
  spellFormModal: any = new Spell();
  fileToUpload: File = null;
  commandList = [];
  numberRegex = "^(?:[0-9]+(?:\.[0-9]{0,8})?)?$";// "^((\\+91-?)|0)?[0-9]{0,2}$";
  fromDetail: boolean = false;
  isFromCharacter: boolean = false;
  isFromCharacterId: number;
  isFromCharacterSpellId: number = 0;
  isFromCharacterSpellMemorized: boolean = false;
  //isMaterial: boolean;
  metatags = [];
  levels = [];
  school = [];
  class = [];
  uploadFromBing: boolean = false;
  bingImageUrl: string;
  bingImageExt: string;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  imageErrorMessage: string = ImageError.MESSAGE
  defaultImageSelected: string = '';
  button: string
  buffAndEffectsList = [];
  selectedBuffAndEffects = [];
  isGM: boolean = false;
  isGM_Only: boolean = false;
  ruleSet: any;
  options(placeholder?: string, initOnClick?: boolean): Object {
    return Utilities.optionsFloala(160, placeholder, initOnClick);
  }

  constructor(
    private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
    private sharedService: SharedService,
    private spellsService: SpellsService, private characterSpellService: CharacterSpellService,
    private fileUploadService: FileUploadService, private imageSearchService: ImageSearchService,
    private rulesetService: RulesetService,
    private location: PlatformLocation,
    private commonService: CommonService) {
    location.onPopState(() => this.modalService.hide(1));
    this.route.params.subscribe(params => { this._ruleSetId = params['id']; });

    this.sharedService.getCommandData().subscribe(diceCommand => {
      if (diceCommand.parentIndex === -1) {
        this.spellFormModal.command = diceCommand.command;
      } else {

        if (this.spellFormModal.spellCommandVM.length > 0) {
          this.spellFormModal.spellCommandVM.forEach(item => {
            var index = this.spellFormModal.spellCommandVM.indexOf(item);
            if (index === diceCommand.parentIndex) {
              this.spellFormModal.spellCommandVM[index].command = diceCommand.command;
            }
          });
        }
      }
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.fromDetail = this.bsModalRef.content.fromDetail == undefined ? false : this.bsModalRef.content.fromDetail; this.fromDetail = this.bsModalRef.content.fromDetail == undefined ? false : this.bsModalRef.content.fromDetail;
      this.isFromCharacter = this.bsModalRef.content.isFromCharacter == undefined ? false : this.bsModalRef.content.isFromCharacter;
      this.isFromCharacterId = this.bsModalRef.content.isFromCharacterId == undefined ? 0 : this.bsModalRef.content.isFromCharacterId;
      this.isFromCharacterSpellId = this.bsModalRef.content.isFromCharacterSpellId == undefined ? 0 : this.bsModalRef.content.isFromCharacterSpellId;
      this.isFromCharacterSpellMemorized = this.bsModalRef.content.isFromCharacterSpellMemorized == undefined ? false : this.bsModalRef.content.isFromCharacterSpellMemorized;
      this.title = this.bsModalRef.content.title;
      let _view = this.button = this.bsModalRef.content.button;
      let _spellVM = this.bsModalRef.content.spellVM;
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
          let userID = this.bsModalRef.content.userID;
          //let ruleSetId = this.bsModalRef.content.combatant.character.userId;
          this.isLoading = true;
          this.characterSpellService.getCharacterSpellById<any>(_spellVM.characterSpellId)
            .subscribe(data => {
              _spellVM = this.characterSpellService.spellModelDetailData(data, "UPDATE");

              this.rulesetService.GetCopiedRulesetID(_spellVM.ruleSetId, userID).subscribe(data => {
                let id: any = data
                this._ruleSetId = id;

                this.spellFormModal = this.spellsService.spellModelData(_spellVM, _view);
                this.spellFormModal.isFromCharacter = this.isFromCharacter;
                this.spellFormModal.isFromCharacterId = this.isFromCharacterId;
                this.selectedBuffAndEffects = this.spellFormModal.spellBuffAndEffects.map(x => { return x.buffAndEffect; });
                //if (this.bsModalRef.content.button == 'UPDATE' || 'DUPLICATE') {
                //  this._ruleSetId = this.bsModalRef.content.rulesetID ? this.bsModalRef.content.rulesetID : this.spellFormModal.ruleSetId;
                //}
                //else {
                //  this._ruleSetId = this.spellFormModal.ruleSetId;
                //}
                try {
                  if (this.spellFormModal.metatags !== '' && this.spellFormModal.metatags !== undefined)
                    this.metatags = this.spellFormModal.metatags.split(",");
                  if (this.spellFormModal.levels !== '' && this.spellFormModal.levels !== undefined)
                    this.levels = this.spellFormModal.levels.split(",");
                  if (this.spellFormModal.school !== '' && this.spellFormModal.school !== undefined)
                    this.school = this.spellFormModal.school.split(",");
                  if (this.spellFormModal.class !== '' && this.spellFormModal.class !== undefined)
                    this.class = this.spellFormModal.class.split(",");
                } catch (err) { }
                this.bingImageUrl = this.spellFormModal.imageUrl;
                if (!this.spellFormModal.imageUrl) {
                  this.imageSearchService.getDefaultImage<any>('spell')
                    .subscribe(data => {
                      this.defaultImageSelected = data.imageUrl.result
                    }, error => {
                    },
                      () => { });
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
          this.spellsService.getspellsById<any>(_spellVM.spellId)
            .subscribe(data => {

              if (data)
                _spellVM = this.spellsService.spellModelData(data, "UPDATE");

              if (!_spellVM.ruleset) {
                _spellVM.ruleset = data.ruleSet;
              }
              //this.spellDetail.forEach(function (val) { val.showIcon = false; });
              this.rulesetService.GetCopiedRulesetID(_spellVM.ruleSetId, user.id).subscribe(data => {
                let id: any = data
                //this.ruleSetId = id;
                this._ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
                this.spellFormModal = this.spellsService.spellModelData(_spellVM, _view);
                this.spellFormModal.isFromCharacter = this.isFromCharacter;
                this.spellFormModal.isFromCharacterId = this.isFromCharacterId;
                this.selectedBuffAndEffects = this.spellFormModal.spellBuffAndEffects.map(x => { return x.buffAndEffect; });
                if (this.bsModalRef.content.button == 'UPDATE' || 'DUPLICATE') {
                  this._ruleSetId = this.bsModalRef.content.rulesetID ? this.bsModalRef.content.rulesetID : this.spellFormModal.ruleSetId;
                }
                else {
                  this._ruleSetId = this.spellFormModal.ruleSetId;
                }

                //this.isMaterial = this.spellFormModal.materialComponent == null || this.spellFormModal.materialComponent == undefined || this.spellFormModal.materialComponent == '' ? false : true;

                try {
                  if (this.spellFormModal.metatags !== '' && this.spellFormModal.metatags !== undefined)
                    this.metatags = this.spellFormModal.metatags.split(",");
                  if (this.spellFormModal.levels !== '' && this.spellFormModal.levels !== undefined)
                    this.levels = this.spellFormModal.levels.split(",");
                  if (this.spellFormModal.school !== '' && this.spellFormModal.school !== undefined)
                    this.school = this.spellFormModal.school.split(",");
                  if (this.spellFormModal.class !== '' && this.spellFormModal.class !== undefined)
                    this.class = this.spellFormModal.class.split(",");
                } catch (err) { }
                this.bingImageUrl = this.spellFormModal.imageUrl;
                if (!this.spellFormModal.imageUrl) {
                  this.imageSearchService.getDefaultImage<any>('spell')
                    .subscribe(data => {
                      this.defaultImageSelected = data.imageUrl.result
                    }, error => {
                    },
                      () => { });
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
        }

      } else {
        this.spellFormModal = this.spellsService.spellModelData(_spellVM, _view);
        this.spellFormModal.isFromCharacter = this.isFromCharacter;
        this.spellFormModal.isFromCharacterId = this.isFromCharacterId;
        this.selectedBuffAndEffects = this.spellFormModal.spellBuffAndEffects.map(x => { return x.buffAndEffect; });
        if (this.bsModalRef.content.button == 'UPDATE' || 'DUPLICATE') {
          this._ruleSetId = this.bsModalRef.content.rulesetID ? this.bsModalRef.content.rulesetID : this.spellFormModal.ruleSetId;
        }
        else {
          this._ruleSetId = this.spellFormModal.ruleSetId;
        }

        //this.isMaterial = this.spellFormModal.materialComponent == null || this.spellFormModal.materialComponent == undefined || this.spellFormModal.materialComponent == '' ? false : true;

        try {
          if (this.spellFormModal.metatags !== '' && this.spellFormModal.metatags !== undefined)
            this.metatags = this.spellFormModal.metatags.split(",");
          if (this.spellFormModal.levels !== '' && this.spellFormModal.levels !== undefined)
            this.levels = this.spellFormModal.levels.split(",");
          if (this.spellFormModal.school !== '' && this.spellFormModal.school !== undefined)
            this.school = this.spellFormModal.school.split(",");
          if (this.spellFormModal.class !== '' && this.spellFormModal.class !== undefined)
            this.class = this.spellFormModal.class.split(",");
        } catch (err) { }
        this.bingImageUrl = this.spellFormModal.imageUrl;
        if (!this.spellFormModal.imageUrl) {
          this.imageSearchService.getDefaultImage<any>('spell')
            .subscribe(data => {
              this.defaultImageSelected = data.imageUrl.result
            }, error => {
            },
              () => { });
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
      if (this.spellFormModal.spellId) {
        this.isLoading = true;
        this.spellsService.getSpellCommands_sp<any>(this.spellFormModal.spellId, this._ruleSetId)
          .subscribe(data => {
            this.spellFormModal.spellCommandVM = data.spellCommands;
            this.buffAndEffectsList = data.buffAndEffectsList;
            this.selectedBuffAndEffects = data.selectedBuffAndEffects;
            this.isLoading = false;
          }, error => { }, () => { this.isLoading = false; });
      }
      else {
        this.isLoading = true;
        this.spellsService.getSpellCommands_sp<any>(0, this._ruleSetId)
          .subscribe(data => {
            //this.spellFormModal.spellCommandVM = data.spellCommands;
            this.buffAndEffectsList = data.buffAndEffectsList;
            //this.selectedBuffAndEffects = data.selectedBuffAndEffects;
            this.isLoading = false;
          }, error => { }, () => { this.isLoading = false; });
      }
    }
  }


  addCommand(spellCommandVM: any): void {
    let _spellCommandVM = spellCommandVM == undefined ? [] : spellCommandVM;
    _spellCommandVM.push({ spellCommandId: 0, command: '', name: '' });
    this.spellFormModal.spellCommandVM = _spellCommandVM;
  }

  removeCommand(command: any): void {
    this.spellFormModal.spellCommandVM
      .splice(this.spellFormModal.spellCommandVM.indexOf(command), 1);
  }

  removeTag(tagData: any, tag: any, index: number): void {
    tagData.splice(index, 1);
  }

  setComponent(field: string, checked: boolean) {
    switch (field) {
      case "Somatic": {
        this.spellFormModal.isSomaticComponent = checked;
        break;
      }
      case "Verbal": {
        this.spellFormModal.isVerbalComponent = checked;
        break;
      }
      case "memorized": {
        this.spellFormModal.memorized = checked;
        break;
      }
      case "shouldCast": {
        this.spellFormModal.shouldCast = checked;
        break;
      }
      default: break;
    }
  }

  SetMaterial(event: any) {
    this.spellFormModal.isMaterialComponent = event.target.checked;
  }

  setCharacterMemorized(checked: boolean) {
    this.isFromCharacterSpellMemorized = checked;
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

  validateSubmit(spell: Spell) {
    if (spell.ruleSetId == 0 || spell.ruleSetId === undefined)
      spell.ruleSetId = this._ruleSetId;



    this.isLoading = true;
    let _msg = spell.spellId == 0 || spell.spellId === undefined ? "Creating Spell.." : "Updating Spell..";
    if (this.spellFormModal.view === VIEW.DUPLICATE) _msg = "Duplicating Spell..";
    this.alertService.startLoadingMessage("", _msg);

    spell.spellBuffAndEffectVM = this.selectedBuffAndEffects.map(x => {
      return { buffAndEffectId: x.buffAndEffectId, spellId: spell.spellId };
    });

    let tagsValue = this.metatags.map(x => {
      if (x.value == undefined) return x; else return x.value;
    });
    spell.metatags = tagsValue.join(', ');

    let levelValue = this.levels.map(x => {
      if (x.value == undefined) return x; else return x.value;
    });
    spell.levels = levelValue.join(', ');

    let schoolValue = this.school.map(x => {
      if (x.value == undefined) return x; else return x.value;
    });
    spell.school = schoolValue.join(', ');

    let classValue = this.class.map(x => {
      if (x.value == undefined) return x; else return x.value;
    });
    spell.class = classValue.join(', ');

    if (!this.spellFormModal.isMaterialComponent) spell.materialComponent = '';

    if (this.fileToUpload != null) {
      this.fileUpload(spell);
    }
    else if (this.bingImageUrl !== this.spellFormModal.imageUrl) {
      try {
        var regex = /(?:\.([^.]+))?$/;
        var extension = regex.exec(this.spellFormModal.imageUrl)[1];
        extension = extension ? extension : 'jpg';
      } catch{ }
      this.fileUploadFromBing(this.spellFormModal.imageUrl, extension, spell);
    }
    else {
      this.submit(spell);
    }
  }
  submitForm(spell: Spell) {
    this.validateSubmit(spell);
  }

  private fileUploadFromBing(file: string, ext: string, spell: any) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout(true);
    else {
      this.fileUploadService.fileUploadFromURL<any>(user.id, file, ext)
        .subscribe(
          data => {
            this.spellFormModal.imageUrl = data.ImageUrl;
            //this.rulesetFormModal.thumbnailUrl = data.ThumbnailUrl;
            this.submit(spell);
          },
          error => {
            let Errors = Utilities.ErrorDetail('Error', error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            } else this.submit(spell);
          });
    }
  }
  private fileUpload(spell: Spell) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout(true);
    else {
      this.fileUploadService.fileUploadByUser<any>(user.id, this.fileToUpload)
        .subscribe(
          data => {
            spell.imageUrl = data.ImageUrl;
            this.submit(spell);
          },
          error => {
            let Errors = Utilities.ErrorDetail('Error', error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            } else this.submit(spell);
          });
    }
  }

  private fileUploadOLD(spell: Spell) {
    //file upload
    this.spellsService.fileUpload(this.fileToUpload)
      .subscribe(
        data => {
          //console.log(data);
          spell.imageUrl = data.ImageUrl;
          this.submit(spell);
        },
        error => {
          console.log(error);
          this.submit(spell);
        });
  }

  private submit(spell: Spell) {

    if (this.spellFormModal.view === VIEW.DUPLICATE) {
      this.duplicateSpell(spell);
    }
    //else if (this.spellFormModal.view === VIEW.EDIT && this.isFromCharacter) {
    //    this.memorizeSpell(this.isFromCharacterSpellId, this.isFromCharacterSpellMemorized);
    //}
    else {
      if (this.defaultImageSelected && !this.spellFormModal.imageUrl) {
        let model = Object.assign({}, spell)
        model.imageUrl = this.defaultImageSelected
        this.addEditSpell(model);
      } else {
        this.addEditSpell(spell);
      }
    }
  }

  private addEditSpell(modal: Spell) {
    modal.ruleSetId = this._ruleSetId;
    this.isLoading = true;
    this.spellsService.createSpell<any>(modal)
      .subscribe(async (data) => {
        await this.commonService.deleteRecordFromIndexedDB("spell", 'Spells', 'spellId', modal, false);
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let message = modal.spellId == 0 || modal.spellId === undefined ? "Spell has been created successfully." : "Spell has been updated successfully.";
          //if (this.isFromCharacter) message = "Spell added successfully.";
          if (data !== "" && data !== null && data !== undefined && isNaN(parseInt(data))) message = data;
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.close();
          if (this.fromDetail) {
            if (data) {
              let id = data;
              if (!isNaN(parseInt(id))) {
                this.router.navigate(['/ruleset/spell-details', id]);
                this.event.emit({ spellId: id });
                //this.sharedService.updateItemMasterDetailList(true);
              }
              else {
                if (modal.isFromCharacter) this.sharedService.UpdateCharacterSpellList(true);
                else this.sharedService.updateSpellList(true);
              }
            }
            else {
              if (modal.isFromCharacter) this.sharedService.UpdateCharacterSpellList(true);
              else this.sharedService.updateSpellList(true);
            }
          }
          else {
            this.event.emit(true);
            if (modal.isFromCharacter) this.sharedService.UpdateCharacterSpellList(true);
            else this.sharedService.updateSpellList(true);
          }
          //if (this.fromDetail)
          //this.router.navigate(['/ruleset/spell-details', modal.spellId]);
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = modal.spellId == 0 || modal.spellId === undefined ? "Unable to Create " : "Unable to Update ";
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

  private duplicateSpell(modal: Spell) {
    modal.ruleSetId = this._ruleSetId;
    this.isLoading = true;
    this.spellsService.duplicateSpell<any>(modal)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let message = "Spell has been duplicated successfully.";
          if (data !== "" && data !== null && data !== undefined) message = data;
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.close();
          this.sharedService.updateSpellList(true);
          this.sharedService.UpdateCharacterSpellList(true);
          if (this.isFromCharacter)
            this.router.navigate(['/character/spell', this.isFromCharacterId]);
          else if (this.fromDetail)
            this.router.navigate(['/ruleset/spell', this._ruleSetId]);

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

  private memorizeSpell(isFromCharacterSpellId: number, isFromCharacterSpellMemorized: boolean) {
    this.isLoading = true;
    let memorizeTxt = isFromCharacterSpellMemorized ? 'Memorize' : 'Unmemorize';
    this.alertService.startLoadingMessage("", memorizeTxt + " a Spell");

    this.characterSpellService.toggleMemorizedCharacterSpell(isFromCharacterSpellId)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          //this.alertService.showMessage("Spell has been " + memorizeTxt + "d successfully.", "", MessageSeverity.success);
          this.bsModalRef.hide();
          this.sharedService.UpdateCharacterSpellList(true);
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Unable to " + memorizeTxt, error);
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
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.onload = (event: any) => {
        this.spellFormModal.imageUrl = event.target.result;
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
    this.bsModalRef.content.title = 'spell';
    this.bsModalRef.content.image = img;
    this.bsModalRef.content.view = view;
    this.bsModalRef.content.errorImage = '../assets/images/DefaultImages/Spell.jpg';
    //this.bsModalRef.content.imageChangedEvent = this.imageChangedEvent; //base 64 || URL
    this.bsModalRef.content.event.subscribe(data => {
      this.spellFormModal.imageUrl = data.base64;
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
