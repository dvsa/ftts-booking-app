export enum CRMPeopleTitle {
  MR = 675030000,
  MS = 675030001,
  MX = 675030002,
  MRS = 675030003,
  MISS = 675030004,
  DR = 675030005,
}

export enum CRMOrigin {
  CitizenPortal = 1,
  CustomerServiceCentre = 2,
  IHTTCPortal = 3,
  TrainerBookerPortal = 4,
}

export enum CRMBookingStatus {
  Reserved = 675030000,
  Confirmed = 675030001,
  CancellationInProgress = 675030002,
  ChangeInProgress = 675030003,
  CompletePassed = 675030004,
  CompleteFailed = 675030005,
  Draft = 675030006,
  Cancelled = 675030008,
  Unassigned = 675030009,
  Expired = 675030010,
}

export enum CRMAdditionalSupport {
  VoiceoverEnglish = 675030000,
  VoiceoverWelsh = 675030001,
  BritishSignLanguage = 675030002,
  None = 675030003,
}

export enum CRMVoiceOver {
  Albanian = 675030000,
  Arabic = 675030001,
  Bengali = 675030002,
  Cantonese = 675030003,
  Dari = 675030004,
  English = 675030005,
  Farsi = 675030006,
  Gujarati = 675030007,
  Hindi = 675030008,
  Kashmiri = 675030009,
  Kurdish = 675030010,
  Mirpuri = 675030011,
  Polish = 675030012,
  Portuguese = 675030013,
  Punjabi = 675030014,
  Pushto = 675030015,
  Spanish = 675030016,
  Tamil = 675030017,
  Turkish = 675030018,
  Urdu = 675030019,
  None = 675030020,
  Welsh = 675030021,
}

export enum CRMTestType {
  Car = 675030000,
  Motorcycle = 675030001,
  LGV = 675030002,
  PCV = 675030003,
}

export enum TestEngineTestType {
  Car = 0,
  Motorcycle = 2,
}

export enum CRMTestLanguage {
  English = 1,
  Welsh = 2,
}

export enum CRMLicenceValidStatus {
  Valid = 1,
  Invalid = 2,
}

export enum CRMPaymentStatus {
  InProgress = 800,
  UserCancelled = 807,
  Reallocated = 831,
  Adjusted = 821,
  Draft = 100,
  Success = 801,
  Failure = 802,
  Refunded = 809,
  Abandoned = 834,
  Reversed = 675030001,
  StatusUnknown = 675030004,
  CompensationSent = 844,
}

export enum CRMRemit {
  England = 675030000,
  Wales = 675030002,
  Scotland = 675030003,
  NorthernIreland = 675030001,
}

export enum CRMCalendarName {
  England = 'DVSA - England',
  Wales = 'DVSA - Wales',
  Scotland = 'DVSA - Scotland',
  NorthernIreland = 'DVA - NI',
}

export enum CRMTransactionType {
  Booking = 675030004,
  Refund = 675030005,
  Reversal = 675030013,
  PFATopup = 675030000,
  PFABooking = 675030001,
  PFAWithdraw = 675030002,
  PFABookingRefund = 675030003,
  PFAAdjustment = 675030006,
  PFAReallocation = 675030007,
  PFAReallocationTopUp = 675030008,
  PFACompensation = 675030011,
  BookingNoPayment = 675030012,
  PFAReversal = 675030009,
}

export enum CRMFinanceTransactionStatus {
  Deferred = 675030000,
  Recognised = 675030001,
}
