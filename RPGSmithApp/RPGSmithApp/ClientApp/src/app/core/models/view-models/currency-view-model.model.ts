export class CurrencyViewModel {
  constructor(currencyTypeId?: number, name?: string, weightValue?: number, baseUnit?: number, ruleSetId?: number) {
    this.currencyTypeId = currencyTypeId;
    this.name = name;
    this.weightValue = weightValue;
    this.baseUnit = baseUnit;
    this.ruleSetId = ruleSetId;
  }

  public currencyTypeId: number;
  public name: string;
  public weightValue: number;
  public baseUnit: number;
  public ruleSetId: number;
}
