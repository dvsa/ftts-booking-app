import dayjs from 'dayjs';
import MockDate from 'mockdate';

import {
  BookingRequestMock,
  BookingResponseFullMock,
  BookingResponseMock,
  listPayload,
} from '../../../mocks/data/scheduling';
import {
  ReservationResponse,
  Scheduler,
  SlotUnavailableError,
} from '../../../../src/services/scheduling/scheduling-service';
import { Centre } from '../../../../src/domain/types';
import { TCNRegion, TestType } from '../../../../src/domain/enums';
import axiosRetryClient from '../../../../src/libraries/axios-retry-client';

jest.mock('../../../../src/libraries/axios-retry-client');
const mockedAxios = axiosRetryClient as jest.Mocked<typeof axiosRetryClient>;

describe('Scheduler service', () => {
  const mockCentre = {
    testCentreId: '0001:SITE-0135',
  } as Centre;
  const mockTestType = TestType.Car;
  const mockStartDateTime = '2050-12-31T12:00:00.000Z';
  MockDate.set('2021-01-01');
  const dateFormat = 'YYYY-MM-DD';

  let scheduling: Scheduler;

  const mockSchedulingUrl = 'scheduling.com/scheduling/';
  const mockAccessToken = '1234-5678';

  beforeEach(() => {
    const mockSchedulingAuth = {
      getToken: () => mockAccessToken,
    };

    scheduling = new Scheduler(mockSchedulingAuth as any, mockSchedulingUrl, 1);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('availableSlots', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: listPayload });
    });

    test('will request slots with a dateFrom starting tomorrow if chosen date is in the past', async () => {
      const result = await scheduling.availableSlots(dayjs('2020-12-31', dateFormat), mockCentre, mockTestType);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('dateFrom=2021-01-02'),
        expect.objectContaining({ headers: { Authorization: `Bearer ${mockAccessToken}` } }),
      );
      expect(result).toStrictEqual(listPayload);
    });

    test('will request slots with a dateFrom starting tomorrow if chosen date is today ', async () => {
      const result = await scheduling.availableSlots(dayjs('2021-01-01', dateFormat), mockCentre, mockTestType);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('dateFrom=2021-01-02'),
        expect.objectContaining({ headers: { Authorization: `Bearer ${mockAccessToken}` } }),
      );
      expect(result).toStrictEqual(listPayload);
    });

    test('will request slots with a maximum dateTo of 6 months from today if chosen date is within a week of that date', async () => {
      const result = await scheduling.availableSlots(dayjs('2021-06-30', dateFormat), mockCentre, mockTestType);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('dateTo=2021-07-01'),
        expect.objectContaining({ headers: { Authorization: `Bearer ${mockAccessToken}` } }),
      );
      expect(result).toStrictEqual(listPayload);
    });

    test('will return a empty array if the choosen date is over 6 months away', async () => {
      const result = await scheduling.availableSlots(dayjs('2021-08-01', dateFormat), mockCentre, mockTestType);
      expect(result).toEqual([]);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    test('will throw a error if the call to the scheduling api fails', async () => {
      mockedAxios.get.mockRejectedValue('Error');
      await expect(scheduling.availableSlots(dayjs('2021-01-02', dateFormat), mockCentre, mockTestType)).rejects.toBe('Error');
    });
  });

  describe('reserveBooking', () => {
    test('successfully reserves a booking', async () => {
      const mockResponse: ReservationResponse = {
        testCentreId: mockCentre.testCentreId,
        testTypes: [mockTestType],
        startDateTime: mockStartDateTime,
        reservationId: 'bddb56f2-2c1a-48f6-a8a3-129865ea0fab',
      };
      mockedAxios.post.mockImplementation(() => Promise.resolve({ data: [mockResponse] }));

      const result = await scheduling.reserveSlot(mockCentre, mockTestType, mockStartDateTime);

      expect(result).toEqual(mockResponse);
    });

    test('throws a SlotUnavailableError if the response is 409 Conflict', async () => {
      mockedAxios.post.mockRejectedValue({
        response: {
          status: 409,
        },
      });

      await expect(scheduling.reserveSlot(mockCentre, mockTestType, mockStartDateTime)).rejects.toThrow(SlotUnavailableError);
    });

    test('rethrows any other errors', async () => {
      const mockError = new Error('Mock error');
      mockedAxios.post.mockRejectedValue(mockError);

      await expect(scheduling.reserveSlot(mockCentre, mockTestType, mockStartDateTime)).rejects.toThrow(mockError);
    });
  });

  describe('confirmBooking', () => {
    test('successfully confirms a booking', async () => {
      mockedAxios.post.mockResolvedValue({ data: BookingResponseMock });

      const result = await scheduling.confirmBooking(BookingRequestMock, TCNRegion.A);

      expect(result).toEqual(BookingResponseMock);
    });
  });

  describe('deleteBooking', () => {
    test('successfully deletes a booking', async () => {
      mockedAxios.delete.mockResolvedValue({ status: 204 });

      const result = await scheduling.deleteBooking('1234', TCNRegion.A);

      expect(result).toEqual({ status: 204 });
    });

    test('throws an error if something goes wrong', async () => {
      mockedAxios.delete.mockRejectedValue('Error');

      await expect(scheduling.deleteBooking('1234', TCNRegion.A)).rejects.toEqual('Error');
    });
  });

  describe('getBooking', () => {
    test('successfully gets a booking', async () => {
      mockedAxios.get.mockResolvedValue({ data: BookingResponseFullMock });

      const result = await scheduling.getBooking('12345', TCNRegion.A);

      expect(result).toEqual(BookingResponseFullMock);
    });

    test('throws an error if something goes wrong', async () => {
      mockedAxios.get.mockRejectedValue('Error');

      await expect(scheduling.getBooking('1234', TCNRegion.A)).rejects.toEqual('Error');
    });
  });
});
