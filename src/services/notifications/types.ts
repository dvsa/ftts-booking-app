import {
  Language, PreferredDay, PreferredLocation, SupportType, TestType, Voiceover,
} from '../../domain/enums';
import { Centre } from '../../domain/types';

export enum EmailType {
  BOOKING_CONFIRMATION,
  BOOKING_CANCELLATION,
  BOOKING_RESCHEDULED,
  EVIDENCE_REQUIRED,
  EVIDENCE_NOT_REQUIRED,
  EVIDENCE_MAY_BE_REQUIRED,
  RETURNING_CANDIDATE,
  REFUND_REQUEST,
}

export interface EmailContent {
  subject: string;
  body: string;
}

export interface BookingBaseDetails {
  bookingRef: string;
  testType: TestType;
  testDateTime: string;
}

export interface BookingConfirmationDetails extends BookingBaseDetails {
  testCentre: Centre;
  lastRefundDate: string;
}

export type BookingCancellationDetails = BookingBaseDetails;

export interface BookingRescheduledDetails extends BookingBaseDetails {
  testCentre: Centre;
  lastRefundDate: string;
}

export interface SupportRequestDetails {
  reference: string;
  testType: TestType;
  testLanguage: Language;
  supportTypes: SupportType[];
  voiceover?: Voiceover;
  translator?: string; // NI only
  customSupport?: string;
  preferredDay: {
    option?: PreferredDay;
    text?: string;
  };
  preferredLocation: {
    option?: PreferredLocation;
    text?: string;
  };
}

export interface RefundRequestDetails {
  bookingRef: string;
}
