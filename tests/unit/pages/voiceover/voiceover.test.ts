import { Request, Response } from 'express';
import { VoiceoverBody, VoiceoverController } from '@pages/voiceover/voiceover';
import { PageNames } from '@constants';
import { Target, TestType, Voiceover } from '../../../../src/domain/enums';
import { RequestValidationError } from '../../../../src/middleware/request-validator';
import { MockRequest, MockSession } from '../../../mocks/data/session';

jest.mock('../../../../src/helpers/language', () => ({
  translate: () => 'translated',
}));

describe('VoiceoverController', () => {
  let req: MockRequest<VoiceoverBody>;
  let res: Response;
  let session: Partial<MockSession>;
  let voiceoverController: VoiceoverController;

  beforeEach(() => {
    req = {
      hasErrors: false,
      errors: [],
      path: '/nsa/change-voiceover',
      body: {
        voiceover: Voiceover.NONE,
      },
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
        candidate: {},
        editedLocationTime: {},
        manageBooking: {},
        testCentreSearch: {},
      },
    };

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        target: Target.GB,
      },
    } as unknown as Response;

    voiceoverController = new VoiceoverController();
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
        req.session.target = Target.GB;

        voiceoverController.get(req as unknown as Request, res);

        expect(session.manageBookingEdits).toBeUndefined();
        expect(res.render).toHaveBeenCalledWith(PageNames.VOICEOVER, {
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
          backLink: 'test-language', // In manage booking, the back link is actually the booking ref (handled in njk file)
          receivedSupportRequestPageFlag: false,
          isNonStandardJourney: false,
        });
      });

      test('missing journey handled', () => {
        session.currentBooking.voiceover = Voiceover.WELSH;
        session.manageBookingEdits.bsl = true;
        delete req.session.journey;

        expect(() => voiceoverController.get(req as unknown as Request, res))
          .toThrow(Error('VoiceoverController::get: No journey set'));
      });

      test('missing booking handled', () => {
        session.currentBooking.voiceover = Voiceover.WELSH;
        session.manageBookingEdits.bsl = true;
        delete req.session.currentBooking;

        expect(() => voiceoverController.get(req as unknown as Request, res))
          .toThrow(Error('VoiceoverController::renderPage: No Current Booking object found in session'));
      });
    });

    describe('Edit Mode', () => {
      test('renders the page in GB edit mode with chosen language', () => {
        session.currentBooking.voiceover = Voiceover.WELSH;
        session.journey.inEditMode = true;
        req.session.target = Target.GB;
        session.journey.shownVoiceoverPageFlag = true;

        voiceoverController.get(req as unknown as Request, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.VOICEOVER, {
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
          backLink: 'check-your-answers',
          receivedSupportRequestPageFlag: false,
          isNonStandardJourney: false,
        });
      });

      test('renders page in GB edit mode with a default value of none if voiceover is undefined', () => {
        session.currentBooking.voiceover = undefined;
        session.journey.inEditMode = true;
        req.session.target = Target.GB;

        voiceoverController.get(req as unknown as Request, res);
        expect(res.render).toHaveBeenCalledWith(PageNames.VOICEOVER, {
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
              // checked: true,
              checked: false,
              text: 'translated',
              value: Voiceover.NONE,
            },
          ],
          bookingRef: 'mock-booking-ref',
          errors: [],
          inManagedBookingEditMode: false,
          backLink: 'check-your-answers',
          receivedSupportRequestPageFlag: false,
          isNonStandardJourney: false,
        });
      });
    });

    describe('Support Mode', () => {
      test('renders the page in GB support mode, preselecting chosen option', () => {
        session.currentBooking.voiceover = Voiceover.ENGLISH;
        session.journey.support = true;
        session.journey.shownVoiceoverPageFlag = true;

        voiceoverController.get(req as unknown as Request, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.VOICEOVER, {
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
          backLink: 'select-support-type',
          receivedSupportRequestPageFlag: false,
          isNonStandardJourney: true,
        });
      });
    });
  });

  describe('POST', () => {
    describe('Managed Booking Edit Mode', () => {
      test('handles post and redirects to check-change in Manged Edit Mode', () => {
        req.body.voiceover = Voiceover.NONE;
        session.journey.inManagedBookingEditMode = true;

        voiceoverController.post(req as unknown as Request, res);

        expect(res.redirect).toHaveBeenCalledWith('check-change');
      });
    });
    describe('Edit Mode', () => {
      test('handles post and redirects to check your answers in Edit Mode', () => {
        session.journey.inEditMode = true;
        req.body.voiceover = Voiceover.ENGLISH;

        voiceoverController.post(req as unknown as Request, res);

        expect(session.currentBooking.voiceover).toBe(Voiceover.ENGLISH);
        expect(res.redirect).toHaveBeenCalledWith('check-your-answers');
      });
    });
    describe('Support Mode', () => {
      test('handles post and redirects to check your answers in Support Mode', () => {
        session.journey.support = true;
        req.body.voiceover = Voiceover.ENGLISH;

        voiceoverController.post(req as unknown as Request, res);

        expect(session.currentBooking.voiceover).toBe(Voiceover.ENGLISH);
        expect(res.redirect).toHaveBeenCalledWith('leaving-nsa');
      });
    });

    describe('When req.session.shownStandardSupportPageFlag is set', () => {
      test('when req.session.shownStandardSupportPageFlag is true', () => {
        req.body.voiceover = Voiceover.NONE;
        req.session.journey.shownStandardSupportPageFlag = true;
        voiceoverController.post(req as unknown as Request, res);

        expect(res.redirect).toHaveBeenCalledWith('find-test-centre');
      });

      test('when req.session.shownStandardSupportPageFlag is false', () => {
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

        voiceoverController.post(req as unknown as Request, res);

        expect(res.render).toHaveBeenLastCalledWith(PageNames.VOICEOVER, {
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
          backLink: 'select-support-type',
          receivedSupportRequestPageFlag: false,
          isNonStandardJourney: false,
        });
      });

      test('missing journey handled', () => {
        delete req.session.journey;

        expect(() => voiceoverController.post(req as unknown as Request, res))
          .toThrow(Error('VoiceoverController::post: No journey set'));
      });

      test('missing booking handled', () => {
        delete req.session.currentBooking;

        expect(() => voiceoverController.post(req as unknown as Request, res))
          .toThrow(Error('VoiceoverController::renderPage: No Current Booking object found in session'));
      });
    });
  });
});
