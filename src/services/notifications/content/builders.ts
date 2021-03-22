// Not passing user input so safe to ignore
/* eslint-disable security/detect-object-injection */
import content from '.';
import { LOCALE, TARGET } from '../../../domain/enums';
import {
  BookingCancellationDetails, BookingConfirmationDetails, BookingRescheduledDetails, EmailContent, EMAIL_TYPE,
} from '../types';

export const buildBookingConfirmationEmailContent = (details: BookingConfirmationDetails, target: TARGET, lang: LOCALE): EmailContent => {
  const locale = target === TARGET.NI ? LOCALE.NI : lang; // Want NI content if target is NI
  const { subject, buildBody } = content.email[EMAIL_TYPE.BOOKING_CONFIRMATION][locale];
  return {
    subject,
    body: buildBody(details),
  };
};

export const buildBookingCancellationEmailContent = (details: BookingCancellationDetails, target: TARGET, lang: LOCALE): EmailContent => {
  const locale = target === TARGET.NI ? LOCALE.NI : lang; // Want NI content if target is NI
  const { subject, buildBody } = content.email[EMAIL_TYPE.BOOKING_CANCELLATION][locale];
  return {
    subject,
    body: buildBody(details),
  };
};

export const buildBookingRescheduledEmailContent = (details: BookingRescheduledDetails, target: TARGET, lang: LOCALE): EmailContent => {
  const locale = target === TARGET.NI ? LOCALE.NI : lang; // Want NI content if target is NI
  const { subject, buildBody } = content.email[EMAIL_TYPE.BOOKING_RESCHEDULED][locale];
  return {
    subject,
    body: buildBody(details),
  };
};
