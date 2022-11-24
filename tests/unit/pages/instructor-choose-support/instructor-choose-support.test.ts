import { InstructorChooseSupportController } from '@pages/instructor-choose-support/instructor-choose-support';
import '../../../../src/helpers/language';
import { PageNames } from '@constants';
import { Target } from '../../../../src/domain/enums';

jest.mock('../../../../src/helpers/language', () => ({
  translate: () => 'mocked string',
}));

describe('Instructor Choose Support controller', () => {
  let chooseSupportController: InstructorChooseSupportController;
  let req;
  let res;
  const journeyStartPath = '/instructor/candidate-details';

  beforeEach(() => {
    chooseSupportController = new InstructorChooseSupportController();
    req = {
      body: {
        chooseSupport: 'yes',
      },
      query: {
        newBooking: undefined,
      },
      errors: [],
      hasErrors: false,
      session: {
        journey: {
          inEditMode: false,
          support: false,
        },
        currentBooking: {},
      },
    };

    res = {
      redirect: jest.fn(),
      render: jest.fn(),
      locals: {
        inEditMode: false,
        inManagedBookingEditMode: false,
      },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {
    test('renders the view with correct data', () => {
      chooseSupportController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CHOOSE_SUPPORT, {
        backLink: 'https://www.gov.uk/book-your-instructor-theory-test',
        booking: {},
        errors: [],
      });
    });

    test('renders the view with correct data when in edit mode', () => {
      req.session.journey.inEditMode = true;
      req.session.journey.standardAccommodation = true;
      chooseSupportController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CHOOSE_SUPPORT, {
        backLink: 'check-your-answers',
        booking: {},
        errors: [],
      });
    });

    test('renders the view with correct error message', () => {
      req.errors.push({
        param: 'chooseSupport',
        msg: 'Yes or no',
      });

      chooseSupportController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CHOOSE_SUPPORT, {
        backLink: 'https://www.gov.uk/book-your-instructor-theory-test',
        booking: {},
        errors: [{
          param: 'chooseSupport',
          msg: 'mocked string',
        }],
      });
    });

    test('blocks access to this page if in DVA service', () => {
      req.session.target = Target.NI;

      chooseSupportController.get(req, res);

      expect(res.redirect).toHaveBeenCalledWith(journeyStartPath);
    });
  });

  describe('POST', () => {
    test('redirects to the next page when answered yes', () => {
      chooseSupportController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('support-alert');
      expect(req.session.journey.support).toEqual(false);
      expect(req.session.journey.standardAccommodation).toEqual(true);
    });

    test('redirects to the next page when answered no', () => {
      req.body.chooseSupport = 'no';
      chooseSupportController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('candidate-details');
      expect(req.session.journey.support).toEqual(false);
      expect(req.session.journey.standardAccommodation).toEqual(true);
    });

    test('redirects to test type if in edit mode and selected support requested', () => {
      req.body.chooseSupport = 'yes';
      req.session.journey.inEditMode = true;

      chooseSupportController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('nsa/test-type');
      expect(req.session.journey.support).toEqual(true);
      expect(req.session.journey.standardAccommodation).toEqual(false);
    });

    test('redirects to email contact if in edit mode and selected no support requested', () => {
      req.body.chooseSupport = 'no';
      req.session.journey.inEditMode = true;

      chooseSupportController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('email-contact');
      expect(req.session.journey.support).toEqual(false);
      expect(req.session.journey.standardAccommodation).toEqual(true);
    });

    test('errors are displayed if in session', () => {
      req.hasErrors = true;
      req.errors.push({
        param: 'chooseSupport',
        msg: 'Yes or no',
      });

      chooseSupportController.post(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CHOOSE_SUPPORT, {
        backLink: 'https://www.gov.uk/book-your-instructor-theory-test',
        booking: {},
        errors: [{
          param: 'chooseSupport',
          msg: 'mocked string',
        }],
        inEditMode: undefined,
      });
    });

    test('blocks access to this page if in DVA service', () => {
      req.session.target = Target.NI;

      chooseSupportController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith(journeyStartPath);
    });
  });
});
