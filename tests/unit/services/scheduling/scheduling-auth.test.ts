import { SchedulingAuth } from '../../../../src/services/scheduling/scheduling-auth';

jest.mock('@azure/identity');

describe('Scheduling Auth', () => {
  let schedulingAuth: SchedulingAuth;

  const mockTokenCredential = {
    getToken: jest.fn(),
  };

  beforeEach(() => {
    schedulingAuth = new SchedulingAuth(mockTokenCredential as any);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('gets a token', async () => {
    mockTokenCredential.getToken.mockImplementationOnce(() => ({ token: Promise.resolve('mockTestToken') }));

    const token = await schedulingAuth.getToken();

    expect(token).toStrictEqual('mockTestToken');
    expect(mockTokenCredential.getToken).toHaveBeenCalled();
  });

  test('returns undefined if unable to get a token', async () => {
    mockTokenCredential.getToken.mockImplementationOnce(() => {
      throw Error('Unknown error');
    });

    const token = await schedulingAuth.getToken();

    expect(token).toStrictEqual(undefined);
    expect(mockTokenCredential.getToken).toHaveBeenCalled();
  });
});
