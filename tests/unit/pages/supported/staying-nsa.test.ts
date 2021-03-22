import { StayingNSAController } from '../../../../src/pages/supported/staying-nsa';

describe('StayingNSAController', () => {
  let stayingNSAController: StayingNSAController;
  let request;
  let response;

  beforeEach(() => {
    stayingNSAController = new StayingNSAController();
    request = {};
    response = {
      res_params: {},
      res_redirect: '',
      res_status: 200,
      res_template: '',
      render: (template: string, params: any): void => {
        response.res_template = template;
        response.res_params = params;
      },
    };
  });

  describe('get', () => {
    test('it should render the correct page', () => {
      stayingNSAController.get(request, response);
      expect(response.res_template).toBe('supported/staying-nsa');
    });
  });
});
