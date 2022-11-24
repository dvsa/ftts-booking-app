import { Request, Response } from 'express';
import { ELIG } from '@dvsa/ftts-eligibility-api-model';
import { v4 as uuidv4 } from 'uuid';

import {
  Centre, Eligibility, PriceListItem,
} from '../domain/types';
import {
  Language,
  PreferredDay,
  PreferredLocation,
  SupportType,
  Target,
  TestType,
  Voiceover,
  Origin,
} from '../domain/enums';
import { BookingDetails, CompensatedBooking } from './crm-gateway/interfaces';
import { Booking as BookingEntity } from '../domain/booking/booking';
import { CRMEvidenceStatus } from './crm-gateway/enums';

export type ManageBookingEdits = Partial<Pick<Booking, 'centre' | 'dateTime' | 'language' | 'bsl' | 'voiceover'>>;

export interface Session {
  manageBooking: {
    getBookings: (req: Request) => BookingEntity[];
    getBooking: (req: Request, bookingRef: string) => BookingEntity | undefined;
    updateBooking: (req: Request, bookingRef: string, items: Partial<BookingDetails>) => BookingEntity;
  };
  reset: (req: Request, res?: Response) => void;
  resetBooking: (req: Request) => void;
  resetBookingExceptSupportText: (req: Request) => void;
}

interface SubSession<T> {
  update: (req: Request, items: Partial<T>) => void;
  get: (req: Request) => T;
  reset: (req: Request, res?: Response) => void;
}
export interface EditedLocationTimeSession extends SubSession<LocationDateTime> {
  reset: (req: Request, res?: Response) => void;
}

export interface Candidate {
  title?: string;
  firstnames?: string;
  surname?: string;
  gender?: ELIG.CandidateDetails.GenderEnum;
  dateOfBirth?: string; // iso-8601 date
  eligibilities?: Eligibility[];
  licenceNumber?: string;
  licenceId?: string;
  email?: string;
  telephone?: string | false;
  candidateId?: string;
  address?: ELIG.Address;
  personReference?: string;
  eligibleToBookOnline?: boolean;
  behaviouralMarker?: boolean;
  behaviouralMarkerExpiryDate?: string; // YYYY-MM-DD
  personalReferenceNumber?: string;
  paymentReceiptNumber?: string;
  ownerId?: string;
  supportNeedName?: string;
  supportEvidenceStatus?: CRMEvidenceStatus;
}

export interface Booking {
  bookingId?: string;
  bookingProductId?: string;
  bookingRef?: string;
  bookingProductRef?: string;
  bsl?: boolean;
  centre?: Centre;
  customSupport?: string;
  dateTime?: string; // iso-8601 date-time
  firstSelectedDate?: string; // iso-8601 date-time
  firstSelectedCentre?: Centre;
  governmentAgency?: Target;
  language?: Language;
  lastRefundDate?: string;
  preferredDay?: string;
  preferredDayOption?: PreferredDay;
  preferredLocation?: string;
  preferredLocationOption?: PreferredLocation;
  receiptReference?: string;
  reservationId?: string; // uuid
  salesReference?: string;
  selectSupportType?: SupportType[];
  selectStandardSupportType?: SupportType;
  testType?: TestType;
  translator?: string;
  voicemail?: boolean;
  voiceover?: Voiceover;
  priceList?: PriceListItem;
  compensationBooking?: CompensatedBooking | undefined;
  eligibility?: Eligibility;
  origin?: Origin;
  dateAvailableOnOrAfterToday?: string;
  dateAvailableOnOrBeforePreferredDate?: string;
  dateAvailableOnOrAfterPreferredDate?: string;
  hasSupportNeedsInCRM?: boolean;
  paymentId?: string;
}

export interface TestCentreSearch {
  numberOfResults?: number;
  searchQuery?: string;
  selectedDate?: string; // iso-8601 date
  zeroCentreResults?: boolean;
}

export interface Journey {
  inEditMode?: boolean; // True if editing answers from 'check your answers' page
  inManagedBookingEditMode?: boolean; // True if editing answers from 'manage-booking/change' page
  inManageBookingMode?: boolean; // True if accessing a page from the manage booking journey.
  managedBookingRescheduleChoice?: string;
  standardAccommodation?: boolean; // candidate does not need any non standard accommodations, however they still may have requested some support ('support' can be true)
  support?: boolean; // candidate has indicated they need support during the test
  isInstructor?: boolean; // True if candidate is inside the instructor journey
  confirmingSupport?: boolean; // True if candidate has come from the confirm support page
  receivedSupportRequestPageFlag?: boolean; // True if candidate has an active nsa booking and has been shown previous received support page
  shownStandardSupportPageFlag?: boolean; // True if candidate is shown the standard support page (only shown if bsl is available for test type)
  shownVoiceoverPageFlag?: boolean; // True if candidate has been shown the select voiceover page (can be false if user selects they don't want support)
}

export interface LocationDateTime {
  centre?: Centre;
  dateTime?: string; // iso-8601 date-time
}

export interface ManageBooking {
  candidate?: Candidate;
  bookings?: BookingDetails[];
}

const store: Session = {
  manageBooking: {
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
      // Safe here as not passing user input
      /* eslint-disable security/detect-object-injection */
      bookings[index] = {
        ...bookings[index],
        ...items,
      };
      return BookingEntity.from(bookings[index]);
      /* eslint-enable security/detect-object-injection */
    },
  },
  reset: (req: Request, res?: Response): void => {
    if (req.session) {
      req.session.journey = {
        inEditMode: false,
        inManagedBookingEditMode: false,
        managedBookingRescheduleChoice: '',
        inManageBookingMode: false,
        standardAccommodation: true,
        support: false,
      };
      req.session.candidate = undefined;
      req.session.currentBooking = undefined;
      req.session.testCentreSearch = undefined;
      req.session.testCentres = undefined;
      req.session.editedLocationTime = undefined;
      req.session.manageBooking = undefined;
      req.session.manageBookingEdits = undefined;
      req.session.priceLists = undefined;
      req.session.sessionId = uuidv4();
      if (res?.locals) {
        res.locals.inEditMode = false;
        res.locals.inManagedBookingEditMode = false;
        res.locals.inManageBookingMode = false;
      }
    }
  },
  resetBooking: (req: Request): void => {
    if (req.session) {
      req.session.currentBooking = undefined;
      req.session.testCentreSearch = undefined;
      req.session.testCentres = undefined;
    }
  },
  resetBookingExceptSupportText: (req: Request): void => {
    if (req.session) {
      const oldBooking = req.session.currentBooking;
      req.session.currentBooking = {
        customSupport: oldBooking?.customSupport,
        preferredDay: oldBooking?.preferredDay,
        preferredDayOption: oldBooking?.preferredDayOption,
        preferredLocation: oldBooking?.preferredLocation,
        preferredLocationOption: oldBooking?.preferredLocationOption,
      };
      req.session.testCentreSearch = undefined;
      req.session.testCentres = undefined;
    }
  },
};

export {
  store,
};
