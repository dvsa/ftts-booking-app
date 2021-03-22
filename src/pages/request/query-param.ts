/* eslint-disable @typescript-eslint/no-explicit-any */
export type ParamValue<T> = (source: any) => T;
export type DefaultValue<T> = () => T;
export type TargetValue<T> = (value: any) => T;

export function paramValueOf<T>(name: string, targetValue: TargetValue<T>, defaultValue: DefaultValue<T>): ParamValue<T> {
  return (source: any): T => {
    if (source[`${name}`]) {
      return targetValue(source[`${name}`]);
    }
    return defaultValue();
  };
}
