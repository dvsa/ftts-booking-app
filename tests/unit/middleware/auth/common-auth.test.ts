import { commonAuth } from '../../../../src/middleware/auth/common-auth';

describe('Auth middleware - common pages on main booking journey', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      session: {
        candidate: undefined,
        journey: {
          support: true,
          standardAccommodation: false,
        },
      },
    };
    res = {
      redirect: jest.fn(),
    };
    next = jest.fn();
  });

  test('redirects to session timeout if session candidate is not set', () => {
    req.session.candidate = undefined;

    commonAuth(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('/timeout'));
  });

  test('continues if session candidate is set', () => {
    req.session.candidate = {
      firstnames: 'First Names',
    };

    commonAuth(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
