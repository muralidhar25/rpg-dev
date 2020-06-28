import { VIEW } from '../enums';

import { Ruleset } from './ruleset.model';
import { CharactersCharacterStat } from './characters-character-stats.model';
export class Characters {

  constructor(characterId?: number, characterName?: string, characterDescription?: string, characterImage?: string,
    ruleSetId?: number, view?: VIEW, showIcon?: boolean, ruleSet?: any, ruleSets?: Ruleset[],
    imageUrl?: string, thumbnailUrl?: string, lastCommand?: string, lastCommandResult?: string,
    charactersCharacterStats?: CharactersCharacterStat[], lastCommandTotal?: number, lastCommandResultColor?: string
  ) {

    this.characterId = characterId;
    this.characterName = characterName;
    this.characterDescription = characterDescription;
    this.characterImage = characterImage;
    this.ruleSetId = ruleSetId;
    this.showIcon = showIcon;
    this.view = view;
    this.ruleSet = ruleSet;
    this.ruleSets = ruleSets;
    this.imageUrl = imageUrl;
    this.thumbnailUrl = thumbnailUrl;
    this.lastCommand = lastCommand;
    this.lastCommandResult = lastCommandResult;
    this.lastCommandResultColor = lastCommandResultColor;
    this.charactersCharacterStats = charactersCharacterStats;
    this.lastCommandTotal = lastCommandTotal;
  }

  public characterId: number;
  public characterName: string;
  public characterDescription: string;
  public characterImage: string;
  public ruleSetId: number;
  public showIcon: boolean;
  public view: VIEW;
  public ruleSet: any;
  public ruleSets: Ruleset[];
  public imageUrl: string;
  public thumbnailUrl: string;

  public lastCommand: string;
  public lastCommandResult: string;
  public lastCommandResultColor: string;
  public charactersCharacterStats: CharactersCharacterStat[];
  public lastCommandValues: string;
  public lastCommandTotal: number;
  public isDicePublicRoll: boolean;
}


