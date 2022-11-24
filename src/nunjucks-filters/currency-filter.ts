import config from '../config';

export class CurrencyFilter {
  public static formatPrice(num: number): string {
    return config.currencySymbol + num.toFixed(2);
  }
}
