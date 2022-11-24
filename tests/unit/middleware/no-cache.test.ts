import { noCache } from '../../../src/middleware/no-cache';

describe('no cache middleware', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {};
    res = {
      setHeader: jest.fn(),
    };
    next = jest.fn();
  });

  test('sets no cache header', () => {
    noCache(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith('Surrogate-Control', 'no-store');
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    expect(res.setHeader).toHaveBeenCalledWith('Pragma', 'no-cache');
    expect(res.setHeader).toHaveBeenCalledWith('Expires', 0);
    expect(next).toHaveBeenCalled();
  });
});
