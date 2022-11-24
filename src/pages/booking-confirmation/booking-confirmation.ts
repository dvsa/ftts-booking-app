import { Request, Response } from 'express';
import { PageNames } from '@constants';
import {
  PreferredDay,
  PreferredLocation,
  SupportType,
  Voiceover,
  YesNo,
} from '../../domain/enums';
import { bslIsAvailable } from '../../domain/bsl';
import { TestLanguage } from '../../domain/test-language';
import { isNonStandardJourney } from '../../helpers/journey-helper';
import { translate } from '../../helpers/language';
import { determineEvidenceRoute, isDeafCandidate } from '../../helpers/evidence-helper';
import { Candidate, store } from '../../services/session';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';
import { isCandidateSet } from '../../helpers/session-helper';
import { hasCRMSupportNeeds } from '../../services/crm-gateway/crm-helper';
import config from '../../config';

export class BookingConfirmation {
  constructor(
    private crm: CRMGateway,
  ) { }

  public get = (req: Request, res: Response): void => {
    if (!req.session.currentBooking) {
      throw Error('BookingConfirmation::get: No currentBooking set');
    }
    if (!isCandidateSet(req)) {
      throw Error('BookingConfirmation::get: No candidate set');
    }
    const {
      bookingRef, dateTime, centre, testType, lastRefundDate, language, bsl, voiceover, selectSupportType, preferredDay, preferredDayOption, preferredLocation, preferredLocationOption,
    } = req.session.currentBooking;
    const { digitalResultsEmailInfo } = config.featureToggles;

    const inSupportMode = isNonStandardJourney(req);
    const selectedSupportOptions = inSupportMode ? this.getSelectedSupportOptions(req) : [];
    const hasSupportNeedsInCRM = inSupportMode ? hasCRMSupportNeeds(req.session.candidate as Candidate) : false;
    const typeOfEvidenceRequired = inSupportMode ? determineEvidenceRoute(selectedSupportOptions, hasSupportNeedsInCRM) : undefined;

    store.reset(req, res);

    if (inSupportMode) {
      const preferDay = preferredDayOption === PreferredDay.DecideLater ? translate('bookingConfirmation.nonStandardAccommodation.iWillDecideThisLater') : preferredDay;
      const preferLocation = preferredLocationOption === PreferredLocation.DecideLater ? translate('bookingConfirmation.nonStandardAccommodation.iWillDecideThisLater') : preferredLocation;
      return res.render(this.getEvidenceViewPath(typeOfEvidenceRequired as PageNames), {
        bookingRef,
        inSupportMode,
        testType: translate(`generalContent.testTypes.${testType}`),
        language: TestLanguage.from(language).toString(),
        supportTypes: selectSupportType,
        preferDay,
        preferLocation,
        deafCandidate: isDeafCandidate(selectSupportType as SupportType[]),
      });
    }

    return res.render(PageNames.BOOKING_CONFIRMATION, {
      centre,
      bookingRef,
      testType,
      dateTime,
      latestRefundDate: lastRefundDate,
      language: TestLanguage.from(language).toString(),
      bslAvailable: bslIsAvailable(testType),
      bsl: bsl ? translate('generalContent.yes') : translate('generalContent.no'),
      voiceover: voiceover === Voiceover.NONE ? YesNo.NO : voiceover,
      inSupportMode, // needed for the flag in booking-confirmation-instructions
      digitalResultsEmailInfo, // DIGITAL_RESULTS_EMAIL_INFO feature flag
    });
  };

  private getSelectedSupportOptions(req: Request): SupportType[] {
    try {
      const supportTypes = req.session.currentBooking?.selectSupportType;
      if (Array.isArray(supportTypes) && supportTypes.length > 0) {
        return supportTypes;
      }
      throw Error();
    } catch (error) {
      throw new Error('BookingConfirmation::getSelectedSupportOptions: No support options provided');
    }
  }

  private getEvidenceViewPath(typeOfEvidenceRequired: PageNames): string {
    if (typeOfEvidenceRequired === PageNames.EVIDENCE_REQUIRED) {
      return PageNames.BOOKING_CONFIRMATION_EVIDENCE_REQUIRED;
    }
    if (typeOfEvidenceRequired === PageNames.EVIDENCE_NOT_REQUIRED) {
      return PageNames.BOOKING_CONFIRMATION_EVIDENCE_NOT_REQUIRED;
    }
    if (typeOfEvidenceRequired === PageNames.EVIDENCE_MAY_BE_REQUIRED) {
      return PageNames.BOOKING_CONFIRMATION_EVIDENCE_MAY_BE_REQUIRED;
    }
    return PageNames.BOOKING_CONFIRMATION_RETURNING_CANDIDATE;
  }
}

export default new BookingConfirmation(
  CRMGateway.getInstance(),
);
