import { PageNames } from '@constants';
import { VoicemailController } from '@pages/voicemail/voicemail';
import { ValidatorSchema } from '../../../../src/middleware/request-validator';
import { YesOrNo } from '../../../../src/value-objects/yes-or-no';

jest.mock('../../../../src/helpers/language', () => ({
  translate: () => 'translated',
}));

describe('VoicemailController', () => {
  let voicemailController: VoicemailController;
  let req;
  let res;

  beforeEach(() => {
    voicemailController = new VoicemailController();
    req = {
      body: {},
      session: {
        currentBooking: {},
        journey: {
          inEditMode: false,
        },
      },
    };
    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    };
  });

  describe('get', () => {
    test('it should render the correct page', () => {
      voicemailController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.VOICEMAIL, expect.any(Object));
    });

    test('checks voicemail \'yes\' option if voicemail set to true in session', () => {
      req.session.currentBooking.voicemail = true;

      voicemailController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.VOICEMAIL, expect.objectContaining({
        voicemailYes: true,
        voicemailNo: false,
      }));
    });

    test('checks voicemail \'no\' option if voicemail set to false in session', () => {
      req.session.currentBooking.voicemail = false;

      voicemailController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.VOICEMAIL, expect.objectContaining({
        voicemailYes: false,
        voicemailNo: true,
      }));
    });

    test('checks neither option if voicemail undefined in session', () => {
      req.session.currentBooking.voicemail = undefined;

      voicemailController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.VOICEMAIL, expect.objectContaining({
        voicemailYes: false,
        voicemailNo: false,
      }));
    });
  });

  describe('post', () => {
    test('it should update the session and redirect for a valid POST', () => {
      req.body = { voicemail: 'yes' };

      voicemailController.post(req, res);

      expect(req.session.currentBooking).toStrictEqual({ voicemail: true });
      expect(res.redirect).toHaveBeenCalledWith('check-your-details');
    });

    test('it should handle errors for a invalid POST', () => {
      req.hasErrors = true;
      req.errors = [{ param: 'voicemail', msg: 'error' }];

      voicemailController.post(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.VOICEMAIL, expect.objectContaining({
        errors: [{
          msg: 'translated',
          param: 'voicemail',
        }],
      }));
    });
  });

  describe('postSchemaValidation', () => {
    test('schema validation matches', () => {
      const expectedValidationSchema: ValidatorSchema = {
        voicemail: {
          in: ['body'],
          custom: {
            options: YesOrNo.isValid,
          },
        },
      };
      expect(voicemailController.postSchemaValidation()).toStrictEqual(expectedValidationSchema);
    });
  });
});
