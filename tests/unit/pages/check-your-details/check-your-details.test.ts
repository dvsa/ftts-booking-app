import { CheckYourDetailsController } from '@pages/check-your-details/check-your-details';
import { PageNames } from '@constants';
import {
  Language, TestType, Voiceover, SupportType, Target, PreferredDay, PreferredLocation,
} from '../../../../src/domain/enums';
import { NotificationsGateway } from '../../../../src/services/notifications/notifications-gateway';
import { logger } from '../../../../src/helpers/logger';
import { CRMGateway } from '../../../../src/services/crm-gateway/crm-gateway';
import { BookingHandler } from '../../../../src/helpers/booking-handler';
import { CrmCreateBookingDataError } from '../../../../src/domain/errors/crm/CrmCreateBookingDataError';
import * as CRM_HELPER from '../../../../src/services/crm-gateway/crm-helper';

jest.mock('../../../../src/helpers/language', () => ({
  ...jest.requireActual('../../../../src/helpers/language'),
  translate: (key: string): string | undefined => {
    if (key === 'generalContent.no') {
      return 'No';
    }
    if (key === 'generalContent.yes') {
      return 'Yes';
    }
    if (key === 'generalContent.language.english') {
      return 'English';
    }
    if (key === 'checkYourAnswers.supportDetails.addedNoDetails') {
      return 'You added no details';
    }
    if (key === 'checkYourAnswers.supportDetails.particularDay') {
      return 'Particular day';
    }
    if (key === 'checkYourAnswers.supportDetails.particularLocation') {
      return 'Particular location';
    }
    return undefined;
  },
}));
const mockEmailContentEvidenceRequired = { subject: 'subject', body: 'body evidence required' };
const mockEmailContentEvidenceNotRequired = { subject: 'subject', body: 'body evidence not required' };
const mockEmailContentEvidenceMayBeRequired = { subject: 'subject', body: 'body evidence may be required' };
const mockEmailContentReturningCandidate = { subject: 'subject', body: 'body returning candidate' };
jest.mock('../../../../src/services/notifications/content/builders', () => ({
  buildEvidenceRequiredEmailContent: () => mockEmailContentEvidenceRequired,
  buildEvidenceNotRequiredEmailContent: () => mockEmailContentEvidenceNotRequired,
  buildEvidenceMayBeRequiredEmailContent: () => mockEmailContentEvidenceMayBeRequired,
  buildReturningCandidateEmailContent: () => mockEmailContentReturningCandidate,
}));
const mockPersonReference = '123456789';

describe('Check Your Details controller', () => {
  let res: any;
  let req: any;
  let checkYourDetails: CheckYourDetailsController;

  const notifications = NotificationsGateway.prototype;
  const crmGateway = CRMGateway.prototype;
  const bookingHandler = BookingHandler.prototype;

  const mockTarget = Target.GB;
  const mockEmail = 'test@test.com';

  beforeEach(() => {
    req = {
      session: {
        target: mockTarget,
        candidate: {
          firstnames: 'Test',
          surname: 'User',
          licenceNumber: 'JONES061102W97YT',
          dateOfBirth: '1990-01-01',
          email: mockEmail,
          telephone: '123 456 7890',
          candidateId: '18A2673A-ADFB-4B97-B471-DD87EAB635BB',
          personReference: mockPersonReference,
        },
        currentBooking: {
          bookingRef: 'REF00001',
          testType: TestType.CAR,
          language: Language.ENGLISH,
          dateTime: '1997-07-16T19:20Z',
          support: true,
          voiceover: Voiceover.NONE,
          voicemail: false,
          selectSupportType: [SupportType.OTHER, SupportType.EXTRA_TIME],
          translator: '',
          customSupport: 'Lorum Ipsum Dolor Amet',
          preferredDayOption: PreferredDay.ParticularDay,
          preferredDay: 'Lorum Ipsum Dolor Amet',
          preferredLocationOption: PreferredLocation.DecideLater,
        },
        journey: {
          support: true,
          standardAccommodation: true,
        },
      },
    };

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    };

    notifications.sendEmail = jest.fn();
    bookingHandler.createBooking = jest.fn();

    checkYourDetails = new CheckYourDetailsController(
      notifications,
      crmGateway,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET request', () => {
    test('renders check-your-details page', () => {
      checkYourDetails.get(req, res);

      // Support mode is turned on
      expect(req.session.journey.support).toBe(true);

      expect(res.render).toHaveBeenCalledWith(PageNames.CHECK_YOUR_DETAILS,
        {
          firstNames: 'Test',
          surname: 'User',
          dateOfBirth: '1990-01-01',
          licenceNumber: 'JONES061102W97YT',
          emailAddress: 'test@test.com',
          telephoneNumber: req.session.candidate.telephone,
          voicemail: false,
          testType: TestType.CAR,
          testLanguage: Language.ENGLISH,
          canChangeTestLanguage: true,
          supportTypes: [SupportType.OTHER, SupportType.EXTRA_TIME],
          showVoiceoverRow: false,
          voiceover: undefined,
          canChangeVoiceover: true,
          showTranslatorRow: false,
          translator: undefined,
          showCustomSupportRow: true,
          customSupport: req.session.currentBooking.customSupport,
          preferredDayOption: req.session.currentBooking.preferredDayOption,
          preferredDay: req.session.currentBooking.preferredDay,
          preferredLocationOption: req.session.currentBooking.preferredLocationOption,
          preferredLocation: undefined,
          backLink: '/nsa/voicemail',
        });
    });

    test('DVA context presents translator option', () => {
      req.session.target = Target.NI;
      req.session.currentBooking.selectSupportType = [SupportType.TRANSLATOR, SupportType.VOICEOVER];
      req.session.currentBooking.translator = 'French';
      req.session.currentBooking.voiceover = Voiceover.ENGLISH;

      checkYourDetails.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.CHECK_YOUR_DETAILS, expect.objectContaining({
        showTranslatorRow: true,
        translator: 'French',
      }));
    });

    test('handles undefined voiceover', () => {
      req.session.currentBooking.selectSupportType = [SupportType.VOICEOVER];
      req.session.currentBooking.voiceover = undefined;

      checkYourDetails.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.CHECK_YOUR_DETAILS, expect.objectContaining(
        {
          canChangeVoiceover: true,
          voiceover: undefined,
        },
      ));
    });

    test('handles NONE voiceover', () => {
      req.session.currentBooking.selectSupportType = [SupportType.VOICEOVER];
      req.session.currentBooking.voiceover = Voiceover.NONE;

      checkYourDetails.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.CHECK_YOUR_DETAILS, expect.objectContaining(
        {
          canChangeVoiceover: true,
          voiceover: undefined,
        },
      ));
    });
  });

  describe('POST request', () => {
    test.each([
      [SupportType.EXTRA_TIME, mockEmailContentEvidenceRequired],
      [SupportType.BSL_INTERPRETER, mockEmailContentEvidenceNotRequired],
      [SupportType.OTHER, mockEmailContentEvidenceMayBeRequired],
    ])('calls notification API to send a support request confirmation email. Support type: %, email content: %', async (supportType: SupportType, expectedEmailContent: { subject: string, body: string }) => {
      jest.spyOn(CRM_HELPER, 'hasCRMSupportNeeds').mockReturnValue(false);
      req.session.currentBooking.selectSupportType = supportType;
      await checkYourDetails.post(req, res);

      expect(notifications.sendEmail).toHaveBeenCalledWith(mockEmail, expectedEmailContent, req.session.currentBooking.bookingRef, mockTarget);
    });

    test('handles email for returning candidate', async () => {
      jest.spyOn(CRM_HELPER, 'hasCRMSupportNeeds').mockReturnValue(true);
      req.session.currentBooking.selectSupportType = [SupportType.VOICEOVER];

      await checkYourDetails.post(req, res);

      expect(notifications.sendEmail).toHaveBeenCalledWith(mockEmail, mockEmailContentReturningCandidate, req.session.currentBooking.bookingRef, Target.GB);
    });

    test('handles DVA context including translator option', async () => {
      jest.spyOn(CRM_HELPER, 'hasCRMSupportNeeds').mockReturnValue(false);
      req.session.target = Target.NI;
      req.session.currentBooking.selectSupportType = [SupportType.TRANSLATOR, SupportType.VOICEOVER];
      req.session.currentBooking.translator = 'French';
      req.session.currentBooking.voiceover = Voiceover.FARSI;

      await checkYourDetails.post(req, res);

      expect(notifications.sendEmail).toHaveBeenCalledWith(mockEmail, mockEmailContentEvidenceNotRequired, req.session.currentBooking.bookingRef, Target.NI);
    });

    test('logs and swallows any error from calling notification API', async () => {
      notifications.sendEmail = jest.fn().mockRejectedValueOnce(new Error('ntf api failed'));

      await expect(checkYourDetails.post(req, res)).resolves.toBeUndefined();
      expect(logger.error).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(Error('ntf api failed'), 'CheckYourDetailsController::post: Could not send support request email', {
        bookingRef: req.session.currentBooking.bookingRef,
        candidateId: req.session.candidate.candidateId,
      });
    });

    test('renders the custom error page when the user is able to retry the request', async () => {
      const error = {
        message: 'booking creation failed',
        status: 500,
      };

      bookingHandler.createBooking = jest.fn().mockRejectedValueOnce(error);

      await checkYourDetails.post(req, res);
      expect(res.render).toHaveBeenCalledWith(PageNames.CHECK_YOUR_DETAILS_ERROR);
      expect(logger.error).toHaveBeenCalledWith({ message: 'booking creation failed', status: 500 }, 'CheckYourDetailsController::post: Error creating booking entity in CRM', {
        candidateId: req.session.candidate.candidateId,
      });
    });

    test('throws a fatal error when the user is not able to retry the request', async () => {
      const error = {
        message: 'booking creation failed',
        status: 400,
      };

      bookingHandler.createBooking = jest.fn().mockRejectedValueOnce(error);

      await expect(checkYourDetails.post(req, res)).rejects.toBe(error);
      expect(logger.error).toHaveBeenCalledWith({ message: 'booking creation failed', status: 400 }, 'CheckYourDetailsController::post: Error creating booking entity in CRM', {
        candidateId: req.session.candidate.candidateId,
      });
    });

    test('redirects to technical error page when CrmCreateBookingDataError', async () => {
      const error = new CrmCreateBookingDataError('CRMGateway::validateBookingAndRetryIfNeeded: crm returned data from different booking');

      bookingHandler.createBooking = jest.fn().mockRejectedValueOnce(error);

      await checkYourDetails.post(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/error-technical?source=/&target=gb&lang=gb');
      expect(logger.error).toHaveBeenCalledWith(error, 'CheckYourDetailsController::post: Error creating booking entity in CRM', {
        candidateId: req.session.candidate.candidateId,
      });
    });

    test('redirects to the booking confirmation page', async () => {
      await checkYourDetails.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/booking-confirmation');
    });

    test('continues to booking confirmation when email fails', async () => {
      req.session.currentBooking.bookingRef = undefined;

      await checkYourDetails.post(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/booking-confirmation');
    });
  });
});
