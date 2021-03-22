import { LeavingNSAController } from '../../../../src/pages/supported/leaving-nsa';
import { store } from '../../../../src/services/session';

describe('LeavingNSAController', () => {
  let leavingNSAController: LeavingNSAController;
  let request;
  let response;

  beforeEach(() => {
    leavingNSAController = new LeavingNSAController();
    request = {
      session: {
        journey: {},
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
      redirect: jest.fn(),
    };
  });

  describe('get', () => {
    test('it should render the correct page', () => {
      leavingNSAController.get(request, response);
      expect(response.res_template).toBe('supported/leaving-nsa');
    });
  });

  describe('post', () => {
    test('when leaving non standard accommodations the session is set appropriately', () => {
      request.body = { accommodation: 'standard' };
      leavingNSAController.post(request, response);
      const { standardAccommodation } = store.journey.get(request);
      expect(standardAccommodation).toBe(true);
    });

    test('when continuing with non standard accommodations the session is set appropriately', () => {
      request.body = { accommodation: 'nonStandard' };
      leavingNSAController.post(request, response);
      const { standardAccommodation } = store.journey.get(request);
      expect(standardAccommodation).toBe(false);
    });
  });
});
