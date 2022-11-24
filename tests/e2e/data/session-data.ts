/* eslint-disable import/no-cycle */
import { ELIG } from '@dvsa/ftts-eligibility-api-model';
import dayjs from 'dayjs';
import {
  dob, drivingLicenceTemplateGB, drivingLicenceTemplateNI, testPayment,
} from './constants';
import {
  Target, Locale, Voiceover, PreferredDay, PreferredLocation, TestType, TCNRegion, Language, SupportType, Origin,
} from '../../../src/domain/enums';
import { CompensatedBooking } from '../../../src/services/crm-gateway/interfaces';
import { Eligibility, PriceListItem } from '../../../src/domain/types';
import { getFutureDate } from '../utils/helpers';
import { CRMTestSupportNeed } from '../../../src/services/crm-gateway/enums';
import { PaymentModel } from './payment-model';

interface Cookie {
  originalMaxAge: number;
  expires: string;
  secure: boolean;
  httpOnly: boolean;
  path: string;
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
  testType?: TestType;
  translator?: any;
  voicemail?: boolean;
  voiceover?: Voiceover;
  priceList?: PriceListItem;
  compensationBooking?: CompensatedBooking | undefined;
  eligibility?: Eligibility;
  origin?: Origin;
  eligibilityBypass?: boolean;
  dateAvailableOnOrAfterToday?: string;
  dateAvailableOnOrBeforePreferredDate?: string;
  dateAvailableOnOrAfterPreferredDate?: string;
  testSupportNeeds?: CRMTestSupportNeed[];
}

export interface Centre {
  name: string;
  parentOrganisation: string;
  status: string;
  region: TCNRegion | undefined;
  state: string;
  siteId: string;
  description: string;
  accessible: string;
  fullyAccessible: boolean;
  addressLine1: string;
  addressLine2: string;
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
  accountId: string;
  ftts_tcntestcentreid?: string;
}

export interface TestCentreSearch {
  searchQuery: string;
  zeroCentreResults: boolean;
  selectedDate: string;
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

interface Root {
  cookie: Cookie;
  locale: string;
  target: string;
  priceLists: PriceListItem[];
  candidate: Candidate;
  currentBooking: Booking;
  testCentreSearch: TestCentreSearch;
  journey: Journey;
  paymentDetails: PaymentModel;
}

export class SessionData implements Root {
  cookie: Cookie;

  locale: string;

  target: string;

  priceLists: PriceListItem[];

  candidate: Candidate;

  currentBooking: Booking;

  testCentreSearch: TestCentreSearch;

  compensationBookings: CompensatedBooking[];

  testDateLessThan3Days: boolean;

  specificDate: boolean;

  journey: Journey;

  hasComeFromNsaJourney: boolean;

  changeSupport: boolean;

  changeSupportTypes: boolean;

  init: boolean;

  isCompensationBooking: boolean;

  meaningfulSupportRequest: boolean;

  skipSupportRequest: boolean;

  overrideCreatedOnDate: boolean;

  paymentDetails: PaymentModel;

  constructor(target: Target, locale?: Locale, nsa = false, instructor = false, freshCandidate = false) {
    if (target === Target.GB) {
      const lang = locale || Locale.GB;
      if (nsa) {
        this.initialiseGbBookingNsa(lang);
      } else {
        this.initialiseGbBooking(lang);
      } if (instructor) {
        this.getInstructorCandidateGb();
      } if (freshCandidate) {
        this.getFreshCandidate(target);
      }
    } else if (target === Target.NI) {
      const lang = Locale.NI;
      if (nsa) {
        this.initialiseNiBookingNsa(lang);
      } else {
        this.initialiseNiBooking(lang);
      } if (instructor) {
        this.getInstructorCandidateNi();
      } if (freshCandidate) {
        this.getFreshCandidate(target);
      }
    }

    this.cookie = {
      originalMaxAge: 1800000,
      expires: dayjs().add(30, 'minutes').toISOString(),
      secure: true,
      httpOnly: true,
      path: '/',
    };
  }

  snapshot(): SessionData {
    return {
      journey: { ...this.journey },
      candidate: { ...this.candidate },
      cookie: { ...this.cookie },
      changeSupport: this.changeSupport,
      currentBooking: { ...this.currentBooking },
      init: this.init,
      isCompensationBooking: this.isCompensationBooking,
      hasComeFromNsaJourney: this.hasComeFromNsaJourney,
      changeSupportTypes: this.changeSupportTypes,
      locale: this.locale,
      priceLists: { ...this.priceLists },
      compensationBookings: { ...this.compensationBookings },
      target: this.target,
      testCentreSearch: { ...this.testCentreSearch },
      testDateLessThan3Days: this.testDateLessThan3Days,
      specificDate: this.specificDate,
      meaningfulSupportRequest: this.meaningfulSupportRequest,
      skipSupportRequest: this.skipSupportRequest,
      overrideCreatedOnDate: this.overrideCreatedOnDate,
      paymentDetails: this.paymentDetails,
      getInstructorCandidateGb: this.getInstructorCandidateGb,
      getInstructorCandidateNi: this.getInstructorCandidateNi,
      getRandomDrivingLicence: this.getRandomDrivingLicence,
      initialiseGbBooking: this.initialiseGbBooking,
      initialiseGbBookingNsa: this.initialiseGbBookingNsa,
      initialiseNiBooking: this.initialiseNiBooking,
      initialiseNiBookingNsa: this.initialiseNiBookingNsa,
      getFreshCandidate: this.getFreshCandidate,
      snapshot: this.snapshot,
    };
  }

  getInstructorCandidateGb(): void {
    this.journey.isInstructor = true;
    this.candidate = {
      title: 'Mr',
      firstnames: 'Tester',
      surname: 'Tester',
      gender: ELIG.CandidateDetails.GenderEnum.M,
      licenceNumber: this.getRandomDrivingLicence(),
      dateOfBirth: dob,
      eligibilities: [{
        eligible: true,
        testType: TestType.ADIP1,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
        personalReferenceNumber: '321971',
      },
      ],
      email: 'test@kainos.com',
      telephone: '07777777777',
      address: {
        line1: '4 First Lane',
        line2: 'Belfast',
        line3: 'Country Antrim',
        line5: 'Some City',
        postcode: 'BT12 6QN',
      },
      eligibleToBookOnline: true,
      behaviouralMarker: false,
      candidateId: '8d54a5a3-f624-ec11-b6e6-000d3ad657c5',
      licenceId: '9e91ec6e-1425-ec11-b6e6-000d3ad657c5',
      personReference: '123456789',
      personalReferenceNumber: '321971',
      ownerId: '3a0cbcb3-ae3e-eb11-bf6d-000d3a86a4bb',
    };
    this.currentBooking.testType = TestType.ADIP1;
    this.currentBooking.priceList = {
      testType: TestType.ADIP1,
      price: 81,
      product: {
        name: 'ADI P1',
        productId: '5432a21d-8a1f-4a27-9b5a-a9a85bfc5456',
        parentId: '1f63d0d6-a4ba-4dad-8240-8ab0ce404b46',
      },
    };
    this.priceLists = [
      {
        testType: TestType.ADIP1,
        price: 81,
        product: {
          name: 'ADI P1',
          productId: '5432a21d-8a1f-4a27-9b5a-a9a85bfc5456',
          parentId: '1f63d0d6-a4ba-4dad-8240-8ab0ce404b46',
        },
      },
    ];
  }

  // make sure candidate licence number ends in a odd number/letter
  // e.g. A,C,E.. for GB licence
  // this ensure Eligibility API will always not return a Candidate ID
  getFreshCandidate(target: Target): void {
    if (target === Target.GB) {
      this.candidate = {
        title: 'Mr',
        firstnames: 'Joseph',
        surname: 'Bloggs',
        licenceNumber: 'BLOGG902120J99ZC',
        dateOfBirth: '1990-02-12',
        email: 'test@kainos.com',
        telephone: '07777777777',
        address: {
          line1: '4 First Lane',
          line2: 'Belfast',
          line3: 'Country Antrim',
          line5: 'Some City',
          postcode: 'BT12 6QN',
        },
        eligibilities: [{
          eligible: true,
          testType: TestType.CAR,
          eligibleFrom: '2020-01-01',
          eligibleTo: '2030-01-01',
        },
        {
          eligible: true,
          testType: TestType.MOTORCYCLE,
          eligibleFrom: '2020-01-01',
          eligibleTo: '2030-01-01',
        },
        {
          eligible: true,
          testType: TestType.LGVMC,
        },
        {
          eligible: true,
          testType: TestType.LGVHPT,
        },
        {
          eligible: true,
          testType: TestType.LGVCPC,
        },
        {
          eligible: true,
          testType: TestType.LGVCPCC,
        },
        {
          eligible: true,
          testType: TestType.PCVMC,
        },
        {
          eligible: true,
          testType: TestType.PCVHPT,
        },
        {
          eligible: true,
          testType: TestType.PCVCPC,
        },
        {
          eligible: true,
          testType: TestType.PCVCPCC,
        },
        {
          eligible: true,
          testType: TestType.TAXI,
        },
        {
          eligible: true,
          testType: TestType.ADIP1,
          eligibleFrom: '2020-01-01',
          eligibleTo: '2030-01-01',
          personalReferenceNumber: '321971',
        },
        ],
        eligibleToBookOnline: true,
        behaviouralMarker: false,
        ownerId: '3a0cbcb3-ae3e-eb11-bf6d-000d3a86a4bb',
      };
    } else {
      this.candidate = {
        title: 'Mr',
        firstnames: 'Joseph',
        surname: 'Bloggs',
        licenceNumber: '98765411',
        dateOfBirth: '1990-02-12',
        email: 'test@kainos.com',
        telephone: '07777777777',
        address: {
          line1: '4 First Lane',
          line2: 'Belfast',
          line3: 'Country Antrim',
          line5: 'Some City',
          postcode: 'BT12 6QN',
        },
        eligibilities: [{
          eligible: true,
          testType: TestType.CAR,
          eligibleFrom: '2020-01-01',
          eligibleTo: '2030-01-01',
        },
        {
          eligible: true,
          testType: TestType.MOTORCYCLE,
          eligibleFrom: '2020-01-01',
          eligibleTo: '2030-01-01',
        },
        {
          eligible: true,
          testType: TestType.LGVMC,
        },
        {
          eligible: true,
          testType: TestType.LGVHPT,
        },
        {
          eligible: true,
          testType: TestType.LGVCPC,
        },
        {
          eligible: true,
          testType: TestType.LGVCPCC,
        },
        {
          eligible: true,
          testType: TestType.PCVMC,
        },
        {
          eligible: true,
          testType: TestType.PCVHPT,
        },
        {
          eligible: true,
          testType: TestType.PCVCPC,
        },
        {
          eligible: true,
          testType: TestType.PCVCPCC,
        },
        {
          eligible: true,
          testType: TestType.TAXI,
        },
        {
          eligible: true,
          testType: TestType.ADIP1DVA,
          eligibleFrom: '2020-01-01',
          eligibleTo: '2030-01-01',
          paymentReceiptNumber: '92647',
        },
        ],
        eligibleToBookOnline: true,
        behaviouralMarker: false,
        ownerId: '3a0cbcb3-ae3e-eb11-bf6d-000d3a86a4bb',
      };
    }
  }

  getInstructorCandidateNi(): void {
    this.journey.isInstructor = true;
    this.candidate = {
      title: 'Mr',
      firstnames: 'TesterNi',
      surname: 'TesterNi',
      gender: ELIG.CandidateDetails.GenderEnum.M,
      licenceNumber: this.getRandomDrivingLicence(),
      dateOfBirth: dob,
      eligibilities: [{
        eligible: true,
        testType: TestType.ADIP1DVA,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
        paymentReceiptNumber: '92647',
      },
      ],
      email: 'test@kainos.com',
      telephone: '07777777777',
      address: {
        line1: '4 First Lane',
        line2: 'Belfast',
        line3: 'Country Antrim',
        line5: 'Some City',
        postcode: 'BT12 6QN',
      },
      eligibleToBookOnline: true,
      behaviouralMarker: false,
      candidateId: '3b42d43c-aea2-eb11-b1ac-0022484166fa',
      licenceId: '5a42d43c-aea2-eb11-b1ac-0022484166fa',
      personReference: '123456789',
      paymentReceiptNumber: '92647',
      ownerId: '3a0cbcb3-ae3e-eb11-bf6d-000d3a86a4bb',
    };
    this.currentBooking.testType = TestType.ADIP1DVA;
    this.currentBooking.priceList = {
      testType: TestType.ADIP1DVA,
      price: 64,
      product: {
        name: 'ADI P1 - NI',
        productId: '2d257ba4-0199-eb11-b1ac-0022483f4fba',
        parentId: '1f63d0d6-a4ba-4dad-8240-8ab0ce404b46',
      },
    };
    this.priceLists = [
      {
        testType: TestType.ADIP1DVA,
        price: 64,
        product: {
          name: 'ADI P1 - NI',
          productId: '2d257ba4-0199-eb11-b1ac-0022483f4fba',
          parentId: '1f63d0d6-a4ba-4dad-8240-8ab0ce404b46',
        },
      },
    ];
  }

  getRandomDrivingLicence(): string {
    let drivingLicence: string;
    if (this.target === Target.GB) {
      const MIN = 4;
      const MAX = 9;
      const SUFFIX = ['VR', 'ZZ'];
      const randLicenceSuffix = SUFFIX[Math.floor(Math.random() * SUFFIX.length)];
      const randLicenceValue = String(Math.floor(Math.random() * (MAX - MIN)) + MIN);
      drivingLicence = drivingLicenceTemplateGB.replace('*', randLicenceValue + randLicenceSuffix);
    } else if (this.target === Target.NI) {
      const MIN = 0;
      const MAX = 9;
      const randLicenceValue = String(Math.floor(Math.random() * (MAX - MIN)) + MIN);
      drivingLicence = drivingLicenceTemplateNI.replace('*', randLicenceValue);
    }
    return drivingLicence;
  }

  initialiseNiBooking(locale: Locale): void {
    this.journey = {
      support: false,
      inEditMode: false,
      inManagedBookingEditMode: false,
      managedBookingRescheduleChoice: '',
      standardAccommodation: true,
      confirmingSupport: false,
      receivedSupportRequestPageFlag: false,
      shownStandardSupportPageFlag: true,
      shownVoiceoverPageFlag: true,
    };
    this.paymentDetails = testPayment;
    this.testDateLessThan3Days = false;
    this.hasComeFromNsaJourney = false;
    this.changeSupport = false;
    this.changeSupportTypes = false;
    this.locale = locale;
    this.target = Target.NI;
    this.init = true;
    this.candidate = {
      title: 'Mr',
      firstnames: 'TesterNi',
      surname: 'TesterNi',
      gender: ELIG.CandidateDetails.GenderEnum.M,
      licenceNumber: this.getRandomDrivingLicence(),
      dateOfBirth: dob,
      eligibilities: [{
        eligible: true,
        testType: TestType.CAR,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      },
      {
        eligible: true,
        testType: TestType.MOTORCYCLE,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      },
      {
        eligible: true,
        testType: TestType.LGVMC,
      },
      {
        eligible: true,
        testType: TestType.LGVHPT,
      },
      {
        eligible: true,
        testType: TestType.LGVCPC,
      },
      {
        eligible: true,
        testType: TestType.LGVCPCC,
      },
      {
        eligible: true,
        testType: TestType.PCVMC,
      },
      {
        eligible: true,
        testType: TestType.PCVHPT,
      },
      {
        eligible: true,
        testType: TestType.PCVCPC,
      },
      {
        eligible: true,
        testType: TestType.PCVCPCC,
      },
      {
        eligible: true,
        testType: TestType.TAXI,
      },
      ],
      email: 'test@kainos.com',
      telephone: '',
      address: {
        line1: '1 Some Street',
        line2: 'Some Town',
        line5: 'West Midlands',
        postcode: 'B1 2TT',
      },
      eligibleToBookOnline: true,
      behaviouralMarker: false,
      candidateId: '3b42d43c-aea2-eb11-b1ac-0022484166fa',
      licenceId: '5a42d43c-aea2-eb11-b1ac-0022484166fa',
      personReference: '123456789',
      ownerId: '3a0cbcb3-ae3e-eb11-bf6d-000d3a86a4bb',
    };

    this.currentBooking = {
      origin: Origin.CitizenPortal,
      testType: TestType.CAR,
      language: Language.ENGLISH,
      bsl: false,
      voiceover: Voiceover.NONE,
      centre: {
        name: 'Belfast',
        parentOrganisation: 'fde8157f-e156-ea11-a811-000d3a7f128d',
        status: 'ACTIVE',
        region: TCNRegion.C,
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
        accountId: 'fff5a7c8-937d-ea11-a811-00224801bc51',
        ftts_tcntestcentreid: '2',
      },
      dateTime: getFutureDate('month', 4).toISOString(),
      reservationId: '1111-2222-3333-4444-5555',
      bookingRef: 'A-000-000-001',
      bookingProductRef: 'A-000-000-001-01',
      bookingId: '1115e591-75ca-ea11-a812-00224801cecd',
      bookingProductId: '1115e591-75ca-ea11-a812-00224801cecd',
      receiptReference: '123-456-789',
      salesReference: '',
      lastRefundDate: '',
      translator: '',
      customSupport: '',
      preferredDay: '',
      preferredLocation: '',
      selectSupportType: [],
      voicemail: false,
      governmentAgency: Target.NI,
      priceList: {
        testType: TestType.CAR,
        price: 23,
        product: {
          productId: 'da490f3e-2605-4c03-9d28-f935cf9ace5c',
          parentId: '27b76390-bd4e-4759-9e57-48492665cf1f',
          name: 'Car test',
        },
      },
    };

    this.priceLists = [
      {
        testType: TestType.CAR,
        price: 23,
        product: {
          productId: 'da490f3e-2605-4c03-9d28-f935cf9ace5c',
          parentId: '27b76390-bd4e-4759-9e57-48492665cf1f',
          name: 'Car test',
        },
      },
      {
        testType: TestType.MOTORCYCLE,
        price: 23,
        product: {
          name: 'motorcycle',
          productId: '123',
          parentId: '321',
        },
      },
      {
        testType: TestType.LGVMC,
        price: 23,
        product: {
          name: 'lgvmc',
          productId: '123',
          parentId: '321',
        },
      },
      {
        testType: TestType.LGVHPT,
        price: 23,
        product: {
          name: 'lgvhpt',
          productId: '123',
          parentId: '321',
        },
      },
      {
        testType: TestType.LGVCPC,
        price: 23,
        product: {
          name: 'lgvcpc',
          productId: '123',
          parentId: '321',
        },
      },
      {
        testType: TestType.LGVCPCC,
        price: 23,
        product: {
          name: 'lgvcpcc',
          productId: '123',
          parentId: '321',
        },
      },
      {
        testType: TestType.PCVMC,
        price: 23,
        product: {
          name: 'pcvmc',
          productId: '123',
          parentId: '321',
        },
      },
      {
        testType: TestType.PCVHPT,
        price: 23,
        product: {
          name: 'pcvhpt',
          productId: '123',
          parentId: '321',
        },
      },
      {
        testType: TestType.PCVCPC,
        price: 23,
        product: {
          name: 'pcvcpc',
          productId: '123',
          parentId: '321',
        },
      },
      {
        testType: TestType.PCVCPCC,
        price: 23,
        product: {
          name: 'pcvcpcc',
          productId: '123',
          parentId: '321',
        },
      },
      {
        testType: TestType.TAXI,
        price: 12,
        product: {
          name: 'taxi',
          productId: '123',
          parentId: '321',
        },
      },
    ];

    this.testCentreSearch = {
      searchQuery: 'Belfast',
      zeroCentreResults: false,
      selectedDate: getFutureDate('month', 4).toISOString(),
    };
  }

  initialiseNiBookingNsa(locale: Locale): void {
    this.journey = {
      support: true,
      inEditMode: false,
      inManagedBookingEditMode: false,
      managedBookingRescheduleChoice: '',
      standardAccommodation: false,
      confirmingSupport: false,
      receivedSupportRequestPageFlag: false,
      shownStandardSupportPageFlag: false,
      shownVoiceoverPageFlag: true,
    };
    this.testDateLessThan3Days = false;
    this.hasComeFromNsaJourney = true;
    this.changeSupport = false;
    this.changeSupportTypes = false;
    this.locale = locale;
    this.target = Target.NI;
    this.init = true;
    this.skipSupportRequest = false;
    this.overrideCreatedOnDate = true;
    this.candidate = {
      title: 'Mr',
      firstnames: 'TesterNi',
      surname: 'TesterNi',
      gender: ELIG.CandidateDetails.GenderEnum.M,
      licenceNumber: this.getRandomDrivingLicence(),
      dateOfBirth: dob,
      eligibilities: [{
        eligible: true,
        testType: TestType.CAR,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      },
      {
        eligible: true,
        testType: TestType.MOTORCYCLE,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      },
      {
        eligible: true,
        testType: TestType.LGVMC,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      },
      {
        eligible: true,
        testType: TestType.LGVHPT,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      },
      {
        eligible: true,
        testType: TestType.LGVCPC,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      },
      {
        eligible: true,
        testType: TestType.LGVCPCC,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      },
      {
        eligible: true,
        testType: TestType.PCVMC,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      },
      {
        eligible: true,
        testType: TestType.PCVHPT,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      },
      {
        eligible: true,
        testType: TestType.PCVCPC,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      },
      {
        eligible: true,
        testType: TestType.PCVCPCC,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      },
      {
        eligible: true,
        testType: TestType.TAXI,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      },
      ],
      email: 'test@kainos.com',
      telephone: '07777777777',
      address: {
        line1: '1 Some Street',
        line2: 'Some Town',
        line5: 'West Midlands',
        postcode: 'B1 2TT',
      },
      eligibleToBookOnline: true,
      behaviouralMarker: false,
      candidateId: '3b42d43c-aea2-eb11-b1ac-0022484166fa',
      licenceId: '5a42d43c-aea2-eb11-b1ac-0022484166fa',
      personReference: '123456789',
      ownerId: '3a0cbcb3-ae3e-eb11-bf6d-000d3a86a4bb',
    };

    this.currentBooking = {
      origin: Origin.CitizenPortal,
      testType: TestType.CAR,
      language: Language.ENGLISH,
      bsl: false,
      voiceover: Voiceover.TURKISH,
      centre: {
        name: '',
        parentOrganisation: '',
        status: '',
        region: undefined,
        state: '',
        siteId: '',
        description: '',
        accessible: '',
        fullyAccessible: false,
        addressLine1: '',
        addressLine2: '',
        addressCity: '',
        addressCounty: '',
        addressPostalCode: '',
        addressCountryRegion: '',
        latitude: undefined,
        longitude: undefined,
        distance: undefined,
        providerId: '',
        testCentreId: '',
        remit: undefined,
        accountId: '',
      },
      dateTime: undefined,
      reservationId: '',
      bookingRef: '',
      bookingProductRef: '',
      bookingId: '',
      bookingProductId: '',
      receiptReference: '',
      salesReference: '',
      lastRefundDate: '',
      translator: 'Translator required for Turkish',
      customSupport: 'I require the following custom support...',
      preferredDayOption: PreferredDay.ParticularDay,
      preferredDay: 'I only want to have tests on Mondays',
      preferredLocationOption: PreferredLocation.ParticularLocation,
      preferredLocation: 'I only want to have tests in the City Centre',
      selectSupportType: [SupportType.VOICEOVER, SupportType.TRANSLATOR, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER],
      voicemail: true,
      governmentAgency: Target.NI,
      priceList: undefined,
    };

    this.testCentreSearch = {
      searchQuery: '',
      zeroCentreResults: false,
      selectedDate: getFutureDate('month', 4).toISOString(),
    };
  }

  initialiseGbBooking(locale: Locale): void {
    this.journey = {
      support: false,
      inEditMode: false,
      inManagedBookingEditMode: false,
      managedBookingRescheduleChoice: '',
      standardAccommodation: true,
      confirmingSupport: false,
      receivedSupportRequestPageFlag: false,
      shownStandardSupportPageFlag: true,
      shownVoiceoverPageFlag: true,
    };
    this.paymentDetails = testPayment;
    this.testDateLessThan3Days = false;
    this.hasComeFromNsaJourney = false;
    this.changeSupport = false;
    this.changeSupportTypes = false;
    this.locale = locale;
    this.target = Target.GB;
    this.init = true;
    this.candidate = {
      title: 'Mr',
      firstnames: 'Tester',
      surname: 'Tester',
      gender: ELIG.CandidateDetails.GenderEnum.M,
      licenceNumber: this.getRandomDrivingLicence(),
      dateOfBirth: dob,
      eligibilities: [{
        eligible: true,
        testType: TestType.CAR,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      },
      {
        eligible: true,
        testType: TestType.MOTORCYCLE,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      },
      {
        eligible: true,
        testType: TestType.LGVMC,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      },
      {
        eligible: true,
        testType: TestType.LGVHPT,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      },
      {
        eligible: true,
        testType: TestType.LGVCPC,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      },
      {
        eligible: true,
        testType: TestType.PCVMC,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      },
      {
        eligible: true,
        testType: TestType.PCVHPT,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      },
      {
        eligible: true,
        testType: TestType.PCVCPC,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      },
      ],
      email: 'test@kainos.com',
      telephone: '',
      address: {
        line1: '1 Some Street',
        line2: 'Some Town',
        line5: 'West Midlands',
        postcode: 'B1 2TT',
      },
      eligibleToBookOnline: true,
      behaviouralMarker: false,
      candidateId: '8d54a5a3-f624-ec11-b6e6-000d3ad657c5',
      licenceId: '9e91ec6e-1425-ec11-b6e6-000d3ad657c5',
      personReference: '123456789',
      ownerId: '3a0cbcb3-ae3e-eb11-bf6d-000d3a86a4bb',
    };

    this.currentBooking = {
      origin: Origin.CitizenPortal,
      testType: TestType.CAR,
      language: Language.ENGLISH,
      bsl: false,
      voiceover: Voiceover.NONE,
      centre: {
        name: 'Birmingham',
        parentOrganisation: 'c5a24e76-1c5d-ea11-a811-000d3a7f128d',
        status: 'ACTIVE',
        region: TCNRegion.A,
        state: 'gb',
        siteId: 'SITE-0135',
        description: 'Birmingham Theory Test Centre',
        accessible: 'Disabled access',
        fullyAccessible: false,
        addressLine1: '38 Dale End',
        addressLine2: '',
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
        accountId: '03f6a7c8-937d-ea11-a811-00224801bc51',
        ftts_tcntestcentreid: '1',
      },
      dateTime: getFutureDate('month', 4).toISOString(),
      reservationId: '1111-2222-3333-4444-5555',
      bookingRef: 'A-000-000-001',
      bookingProductRef: 'A-000-000-001-01',
      bookingId: '1115e591-75ca-ea11-a812-00224801cecd',
      bookingProductId: '1115e591-75ca-ea11-a812-00224801cecd',
      receiptReference: '123-456-789',
      salesReference: '',
      lastRefundDate: '',
      translator: '',
      customSupport: '',
      preferredDay: '',
      preferredLocation: '',
      selectSupportType: [],
      voicemail: false,
      governmentAgency: Target.GB,
      priceList: {
        testType: TestType.CAR,
        price: 23,
        product: {
          productId: 'da490f3e-2605-4c03-9d28-f935cf9ace5c',
          parentId: '27b76390-bd4e-4759-9e57-48492665cf1f',
          name: 'Car test',
        },
      },
    };

    this.priceLists = [
      {
        testType: TestType.CAR,
        price: 23,
        product: {
          productId: 'da490f3e-2605-4c03-9d28-f935cf9ace5c',
          parentId: '27b76390-bd4e-4759-9e57-48492665cf1f',
          name: 'Car test',
        },
      },
      {
        testType: TestType.MOTORCYCLE,
        price: 23,
        product: {
          name: 'motorcycle',
          productId: '123',
          parentId: '321',
        },
      },
      {
        testType: TestType.LGVMC,
        price: 23,
        product: {
          name: 'lgvmc',
          productId: '123',
          parentId: '321',
        },
      },
      {
        testType: TestType.LGVHPT,
        price: 23,
        product: {
          name: 'lgvhpt',
          productId: '123',
          parentId: '321',
        },
      },
      {
        testType: TestType.LGVCPC,
        price: 23,
        product: {
          name: 'lgvcpc',
          productId: '123',
          parentId: '321',
        },
      },
      {
        testType: TestType.PCVMC,
        price: 23,
        product: {
          name: 'pcvmc',
          productId: '123',
          parentId: '321',
        },
      },
      {
        testType: TestType.PCVHPT,
        price: 23,
        product: {
          name: 'pcvhpt',
          productId: '123',
          parentId: '321',
        },
      },
      {
        testType: TestType.PCVCPC,
        price: 23,
        product: {
          name: 'pcvcpc',
          productId: '123',
          parentId: '321',
        },
      },
    ];

    this.testCentreSearch = {
      searchQuery: 'Alpha Tower, Birmingham B1 1TT',
      zeroCentreResults: false,
      selectedDate: getFutureDate('month', 4).toISOString(),
    };
  }

  initialiseGbBookingNsa(locale: Locale): void {
    this.journey = {
      support: true,
      inEditMode: false,
      inManagedBookingEditMode: false,
      managedBookingRescheduleChoice: '',
      standardAccommodation: false,
      confirmingSupport: false,
      receivedSupportRequestPageFlag: false,
      shownStandardSupportPageFlag: false,
      shownVoiceoverPageFlag: true,
    };
    this.testDateLessThan3Days = false;
    this.hasComeFromNsaJourney = true;
    this.changeSupport = false;
    this.changeSupportTypes = false;
    this.locale = locale;
    this.target = Target.GB;
    this.init = true;
    this.skipSupportRequest = false;
    this.overrideCreatedOnDate = true;
    this.candidate = {
      title: 'Mr',
      firstnames: 'Tester',
      surname: 'Tester',
      gender: ELIG.CandidateDetails.GenderEnum.M,
      licenceNumber: this.getRandomDrivingLicence(),
      dateOfBirth: dob,
      eligibilities: [{
        eligible: true,
        testType: TestType.CAR,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      },
      {
        eligible: true,
        testType: TestType.MOTORCYCLE,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      }],
      email: 'test@kainos.com',
      telephone: '07777777777',
      address: {
        line1: '1 Some Street',
        line2: 'Some Town',
        line5: 'West Midlands',
        postcode: 'B1 2TT',
      },
      eligibleToBookOnline: true,
      behaviouralMarker: false,
      candidateId: '8d54a5a3-f624-ec11-b6e6-000d3ad657c5',
      licenceId: '9e91ec6e-1425-ec11-b6e6-000d3ad657c5',
      personReference: '123456789',
      ownerId: '3a0cbcb3-ae3e-eb11-bf6d-000d3a86a4bb',
    };

    this.currentBooking = {
      origin: Origin.CitizenPortal,
      testType: TestType.CAR,
      language: Language.ENGLISH,
      bsl: false,
      voiceover: Voiceover.ENGLISH,
      centre: {
        name: '',
        parentOrganisation: '',
        status: '',
        region: undefined,
        state: '',
        siteId: '',
        description: '',
        accessible: '',
        fullyAccessible: false,
        addressLine1: '',
        addressLine2: '',
        addressCity: '',
        addressCounty: '',
        addressPostalCode: '',
        addressCountryRegion: '',
        latitude: undefined,
        longitude: undefined,
        distance: undefined,
        providerId: '',
        testCentreId: '',
        remit: undefined,
        accountId: '',
      },
      dateTime: undefined,
      reservationId: '',
      bookingRef: '',
      bookingProductRef: '',
      bookingId: '',
      bookingProductId: '',
      receiptReference: '',
      salesReference: '',
      lastRefundDate: '',
      translator: '',
      customSupport: 'I require the following custom support...',
      preferredDayOption: PreferredDay.ParticularDay,
      preferredDay: 'I only want to have tests on Mondays',
      preferredLocationOption: PreferredLocation.ParticularLocation,
      preferredLocation: 'I only want to have tests in the City Centre',
      selectSupportType: [SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER],
      voicemail: true,
      governmentAgency: Target.GB,
      priceList: undefined,
    };

    this.testCentreSearch = {
      searchQuery: '',
      zeroCentreResults: false,
      selectedDate: getFutureDate('month', 4).toISOString(),
    };
  }
}
