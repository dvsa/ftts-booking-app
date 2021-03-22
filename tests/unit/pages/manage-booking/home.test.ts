import MockDate from 'mockdate';
import { ManageBookingHomeController } from '../../../../src/pages/manage-booking/home';
import { CRMBookingStatus } from '../../../../src/services/crm-gateway/enums';

describe('Manage booking - home controller', () => {
  let req: any;
  let res: any;
  const mockBookingManager = {
    loadCandidateBookings: jest.fn(),
  };

  const mockScheduler = {
    getBooking: jest.fn(),
  };
  const controller = new ManageBookingHomeController(mockBookingManager as any, mockScheduler as any);

  beforeEach(() => {
    MockDate.set('2020-10-05T12:00:00.000Z'); // Set mocked date/time for 'now'

    req = {
      hasErrors: false,
      errors: [],
      session: {
        manageBooking: {
          candidate: {
            candidateId: 'mockCandidateId',
            licenceNumber: 'mockLicenceNumber',
          },
          bookings: [
            {
              reference: '001',
              testDate: '2020-11-05T11:30:00.000Z',
              bookingStatus: CRMBookingStatus.Confirmed,
            },
            {
              reference: '002',
              testDate: '2020-10-05T12:30:00.000Z',
              bookingStatus: CRMBookingStatus.CompletePassed,
            },
            {
              reference: '003',
              testDate: '2020-11-04T11:40:00.000Z',
              bookingStatus: CRMBookingStatus.Confirmed,
            },
            {
              reference: '004',
              testDate: '2020-10-05T11:45:00.000Z', // Date/time in the past
              bookingStatus: CRMBookingStatus.Confirmed,
            },
          ],
        },
      },
    };

    res = {
      redirect: jest.fn(),
      render: (template: string, params: any) => {
        res.bookings = params.bookings;
        res.bookingsWithErrors = params.bookingsWithErrors;
      },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {
    test('redirects the manage booking login page if no candidate in session', async () => {
      delete req.session.manageBooking.candidate;
      await controller.get(req, res);

      expect(res.redirect).toHaveBeenCalledWith('login');
    });

    test('renders the manage booking list, only future confirmed and sorted by soonest test first', async () => {
      await controller.get(req, res);

      expect(res.bookings).toEqual([{
        reference: '003',
        testDate: '2020-11-04T11:40:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
      }, {
        reference: '001',
        testDate: '2020-11-05T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
      }]);
    });
    test('renders the manage booking list, containing valid change in progress bookings and sorted by soonest test first', async () => {
      req.session.manageBooking.bookings.push({
        reference: '005',
        testDate: '2020-11-04T11:20:00.000Z',
        bookingStatus: CRMBookingStatus.ChangeInProgress,
        testCentre: {
          region: 'a',
        },
      });
      req.session.manageBooking.bookings.push({
        reference: '006',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.ChangeInProgress,
        testCentre: {
          region: 'a',
        },
      });
      mockScheduler.getBooking.mockResolvedValue({});

      await controller.get(req, res);

      expect(res.bookings).toEqual([{
        reference: '006',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.ChangeInProgress,
        testCentre: {
          region: 'a',
        },
      }, {
        reference: '005',
        testDate: '2020-11-04T11:20:00.000Z',
        bookingStatus: CRMBookingStatus.ChangeInProgress,
        testCentre: {
          region: 'a',
        },
      }, {
        reference: '003',
        testDate: '2020-11-04T11:40:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
      }, {
        reference: '001',
        testDate: '2020-11-05T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
      }]);
    });

    test('renders the errored change in progress bookings, when TCN cannot retrieve the bookings details due to a failed request', async () => {
      req.session.manageBooking.bookings.push({
        reference: '005',
        testDate: '2020-11-04T11:20:00.000Z',
        bookingStatus: CRMBookingStatus.ChangeInProgress,
        testCentre: {
          region: 'a',
        },
      });
      req.session.manageBooking.bookings.push({
        reference: '006',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.ChangeInProgress,
        testCentre: {
          region: 'a',
        },
      });
      // one change in progress booking is valid, one is erroneous
      mockScheduler.getBooking.mockResolvedValueOnce({}).mockRejectedValueOnce({});

      await controller.get(req, res);

      expect(res.bookings).toEqual([{
        reference: '006',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.ChangeInProgress,
        testCentre: {
          region: 'a',
        },
      }, {
        reference: '003',
        testDate: '2020-11-04T11:40:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
      }, {
        reference: '001',
        testDate: '2020-11-05T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
      }]);
      expect(res.bookingsWithErrors).toEqual([{
        reference: '005',
        testDate: '2020-11-04T11:20:00.000Z',
        bookingStatus: CRMBookingStatus.ChangeInProgress,
        testCentre: {
          region: 'a',
        },
      }]);
    });

    test('renders the errored change in progress bookings, when TCN cannot retrieve valid bookings details', async () => {
      req.session.manageBooking.bookings.push({
        reference: '005',
        testDate: '2020-11-04T11:20:00.000Z',
        bookingStatus: CRMBookingStatus.ChangeInProgress,
        testCentre: {
          region: 'a',
        },
      });
      req.session.manageBooking.bookings.push({
        reference: '006',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.ChangeInProgress,
        testCentre: {
          region: 'a',
        },
      });
      // one change in progress booking is valid, one is erroneous
      mockScheduler.getBooking.mockResolvedValueOnce({}).mockResolvedValueOnce(null);

      await controller.get(req, res);

      expect(res.bookings).toEqual([{
        reference: '006',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.ChangeInProgress,
        testCentre: {
          region: 'a',
        },
      }, {
        reference: '003',
        testDate: '2020-11-04T11:40:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
      }, {
        reference: '001',
        testDate: '2020-11-05T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
      }]);
      expect(res.bookingsWithErrors).toEqual([{
        reference: '005',
        testDate: '2020-11-04T11:20:00.000Z',
        bookingStatus: CRMBookingStatus.ChangeInProgress,
        testCentre: {
          region: 'a',
        },
      }]);
    });
  });
});
