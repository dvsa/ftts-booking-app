import * as CentreGateway from '../../../src/services/centre-gateway';
import { mockCentres } from '../../../src/repository/mock-data';
import axiosRetryClient from '../../../src/libraries/axios-retry-client';

jest.mock('@dvsa/ftts-auth-client', () => ({
  getToken: () => ({ value: 'token-value' }),
}));
jest.mock('../../../src/libraries/axios-retry-client');
jest.mock('../../../src/config', () => ({
  apim: {
    location: {},
  },
  location: {
    baseUrl: '/api/',
  },
  http: {
    timeout: 10,
    retryClient: {
      maxRetries: 3,
      defaultRetryDelay: 300,
      maxRetryAfter: 1000,
    },
  },
}));

const consoleErrorRestore = console.error;

describe('Test Centre Location API gateway', () => {
  const mockAxios = axiosRetryClient as jest.Mocked<typeof axiosRetryClient>;

  beforeEach(() => {
    console.error = jest.fn();
    const resolved = new Promise((r) => r({
      data: {
        status: 200,
        testCentres: mockCentres,
      },
    }));
    mockAxios.get.mockResolvedValue(resolved);
  });

  afterEach(() => {
    console.error = consoleErrorRestore;
    jest.resetAllMocks();
  });

  describe('Get test centres', () => {
    test('fetches GB test centres', async () => {
      const centres = await CentreGateway.fetchCentres('testterm', 'gb', 6);

      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/test-centres?region=gb&term=testterm&numberOfResults=6', {
        headers: {
          Authorization: 'Bearer token-value',
        },
      });
      expect(centres).toEqual(expect.arrayContaining(mockCentres));
    });

    test('fetches NI test centres', async () => {
      const centres = await CentreGateway.fetchCentres('testterm', 'ni', 7);

      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/test-centres?region=ni&term=testterm&numberOfResults=7', {
        headers: {
          Authorization: 'Bearer token-value',
        },
      });
      expect(centres).toEqual(expect.arrayContaining(mockCentres));
    });
  });

  describe('error handling', () => {
    test('400 errors', async () => {
      mockAxios.get.mockRejectedValueOnce({
        response: {
          data: {
            status: 400,
            message: 'Bad Request - Geocoding api was not able to translate search term into location',
          },
        },
      });

      const centres = await CentreGateway.fetchCentres('testterm', 'gb', 5);

      expect(centres).toHaveLength(0);
    });

    test('non-400 errors', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error());

      await expect(CentreGateway.fetchCentres('testterm', 'gb', 5)).rejects.toThrow();
    });
  });
});
