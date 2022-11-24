import { supportAuth } from '../../../../src/middleware/auth/support-auth';

describe('Auth middleware - support journey', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      session: {
        candidate: {
          firstnames: 'First Names',
        },
        journey: undefined,
      },
    };
    res = {
      redirect: jest.fn(),
    };
    next = jest.fn();
  });

  test('redirects to start of journey if support is set to false', () => {
    req.session.journey = {
      support: false,
    };

    supportAuth(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('/timeout'));
  });

  test('continues if support is set to true', () => {
    req.session.journey = {
      support: true,
    };

    supportAuth(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
