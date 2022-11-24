import { Context, Locale, Target } from './domain/enums';
import { Centre, PriceListItem } from './domain/types';
import { CompensatedBooking } from './services/crm-gateway/interfaces';
import {
  Booking, Candidate, Journey, LocationDateTime, ManageBooking, ManageBookingEdits, TestCentreSearch,
} from './services/session';

declare module 'express-session' {
  interface SessionData {
    init: boolean;
    candidate: Candidate;
    currentBooking: Booking;
    testCentreSearch: TestCentreSearch;
    testCentres: Centre[];
    priceLists: PriceListItem[];
    compensationBookings: CompensatedBooking[];
    journey: Journey;
    editedLocationTime: LocationDateTime;
    manageBooking: ManageBooking;
    manageBookingEdits: ManageBookingEdits;
    context: Context;
    target: Target;
    locale: Locale;
    lastPage: string;
    sessionId: string;
  }
}
