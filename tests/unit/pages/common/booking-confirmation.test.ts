import { BookingConfirmation } from '../../../../src/pages/common/booking-confirmation';
import { mockCentres } from '../../../../src/repository/mock-data';
import { LANGUAGE, TARGET, TestType } from '../../../../src/domain/enums';

jest.mock('../../../../src/helpers/language', () => ({
  translate: (key: string): string | undefined => {
    if (key === 'generalContent.language.english') {
      return 'English';
    }
    return undefined;
  },
}));

describe('Booking confirmation controller', () => {
  let bookingConfirmation: BookingConfirmation;
  let res;
  let req;

  const mockTestType = TestType.Car;
  const mockBookingRef = '123456-123';
  const mockTestDateTime = '2020-08-13T10:00:00.000Z';
  const testDateMinus3ClearWorkingDays = '2020-08-07';
  const mockCentre = mockCentres[0];
  const mockEmail = 'anyone@test.com';
  const mockReservationId = 'res001';
  const mockBookingId = 'book123';
  const mockTarget = TARGET.GB;

  beforeEach(() => {
    bookingConfirmation = new BookingConfirmation();

    req = {
      session: {
        candidate: {
          email: mockEmail,
        },
        currentBooking: {
          testType: mockTestType,
          centre: mockCentre,
          reservationId: mockReservationId,
          bookingRef: mockBookingRef,
          bookingId: mockBookingId,
          dateTime: mockTestDateTime,
          lastRefundDate: testDateMinus3ClearWorkingDays,
          language: LANGUAGE.ENGLISH,
        },
        journey: {
          support: false,
        },
        target: mockTarget,
      },
    };

    res = {
      res_params: {},
      res_status: 200,
      res_template: '',
      status: (status: number): object => {
        res.res_status = status;
        return res;
      },
      render: (template: string, params: any): void => {
        res.res_template = template;
        res.res_params = params;
      },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET request', () => {
    test('renders the booking confirmation page with correct template params', () => {
      bookingConfirmation.get(req, res);

      expect(res.res_template).toBe('create/booking-confirmation');
      expect(res.res_params).toMatchObject({
        centre: mockCentre,
        bookingRef: mockBookingRef,
        dateTime: mockTestDateTime,
        testType: mockTestType,
        latestRefundDate: testDateMinus3ClearWorkingDays,
        language: 'English',
      });
    });

    test('renders the NSA booking confirmation page when in support mode', () => {
      req.session.journey.support = true;
      bookingConfirmation.get(req, res);

      const mockRef = 'HDJ2123F'; // TODO FTT-6801 Remove when linking logic.

      expect(res.res_template).toBe('supported/booking-confirmation');
      expect(res.res_params).toMatchObject({
        bookingRef: mockRef,
      });
    });
  });
});
