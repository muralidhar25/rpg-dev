
export class CombatDetails {
    constructor(
      id?: number,
      name?: string,
      image?: string,
      stats?: string,
      buffEffects?: any[],
      desc?: string,
      items?: any[],
      spells?: any[],
      abilites?:any[]
    ) {

      this.id = id;
      this.name = name;
      this.image = image;
      this.stats = stats;
      this.buffEffects = buffEffects;
      this.desc = desc ;
      this.items = items;
      this.spells = spells;
      this.abilites = abilites;
    }

  public id: number; 
  public name: string;
  public image: string;
  public stats: string;
  public buffEffects: any[];
  public desc: string;
  public items: any[];
  public spells: any[];
  public   abilites:any[]
}
