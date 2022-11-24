import { PageNames } from '@constants';
import { SupportAlertController } from '@pages/support-alert/support-alert';

describe('SupportAlertController', () => {
  let supportAlertController: SupportAlertController;
  let req;
  let res;

  beforeEach(() => {
    supportAlertController = new SupportAlertController();
    req = {
      session: {
        journey: {},
      },
      headers: {
        referer: '',
      },
      path: '/supported/support-alert',
    };
    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    };
  });

  describe('get', () => {
    test('it should render the correct page when referer contain support alert', () => {
      supportAlertController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.SUPPORT_ALERT, {
        backLink: 'choose-support',
      });
    });
  });

  describe('post', () => {
    test('when choosing yes on the support page the user is navigated to candidate details page', () => {
      supportAlertController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('nsa/candidate-details');
      expect(req.session.journey.support).toEqual(true);
      expect(req.session.journey.standardAccommodation).toEqual(false);
      expect(req.session.journey.inEditMode).toEqual(false);
    });
  });
});
