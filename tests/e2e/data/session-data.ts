/* eslint-disable import/no-cycle */
import {
  TARGET, LOCALE, Voiceover, PreferredDay, PreferredLocation,
} from '../../../src/domain/enums';
import { getFutureDate } from '../utils/helpers';

interface Cookie {
  originalMaxAge: number;
  expires: string;
  secure: boolean;
  httpOnly: boolean;
  path: string;
}

export interface Candidate {
  firstnames: string;
  surname: string;
  licenceNumber: string;
  dateOfBirth: string;
  entitlements: string;
  email: string;
}

export interface Centre {
  name: string;
  parentOrganisation: string;
  status: string;
  region: string;
  state: string;
  siteId: string;
  description: string;
  accessible: string;
  fullyAccessible: boolean;
  addressLine1: string;
  addressLine2?: any;
  addressCity: string;
  addressCounty: string;
  addressPostalCode: string;
  addressCountryRegion: string;
  latitude: number;
  longitude: number;
  distance: number;
  providerId: string;
  testCentreId: string;
  remit: number;
}

export interface CurrentBooking {
  testType: string;
  language: string;
  bsl: boolean;
  otherSupport: boolean;
  voiceover: Voiceover;
  centre: Centre;
  dateTime: string;
  reservationId: string;
  bookingRef: string;
  bookingId: string;
  bookingProductId: string;
  salesReference: string;
  receiptReference: string;
  lastRefundDate: string;
  translator: string;
  customSupport: string;
  preferredDay: string;
  preferredDayOption?: PreferredDay;
  preferredLocation: string;
  preferredLocationOption?: PreferredLocation;
}

export interface TestCentreSearch {
  searchQuery: string;
  zeroCentreResults: boolean;
  selectedDate: string;
}

export interface SubSession<T> {
  update: (req: Request, items: Partial<T>) => void;
  get: (req: Request) => T;
  reset: (req: Request) => void;
}

export type JourneySession = SubSession<Journey>;

export interface Journey {
  inEditMode: boolean;
  inManagedBookingEditMode: boolean;
  managedBookingRescheduleChoice: string;
  support: boolean;
  standardAccommodation: boolean;
}

interface Root {
  cookie: Cookie;
  locale: string;
  target: string;
  candidate: Candidate;
  currentBooking: CurrentBooking;
  testCentreSearch: TestCentreSearch;
  journey: Journey;
}

export class SessionData implements Root {
  cookie: Cookie;

  locale: string;

  target: string;

  candidate: Candidate;

  currentBooking: CurrentBooking;

  testCentreSearch: TestCentreSearch;

  testDateLessThan3Days: boolean;

  journey: Journey;

  constructor(target: TARGET, locale?: LOCALE) {
    const lang = locale || LOCALE.GB;
    if (target === TARGET.GB) {
      this.initiliseGbBooking(lang);
    } else if (target === TARGET.NI) {
      this.initialiseNiBooking(lang);
    }

    this.cookie = {
      originalMaxAge: 1800000,
      expires: '2030-06-30T12:00:00.000Z',
      secure: true,
      httpOnly: true,
      path: '/',
    };
  }

  initialiseNiBooking(locale: LOCALE) {
    this.journey = {
      support: false,
      inEditMode: false,
      inManagedBookingEditMode: false,
      managedBookingRescheduleChoice: '',
      standardAccommodation: true,
    };
    this.testDateLessThan3Days = false;
    this.locale = locale;
    this.target = TARGET.NI;
    this.candidate = {
      firstnames: 'Glen William',
      surname: 'Delaney',
      licenceNumber: '17874131',
      dateOfBirth: '2000-09-02',
      entitlements: '',
      email: 'test@kainos.com',
    };

    this.currentBooking = {
      testType: 'car',
      language: 'english',
      bsl: false,
      otherSupport: false,
      voiceover: Voiceover.NONE,
      centre: {
        name: 'Belfast',
        parentOrganisation: 'fde8157f-e156-ea11-a811-000d3a7f128d',
        status: 'ACTIVE',
        region: 'c',
        state: 'ni',
        siteId: 'SITE-0134',
        description: 'Belfast Theory Test Centre',
        accessible: 'Disabled access',
        fullyAccessible: false,
        addressLine1: '5th Floor, Chambers of Commerce House',
        addressLine2: '22 Great Victoria Street',
        addressCity: 'Belfast',
        addressCounty: 'Belfast',
        addressPostalCode: 'BT2 7LX',
        addressCountryRegion: 'Belfast United Kingdom',
        latitude: 54.59526,
        longitude: -5.93428,
        distance: 0.29407376676936053,
        providerId: '0001',
        testCentreId: '0001:SITE-0134',
        remit: 675030001,
      },
      dateTime: getFutureDate('month', 1).toISOString(),
      reservationId: '1111-2222-3333-4444-5555',
      bookingRef: 'A-000-000-001',
      bookingId: '1115e591-75ca-ea11-a812-00224801cecd',
      bookingProductId: '1115e591-75ca-ea11-a812-00224801cecd',
      receiptReference: '123-456-789',
      salesReference: '',
      lastRefundDate: '',
      translator: '',
      customSupport: '',
      preferredDay: '',
      preferredLocation: '',
    };

    this.testCentreSearch = {
      searchQuery: 'Belfast',
      zeroCentreResults: false,
      selectedDate: '2021-04-03',
    };
  }

  initiliseGbBooking(locale: LOCALE) {
    this.journey = {
      support: false,
      inEditMode: false,
      inManagedBookingEditMode: false,
      managedBookingRescheduleChoice: '',
      standardAccommodation: true,
    };
    this.testDateLessThan3Days = false;
    this.locale = locale;
    this.target = TARGET.GB;
    this.candidate = {
      firstnames: 'Wendy',
      surname: 'Jones',
      licenceNumber: 'JONES061102W97YT',
      dateOfBirth: '2002-11-10',
      entitlements: '',
      email: 'test@kainos.com',
    };

    this.currentBooking = {
      testType: 'car',
      language: 'english',
      bsl: false,
      otherSupport: false,
      voiceover: Voiceover.NONE,
      centre: {
        name: 'Birmingham',
        parentOrganisation: 'c5a24e76-1c5d-ea11-a811-000d3a7f128d',
        status: 'ACTIVE',
        region: 'a',
        state: 'gb',
        siteId: 'SITE-0135',
        description: 'Birmingham Theory Test Centre',
        accessible: 'Disabled access',
        fullyAccessible: false,
        addressLine1: '38 Dale End',
        addressLine2: 'Test',
        addressCity: 'Birmingham',
        addressCounty: 'West Midlands',
        addressPostalCode: 'B4 7NJ',
        addressCountryRegion: 'West Midlands United Kingdom',
        latitude: 52.48213,
        longitude: -1.89219,
        distance: 0.29407376676936053,
        providerId: '0001',
        testCentreId: '0001:SITE-0135',
        remit: 675030000,
      },
      dateTime: getFutureDate('month', 1).toISOString(),
      reservationId: '1111-2222-3333-4444-5555',
      bookingRef: 'A-000-000-001',
      bookingId: '1115e591-75ca-ea11-a812-00224801cecd',
      bookingProductId: '1115e591-75ca-ea11-a812-00224801cecd',
      receiptReference: '123-456-789',
      salesReference: '',
      lastRefundDate: '',
      translator: '',
      customSupport: '',
      preferredDay: '',
      preferredLocation: '',
    };

    this.testCentreSearch = {
      searchQuery: 'Alpha Tower, Birmingham B1 1TT',
      zeroCentreResults: false,
      selectedDate: '2021-04-03',
    };
  }
}
