// Not passing user input to access array so can safely disable
/* eslint-disable security/detect-object-injection */
import { Request } from 'express';

import { Licence } from '../pages/details/licence';
import { LicenceNumber } from '../domain/licence-number';
import { UtcDate } from '../domain/utc-date';
import { Entitlements } from '../pages/details/entitlements';
import { Centre } from '../domain/types';
import {
  LANGUAGE, LOCALE, PreferredDay, PreferredLocation, TARGET, TestType, Voiceover,
} from '../domain/enums';
import { BookingDetails } from './crm-gateway/interfaces';
import { Booking as BookingEntity } from '../domain/booking/booking';
import { DvlaAddress } from './dvla-gateway/types';

export type ManageBookingEdits = Partial<Pick<Booking, 'centre' | 'dateTime' | 'language' | 'bsl' | 'voiceover'>>;

export interface Session {
  candidate: CandidateSession;
  currentBooking: SubSession<Booking>;
  testCentreSearch: TestCentreSearchSession;
  journey: JourneySession;
  editedLocationTime: EditedLocationTimeSession;
  manageBooking: ManageBookingSession;
  manageBookingEdits: SubSession<ManageBookingEdits>;

  target: Datum<TARGET>;
  locale: Datum<LOCALE>;

  active: (req: Request) => boolean;
  reset: (req: Request) => void;
  resetBooking: (req: Request) => void;
}

interface SubSession<T> {
  update: (req: Request, items: Partial<T>) => void;
  get: (req: Request) => T;
  reset: (req: Request) => void;
}

export interface CandidateSession extends SubSession<Candidate> {
  licence: (req: Request) => Licence;
}

export interface EditedLocationTimeSession extends SubSession<LocationDateTime> {
  reset: (req: Request) => void;
}

export interface Candidate {
  firstnames: string;
  surname: string;
  dateOfBirth: string; // iso-8601 date
  entitlements?: string; // csv
  licenceNumber: string;
  licenceId: string;
  email: string;
  telephone?: string | false;
  candidateId: string;
  address?: DvlaAddress;
  personReference: string;
}

export interface Booking {
  bookingId: string;
  bookingProductId: string;
  bookingRef: string;
  bsl: boolean;
  testType: TestType;
  centre: Centre;
  dateTime: string; // iso-8601 date-time
  language: LANGUAGE;
  otherSupport: boolean;
  salesReference: string;
  receiptReference: string;
  reservationId: string; // uuid
  voiceover: Voiceover;
  lastRefundDate: string;
  translator: string;
  customSupport: string;
  selectSupportType: string[] | undefined;
  voicemail: boolean;
  preferredDay: string;
  preferredDayOption?: PreferredDay;
  preferredLocation: string;
  preferredLocationOption?: PreferredLocation;
}

export type TestCentreSearchSession = SubSession<TestCentreSearch>;

export interface TestCentreSearch {
  numberOfResults: number;
  searchQuery: string;
  zeroCentreResults: boolean;
  selectedDate: string; // iso-8601 date
}

export type JourneySession = SubSession<Journey>;

export interface Journey {
  inEditMode: boolean; // True if editing answers from 'check your answers' page
  inManagedBookingEditMode: boolean; // True if editing answers from 'manage-booking/change' page
  managedBookingRescheduleChoice: string;
  support: boolean; // candidate has indicated they need support during the test
  standardAccommodation: boolean; // candidate does not need any non standard accommodations, however they still may have requested some support ('support' can be true)
}

export interface LocationDateTime {
  centre: Centre;
  dateTime: string; // iso-8601 date-time
}

export interface ManageBookingSession extends SubSession<ManageBooking> {
  getBookings: (req: Request) => BookingEntity[];
  getBooking: (req: Request, bookingRef: string) => BookingEntity | undefined;
  updateBooking: (req: Request, bookingRef: string, items: Partial<BookingDetails>) => BookingEntity;
  reset: (req: Request) => void;
}

export interface ManageBooking {
  candidate: Candidate;
  bookings: BookingDetails[];
}

export type Datum<T> = {
  get: (req: Request) => T;
  set: (req: Request, value: T) => void;
};

const store: Session = {
  candidate: {
    update: (req: Request, items: object): void => {
      if (req.session) {
        req.session.candidate = {
          ...req.session.candidate,
          ...items,
        };
      }
    },
    licence: (req: Request): Licence => {
      const licence = new Licence(
        LicenceNumber.of(req.session?.candidate.licenceNumber, req.session?.target),
        req.session?.candidate.firstnames,
        req.session?.candidate.surname,
        UtcDate.of(req.session?.candidate.dateOfBirth),
        Entitlements.of(req.session?.candidate.entitlements),
        req.session?.candidate.address,
      );
      licence.licenceId = req.session?.candidate.licenceId;
      return licence;
    },
    get: (req: Request): Candidate => req.session?.candidate || {},
    reset: (req: Request): void => {
      if (req.session) {
        req.session.candidate = {};
      }
    },
  },
  currentBooking: {
    update: (req: Request, items: Partial<Booking>): void => {
      if (req.session) {
        req.session.currentBooking = {
          ...req.session.currentBooking,
          ...items,
        };
      }
    },
    get: (req: Request): Booking => req.session?.currentBooking || {},
    reset: (req: Request): void => {
      if (req.session) {
        req.session.currentBooking = {};
      }
    },
  },
  testCentreSearch: {
    update: (req: Request, items: Partial<TestCentreSearch>): void => {
      if (req.session) {
        req.session.testCentreSearch = {
          ...req.session.testCentreSearch,
          ...items,
        };
      }
    },
    get: (req: Request): TestCentreSearch => req.session?.testCentreSearch || {},
    reset: (req: Request): void => {
      if (req.session) {
        req.session.testCentreSearch = {};
      }
    },
  },
  journey: {
    update: (req: Request, items: Partial<Journey>): void => {
      if (req.session) {
        req.session.journey = {
          ...req.session.journey,
          ...items,
        };
      }
    },
    get: (req: Request): Journey => req.session?.journey || {},
    reset: (req: Request): void => {
      if (req.session) {
        req.session.journey = {};
      }
    },
  },
  editedLocationTime: {
    update: (req: Request, items: Partial<LocationDateTime>): void => {
      if (req.session) {
        req.session.editedLocationTime = {
          ...req.session.editedLocationTime,
          ...items,
        };
      }
    },
    get: (req: Request): Booking => req.session?.editedLocationTime || {},
    reset: (req: Request): void => {
      if (req.session) {
        req.session.editedLocationTime = {};
      }
    },
  },
  manageBooking: {
    get: (req: Request): ManageBooking => req.session?.manageBooking || {},
    update: (req: Request, items: Partial<ManageBooking>): void => {
      if (req.session) {
        req.session.manageBooking = {
          ...req.session.manageBooking,
          ...items,
        };
      }
    },
    getBookings: (req: Request): BookingEntity[] => {
      const bookings: BookingDetails[] = req.session?.manageBooking?.bookings || [];
      return bookings.map((booking) => BookingEntity.from(booking));
    },
    getBooking: (req: Request, bookingRef: string): BookingEntity | undefined => {
      const bookings: BookingDetails[] = req.session?.manageBooking?.bookings || [];
      const bookingDetails = bookings.find((b) => b.reference === bookingRef);
      if (!bookingDetails) {
        return undefined;
      }
      return BookingEntity.from(bookingDetails);
    },
    updateBooking: (req: Request, bookingRef: string, items: Partial<BookingDetails>): BookingEntity => {
      const bookings: BookingDetails[] = req.session?.manageBooking?.bookings || [];
      const index = bookings.findIndex((b) => b.reference === bookingRef);
      bookings[index] = {
        ...bookings[index],
        ...items,
      };
      return BookingEntity.from(bookings[index]);
    },
    reset: (req: Request): void => {
      if (req.session) {
        req.session.manageBooking = {};
      }
    },
  },
  manageBookingEdits: {
    update: (req: Request, items: ManageBookingEdits): void => {
      if (req.session) {
        req.session.manageBookingEdits = {
          ...req.session.manageBookingEdits,
          ...items,
        };
      }
    },
    get: (req: Request): ManageBookingEdits => req.session?.manageBookingEdits || {},
    reset: (req: Request): void => {
      if (req.session) {
        req.session.manageBookingEdits = {};
      }
    },
  },
  target: {
    set: (req: Request, target: TARGET): void => {
      if (req.session) {
        req.session.target = target;
      }
    },
    get: (req: Request): TARGET => req.session?.target || TARGET.GB,
  },
  locale: {
    set: (req: Request, locale: LOCALE): void => {
      if (req.session) {
        req.session.locale = locale;
      }
    },
    get: (req: Request): LOCALE => req.session?.locale || LOCALE.GB,
  },
  active: (req: Request): boolean => !!req.session?.candidate,
  reset: (req: Request): void => {
    if (req.session) {
      req.session.candidate = {};
      req.session.currentBooking = {};
      req.session.testCentreSearch = {};
      req.session.journey = {};
      req.session.manageBooking = {};
      req.session.manageBookingEdits = {};
    }
  },
  resetBooking: (req: Request): void => {
    if (req.session) {
      req.session.currentBooking = {
        test: {},
        booking: {},
      };
      req.session.testCentreSearch = {};
    }
  },
};

export {
  store,
};
