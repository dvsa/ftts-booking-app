import MockDate from 'mockdate';
import { BookingDetailsCentre } from '../../../src/services/crm-gateway/interfaces';
import { mapBookingEntityToSessionBooking, mapCentreEntityToSessionCentre, mapSessionCentreToCentreEntity } from '../../../src/helpers/session-helper';
import {
  LANGUAGE, PreferredDay, PreferredLocation, TCNRegion, TestType,
} from '../../../src/domain/enums';
import { TestVoiceover } from '../../../src/domain/test-voiceover';

describe('Session Helper', () => {
  beforeEach(() => {
    MockDate.set('2020-11-11T14:30:45.979Z');
  });

  afterEach(() => {
    MockDate.reset();
  });

  test('maps booking entity to session booking', () => {
    const bookingEntity = {
      details: {
        bookingProductId: 'testBookingProductId',
        reference: 'B-000-053-359',
        bookingId: 'testBookingId',
        bookingStatus: 675030001,
        testDate: '2020-12-08T09:45:00.000Z',
        testLanguage: 1,
        voiceoverLanguage: 675030020,
        additionalSupport: null,
        customSupport: 'bookingEntityCustomSupport',
        preferredDay: 'bookingEntityPreferredDay',
        preferredDayOption: PreferredDay.ParticularDay,
        preferredLocation: 'bookingEntityPreferredLocation',
        preferredLocationOption: PreferredLocation.ParticularLocation,
        paymentStatus: null,
        price: 23,
        salesReference: null,
        testType: TestType.Car,
        origin: 1,
        testCentre: {
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
        testDateMinus3ClearWorkingDays: '2020-12-04',
      },
      testIsToday: () => false,
    };
    const expectedSessionBooking = {
      bookingId: 'testBookingId',
      bookingProductId: 'testBookingProductId',
      bookingRef: 'B-000-053-359',
      bsl: false,
      testType: TestType.Car,
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
      language: LANGUAGE.ENGLISH,
      otherSupport: false,
      salesReference: null,
      selectSupportType: undefined,
      receiptReference: '',
      customSupport: 'bookingEntityCustomSupport',
      preferredDay: 'bookingEntityPreferredDay',
      preferredDayOption: PreferredDay.ParticularDay,
      preferredLocation: 'bookingEntityPreferredLocation',
      preferredLocationOption: PreferredLocation.ParticularLocation,
      voiceover: TestVoiceover.fromCRMVoiceover(bookingEntity.details.voiceoverLanguage),
      lastRefundDate: '2020-12-04',
      reservationId: '',
      translator: '',
      voicemail: false,
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
      remit: 675030000,
      region: TCNRegion.B,
      siteId: 'mockSiteId',
    };
    const expectedCentre = {
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
    };

    const mappedCentre = mapCentreEntityToSessionCentre(centreEntity);

    expect(mappedCentre).toStrictEqual(expectedCentre);
  });

  test('maps session test centre to centre entity', () => {
    const expectedCentre: BookingDetailsCentre = {
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
    };
    const sessionCentre = {
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
    };

    const mappedCentre = mapSessionCentreToCentreEntity(sessionCentre);

    expect(mappedCentre).toStrictEqual(expectedCentre);
  });
});
