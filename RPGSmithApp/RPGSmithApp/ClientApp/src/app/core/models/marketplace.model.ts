export class marketplaceModel {
  constructor(marketPlaceId?: number, price?: number, sourceToken?: string, description?: string, qty?: number
    ) {
    this.marketPlaceId = marketPlaceId;
    this.price = price;
    this.sourceToken = sourceToken;
    this.description = description;
    this.qty = qty;
  }
  public marketPlaceId: number;
  public price: number;
  public sourceToken: string;
  public description: string;
  public qty: number;
}


export class marketplaceListModel {

  constructor(id?: number,
    marketPlaceId?: number,
    title?: string,
    description?: string,
    tag?: string,
    price?:number,
    qty?: number,
    image?: string,
    subscribed?: boolean

  ) {
    this.id = id;
    this.marketPlaceId = marketPlaceId;
    this.title = title;
    this.description = description;
    this.tag = tag;
    this.price = price;
    this.qty = qty;
    this.image = image;
    this.subscribed = subscribed;
  }
  public id: number;
  public marketPlaceId: number;
  public title: string;
  public description: string;
  public tag: string;
  public price: number;
  public qty: number;
  public image: string;
  public subscribed: boolean;
}
