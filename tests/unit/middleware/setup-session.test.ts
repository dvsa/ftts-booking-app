import { Locale, Target } from '../../../src/domain/enums';
import { setupSession } from '../../../src/middleware/setup-session';

jest.mock('uuid', () => ({
  v4: () => 'mockSessionId',
}));

describe('Setup Session', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      originalUrl: '',
      session: {
        init: false,
        journey: {
          inEditMode: false,
          inManagedBookingEditMode: false,
          managedBookingRescheduleChoice: '',
        },
        target: Target.GB,
        locale: Locale.GB,
        sessionId: 'oldSessionId',
      },
    };
    res = {
      locals: {},
    };
    next = jest.fn();
  });

  test('support mode is set in locals', () => {
    req.session.journey.inEditMode = true;
    req.session.journey.inManagedBookingEditMode = true;
    req.session.journey.managedBookingRescheduleChoice = 'mock choice';
    setupSession(req, res, next);

    expect(req.session.journey).toMatchObject({
      inEditMode: false,
      inManagedBookingEditMode: false,
      managedBookingRescheduleChoice: '',
      isInstructor: false,
    });
    expect(req.session.init).toBe(true);
    expect(next).toHaveBeenCalled();
  });

  test('sessionId is initialised', () => {
    setupSession(req, res, next);

    expect(req.session.sessionId).toStrictEqual('oldSessionId');
  });

  test('new sessionId is initialised', () => {
    req.session.sessionId = undefined;

    setupSession(req, res, next);

    expect(req.session.sessionId).toStrictEqual('mockSessionId');
  });

  test('handles empty session', () => {
    delete req.session.init;
    setupSession(req, res, next);

    expect(req.session.init).toBe(true);
    expect(next).toHaveBeenCalled();
  });
});
