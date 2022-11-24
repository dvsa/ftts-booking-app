import { Candidate as PaymentCandidate } from '@dvsa/ftts-payment-api-model';
import {
  Language,
  Origin,
  TCNRegion,
  TestType,
  Voiceover,
} from '../../../src/domain/enums';
import {
  CRMBookingStatus, CRMFinanceTransactionStatus, CRMGovernmentAgency, CRMProductNumber, CRMRemit, CRMTestLanguage, CRMTransactionType, CRMVoiceOver,
} from '../../../src/services/crm-gateway/enums';
import { BookingDetails } from '../../../src/services/crm-gateway/interfaces';
import { Booking } from '../../../src/services/session';

const mockCurrentBooking = (): Booking => ({
  bookingId: 'mockBookingId',
  bookingProductId: 'mockBookingProductId',
  bookingRef: 'mockRef',
  bookingProductRef: 'mockBookingProductRef',
  bsl: false,
  testType: TestType.CAR,
  centre: {
    testCentreId: '0001:SITE-0135',
    name: 'mockTestCentreName',
    addressLine1: 'mockTestCentreAddress1',
    addressLine2: 'mockTestCentreAddress2',
    addressCity: 'mockTestCentreCity',
    addressCounty: 'mockTestAddressCounty',
    addressPostalCode: 'mockTestCentrePostcode',
    remit: 675030000,
    region: TCNRegion.A,
  } as any,
  dateTime: '2020-12-08T09:45:00.000Z',
  language: Language.ENGLISH,
  salesReference: '',
  receiptReference: '',
  voiceover: Voiceover.NONE,
  lastRefundDate: '2020-12-04',
  reservationId: '',
  origin: Origin.CitizenPortal,
});

const mockManageBooking = (): BookingDetails => ({
  bookingProductId: 'mockBookingProductId',
  reference: 'mockRef',
  bookingId: 'mockBookingId',
  bookingProductRef: 'mockBookingProductRef',
  bookingStatus: CRMBookingStatus.Confirmed,
  testDate: '2020-12-08T09:45:00.000Z',
  testLanguage: CRMTestLanguage.English,
  voiceoverLanguage: CRMVoiceOver.None,
  additionalSupport: null,
  paymentStatus: null,
  price: 23,
  salesReference: 'mockSalesRef',
  testDateMinus3ClearWorkingDays: '2020-12-04T09:45:00.000Z',
  nonStandardAccommodation: false,
  governmentAgency: CRMGovernmentAgency.Dvsa,
  enableEligibilityBypass: false,
  compensationAssigned: null,
  compensationRecognised: null,
  owedCompensationBooking: false,
  isZeroCostBooking: false,
  origin: 1,
  testCentre: {
    siteId: 'mockSiteId',
    ftts_tcntestcentreid: 'mockTcnTestCentreId',
    name: 'mockTestCentreName',
    addressLine1: 'mockTestCentreAddress1',
    addressLine2: 'mockTestCentreAddress2',
    addressCity: 'mockTestCentreCity',
    addressCounty: 'mockTestAddressCounty',
    addressPostalCode: 'mockTestCentrePostcode',
    remit: CRMRemit.England,
    region: TCNRegion.A,
  },
  testSupportNeed: null,
  foreignlanguageselected: null,
  financeTransaction: {
    financeTransactionId: 'mockFinanceTransactionId',
    transactionType: CRMTransactionType.Booking,
    transactionStatus: CRMFinanceTransactionStatus.Recognised,
  },
  product: {
    productid: '001',
    _parentproductid_value: '002',
    productnumber: CRMProductNumber.CAR,
  },
  createdOn: '2021-04-04',
});

const mockRefundPayload = (): PaymentCandidate.BatchRefundPayload => ({
  scope: PaymentCandidate.BatchRefundPayload.ScopeEnum.REFUND,
  customerReference: 'mockCandidateId',
  customerName: 'mockFirstname mockSurname',
  customerManagerName: 'mockFirstname mockSurname',
  customerAddress: {
    line1: 'mockLine1',
    line2: 'mockLine2',
    line3: 'mockLine3',
    line4: 'mockLine4',
    city: 'mockLine5',
    postcode: 'mockPostcode',
  },
  countryCode: PaymentCandidate.BatchRefundPayload.CountryCodeEnum.GB,
  payments: [{
    refundReason: 'Test cancelled by candidate',
    bookingProductId: 'mockBookingProductId',
    totalAmount: '23.00',
    paymentData: [{
      lineIdentifier: 1,
      amount: '23.00',
      netAmount: '23.00',
      taxAmount: '0.00',
      salesReference: 'mockSalesRef',
    }],
  }],
});

export {
  mockCurrentBooking,
  mockManageBooking,
  mockRefundPayload,
};
