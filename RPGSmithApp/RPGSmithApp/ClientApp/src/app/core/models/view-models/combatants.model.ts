export class combatant {
    constructor(
      id?: number,
      name?: string,
      type?: string,
      healthCurrent?: number,
      healthMax?: number,
      buffEffect?: any[],
      colorCode?: string,
      frameColor?: string,
      isCurrentTurn?:string
    ) {
      this.id = id;
      this.name = name;
      this.type = type;
      this.healthCurrent = healthCurrent;
      this.healthMax = healthMax;
      this.buffEffect = buffEffect;
      this.colorCode = colorCode;
      this.frameColor = frameColor;
      this.isCurrentTurn = isCurrentTurn;
    }

  public id: number;
  public name: string;
  public type: string;
  public healthCurrent: number;
  public healthMax: number;
  public buffEffect: any[];
  public colorCode: string;
  public frameColor: string;
  public isCurrentTurn: string;
}
