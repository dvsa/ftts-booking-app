import { ValidatorSchema } from '../../../../src/middleware/request-validator';
import { VoicemailController } from '../../../../src/pages/supported/voicemail';
import { YesOrNo } from '../../../../src/value-objects/yes-or-no';

jest.mock('../../../../src/helpers/language', () => ({
  translate: () => 'translated',
}));

describe('VoicemailController', () => {
  let voicemailController: VoicemailController;
  let request;
  let response;

  beforeEach(() => {
    voicemailController = new VoicemailController();
    request = {
      body: {},
      session: {
        currentBooking: {},
      },
    };
    response = {
      res_params: {},
      res_redirect: '',
      res_status: 200,
      res_template: '',
      render: (template: string, params: any): void => {
        response.res_template = template;
        response.res_params = params;
      },
      redirect: (url: string): void => {
        response.res_url = url;
        response.res_status = 302;
      },
    };
  });

  describe('get', () => {
    test('it should render the correct page', () => {
      voicemailController.get(request, response);
      expect(response.res_template).toBe('supported/voicemail');
    });
  });

  describe('post', () => {
    test('it should update the session and redirect for a valid POST', () => {
      request.body = { voicemail: 'yes' };

      voicemailController.post(request, response);

      expect(request.session.currentBooking).toStrictEqual({ voicemail: true });
      expect(response.res_status).toStrictEqual(302);
      expect(response.res_url).toStrictEqual('#');
    });

    test('it should handle errors for a invalid POST', () => {
      request.hasErrors = true;
      request.errors = [{ param: 'voicemail', msg: 'error' }];

      voicemailController.post(request, response);

      expect(response.res_template).toStrictEqual('supported/voicemail');
      expect(response.res_params).toStrictEqual({
        errors: [{
          msg: 'translated',
          param: 'voicemail',
        }],
      });
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
