export class DistanceFilter {
  public static formatDistance(num: number): string {
    if (num > 10) {
      return num.toFixed(0);
    }

    return Number(num.toFixed(1)).toString();
  }

  public static milesToKilometres(num: number): number {
    return num * 1.609;
  }
}
