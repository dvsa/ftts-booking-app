import { XRobotsTagFilter } from '../../../src/middleware/xrobots-tag-filter';

describe('xrobots tag filter', () => {
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

  test('filter sets res header', () => {
    XRobotsTagFilter.filter(req, res, next);

    expect(res.setHeader).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
