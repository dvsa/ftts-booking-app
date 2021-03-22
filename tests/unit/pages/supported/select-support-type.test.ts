import { TARGET } from '../../../../src/domain/enums';
import selectSupportType from '../../../../src/pages/supported/select-support-type';

jest.mock('../../../../src/helpers/language', () => ({
  translate: () => 'mockTranslatedString',
}));

describe('SelectSupportType controller', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      query: {},
      body: {},
      hasErrors: false,
      errors: [],
      session: {
        target: TARGET.GB,
      },
    };

    res = {
      res_params: {},
      res_status: 200,
      res_template: '',
      render: (template: string, params: any): void => {
        res.res_template = template;
        res.res_params = params;
      },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('get', () => {
    test('in GB context', () => {
      selectSupportType.get(req, res);

      expect(res.res_template).toEqual('supported/select-support-type');
      expect(res.res_params.options.length).toEqual(7);
    });
    test('in NI context', () => {
      req.session.target = TARGET.NI;
      selectSupportType.get(req, res);

      expect(res.res_template).toEqual('supported/select-support-type');
      expect(res.res_params.options.length).toEqual(8);
    });
  });

  describe('post', () => {
    test('user selected options are referenced', () => {
      req.body.selectSupportType = ['option1', 'option2', 'option5'];
      selectSupportType.post(req, res);

      expect(res.res_params.options[0].checked).toBe(true);
      expect(res.res_params.options[1].checked).toBe(true);
      expect(res.res_params.options[2].checked).toBe(false);
      expect(res.res_params.options[3].checked).toBe(true);
      expect(res.res_params.options[4].checked).toBe(false);
      expect(res.res_params.options[5].checked).toBe(false);
      expect(res.res_params.options[6].checked).toBe(false);
    });
  });

  describe('Support Type Validator', () => {
    test('prevents zero items selected from proceeding', () => {
      expect(() => selectSupportType.supportTypeValidator(undefined)).toThrow();
    });

    test('prevents banned combination from proceeding', () => {
      expect(() => selectSupportType.supportTypeValidator(['option1', 'option3'])).toThrow();
    });

    test('allows valid combination', () => {
      const result = selectSupportType.supportTypeValidator(['option2', 'option6']);

      expect(result).toEqual(['option2', 'option6']);
    });
  });
});
