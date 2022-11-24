import { YesNo } from '../domain/enums';

export class YesOrNo {
  public static from(value: string): YesOrNo {
    if (!YesOrNo.isYesOrNo(value)) {
      throw new TypeError('Please choose yes or no.');
    }
    return new YesOrNo(value);
  }

  public static fromBoolean(bool: boolean): YesOrNo {
    if (bool !== true && bool !== false) {
      throw new TypeError('The value provided is not of type boolean.');
    }
    const yesOrNo = bool ? YesNo.YES : YesNo.NO;
    return new YesOrNo(yesOrNo);
  }

  public static isValid(value: string): boolean {
    return YesOrNo.from(value) instanceof YesOrNo;
  }

  private static isYesOrNo(value: string): boolean {
    return value !== undefined && (value === 'yes' || value === 'no');
  }

  private constructor(private readonly value: string) { }

  public toString(): string {
    return this.value;
  }
}
