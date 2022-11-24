import { ChainedTokenCredential } from '@dvsa/ftts-auth-client';
import { mocked } from 'ts-jest/utils';
import { acquireToken } from '../../../../src/services/crm-gateway/dynamics-web-api';
import config from '../../../../src/config';

jest.mock('../../../../src/config');
const mockedConfig = mocked(config, true);
const mockedTokenCredential = mocked(ChainedTokenCredential, true);

describe('DynamicsWebApi', () => {
  describe('acquireToken', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('GIVEN config.crm.auth.multipleApplicationUsers.enabled == false', () => {
      const CRM_CLIENT_ID = 'CRM_CLIENT_ID';
      const CRM_CLIENT_SECRET = 'CRM_CLIENT_SECRET';
      const CRM_SCOPE = 'CRM_SCOPE';

      beforeEach(() => {
        mockedConfig.crm.auth.clientId = CRM_CLIENT_ID;
        mockedConfig.crm.auth.clientSecret = CRM_CLIENT_SECRET;
        mockedConfig.crm.auth.scope = CRM_SCOPE;
        mockedConfig.crm.auth.multipleApplicationUsers.enabled = false;
      });

      test('GIVEN valid credentials WHEN called THEN returns a new token', async () => {
        mockedTokenCredential.prototype.getToken.mockResolvedValueOnce({
          token: 'mock-token-value',
          expiresOnTimestamp: 99999999,
        });

        let actualToken = 'TEST';
        const callback: (token: string) => void = (token) => {
          actualToken = token;
        };
        await acquireToken(callback);

        expect(mockedTokenCredential.prototype.getToken).toHaveBeenCalledWith(CRM_SCOPE);
        expect(actualToken).toEqual('mock-token-value');
      });
    });

    describe('GIVEN config.crm.auth.multipleApplicationUsers.enabled == true', () => {
      const CRM_SCOPE = 'CRM_SCOPE';
      const CLIENT_IDS = ['001', '002'];

      beforeEach(() => {
        mockedConfig.crm.auth.scope = CRM_SCOPE;
        mockedConfig.crm.auth.multipleApplicationUsers.enabled = true;
        mockedConfig.crm.auth.multipleApplicationUsers.clientIds = CLIENT_IDS;
      });

      test('GIVEN valid credentials WHEN called THEN returns a new token', async () => {
        mockedTokenCredential.prototype.getToken.mockResolvedValueOnce({
          token: 'mock-token-value',
          expiresOnTimestamp: 99999999,
        });

        let actualToken = 'TEST';
        const callback: (token: string) => void = (token) => {
          actualToken = token;
        };
        await acquireToken(callback);

        expect(mockedTokenCredential.prototype.getToken).toHaveBeenCalledWith(CRM_SCOPE);
        expect(actualToken).toEqual('mock-token-value');
      });
    });
  });
});
