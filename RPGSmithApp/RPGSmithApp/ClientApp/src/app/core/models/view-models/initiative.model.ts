export class initiative {
    constructor(
      name?: string,
      initiativeCommand?: string,
      image?: string,
      initiativeValue?: number,
      type?:string,
      sortOrder?: number
    ) {
       
      this.name = name;
      this.initiativeCommand = initiativeCommand;
      this.image = image;
      this.initiativeValue = initiativeValue;
      this.type = type;
      this.sortOrder = sortOrder;
    }

    public name: string;
    public image: string;
    public initiativeCommand: string;
    public initiativeValue: number;
    public type: string;
    public sortOrder: number
    
}
