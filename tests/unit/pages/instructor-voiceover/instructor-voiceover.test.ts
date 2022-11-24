import { Request, Response } from 'express';
import { VoiceoverBody, InstructorVoiceoverController } from '@pages/instructor-voiceover/instructor-voiceover';
import { PageNames } from '@constants';
import { Target, TestType, Voiceover } from '../../../../src/domain/enums';
import { RequestValidationError } from '../../../../src/middleware/request-validator';
import { MockSession } from '../../../mocks/data/session';

jest.mock('../../../../src/helpers/language', () => ({
  translate: () => 'translated',
}));

describe('InstructorVoiceoverController', () => {
  let req: Request;
  let res: Response;
  let session: Partial<MockSession>;
  let voiceoverController: InstructorVoiceoverController;

  beforeEach(() => {
    req = {
      hasErrors: false,
      errors: [],
      path: '/instructor/nsa/change-voiceover',
      body: {
        voiceover: Voiceover.NONE,
      } as VoiceoverBody,
      session: {
        journey: {
          inEditMode: false,
          inManagedBookingEditMode: false,
          support: false,
          standardAccommodation: false,
          receivedSupportRequestPageFlag: false,
        },
        currentBooking: {
          bookingRef: 'mock-booking-ref',
          voiceover: Voiceover.ENGLISH,
          testType: TestType.CAR,
        },
        manageBookingEdits: {},
      } as MockSession,
    } as unknown as Request;

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        target: Target.GB,
      },
    } as unknown as Response;

    voiceoverController = new InstructorVoiceoverController();
    session = req.session as Partial<MockSession>;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {
    describe('Managed Booking Edit Mode', () => {
      test('renders the page in GB manage booking mode', () => {
        session.journey.inManagedBookingEditMode = true;
        session.currentBooking.voiceover = Voiceover.WELSH;
        session.manageBookingEdits.bsl = true;

        voiceoverController.get(req, res);

        expect(session.manageBookingEdits).toBeUndefined();
        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_VOICEOVER, {
          radioItems: [
            {
              checked: false,
              text: 'translated translated',
              value: Voiceover.ENGLISH,
            },
            {
              checked: false,
              text: 'translated translated',
              value: Voiceover.WELSH,
            },
            {
              checked: false,
              text: 'translated',
              value: Voiceover.NONE,
            },
          ],
          bookingRef: 'mock-booking-ref',
          errors: [],
          inManagedBookingEditMode: true,
          isNonStandardJourney: false,
          backLink: 'select-support-type',
          receivedSupportRequestPageFlag: false,
          isERSTestType: false,
        });
      });

      test('missing journey handled', () => {
        session.currentBooking.voiceover = Voiceover.WELSH;
        session.manageBookingEdits.bsl = true;
        delete req.session.journey;

        expect(() => voiceoverController.get(req, res))
          .toThrow(Error('InstructorVoiceoverController::get: No journey set'));
      });

      test('missing booking handled', () => {
        session.currentBooking.voiceover = Voiceover.WELSH;
        session.manageBookingEdits.bsl = true;
        delete req.session.currentBooking;

        expect(() => voiceoverController.get(req, res))
          .toThrow(Error('InstructorVoiceoverController::renderPage: No Current Booking object found in session'));
      });
    });
    describe('Edit Mode', () => {
      test('renders the page in GB edit mode with chosen language', () => {
        session.currentBooking.voiceover = Voiceover.WELSH;
        session.journey.inEditMode = true;
        session.journey.shownVoiceoverPageFlag = true;

        voiceoverController.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_VOICEOVER, {
          radioItems: [
            {
              checked: false,
              text: 'translated translated',
              value: Voiceover.ENGLISH,
            },
            {
              checked: true,
              text: 'translated translated',
              value: Voiceover.WELSH,
            },
            {
              checked: false,
              text: 'translated',
              value: Voiceover.NONE,
            },
          ],
          bookingRef: 'mock-booking-ref',
          errors: [],
          inManagedBookingEditMode: false,
          isNonStandardJourney: false,
          backLink: 'check-your-answers',
          receivedSupportRequestPageFlag: false,
          isERSTestType: false,
        });
      });

      test('renders page in GB edit mode with a default value of none if voiceover is undefined', () => {
        session.currentBooking.voiceover = undefined;
        session.journey.inEditMode = true;

        voiceoverController.get(req, res);
        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_VOICEOVER, {
          radioItems: [
            {
              checked: false,
              text: 'translated translated',
              value: Voiceover.ENGLISH,
            },
            {
              checked: false,
              text: 'translated translated',
              value: Voiceover.WELSH,
            },
            {
              checked: false,
              text: 'translated',
              value: Voiceover.NONE,
            },
          ],
          bookingRef: 'mock-booking-ref',
          errors: [],
          inManagedBookingEditMode: false,
          isNonStandardJourney: false,
          backLink: 'check-your-answers',
          receivedSupportRequestPageFlag: false,
          isERSTestType: false,
        });
      });
    });

    describe('Support Mode', () => {
      test('renders the page in GB support mode, preselecting chosen option', () => {
        session.currentBooking.voiceover = Voiceover.ENGLISH;
        session.journey.support = true;
        session.journey.shownVoiceoverPageFlag = true;

        voiceoverController.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_VOICEOVER, {
          radioItems: [
            {
              checked: true,
              text: 'translated',
              value: Voiceover.ENGLISH,
            },
            {
              checked: false,
              text: 'translated',
              value: Voiceover.WELSH,
            },
          ],
          bookingRef: 'mock-booking-ref',
          errors: [],
          inManagedBookingEditMode: false,
          isNonStandardJourney: true,
          backLink: 'select-support-type',
          receivedSupportRequestPageFlag: false,
          isERSTestType: false,
        });
      });
    });

    describe('ReceivedSupportPageFlag is set', () => {
      test('renders the page in GB manage booking mode', () => {
        req.session.journey.receivedSupportRequestPageFlag = true;
        req.session.journey.shownStandardSupportPageFlag = true;
        session.journey.inManagedBookingEditMode = true;
        session.currentBooking.voiceover = Voiceover.WELSH;
        session.manageBookingEdits.bsl = true;

        voiceoverController.get(req as unknown as Request, res);

        expect(session.manageBookingEdits).toBeUndefined();
        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_VOICEOVER, {
          radioItems: [
            {
              checked: false,
              text: 'translated translated',
              value: Voiceover.ENGLISH,
            },
            {
              checked: false,
              text: 'translated translated',
              value: Voiceover.WELSH,
            },
            {
              checked: false,
              text: 'translated',
              value: Voiceover.NONE,
            },
          ],
          bookingRef: 'mock-booking-ref',
          errors: [],
          inManagedBookingEditMode: true,
          isNonStandardJourney: false,
          backLink: 'select-standard-support',
          receivedSupportRequestPageFlag: true,
          isERSTestType: false,
        });
      });
    });
  });

  describe('POST', () => {
    describe('Managed Booking Edit Mode', () => {
      test('handles post and redirects to check-change in Manged Edit Mode', () => {
        req.body.voiceover = Voiceover.NONE;
        session.journey.inManagedBookingEditMode = true;

        voiceoverController.post(req, res);

        expect(res.redirect).toHaveBeenCalledWith('check-change');
      });
    });
    describe('Edit Mode', () => {
      test('handles post and redirects to check your answers in Edit Mode', () => {
        session.journey.inEditMode = true;
        req.body.voiceover = Voiceover.ENGLISH;

        voiceoverController.post(req, res);

        expect(session.currentBooking.voiceover).toBe(Voiceover.ENGLISH);
        expect(res.redirect).toHaveBeenCalledWith('check-your-answers');
      });
    });
    describe('Support Mode', () => {
      test('handles post and redirects to check your answers in Support Mode', () => {
        session.journey.support = true;
        req.body.voiceover = Voiceover.ENGLISH;

        voiceoverController.post(req, res);

        expect(session.currentBooking.voiceover).toBe(Voiceover.ENGLISH);
        expect(res.redirect).toHaveBeenCalledWith('leaving-nsa');
      });
    });
    describe('When receivedSupportRequestPageFlag is set', () => {
      test('when receivedSupportRequestPageFlag is true', () => {
        req.body.voiceover = Voiceover.NONE;
        req.session.journey.receivedSupportRequestPageFlag = true;
        voiceoverController.post(req as unknown as Request, res);

        expect(res.redirect).toHaveBeenCalledWith('find-test-centre');
      });

      test('when req.session.journey.receivedSupportRequestPageFlag is false', () => {
        req.body.voiceover = Voiceover.NONE;

        voiceoverController.post(req as unknown as Request, res);

        expect(res.redirect).toHaveBeenCalledWith('find-test-centre');
      });
    });
    describe('Error Handling', () => {
      let error: RequestValidationError;
      beforeEach(() => {
        error = {
          msg: 'error message',
          param: 'voiceover',
          location: 'body',
        };
        req.hasErrors = true;
        req.errors = [error];
      });

      test('renders same page with errors on bad request', () => {
        session.currentBooking.voiceover = undefined;

        voiceoverController.post(req, res);

        expect(res.render).toHaveBeenLastCalledWith(PageNames.INSTRUCTOR_VOICEOVER, {
          radioItems: [
            {
              checked: false,
              text: 'translated translated',
              value: Voiceover.ENGLISH,
            },
            {
              checked: false,
              text: 'translated translated',
              value: Voiceover.WELSH,
            },
            {
              checked: false,
              text: 'translated',
              value: Voiceover.NONE,
            },
          ],
          bookingRef: 'mock-booking-ref',
          errors: [error],
          inManagedBookingEditMode: false,
          isNonStandardJourney: false,
          backLink: 'select-support-type',
          receivedSupportRequestPageFlag: false,
          isERSTestType: false,
        });
      });

      test('missing journey handled', () => {
        delete req.session.journey;

        expect(() => voiceoverController.post(req, res))
          .toThrow(Error('InstructorVoiceoverController::post: No journey set'));
      });

      test('missing booking handled', () => {
        delete req.session.currentBooking;

        expect(() => voiceoverController.post(req, res))
          .toThrow(Error('InstructorVoiceoverController::renderPage: No Current Booking object found in session'));
      });
    });
  });
});
