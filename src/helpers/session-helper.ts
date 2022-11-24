import dayjs from 'dayjs';
import { Request } from 'express';
import config from '../config';
import { Booking as BookingEntity } from '../domain/booking/booking';
import { Language, Target } from '../domain/enums';
import { TestLanguage } from '../domain/test-language';
import { TestVoiceover } from '../domain/test-voiceover';
import { Centre } from '../domain/types';
import { CRMAdditionalSupport, CRMGovernmentAgency, CRMProductNumber } from '../services/crm-gateway/enums';
import { BookingDetailsCentre } from '../services/crm-gateway/interfaces';
import { fromCRMOrigin, fromCRMProductNumber } from '../services/crm-gateway/maps';
import { Booking } from '../services/session';
import { getErrorPageLink } from './links';

export function mapBookingEntityToSessionBooking(bookingEntity: BookingEntity): Booking {
  return {
    bookingId: bookingEntity.details.bookingId,
    bookingProductId: bookingEntity.details.bookingProductId,
    bookingRef: bookingEntity.details.reference,
    bookingProductRef: bookingEntity.details.bookingProductRef,
    bsl: bookingEntity.details.additionalSupport === CRMAdditionalSupport.BritishSignLanguage,
    centre: mapCentreEntityToSessionCentre(bookingEntity.details.testCentre) as Centre,
    dateTime: bookingEntity.details.testDate as string,
    language: TestLanguage.fromCRMTestLanguage(bookingEntity.details.testLanguage).key() as Language,
    salesReference: bookingEntity.details.salesReference as string,
    receiptReference: '',
    voiceover: TestVoiceover.fromCRMVoiceover(bookingEntity.details.voiceoverLanguage),
    lastRefundDate: bookingEntity.details.testDateMinus3ClearWorkingDays as string,
    reservationId: '',
    translator: undefined,
    customSupport: bookingEntity.details.customSupport,
    selectSupportType: [],
    voicemail: false, // TODO - Fix when we do manage booking for additional support
    preferredDay: bookingEntity.details.preferredDay || '',
    preferredDayOption: bookingEntity.details.preferredDayOption,
    preferredLocation: bookingEntity.details.preferredLocation || '',
    preferredLocationOption: bookingEntity.details.preferredLocationOption,
    governmentAgency: bookingEntity.details.governmentAgency === CRMGovernmentAgency.Dva ? Target.NI : Target.GB,
    testType: fromCRMProductNumber(bookingEntity.details.product?.productnumber as CRMProductNumber),
    origin: fromCRMOrigin(bookingEntity.details.origin),
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

type SessionInfo = {
  notificationDelay: number;
  expiryDelay: number;
};

export function getSessionExpiryInfo(req: Request): SessionInfo | undefined {
  if (req?.session?.cookie?.expires) {
    const now = dayjs().tz();
    const expiryDateDayjs = now.add(config.sessionTtlSessionDuration, 'seconds');
    const expiryDateNotificationDayjs = expiryDateDayjs.subtract(config.sessionTimeoutWarningMinutes, 'minutes');
    const notificationDelay = expiryDateNotificationDayjs.diff(now, 'seconds');
    const expiryDelay = expiryDateDayjs.diff(now, 'seconds');

    return {
      notificationDelay,
      expiryDelay,
    };
  }

  return undefined;
}

export const isCandidateSet = (req: Request): boolean => !!(req.session.candidate?.candidateId);

export function getTimeoutErrorPath(req: Request): string {
  return getErrorPageLink('/timeout', req);
}
