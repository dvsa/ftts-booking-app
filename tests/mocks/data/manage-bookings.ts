import {
  LANGUAGE,
  TCNRegion,
  TestType,
  Voiceover,
} from '../../../src/domain/enums';
import { CRMBookingStatus, CRMTestLanguage, CRMVoiceOver } from '../../../src/services/crm-gateway/enums';

const mockCurrentBooking = () => ({
  bookingId: 'mockBookingId',
  bookingProductId: 'mockBookingProductId',
  bookingRef: 'mockRef',
  bsl: false,
  testType: TestType.Car,
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
  },
  dateTime: '2020-12-08T09:45:00.000Z',
  language: LANGUAGE.ENGLISH,
  otherSupport: false,
  salesReference: null,
  receiptReference: '',
  support: true,
  voiceover: Voiceover.NONE,
  lastRefundDate: '2020-12-04',
  reservationId: '',
});

const mockManageBooking = () => ({
  bookingProductId: 'mockBookingProductId',
  reference: 'mockRef',
  bookingId: 'mockBookingId',
  bookingStatus: CRMBookingStatus.Confirmed,
  testDate: '2020-12-08T09:45:00.000Z',
  testLanguage: CRMTestLanguage.English,
  bsl: false,
  voiceoverLanguage: CRMVoiceOver.None,
  additionalSupport: null,
  paymentStatus: null,
  price: 23,
  salesReference: 'mockSalesRef',
  testType: TestType.Car,
  origin: 1,
  testCentre: {
    name: 'mockTestCentreName',
    addressLine1: 'mockTestCentreAddress1',
    addressLine2: 'mockTestCentreAddress2',
    city: 'mockTestCentreCity',
    addressCounty: 'mockTestCounty',
    postcode: 'mockTestCentrePostcode',
  },
});

export {
  mockCurrentBooking,
  mockManageBooking,
};
