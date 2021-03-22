import { LANGUAGE, TCNRegion, TestType } from '../../../src/domain/enums';
import { TestVoiceover } from '../../../src/domain/test-voiceover';
import { CRMVoiceOver } from '../../../src/services/crm-gateway/enums';
import { Booking, Candidate } from '../../../src/services/session';

const mockSessionBooking = (): Booking => ({
  bookingId: 'mockBookingId',
  bookingProductId: 'mockBookingProductId',
  bookingRef: 'mockBookingRef',
  bsl: false,
  testType: TestType.Car,
  centre: {
    name: 'Birmingham',
    parentOrganisation: 'c5a24e76-1c5d-ea11-a811-000d3a7f128d',
    status: 'ACTIVE',
    region: TCNRegion.A,
    state: 'gb',
    siteId: 'SITE-0135',
    description: 'Est et quo similique ullam ut esse facere atque saepe. Et expedita vero sapiente quod eum ea voluptatem impedit est.',
    accessible: 'Disabled access',
    fullyAccessible: false,
    addressLine1: '38 Dale End',
    addressLine2: null,
    addressCity: 'Birmingham',
    addressCounty: 'West Midlands',
    addressPostalCode: 'B4 7NJ',
    addressCountryRegion: 'West Midlands United Kingdom',
    latitude: 52.48213,
    longitude: -1.89219,
    distance: 0.29407376676936053,
    accountId: '03f6a7c8-937d-ea11-a811-00224801bc51',
    remit: 675030000,
  },
  dateTime: '2020-12-30T10:00:00Z',
  language: LANGUAGE.ENGLISH,
  otherSupport: false,
  salesReference: 'mockSalesRef',
  receiptReference: 'mockReceiptRef',
  reservationId: 'mockReservationId',
  support: false,
  voiceover: TestVoiceover.fromCRMVoiceover(CRMVoiceOver.English),
  lastRefundDate: '2020-12-30T10:00:00Z',
});

const mockSessionCandidate = (): Candidate => ({
  firstnames: 'mockFirstname',
  surname: 'mockSurname',
  dateOfBirth: '1990-12-30',
  licenceNumber: 'mockLicenceNumber',
  licenceId: 'mockLicenceId',
  email: 'mockEmail@test.com',
  candidateId: 'mockCandidateId',
  personReference: 'mockPersonReference',
});

export {
  mockSessionBooking,
  mockSessionCandidate,
};
