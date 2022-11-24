import { Target, TCNRegion, TestType } from '../../../src/domain/enums';
import { BookingManager } from '../../../src/helpers/booking-manager';
import { CRMGovernmentAgency } from '../../../src/services/crm-gateway/enums';
import { BookingDetails } from '../../../src/services/crm-gateway/interfaces';

const mockCrmGateway = {
  getCandidateByLicenceNumber: () => ({
    candidateId: 'mockCandidateIdGlen',
    firstnames: 'Glen William',
    surname: 'Delaney',
    email: 'mockEmail@test.com',
    dateOfBirth: '2000-09-02',
    licenceId: 'mockLicenceidGlen',
    licenceNumber: 'mockLicenceNumberGlen',
    personReference: null,
  }),
  getCandidateBookings: (): BookingDetails[] => ([
    {
      bookingProductId: 'mockBookingProductId1',
      reference: 'B-000-999-999',
      bookingId: 'mockBookingId1',
      bookingStatus: 675030001,
      testDate: '2020-12-24T09:45:00.000Z',
      testLanguage: 1,
      voiceoverLanguage: 675030020,
      additionalSupport: null,
      paymentStatus: null,
      price: 23,
      salesReference: 'FTT-33602-201222151213',
      testType: TestType.CAR,
      origin: 1,
      governmentAgency: CRMGovernmentAgency.Dvsa,
      testCentre: {
        testCentreId: 'SITE-0135',
        name: 'Cardiff',
        addressLine1: '38 Dale End',
        addressLine2: 'Test',
        addressCity: 'Cardiff',
        addressCounty: 'County',
        addressPostalCode: 'B4 7NJ',
        remit: 675030002,
        accountId: 'mockAccountId',
        region: TCNRegion.B,
        siteId: 'SITE:123',
      },
    },
    {
      bookingProductId: 'mockBookingProductId2',
      reference: 'B-000-063-981',
      bookingId: 'mockBookingId2',
      bookingStatus: 675030001,
      testDate: '2021-01-05T09:00:00.000Z',
      testLanguage: 1,
      voiceoverLanguage: 675030020,
      additionalSupport: null,
      paymentStatus: null,
      price: 23,
      salesReference: 'FTT-B7A20-201222171253',
      testType: TestType.CAR,
      origin: 1,
      governmentAgency: 999999999,
      testCentre: {
        testCentreId: 'SITE-0135',
        name: 'Invalid',
        addressLine1: '38 Dale End',
        addressLine2: 'Test',
        addressCity: 'Invalid',
        addressCounty: 'West Midlands',
        addressPostalCode: 'B4 7NJ',
        remit: 999999999,
        accountId: undefined,
        region: TCNRegion.C,
        siteId: 'SITE-0135',
      },
    },
    {
      bookingProductId: 'mockBookingProductId3',
      reference: 'B-000-063-982',
      bookingId: 'mockBookingId3',
      bookingStatus: 675030001,
      testDate: '2021-01-05T09:00:00.000Z',
      testLanguage: 1,
      voiceoverLanguage: 675030020,
      additionalSupport: null,
      paymentStatus: null,
      price: 23,
      salesReference: 'FTT-C367B-201222171236',
      testType: TestType.MOTORCYCLE,
      origin: 1,
      governmentAgency: CRMGovernmentAgency.Dva,
      testCentre: {
        testCentreId: 'SITE-0135',
        name: 'Belfast',
        addressLine1: '38 Dale End',
        addressLine2: 'Test',
        addressCity: 'Belfast',
        addressCounty: 'West Midlands',
        addressPostalCode: 'B4 7NJ',
        remit: 675030001,
        accountId: undefined,
        region: TCNRegion.A,
        siteId: 'SITE-0135',
      },
    },
  ]),
};

const bookingManager = new BookingManager(mockCrmGateway as any);

describe('Booking Manager', () => {
  let req;
  beforeEach(() => {
    req = {
      hasErrors: false,
      errors: [],
      session: {
        manageBooking: {
          candidate: {},
          bookings: [],
        },
      },
    };
  });

  test('loads only Northern Ireland bookings into session', async () => {
    delete req.session.manageBooking.candidate;
    req.session.target = Target.NI;

    const bookings = await bookingManager.loadCandidateBookings(req, 'mockCandidateId');

    expect(req.session.manageBooking.bookings).toStrictEqual([expect.objectContaining({
      bookingProductId: 'mockBookingProductId3',
      reference: 'B-000-063-982',
      bookingId: 'mockBookingId3',
      governmentAgency: CRMGovernmentAgency.Dva,
    })]);
    expect(bookings).toHaveLength(1);
  });

  test('loads only Great Britain bookings into session', async () => {
    delete req.session.manageBooking.candidate;
    req.session.target = Target.GB;

    const bookings = await bookingManager.loadCandidateBookings(req, 'mockCandidateId');

    expect(req.session.manageBooking.bookings).toStrictEqual([expect.objectContaining({
      bookingProductId: 'mockBookingProductId1',
      reference: 'B-000-999-999',
      bookingId: 'mockBookingId1',
      governmentAgency: CRMGovernmentAgency.Dvsa,
    })]);
    expect(bookings).toHaveLength(1);
  });
});
