import { ManageBookingLoginController } from '../../../../src/pages/manage-booking/login';

jest.mock('../../../../src/helpers/language');

describe('Manage booking - login controller', () => {
  let req: any;
  let res: any;

  const mockLicenceNumber = 'JONES061102W97YT';
  const mockCandidate = {
    candidateId: 'mockCandidateId',
    licenceNumber: mockLicenceNumber,
  };
  const mockCandidateBookings = [
    { reference: '001' },
    { reference: '002' },
    { reference: '003' },
  ];

  const mockCrmGateway = {
    getCandidateByLicenceNumber: jest.fn(),
    getCandidateBookings: jest.fn(),
  };

  const controller = new ManageBookingLoginController(mockCrmGateway as any);

  beforeEach(() => {
    req = {
      body: {
        licenceNumber: mockLicenceNumber,
        bookingReference: 'booking-ref',
      },
      hasErrors: false,
      errors: [],
      session: {},
    };

    res = {
      res_params: {},
      res_template: '',
      status: (status: number): object => {
        res.res_status = status;
        return res;
      },
      redirect: (url: string): void => {
        res.res_url = url;
        res.res_status = 302;
      },
      render: (template: string, params: any): void => {
        res.res_template = template;
        res.res_params = params;
      },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {
    test('clears any existing manage booking session', () => {
      req.session.manageBooking = {
        candidate: 'some existing session data',
      };

      controller.get(req, res);

      expect(req.session.manageBooking).toEqual({});
    });

    test('renders the manage booking login page', () => {
      controller.get(req, res);

      expect(res.res_template).toBe('manage-booking/login');
    });
  });

  describe('POST', () => {
    test('retrieves the candidate\'s bookings, stores them in the session and redirects to the home page', async () => {
      mockCrmGateway.getCandidateByLicenceNumber.mockReturnValueOnce(mockCandidate);
      mockCrmGateway.getCandidateBookings.mockReturnValueOnce(mockCandidateBookings);
      req.body.bookingReference = mockCandidateBookings[0].reference;

      await controller.post(req, res);

      expect(req.session.manageBooking).toStrictEqual({
        candidate: mockCandidate,
        bookings: mockCandidateBookings,
      });
      expect(res.res_url).toBe('home');
    });

    describe('if the form input validation fails', () => {
      test('re-renders the view with an error', async () => {
        req.hasErrors = true;

        await controller.post(req, res);

        expect(res.res_template).toBe('manage-booking/login');
        expect(res.res_params.errors).toHaveLength(1);
      });
    });

    describe('if the form input validation succeeds', () => {
      describe('but no licence/candidate is found for the given licence number', () => {
        test('re-renders the view with an error', async () => {
          mockCrmGateway.getCandidateByLicenceNumber.mockReturnValueOnce(undefined);

          await controller.post(req, res);

          expect(res.res_template).toBe('manage-booking/login');
          expect(res.res_params.errors).toHaveLength(1);
        });
      });

      describe('but the given booking reference does not match the licence/candidate', () => {
        test('re-renders the view with an error', async () => {
          mockCrmGateway.getCandidateByLicenceNumber.mockReturnValueOnce(mockCandidate);
          mockCrmGateway.getCandidateBookings.mockReturnValueOnce(mockCandidateBookings);
          req.body.bookingReference = 'not-one-of-my-bookings';

          await controller.post(req, res);

          expect(res.res_template).toBe('manage-booking/login');
          expect(res.res_params.errors).toHaveLength(1);
        });
      });
    });
  });
});
