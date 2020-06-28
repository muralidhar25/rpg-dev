import { VIEW } from '../enums';

export class CurrencyViewModel {
  constructor(currencyId?: number, currencyName?: string, currencyWeight?: number, currencyBaseUnit?: number, ruleSetId?: number) {
    this.currencyId = currencyId;
    this.currencyName = currencyName;
    this.currencyWeight = currencyWeight;
    this.currencyBaseUnit = currencyBaseUnit;
    this.ruleSetId = ruleSetId;
    }

  public currencyId: number;
  public currencyName: string;
  public currencyWeight: number;
  public currencyBaseUnit: number;
  public ruleSetId: number;
}
