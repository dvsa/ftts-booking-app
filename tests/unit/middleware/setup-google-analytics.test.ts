import { setGoogleAnalyticsId } from '../../../src/middleware/setup-google-analytics';

jest.mock('../../../src/config.ts', () => ({
  googleAnalytics: {
    url: 'https://www.googletagmanager.com/gtag/js',
    measurementId: 'ga-test-key',
  },
}));

describe('setGoogleAnalyticsId', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {};
    res = {
      locals: {},
    };
    next = jest.fn();
  });

  test('google analytics measurement id gets set', () => {
    setGoogleAnalyticsId(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.locals).toStrictEqual({
      googleAnalyticsMeasurementId: 'ga-test-key',
      googleAnalyticsBaseUrl: 'https://www.googletagmanager.com/gtag/js',
    });
  });
});
