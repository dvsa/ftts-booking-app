import { standardAuth } from '../../../../src/middleware/auth/standard-auth';

describe('Auth middleware - standard main booking journey', () => {
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

  test('redirects to session timeout if standard accommodation is set to false', () => {
    req.session.journey = {
      standardAccommodation: false,
    };

    standardAuth(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('/timeout'));
  });

  test('continues if standard accommodation is set to true', () => {
    req.session.journey = {
      standardAccommodation: true,
    };

    standardAuth(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
