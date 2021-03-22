// eslint-disable-next-line max-classes-per-file
import { AxiosResponse } from 'axios';
import dayjs, { Dayjs } from 'dayjs';

import config from '../../config';
import axiosRetryClient from '../../libraries/axios-retry-client';
import { AppointmentSlot } from '../../domain/slot';
import { Centre } from '../../domain/types';
import { TCNRegion, TestType } from '../../domain/enums';
import {
  BookingFullResponse, BookingRequest, BookingResponse, ReservationResponse,
} from '../../domain/booking/types';
import logger from '../../helpers/logger';
import { SchedulingAuth } from './scheduling-auth';

class SlotUnavailableError extends Error { }

class Scheduler {
  private static instance: Scheduler = new Scheduler(SchedulingAuth.getInstance());

  public static getInstance(): Scheduler {
    return Scheduler.instance;
  }

  constructor(
    private schedulingAuth: SchedulingAuth,
    private apiUrl: string = `${config.scheduling.baseUrl}/v1`,
    private reservationLockTime: number = config.scheduling.lockTime,
  ) { }

  public async getBooking(bookingRef: string, testCentreRegion: string): Promise<BookingFullResponse> {
    try {
      const authHeader = await this.getAuthHeader();
      const response = await axiosRetryClient.get(`${this.apiUrl}/tcn/${testCentreRegion}/bookings/${bookingRef}`, authHeader);
      return response.data;
    } catch (error) {
      logger.error(error, `SCHEDULING-SERVICE::getBooking: GET failed for booking reference: ${bookingRef}`);
      throw error;
    }
  }

  public async availableSlots(chosenDate: Dayjs, centre: Centre, testType: TestType): Promise<AppointmentSlot[]> {
    const minDate = dayjs().add(1, 'day');
    let dateFrom = chosenDate.startOf('week');
    let dateTo = chosenDate.endOf('week');
    const sixMonths = dayjs().endOf('day').add(6, 'month');

    // prevent showing days in the past
    if (dateFrom.isBefore(minDate) || dateFrom.isSame(minDate)) {
      dateFrom = minDate;
      dateTo = dayjs(minDate).add(7, 'day');
    }

    // prevent showing slots after 6 months
    if (dateTo.isAfter(sixMonths)) {
      dateTo = sixMonths;
    }

    if (dateFrom.isAfter(sixMonths)) {
      return Promise.resolve([]);
    }

    try {
      const authHeader = await this.getAuthHeader();
      const slots = await axiosRetryClient.get<AppointmentSlot[]>(`${this.apiUrl}/tcn/${centre.region}/testCentres/${centre.testCentreId}/slots?testTypes=%5B%22${testType.toUpperCase()}%22%5D&dateFrom=${dateFrom.format('YYYY-MM-DD')}&dateTo=${dateTo.format('YYYY-MM-DD')}`, authHeader);
      return Promise.resolve(slots.data);
    } catch (error) {
      logger.error(error, 'SCHEDULING-SERVICE::availableSlots: Call to scheduling api failed');
      return Promise.reject(error);
    }
  }

  public async reserveSlot(centre: Centre, testType: TestType, startDateTime: string): Promise<ReservationResponse> {
    const reservationsRequest = [{
      testCentreId: centre.testCentreId,
      testTypes: [testType],
      startDateTime,
      quantity: 1,
      lockTime: this.reservationLockTime,
    }];
    try {
      const authHeader = await this.getAuthHeader();
      const response = await axiosRetryClient.post<ReservationResponse[]>(`${this.apiUrl}/tcn/${centre.region}/reservations`, reservationsRequest, authHeader);
      return Promise.resolve(response.data[0]);
    } catch (error) {
      logger.error(error, 'SCHEDULING-SERVICE::reserveSlot: reserve slot failed');
      if (error.response?.status === 409) {
        throw new SlotUnavailableError();
      }
      throw error;
    }
  }

  public async confirmBooking(bookingRequest: BookingRequest[], region: TCNRegion): Promise<BookingResponse[]> {
    const authHeader = await this.getAuthHeader();
    const bookingResponse = await axiosRetryClient.post<BookingResponse[]>(`${this.apiUrl}/tcn/${region}/bookings`, bookingRequest, authHeader);
    return bookingResponse.data;
  }

  public async deleteBooking(bookingRef: string, testCentreRegion: string): Promise<AxiosResponse> {
    try {
      const authHeader = await this.getAuthHeader();
      return await axiosRetryClient.delete(`${this.apiUrl}/tcn/${testCentreRegion}/bookings/${bookingRef}`, authHeader);
    } catch (error) {
      logger.error(error, `SCHEDULING-SERVICE::deleteBooking: Delete failed for booking reference: ${bookingRef}`);
      throw error;
    }
  }

  private async getAuthHeader(): Promise<AuthHeader> {
    const token = await this.schedulingAuth.getToken();
    return { headers: { Authorization: `Bearer ${token}` } };
  }
}

type AuthHeader = {
  headers: {
    Authorization: string;
  };
};

export {
  Scheduler,
  ReservationResponse,
  SlotUnavailableError,
};
