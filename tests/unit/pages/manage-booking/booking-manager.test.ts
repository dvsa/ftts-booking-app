import { BookingManager } from '../../../../src/pages/manage-booking/booking-manager';

const mockCrmGateway = {
  getCandidateByLicenceNumber: () => ({
    candidateId: 'mockCandidateId',
    firstnames: 'Glen William',
    surname: 'Delaney',
    email: 'mockEmail@test.com',
    dateOfBirth: '2000-09-02',
    licenceId: 'mockLicenceid',
    licenceNumber: 'mockLicenceNumber',
    personReference: null,
  }),
  getCandidateBookings: () => ([
    {
      bookingProductId: 'mockBookingProductId',
      reference: 'B-000-999-999',
      bookingId: 'mockBookingId',
      bookingStatus: 675030001,
      testDate: '2020-12-24T09:45:00.000Z',
      testLanguage: 1,
      voiceoverLanguage: 675030020,
      additionalSupport: null,
      paymentStatus: null,
      price: 23,
      salesReference: 'FTT-33602-201222151213',
      testType: 'car',
      origin: 1,
      testCentre: {
        testCentreId: 'SITE-0135',
        name: 'Birmingham',
        addressLine1: '38 Dale End',
        addressLine2: 'Test',
        addressCity: 'Birmingham',
        addressPostalCode: 'B4 7NJ',
        remit: 675030000,
        accountId: 'mockAccountId',
        region: 'b',
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
          candidate: {
            candidateId: 'mockCandidateId',
            licenceNumber: 'mockLicenceNumber',
          },
          bookings: [
          ],
        },
      },
    };
  });

  test('loads bookings into session', async () => {
    delete req.session.manageBooking.candidate;

    await bookingManager.loadCandidateBookings(req, 'mockLicenceNumber');

    expect(req.session.manageBooking.candidate).toStrictEqual(expect.objectContaining({
      candidateId: 'mockCandidateId',
      licenceNumber: 'mockLicenceNumber',
    }));
    expect(req.session.manageBooking.bookings).toStrictEqual([expect.objectContaining({
      bookingProductId: 'mockBookingProductId',
      reference: 'B-000-999-999',
      bookingId: 'mockBookingId',
    })]);
  });
});
