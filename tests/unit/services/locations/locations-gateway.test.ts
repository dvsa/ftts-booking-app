import { AxiosStatic } from 'axios';
import { LocationsGateway } from '../../../../src/services/locations/locations-gateway';
import { mockCentres } from '../../../mocks/data/mock-data';
import { BusinessTelemetryEvents, logger } from '../../../../src/helpers/logger';

jest.mock('../../../../src/libraries/axios-retry-client');

describe('LocationsGateway', () => {
  const mockedAxios = jest.createMockFromModule<jest.Mocked<AxiosStatic>>('axios');
  const mockAccessToken = '1234-5678';

  let locations: LocationsGateway;

  beforeEach(() => {
    const mockAuth = {
      getAuthHeader: () => ({
        headers: { Authorization: `Bearer ${mockAccessToken}` },
      }),
    };

    locations = new LocationsGateway(mockAuth as any, mockedAxios);

    mockedAxios.get.mockResolvedValue({
      data: {
        status: 200,
        testCentres: mockCentres,
      },
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Get test centres', () => {
    test('fetches GB test centres', async () => {
      const centres = await locations.fetchCentres('testterm', 'gb', 6);

      expect(mockedAxios.get).toHaveBeenCalledWith('v1/test-centres?region=gb&term=testterm&numberOfResults=6', {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      });
      expect(centres).toStrictEqual(mockCentres);
    });

    test('fetches NI test centres', async () => {
      const centres = await locations.fetchCentres('testterm', 'ni', 7);

      expect(mockedAxios.get).toHaveBeenCalledWith('v1/test-centres?region=ni&term=testterm&numberOfResults=7', {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      });
      expect(centres).toEqual(expect.arrayContaining(mockCentres));
    });
  });

  describe('error handling', () => {
    test('400 errors', async () => {
      const error = {
        response: {
          data: {
            status: 400,
            message: 'Bad Request - Geocoding api was not able to translate search term into location',
          },
        },
      };
      mockedAxios.get.mockRejectedValueOnce(error);

      const centres = await locations.fetchCentres('testterm', 'gb', 5);

      expect(centres).toHaveLength(0);
      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.LOC_REQUEST_ISSUE,
        'LocationsGateway::fetchCentres: Bad Request - Geocoding api was not able to translate search term into location',
        {
          data: {
            status: 400,
            message: 'Bad Request - Geocoding api was not able to translate search term into location',
          },
          region: 'gb',
          term: 'testterm',
        },
      );
      expect(logger.error).toHaveBeenCalledWith(error, 'LocationsGateway::fetchCentres: Error retrieving test centres from locations api. Term: testterm Region: gb');
    });

    test('401 errors', async () => {
      const error = {
        response: {
          data: {
            status: 401,
            message: 'Bad Request - Geocoding api was not able to translate search term into location',
          },
        },
      };
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(locations.fetchCentres('testterm', 'gb', 5)).rejects.toEqual(error);
      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.LOC_AUTH_ISSUE,
        'LocationsGateway::fetchCentres: Bad Request - Geocoding api was not able to translate search term into location',
        {
          data: {
            status: 401,
            message: 'Bad Request - Geocoding api was not able to translate search term into location',
          },
          region: 'gb',
          term: 'testterm',
        },
      );
      expect(logger.error).toHaveBeenCalledWith(error, 'LocationsGateway::fetchCentres: Error retrieving test centres from locations api. Term: testterm Region: gb');
    });

    test('403 errors', async () => {
      const error = {
        response: {
          data: {
            status: 403,
            message: 'Bad Request - Geocoding api was not able to translate search term into location',
          },
        },
      };
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(locations.fetchCentres('testterm', 'gb', 5)).rejects.toEqual(error);
      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.LOC_AUTH_ISSUE,
        'LocationsGateway::fetchCentres: Bad Request - Geocoding api was not able to translate search term into location',
        {
          data: {
            status: 403,
            message: 'Bad Request - Geocoding api was not able to translate search term into location',
          },
          region: 'gb',
          term: 'testterm',
        },
      );
      expect(logger.error).toHaveBeenCalledWith(error, 'LocationsGateway::fetchCentres: Error retrieving test centres from locations api. Term: testterm Region: gb');
    });

    test('500 errors', async () => {
      const error = {
        response: {
          data: {
            status: 500,
            message: 'Bad Request - Geocoding api was not able to translate search term into location',
          },
        },
      };
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(locations.fetchCentres('testterm', 'gb', 5)).rejects.toEqual(error);
      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.LOC_ERROR,
        'LocationsGateway::fetchCentres: Bad Request - Geocoding api was not able to translate search term into location',
        {
          data: {
            status: 500,
            message: 'Bad Request - Geocoding api was not able to translate search term into location',
          },
          region: 'gb',
          term: 'testterm',
        },
      );
      expect(logger.error).toHaveBeenCalledWith(error, 'LocationsGateway::fetchCentres: Error retrieving test centres from locations api. Term: testterm Region: gb');
    });

    test('non-400 errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error());

      await expect(locations.fetchCentres('testterm', 'gb', 5)).rejects.toThrow();
    });
  });
});
