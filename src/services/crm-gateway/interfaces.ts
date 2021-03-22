import {
  TestType, TCNRegion, PreferredDay, PreferredLocation,
} from '../../domain/enums';
import {
  CRMOrigin,
  CRMTestLanguage,
  CRMAdditionalSupport,
  CRMLicenceValidStatus,
  CRMTestType,
  CRMBookingStatus,
  CRMPeopleTitle,
  CRMVoiceOver,
  CRMPaymentStatus,
  CRMRemit,
  CRMTransactionType,
  CRMFinanceTransactionStatus,
} from './enums';

export interface CRMContact {
  ftts_firstandmiddlenames: string;
  lastname: string;
  birthdate: string;
  emailaddress1: string;
  ftts_title: CRMPeopleTitle;
  contactid?: string;
  ftts_personreference: string;
}

export interface CRMLicence {
  ftts_licence: string;
  'ftts_Person@odata.bind': string;
}

export interface CRMBooking {
  ftts_name: string;
  ftts_firstname: string;
  ftts_lastname: string;
  ftts_drivinglicence: string;
  ftts_dob: string;
  ftts_origin: CRMOrigin;
  ftts_pricelist?: string | null;
  ftts_testdate?: string;
  ftts_bookingstatus?: number;
  ftts_language?: CRMTestLanguage;
  ftts_additionalsupportoptions?: CRMAdditionalSupport;
  ftts_nivoiceoveroptions: CRMVoiceOver;
  ftts_licencevalidstatus?: CRMLicenceValidStatus;
  ftts_testtype?: CRMTestType;
  'ftts_candidateid@odata.bind': string;
  'ftts_LicenceId@odata.bind': string;
  'ftts_testcentre@odata.bind': string;
}

export interface CRMBookingProduct {
  'ftts_bookingid@odata.bind': string;
  'ftts_CandidateId@odata.bind': string;
  'ftts_productid@odata.bind': string;
  'ftts_ihttcid@odata.bind': string;
  'ftts_drivinglicencenumber@odata.bind': string;
  'ftts_testcategoryId@odata.bind': string;
  ftts_reference: string;
  ftts_drivinglicenceentered: string;
  ftts_price: number;
  ftts_bookingstatus: CRMBookingStatus;
  ftts_testdate: string;
  ftts_testlanguage: CRMTestLanguage;
  ftts_selected: boolean;
  ftts_tcn_update_date: string;
  ftts_salesreference: string;
}

export interface CRMProduct {
  productid: string;
  _parentproductid_value: string;
}

export interface BookingDetails {
  bookingProductId: string;
  reference: string;
  bookingId: string;
  bookingStatus: CRMBookingStatus;
  testDate: string;
  testDateMinus3ClearWorkingDays?: string;
  testLanguage: CRMTestLanguage;
  voiceoverLanguage: CRMVoiceOver;
  additionalSupport: CRMAdditionalSupport;
  paymentStatus: CRMPaymentStatus;
  price: number;
  salesReference: string;
  testType: TestType;
  origin: CRMOrigin;
  testCentre: BookingDetailsCentre;
  accountId?: string;
  payment?: {
    paymentId: string;
    paymentStatus: CRMPaymentStatus;
  };
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
}

export interface CRMBookingDetails {
  ftts_bookingproductid: string;
  _ftts_bookingid_value: string;
  ftts_bookingstatus: CRMBookingStatus;
  ftts_testdate: string;
  ftts_testlanguage: CRMTestLanguage;
  ftts_voiceoverlanguage: CRMVoiceOver;
  ftts_additionalsupportoptions: CRMAdditionalSupport;
  ftts_paymentstatus: CRMPaymentStatus;
  ftts_price: number;
  ftts_salesreference: string;
  ftts_bookingid: {
    ftts_reference: string;
    ftts_origin: CRMOrigin;
    ftts_testtype: CRMTestType;
    ftts_testcentre: CRMTestCentre;
  };
}

export interface CRMTestCentre {
  name: string;
  address1_line1: string;
  address1_line2?: string;
  address1_city: string;
  address1_county: string;
  address1_postalcode: string;
  ftts_remit: CRMRemit;
  ftts_siteid?: string;
  account_id?: string;
  ftts_regiona: boolean;
  ftts_regionb: boolean;
  ftts_regionc: boolean;
}

export interface LicenceResponse {
  candidateId: string;
  licenceId: string;
}

export interface ProductResponse {
  id: string;
  parentId: string;
}

export interface CandidateResponse {
  firstnames: string;
  surname: string;
  dateOfBirth: string;
  email: string;
  candidateId?: string;
}

export interface LicenceAndProductResponse {
  licence?: LicenceResponse;
  product: ProductResponse;
}

export interface LicenceAndCandidateResponse {
  licence?: LicenceResponse;
  candidate: CandidateResponse;
}

export interface CandidateAndBookingResponse {
  booking: BookingResponse;
  licence: LicenceResponse;
}

export interface BookingResponse {
  id: string;
  reference: string;
}

export interface CRMBookingResponse {
  ftts_bookingid: string;
  ftts_reference: string;
}

export interface CRMLicenceResponse {
  _ftts_person_value: string;
  ftts_licenceid: string;
  ftts_licence: string;
}

export interface CRMLicenceCandidateResponse {
  ftts_licenceid: string;
  ftts_licence: string;
  ftts_Person: {
    contactid: string;
    ftts_firstandmiddlenames: string;
    lastname: string;
    emailaddress1: string;
    birthdate: string;
    ftts_personreference: string;
  };
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
  _ftts_bookingproduct_value: string;
}

export interface RescheduleUpdateRequest {
  ftts_testdate: string;
  'ftts_testcentre@odata.bind'?: string;
  ftts_bookingstatus: CRMBookingStatus;
}
