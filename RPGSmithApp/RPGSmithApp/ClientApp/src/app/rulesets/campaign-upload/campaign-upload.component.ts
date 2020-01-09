import { Component, OnInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { AuthService } from '../../core/auth/auth.service';
import { PlatformLocation } from "@angular/common";
import { RulesetService } from '../../core/services/ruleset.service';
import { RecordType } from '../../core/models/enums';
import * as XLSX from 'xlsx';
import { WorkBook, read, utils, write, readFile } from 'xlsx';

@Component({
  selector: 'app-campaign-upload',
  templateUrl: './campaign-upload.component.html',
  styleUrls: ['./campaign-upload.component.scss']
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


  public event: EventEmitter<any> = new EventEmitter();

  constructor(
    private rulesetService: RulesetService, private bsModalRef: BsModalRef,
    public modalService: BsModalService,
    private location: PlatformLocation,
    private alertService: AlertService) {
    location.onPopState(() => this.modalService.hide(1));
  }

  ngOnInit() {
    setTimeout(() => {
      this.title = this.bsModalRef.content.title;
      this.recordType = this.bsModalRef.content.RecordType;
      this.rulesetId = this.bsModalRef.content.RulesetId;
    }, 0);
  }


  ImportCampaign(ruleSetId, rType: RecordType) {
    let monsterList = [];
    let validation: boolean = true;
    let csvData = [];
    if (this.csvMonsterData) {
      this.csvMonsterData.MonsterTemplates.map(m => {
        m.MonsterTemplateAbilityVM = [];
        m.MonsterTemplateSpellVM = [];
        m.MonsterTemplateBuffAndEffectVM = [];
        m.MonsterTemplateItemMasterVM = [];
        m.MonsterTemplateCommandVM = [];
        m.MonsterTemplateCurrency = [];
      });

      this.csvMonsterData.MonsterTemplates.map(m => {
        if (this.csvMonsterData.Abilities && this.csvMonsterData.Abilities.length) {
          this.csvMonsterData.Abilities.map(ability => {
            if (ability.monsterTemplateId == m.monsterTemplateId) {
              m.MonsterTemplateAbilityVM.push(ability);
            }
          });
        }
        if (this.csvMonsterData.Spells && this.csvMonsterData.Spells.length) {
          this.csvMonsterData.Spells.map(spell => {
            if (spell.monsterTemplateId == m.monsterTemplateId) {
              m.MonsterTemplateSpellVM.push(spell);
            }
          });
        }
        if (this.csvMonsterData.BuffEffects && this.csvMonsterData.BuffEffects.length) {
          this.csvMonsterData.BuffEffects.map(buffEffect => {
            if (buffEffect.monsterTemplateId == m.monsterTemplateId) {
              m.MonsterTemplateBuffAndEffectVM.push(buffEffect);
            }
          });
        }
        if (this.csvMonsterData.Items && this.csvMonsterData.Items.length) {
          this.csvMonsterData.Items.map(item => {
            if (item.monsterTemplateId == m.monsterTemplateId) {
              m.MonsterTemplateItemMasterVM.push(item);
            }
          });
        }
        if (this.csvMonsterData.Commands && this.csvMonsterData.Commands.length) {
          this.csvMonsterData.Commands.map(command => {
            if (command.monsterTemplateId == m.monsterTemplateId) {
              m.MonsterTemplateCommandVM.push(command);
            }
          });
        }
        if (this.csvMonsterData.Currency && this.csvMonsterData.Currency.length) {
          this.csvMonsterData.Currency.map(currency => {
            if (currency.monsterTemplateId == m.monsterTemplateId) {
              m.MonsterTemplateCurrency.push(currency);
            }
          });
        }
      });

      csvData = this.csvMonsterData.MonsterTemplates;

      if (typeof (csvData) == "string") { csvData = JSON.parse(csvData) }
      csvData.forEach(x => {
        if (!x.name) {
          validation = false;
          return false;
        }
        else {
          monsterList.push({
            //monsterTemplateId: x.monsterTemplateId,
            ruleSetId: x.ruleSetId,
            name: x.name,
            imageUrl: x.imageUrl,
            metatags: x.metatags,
            //healthCurrent: x.healthCurrent,
            //healthMax: x.healthMax,
            health:x.health,
            armorClass: x.armorClass,
            xpValue: x.xpValue,
            challangeRating: x.challangeRating,
            addToCombatTracker: x.addToCombatTracker,
            command: x.command,
            commandName: x.commandName,
            description: x.description,
            stats: x.stats,
            initiativeCommand: x.initiativeCommand,
            isRandomizationEngine: false,
            characterId: x.characterId,
            gmOnly: x.gmOnly,
            MonsterTemplateAbilityVM: x.MonsterTemplateAbilityVM,
            MonsterTemplateSpellVM: x.MonsterTemplateSpellVM,
            MonsterTemplateBuffAndEffectVM: x.MonsterTemplateBuffAndEffectVM,
            MonsterTemplateItemMasterVM: x.MonsterTemplateItemMasterVM,
            MonsterTemplateCommandVM: x.MonsterTemplateCommandVM,
            MonsterTemplateCurrency: x.MonsterTemplateCurrency,
          });
        }
      });

      if (!validation) {
        let message = "Name is required!";
        this.alertService.showMessage(message, "", MessageSeverity.error);
      }
      else {
        let model = { ruleSetId: ruleSetId, recordType: rType, monsters: monsterList }

        this.isLoading = true;
        this.rulesetService.ImportRecord(model)
          .subscribe(data => {
            this.isLoading = false;
            this.close();
          },
            error => {
              this.isLoading = false;
            });
      }

    }
    else {
      let message = "Please select file to import";
        this.alertService.showMessage(message, "", MessageSeverity.error);
    }
  }

  close() {
    this.bsModalRef.hide();
    this.event.emit(true);
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


