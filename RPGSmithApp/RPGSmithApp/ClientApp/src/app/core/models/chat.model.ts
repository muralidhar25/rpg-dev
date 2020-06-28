export class ChatConnection {

  constructor(connectionID?: string, isRuleset?: boolean, rulesetID?: number, characterID?: number) {
    this.connectionID = connectionID;
    this.isRuleset = isRuleset;
    this.rulesetID = rulesetID;
    this.characterID = characterID;
  }

  public connectionID: string;
  public isRuleset: boolean;
  public rulesetID: number;
  public characterID: number;
}
//export class CurrentUserChatConnections {
//  constructor(connections?: ChatConnection[]) {
//    this.connections = connections ? connections : [];   
//  }
//  public connections: ChatConnection[];  
//}
