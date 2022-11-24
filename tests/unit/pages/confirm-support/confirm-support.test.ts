import { PageNames } from '@constants';
import { ConfirmSupportController, ConfirmSupportOption } from '@pages/confirm-support/confirm-support';

describe('ConfirmSupportController', () => {
  let confirmSupportController: ConfirmSupportController;
  let req: unknown;
  let res;

  beforeEach(() => {
    confirmSupportController = new ConfirmSupportController();
    req = {
      path: '/nsa/confirm-support',
      session: {
        journey: {

        },
        currentBooking: {

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
      confirmSupportController.get(req, res);
      expect(res.render).toHaveBeenCalledWith(PageNames.CONFIRM_SUPPORT, {
        backLink: 'select-support-type',
      });
    });
  });

  describe('post', () => {
    test('tell us what support you need', () => {
      req.body = { confirmSupport: ConfirmSupportOption.TELL_US_WHAT_SUPPORT };
      confirmSupportController.post(req, res);
      const { selectSupportType } = req.session.currentBooking;
      expect(selectSupportType).toBeUndefined();
      expect(res.redirect).toHaveBeenCalledWith('select-support-type');
    });

    test('book without support', () => {
      req.body = { confirmSupport: ConfirmSupportOption.BOOK_WITHOUT_SUPPORT };
      confirmSupportController.post(req, res);
      expect(res.redirect).toHaveBeenCalledWith('leaving-nsa');
    });

    test('continue without telling us', () => {
      req.body = { confirmSupport: ConfirmSupportOption.CONTINUE_WITHOUT_TELLING_US };
      confirmSupportController.post(req, res);
      expect(res.redirect).toHaveBeenCalledWith('staying-nsa');
    });

    test('errors', () => {
      req.hasErrors = true;
      req.errors = ['Select one option from the list'];
      req.body = {
        confirmSupport: undefined,
      };
      confirmSupportController.post(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.CONFIRM_SUPPORT, expect.objectContaining({
        errors: req.errors,
      }));
    });
  });
});
