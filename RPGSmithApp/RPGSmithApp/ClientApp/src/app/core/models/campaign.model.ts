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

