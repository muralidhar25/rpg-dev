
export class AddMonster {
  constructor(
    recordId?: number,
    name?: string,
    image?: string,
    selected?: boolean,
    type?: string,
    qunatity?: number
    ) {

    this.recordId = recordId;
    this.name = name;
    this.image = image;
    this.selected = selected;
    this.type = type;
    this.quantity = qunatity;
    }

  public recordId: number;
  public name: string;
  public image: string;
  public selected: boolean;
  public type: string;
  public quantity : number

 
}
