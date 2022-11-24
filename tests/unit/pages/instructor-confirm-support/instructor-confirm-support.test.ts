import { PageNames } from '@constants';
import { InstructorConfirmSupportController, ConfirmSupportOption } from '@pages/instructor-confirm-support/instructor-confirm-support';

describe('InstructorConfirmSupportController', () => {
  let instructorConfirmSupportController: InstructorConfirmSupportController;
  let req: unknown;
  let res;

  beforeEach(() => {
    instructorConfirmSupportController = new InstructorConfirmSupportController();
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
      instructorConfirmSupportController.get(req, res);
      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CONFIRM_SUPPORT, {
        backLink: 'select-support-type',
      });
    });
  });

  describe('post', () => {
    test('tell us what support you need', () => {
      req.body = { confirmSupport: ConfirmSupportOption.TELL_US_WHAT_SUPPORT };
      instructorConfirmSupportController.post(req, res);
      const { selectSupportType } = req.session.currentBooking;
      expect(selectSupportType).toBeUndefined();
      expect(res.redirect).toHaveBeenCalledWith('select-support-type');
    });

    test('book without support', () => {
      req.body = { confirmSupport: ConfirmSupportOption.BOOK_WITHOUT_SUPPORT };
      instructorConfirmSupportController.post(req, res);
      expect(res.redirect).toHaveBeenCalledWith('leaving-nsa');
    });

    test('continue without telling us', () => {
      req.body = { confirmSupport: ConfirmSupportOption.CONTINUE_WITHOUT_TELLING_US };
      instructorConfirmSupportController.post(req, res);
      expect(res.redirect).toHaveBeenCalledWith('staying-nsa');
    });

    test('errors', () => {
      req.hasErrors = true;
      req.errors = ['Select one option from the list'];
      req.body = {
        confirmSupport: undefined,
      };
      instructorConfirmSupportController.post(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CONFIRM_SUPPORT, expect.objectContaining({
        errors: req.errors,
      }));
    });
  });
});
