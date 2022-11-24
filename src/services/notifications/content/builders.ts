// Not passing user input so safe to ignore
/* eslint-disable security/detect-object-injection */
import content from '.';
import {
  Language, Locale, PreferredDay, PreferredLocation, SupportType, Target, TestType,
} from '../../../domain/enums';
import { Booking } from '../../session';
import {
  BookingCancellationDetails,
  BookingConfirmationDetails, BookingRescheduledDetails, EmailContent, EmailType, RefundRequestDetails, SupportRequestDetails,
} from '../types';

// Want to default to NI content if target is NI
// TODO Can remove this when target+lang are eventually linked
const toLocale = (target: Target, lang: Locale): Locale => (target === Target.NI ? Locale.NI : lang);

export const buildBookingConfirmationEmailContent = (details: BookingConfirmationDetails, target: Target, lang: Locale): EmailContent => {
  const locale = toLocale(target, lang);
  const { subject, buildBody } = content.email[EmailType.BOOKING_CONFIRMATION][locale];
  return {
    subject,
    body: buildBody(details),
  };
};

export const buildBookingCancellationEmailContent = (details: BookingCancellationDetails, target: Target, lang: Locale): EmailContent => {
  const locale = toLocale(target, lang);
  const { subject, buildBody } = content.email[EmailType.BOOKING_CANCELLATION][locale];
  return {
    subject,
    body: buildBody(details),
  };
};

export const buildBookingRescheduledEmailContent = (details: BookingRescheduledDetails, target: Target, lang: Locale): EmailContent => {
  const locale = toLocale(target, lang);
  const { subject, buildBody } = content.email[EmailType.BOOKING_RESCHEDULED][locale];
  return {
    subject,
    body: buildBody(details),
  };
};

export const buildEvidenceRequiredEmailContent = (details: SupportRequestDetails, target: Target, lang: Locale): EmailContent => {
  const locale = toLocale(target, lang);
  const { subject, buildBody } = content.email[EmailType.EVIDENCE_REQUIRED][locale];
  return {
    subject,
    body: buildBody(details),
  };
};

export const buildEvidenceNotRequiredEmailContent = (details: SupportRequestDetails, target: Target, lang: Locale): EmailContent => {
  const locale = toLocale(target, lang);
  const { subject, buildBody } = content.email[EmailType.EVIDENCE_NOT_REQUIRED][locale];
  return {
    subject,
    body: buildBody(details),
  };
};

export const buildEvidenceMayBeRequiredEmailContent = (details: SupportRequestDetails, target: Target, lang: Locale): EmailContent => {
  const locale = toLocale(target, lang);
  const { subject, buildBody } = content.email[EmailType.EVIDENCE_MAY_BE_REQUIRED][locale];
  return {
    subject,
    body: buildBody(details),
  };
};

export const buildReturningCandidateEmailContent = (details: SupportRequestDetails, target: Target, lang: Locale): EmailContent => {
  const locale = toLocale(target, lang);
  const { subject, buildBody } = content.email[EmailType.RETURNING_CANDIDATE][locale];
  return {
    subject,
    body: buildBody(details),
  };
};

export const buildRefundRequestEmailContent = (details: RefundRequestDetails, target: Target, lang: Locale): EmailContent => {
  const locale = toLocale(target, lang);
  const { subject, buildBody } = content.email[EmailType.REFUND_REQUEST][locale];
  return {
    subject,
    body: buildBody(details),
  };
};

export const buildSupportRequestDetails = (booking: Booking, target: Target): SupportRequestDetails => ({
  reference: booking.bookingRef as string,
  testType: booking.testType as TestType,
  testLanguage: booking.language as Language,
  supportTypes: booking?.selectSupportType || [],
  voiceover: booking?.selectSupportType?.includes(SupportType.VOICEOVER) ? booking?.voiceover : undefined,
  translator: target === Target.NI ? booking?.translator : undefined,
  customSupport: booking?.selectSupportType?.includes(SupportType.OTHER) ? booking?.customSupport : undefined,
  preferredDay: {
    option: booking?.preferredDayOption,
    text: booking?.preferredDayOption === PreferredDay.ParticularDay ? booking.preferredDay : undefined,
  },
  preferredLocation: {
    option: booking?.preferredLocationOption,
    text: booking?.preferredLocationOption === PreferredLocation.ParticularLocation ? booking.preferredLocation : undefined,
  },
});
