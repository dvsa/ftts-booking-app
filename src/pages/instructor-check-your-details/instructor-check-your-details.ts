import { Request, Response } from 'express';
import { PageNames } from '@constants';
import {
  Voiceover, Target, SupportType, PreferredDay, PreferredLocation, Locale,
} from '../../domain/enums';
import { notificationsGateway, NotificationsGateway } from '../../services/notifications/notifications-gateway';
import { logger } from '../../helpers/logger';
import { EmailContent, SupportRequestDetails } from '../../services/notifications/types';
import {
  buildEvidenceMayBeRequiredEmailContent, buildEvidenceNotRequiredEmailContent, buildEvidenceRequiredEmailContent, buildReturningCandidateEmailContent,
} from '../../services/notifications/content/builders';
import { BookingHandler } from '../../helpers/booking-handler';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';
import { TestVoiceover } from '../../domain/test-voiceover';
import { TestLanguage } from '../../domain/test-language';
import { CrmCreateBookingDataError } from '../../domain/errors/crm/CrmCreateBookingDataError';
import { getErrorPageLink } from '../../helpers/links';
import { determineEvidenceRoute } from '../../helpers/evidence-helper';
import { hasCRMSupportNeeds } from '../../services/crm-gateway/crm-helper';
import { Candidate } from '../../services/session';

export interface ViewData {
  telephoneNumber: string | false | undefined;
  voicemail: boolean;
  supportTypes: SupportType[];
  translator: string | undefined;
  supportDetails: string | undefined;
  preferredDayOption: PreferredDay | undefined;
  preferredDay: string | undefined;
  preferredLocationOption: PreferredLocation | undefined;
  preferredLocation: string | undefined;
  backLink: string;
}

export class InstructorCheckYourDetailsController {
  constructor(
    private notifications: NotificationsGateway,
    private crmGateway: CRMGateway,
  ) { }

  public get = (req: Request, res: Response): void => {
    req.session.journey = {
      ...req.session.journey,
      inEditMode: true,
    };

    this.renderPage(req, res);
  };

  public post = async (req: Request, res: Response): Promise<void> => {
    if (!req.session.currentBooking) {
      throw Error('InstructorCheckYourDetailsController::renderPage: No currentBooking set');
    }
    const target = req.session.target || Target.GB;
    const lang = req.session.locale || Locale.GB;
    const emailAddress = req.session.candidate?.email;

    req.session.currentBooking = {
      ...req.session.currentBooking,
      governmentAgency: target,
    };
    req.session.journey = {
      ...req.session.journey,
      inEditMode: false,
    };

    try {
      const handler = new BookingHandler(this.crmGateway, req);
      await handler.createBooking();
    } catch (error) {
      logger.error(error, 'InstructorCheckYourDetailsController::post: Error creating booking entity in CRM');
      if (error instanceof CrmCreateBookingDataError) {
        return res.redirect(getErrorPageLink('/error-technical', req));
      }
      if (error.status === 429 || (error.status >= 500 && error.status < 600)) {
        // If we have error codes that relate to a retryable state.
        // Send them to an error page that allows user to redirect back to retry the request.
        return res.render(PageNames.CHECK_YOUR_DETAILS_ERROR);
      }
      throw error; // Throw the error, stopping them from retrying.
    }

    const booking = req.session.currentBooking;

    if (!booking.bookingRef || !booking.testType || !booking.language) {
      logger.error(Error('InstructorCheckYourDetailsController::post::Booking details not set correctly'), 'Error: Could not send support email', {
        bookingId: booking.bookingId,
        bookingRef: booking.bookingRef,
        testType: booking.testType,
        language: booking.language,
      });
      return res.redirect('/instructor/booking-confirmation');
    }

    const emailDetails: SupportRequestDetails = {
      reference: booking.bookingRef,
      testType: booking.testType,
      testLanguage: booking.language,
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
    };
    const emailContent = this.buildCorrespondingSupportRequestEmailContent(emailDetails, target, lang, req.session.candidate as Candidate);
    try {
      await this.notifications.sendEmail(emailAddress || '', emailContent, booking?.bookingRef || '', target);
    } catch (error) {
      logger.error(error, 'Error: Could not send support request email', {
        bookingId: booking.bookingId,
      });
    }

    return res.redirect('/instructor/booking-confirmation');
  };

  private renderPage(req: Request, res: Response): void {
    if (!req.session.currentBooking) {
      throw Error('InstructorCheckYourDetailsController::renderPage: No currentBooking set');
    }
    const { candidate } = req.session;
    const target = req.session.target || Target.GB;
    const booking = req.session.currentBooking;
    if (!candidate || !booking || !booking.testType) {
      throw Error('InstructorCheckYourDetailsController::renderPage: Missing required candidate/booking session data');
    }

    const personalDetailsViewData = {
      firstNames: candidate.firstnames,
      surname: candidate.surname,
      dateOfBirth: candidate.dateOfBirth,
      licenceNumber: candidate.licenceNumber,
      telephoneNumber: candidate.telephone,
      voicemail: booking.voicemail,
      emailAddress: candidate.email,
    };

    const testDetailsViewData = {
      testType: booking.testType,
      testLanguage: booking.language,
      canChangeTestLanguage: TestLanguage.canChangeTestLanguage(req.session.target || Target.GB, booking.testType),
    };

    const supportTypes = booking.selectSupportType || [];
    const supportDetailsViewData = {
      supportTypes,
      showVoiceoverRow: supportTypes.includes(SupportType.VOICEOVER),
      voiceover: booking.voiceover === Voiceover.NONE ? undefined : booking.voiceover,
      canChangeVoiceover: TestVoiceover.availableOptions(target, booking.testType).length > 1,
      showTranslatorRow: supportTypes.includes(SupportType.TRANSLATOR),
      translator: booking.translator || undefined,
      showCustomSupportRow: supportTypes.includes(SupportType.OTHER),
      customSupport: booking.customSupport,
      preferredDayOption: booking.preferredDayOption,
      preferredDay: booking.preferredDayOption === PreferredDay.ParticularDay ? booking.preferredDay : undefined,
      preferredLocationOption: booking.preferredLocationOption,
      preferredLocation: booking.preferredLocationOption === PreferredLocation.ParticularLocation ? booking.preferredLocation : undefined,
    };

    return res.render(PageNames.INSTRUCTOR_CHECK_YOUR_DETAILS, {
      ...personalDetailsViewData,
      ...testDetailsViewData,
      ...supportDetailsViewData,
      backLink: this.getBackLink(req),
    });
  }

  private getBackLink(req: Request): string {
    if (!req.session.currentBooking) {
      throw Error('InstructorCheckYourDetailsController::getBackLink: No currentBooking set');
    }
    const { voicemail } = req.session.currentBooking;
    return voicemail !== undefined ? 'voicemail' : 'telephone-contact';
  }

  private buildCorrespondingSupportRequestEmailContent(details: SupportRequestDetails, target: Target, lang: Locale, candidate: Candidate): EmailContent {
    const hasSupportNeedsInCRM = hasCRMSupportNeeds(candidate);
    const evidencePath = determineEvidenceRoute(details.supportTypes, hasSupportNeedsInCRM);

    switch (evidencePath) {
      case PageNames.EVIDENCE_REQUIRED: return buildEvidenceRequiredEmailContent(details, target, lang);
      case PageNames.EVIDENCE_NOT_REQUIRED: return buildEvidenceNotRequiredEmailContent(details, target, lang);
      case PageNames.EVIDENCE_MAY_BE_REQUIRED: return buildEvidenceMayBeRequiredEmailContent(details, target, lang);
      case PageNames.RETURNING_CANDIDATE: return buildReturningCandidateEmailContent(details, target, lang);
      default: throw Error(`CheckYourDetailsController::buildCorrespondingSupportRequestEmailContent: No corresponding email content found for ${evidencePath}`);
    }
  }
}

export default new InstructorCheckYourDetailsController(
  notificationsGateway,
  CRMGateway.getInstance(),
);
