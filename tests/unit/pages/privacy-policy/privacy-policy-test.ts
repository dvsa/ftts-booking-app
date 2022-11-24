import { PageNames } from '@constants';
import { PrivacyPolicyController } from '@pages/privacy-policy/privacy-policy';

describe('PrivacyPolicyController', () => {
  let privacyPolicyController: PrivacyPolicyController;
  let req;
  let res;

  beforeEach(() => {
    privacyPolicyController = new PrivacyPolicyController();
    req = {
      headers: {
        referer: '',
      },
      session: {
        lastPage: '',
      },
    };

    res = {
      render: jest.fn(),
    };
  });

  describe('GET', () => {
    test('renders the page', () => {
      req.headers.referer = '/manage-booking/login';

      privacyPolicyController.get(req, res);

      expect(req.session.lastPage).toBe(req.headers.referer);
      expect(res.render).toHaveBeenCalledWith(PageNames.PRIVACY_POLICY, {
        backLink: req.headers.referer,
      });
    });

    test('back link does not change if the referer is on the privacy policy page', () => {
      req.headers.referer = '/privacy-policy';
      req.session.lastPage = '/candidate-details';

      privacyPolicyController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.PRIVACY_POLICY, {
        backLink: req.session.lastPage,
      });
    });

    test('back link defaults to the root if referer is undefined', () => {
      req.headers.referer = undefined;

      privacyPolicyController.get(req, res);

      expect(req.session.lastPage).toBe('/');
      expect(res.render).toHaveBeenCalledWith(PageNames.PRIVACY_POLICY, {
        backLink: '/',
      });
    });

    test('back link doesn\'t have any query string params if referer originally contained them', () => {
      req.headers.referer = '/candidate-details?lang=cy';

      privacyPolicyController.get(req, res);

      expect(req.session.lastPage).toBe('/candidate-details');
      expect(res.render).toHaveBeenCalledWith(PageNames.PRIVACY_POLICY, {
        backLink: '/candidate-details',
      });
    });
  });
});
