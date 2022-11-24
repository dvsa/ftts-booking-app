import { AxiosStatic } from 'axios';
import MockDate from 'mockdate';
import { TCNRegion, TestType } from '../../../../src/domain/enums';
import { Centre } from '../../../../src/domain/types';
import { BusinessTelemetryEvents, CustomAxiosError, logger } from '../../../../src/helpers/logger';
import {
  ReservationResponse,
  SchedulingGateway,
  SlotUnavailableError,
} from '../../../../src/services/scheduling/scheduling-gateway';
import {
  BookingRequestMock,
  BookingResponseFullMock,
  BookingResponseMock,
  listPayload,
} from '../../../mocks/data/scheduling';
import SlotInvalidError from '../../../../src/domain/errors/slot/slot-invalid-error';

jest.mock('../../../../src/helpers/logger');

const mockedAxios = jest.createMockFromModule<jest.Mocked<AxiosStatic>>('axios');
const mockedAxiosRetrieve = jest.createMockFromModule<jest.Mocked<AxiosStatic>>('axios');
const mockedAxiosReserve = jest.createMockFromModule<jest.Mocked<AxiosStatic>>('axios');
const mockedAxiosConfirm = jest.createMockFromModule<jest.Mocked<AxiosStatic>>('axios');

describe('SchedulingGateway', () => {
  const mockCentre = {
    testCentreId: '0001:SITE-0135',
  } as Centre;
  const mockTestType = TestType.CAR;
  const mockStartDateTime = '2050-12-31T12:00:00.000Z';
  MockDate.set('2021-01-01');

  let scheduling: SchedulingGateway;

  const mockSchedulingUrl = 'scheduling.com/scheduling/';
  const mockAccessToken = '1234-5678';

  const mockReservationId = 'FE78F84D-9FBE-4496-9F1D-D2B0A6B0D8E9';
  const mockRegion = TCNRegion.A;
  const mockBookingProductRef = 'bp_ref';

  const mockSchedulingAuth = {
    getAuthHeader: () => ({
      headers: { Authorization: `Bearer ${mockAccessToken}` },
    }),
  };

  const getBusinessIdentifiersFrom = (centre: Centre) => ({
    testCentreid: centre.testCentreId,
    accountId: centre.accountId,
    siteId: centre.siteId,
    tcnTestCentreId: centre.ftts_tcntestcentreid,
  });

  beforeEach(() => {
    scheduling = new SchedulingGateway(mockSchedulingAuth as any, mockedAxios, mockedAxiosRetrieve, mockedAxiosReserve, mockedAxiosConfirm, mockSchedulingUrl, 1);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('availableSlots', () => {
    beforeEach(() => {
      mockedAxiosRetrieve.get.mockResolvedValue({ data: listPayload });
    });

    test('will request slots between given dateFrom and dateTo', async () => {
      const result = await scheduling.availableSlots('2020-01-04', '2020-01-10', mockCentre, mockTestType);

      expect(mockedAxiosRetrieve.get).toHaveBeenCalledWith(
        expect.stringContaining('dateFrom=2020-01-04&dateTo=2020-01-10'),
        mockSchedulingAuth.getAuthHeader(),
      );
      expect(result).toStrictEqual(listPayload);
    });

    test('will return kpi data if preferred date is provided', async () => {
      mockedAxiosRetrieve.get.mockImplementationOnce(() => Promise.resolve(
        {
          data: [
            {
              testCentreId: '0001:SITE-0207',
              testTypes: [
                'CAR',
              ],
              startDateTime: '2022-01-01T00:00',
              quantity: 5,
              dateAvailableOnOrAfterToday: '2021-07-08T08:30:00.000Z',
              dateAvailableOnOrBeforePreferredDate: '2021-07-09T08:30:00.000Z',
              dateAvailableOnOrAfterPreferredDate: '2021-07-10T08:30:00.000Z',
            },
          ],
        },
      ));

      const result = await scheduling.availableSlots('2020-01-04', '2020-01-10', mockCentre, mockTestType, '2020-12-31');

      expect(mockedAxiosRetrieve.get).toHaveBeenCalledWith(
        expect.stringContaining('dateFrom=2020-01-04&dateTo=2020-01-10'),
        mockSchedulingAuth.getAuthHeader(),
      );
      expect(result).toStrictEqual([{
        testCentreId: '0001:SITE-0207',
        testTypes: [
          'CAR',
        ],
        startDateTime: '2022-01-01T00:00',
        quantity: 5,
        dateAvailableOnOrAfterToday: '2021-07-08T08:30:00.000Z',
        dateAvailableOnOrBeforePreferredDate: '2021-07-09T08:30:00.000Z',
        dateAvailableOnOrAfterPreferredDate: '2021-07-10T08:30:00.000Z',
      }]);
    });

    test('will throw a error if the call to the scheduling api fails', async () => {
      mockedAxiosRetrieve.get.mockRejectedValue('Error');
      await expect(scheduling.availableSlots('2020-01-04', '2020-01-10', mockCentre, mockTestType)).rejects.toBe('Error');
    });

    test.each([
      ['ADI_HPT', TestType.ADIHPT],
      ['ADI_P1', TestType.ADIP1],
      ['ADI_P1', TestType.ADIP1DVA],
      ['AMI_P1', TestType.AMIP1],
      ['CAR', TestType.CAR],
      ['ERS', TestType.ERS],
      ['LGV_CPC', TestType.LGVCPC],
      ['LGV_CPC_C', TestType.LGVCPCC],
      ['LGV_HPT', TestType.LGVHPT],
      ['LGV_MC', TestType.LGVMC],
      ['MOTORCYCLE', TestType.MOTORCYCLE],
      ['PCV_CPC', TestType.PCVCPC],
      ['PCV_CPC_C', TestType.PCVCPCC],
      ['PCV_HPT', TestType.PCVHPT],
      ['PCV_MC', TestType.PCVMC],
      ['TAXI', TestType.TAXI],
    ])('will send test type %s when given test type %s', async (expectedTestType: string, givenTestType: TestType) => {
      const result = await scheduling.availableSlots('2020-01-04', '2020-01-10', mockCentre, givenTestType);

      expect(mockedAxiosRetrieve.get).toHaveBeenCalledWith(
        expect.stringContaining(`testTypes=%5B%22${expectedTestType}%22%5D`),
        mockSchedulingAuth.getAuthHeader(),
      );
      expect(result).toStrictEqual(listPayload);
    });
  });

  describe('reserveSlot', () => {
    test('successfully reserves a slot', async () => {
      const mockResponse: ReservationResponse = {
        testCentreId: mockCentre.testCentreId as string,
        testTypes: [mockTestType],
        startDateTime: mockStartDateTime,
        reservationId: 'bddb56f2-2c1a-48f6-a8a3-129865ea0fab',
      };
      mockedAxiosReserve.post.mockResolvedValue({ data: [mockResponse] });

      const result = await scheduling.reserveSlot(mockCentre, mockTestType, mockStartDateTime);

      expect(result).toEqual(mockResponse);
      expect(mockedAxiosReserve.post).toHaveBeenCalledTimes(1);
      expect(mockedAxiosReserve.post).toHaveBeenCalledWith(
        `${mockSchedulingUrl}/tcn/${mockCentre.region}/reservations`,
        [{
          testCentreId: mockCentre.testCentreId,
          testTypes: ['CAR'],
          startDateTime: mockStartDateTime,
          quantity: 1,
          lockTime: 1,
        }],
        mockSchedulingAuth.getAuthHeader(),
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('throws a SlotInvalidError and does not query scheduling API if slot is invalid', async () => {
      await expect(scheduling.reserveSlot(mockCentre, mockTestType, 'invalid')).rejects.toThrow(SlotInvalidError);

      expect(mockedAxiosReserve.post).not.toHaveBeenCalled();
      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.SCHEDULING_SLOT_INVALID_ERROR,
        'SchedulingGateway::reserveSlot: Invalid slot detected. Request to scheduling API not sent.',
        { ...getBusinessIdentifiersFrom(mockCentre), startDateTime: 'invalid' },
      );
    });

    test('throws a SlotUnavailableError if the response is 409 Conflict', async () => {
      mockedAxiosReserve.post.mockRejectedValue({
        response: {
          status: 409,
        },
      });

      await expect(scheduling.reserveSlot(mockCentre, mockTestType, mockStartDateTime)).rejects.toThrow(SlotUnavailableError);
    });

    test('rethrows any other errors', async () => {
      const mockError = new Error('Mock error');
      mockedAxiosReserve.post.mockRejectedValue(mockError);

      await expect(scheduling.reserveSlot(mockCentre, mockTestType, mockStartDateTime)).rejects.toThrow(mockError);
    });
  });

  describe('confirmBooking', () => {
    test('successfully confirms a booking', async () => {
      mockedAxiosConfirm.post.mockResolvedValue({ data: BookingResponseMock });

      const result = await scheduling.confirmBooking(BookingRequestMock, mockRegion);

      expect(result).toEqual(BookingResponseMock);
      expect(mockedAxiosConfirm.post).toHaveBeenCalledTimes(1);
      expect(mockedAxiosConfirm.post).toHaveBeenCalledWith(
        `${mockSchedulingUrl}/tcn/${mockRegion}/bookings`,
        BookingRequestMock,
        mockSchedulingAuth.getAuthHeader(),
      );
    });
  });

  describe('deleteBooking', () => {
    test('successfully deletes a booking', async () => {
      await scheduling.deleteBooking(mockBookingProductRef, mockRegion);

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${mockSchedulingUrl}/tcn/${mockRegion}/bookings/${mockBookingProductRef}`,
        mockSchedulingAuth.getAuthHeader(),
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('throws an error if something goes wrong', async () => {
      const mockedError = {
        response: {
          status: 500,
        },
      };
      mockedAxios.delete.mockRejectedValue(mockedError);

      await expect(scheduling.deleteBooking(mockBookingProductRef, mockRegion)).rejects.toEqual(mockedError);

      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(mockedError, 'SchedulingGateway::deleteBooking: Delete failed', {
        bookingProductRef: mockBookingProductRef,
      });
      expect(logger.event).toHaveBeenCalledTimes(1);
      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.SCHEDULING_ERROR,
        'SchedulingGateway::deleteBooking: Failed to communicate with the scheduling API server',
        {
          bookingProductRef: mockBookingProductRef,
        },
      );
    });
  });

  describe('deleteReservation', () => {
    test('successfully deletes a reservation', async () => {
      await scheduling.deleteReservation(mockReservationId, mockRegion, mockBookingProductRef);

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${mockSchedulingUrl}/tcn/${mockRegion}/reservations/${mockReservationId}`,
        mockSchedulingAuth.getAuthHeader(),
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
    });

    test('throws an error if something goes wrong and it is not 404', async () => {
      const mockedError = {
        response: {
          status: 500,
        },
      };
      mockedAxios.delete.mockRejectedValue(mockedError);

      await expect(scheduling.deleteReservation(mockReservationId, mockRegion, mockBookingProductRef)).rejects.toEqual(mockedError);
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(mockedError, 'SchedulingGateway::deleteReservation: Delete failed', {
        reservationId: mockReservationId,
        bookingProductRef: mockBookingProductRef,
      });
      expect(logger.event).toHaveBeenCalledTimes(1);
      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.SCHEDULING_ERROR,
        'SchedulingGateway::deleteReservation: Failed to communicate with the scheduling API server',
        {
          bookingProductRef: mockBookingProductRef,
        },
      );
      expect(logger.warn).not.toHaveBeenCalled();
    });

    test('logs a warning and do not throw an error if something goes wrong and it is 404', async () => {
      const mockedError = {
        response: {
          status: 404,
        },
      };
      mockedAxios.delete.mockRejectedValue(mockedError);

      await scheduling.deleteReservation(mockReservationId, mockRegion, mockBookingProductRef);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).toHaveBeenCalledTimes(1);
      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.SCHEDULING_REQUEST_ISSUE,
        'SchedulingGateway::deleteReservation: Failed to get request from Scheduling api',
        {
          bookingProductRef: mockBookingProductRef,
        },
      );
      expect(logger.warn).toHaveBeenCalledTimes(1);
      expect(logger.warn).toHaveBeenCalledWith('SchedulingGateway::deleteReservation: failed to delete non-existing reservation', {
        reservationId: mockReservationId,
        bookingProductRef: mockBookingProductRef,
      });
    });
  });

  describe('getBooking', () => {
    test('successfully gets a booking', async () => {
      mockedAxiosRetrieve.get.mockResolvedValue({ data: BookingResponseFullMock });

      const result = await scheduling.getBooking(mockBookingProductRef, mockRegion);

      expect(result).toEqual(BookingResponseFullMock);
      expect(mockedAxiosRetrieve.get).toHaveBeenCalledTimes(1);
      expect(mockedAxiosRetrieve.get).toHaveBeenCalledWith(
        `${mockSchedulingUrl}/tcn/${mockRegion}/bookings/${mockBookingProductRef}`,
        mockSchedulingAuth.getAuthHeader(),
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('throws an error if something goes wrong', async () => {
      const mockedError = {
        response: {
          status: 500,
        },
      };
      mockedAxiosRetrieve.get.mockRejectedValue(mockedError);

      await expect(scheduling.getBooking(mockBookingProductRef, mockRegion)).rejects.toEqual(mockedError);
      expect(logger.error).toHaveBeenCalledWith(
        mockedError,
        'SchedulingGateway::getBooking: GET failed for booking reference',
        {
          bookingProductRef: mockBookingProductRef,
          testCentreRegion: mockRegion,
        },
      );
      expect(logger.event).toHaveBeenCalledTimes(1);
      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.SCHEDULING_ERROR,
        'SchedulingGateway::getBooking: Failed to communicate with the scheduling API server',
        {
          bookingProductRef: mockBookingProductRef,
        },
      );
    });
  });

  describe('logEventByProductRef', () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    test('handles a 401 error', async () => {
      const error = {
        response: {
          status: 401,
        },
      };
      const bookingProductRef = '123123123';

      scheduling.logEventByProductRef(error as CustomAxiosError, bookingProductRef, 'fakeFunction');

      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.SCHEDULING_AUTH_ISSUE,
        'SchedulingGateway::fakeFunction: Failed to authenticate to the scheduling api',
        {
          bookingProductRef,
        },
      );
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    test('handles a 402 error', async () => {
      const error = {
        response: {
          status: 402,
        },
      };
      const bookingProductRef = '123123123';

      scheduling.logEventByProductRef(error as CustomAxiosError, bookingProductRef, 'fakeFunction');

      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.SCHEDULING_REQUEST_ISSUE,
        'SchedulingGateway::fakeFunction: Failed to get request from Scheduling api',
        {
          bookingProductRef,
        },
      );
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    test('handles a 403 error', async () => {
      const error = {
        response: {
          status: 403,
        },
      };
      const bookingProductRef = '123123123';

      scheduling.logEventByProductRef(error as CustomAxiosError, bookingProductRef, 'fakeFunction');

      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.SCHEDULING_AUTH_ISSUE,
        'SchedulingGateway::fakeFunction: Failed to authenticate to the scheduling api',
        {
          bookingProductRef,
        },
      );
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    test('handles a 500 error', async () => {
      const error = {
        response: {
          status: 500,
        },
      };
      const bookingProductRef = '123123123';

      scheduling.logEventByProductRef(error as CustomAxiosError, bookingProductRef, 'fakeFunction');

      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.SCHEDULING_ERROR,
        'SchedulingGateway::fakeFunction: Failed to communicate with the scheduling API server',
        {
          bookingProductRef,
        },
      );
    });
  });

  describe('logEventByIdentifiers', () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    test('handles a 401 error', async () => {
      const error = {
        response: {
          status: 401,
        },
      };
      const identifiers = {
        ident1: 'something',
        ident2: 'another',
      };

      scheduling.logEventByIdentifiers(error as CustomAxiosError, identifiers, 'fakeFunction');

      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.SCHEDULING_AUTH_ISSUE,
        'SchedulingGateway::fakeFunction: Failed to authenticate to the scheduling api',
        {
          ident1: 'something',
          ident2: 'another',
        },
      );
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    test('handles a 402 error', async () => {
      const error = {
        response: {
          status: 402,
        },
      };
      const identifiers = {
        ident1: 'something',
        ident2: 'another',
      };

      scheduling.logEventByIdentifiers(error as CustomAxiosError, identifiers, 'fakeFunction');

      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.SCHEDULING_REQUEST_ISSUE,
        'SchedulingGateway::fakeFunction: Failed to get request from Scheduling api',
        {
          ident1: 'something',
          ident2: 'another',
        },
      );
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    test('handles a 403 error', async () => {
      const error = {
        response: {
          status: 403,
        },
      };
      const identifiers = {
        ident1: 'something',
        ident2: 'another',
      };

      scheduling.logEventByIdentifiers(error as CustomAxiosError, identifiers, 'fakeFunction');

      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.SCHEDULING_AUTH_ISSUE,
        'SchedulingGateway::fakeFunction: Failed to authenticate to the scheduling api',
        {
          ident1: 'something',
          ident2: 'another',
        },
      );
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    test('handles a 500 error', async () => {
      const error = {
        response: {
          status: 500,
        },
      };
      const identifiers = {
        ident1: 'something',
        ident2: 'another',
      };

      scheduling.logEventByIdentifiers(error as CustomAxiosError, identifiers, 'fakeFunction');

      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.SCHEDULING_ERROR,
        'SchedulingGateway::fakeFunction: Failed to communicate with the scheduling API server',
        {
          ident1: 'something',
          ident2: 'another',
        },
      );
    });
  });
});
