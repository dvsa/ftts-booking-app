import MockDate from 'mockdate';
import { BookingDetailsCentre } from '../../../src/services/crm-gateway/interfaces';
import {
  getSessionExpiryInfo, getTimeoutErrorPath, isCandidateSet, mapBookingEntityToSessionBooking, mapCentreEntityToSessionCentre, mapSessionCentreToCentreEntity,
} from '../../../src/helpers/session-helper';
import {
  Language, Origin, PreferredDay, PreferredLocation, Target, TCNRegion, TestType,
} from '../../../src/domain/enums';
import { TestVoiceover } from '../../../src/domain/test-voiceover';
import {
  CRMBookingStatus, CRMGovernmentAgency, CRMOrigin, CRMProductNumber, CRMRemit, CRMTestLanguage, CRMVoiceOver,
} from '../../../src/services/crm-gateway/enums';
import { Booking } from '../../../src/domain/booking/booking';
import config from '../../../src/config';

describe('Session Helper', () => {
  beforeEach(() => {
    MockDate.set('2020-11-11T14:30:45.979Z');
    config.sessionTimeoutWarningMinutes = 5; // 5 mins
    config.sessionTtlSessionDuration = 1800; // 30 mins
  });

  afterEach(() => {
    MockDate.reset();
  });

  test('maps booking entity to session booking', () => {
    const bookingEntity: Partial<Booking> = {
      details: {
        bookingProductId: 'testBookingProductId',
        reference: 'B-000-053-359',
        bookingProductRef: 'B-000-053-359-01',
        bookingId: 'testBookingId',
        bookingStatus: CRMBookingStatus.Confirmed,
        testDate: '2020-12-08T09:45:00.000Z',
        testLanguage: CRMTestLanguage.English,
        voiceoverLanguage: CRMVoiceOver.None,
        additionalSupport: null,
        nonStandardAccommodation: false,
        createdOn: 'exampleDate',
        enableEligibilityBypass: false,
        customSupport: 'bookingEntityCustomSupport',
        preferredDay: 'bookingEntityPreferredDay',
        preferredDayOption: PreferredDay.ParticularDay,
        preferredLocation: 'bookingEntityPreferredLocation',
        preferredLocationOption: PreferredLocation.ParticularLocation,
        governmentAgency: CRMGovernmentAgency.Dvsa,
        paymentStatus: null,
        price: 23,
        salesReference: null,
        origin: CRMOrigin.CitizenPortal,
        testCentre: {
          testCentreId: 'SITE-0135',
          name: 'Birmingham',
          addressLine1: '38 Dale End',
          addressLine2: 'Test',
          addressCity: 'Birmingham',
          addressCounty: 'West Midlands',
          addressPostalCode: 'B4 7NJ',
          remit: CRMRemit.England,
          region: TCNRegion.B,
          siteId: 'mockSiteId',
          ftts_tcntestcentreid: 'mockTestCentreId',
        },
        testDateMinus3ClearWorkingDays: '2020-12-04',
        product: {
          productid: 'mockProductId',
          _parentproductid_value: 'mockParentProductId',
          productnumber: CRMProductNumber.CAR,
        },
      },
      testIsToday: () => false,
    };
    const expectedSessionBooking = {
      bookingId: 'testBookingId',
      bookingProductId: 'testBookingProductId',
      bookingRef: 'B-000-053-359',
      bookingProductRef: 'B-000-053-359-01',
      bsl: false,
      testType: TestType.CAR,
      centre: {
        testCentreId: 'SITE-0135',
        name: 'Birmingham',
        addressLine1: '38 Dale End',
        addressLine2: 'Test',
        addressCity: 'Birmingham',
        addressCounty: 'West Midlands',
        addressPostalCode: 'B4 7NJ',
        remit: 675030000,
        region: TCNRegion.B,
        siteId: 'mockSiteId',
      },
      dateTime: '2020-12-08T09:45:00.000Z',
      language: Language.ENGLISH,
      salesReference: null,
      selectSupportType: [],
      receiptReference: '',
      customSupport: 'bookingEntityCustomSupport',
      preferredDay: 'bookingEntityPreferredDay',
      preferredDayOption: PreferredDay.ParticularDay,
      preferredLocation: 'bookingEntityPreferredLocation',
      preferredLocationOption: PreferredLocation.ParticularLocation,
      governmentAgency: Target.GB,
      voiceover: TestVoiceover.fromCRMVoiceover(bookingEntity.details.voiceoverLanguage),
      lastRefundDate: '2020-12-04',
      reservationId: '',
      translator: undefined,
      voicemail: false,
      origin: Origin.CitizenPortal,
    };

    const mappedBooking = mapBookingEntityToSessionBooking(bookingEntity as any);

    expect(mappedBooking).toStrictEqual(expectedSessionBooking);
  });

  test('maps test centre entity to session test centre', () => {
    const centreEntity: BookingDetailsCentre = {
      testCentreId: 'SITE-0135',
      name: 'Birmingham',
      addressLine1: '38 Dale End',
      addressLine2: 'Test',
      addressCity: 'Birmingham',
      addressCounty: 'West Midlands',
      addressPostalCode: 'B4 7NJ',
      remit: CRMRemit.England,
      region: TCNRegion.B,
      siteId: 'mockSiteId',
      ftts_tcntestcentreid: 'mockTestCentreId',
    };
    const expectedCentre = {
      testCentreId: 'SITE-0135',
      name: 'Birmingham',
      addressLine1: '38 Dale End',
      addressLine2: 'Test',
      addressCity: 'Birmingham',
      addressCounty: 'West Midlands',
      addressPostalCode: 'B4 7NJ',
      remit: CRMRemit.England,
      region: TCNRegion.B,
      siteId: 'mockSiteId',
    };

    const mappedCentre = mapCentreEntityToSessionCentre(centreEntity);

    expect(mappedCentre).toStrictEqual(expectedCentre);
  });

  test('maps session test centre to centre entity', () => {
    const expectedCentre: Partial<BookingDetailsCentre> = {
      testCentreId: 'SITE-0135',
      name: 'Birmingham',
      addressLine1: '38 Dale End',
      addressLine2: 'Test',
      addressCity: 'Birmingham',
      addressCounty: 'West Midlands',
      addressPostalCode: 'B4 7NJ',
      remit: CRMRemit.England,
      region: TCNRegion.B,
      siteId: 'mockSiteId',
    };
    const sessionCentre = {
      testCentreId: 'SITE-0135',
      name: 'Birmingham',
      addressLine1: '38 Dale End',
      addressLine2: 'Test',
      addressCity: 'Birmingham',
      addressCounty: 'West Midlands',
      addressPostalCode: 'B4 7NJ',
      remit: CRMRemit.England,
      region: TCNRegion.B,
      siteId: 'mockSiteId',
    };

    const mappedCentre = mapSessionCentreToCentreEntity(sessionCentre);

    expect(mappedCentre).toStrictEqual(expectedCentre);
  });

  describe('get session expiry info for locals', () => {
    test('returns notification delay and expiry delay', () => {
      const thirtyMinsInSeconds = 30 * 60;
      const twentyFiveMinsInSeconds = 25 * 60;
      const req = {
        session: {
          cookie: {
            expires: '2020-11-11T15:00:45.979Z',
          },
        },
      };

      const sessionInfo = getSessionExpiryInfo(req);

      expect(sessionInfo).toStrictEqual({
        expiryDelay: thirtyMinsInSeconds,
        notificationDelay: twentyFiveMinsInSeconds,
      });
    });
  });

  describe('getTimeoutErrorPath - go to timeout page with option to go back to service they came from', () => {
    test('timeout page link', () => {
      const req = {
        originalUrl: '/choose-support',
      };
      expect(getTimeoutErrorPath(req)).toStrictEqual(expect.stringContaining('/timeout?source=/'));
    });

    test('timeout page link - manage booking', () => {
      const req = {
        originalUrl: '/manage-booking/home',
      };
      expect(getTimeoutErrorPath(req)).toStrictEqual(expect.stringContaining('/timeout?source=/manage-booking'));
    });

    test('timeout page link - instructor', () => {
      const req = {
        originalUrl: '/instructor/choose-support',
      };
      expect(getTimeoutErrorPath(req)).toStrictEqual(expect.stringContaining('/timeout?source=/instructor'));
    });
  });

  describe('isCandidateSet', () => {
    test('return true if candidate is set', () => {
      const req: any = {
        session: {
          candidate: {
            candidateId: 'candidateId',
          },
        },
      };
      expect(isCandidateSet(req)).toBe(true);
    });

    test('return false if candidate is not set', () => {
      const req: any = {
        session: {
        },
      };
      expect(isCandidateSet(req)).toBe(false);
    });

    test('return false if candidate is undefined', () => {
      const req: any = {
        session: {
          candidate: undefined,
        },
      };
      expect(isCandidateSet(req)).toBe(false);
    });

    test('return false if candidate is null', () => {
      const req: any = {
        session: {
          candidate: null,
        },
      };
      expect(isCandidateSet(req)).toBe(false);
    });

    test('return false if candidate is empty string', () => {
      const req: any = {
        session: {
          candidate: '',
        },
      };
      expect(isCandidateSet(req)).toBe(false);
    });
  });
});
