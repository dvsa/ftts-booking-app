export abstract class StringValue {
  protected static isValid(value: string): boolean {
    return typeof value === 'string' && value.length > 0;
  }
}
