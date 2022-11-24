import { KnownUser, RequestValidationResult, Utils } from 'queueit-knownuser';
import config from '../../../../src/config';
import { QueueItImplementation } from '../../../../src/domain/enums';
import { setupQueueIt } from '../../../../src/middleware/queue-it/setup-queue-it';

jest.mock('../../../../src/config.ts', () => ({
  queueit: {
    customerId: 'dummyCustomerId',
    enabled: 'dummyValue',
    secretKey: 'dummySecretKey',
    eventID: 'mockEventID',
    layoutName: 'mockLayoutName',
    culture: 'mockCulture',
    queueDomain: 'mockQueueDomain',
    extendCookieValidity: 'mockExtendCookieVaildity',
    cookieValidityMinute: 'mockCookieValidityMinute',
    cookieDomain: 'mockCookieDomain',
    version: '9999',
    redirectUri: 'mockUri',
  },
}));

const mockHttpContextProvider = {
  getHttpRequest: () => ({
    getAbsoluteUri: () => 'http://dev.test.com/?queueittoken=mock_token',
    getUserHostAddress: () => '192.168.0.1',
  }),
};

jest.mock('../../../../src/middleware/queue-it/queue-it-helper.ts', () => ({
  initialiseExpressHttpContextProvider: () => mockHttpContextProvider,
}));

jest.mock('queueit-knownuser');
const mockKnownUser = KnownUser as jest.Mocked<typeof KnownUser>;

describe('setupQueueIt', () => {
  describe('setupQueueItKnownUser test', () => {
    let req: any;
    let res: any;
    let next: any;

    beforeEach(() => {
      req = {
        query: {
          queueittoken: 'mock_token',
        },
        get: () => '',
      };
      res = {
        locals: {},
        set: jest.fn(),
        redirect: jest.fn(),
      };
      next = jest.fn();
      config.queueit.enabled = QueueItImplementation.KnownUser;
    });

    describe('Queue-it configureKnownUserHashing tests', () => {
      test('If configureKnownUserHashing has been implemented correctly, should return correct string', () => {
        expect(Utils.generateSHA256Hash('SecretKey', 'TestString')).toBeUndefined();
        mockKnownUser.resolveQueueRequestByLocalConfig.mockImplementation(() => ({ doRedirect: () => false } as RequestValidationResult));
        setupQueueIt(req, res, next);

        const result = Utils.generateSHA256Hash('SecretKey', 'TestString');
        expect(result).toEqual('72c2f978144f6e2738fa64cb520032af4968f4c93d1e3d764bdee0563bcba6a7');
      });
    });

    test('If doRedirect is false and the user has been been approved by QueueIt to continue to the site', () => {
      mockKnownUser.resolveQueueRequestByLocalConfig.mockImplementation(() => ({ doRedirect: () => false, actionType: 'Queue' } as RequestValidationResult));
      setupQueueIt(req, res, next);

      expect(res.redirect).not.toHaveBeenCalledWith('mockTestUrl');
    });

    test('If doRedirect is false the user should be directed to the next middleware when the req', () => {
      mockKnownUser.resolveQueueRequestByLocalConfig.mockImplementation(() => ({ doRedirect: () => false } as RequestValidationResult));
      setupQueueIt(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('If doRedirect is true the user should be redirected', () => {
      mockKnownUser.resolveQueueRequestByLocalConfig.mockImplementation(() => ({ doRedirect: () => true, redirectUrl: 'mock redirect URL' } as RequestValidationResult));
      setupQueueIt(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('mock redirect URL');
    });

    test('Ensuring KnownUser.resolveQueueRequestByLocalConfig is called with the correct arguements', () => {
      mockKnownUser.resolveQueueRequestByLocalConfig.mockImplementation(() => ({ doRedirect: () => true, redirectUrl: 'mock redirect URL' } as RequestValidationResult));

      const mockRequestUrlWithoutToken = 'http://dev.test.com/';
      setupQueueIt(req, res, next);

      expect(mockKnownUser.resolveQueueRequestByLocalConfig).toHaveBeenCalledWith(
        mockRequestUrlWithoutToken,
        'mock_token',
        expect.anything(),
        'dummyCustomerId',
        'dummySecretKey',
        mockHttpContextProvider,
      );
    });
  });

  describe('setupQueueItJSImplementation test', () => {
    let req: any;
    let res: any;
    let next: any;

    beforeEach(() => {
      req = {};
      res = {
        locals: {},
      };
      next = jest.fn();
      config.queueit.enabled = QueueItImplementation.JSImplementation;
    });

    test('QueueIt params set', () => {
      setupQueueIt(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.locals).toStrictEqual({
        queueItCustomerId: 'dummyCustomerId',
        queueItImplementation: 'client-side',
      });
    });
  });
});
