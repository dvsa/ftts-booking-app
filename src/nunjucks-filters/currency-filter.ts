import config from '../config';

export class CurrencyFilter {
  public static toTwoDecimalPlaces(num: number): string {
    return num.toFixed(2);
  }

  public static withCurrencyCode(num: number): string {
    return config.currencyCode + num;
  }

  public static withCurrencySymbol(num: number): string {
    return config.currencySymbol + num;
  }
}
