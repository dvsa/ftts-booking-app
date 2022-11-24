import { Locale, Target } from '../../../src/domain/enums';
import {
  Candidate,
  Booking,
  TestCentreSearch,
  LocationDateTime,
  Journey,
  ManageBooking,
  ManageBookingEdits,
} from '../../../src/services/session';

export interface MockRequest<T> {
  body?: T;
  query?: Record<string, string>;
  session: MockSession;
  hasErrors: boolean;
  errors?: Array<Record<string, unknown>>;
  url?: string;
  path?: string;
  originalUrl?: string;
}

export interface MockSession {
  candidate: Partial<Candidate>;
  currentBooking: Partial<Booking>;
  editedLocationTime: Partial<LocationDateTime>;
  journey: Partial<Journey>;
  manageBooking: Partial<ManageBooking>;
  manageBookingEdits: Partial<ManageBookingEdits>;
  testCentreSearch: Partial<TestCentreSearch>;
  locale: Locale;
  target: Target;
}
