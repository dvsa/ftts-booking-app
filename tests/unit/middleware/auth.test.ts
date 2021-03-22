import { auth } from '../../../src/middleware/auth';

describe('set edit mode', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      session: {
        candidate: true,
      },
    };
    res = {
      res_url: '',
      res_status: 200,
      redirect: (url: string): void => {
        res.res_url = url;
        res.res_status = 301;
      },
    };
    next = jest.fn();
  });

  test('page redirects if session is not active', () => {
    req.session.candidate = false;
    auth(req, res, next);

    expect(res.res_url).toBe('/choose-support');
    expect(res.res_status).toBe(301);
  });

  test('middleware calls next if session is active', () => {
    req.session.candidate = true;
    auth(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
