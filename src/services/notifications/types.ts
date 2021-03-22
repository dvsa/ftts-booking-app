import { TestType } from '../../domain/enums';
import { Centre } from '../../domain/types';

export enum EMAIL_TYPE {
  BOOKING_CONFIRMATION,
  BOOKING_CANCELLATION,
  BOOKING_RESCHEDULED,
}

export interface EmailContent {
  subject: string;
  body: string;
}

export interface BookingConfirmationDetails {
  bookingRef: string;
  testType: TestType;
  testCentre: Centre;
  testDateTime: string;
  lastRefundDate: string;
}

export interface BookingCancellationDetails {
  bookingRef: string;
  testType: TestType;
  testDateTime: string;
}

export interface BookingRescheduledDetails {
  bookingRef: string;
  testType: TestType;
  testCentre: Centre;
  testDateTime: string;
  lastRefundDate: string;
}
