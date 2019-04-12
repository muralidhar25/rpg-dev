export class marketplaceModel {
  constructor(marketPlaceId?: number, price?: number, sourceToken?: string, description ? : string
    ) {
    this.marketPlaceId = marketPlaceId;
    this.price = price;
    this.sourceToken = sourceToken;
    this.description = description;
  }
  public marketPlaceId: number;
  public price: number;
  public sourceToken: string;
  public description: string;
}


export class marketplaceListModel {

  constructor(id?: number,
    marketplaceType?: number,
    title?: string,
    description?: string,
    tag?: string,
    price?:number,
    qty?: number,
    image?: string,
    subscribed?: boolean

  ) {
    this.id = id;
    this.marketplaceType = marketplaceType;
    this.title = title;
    this.description = description;
    this.tag = tag;
    this.price = price;
    this.qty = qty;
    this.image = image;
    this.subscribed = subscribed;
  }
  public id: number;
  public marketplaceType: number;
  public title: string;
  public description: string;
  public tag: string;
  public price: number;
  public qty: number;
  public image: string;
  public subscribed: boolean;
}
