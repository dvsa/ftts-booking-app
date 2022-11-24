import { StringValue } from './string-value';

export class DateTime extends StringValue {
  public static from(value: string): DateTime {
    if (!this.isValidDate(value)) {
      throw new TypeError('This is not a valid format for a timestamp');
    }
    return new DateTime(value);
  }

  private static isValidDate(value: string): boolean {
    try {
      return new Date(value).toISOString() === value;
    } catch (e) {
      return false;
    }
  }

  private readonly value: Date;

  private constructor(value: string) {
    super();
    this.value = new Date(value);
  }

  public toString(): string {
    return this.value.toISOString();
  }
}
