import { setCookieHeader } from '../../../../src/helpers/cookie-helper';
import { initialiseExpressHttpContextProvider } from '../../../../src/middleware/queue-it/queue-it-helper';

jest.mock('../../../../src/helpers/cookie-helper');

describe('QueueIt helper tests', () => {
  let req: any;
  let res: any;
  let httpRequest: any;
  let httpResponse: any;

  beforeEach(() => {
    req = {
      header: jest.fn(() => 'mockHeaderValue'),
      hostname: 'dummyHost',
      path: '/',
      protocol: 'https',
      get: () => 'dummyGet',
      originalUrl: '/dummyOrginalUrl',
      ip: '123.00.00.01',
      cookies: {
        cookieKey: 'dummyCookies',
      },
    };
    res = {
      cookie: jest.fn(),
    };
    const httpContextProvider = initialiseExpressHttpContextProvider(req, res);
    httpRequest = httpContextProvider.getHttpRequest();
    httpResponse = httpContextProvider.getHttpResponse();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('getUserAgent, returns the user agent header', () => {
    expect(httpRequest.getUserAgent()).toBe('mockHeaderValue');
    expect(req.header).toHaveBeenCalledWith('user-agent');
  });

  test('getHeader, returns the header', () => {
    expect(httpRequest.getHeader('mockHeaderName')).toBe('mockHeaderValue');
    expect(req.header).toHaveBeenCalledWith('mockHeaderName');
  });

  test('getAbsoluteUri, returns the given url', () => {
    expect(httpRequest.getAbsoluteUri()).toBe('https:///dummyOrginalUrl');
  });

  test('getUserHostAddress, returns the given ip address', () => {
    expect(httpRequest.getUserHostAddress()).toBe('123.00.00.01');
  });

  test('getCookies, returns the given user cookies', () => {
    expect(httpRequest.getCookieValue('cookieKey')).toBe('dummyCookies');
  });

  test('getRequestBodyAsString, returns getRequestBodyAsString', () => {
    expect(httpRequest.getRequestBodyAsString()).toBe('NotUsed');
  });

  test('setCookie test, ensures set cookie header is called with the correct parameters', () => {
    httpResponse.setCookie('dummyCookieName', 'dummyCookieValue', 'dummyDomain', 9999);
    const cookieOptions = {
      path: '/',
      domain: 'dummyDomain',
      secure: true,
      httpOnly: true,
    };
    expect(setCookieHeader).toHaveBeenCalledWith(res, 'dummyCookieName', 'dummyCookieValue', expect.objectContaining(cookieOptions));
  });
});
