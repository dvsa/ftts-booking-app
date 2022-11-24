export const existsInEnum = <T>(enumType: T) => (value: string): boolean => Object.values(enumType).includes(value);

export enum Target {
  GB = 'gb',
  NI = 'ni',
}

export enum Locale {
  GB = 'gb',
  NI = 'ni',
  CY = 'cy',
}

export enum Context {
  CITIZEN = 'candidate',
  INSTRUCTOR = 'instructor',
}

export enum YesNo {
  YES = 'yes',
  NO = 'no',
}

export enum Language {
  ENGLISH = 'english',
  WELSH = 'welsh',
}

export enum ChangeLocationTimeOptions {
  TIME_ONLY = 'changeTimeOnlyOption',
  TIME_AND_DATE = 'changeTimeAndDateOption',
  LOCATION = 'changeLocationOption',
}

export enum TestType {
  ADIHPT = 'adihpt',
  ADIP1 = 'adip1',
  ADIP1DVA = 'adip1dva',
  AMIP1 = 'amip1',
  CAR = 'car',
  ERS = 'ers',
  LGVCPC = 'lgvcpc',
  LGVCPCC = 'lgvcpcc',
  LGVHPT = 'lgvhpt',
  LGVMC = 'lgvmc',
  MOTORCYCLE = 'motorcycle',
  PCVCPC = 'pcvcpc',
  PCVCPCC = 'pcvcpcc',
  PCVHPT = 'pcvhpt',
  PCVMC = 'pcvmc',
  TAXI = 'taxi',
}

export enum TCNRegion {
  A = 'a',
  B = 'b',
  C = 'c',
}

export enum Voiceover {
  ENGLISH = 'english',
  WELSH = 'welsh',
  ARABIC = 'arabic',
  FARSI = 'farsi',
  CANTONESE = 'cantonese',
  TURKISH = 'turkish',
  POLISH = 'polish',
  PORTUGUESE = 'portuguese',
  NONE = 'none',
}

export enum PreferredDay {
  ParticularDay = 'particularDay',
  DecideLater = 'decideLater',
}

export enum PreferredLocation {
  ParticularLocation = 'particularLocation',
  DecideLater = 'decideLater',
}

export enum SupportType {
  ON_SCREEN_BSL = 'onScreenBsl',
  BSL_INTERPRETER = 'bslInterpreter',
  EXTRA_TIME = 'extraTime',
  READING_SUPPORT = 'readingSupport',
  OTHER = 'other',
  TRANSLATOR = 'translator',
  VOICEOVER = 'voiceover',
  NO_SUPPORT_WANTED = 'noSupportWanted',
  NONE = '',
}

export enum EvidencePath {
  EVIDENCE_REQUIRED = 'evidence-required',
  EVIDENCE_NOT_REQUIRED = 'evidence-not-required',
  EVIDENCE_MAY_BE_REQUIRED = 'evidence-may-be-required',
  RETURNING_CANDIDATE = 'returning-candidate',
}

export enum Origin {
  CitizenPortal = 'citizenPortal',
  CustomerServiceCentre = 'customerServiceCentre',
  IHTTCPortal = 'ihttcPortal',
  TrainerBookerPortal = 'trainerBookerPortal',
}

export const standardSupportTypes: SupportType[] = [
  SupportType.ON_SCREEN_BSL,
  SupportType.VOICEOVER,
];

export const nonStandardSupportTypes: SupportType[] = [
  SupportType.BSL_INTERPRETER,
  SupportType.TRANSLATOR,
  SupportType.EXTRA_TIME,
  SupportType.READING_SUPPORT,
];

export enum QueueItImplementation {
  KnownUser = 'server-side',
  JSImplementation = 'client-side',
  disabled = 'disabled',
}

export enum TestSupportNeed {
  BSLInterpreter = 'bslInterpreter',
  ExtraTime = 'extraTime',
  ExtraTimeWithBreak = 'extraTimeWithBreak',
  ForeignLanguageInterpreter = 'foreignLanguageInterpreter',
  HomeTest = 'homeTest',
  LipSpeaker = 'lipSpeaker',
  NonStandardAccommodationRequest = 'nonStandardAccommodationRequest',
  OralLanguageModifier = 'oralLanguageModifier',
  OtherSigner = 'otherSigner',
  Reader = 'reader',
  FamiliarReaderToCandidate = 'familiarReaderToCandidate',
  Reader_Recorder = 'readerRecorder',
  SeperateRoom = 'seperateRoom',
  TestInIsolation = 'testInIsolation',
  SpecialTestingEquipment = 'specialTestingEquipment',
  NoSupport = 'noSupport',
}

export const TARGET_LOCALE_MAP: Map<Target, Locale[]> = new Map([
  [Target.GB, [
    Locale.GB,
    Locale.CY,
  ]],
  [Target.NI, [
    Locale.NI,
  ]],
]);
