import { ChooseSupportController } from '../../../../src/pages/common/choose-support';
import '../../../../src/helpers/language';

jest.mock('../../../../src/helpers/language', () => ({
  translate: () => 'mocked string',
}));

describe('Choose Support controller', () => {
  let chooseSupportController: ChooseSupportController;
  let req;
  let res;

  beforeEach(() => {
    chooseSupportController = new ChooseSupportController();
    req = {
      body: {
        chooseSupport: 'yes',
      },
      errors: [],
      hasErrors: false,
      session: {},
    };

    res = {
      redirect: jest.fn(),
      render: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {
    test('renders the view with correct data', () => {
      chooseSupportController.get(req, res);

      expect(res.render).toHaveBeenCalledWith('common/choose-support', {
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

      expect(res.render).toHaveBeenCalledWith('common/choose-support', {
        booking: {},
        errors: [{
          param: 'chooseSupport',
          msg: 'mocked string',
        }],
      });
    });
  });

  describe('POST', () => {
    test('redirects to the next page when answered yes', () => {
      chooseSupportController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('candidate-details');
      expect(req.session.journey.support).toEqual(true);
      expect(req.session.journey.standardAccommodation).toEqual(false);
    });

    test('redirects to the next page when answered no', () => {
      req.body.chooseSupport = 'no';
      chooseSupportController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('candidate-details');
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

      expect(res.render).toHaveBeenCalledWith('common/choose-support', {
        booking: {},
        errors: [{
          param: 'chooseSupport',
          msg: 'mocked string',
        }],
      });
    });
  });
});
