import { PageNames } from '@constants';
import { LeavingNSAController } from '@pages/leaving-nsa/leaving-nsa';

describe('LeavingNSAController', () => {
  let leavingNSAController: LeavingNSAController;
  let req;
  let res;

  const mockCrmGateway = {
    doesUserHaveDraftNSABooking: jest.fn(),
    getUserDraftNSABookingsIfExist: jest.fn(),
  };

  beforeEach(() => {
    leavingNSAController = new LeavingNSAController(mockCrmGateway as any);
    req = {
      path: '/nsa/leaving-nsa',
      session: {
        journey: {},
      },
    };
    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    };
  });

  describe('get', () => {
    test('it should render the correct page', () => {
      leavingNSAController.get(req, res);
      expect(res.render).toHaveBeenCalledWith(PageNames.LEAVING_NSA, {
        backLink: 'select-support-type',
      });
    });
  });

  describe('post', () => {
    test('when leaving non standard accommodations the session is set appropriately', async () => {
      req.body = { accommodation: 'standard' };
      await leavingNSAController.post(req, res);
      const { standardAccommodation } = req.session.journey;
      expect(standardAccommodation).toBe(true);
    });

    test('when leaving non standard accommodations the user is navigated to contact details page', async () => {
      req.body = { accommodation: 'standard' };
      await leavingNSAController.post(req, res);
      expect(res.redirect).toHaveBeenCalledWith('email-contact');
    });

    test('when continuing with non standard accommodations the session is set appropriately', async () => {
      req.body = { accommodation: 'nonStandard' };
      await leavingNSAController.post(req, res);
      const { standardAccommodation } = req.session.journey;
      expect(standardAccommodation).toBe(false);
    });

    test('when continuing with non standard accommodations the user is navigated to staying NSA page', async () => {
      req.body = { accommodation: 'nonStandard' };
      await leavingNSAController.post(req, res);
      expect(res.redirect).toHaveBeenCalledWith('staying-nsa');
    });

    test('when continuing with non standard accommodations and the user already has NSA request', async () => {
      req.body = { accommodation: 'nonStandard' };
      mockCrmGateway.getUserDraftNSABookingsIfExist.mockResolvedValue([true]);
      await leavingNSAController.post(req, res);
      expect(res.redirect).toHaveBeenCalledWith('duplicate-support-request');
    });

    test('when continuing with standard accomodations and the user already has NSA request', async () => {
      req.body = { accommodation: 'standard' };
      mockCrmGateway.getUserDraftNSABookingsIfExist.mockResolvedValue([true]);
      await leavingNSAController.post(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/received-support-request');
    });

    test('when continuing with instructor standard accomodations and the user already has NSA request', async () => {
      req.body = { accommodation: 'standard' };
      req.session.journey.isInstructor = true;
      mockCrmGateway.getUserDraftNSABookingsIfExist.mockResolvedValue([true]);

      await leavingNSAController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/instructor/received-support-request');
    });
  });
});
