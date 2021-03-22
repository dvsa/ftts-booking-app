import { EMAIL_TYPE } from '../types';
import { LOCALE } from '../../../domain/enums';

import gbBookingConfirmationEmail from './email/booking-confirmation/gb';
import cyBookingConfirmationEmail from './email/booking-confirmation/cy';
import niBookingConfirmationEmail from './email/booking-confirmation/ni';

import gbBookingCancellationEmail from './email/booking-cancellation/gb';
import cyBookingCancellationEmail from './email/booking-cancellation/cy';
import niBookingCancellationEmail from './email/booking-cancellation/ni';

import gbBookingRescheduledEmail from './email/booking-rescheduled/gb';
import cyBookingRescheduledEmail from './email/booking-rescheduled/cy';
import niBookingRescheduledEmail from './email/booking-rescheduled/ni';

export default {
  email: {
    [EMAIL_TYPE.BOOKING_CONFIRMATION]: {
      [LOCALE.GB]: {
        subject: gbBookingConfirmationEmail.subject,
        buildBody: gbBookingConfirmationEmail.buildBody,
      },
      [LOCALE.CY]: {
        subject: cyBookingConfirmationEmail.subject,
        buildBody: cyBookingConfirmationEmail.buildBody,
      },
      [LOCALE.NI]: {
        subject: niBookingConfirmationEmail.subject,
        buildBody: niBookingConfirmationEmail.buildBody,
      },
    },
    [EMAIL_TYPE.BOOKING_CANCELLATION]: {
      [LOCALE.GB]: {
        subject: gbBookingCancellationEmail.subject,
        buildBody: gbBookingCancellationEmail.buildBody,
      },
      [LOCALE.CY]: {
        subject: cyBookingCancellationEmail.subject,
        buildBody: cyBookingCancellationEmail.buildBody,
      },
      [LOCALE.NI]: {
        subject: niBookingCancellationEmail.subject,
        buildBody: niBookingCancellationEmail.buildBody,
      },
    },
    [EMAIL_TYPE.BOOKING_RESCHEDULED]: {
      [LOCALE.GB]: {
        subject: gbBookingRescheduledEmail.subject,
        buildBody: gbBookingRescheduledEmail.buildBody,
      },
      [LOCALE.CY]: {
        subject: cyBookingRescheduledEmail.subject,
        buildBody: cyBookingRescheduledEmail.buildBody,
      },
      [LOCALE.NI]: {
        subject: niBookingRescheduledEmail.subject,
        buildBody: niBookingRescheduledEmail.buildBody,
      },
    },
  },
};
