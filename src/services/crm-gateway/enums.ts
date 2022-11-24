export enum CRMPeopleTitle {
  MR = 675030000,
  MS = 675030001,
  MX = 675030002,
  MRS = 675030003,
  MISS = 675030004,
  DR = 675030005,
}

export enum CRMPersonType {
  Candidate = 675030000,
  IhttcPortalUser = 675030001,
  TrainerBookerPortalUser = 675030002,
  Unknown = 675030003,
  IhttcCandidate = 675030004,
  TncPortalUser = 675030005,
}

export enum CRMGenderCode {
  Male = 1,
  Female = 2,
  Unknown = 3,
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
  Assigned = 675030011,
  NoLongerRequired = 675030012,
  Incomplete = 675030007,
  AbandonedNonRecoverable = 675030013,
  SystemErrorNonRecoverable = 675030014,
}

export enum CRMGovernmentAgency {
  Dvsa = 0,
  Dva = 1,
}

export enum CRMNsaBookingSlotStatus {
  Offered = 675030000,
  Reserved = 675030001,
  Rejected = 675030002,
  UnderReview = 675030003,
  Cancelled = 675030004,
  AwaitingPayment = 675030005,
}

export enum CRMNsaStatus {
  AwaitingCscResponse = 675030000,
  AwaitingCandidateResponse = 675030001,
  AwaitingPartnerResponse = 675030003,
  AwaitingCandidateInitialReply = 675030005,
  AwaitingCandidateMedicalEvidence = 675030006,
  AwaitingCandidateSlotConfirmation = 675030007,
  EscalatedToNationalOperations = 675030002,
  EscalatedToTestContent = 675030004,
  DuplicationsClosed = 675030008,
  NoLongerRequired = 675030009,
  StandardTestBooked = 675030010,
}

export enum CRMPreferredCommunicationMethod {
  Email = 675030000,
  Post = 675030001,
  Phone = 675030002,
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

export enum CRMProductNumber {
  CAR = '1001',
  MOTORCYCLE = '2001',
  LGVMC = '3001',
  LGVHPT = '3002',
  LGVCPC = '3003',
  LGVCPCC = '3004',
  PCVMC = '4001',
  PCVHPT = '4002',
  PCVCPC = '4003',
  PCVCPCC = '4004',
  ADIP1 = '5001',
  ADIHPT = '5002',
  ADIP1DVA = '5003',
  ERS = '6001',
  AMIP1 = '7001',
  TAXI = '8001',
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
  Duplicate = 675030002,
}

export enum CRMZeroCostBookingReason {
  EXAMINER = 675030000,
  DISTURBANCE = 675030001,
  OTHER = 675030002,
}

export enum CRMEvidenceStatus {
  Approved = 675030000,
  AwaitingEvidence = 675030001,
  Escalated = 675030002,
  Rejected = 675030003,
}

export enum CRMCancelReason {
  DVSACancelled = 675030007,
  TestCentreCancelled = 675030008,
  TestEngineCancelled = 675030009,
  Bereavement = 675030000,
  Emergency = 675030001,
  Exams = 675030002,
  Medical = 675030003,
  DateOrTimeNoLongerSuitable = 675030004,
  PreferNotToSay = 675030005,
  Other = 675030006,
}

export enum CRMTestSupportNeed {
  BSLInterpreter = 675030000,
  ExtraTime = 675030003,
  ExtraTimeWithBreak = 675030004,
  ForeignLanguageInterpreter = 675030005,
  HomeTest = 675030006,
  LipSpeaker = 675030007,
  NonStandardAccommodationRequest = 675030008,
  OralLanguageModifier = 675030009,
  OtherSigner = 675030010,
  Reader = 675030011,
  FamiliarReaderToCandidate = 675030012,
  Reader_Recorder = 675030013,
  SeperateRoom = 675030014,
  TestInIsolation = 675030015,
  SpecialTestingEquipment = 675030016,
}

export enum CRMStateCode {
  Active = 0,
  Inactive = 1,
}

export enum Collection {
  BOOKING_PRODUCT = 'ftts_bookingproducts',
  NSA_BOOKING_SLOTS = 'ftts_nsabookingslots',
  LICENCES = 'ftts_licences',
}

export enum NsaStatus {
  AwaitingCscResponse = 'AwaitingCscResponse',
  AwaitingCandidateResponse = 'AwaitingCandidateResponse',
  AwaitingPartnerResponse = 'AwaitingPartnerResponse',
  AwaitingCandidateInitialReply = 'AwaitingCandidateInitialReply',
  AwaitingCandidateMedicalEvidence = 'AwaitingCandidateMedicalEvidence',
  AwaitingCandidateSlotConfirmation = 'AwaitingCandidateSlotConfirmation',
  EscalatedToNationalOperations = 'EscalatedToNationalOperations',
  EscalatedToTestContent = 'EscalatedToTestContent',
  DuplicationsClosed = 'DuplicationsClosed',
  NoLongerRequired = 'NoLongerRequired',
  StandardTestBooked = 'StandardTestBooked',
}
