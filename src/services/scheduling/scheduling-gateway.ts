import { AxiosError } from 'axios';

import config from '../../config';
import { AxiosRetryClient } from '../../libraries/axios-retry-client';
import { AppointmentSlot } from './types';
import { Centre } from '../../domain/types';
import { TCNRegion, TestType } from '../../domain/enums';
import {
  BookingFullResponse, BookingRequest, BookingResponse, ReservationResponse,
} from '../../domain/booking/types';
import { logger, BusinessTelemetryEvents } from '../../helpers/logger';
import { ManagedIdentityAuth } from '../auth/managed-identity-auth';
import SlotUnavailableError from '../../domain/errors/slot/slot-unavailable-error';
import { UtcDate } from '../../domain/utc-date';
import SlotInvalidError from '../../domain/errors/slot/slot-invalid-error';

const defaultRetryPolicy = config.scheduling.retryPolicy;
const maxRetriesRetrieve = config.scheduling.maxRetriesByEndpoint.retrieve;
const maxRetriesReserve = config.scheduling.maxRetriesByEndpoint.reserve;
const maxRetriesConfirm = config.scheduling.maxRetriesByEndpoint.confirm;

class SchedulingGateway {
  private static instance: SchedulingGateway = new SchedulingGateway(new ManagedIdentityAuth(config.scheduling.identity));

  public static getInstance(): SchedulingGateway {
    return SchedulingGateway.instance;
  }

  constructor(
    private auth: ManagedIdentityAuth,
    private axiosRetryClient = new AxiosRetryClient(defaultRetryPolicy).getClient(),
    private axiosRetryClient_Retrieve = new AxiosRetryClient({ ...defaultRetryPolicy, maxRetries: maxRetriesRetrieve }).getClient(),
    private axiosRetryClient_Reserve = new AxiosRetryClient({ ...defaultRetryPolicy, maxRetries: maxRetriesReserve }).getClient(),
    private axiosRetryClient_Confirm = new AxiosRetryClient({ ...defaultRetryPolicy, maxRetries: maxRetriesConfirm }).getClient(),
    private apiUrl: string = `${config.scheduling.baseUrl}/v1`,
    private reservationLockTime: number = config.scheduling.lockTime,
  ) { }

  public async getBooking(bookingProductRef: string, testCentreRegion: string): Promise<BookingFullResponse> {
    try {
      const authHeader = await this.auth.getAuthHeader();
      const requestUrl = `${this.apiUrl}/tcn/${testCentreRegion}/bookings/${bookingProductRef}`;
      logger.debug('SchedulingGateway::getBooking: Attempting to retrieve booking', {
        requestUrl,
        bookingProductRef,
      });
      const response = await this.axiosRetryClient_Retrieve.get(requestUrl, authHeader);
      logger.debug('SchedulingGateway::getBooking: API call successful', {
        data: JSON.stringify(response.data),
        bookingProductRef,
      });
      return response.data as BookingFullResponse;
    } catch (error) {
      this.logEventByProductRef(error, bookingProductRef, 'getBooking');

      logger.error(error, 'SchedulingGateway::getBooking: GET failed for booking reference', {
        bookingProductRef,
        testCentreRegion,
      });

      throw error;
    }
  }

  public async availableSlots(dateFrom: string, dateTo: string, centre: Centre, testType: TestType, preferredDate?: string): Promise<AppointmentSlot[]> {
    const businessIdentifiers = {
      testCentreid: centre.testCentreId,
      accountId: centre.accountId,
      siteId: centre.siteId,
      tcnTestCentreId: centre.ftts_tcntestcentreid,
    };
    const testTypeCode = this.toTestTypeCode(testType);
    try {
      logger.debug(`SchedulingGateway::availableSlots: Attempting to get available slots for ${centre.name}`, {
        centre: JSON.stringify(centre),
        dateFrom,
        dateTo,
        testType,
        ...businessIdentifiers,
        preferredDate,
      });
      const authHeader = await this.auth.getAuthHeader();
      const preferredDateQueryParam = preferredDate ? `&preferredDate=${preferredDate}` : '';
      const requestUrl = `${this.apiUrl}/tcn/${centre.region}/testCentres/${centre.testCentreId}/slots?testTypes=%5B%22${testTypeCode}%22%5D&dateFrom=${dateFrom}&dateTo=${dateTo}${preferredDateQueryParam}`;
      logger.debug('SchedulingGateway::availableSlots: Making API call', {
        requestUrl,
        ...businessIdentifiers,
      });
      const slots = await this.axiosRetryClient_Retrieve.get<AppointmentSlot[]>(requestUrl, authHeader);
      logger.debug('SchedulingGateway::availableSlots: API call successful', {
        data: JSON.stringify(slots.data),
        ...businessIdentifiers,
      });
      return slots.data;
    } catch (error) {
      this.logEventByIdentifiers(error, businessIdentifiers, 'availableSlots');
      logger.error(error, 'SchedulingGateway::availableSlots: Call to scheduling api failed', {
        data: JSON.stringify(error?.response?.data),
        ...businessIdentifiers,
        dateFrom,
        dateTo,
        testType,
        region: centre.region,
      });
      return Promise.reject(error);
    }
  }

  public async reserveSlot(centre: Centre, testType: TestType, startDateTime: string): Promise<ReservationResponse> {
    const reservationsRequest = [{
      testCentreId: centre.testCentreId,
      testTypes: [this.toTestTypeCode(testType)],
      startDateTime,
      quantity: 1,
      lockTime: this.reservationLockTime,
    }];

    const businessIdentifiers = {
      testCentreid: centre.testCentreId,
      accountId: centre.accountId,
      siteId: centre.siteId,
      tcnTestCentreId: centre.ftts_tcntestcentreid,
    };

    if (!UtcDate.isValidIsoTimeStamp(startDateTime)) {
      logger.event(BusinessTelemetryEvents.SCHEDULING_SLOT_INVALID_ERROR,
        'SchedulingGateway::reserveSlot: Invalid slot detected. Request to scheduling API not sent.',
        { ...businessIdentifiers, startDateTime });
      throw new SlotInvalidError();
    }

    try {
      const authHeader = await this.auth.getAuthHeader();
      logger.debug('SchedulingGateway::reserveSlot: Making Reservation', {
        reservationsRequest: JSON.stringify(reservationsRequest),
        ...businessIdentifiers,
      });
      const response = await this.axiosRetryClient_Reserve.post<ReservationResponse[]>(`${this.apiUrl}/tcn/${centre.region}/reservations`, reservationsRequest, authHeader);
      logger.debug('SchedulingGateway::reserveSlot: API call successful', {
        data: JSON.stringify(response.data[0]),
        ...businessIdentifiers,
      });
      return response.data[0];
    } catch (error) {
      this.logEventByIdentifiers(error, businessIdentifiers, 'reserveSlot');
      logger.error(error, 'SchedulingGateway::reserveSlot: reserve slot failed', {
        ...businessIdentifiers,
      });
      if (error.response?.status === 409) {
        logger.event(BusinessTelemetryEvents.SCHEDULING_SLOT_EXP, 'SchedulingGateway::reserveSlot: Received an expired response from Scheduling API', {
          ...businessIdentifiers,
        });
        throw new SlotUnavailableError();
      }
      throw error;
    }
  }

  public async confirmBooking(bookingRequest: BookingRequest[], region: TCNRegion): Promise<BookingResponse[]> {
    const authHeader = await this.auth.getAuthHeader();
    const reservationId = bookingRequest.map((booking) => booking.reservationId);
    const bookingRefId = bookingRequest.map((booking) => booking.bookingReferenceId);

    logger.debug('SchedulingGateway::confirmBooking: Attempting to confirm the following bookings', {
      bookingRequest: JSON.stringify(bookingRequest),
      reservationId,
      bookingRefId,
    });
    const bookingResponse = await this.axiosRetryClient_Confirm.post<BookingResponse[]>(`${this.apiUrl}/tcn/${region}/bookings`, bookingRequest, authHeader);
    logger.debug('SchedulingGateway::confirmBooking: API call successful', {
      response: JSON.stringify(bookingResponse.data),
      reservationId,
      bookingRefId,
    });
    return bookingResponse.data;
  }

  public async deleteBooking(bookingProductRef: string, testCentreRegion: string): Promise<void> {
    try {
      const authHeader = await this.auth.getAuthHeader();
      const requestUrl = `${this.apiUrl}/tcn/${testCentreRegion}/bookings/${bookingProductRef}`;
      logger.debug('SchedulingGateway::deleteBooking: Attempting to delete booking', {
        requestUrl,
        bookingProductRef,
        testCentreRegion,
      });
      await this.axiosRetryClient.delete(requestUrl, authHeader);
      logger.debug('SchedulingGateway::deleteBooking: Successfully deleted booking', {
        bookingProductRef,
      });
    } catch (error) {
      this.logEventByProductRef(error, bookingProductRef, 'deleteBooking');
      logger.error(error, 'SchedulingGateway::deleteBooking: Delete failed', {
        bookingProductRef,
      });
      throw error;
    }
  }

  public async deleteReservation(reservationId: string, testCentreRegion: string, bookingProductRef: string): Promise<void> {
    try {
      const authHeader = await this.auth.getAuthHeader();
      const requestUrl = `${this.apiUrl}/tcn/${testCentreRegion}/reservations/${reservationId}`;
      logger.debug('SchedulingGateway::deleteReservation: Attempting to delete reservation', {
        requestUrl,
        reservationId,
        testCentreRegion,
      });
      await this.axiosRetryClient.delete(requestUrl, authHeader);
      logger.debug('SchedulingGateway::deleteReservation: Successfully deleted reservation', {
        reservationId,
      });
    } catch (error) {
      this.logEventByProductRef(error, bookingProductRef, 'deleteReservation');
      if (error.response?.status === 404) {
        logger.warn('SchedulingGateway::deleteReservation: failed to delete non-existing reservation', {
          reservationId,
          bookingProductRef,
        });
      } else {
        logger.error(error, 'SchedulingGateway::deleteReservation: Delete failed', {
          reservationId,
          bookingProductRef,
        });
        throw error;
      }
    }
  }

  private toTestTypeCode(testType: TestType): string {
    const testTypeCode = SchedulingGateway.TEST_TYPE_CODES.get(testType);
    if (!testTypeCode) {
      throw new Error(`SchedulingGateway::toTestTypeCode: No scheduling mapping for TestType '${testType}'`);
    }
    return testTypeCode;
  }

  logEventByProductRef(error: AxiosError, bookingProductRef: string, func: string): void {
    const status = error.response?.status;
    if (!status) {
      logger.error(error as Error, `SchedulingGateway::logEventByProductRef::${func}: Not an axios error`);
    } else if (status === 401 || status === 403) {
      logger.event(BusinessTelemetryEvents.SCHEDULING_AUTH_ISSUE, `SchedulingGateway::${func}: Failed to authenticate to the scheduling api`, {
        bookingProductRef,
      });
    } else if (status >= 400 && status < 500) {
      logger.event(BusinessTelemetryEvents.SCHEDULING_REQUEST_ISSUE, `SchedulingGateway::${func}: Failed to get request from Scheduling api`, {
        bookingProductRef,
      });
    } else if (status >= 500) {
      logger.event(BusinessTelemetryEvents.SCHEDULING_ERROR, `SchedulingGateway::${func}: Failed to communicate with the scheduling API server`, {
        bookingProductRef,
      });
    }
  }

  logEventByIdentifiers(error: AxiosError, businessIdentifiers: Record<string, unknown>, func: string): void {
    const status = error.response?.status;
    if (!status) {
      logger.error(error as Error, `SchedulingGateway::logEventByIdentifiers::${func}: Not an axios error`);
    } else if (status === 401 || status === 403) {
      logger.event(BusinessTelemetryEvents.SCHEDULING_AUTH_ISSUE, `SchedulingGateway::${func}: Failed to authenticate to the scheduling api`, {
        ...businessIdentifiers,
      });
    } else if (status >= 400 && status < 500) {
      logger.event(BusinessTelemetryEvents.SCHEDULING_REQUEST_ISSUE, `SchedulingGateway::${func}: Failed to get request from Scheduling api`, {
        ...businessIdentifiers,
      });
    } else if (status >= 500) {
      logger.event(BusinessTelemetryEvents.SCHEDULING_ERROR, `SchedulingGateway::${func}: Failed to communicate with the scheduling API server`, {
        ...businessIdentifiers,
      });
    }
  }

  private static readonly TEST_TYPE_CODES: Map<TestType, string> = new Map([
    [TestType.ADIHPT, 'ADI_HPT'],
    [TestType.ADIP1, 'ADI_P1'],
    [TestType.ADIP1DVA, 'ADI_P1'],
    [TestType.AMIP1, 'AMI_P1'],
    [TestType.CAR, 'CAR'],
    [TestType.ERS, 'ERS'],
    [TestType.LGVCPC, 'LGV_CPC'],
    [TestType.LGVCPCC, 'LGV_CPC_C'],
    [TestType.LGVHPT, 'LGV_HPT'],
    [TestType.LGVMC, 'LGV_MC'],
    [TestType.MOTORCYCLE, 'MOTORCYCLE'],
    [TestType.PCVCPC, 'PCV_CPC'],
    [TestType.PCVCPCC, 'PCV_CPC_C'],
    [TestType.PCVHPT, 'PCV_HPT'],
    [TestType.PCVMC, 'PCV_MC'],
    [TestType.TAXI, 'TAXI'],
  ]);
}

export {
  SchedulingGateway,
  ReservationResponse,
  SlotUnavailableError,
};
