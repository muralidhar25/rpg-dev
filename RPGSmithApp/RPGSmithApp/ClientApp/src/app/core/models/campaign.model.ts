export class playerInviteSendModel {
  constructor(
    userName?: string,
    sendByUserId?: string,
    campaignId?: number,
    sendByUserName?: string,
    sendByCampaignName?: string,
    sendByCampaignImage?: string
  ) {

    this.userName = userName;
    this.sendByUserId = sendByUserId;
    this.campaignId = campaignId;
    this.sendByUserName = sendByUserName;
    this.sendByCampaignName = sendByCampaignName;
    this.sendByCampaignImage = sendByCampaignImage;

  }
  public userName: string;
  public sendByUserId: string;
  public campaignId: number;
  public sendByUserName: string;
  public sendByCampaignName: string;
  public sendByCampaignImage: string;
}
export class playerInviteListModel {
  constructor(
    inviteId?: number,
    playerCharacterImage?: string,
    playerCharacterName?: string,
    playerCharacterId?: number,
    sendOn?: string,
    isAccepted?: boolean,
    isDeclined?: boolean,
    isSendToUserName?: boolean,
    isAnswerLater?: boolean,
    playerUserImage?: string,
    playerUserName?: string, showIcon?: boolean, playerUserEmail?: string
  ) {
    this.inviteId = inviteId
    this.playerCharacterImage = playerCharacterImage
    this.playerCharacterName = playerCharacterName
    this.playerCharacterId = playerCharacterId
    this.sendOn = sendOn
    this.isAccepted = isAccepted
    this.isDeclined = isDeclined
    this.isSendToUserName = isSendToUserName
    this.isAnswerLater = isAnswerLater
    this.playerUserImage = playerUserImage
    this.playerUserName = playerUserName
    this.playerUserEmail = playerUserEmail
    this.showIcon = showIcon
  }
  public inviteId: number;
  public playerCharacterImage: string;
  public playerCharacterName: string;
  public playerCharacterId: number;
  public sendOn: string;
  public isAccepted: boolean;
  public isDeclined: boolean;
  public isSendToUserName: boolean;
  public isAnswerLater: boolean;
  public playerUserImage: string;
  public playerUserName: string;
  public playerUserEmail: string;
  public showIcon: boolean;
}

export class playerControlModel {

  constructor(
    campaignID?: number,
    id?: number,
    pauseGame?: boolean,
    pauseItemCreate?: boolean,
    pauseItemAdd?: boolean,
    pauseSpellAdd?: boolean,
    pauseSpellCreate?: boolean,
    pauseAbilityAdd?: boolean,
    pauseAbilityCreate?: boolean,
    pauseBuffAndEffectAdd?: boolean,
    pauseBuffAndEffectCreate?: boolean
  ) {
    this.campaignID = campaignID;
    this.id = id;
    this.pauseGame = pauseGame;
    this.pauseItemCreate = pauseItemCreate;
    this.pauseItemAdd = pauseItemAdd;
    this.pauseSpellCreate = pauseSpellCreate;
    this.pauseSpellAdd = pauseSpellAdd;
    this.pauseAbilityAdd = pauseAbilityAdd;
    this.pauseAbilityCreate = pauseAbilityCreate;
    this.pauseBuffAndEffectAdd = pauseBuffAndEffectAdd;
    this.pauseBuffAndEffectCreate = pauseBuffAndEffectCreate;
  }
 
  public campaignID: number;
  public id: number;
  public pauseGame: boolean;
  public pauseItemCreate: boolean;
  public pauseItemAdd: boolean;
  public pauseSpellCreate: boolean;
  public pauseSpellAdd: boolean;
  public pauseAbilityAdd: boolean;
  public pauseAbilityCreate: boolean;
  public pauseBuffAndEffectAdd: boolean;
  public pauseBuffAndEffectCreate: boolean;
}
