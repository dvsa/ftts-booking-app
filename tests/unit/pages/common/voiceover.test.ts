import { Voiceover } from '../../../../src/domain/enums';
import { ValidatorSchema } from '../../../../src/middleware/request-validator';
import { VoiceoverController } from '../../../../src/pages/common/voiceover';
import { CRMVoiceOver } from '../../../../src/services/crm-gateway/enums';

jest.mock('../../../../src/helpers/language', () => ({
  translate: () => 'translated',
}));

describe('Manage Booking Voiceover controller', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      hasErrors: false,
      errors: [],
      body: {
        voiceover: CRMVoiceOver.None,
      },
      session: {
        currentBooking: {
          bookingRef: 'mock-booking-ref',
          voiceover: {
            voiceover: CRMVoiceOver.English,
          },
        },
        journey: {
          inEditMode: false,
          inManagedBookingEditMode: false,
        },
      },
    };

    res = {
      res_url: '',
      res_status: 200,
      res_template: '',
      status: (status: number): object => {
        res.res_status = status;
        return res;
      },
      redirect: (url: string): void => {
        res.res_url = url;
        res.res_status = 301;
      },
      render: (template: string, params: any): void => {
        res.res_template = template;
        res.res_params = params;
      },
      locals: {
        target: 'gb',
      },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const controller = new VoiceoverController();

  describe('GET request', () => {
    test('correctly renders the page in manage booking mode', () => {
      req.session.journey.inManagedBookingEditMode = true;
      req.session.manageBookingEdits = {
        bsl: true,
      };

      controller.get(req, res);

      expect(req.session.manageBookingEdits).toStrictEqual({});
      expect(res.res_template).toBe('common/voiceover');
      expect(res.res_params).toStrictEqual({
        availableOptionsArray: [
          {
            attributes: {
              'data-automation-id': 'voiceover-checkbox-1',
            },
            checked: false,
            text: 'translated translated',
            value: Voiceover.ENGLISH,
          },
          {
            attributes: {
              'data-automation-id': 'voiceover-checkbox-2',
            },
            checked: false,
            text: 'translated translated',
            value: Voiceover.WELSH,
          },
          {
            attributes: {
              'data-automation-id': 'voiceover-checkbox-3',
            },
            checked: false,
            text: 'translated',
            value: Voiceover.NONE,
          },
        ],
        bookingRef: 'mock-booking-ref',
        chosenLanguage: undefined,
        errors: [],
        inManagedBookingEditMode: true,
      });
    });

    test('renders the page in error mode', () => {
      req.hasErrors = true;
      req.errors = [{}];
      controller.get(req, res);

      expect(res.res_template).toBe('common/voiceover');
      expect(res.res_params.errors).toStrictEqual(req.errors);
    });

    test('renders the page in edit mode with chosen language', () => {
      req.session.currentBooking.voiceover.voiceover = CRMVoiceOver.Welsh;
      req.session.journey.inEditMode = true;

      controller.get(req, res);
      expect(res.res_template).toBe('common/voiceover');
      expect(res.res_params).toMatchObject({
        chosenLanguage: req.session.currentBooking.voiceover,
      });
    });

    test('renders voiceover page with a default value of no if voiceover is set to undefined', () => {
      req.session.currentBooking.voiceover = undefined;
      req.session.journey.inEditMode = true;

      controller.get(req, res);
      expect(res.res_template).toBe('common/voiceover');
      expect(res.res_params).toMatchObject({
        chosenLanguage: Voiceover.NONE,
      });
    });
  });

  describe('POST request', () => {
    test('renders same page with errors on bad request', () => {
      req.hasErrors = true;
      req.errors = [{}];
      controller.post(req, res);

      expect(res.res_template).toBe('common/voiceover');
      expect(res.res_params.errors).toStrictEqual(req.errors);
    });

    test('render check-your-answers if in edit mode', () => {
      req.session.journey.inEditMode = true;
      req.body.voiceover = CRMVoiceOver.English;

      controller.post(req, res);

      expect(req.session.currentBooking.voiceover).toBe(CRMVoiceOver.English);
      expect(res.res_url).toBe('check-your-answers');
      expect(res.res_status).toBe(301);
    });

    test('redirects to other-support if in managed booking edit mode', () => {
      req.body.voiceover = CRMVoiceOver.None;
      req.session.journey.inManagedBookingEditMode = true;

      controller.post(req, res);

      expect(res.res_url).toBe('check-change');
    });

    test('schema validation matches', () => {
      const expectedValidationSchema: ValidatorSchema = {
        voiceover: {
          in: ['body'],
          errorMessage: expect.any(Function),
          isEmpty: {
            negated: true,
          },
        },
      };
      expect(controller.voiceoverPostSchema()).toStrictEqual(expectedValidationSchema);
    });
  });
});
