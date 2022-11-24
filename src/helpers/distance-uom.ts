import { ParamValue, paramValueOf, TargetValue } from './query-param';

export enum DistanceUom {
  miles = 'miles',
  km = 'km',
}

const distanceFrom: TargetValue<DistanceUom> = (v) => {
  if (v === DistanceUom[DistanceUom.km]) {
    return DistanceUom.km;
  }
  return DistanceUom.miles;
};

export const distanceUomFrom: ParamValue<DistanceUom> = paramValueOf(
  'distanceUom',
  distanceFrom,
  () => DistanceUom.miles,
);
