import { ChainedTokenCredential } from '@dvsa/ftts-auth-client';
import { mock } from 'jest-mock-extended';
import { mocked } from 'ts-jest/utils';
import { ManagedIdentityAuth, ManagedIdentityAuthConfig } from '../../../../src/services/auth/managed-identity-auth';

jest.mock('@dvsa/ftts-auth-client');
const mockedChainedTokenCredential = mocked(ChainedTokenCredential);
const mockedChainedTokenCredentialInstance = mock<ChainedTokenCredential>();

describe('ManagedIdentityAuth', () => {
  let managedIdentityAuth: ManagedIdentityAuth;

  beforeEach(() => {
    mockedChainedTokenCredential.mockReturnValue(mockedChainedTokenCredentialInstance);
    managedIdentityAuth = new ManagedIdentityAuth({} as ManagedIdentityAuthConfig);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('gets the auth header', async () => {
    mockedChainedTokenCredentialInstance.getToken.mockImplementationOnce(() => ({ token: Promise.resolve('mockTestToken') }));

    const authHeader = await managedIdentityAuth.getAuthHeader();

    expect(authHeader).toStrictEqual({
      headers: {
        Authorization: 'Bearer mockTestToken',
      },
    });
    expect(mockedChainedTokenCredentialInstance.getToken).toHaveBeenCalled();
  });

  test('throws an error if unable to get token', async () => {
    mockedChainedTokenCredentialInstance.getToken.mockRejectedValue('Unknown error');

    await expect(managedIdentityAuth.getAuthHeader()).rejects.toBe('Unknown error');
    expect(mockedChainedTokenCredentialInstance.getToken).toHaveBeenCalled();
  });
});
