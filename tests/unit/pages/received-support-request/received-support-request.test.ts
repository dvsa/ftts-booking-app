import { PageNames } from '@constants';
import { ReceivedSupportRequestController } from '@pages/received-support-request/received-support-request';
import { Target } from '../../../../src/domain/enums';

describe('ReceviedSupportRequestController', () => {
  let receviedSupportRequestController: ReceivedSupportRequestController;
  let req: any;
  let res: any;

  beforeEach(() => {
    receviedSupportRequestController = new ReceivedSupportRequestController();
    req = {
      session: {
        journey: {},
        lastPage: '',
        target: Target.GB,
      },
      headers: {
        referer: '',
      },
      path: '/common/received-support-request',
    };
    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    };
  });

  describe('get', () => {
    describe('get - non-standard accomdation', () => {
      test('it should render the correct page with the back link as the test type page and continue link as the test language page', () => {
        req.session.lastPage = 'test-type';
        req.session.journey.standardAccommodation = false;
        req.session.journey.support = true;

        receviedSupportRequestController.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.RECEIVED_SUPPORT_REQUEST, {
          backLink: 'test-type',
          continueLink: 'test-language',
        });
      });

      test('it should render the correct page with the back link as not the test type page and continue link as the email contact page', () => {
        req.session.journey.standardAccommodation = false;
        req.session.journey.support = true;

        receviedSupportRequestController.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.RECEIVED_SUPPORT_REQUEST, {
          backLink: 'test-type',
          continueLink: 'email-contact',
        });
      });
    });

    describe('get - standard accomdation', () => {
      test('it should render the correct page with the back link as the test type page and continue link as the test language page', () => {
        req.session.lastPage = 'test-type';
        req.session.journey.standardAccommodation = true;
        req.session.journey.support = false;

        receviedSupportRequestController.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.RECEIVED_SUPPORT_REQUEST, {
          backLink: 'test-type',
          continueLink: 'test-language',
        });
      });

      test('it should render the correct page with the back link as the leaving nsa page and continue link as the test language page', () => {
        req.session.lastPage = 'nsa/leaving-nsa';
        req.session.journey.standardAccommodation = true;
        req.session.journey.support = false;

        receviedSupportRequestController.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.RECEIVED_SUPPORT_REQUEST, {
          backLink: 'test-type',
          continueLink: 'email-contact',
        });
      });

      test('it should render the correct page in the NI version with the back link as the test type page and continue link as test-language (which will skip to select-standard-support)', () => {
        req.session.lastPage = 'test-type';
        req.session.journey.standardAccommodation = true;
        req.session.journey.support = false;
        req.session.target = Target.NI;

        receviedSupportRequestController.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.RECEIVED_SUPPORT_REQUEST, {
          backLink: 'test-type',
          continueLink: 'test-language',
        });
      });
    });
  });
});
