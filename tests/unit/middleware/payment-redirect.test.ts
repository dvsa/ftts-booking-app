import { BusinessTelemetryEvents, logger } from '../../../src/helpers/logger';
import { paymentRedirect } from '../../../src/middleware/payment-redirect';

describe('Payment redirect middleware', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      params: {
        bookingReference: 'B-000-000-001',
      },
      session: {
        currentBooking: {
          bookingRef: undefined,
        },
      },
    };
    res = {};
    next = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('log event with booking ref when redirected from payments and session is empty', () => {
    paymentRedirect(req, res, next);

    expect(logger.event).toHaveBeenCalledWith(
      BusinessTelemetryEvents.PAYMENT_REDIRECT_SESSION_FAIL,
      'paymentRedirect: Redirected back to an invalid or expired session from payments',
      { bookingReference: 'B-000-000-001' },
    );
  });

  test('does not log event with booking ref when redirected from payments if session is populated', () => {
    req.session.currentBooking.bookingRef = 'B-001-001-001';

    paymentRedirect(req, res, next);

    expect(logger.event).not.toHaveBeenCalled();
  });
});
