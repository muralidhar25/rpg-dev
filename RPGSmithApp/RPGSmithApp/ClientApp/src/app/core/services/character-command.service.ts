import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router, NavigationExtras } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { LocalStoreManager } from '../common/local-store-manager.service';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';

import { DBkeys } from '../common/db-keys';
import { FileUploadService } from "../common/file-upload.service";

import { CharacterCommand } from '../models/view-models/character-command.model';
import { DiceRoll } from '../models/view-models/dice-roll.model';
import { Characters } from '../models/view-models/characters.model';
import { ICON, VIEW, DICE, DICE_ICON } from '../models/enums';
import { DiceService } from './dice.service';
import { CustomDice, DiceTray, DefaultDice } from '../models/view-models/custome-dice.model';
import { parse } from 'url';

@Injectable()
export class CharacterCommandService extends EndpointFactory {

  private readonly getByIdUrl: string = this.configurations.baseUrl + "/api/CharacterCommand/getById";
  private readonly getByCharacterIdUrl: string = this.configurations.baseUrl + "/api/CharacterCommand/getByCharacterId";
  private readonly createUrl: string = this.configurations.baseUrl + "/api/CharacterCommand/create";
  private readonly updateUrl: string = this.configurations.baseUrl + "/api/CharacterCommand/update";
  private readonly deleteUrl: string = this.configurations.baseUrl + "/api/CharacterCommand/delete";
  private readonly updateLastCommandUrl: string = this.configurations.baseUrl + "/api/Character/UpdateLastCommand";

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector,
    private fileUploadService: FileUploadService) {
    super(http, configurations, injector);
  }

  getById<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;
    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getById(Id));
      });
  }

  getByCharacterId<T>(characterId: number): Observable<T> {
    let endpointUrl = `${this.getByCharacterIdUrl}?characterId=${characterId}`;
    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getByCharacterId(characterId));
      });
  }

  addOrEdit<T>(model: any): Observable<T> {

    let endpointUrl = this.createUrl;

    if (model.characterCommandId == 0 || model.characterCommandId === undefined)
      endpointUrl = this.createUrl;
    else
      endpointUrl = this.updateUrl;

    return this.http.post<T>(endpointUrl, JSON.stringify(model), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.addOrEdit(model));
      });
  }

  update<T>(model: any): Observable<T> {

    let endpointUrl = this.updateUrl;

    return this.http.post<T>(endpointUrl, JSON.stringify(model), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.update(model));
      });
  }

  duplicate<T>(model: any): Observable<Characters> {
    model.characterCommandId = 0;
    let endpointUrl = this.createUrl;

    return this.http.post<T>(endpointUrl, JSON.stringify(model), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.duplicate(model));
      });
  }

  delete<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.deleteUrl}?id=${Id}`;
    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.delete(Id));
      });
  }

  updateLastCommand<T>(model: any): Observable<T> {

    let endpointUrl = this.updateLastCommandUrl;
    return this.http.post<T>(endpointUrl, JSON.stringify(model), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateLastCommand(model));
      });
  }


  //bind form model
  public commandModelData(_modelVM: any, _view: string): any {
    if (_modelVM == null) _view = 'SAVE';
    let charactersFormModal: any;

    let _lastResult = 0;
    try {

      if (_modelVM.character) {
        //let _lastCommandResult = DiceService.commandInterpretation(_modelVM.character.lastCommandResult);
        _lastResult = Math.floor(eval(_modelVM.character.lastCommandResult));
      }
    } catch (err) { }

    if (_view === 'EDIT') {
      charactersFormModal = {
        characterCommandId: _modelVM.characterCommandId,
        rulesetCommandId: _modelVM.rulesetCommandId,
        name: _modelVM.name,
        command: _modelVM.command,
        characterId: _modelVM.characterId,
        character: _modelVM ? _modelVM.character : new Characters(),
        lastResult: _lastResult, // _modelVM ? (_modelVM.character ? _modelVM.character.lastCommand : '') : '',
        lastResultNumbersColor: _modelVM ? (_modelVM.character ? _modelVM.character.lastCommandResultColor : '') : '',
        lastResultNumbers: _modelVM ? (_modelVM.character ? _modelVM.character.lastCommandResult : '') : '',
        lastSavedCommand: _modelVM ? (_modelVM.character ? _modelVM.character.lastCommand : '') : '',
        diceCommandArray: [],
        view: _view
      }
    }
    else {
      charactersFormModal = {
        characterCommandId: 0,
        name: '',
        characterId: _modelVM ? _modelVM.characterId : 0,
        command: _modelVM ? _modelVM.command : '',
        character: _modelVM ? _modelVM.character : new Characters(),
        lastResult: _lastResult, //_modelVM ? (_modelVM.character ? _modelVM.character.lastCommand : '') : '',
        lastResultNumbersColor: _modelVM ? (_modelVM.character ? _modelVM.character.lastCommandResultColor : '') : '',
        lastResultNumbers: _modelVM ? (_modelVM.character ? _modelVM.character.lastCommandResult : '') : '',
        lastSavedCommand: _modelVM ? (_modelVM.character ? _modelVM.character.lastCommand : '') : '',
        diceCommandArray: [],
        view: VIEW.ADD
      };
    }

    return charactersFormModal;
  }

  public DiceRollData(characterId: number) {
    const diceRollModel: any = new Array<DiceRoll>();
    for (const _dice in DICE) {
      if (!Number(_dice)) {
        const _diceRoll = new DiceRoll()
        _diceRoll.characterId = characterId;
        _diceRoll.dice = _dice;
        _diceRoll.diceIcon = DICE_ICON[_dice];
        _diceRoll.diceNumber = Number(DICE[_dice]);
        _diceRoll.dropHighest = 0;
        _diceRoll.dropLowest = 0;
        _diceRoll.keepHighest = 0;
        _diceRoll.keepLowest = 0;
        _diceRoll.rolledCount = 0;
        _diceRoll.randomNumbers = [];
        diceRollModel.push(_diceRoll);
      }
    }
    return diceRollModel;
  }

  public DiceRollDataFromDiceTray(characterId: number, customDices: CustomDice[], diceTray: DiceTray[], defaultDices: DefaultDice[]) {
    const diceRollModel: any = new Array<DiceRoll>();
    diceTray.map((dt) => {

      let dicename = dt.name;
      let diceIcon = '';
      let diceNumber = 0;
      if (dt.isCustomDice) {
        customDices.map((cd) => {
          if (cd.customDiceId == dt.customDiceId) {
            diceIcon = cd.icon;
            diceNumber = 0;
          }
        })
        let diceExist = dt.name.toUpperCase().split('D')[1];
        if (diceExist) {
          if (diceExist.startsWith('F')) {
            diceIcon = "icon-Dice-d6-bg";
          }
          else if (diceExist=="ECK") {
            diceIcon = "icon-Dice-deck";
          }
          else if (diceExist == "OC") {
            diceIcon = "icon-Dice-deck";
          }
        }
      }
      else if (dt.isDefaultDice) {
        defaultDices.map((dd) => {
          if (dd.defaultDiceId == dt.defaultDiceId) {
            diceIcon = dd.icon;
            try {
              diceNumber = parseInt(dt.name.substring(1, dt.name.length))
            }
            catch (ex) {
              diceNumber = 0;
            }
          }
        })
      }
      else {
        let diceExist = dt.name.toUpperCase().split('D')[1];
        if (diceExist) {
          if (diceExist.startsWith('F'))
            diceIcon = "icon-Dice-d6-bg";
          else if (diceExist == "ECK") {
            diceIcon = "icon-Dice-deck";
          }
          else if (diceExist == "OC") {
            diceIcon = "icon-Dice-deck";
          }
          else
            diceIcon = "icon-Gen-dx";
        }
        try {
          diceNumber = parseInt(dt.name.substring(1, dt.name.length))
        }
        catch (ex) {
          diceNumber = 0;
        }
      }

      const _diceRoll = new DiceRoll()
      _diceRoll.characterId = characterId;
      _diceRoll.dice = dicename.toUpperCase();
      _diceRoll.diceIcon = diceIcon;
      _diceRoll.diceNumber = diceNumber;
      _diceRoll.dropHighest = 0;
      _diceRoll.dropLowest = 0;
      _diceRoll.keepHighest = 0;
      _diceRoll.keepLowest = 0;
      _diceRoll.rolledCount = 0;
      _diceRoll.randomNumbers = [];
      diceRollModel.push(_diceRoll);
    })

    return diceRollModel;
  }


}
