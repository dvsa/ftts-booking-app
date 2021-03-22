export const existsInEnum = <T>(enumType: T) => (value: string): boolean => Object.values(enumType).includes(value);

export enum TARGET {
  GB = 'gb',
  NI = 'ni',
}

export enum LOCALE {
  GB = 'gb',
  NI = 'ni',
  CY = 'cy',
}

export enum YES_NO {
  YES = 'yes',
  NO = 'no',
}

export enum LANGUAGE {
  ENGLISH = 'english',
  WELSH = 'welsh',
}

export enum CHANGE_LOCATION_TIME {
  TIME_ONLY = 'changeTimeOnlyOption',
  TIME_AND_DATE = 'changeTimeAndDateOption',
  LOCATION = 'changeLocationOption',
}

export enum TestType {
  Car = 'car',
  Motorcycle = 'motorcycle',
}

export enum TCNRegion {
  A = 'a',
  B = 'b',
  C = 'c',
}

export enum Voiceover {
  ENGLISH = 'English',
  WELSH = 'Welsh',
  ARABIC = 'Arabic',
  FARSI = 'Farsi',
  CANTONESE = 'Cantonese',
  TURKISH = 'Turkish',
  POLISH = 'Polish',
  PORTUGUESE = 'Portuguese',
  NONE = 'None',
}

export enum PreferredDay {
  ParticularDay = 'particularDay',
  DecideLater = 'decideLater',
}

export enum PreferredLocation {
  ParticularLocation = 'particularLocation',
  DecideLater = 'decideLater',
}
