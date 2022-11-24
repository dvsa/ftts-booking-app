import { EmailType } from '../types';
import { Locale } from '../../../domain/enums';

import gbBookingConfirmationEmail from './email/booking-confirmation/gb';
import cyBookingConfirmationEmail from './email/booking-confirmation/cy';
import niBookingConfirmationEmail from './email/booking-confirmation/ni';

import gbBookingCancellationEmail from './email/booking-cancellation/gb';
import cyBookingCancellationEmail from './email/booking-cancellation/cy';
import niBookingCancellationEmail from './email/booking-cancellation/ni';

import gbBookingRescheduledEmail from './email/booking-rescheduled/gb';
import cyBookingRescheduledEmail from './email/booking-rescheduled/cy';
import niBookingRescheduledEmail from './email/booking-rescheduled/ni';

import gbEvidenceRequiredEmail from './email/evidence-required/gb';
import cyEvidenceRequiredEmail from './email/evidence-required/cy';
import niEvidenceRequiredEmail from './email/evidence-required/ni';

import gbEvidenceNotRequiredEmail from './email/evidence-not-required/gb';
import cyEvidenceNotRequiredEmail from './email/evidence-not-required/cy';
import niEvidenceNotRequiredEmail from './email/evidence-not-required/ni';

import gbEvidenceMayBeRequiredEmail from './email/evidence-may-be-required/gb';
import cyEvidenceMayBeRequiredEmail from './email/evidence-may-be-required/cy';
import niEvidenceMayBeRequiredEmail from './email/evidence-may-be-required/ni';

import gbReturningCandidateEmail from './email/returning-candidate/gb';
import cyReturningCandidateEmail from './email/returning-candidate/cy';
import niReturningCandidateEmail from './email/returning-candidate/ni';

import gbRefundRequestEmail from './email/refund-request/gb';
import cyRefundRequestEmail from './email/refund-request/cy';
import niRefundRequestEmail from './email/refund-request/ni';

export default {
  email: {
    [EmailType.BOOKING_CONFIRMATION]: {
      [Locale.GB]: gbBookingConfirmationEmail,
      [Locale.CY]: cyBookingConfirmationEmail,
      [Locale.NI]: niBookingConfirmationEmail,
    },
    [EmailType.BOOKING_CANCELLATION]: {
      [Locale.GB]: gbBookingCancellationEmail,
      [Locale.CY]: cyBookingCancellationEmail,
      [Locale.NI]: niBookingCancellationEmail,
    },
    [EmailType.BOOKING_RESCHEDULED]: {
      [Locale.GB]: gbBookingRescheduledEmail,
      [Locale.CY]: cyBookingRescheduledEmail,
      [Locale.NI]: niBookingRescheduledEmail,
    },
    [EmailType.EVIDENCE_REQUIRED]: {
      [Locale.GB]: gbEvidenceRequiredEmail,
      [Locale.CY]: cyEvidenceRequiredEmail,
      [Locale.NI]: niEvidenceRequiredEmail,
    },
    [EmailType.EVIDENCE_NOT_REQUIRED]: {
      [Locale.GB]: gbEvidenceNotRequiredEmail,
      [Locale.CY]: cyEvidenceNotRequiredEmail,
      [Locale.NI]: niEvidenceNotRequiredEmail,
    },
    [EmailType.EVIDENCE_MAY_BE_REQUIRED]: {
      [Locale.GB]: gbEvidenceMayBeRequiredEmail,
      [Locale.CY]: cyEvidenceMayBeRequiredEmail,
      [Locale.NI]: niEvidenceMayBeRequiredEmail,
    },
    [EmailType.RETURNING_CANDIDATE]: {
      [Locale.GB]: gbReturningCandidateEmail,
      [Locale.CY]: cyReturningCandidateEmail,
      [Locale.NI]: niReturningCandidateEmail,
    },
    [EmailType.REFUND_REQUEST]: {
      [Locale.GB]: gbRefundRequestEmail,
      [Locale.CY]: cyRefundRequestEmail,
      [Locale.NI]: niRefundRequestEmail,
    },
  },
};
