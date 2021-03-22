import { Booking as BookingEntity } from '../domain/booking/booking';
import { LANGUAGE } from '../domain/enums';
import { TestLanguage } from '../domain/test-language';
import { Centre } from '../domain/types';
import { TestVoiceover } from '../domain/test-voiceover';
import { CRMAdditionalSupport } from '../services/crm-gateway/enums';
import { BookingDetailsCentre } from '../services/crm-gateway/interfaces';
import { Booking } from '../services/session';

export function mapBookingEntityToSessionBooking(bookingEntity: BookingEntity): Booking {
  return {
    bookingId: bookingEntity.details.bookingId,
    bookingProductId: bookingEntity.details.bookingProductId,
    bookingRef: bookingEntity.details.reference,
    bsl: bookingEntity.details.additionalSupport === CRMAdditionalSupport.BritishSignLanguage,
    testType: bookingEntity.details.testType,
    centre: mapCentreEntityToSessionCentre(bookingEntity.details.testCentre) as Centre,
    dateTime: bookingEntity.details.testDate,
    language: TestLanguage.fromCRMTestLanguage(bookingEntity.details.testLanguage).key() as LANGUAGE,
    otherSupport: false, // TODO fill in other support options,
    salesReference: bookingEntity.details.salesReference,
    receiptReference: '',
    voiceover: TestVoiceover.fromCRMVoiceover(bookingEntity.details.voiceoverLanguage),
    lastRefundDate: bookingEntity.details.testDateMinus3ClearWorkingDays as string,
    reservationId: '',
    translator: '',
    customSupport: bookingEntity.details.customSupport || '',
    selectSupportType: undefined,
    voicemail: false, // TODO - Fix when we do manage booking for additional support
    preferredDay: bookingEntity.details.preferredDay || '',
    preferredDayOption: bookingEntity.details.preferredDayOption,
    preferredLocation: bookingEntity.details.preferredLocation || '',
    preferredLocationOption: bookingEntity.details.preferredLocationOption,
  };
}

export function mapCentreEntityToSessionCentre(centreEntity: BookingDetailsCentre): Partial<Centre> {
  return {
    testCentreId: centreEntity.testCentreId,
    name: centreEntity.name,
    addressLine1: centreEntity.addressLine1,
    addressLine2: centreEntity.addressLine2,
    addressCity: centreEntity.addressCity,
    addressCounty: centreEntity.addressCounty,
    addressPostalCode: centreEntity.addressPostalCode,
    remit: centreEntity.remit,
    region: centreEntity.region,
    siteId: centreEntity.siteId,
  };
}

export function mapSessionCentreToCentreEntity(centre: Partial<Centre>): Partial<BookingDetailsCentre> {
  return {
    testCentreId: centre.testCentreId,
    name: centre.name,
    addressLine1: centre.addressLine1,
    addressLine2: centre.addressLine2,
    addressCounty: centre.addressCounty,
    addressCity: centre.addressCity,
    addressPostalCode: centre.addressPostalCode,
    remit: centre.remit,
    region: centre.region,
    siteId: centre.siteId,
  };
}
