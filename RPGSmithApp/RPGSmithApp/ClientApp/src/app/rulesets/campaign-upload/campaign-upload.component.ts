import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { AlertService } from '../../core/common/alert.service';
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { AuthService } from '../../core/auth/auth.service';
import { PlatformLocation } from "@angular/common";
import { RulesetService } from '../../core/services/ruleset.service';
import { RecordType } from '../../core/models/enums';

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
  csvFile;
  csvName = 'Choose File';
  rulesetId: number;
  recordType: any;
  csvMonsterData = [];

  constructor(
    private rulesetService: RulesetService, private bsModalRef: BsModalRef,    
    public modalService: BsModalService,
    private location: PlatformLocation) {
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
    this.csvMonsterData.forEach(x => {

      if (!x.name) {
        validation = false;
        return false;
      }
      else {
        monsterList.push({
          //monsterId: x.monsterId,
          ruleSetId: x.ruleSetId,
          name: x.name,
          imageUrl: x.imageUrl,
          metatags: x.metatags,
          healthCurrent: x.healthCurrent,
          healthMax: x.healthMax,
          armorClass: x.armorClass,
          xPValue: x.xPValue,
          challangeRating: x.challangeRating,
          addToCombatTracker: x.addToCombatTracker,
          command: x.command,
          commandName: x.commandName,
          description: x.description,
          stats: x.stats,
          initiativeCommand: x.initiativeCommand,
          isRandomizationEngine: x.isRandomizationEngine,
          characterId: x.characterId,
          gmOnly: x.gmOnly,
        });
      }
    });

    if (!validation) {
      alert('Name is required!')
    }
    else {

      let model = {
        ruleSetId: ruleSetId,
        recordType: rType,
        monsters: monsterList
      }
      console.log(model);
      this.rulesetService.ImportRecord(model)
        .subscribe(data => {
          this.isLoading = false;
        },
          error => {
            this.isLoading = false;

          }
        );
    }
  }

  close() {
    this.bsModalRef.hide();
  }

  async handleFileInput(file, _type) {
    if (this.checkfile(file[0], _type)) {
      //this.files = file;
      if (_type == 'csv') {
        this.csvFile = file;
        this.csvName = file[0].name
        //this.xlsName = ''
      }

      let reader = new FileReader();
      //reader.readAsDataURL(file[0]);
      reader.onload = (e) => {
        try {
          let _resultData = e.target["result"];
          let _result = this.csvJSON(_resultData)
          this.csvMonsterData = _result;
        } catch (err) {
          alert('Invalid Csv file selected.=Error');
          this.clear();
        }
      }
      reader.readAsText(file[0], "UTF-8");
      reader.onerror = function (error) {
        console.log('Error: ', error);
      };
    }
  }

  clear() {
    this.csvFile = null;
    this.csvMonsterData = null;
    this.csvName = 'Choose File';
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
        alert("Invalid file selected, valid files are of " + validExts.toString() + " types.");
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

}
