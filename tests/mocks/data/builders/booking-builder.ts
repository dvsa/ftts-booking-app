import { build } from '@jackfranklin/test-data-bot';
import { faker } from '@faker-js/faker';
import { Booking } from '../../../../src/services/session';
import {
  Language, PreferredDay, PreferredLocation, SupportType, Target, Voiceover,
} from '../../../../src/domain/enums';
import { bookingDetailsCentreBuilder, centreBuilder, crmTestCentreBuilder } from './centre-builder';
import {
  crmTestSupportNeed, eligibleTestTypes, originTypes, supportTypes,
} from './types';
import { eligibilityBuilder } from './eligibility-builder';
import { pricelistBuilder } from './pricelist-builder';
import { compensationBookingBuilder } from './compensation-builder';
import { BookingDetails, CRMBookingDetails } from '../../../../src/services/crm-gateway/interfaces';
import {
  CRMAdditionalSupport, CRMBookingStatus, CRMFinanceTransactionStatus, CRMGovernmentAgency, CRMNsaStatus, CRMOrigin, CRMPaymentStatus, CRMTestLanguage, CRMTransactionType, CRMVoiceOver,
} from '../../../../src/services/crm-gateway/enums';
import { toCRMProductNumber } from '../../../../src/services/crm-gateway/maps';
import { nsaBookingSlotsBuilder } from './nsabookingslots-builder';

export const bookingBuilder = (isNsaBooking = false): Booking => {
  const testType = faker.helpers.arrayElement(eligibleTestTypes);
  const nsaBookingOverrides = {
    customSupport: faker.lorem.lines(2),
    preferredDay: faker.lorem.lines(2),
    preferredDayOption: PreferredDay.ParticularDay,
    preferredLocation: faker.lorem.lines(2),
    preferredLocationOption: PreferredLocation.ParticularLocation,
    selectSupportType: faker.helpers.arrayElements(supportTypes),
  };
  const overrides = {
    ...(isNsaBooking ? nsaBookingOverrides : undefined),
  };
  return build<Booking>({
    fields: {
      bookingId: faker.datatype.uuid(),
      bookingProductId: faker.datatype.uuid(),
      bookingRef: faker.helpers.replaceSymbols('B-###-###-###'),
      bookingProductRef: faker.helpers.replaceSymbols('B-###-###-###-01'),
      bsl: faker.datatype.boolean(),
      centre: centreBuilder(),
      customSupport: undefined,
      dateTime: faker.date.future().toISOString().split('T')[0], // iso-8601 date-time
      firstSelectedDate: faker.date.future().toISOString().split('T')[0], // iso-8601 date-time
      firstSelectedCentre: centreBuilder(),
      governmentAgency: Target.GB,
      language: Language.ENGLISH,
      lastRefundDate: undefined,
      preferredDay: undefined,
      preferredDayOption: undefined,
      preferredLocation: undefined,
      preferredLocationOption: undefined,
      receiptReference: faker.random.alphaNumeric(10),
      reservationId: faker.datatype.uuid(),
      salesReference: faker.random.alphaNumeric(10),
      selectSupportType: undefined,
      selectStandardSupportType: SupportType.ON_SCREEN_BSL,
      testType,
      translator: isNsaBooking ? faker.lorem.lines(1) : undefined,
      voicemail: false,
      voiceover: Voiceover.NONE,
      priceList: pricelistBuilder(),
      compensationBooking: compensationBookingBuilder(),
      eligibility: eligibilityBuilder(testType),
      origin: faker.helpers.arrayElement(originTypes),
      dateAvailableOnOrAfterToday: undefined,
      dateAvailableOnOrBeforePreferredDate: undefined,
      dateAvailableOnOrAfterPreferredDate: undefined,
      hasSupportNeedsInCRM: false,
      paymentId: faker.datatype.uuid(),
    },
  })({
    overrides,
  });
};

export const bookingDetailsBuilder = (isNsaBooking = false, crmBookingStatus?: CRMBookingStatus): BookingDetails => {
  const testType = faker.helpers.arrayElement(eligibleTestTypes);
  const nsaBookingOverrides = {
    nonStandardAccommodation: true,
    additionalSupport: CRMAdditionalSupport.VoiceoverEnglish,
    nsaStatus: CRMNsaStatus.AwaitingCscResponse,
    customSupport: faker.lorem.lines(2),
    preferredDay: faker.lorem.lines(2),
    preferredDayOption: PreferredDay.ParticularDay,
    preferredLocation: faker.lorem.lines(2),
    preferredLocationOption: PreferredLocation.ParticularLocation,
    testSupportNeed: faker.helpers.arrayElements(crmTestSupportNeed),
    foreignLanguageSelected: faker.lorem.lines(2),
  };
  const bookingStatusOverride = {
    bookingStatus: crmBookingStatus,
    testDate: crmBookingStatus === CRMBookingStatus.Draft && isNsaBooking ? undefined : faker.date.future().toISOString().split('T')[0],
    salesReference: crmBookingStatus === CRMBookingStatus.Draft && isNsaBooking ? undefined : faker.random.alpha(),
  };
  const overrides = {
    ...(crmBookingStatus ? bookingStatusOverride : undefined),
    ...(isNsaBooking ? nsaBookingOverrides : undefined),
  };
  return build<BookingDetails>({
    fields: {
      bookingProductId: faker.datatype.uuid(),
      reference: faker.helpers.replaceSymbols('B-###-###-###'),
      bookingProductRef: faker.helpers.replaceSymbols('B-###-###-###-01'),
      bookingId: faker.datatype.uuid(),
      bookingStatus: CRMBookingStatus.Confirmed,
      testDate: faker.date.future().toISOString().split('T')[0],
      testDateMinus3ClearWorkingDays: faker.helpers.arrayElement(['Yes', 'No']),
      testLanguage: CRMTestLanguage.English,
      voiceoverLanguage: CRMVoiceOver.English,
      additionalSupport: CRMAdditionalSupport.None,
      nonStandardAccommodation: false,
      nsaStatus: null,
      paymentId: faker.datatype.uuid(),
      paymentStatus: CRMPaymentStatus.Success,
      price: faker.datatype.number({ min: 25, max: 50 }),
      salesReference: faker.random.alpha(),
      origin: CRMOrigin.CitizenPortal,
      testCentre: bookingDetailsCentreBuilder(),
      accountId: faker.datatype.uuid(),
      financeTransaction: {
        financeTransactionId: faker.datatype.uuid(),
        transactionType: CRMTransactionType.Booking,
        transactionStatus: CRMFinanceTransactionStatus.Recognised,
      },
      customSupport: undefined,
      preferredDay: undefined,
      preferredDayOption: undefined,
      preferredLocation: undefined,
      preferredLocationOption: undefined,
      governmentAgency: CRMGovernmentAgency.Dvsa,
      product: {
        productid: faker.datatype.uuid(),
        _parentproductid_value: faker.datatype.uuid(),
        name: testType.toString().toUpperCase(),
        productnumber: toCRMProductNumber(testType),
      },
      createdOn: faker.date.past().toISOString().split('T')[0],
      enableEligibilityBypass: false,
      compensationAssigned: '',
      compensationRecognised: '',
      owedCompensationBooking: false,
      isZeroCostBooking: false,
      testSupportNeed: null,
      foreignlanguageselected: null,
      voicemailmessagespermitted: faker.datatype.boolean(),
      nsaBookingSlots: Array(3).fill(nsaBookingSlotsBuilder()),
    },
  })({
    overrides,
  });
};

export const crmBookingIdBuilder = (isNsaBooking = false, isInstructor = false): CRMBookingDetails['ftts_bookingid'] => {
  const nsaBookingOverrides = {
    ftts_nonstandardaccommodation: true,
    ftts_nsastatus: CRMNsaStatus.AwaitingCscResponse,
    ftts_testsupportneed: faker.datatype.json(),
    ftts_foreignlanguageselected: faker.lorem.lines(2),
    ftts_nivoiceoveroptions: CRMVoiceOver.English,
  };

  const instructorOverrides = {
    ftts_zerocostbooking: true,
  };

  const overrides = {
    ...(isNsaBooking ? nsaBookingOverrides : undefined),
    ...(isInstructor ? instructorOverrides : undefined),
  };

  return build<CRMBookingDetails['ftts_bookingid']>({
    fields: {
      ftts_governmentagency: CRMGovernmentAgency.Dvsa,
      ftts_reference: faker.helpers.replaceSymbols('B-###-###-###'),
      ftts_origin: CRMOrigin.CitizenPortal,
      ftts_testcentre: crmTestCentreBuilder(),
      ftts_enableeligibilitybypass: null,
      ftts_nonstandardaccommodation: false,
      ftts_nsastatus: null,
      ftts_owedcompbookingassigned: null,
      ftts_owedcompbookingrecognised: null,
      ftts_zerocostbooking: null,
      ftts_testsupportneed: null,
      ftts_foreignlanguageselected: null,
      ftts_voicemailmessagespermitted: true,
      ftts_nivoiceoveroptions: null,
    },
  })({
    overrides,
  });
};

export const crmBookingDetailsBuilder = (isNsaBooking = false, isInstructor = false, crmBookingStatus?: CRMBookingStatus): CRMBookingDetails => {
  const testType = faker.helpers.arrayElement(eligibleTestTypes);

  const nsaBookingOverrides = {
    ftts_nsabookingslots: Array(3).fill(nsaBookingSlotsBuilder()),
    ftts_voiceoverlanguage: undefined,
  };

  const instructorOverrides = {
    ftts_zerocostbooking: true,
  };

  const bookingStatusOverride = {
    ftts_bookingstatus: crmBookingStatus,
    ftts_testdate: crmBookingStatus === CRMBookingStatus.Draft && isNsaBooking ? undefined : faker.date.future().toISOString().split('T')[0],
    ftts_salesreference: crmBookingStatus === CRMBookingStatus.Draft && isNsaBooking ? undefined : faker.random.alpha(),
  };

  const overrides = {
    ...(crmBookingStatus ? bookingStatusOverride : undefined),
    ...(isNsaBooking ? nsaBookingOverrides : undefined),
    ...(isInstructor ? instructorOverrides : undefined),
    ...(crmBookingStatus ? bookingStatusOverride : undefined),
  };

  return build<CRMBookingDetails>({
    fields: {
      ftts_bookingproductid: faker.datatype.uuid(),
      ftts_reference: faker.helpers.replaceSymbols('B-###-###-###'),
      _ftts_bookingid_value: faker.datatype.uuid(),
      ftts_price: Number(faker.random.numeric()),
      ftts_bookingstatus: CRMBookingStatus.Confirmed,
      ftts_testdate: faker.date.future().toISOString().split('T')[0],
      ftts_testlanguage: CRMTestLanguage.English,
      ftts_voiceoverlanguage: CRMVoiceOver.English,
      ftts_paymentstatus: CRMPaymentStatus.Success,
      ftts_salesreference: faker.random.alpha(),
      ftts_additionalsupportoptions: CRMAdditionalSupport.BritishSignLanguage,
      ftts_bookingid: crmBookingIdBuilder(isNsaBooking, isInstructor),
      ftts_nsabookingslots: null,
      ftts_productid: {
        productid: faker.datatype.uuid(),
        _parentproductid_value: faker.datatype.uuid(),
        name: testType.toString().toUpperCase(),
        productnumber: toCRMProductNumber(testType),
      },
      createdon: faker.date.past().toISOString().split('T')[0],
    },
  })({
    overrides,
  });
};
