import { setSupportMode } from '../../../src/middleware/set-support-mode';

describe('set support mode', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      session: {
        journey: {
          support: true,
        },
      },
    };
    res = {
      locals: {},
    };
    next = jest.fn();
  });

  test('support mode is set in locals', () => {
    setSupportMode(req, res, next);

    expect(res.locals.inSupportMode).toBe(req.session.journey.support);
    expect(next).toHaveBeenCalled();
  });
});
