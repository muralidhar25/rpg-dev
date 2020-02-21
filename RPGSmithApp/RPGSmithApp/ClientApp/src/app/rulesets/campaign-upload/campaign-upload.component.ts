import { Component, OnInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { BsModalService, BsModalRef, ProgressbarConfig } from 'ngx-bootstrap';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { AuthService } from '../../core/auth/auth.service';
import { PlatformLocation } from "@angular/common";
import { RulesetService } from '../../core/services/ruleset.service';
import { RecordType } from '../../core/models/enums';
import * as XLSX from 'xlsx';
import { WorkBook, read, utils, write, readFile } from 'xlsx';
import { setInterval } from 'timers';
import { HubConnectionBuilder, HubConnection, LogLevel } from '@aspnet/signalr';
import { environment } from '../../../environments/environment';
import { DBkeys } from '../../core/common/db-keys';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-campaign-upload',
  templateUrl: './campaign-upload.component.html',
  styleUrls: ['./campaign-upload.component.scss'],

  providers: [{ provide: ProgressbarConfig, useFactory: getProgressbarConfig }]
})
export class CampaignUploadComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;
  isLoading = false;
  title: any;
  _recordType = RecordType;
  rulesetFormModal: any = new Ruleset();
  xlsx;
  fileName = 'Choose File';
  rulesetId: number;
  recordType: any;
  csvMonsterData: any;
  csvSpellListData: any;
  csvAbilityListData: any;
  csvItemMasterData: any;
  public max = 1;
  public progress = 1;
  interval: any;
  ExistingCount: number;
  itemMasterCount: number;

  private _connection: HubConnection;

  public event: EventEmitter<any> = new EventEmitter();

  constructor(
    private rulesetService: RulesetService, private bsModalRef: BsModalRef,
    public modalService: BsModalService, private localStorage: LocalStoreManager,
    private location: PlatformLocation, private authService: AuthService,
    private alertService: AlertService) {
    location.onPopState(() => this.modalService.hide(1));
    try { this.initializeConnection(); } catch (err) { }
  }

  ngOnInit() {
    setTimeout(() => {
      this.title = this.bsModalRef.content.title;
      this.recordType = this.bsModalRef.content.RecordType;
      this.rulesetId = this.bsModalRef.content.RulesetId;
      this.ExistingCount = this.bsModalRef.content.ExistingCount;
      this.max = 1; 
    }, 0);   
  }

  private initializeConnection(): void {

    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {

      this._connection = new HubConnectionBuilder()
        .configureLogging(LogLevel.Debug)
        .withUrl(`${environment.baseUrl}/progress`)
        .build();

      this._connection
        .start()
        .then(() => {
          this._connection.on(`${user.id}-UploadProgressStarted-${this.recordType}`, user => { console.log('UploadProgressStarted:', user); });
          this._connection.on(`${user.id}-UploadProgress-${this.recordType}`, (successCount, _userId) => {
            if (_userId == user.id) {
              this.progress = successCount;
              console.log(`${user.id}-UploadProgress-${this.recordType}`, successCount);
            }
          });
          this._connection.on(`${user.id}-UploadProgressEnded-${this.recordType}`, user => { console.log('UploadProgressEnded:', user); });
        })
        .catch(err => {
          console.log(`Error while starting SignalR connection (upload excel): ${err}`)
          this.interval = setInterval(() => {
            if (this.progress < (this.max-1)) { this.progress++; }
            else { clearInterval(this.interval); }
          }, 200);
        });
    }
  }

  ImportCampaign(ruleSetId, rType: RecordType) {
    switch (rType) {
      case RecordType.MONSTERS:    //MonsterTemplates

        let monsterList = [];
        this.max = monsterList.length;
        //let drCommands = [];
        let validation: boolean = true;
        let csvData = [];
        if (this.csvMonsterData) {
          //this.csvMonsterData.MonsterTemplates.map(m => {
          //  m.MonsterTemplateAbilityVM = [];
          //  m.MonsterTemplateSpellVM = [];
          //  m.MonsterTemplateBuffAndEffectVM = [];
          //  m.MonsterTemplateItemMasterVM = [];
          //  m.MonsterTemplateCommandVM = [];
          //  m.MonsterTemplateAssociateMonsterTemplateVM = [];
          //  m.MonsterTemplateCurrency = [];
          //});
          //this.csvMonsterData.MonsterTemplates.map(m => {
          //  if (this.csvMonsterData.Abilities && this.csvMonsterData.Abilities.length) {
          //    this.csvMonsterData.Abilities.map(ability => {
          //      if (ability.monsterTemplateId == m.monsterTemplateId) {
          //        m.MonsterTemplateAbilityVM.push(ability);
          //      }
          //    });
          //  }
          //  if (this.csvMonsterData.Spells && this.csvMonsterData.Spells.length) {
          //    this.csvMonsterData.Spells.map(spell => {
          //      if (spell.monsterTemplateId == m.monsterTemplateId) {
          //        m.MonsterTemplateSpellVM.push(spell);
          //      }
          //    });
          //  }
          //  if (this.csvMonsterData.BuffEffects && this.csvMonsterData.BuffEffects.length) {
          //    this.csvMonsterData.BuffEffects.map(buffEffect => {
          //      if (buffEffect.monsterTemplateId == m.monsterTemplateId) {
          //        m.MonsterTemplateBuffAndEffectVM.push(buffEffect);
          //      }
          //    });
          //  }
          //  if (this.csvMonsterData.Items && this.csvMonsterData.Items.length) {
          //    this.csvMonsterData.Items.map(item => {
          //      if (item.monsterTemplateId == m.monsterTemplateId) {
          //        m.MonsterTemplateItemMasterVM.push(item);
          //      }
          //    });
          //  }
          //  if (this.csvMonsterData.Commands && this.csvMonsterData.Commands.length) {
          //    this.csvMonsterData.Commands.map(command => {
          //      if (command.monsterTemplateId == m.monsterTemplateId) {
          //        m.MonsterTemplateCommandVM.push(command);
          //      }
          //    });
          //  }
          //  if (this.csvMonsterData.AssociateMonsters && this.csvMonsterData.AssociateMonsters.length) {
          //    this.csvMonsterData.AssociateMonsters.map(monster => {
          //      if (monster.monsterTemplateId == m.monsterTemplateId) {
          //        m.MonsterTemplateAssociateMonsterTemplateVM.push(monster);
          //      }
          //    });
          //  }
          //  if (this.csvMonsterData.Currency && this.csvMonsterData.Currency.length) {
          //    this.csvMonsterData.Currency.map(currency => {
          //      if (currency.monsterTemplateId == m.monsterTemplateId) {
          //        m.MonsterTemplateCurrency.push(currency);
          //      }
          //    });
          //  }
          //});

          csvData = this.csvMonsterData.MonsterTemplates;

          if (typeof (csvData) == "string") { csvData = JSON.parse(csvData) }
          if (csvData) {
          csvData.forEach(x => {
            if (!x.Name) {
              validation = false;
              return false;
            }
            else {
              monsterList.push({
                //monsterTemplateId: x.monsterTemplateId,
                //ruleSetId: x.ruleSetId,
                name: x.Name,
                imageUrl: x.ImageUrl,
                metatags: x.Tags ? x.Tags : '',
                //healthCurrent: x.healthCurrent,
                //healthMax: x.healthMax,
                health: x.Health ? x.Health : 0,
                armorClass: x.ArmorClass ? x.ArmorClass : 0,
                xpValue: x.XPValue ? x.XPValue : 0,
                challangeRating: x.ChallangeRating ? x.ChallangeRating : 0,
                addToCombatTracker: x.addToCombatTracker ? x.addToCombatTracker : false,
                command: x.Command ? x.Command : '',
                commandName: x.CommandName ? x.CommandName : '',
                description: x.Description ? x.Description : '',
                stats: x.Stats ? x.Stats : '',
                initiativeCommand: x.Initiative ? x.Initiative : '',
                isRandomizationEngine: false,
                characterId: x.characterId ? x.characterId : 0,
                gmOnly: x.GMOnly ? x.GMOnly : '',
                //drCommand: x.drcommand ? x.drcommand:'',
                //drCommand1: x.drcommand1 ? x.drcommand1 : '',
                //drCommandName: x.drcommandname ? x.drcommandname:'',
                //drCommandName1: x.drcommandname1 ? x.drcommandname1 : '',

                command1: x.Command1 ? x.Command1 : '',
                commandName1: x.CommandName1 ? x.CommandName1 : '',
                command2: x.Command2 ? x.Command2 : '',
                commandName2: x.CommandName2 ? x.CommandName2 : '',
                command3: x.Command3 ? x.Command3 : '',
                commandName3: x.CommandName3 ? x.CommandName3 : '',
                command4: x.Command4 ? x.Command4 : '',
                commandName4: x.CommandName4 ? x.CommandName4 : '',
                command5: x.Command5 ? x.Command5 : '',
                commandName5: x.CommandName5 ? x.CommandName5 : '',
                command6: x.Command6 ? x.Command6 : '',
                commandName6: x.CommandName6 ? x.CommandName6 : '',
                command7: x.Command7 ? x.Command7 : '',
                commandName7: x.CommandName7 ? x.CommandName7 : '',
                command8: x.Command8 ? x.Command8 : '',
                commandName8: x.CommandName8 ? x.CommandName8 : '',
                command9: x.Command9 ? x.Command9 : '',
                commandName9: x.CommandName9 ? x.CommandName9 : '',
                command10: x.Command10 ? x.Command10 : '',
                CommandName10: x.CommandName10 ? x.CommandName10 : ''


                //multipleCommands: drCommands

                // MonsterTemplateAbilityVM: x.MonsterTemplateAbilityVM,
                //MonsterTemplateSpellVM: x.MonsterTemplateSpellVM,
                //MonsterTemplateBuffAndEffectVM: x.MonsterTemplateBuffAndEffectVM,
                //MonsterTemplateItemMasterVM: x.MonsterTemplateItemMasterVM,
                //MonsterTemplateCommandVM: x.MonsterTemplateCommandVM,
                //MonsterTemplateAssociateMonsterTemplateVM: x.MonsterTemplateAssociateMonsterTemplateVM,
                //MonsterTemplateCurrency: x.MonsterTemplateCurrency
              });
            }
          });
          }

          if (!validation) {
            let message = "Name is required!";
            this.alertService.showMessage(message, "", MessageSeverity.error);
          }
          else if (monsterList.length == 0) {
            let message = "Uploaded file is empty or invalid!";
            this.alertService.showMessage(message, "", MessageSeverity.error);
          }
          else {
            if (+this.ExistingCount + monsterList.length > 2000) {
              let message = "The maximum number of records has been reached, 2,000. Please delete some records and try again.";
              this.alertService.showMessage(message, "", MessageSeverity.error);
            }
            else {

              this.max = monsterList.length;
              let model = { ruleSetId: ruleSetId, recordType: rType, monsters: monsterList }
              this.isLoading = true;

              this.rulesetService.ImportRecord(model)
                .subscribe(data => {
                  this.progress = this.max;
                  setTimeout(() => {
                    let message = "Records have been uploaded successfully.";
                    this.alertService.showMessage("Uploaded", message, MessageSeverity.success);
                    this.isLoading = false;
                    this.close();
                  }, 100);
                },
                  error => {
                    let message = `(${this.progress}) Record(s) have been uploaded successfully.`;
                    this.alertService.showMessage("Uploaded", message, MessageSeverity.success);
                    this.isLoading = false;
                    this.close();
                  });
            }
          }
        }
        else {
          let message = "Please select file to import";
          this.alertService.showMessage(message, "", MessageSeverity.error);
        }
        break;
      case RecordType.ITEMS:      //Item Templates
        debugger
        let itemMasterList = [];
        this.max = itemMasterList.length;
        //let drCommands = [];
        let validations: boolean = true;
        let csvItemData = [];
        if (this.csvItemMasterData) {

          csvItemData = this.csvItemMasterData.ItemTemplates;

          if (typeof (csvItemData) == "string") { csvItemData = JSON.parse(csvItemData) }
          if (csvItemData) {
            csvItemData.forEach(x => {
              if (!x.itemName) {
                validations = false;
                return false;
              }
              else {
                itemMasterList.push({
                  //monsterTemplateId: x.monsterTemplateId,
                  //ruleSetId: x.ruleSetId,
                  itemName: x.itemName,
                  itemImage: x.itemImage,
                  itemVisibleDesc: x.itemVisibleDesc ? x.itemVisibleDesc : '',
                  Weight: x.Weight ? x.Weight : 0,
                  Volume: x.Volume ? x.Volume : 0,
                  isMagical: x.isMagical ? x.isMagical : false,
                  isConsumable: x.isConsumable ? x.isConsumable : false,
                  Command: x.Command ? x.Command : '',
                  CommandName: x.CommandName ? x.CommandName : '',
                  rarity: x.rarity ? x.rarity : '',
                  itemStats: x.itemStats ? x.itemStats : '',
                  gmOnly: x.GMOnly ? x.GMOnly : '',
                  command1: x.Command1 ? x.Command1 : '',
                  commandName1: x.CommandName1 ? x.CommandName1 : '',
                  command2: x.Command2 ? x.Command2 : '',
                  commandName2: x.CommandName2 ? x.CommandName2 : '',
                  command3: x.Command3 ? x.Command3 : '',
                  commandName3: x.CommandName3 ? x.CommandName3 : '',
                  command4: x.Command4 ? x.Command4 : '',
                  commandName4: x.CommandName4 ? x.CommandName4 : '',
                  command5: x.Command5 ? x.Command5 : '',
                  commandName5: x.CommandName5 ? x.CommandName5 : '',
                  command6: x.Command6 ? x.Command6 : '',
                  commandName6: x.CommandName6 ? x.CommandName6 : '',
                  command7: x.Command7 ? x.Command7 : '',
                  commandName7: x.CommandName7 ? x.CommandName7 : '',
                  command8: x.Command8 ? x.Command8 : '',
                  commandName8: x.CommandName8 ? x.CommandName8 : '',
                  command9: x.Command9 ? x.Command9 : '',
                  commandName9: x.CommandName9 ? x.CommandName9 : '',
                  command10: x.Command10 ? x.Command10 : '',
                  CommandName10: x.CommandName10 ? x.CommandName10 : ''

                });
              }
            });
          }

          if (!validations) {
            let message = "Name is required!";
            this.alertService.showMessage(message, "", MessageSeverity.error);
          }
          else if (itemMasterList.length == 0) {
            let message = "Uploaded file is empty or invalid!";
            this.alertService.showMessage(message, "", MessageSeverity.error);
          }
          else {
            if (+this.ExistingCount + itemMasterList.length > 2000) {
              let message = "The maximum number of records has been reached, 2,000. Please delete some records and try again.";
              this.alertService.showMessage(message, "", MessageSeverity.error);
            }
            else {

              this.max = itemMasterList.length;
              let model = { ruleSetId: ruleSetId, recordType: rType, items: itemMasterList }
              this.isLoading = true;

              this.rulesetService.ImportItemTemplates(model)
                .subscribe(data => {
                  this.progress = this.max;
                  setTimeout(() => {
                    let message = "Records have been uploaded successfully.";
                    this.alertService.showMessage("Uploaded", message, MessageSeverity.success);
                    this.isLoading = false;
                    this.close();
                  }, 100);
                },
                  error => {
                    let message = `(${this.progress}) Record(s) have been uploaded successfully.`;
                    this.alertService.showMessage("Uploaded", message, MessageSeverity.success);
                    this.isLoading = false;
                    this.close();
                  });
            }
          }
        }
        else {
          let message = "Please select file to import";
          this.alertService.showMessage(message, "", MessageSeverity.error);
        }
        break;
      case RecordType.SPELLS:   //SPELLS
        let spellList = [];
        this.max = spellList.length;
        //let drCommands = [];
        let _validations: boolean = true;
        let csvSpellData = [];
        if (this.csvSpellListData) {

          csvSpellData = this.csvSpellListData.Spells;

          if (typeof (csvSpellData) == "string") { csvSpellData = JSON.parse(csvSpellData) }
          
          if (csvSpellData) {
            csvSpellData.forEach(x => {
              if (!x.Name) {
                validations = false;
                return false;
              }
              else {
                spellList.push({
                  Name: x.Name,
                  ImageUrl: x.ImageUrl,
                  Memorized: x.Memorized ? x.Memorized : false,
                  MaterialComponent: x.MaterialComponent ? x.MaterialComponent : '',
                  CastingTime: x.CastingTime ? x.CastingTime : '',
                  Description: x.Description ? x.Description : '',
                  Stats: x.Stats ? x.Stats : '',
                  Metatags: x.Metatags ? x.Metatags : '',
                  HitEffect: x.HitEffect ? x.HitEffect : '',
                  MissEffect: x.MissEffect ? x.MissEffect : '',
                  EffectDescription: x.EffectDescription ? x.EffectDescription : '',
                  ShouldCast: x.ShouldCast ? x.ShouldCast : false,
                  Levels: x.Levels ? x.Levels : '',
                  IsVerbalComponent: x.IsVerbalComponent ? x.IsVerbalComponent : false,
                  IsMaterialComponent: x.IsMaterialComponent ? x.IsMaterialComponent : false,
                  IsSomaticComponent: x.IsSomaticComponent ? x.IsSomaticComponent : false,
                  Command: x.Command ? x.Command : '',
                  CommandName: x.CommandName ? x.CommandName : '',
                  Class: x.Class ? x.Class : '',
                  itemStats: x.itemStats ? x.itemStats : '',
                  gmOnly: x.GMOnly ? x.GMOnly : '',
                  Command1: x.Command1 ? x.Command1 : '',
                  CommandName1: x.CommandName1 ? x.CommandName1 : '',
                  Command2: x.Command2 ? x.Command2 : '',
                  CommandName2: x.CommandName2 ? x.CommandName2 : '',
                  Command3: x.Command3 ? x.Command3 : '',
                  CommandName3: x.CommandName3 ? x.CommandName3 : '',
                  Command4: x.Command4 ? x.Command4 : '',
                  CommandName4: x.CommandName4 ? x.CommandName4 : '',
                  Command5: x.Command5 ? x.Command5 : '',
                  CommandName5: x.CommandName5 ? x.CommandName5 : '',
                  Command6: x.Command6 ? x.Command6 : '',
                  CommandName6: x.CommandName6 ? x.CommandName6 : '',
                  Command7: x.Command7 ? x.Command7 : '',
                  CommandName7: x.CommandName7 ? x.CommandName7 : '',
                  Command8: x.Command8 ? x.Command8 : '',
                  CommandName8: x.CommandName8 ? x.CommandName8 : '',
                  Command9: x.Command9 ? x.Command9 : '',
                  CommandName9: x.CommandName9 ? x.CommandName9 : '',
                  Command10: x.Command10 ? x.Command10 : '',
                  CommandName10: x.CommandName10 ? x.CommandName10 : ''

                });
              }
            });
          }

          if (!_validations) {
            let message = "Name is required!";
            this.alertService.showMessage(message, "", MessageSeverity.error);
          }
          else if (spellList.length == 0) {
            let message = "Uploaded file is empty or invalid!";
            this.alertService.showMessage(message, "", MessageSeverity.error);
          }
          else {
            if (+this.ExistingCount + spellList.length > 2000) {
              let message = "The maximum number of records has been reached, 2,000. Please delete some records and try again.";
              this.alertService.showMessage(message, "", MessageSeverity.error);
            }
            else {

              this.max = spellList.length;
              let model = { ruleSetId: ruleSetId, recordType: rType, Spells: spellList }
              this.isLoading = true;

              this.rulesetService.ImportSpells(model)
                .subscribe(data => {
                  this.progress = this.max;
                  setTimeout(() => {
                    let message = "Records have been uploaded successfully.";
                    this.alertService.showMessage("Uploaded", message, MessageSeverity.success);
                    this.isLoading = false;
                    this.close();
                  }, 100);
                },
                  error => {
                    let message = `(${this.progress}) Record(s) have been uploaded successfully.`;
                    this.alertService.showMessage("Uploaded", message, MessageSeverity.success);
                    this.isLoading = false;
                    this.close();
                  });
            }
          }
        }
        else {
          let message = "Please select file to import";
          this.alertService.showMessage(message, "", MessageSeverity.error);
        }
        break;
      case RecordType.ABILITIES:   //Abilities
        let AbilityList = [];
        this.max = AbilityList.length;
        //let drCommands = [];
        let __validations: boolean = true;
        let csvAbilityData = [];
        if (this.csvAbilityListData) {

          csvAbilityData = this.csvSpellListData.Ability;

          if (typeof (csvAbilityData) == "string") { csvAbilityData = JSON.parse(csvAbilityData) }
          if (csvAbilityData) {
            csvAbilityData.forEach(x => {
              if (!x.Name) {
                validations = false;
                return false;
              }
              else {
                AbilityList.push({
                  Name: x.Name,
                  Level: x.Level ? x.Level:'',
                  Command: x.Command ? x.Command : '',
                  CurrentNumberOfUses: x.CurrentNumberOfUses ? x.CurrentNumberOfUses : 0,
                  MaxNumberOfUses: x.MaxNumberOfUses ? x.MaxNumberOfUses : 0,
                  Description: x.Description ? x.Description : '',
                  Stats: x.Stats ? x.Stats : '',
                  ImageUrl: x.ImageUrl ? x.ImageUrl : '',
                  Metatags: x.Metatags ? x.Metatags : '',
                  IsEnabled: x.IsEnabled ? x.IsEnabled : false,
                  CommandName: x.CommandName ? x.CommandName : '',
                  Class: x.Class ? x.Class : '',
                  gmOnly: x.gmOnly ? x.gmOnly : '',
                  Command1: x.Command1 ? x.Command1 : '',
                  CommandName1: x.CommandName1 ? x.CommandName1 : '',
                  Command2: x.Command2 ? x.Command2 : '',
                  CommandName2: x.CommandName2 ? x.CommandName2 : '',
                  Command3: x.Command3 ? x.Command3 : '',
                  CommandName3: x.CommandName3 ? x.CommandName3 : '',
                  Command4: x.Command4 ? x.Command4 : '',
                  CommandName4: x.CommandName4 ? x.CommandName4 : '',
                  Command5: x.Command5 ? x.Command5 : '',
                  CommandName5: x.CommandName5 ? x.CommandName5 : '',
                  Command6: x.Command6 ? x.Command6 : '',
                  CommandName6: x.CommandName6 ? x.CommandName6 : '',
                  Command7: x.Command7 ? x.Command7 : '',
                  CommandName7: x.CommandName7 ? x.CommandName7 : '',
                  Command8: x.Command8 ? x.Command8 : '',
                  CommandName8: x.CommandName8 ? x.CommandName8 : '',
                  Command9: x.Command9 ? x.Command9 : '',
                  CommandName9: x.CommandName9 ? x.CommandName9 : '',
                  Command10: x.Command10 ? x.Command10 : '',
                  CommandName10: x.CommandName10 ? x.CommandName10 : ''

                });
              }
            });
          }

          if (!__validations) {
            let message = "Name is required!";
            this.alertService.showMessage(message, "", MessageSeverity.error);
          }
          else if (AbilityList.length == 0) {
            let message = "Uploaded file is empty or invalid!";
            this.alertService.showMessage(message, "", MessageSeverity.error);
          }
          else {
            if (+this.ExistingCount + AbilityList.length > 2000) {
              let message = "The maximum number of records has been reached, 2,000. Please delete some records and try again.";
              this.alertService.showMessage(message, "", MessageSeverity.error);
            }
            else {

              this.max = AbilityList.length;
              let model = { ruleSetId: ruleSetId, recordType: rType, Abilities: AbilityList }
              this.isLoading = true;

              this.rulesetService.ImportAbilities(model)
                .subscribe(data => {
                  this.progress = this.max;
                  setTimeout(() => {
                    let message = "Records have been uploaded successfully.";
                    this.alertService.showMessage("Uploaded", message, MessageSeverity.success);
                    this.isLoading = false;
                    this.close();
                  }, 100);
                },
                  error => {
                    let message = `(${this.progress}) Record(s) have been uploaded successfully.`;
                    this.alertService.showMessage("Uploaded", message, MessageSeverity.success);
                    this.isLoading = false;
                    this.close();
                  });
            }
          }
        }
        else {
          let message = "Please select file to import";
          this.alertService.showMessage(message, "", MessageSeverity.error);
        }
    }
  }
   

  close(isClose?) {
    this.bsModalRef.hide();
    this.event.emit(isClose == 1 ? false : true);
  }

  //async handleFileInput(file, _type) {
  //  debugger 
  //  if (this.checkfile(file[0], _type)) {
  //    //this.files = file;
  //    if (_type == 'xlsx') {
  //      this.csvFile = file;
  //      this.csvName = file[0].name
  //      //this.xlsName = ''
  //    }

  //    let reader = new FileReader();
  //    //reader.readAsDataURL(file[0]);
  //    reader.onload = (e) => {
  //      try {
  //        let _resultData = e.target["result"];
  //        let _result = this.onFileChange(e)
  //        this.csvMonsterData = _result;
  //      } catch (err) {
  //        alert('Invalid Csv file selected.=Error');
  //        this.clear();
  //      }
  //    }
  //    reader.readAsText(file[0], "UTF-8");
  //    reader.onerror = function (error) {
  //      console.log('Error: ', error);
  //    };
  //  }
  //}

  clear() {
    this.fileName = null;
    this.csvMonsterData = null;
    this.fileName = 'Choose File';
    this.fileInput.nativeElement.value = '';
  }

  csvJSON(csvText) {
    let lines = [];
    const linesArray = csvText.split('\n');
    // for trimming and deleting extra space 
    linesArray.forEach((e: any) => {
      const row = e.replace(/[\s]+[,]+|[,]+[\s]+/g, ',').trim();
      lines.push(row);
    });
    // for removing empty record
    lines.splice(lines.length - 1, 1);
    let result = [];
    const headers = lines[0].split(",");

    for (let i = 1; i < lines.length; i++) {

      const obj = {};
      const currentline = lines[i].split(",");

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j] == "null" || currentline[j] == "NULL" ? undefined : currentline[j];
      }
      result.push(obj);
    }
    //return result; //JavaScript object
    // return JSON.stringify(result); //JSON
    return result;
  }

  checkfile(sender, _type): boolean {
    try {
      var validExts = _type == 'csv' ? new Array(".csv") : new Array(".xlsx", ".xls", ".csv");
      var fileExt = sender.name;
      fileExt = fileExt.substring(fileExt.lastIndexOf('.'));
      if (validExts.indexOf(fileExt) < 0) {
        let message = "Invalid file selected, valid files are of " + validExts.toString() + " types.";
        this.alertService.showMessage(message, "", MessageSeverity.error);
        this.clear();
        //this.toastr.error("Invalid file selected, please select valid file eg. " + validExts.toString() + "", 'Validation Error!');
        return false;
      }
      else return true;
    }
    catch (err) {
      return false;
    }
  }

  ConvertToCSV(objArray, headerList) {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = '';

    for (let index in headerList) {
      row += headerList[index] + ',';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';
    for (let i = 0; i < array.length; i++) {
      let line = '';//(i + 1) + '';
      for (let index in headerList) {
        let head = headerList[index];

        line += headerList.length == (index + 1) ? array[i][head] : array[i][head] + ',';
      }

      str += line + '\r\n';
    }
    return str;
  }

  convertExcelToJson(file) {
    let reader = new FileReader();
    let workbookkk;
    let XL_row_object;
    let json_object;
    reader.readAsBinaryString(file);
    return new Promise((resolve, reject) => {
      reader.onload = function () {
        //  alert(reader.result);
        let data = reader.result;
        workbookkk = read(data, { type: 'binary' });
        console.log(workbookkk);
        workbookkk.SheetNames.forEach(function (sheetName) {
          // Here is your object
          XL_row_object = utils.sheet_to_json(workbookkk.Sheets[sheetName]);
          json_object = JSON.stringify(XL_row_object);
          //  console.log(json_object);
          //  console.log(XL_row_object);
          resolve(XL_row_object);
        });
      };
    });
  }

  onFileChange(ev, type) {
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    if (file.name.includes('.xlsx')) {
      this.xlsx = file;
      this.xlsx = file.name;
      this.fileName = file.name;

      const file1 = ev;
      reader.onload = (event) => {
        const data = reader.result;
        workBook = XLSX.read(data, { type: 'binary' });
        jsonData = workBook.SheetNames.reduce((initial, name) => {
          const sheet = workBook.Sheets[name];
          initial[name] = XLSX.utils.sheet_to_json(sheet);
          return initial;
        }, {});
        var dataString = JSON.stringify(jsonData);
        var dataString1 = JSON.parse(dataString)
        this.csvMonsterData = dataString1;
        this.csvItemMasterData = dataString1;
        this.csvSpellListData = dataString1;
        this.csvAbilityListData = dataString1;
        console.log(this.csvMonsterData)
      }
      reader.readAsBinaryString(file);
    }
    else {
      let message = "Please enter valid name";
      this.alertService.showMessage(message, "", MessageSeverity.error);
    }
  }


  setDownload(data) {
    setTimeout(() => {
      const el = document.querySelector("#download");
      el.setAttribute("href", `data:text/json;charset=utf-8,${encodeURIComponent(data)}`);
      el.setAttribute("download", 'xlsxtojson.json');
    }, 1000)
  }

}
export function getProgressbarConfig(): ProgressbarConfig {
  return Object.assign(new ProgressbarConfig(), { animate: true, striped: true, max: 100 });
}


