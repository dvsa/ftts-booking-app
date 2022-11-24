import { ELIG } from '@dvsa/ftts-eligibility-api-model';
import {
  TCNRegion, PreferredDay, PreferredLocation,
} from '../../domain/enums';
import {
  CRMOrigin,
  CRMTestLanguage,
  CRMAdditionalSupport,
  CRMLicenceValidStatus,
  CRMBookingStatus,
  CRMPeopleTitle,
  CRMVoiceOver,
  CRMPaymentStatus,
  CRMRemit,
  CRMTransactionType,
  CRMFinanceTransactionStatus,
  CRMGovernmentAgency,
  CRMNsaStatus,
  CRMPreferredCommunicationMethod,
  CRMProductNumber,
  CRMGenderCode,
  CRMPersonType,
  CRMEvidenceStatus,
  CRMTestSupportNeed,
  CRMNsaBookingSlotStatus,
  NsaStatus,
} from './enums';

export interface CRMContact {
  contactid: string; // Required on get but not create
  ftts_persontype: CRMPersonType;
  ftts_firstandmiddlenames: string;
  lastname: string;
  ftts_title?: CRMPeopleTitle | null;
  ftts_othertitle?: string | null;
  ftts_personreference?: string;
  birthdate?: string;
  emailaddress1?: string;
  telephone2?: string;
  address1_line1: string;
  address1_line2?: string | null;
  address1_line3?: string | null;
  ftts_address1_line4?: string | null;
  address1_city?: string | null;
  address1_postalcode: string;
  gendercode?: CRMGenderCode;
  'ownerid@odata.bind': string;
}

export interface CRMLicence {
  ftts_licence: string;
  'ftts_Person@odata.bind': string;
  ftts_address1_street1?: string;
  ftts_address1_street2?: string | null;
  ftts_address1street3?: string | null;
  ftts_address1street4?: string | null;
  ftts_address1_city?: string | null;
  ftts_address1_postalcode?: string;
  'ownerid@odata.bind': string;
}

export interface CRMBooking {
  ftts_name?: string;
  ftts_firstname?: string;
  ftts_lastname?: string;
  ftts_testdate?: string;
  ftts_dob?: string;
  ftts_drivinglicence: string;
  ftts_origin?: CRMOrigin;
  ftts_pricepaid?: number;
  ftts_bookingstatus?: number;
  ftts_language?: CRMTestLanguage;
  ftts_additionalsupportoptions?: CRMAdditionalSupport;
  ftts_nivoiceoveroptions?: CRMVoiceOver;
  ftts_licencevalidstatus?: CRMLicenceValidStatus;
  ftts_governmentagency?: CRMGovernmentAgency;
  ftts_nonstandardaccommodation?: boolean;
  ftts_nsastatus?: CRMNsaStatus;
  ftts_supportrequirements?: string;
  ftts_preferreddateandtime?: string;
  ftts_preferreddateselected?: boolean;
  ftts_selecteddate?: string;
  ftts_preferredtestcentrelocation?: string;
  ftts_selectedtestcentrelocation?: string;
  ftts_preferredcommunicationmethod?: CRMPreferredCommunicationMethod;
  ftts_proxypermitted?: boolean;
  ftts_voicemailmessagespermitted?: boolean;
  'ftts_candidateid@odata.bind': string;
  'ftts_pricelist@odata.bind'?: string;
  'ftts_LicenceId@odata.bind': string;
  'ftts_testcentre@odata.bind'?: string;
  'ftts_selectedtestcentrelocation@odata.bind'?: string;
  ftts_productid?: CRMProduct;
  'ownerid@odata.bind'?: string;
  'ftts_tcnpreferreddate'?: string;
  'ftts_dateavailableonoraftertoday'?: string;
  'ftts_dateavailableonorbeforepreferreddate'?: string;
  'ftts_dateavailableonorafterpreferreddate'?: string;
  ftts_testsselected?: boolean;
}

export interface CRMBookingProduct {
  ftts_price: number;
  ftts_selected: boolean;
  ftts_reference?: string;
  ftts_drivinglicenceentered?: string;
  ftts_bookingstatus?: CRMBookingStatus;
  ftts_testdate?: string;
  ftts_testlanguage?: CRMTestLanguage;
  ftts_tcn_update_date?: string;
  ftts_salesreference?: string;
  ftts_personalreferencenumber?: string;
  ftts_paymentreferencenumber?: string;
  ftts_eligible: boolean;
  ftts_eligiblefrom?: string;
  ftts_eligibleto?: string;
  ftts_additionalsupportoptions?: CRMAdditionalSupport;
  'ftts_bookingid@odata.bind': string;
  'ftts_testcategoryId@odata.bind': string;
  'ftts_CandidateId@odata.bind'?: string;
  'ftts_productid@odata.bind'?: string;
  'ftts_ihttcid@odata.bind'?: string;
  'ftts_drivinglicencenumber@odata.bind'?: string;
  'ownerid@odata.bind'?: string;
}

export interface CRMProduct {
  productid: string;
  _parentproductid_value: string;
  name?: string;
  productnumber?: CRMProductNumber;
}

export interface BookingDetails {
  bookingProductId: string;
  reference: string;
  bookingProductRef: string;
  bookingId: string;
  bookingStatus: CRMBookingStatus;
  testDate: string | null;
  testDateMinus3ClearWorkingDays?: string;
  testLanguage: CRMTestLanguage;
  voiceoverLanguage: CRMVoiceOver;
  additionalSupport: CRMAdditionalSupport | null;
  nonStandardAccommodation: boolean | null;
  nsaStatus: CRMNsaStatus | null;
  paymentId?: string;
  paymentStatus: CRMPaymentStatus | null;
  price: number;
  salesReference: string | null;
  origin: CRMOrigin;
  testCentre: BookingDetailsCentre;
  accountId?: string;
  financeTransaction?: {
    financeTransactionId: string;
    transactionType: CRMTransactionType;
    transactionStatus: CRMFinanceTransactionStatus;
  };
  customSupport?: string;
  preferredDay?: string;
  preferredDayOption?: PreferredDay;
  preferredLocation?: string;
  preferredLocationOption?: PreferredLocation;
  governmentAgency: CRMGovernmentAgency;
  product?: CRMProduct;
  createdOn: string;
  enableEligibilityBypass: boolean | null;
  compensationAssigned: string | null;
  compensationRecognised: string | null;
  owedCompensationBooking: boolean;
  isZeroCostBooking: boolean | null;
  testSupportNeed: CRMTestSupportNeed[] | null;
  foreignlanguageselected: string | null;
  voicemailmessagespermitted: boolean | null;
  nsaBookingSlots: CRMNsaBookingSlots[] | null;
}

export interface NsaBookingDetail {
  bookingId: string;
  crmNsaStatus?: CRMNsaStatus;
  nsaStatus?: NsaStatus;
  origin?: CRMOrigin;
  canViewSlots?: boolean;
}

export interface CompensatedBooking {
  bookingProductId: string;
  bookingProductReference: string;
  bookingId: string;
  bookingStatus: CRMBookingStatus;
  candidateId: string;
  compensationAssigned: string | null;
  compensationRecognised: string | null;
  productNumber: CRMProductNumber;
  pricePaid: number;
  price: number;
  priceListId: string | undefined;
}

export interface NsaBookingFields {
  ftts_nonstandardaccommodation: boolean;
  ftts_nsastatus: CRMNsaStatus | undefined;
  ftts_supportrequirements: string | undefined;
  ftts_preferreddateandtime: string | undefined,
  ftts_preferreddateselected: true,
  ftts_preferredtestcentrelocation: string | undefined;
  ftts_preferredcommunicationmethod: CRMPreferredCommunicationMethod;
  ftts_proxypermitted: boolean,
  ftts_voicemailmessagespermitted: boolean | undefined;
  'ownerid@odata.bind': string | undefined;
}

export interface BookingDetailsCentre {
  testCentreId?: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  addressCity: string;
  addressCounty: string;
  addressPostalCode: string;
  remit: CRMRemit;
  accountId?: string;
  region: TCNRegion;
  siteId: string;
  ftts_tcntestcentreid: string;
}

export interface CRMBookingDetails {
  ftts_bookingproductid: string;
  ftts_reference: string;
  _ftts_bookingid_value: string;
  ftts_price: number;
  ftts_bookingstatus: CRMBookingStatus | null;
  ftts_testdate: string | null;
  ftts_testlanguage: CRMTestLanguage | null;
  ftts_voiceoverlanguage: CRMVoiceOver | null;
  ftts_paymentstatus: CRMPaymentStatus | null;
  ftts_salesreference: string | null;
  ftts_additionalsupportoptions: CRMAdditionalSupport | null;
  ftts_bookingid: {
    ftts_governmentagency: CRMGovernmentAgency | null;
    ftts_reference: string | null;
    ftts_origin: CRMOrigin | null;
    ftts_testcentre: CRMTestCentre | null;
    ftts_enableeligibilitybypass: boolean | null;
    ftts_nonstandardaccommodation: boolean | null;
    ftts_nsastatus: CRMNsaStatus | null;
    ftts_owedcompbookingassigned: string | null;
    ftts_owedcompbookingrecognised: string | null;
    ftts_zerocostbooking: boolean | null;
    ftts_testsupportneed: string | null;
    ftts_foreignlanguageselected: string | null;
    ftts_voicemailmessagespermitted: boolean | null;
    ftts_nivoiceoveroptions: CRMVoiceOver | null;
  };
  ftts_nsabookingslots: CRMNsaBookingSlots[] | null;
  ftts_productid?: CRMProduct;
  createdon: string;
}

export interface CRMNsaBookingSlots {
  _ftts_bookingid_value: string;
  ftts_status: CRMNsaBookingSlotStatus;
  ftts_reservationid: string;
  ftts_expirydate: string;
  _ftts_organisationid_value: string;
  ftts_testdate: string;
}

export interface CRMXmlBookingDetails {
  createdon: string;
  ftts_bookingproductid: string;
  ftts_reference: string;
  _ftts_bookingid_value: string;
  ftts_price: number;
  ftts_bookingstatus?: CRMBookingStatus | null;
  ftts_testdate?: string | null;
  ftts_testlanguage?: CRMTestLanguage | null;
  ftts_voiceoverlanguage?: CRMVoiceOver | null;
  ftts_paymentstatus?: CRMPaymentStatus | null;
  ftts_salesreference?: string | null;
  ftts_additionalsupportoptions?: CRMAdditionalSupport | null;
  'booking.ftts_origin'?: CRMOrigin | null;
  bookingReference?: string | null;
  'booking.ftts_nonstandardaccommodation'?: boolean | null;
  'booking.ftts_zerocostbooking'?: boolean | null;
  'booking.ftts_enableeligibilitybypass'?: boolean | null;
  'booking.ftts_governmentagency'?: CRMGovernmentAgency | null;
  'booking.ftts_nsastatus'?: CRMNsaStatus | null;
  'booking.ftts_owedcompbookingassigned'?: string | null;
  'booking.ftts_owedcompbookingrecognised'?: string | null;
  'booking.ftts_testsupportneed'?: string | null;
  'booking.ftts_foreignlanguageselected'?: string | null;
  'booking.ftts_voicemailmessagespermitted'?: boolean | null;
  'booking.ftts_nivoiceoveroptions'?: CRMVoiceOver | null;
  'account.name'?: string;
  'account.address1_line1'?: string;
  'account.address1_line2'?: string;
  'account.address1_city'?: string;
  'account.address1_county'?: string;
  'account.address1_postalcode'?: string;
  'account.ftts_remit'?: CRMRemit;
  'account.ftts_siteid'?: string;
  'account.accountid'?: string;
  'account.ftts_tcntestcentreid'?: string;
  'parentaccountid.ftts_regiona'?: boolean | null;
  'parentaccountid.ftts_regionb'?: boolean | null;
  'parentaccountid.ftts_regionc'?: boolean | null;
  'product.productid': string;
  'product.parentproductid': string;
  'product.productnumber'?: CRMProductNumber;
  'product.name'?: string;
  ftts_nsabookingslots?: CRMNsaBookingSlots[];
}

export interface CRMProductPriceLevel {
  productnumber: CRMProductNumber;
  amount: number;
  productid: {
    productid: string;
    '_parentproductid_value': string;
    name: string;
  };
}

export interface CRMTestCentre {
  name: string;
  address1_line1: string;
  address1_line2?: string;
  address1_city: string;
  address1_county: string;
  address1_postalcode: string;
  ftts_remit?: CRMRemit;
  ftts_siteid?: string;
  accountid?: string;
  ftts_tcntestcentreid?: string;
  parentaccountid: {
    ftts_regiona: boolean | null;
    ftts_regionb: boolean | null;
    ftts_regionc: boolean | null;
  } | null;
}

export interface LicenceResponse {
  candidateId: string;
  licenceId: string;
  address: {
    line1?: string;
    line2?: string;
    line3?: string;
    line4?: string;
    line5?: string;
    postcode?: string;
  };
}

export interface ProductResponse {
  id: string;
  parentId: string;
}

export interface CandidateResponse {
  firstnames?: string;
  surname?: string;
  dateOfBirth?: string;
  email?: string;
  telephone?: string | false;
  personReference?: string;
  candidateId?: string;
  address?: ELIG.Address;
  licence?: Partial<LicenceResponse>;
}

export interface CreateLicenceResponse {
  // There are a lot more fields avalible but the ones below are the only ones we care about
  ftts_licenceid: string;
}

export interface CreateCandidateResponse {
  // There are a lot more fields avalible but the ones below are the only ones we care about
  contactid: string;
}

export interface CreateBookingProductResponse {
  // There are a lot more fields avalible but the ones below are the only ones we care about
  ftts_bookingproductid: string;
  ftts_reference: string
}

export interface LicenceBatchResponse {
  licence?: LicenceResponse;
}

export interface CandidateAndBookingResponse {
  booking: BookingResponse;
  candidate: Partial<CandidateResponse>;
}

export interface BookingResponse {
  id: string;
  reference: string;
  firstName?: string;
  lastName?: string;
  candidateId?: string;
  licenceId?: string;
}

export interface CRMBookingResponse {
  ftts_bookingid: string;
  ftts_reference?: string;
  ftts_firstname?: string;
  ftts_lastname?: string;
  _ftts_candidateid_value?: string;
  _ftts_licenceid_value?: string;
}

export interface CRMBookingRescheduleCountResponse {
  ftts_bookingid: string;
  ftts_reschedulecount?: number | null;
}

export interface CRMLicenceResponse {
  _ftts_person_value: string;
  ftts_licenceid: string;
  ftts_licence: string;
  ftts_address1_street1: string;
  ftts_address1_street2: string;
  ftts_address1street3: string;
  ftts_address1street4: string;
  ftts_address1_city: string;
  ftts_address1_postalcode: string;
}

export interface CRMLicenceCandidateResponse {
  ftts_licenceid: string;
  ftts_licence: string;
  ftts_address1_street1: string;
  ftts_address1_street2: string;
  ftts_address1street3: string;
  ftts_address1street4: string;
  ftts_address1_city: string;
  ftts_address1_postalcode: string;
  candidateId: string;
  firstnames: string;
  surname: string;
  email?: string;
  dateOfBirth?: string;
  personReference?: string;
  telephone?: string;
  title?: CRMPeopleTitle;
  ftts_othertitle?: string;
  gender?: CRMGenderCode;
  supportNeedName?: string;
  supportEvidenceStatus?: CRMEvidenceStatus;
}

export interface GetWorkingDaysResponse {
  '@odata.context': string;
  oDataContext: string;
  DueDate: Date | string;
}

export interface GetPaymentInformationResponse {
  ftts_financetransactionid: string;
  ftts_type: CRMTransactionType;
  ftts_status: CRMFinanceTransactionStatus;
  ftts_payment: {
    ftts_paymentid: string;
    ftts_status: CRMPaymentStatus;
  };
  _ftts_bookingproduct_value?: string;
}

export interface RescheduleUpdateRequest {
  ftts_testdate: string;
  'ftts_testcentre@odata.bind'?: string;
  ftts_bookingstatus: CRMBookingStatus;
  ftts_callamend?: string;
  ftts_tcnpreferreddate?: string;
  ftts_dateavailableonoraftertoday?: string;
  ftts_dateavailableonorbeforepreferreddate?: string;
  ftts_dateavailableonorafterpreferreddate?: string;
  ftts_reschedulecount: number;
}
