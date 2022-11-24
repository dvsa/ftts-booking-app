import { manageReschedulingAuth } from '../../../../src/middleware/auth/manage-rescheduling-auth';
import { mockCurrentBooking, mockManageBooking } from '../../../mocks/data/manage-bookings';

describe('Auth middleware - manage booking rescheduling', () => {
  let req;
  let res;
  let next;
  const timeoutErrorPath = '/timeout';

  beforeEach(() => {
    const sessionBooking = mockCurrentBooking();
    const manageBooking = mockManageBooking();
    req = {
      session: {
        manageBooking: {
          candidate: {
            candidateId: 'c1ca042d-4cc7-ea11-a812-00224801cecd',
            firstnames: 'Glen William',
            surname: 'Delaney',
            email: 'test@test.com',
            dateOfBirth: '2000-09-02',
            licenceId: '878dfc40-4cc7-ea11-a812-00224801cecd',
            licenceNumber: 'DELAN009020GW5IG',
          },
          bookings: [
            manageBooking,
          ],
        },
        currentBooking: sessionBooking,
        journey: {
          inManagedBookingEditMode: true,
        },
      },
    };
    res = {
      redirect: jest.fn(),
    };
    next = jest.fn();
  });

  test('middleware passes if all required fields are given', () => {
    manageReschedulingAuth(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('middleware fails if candidate is missing', () => {
    delete req.session.manageBooking.candidate;

    manageReschedulingAuth(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining(timeoutErrorPath));
    expect(next).not.toHaveBeenCalled();
  });

  test('middleware fails if candidate does not own the booking', () => {
    delete req.session.manageBooking.bookings;

    manageReschedulingAuth(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining(timeoutErrorPath));
    expect(next).not.toHaveBeenCalled();
  });

  test('middleware fails if not in edit mode', () => {
    req.session.journey.inManagedBookingEditMode = false;

    manageReschedulingAuth(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining(timeoutErrorPath));
    expect(next).not.toHaveBeenCalled();
  });
});
