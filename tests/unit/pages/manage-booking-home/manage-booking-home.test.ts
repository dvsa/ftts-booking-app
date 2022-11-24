import MockDate from 'mockdate';
import { ManageBookingHomeController } from '@pages/manage-booking-home/manage-booking-home';
import { logger } from '../../../../src/helpers';
import {
  CRMBookingStatus, CRMGovernmentAgency, CRMNsaStatus, CRMProductNumber, CRMNsaBookingSlotStatus, NsaStatus,
} from '../../../../src/services/crm-gateway/enums';
import { Target } from '../../../../src/domain/enums';
import config from '../../../../src/config';

// TODO Tech Debt: revamp the tests here; add appropriate mocks
describe('Manage booking - home controller', () => {
  let req: any;
  let res: any;
  const mockBookingManager = {
    loadCandidateBookings: jest.fn(),
  };

  const mockSchedulingGateway = { // TODO Not necessarily a scheduling gateway?
    getBooking: jest.fn(),
  };
  const controller = new ManageBookingHomeController(mockBookingManager as any, mockSchedulingGateway as any);

  let mockNsaBooking: any;
  beforeEach(() => {
    config.featureToggles.enableViewNsaBookingSlots = false;

    mockNsaBooking = {
      bookingId: 'mock-id-1',
      reference: '005',
      testDate: null,
      bookingStatus: CRMBookingStatus.Draft,
      nonStandardAccommodation: true,
      owedCompensationBooking: false,
      nsaStatus: CRMNsaStatus.AwaitingCandidateSlotConfirmation,
      product: {
        productnumber: CRMProductNumber.CAR,
      },
      nsaBookingSlots: [
        {
          _ftts_bookingid_value: 'mock-id-1',
          ftts_status: CRMNsaBookingSlotStatus.Offered,
          ftts_reservationid: '001',
          ftts_expirydate: 'mock-expiry-date 1',
          _ftts_organisationid_value: 'mock-organisational-id 1',
          ftts_testdate: 'mock-test-date 1',
        },
        {
          _ftts_bookingid_value: 'mock-id-1',
          ftts_status: CRMNsaBookingSlotStatus.Offered,
          ftts_reservationid: '002',
          ftts_expirydate: 'mock-expiry-date 2',
          _ftts_organisationid_value: 'mock-organisational-id 2',
          ftts_testdate: 'mock-test-date 2',
        },
        {
          _ftts_bookingid_value: 'mock-id-1',
          ftts_status: CRMNsaBookingSlotStatus.Offered,
          ftts_reservationid: '003',
          ftts_expirydate: 'mock-expiry-date 3',
          _ftts_organisationid_value: 'mock-organisational-id 3',
          ftts_testdate: 'mock-test-date 3',
        },
      ],
    };

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
              nonStandardAccommodation: false,
            },
            {
              reference: '002',
              testDate: '2020-10-05T12:30:00.000Z',
              bookingStatus: CRMBookingStatus.CompletePassed,
              nonStandardAccommodation: false,
            },
            {
              reference: '003',
              testDate: '2020-11-04T11:40:00.000Z',
              bookingStatus: CRMBookingStatus.Confirmed,
              nonStandardAccommodation: false,
            },
            {
              reference: '004',
              testDate: '2020-10-05T11:45:00.000Z', // Date/time in the past
              bookingStatus: CRMBookingStatus.Confirmed,
              nonStandardAccommodation: false,
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
        res.compensationEligibleNotificationLink = params.compensationEligibleNotificationLink;
        res.nsaBookingDetails = params.nsaBookingDetails;
        res.nsaFeatureToggle = params.nsaFeatureToggle;
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
      expect(res.nsaFeatureToggle).toBeFalsy();
    });

    test('renders the page with the feature toggle', async () => {
      config.featureToggles.enableViewNsaBookingSlots = true;

      await controller.get(req, res);

      expect(res.nsaFeatureToggle).toBeTruthy();
    });

    test('renders the manage booking list, only future confirmed and sorted by soonest test first', async () => {
      await controller.get(req, res);

      expect(res.bookings).toEqual([{
        reference: '003',
        testDate: '2020-11-04T11:40:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }, {
        reference: '001',
        testDate: '2020-11-05T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }]);
    });
    test('renders the manage booking list, containing valid change in progress bookings and sorted by soonest test first', async () => {
      req.session.manageBooking.bookings.push({
        reference: '005',
        testDate: '2020-11-04T11:20:00.000Z',
        bookingStatus: CRMBookingStatus.ChangeInProgress,
        nonStandardAccommodation: false,
        testCentre: {
          region: 'a',
        },
      });
      req.session.manageBooking.bookings.push({
        reference: '006',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.ChangeInProgress,
        nonStandardAccommodation: false,
        testCentre: {
          region: 'a',
        },
      });
      mockSchedulingGateway.getBooking.mockResolvedValue({});

      await controller.get(req, res);

      expect(res.bookings).toEqual([{
        reference: '006',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.ChangeInProgress,
        nonStandardAccommodation: false,
        testCentre: {
          region: 'a',
        },
      }, {
        reference: '005',
        testDate: '2020-11-04T11:20:00.000Z',
        bookingStatus: CRMBookingStatus.ChangeInProgress,
        nonStandardAccommodation: false,
        testCentre: {
          region: 'a',
        },
      }, {
        reference: '003',
        testDate: '2020-11-04T11:40:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }, {
        reference: '001',
        testDate: '2020-11-05T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }]);
    });

    test('renders the errored change in progress bookings, when TCN cannot retrieve the bookings details due to a failed request', async () => {
      req.session.manageBooking.bookings.push({
        reference: '005',
        testDate: '2020-11-04T11:20:00.000Z',
        bookingStatus: CRMBookingStatus.ChangeInProgress,
        nonStandardAccommodation: false,
        testCentre: {
          region: 'a',
        },
      });
      req.session.manageBooking.bookings.push({
        reference: '006',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.ChangeInProgress,
        nonStandardAccommodation: false,
        testCentre: {
          region: 'a',
        },
      });
      // one change in progress booking is valid, one is erroneous
      mockSchedulingGateway.getBooking.mockResolvedValueOnce({}).mockRejectedValueOnce({});

      await controller.get(req, res);

      expect(res.bookings).toEqual([{
        reference: '006',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.ChangeInProgress,
        nonStandardAccommodation: false,
        testCentre: {
          region: 'a',
        },
      }, {
        reference: '003',
        testDate: '2020-11-04T11:40:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }, {
        reference: '001',
        testDate: '2020-11-05T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }]);
      expect(res.bookingsWithErrors).toEqual([{
        reference: '005',
        testDate: '2020-11-04T11:20:00.000Z',
        bookingStatus: CRMBookingStatus.ChangeInProgress,
        nonStandardAccommodation: false,
        testCentre: {
          region: 'a',
        },
      }]);
      expect(logger.error).toHaveBeenCalledWith({ }, 'Booking 005 cannot be retrieved from TCN', { bookingRef: '005' });
    });

    test('renders the errored change in progress bookings, when TCN cannot retrieve valid bookings details', async () => {
      req.session.manageBooking.bookings.push({
        reference: '005',
        testDate: '2020-11-04T11:20:00.000Z',
        bookingStatus: CRMBookingStatus.ChangeInProgress,
        nonStandardAccommodation: false,
        testCentre: {
          region: 'a',
        },
      });
      req.session.manageBooking.bookings.push({
        reference: '006',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.ChangeInProgress,
        nonStandardAccommodation: false,
        testCentre: {
          region: 'a',
        },
      });
      // one change in progress booking is valid, one is erroneous
      mockSchedulingGateway.getBooking.mockResolvedValueOnce({}).mockResolvedValueOnce(null);

      await controller.get(req, res);

      expect(res.bookings).toEqual([{
        reference: '006',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.ChangeInProgress,
        nonStandardAccommodation: false,
        testCentre: {
          region: 'a',
        },
      }, {
        reference: '003',
        testDate: '2020-11-04T11:40:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }, {
        reference: '001',
        testDate: '2020-11-05T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }]);
      expect(res.bookingsWithErrors).toEqual([{
        reference: '005',
        testDate: '2020-11-04T11:20:00.000Z',
        bookingStatus: CRMBookingStatus.ChangeInProgress,
        nonStandardAccommodation: false,
        testCentre: {
          region: 'a',
        },
      }]);
    });

    test('renders the manage booking list, with 1 test compensation eligible, candidate booking', async () => {
      req.session.manageBooking.bookings.push({
        reference: '006',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        nonStandardAccommodation: false,
        owedCompensationBooking: true,
        product: {
          productnumber: CRMProductNumber.CAR,
        },
      });
      mockSchedulingGateway.getBooking.mockResolvedValue({});

      await controller.get(req, res);

      expect(res.compensationEligibleNotificationLink).toEqual('/');
      expect(res.bookings).toEqual([{
        reference: '006',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        nonStandardAccommodation: false,
        owedCompensationBooking: true,
        product: {
          productnumber: CRMProductNumber.CAR,
        },
      }, {
        reference: '003',
        testDate: '2020-11-04T11:40:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }, {
        reference: '001',
        testDate: '2020-11-05T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }]);
    });

    test('renders the manage booking list, with 1 test compensation eligible, instructor booking', async () => {
      req.session.manageBooking.bookings.push({
        reference: '006',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        nonStandardAccommodation: false,
        owedCompensationBooking: true,
        product: {
          productnumber: CRMProductNumber.ADIHPT,
        },
      });
      mockSchedulingGateway.getBooking.mockResolvedValue({});

      await controller.get(req, res);

      expect(res.compensationEligibleNotificationLink).toEqual('/instructor');
      expect(res.bookings).toEqual([{
        reference: '006',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        nonStandardAccommodation: false,
        owedCompensationBooking: true,
        product: {
          productnumber: CRMProductNumber.ADIHPT,
        },
      }, {
        reference: '003',
        testDate: '2020-11-04T11:40:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }, {
        reference: '001',
        testDate: '2020-11-05T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }]);
    });

    test('renders the manage booking list, with test compensation not eligible', async () => {
      req.session.manageBooking.bookings.push({
        reference: '005',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        nonStandardAccommodation: false,
        owedCompensationBooking: false,
      });
      mockSchedulingGateway.getBooking.mockResolvedValue({});

      await controller.get(req, res);

      expect(res.compensationEligibleNotificationLink).toEqual('');
      expect(res.bookings).toEqual([{
        reference: '003',
        testDate: '2020-11-04T11:40:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }, {
        reference: '001',
        testDate: '2020-11-05T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }]);
    });

    test('renders the manage booking list, with 2 tests compensation eligible, niDirect based, 2 candidate', async () => {
      req.session.manageBooking.bookings.push({
        reference: '005',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        nonStandardAccommodation: false,
        owedCompensationBooking: true,
        product: {
          productnumber: CRMProductNumber.CAR,
        },
      });
      req.session.manageBooking.bookings.push({
        reference: '006',
        testDate: '2020-11-04T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        nonStandardAccommodation: false,
        owedCompensationBooking: true,
        product: {
          productnumber: CRMProductNumber.CAR,
        },
      });
      req.session.target = Target.NI;
      mockSchedulingGateway.getBooking.mockResolvedValue({});

      await controller.get(req, res);

      expect(res.bookings).toEqual([{
        reference: '005',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        nonStandardAccommodation: false,
        owedCompensationBooking: true,
        product: {
          productnumber: CRMProductNumber.CAR,
        },
      }, {
        reference: '006',
        testDate: '2020-11-04T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        nonStandardAccommodation: false,
        owedCompensationBooking: true,
        product: {
          productnumber: CRMProductNumber.CAR,
        },
      }, {
        reference: '003',
        testDate: '2020-11-04T11:40:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }, {
        reference: '001',
        testDate: '2020-11-05T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }]);
      expect(res.compensationEligibleNotificationLink).toEqual('/');
    });

    test('renders the manage booking list, with 2 tests compensation eligible, niDirect based, 2 instructor', async () => {
      req.session.manageBooking.bookings.push({
        reference: '005',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        nonStandardAccommodation: false,
        owedCompensationBooking: true,
        product: {
          productnumber: CRMProductNumber.ADIP1,
        },
      });
      req.session.manageBooking.bookings.push({
        reference: '006',
        testDate: '2020-11-04T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        nonStandardAccommodation: false,
        owedCompensationBooking: true,
        product: {
          productnumber: CRMProductNumber.ADIP1,
        },
      });
      req.session.target = Target.NI;
      mockSchedulingGateway.getBooking.mockResolvedValue({});

      await controller.get(req, res);

      expect(res.bookings).toEqual([{
        reference: '005',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        nonStandardAccommodation: false,
        owedCompensationBooking: true,
        product: {
          productnumber: CRMProductNumber.ADIP1,
        },
      }, {
        reference: '006',
        testDate: '2020-11-04T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        nonStandardAccommodation: false,
        owedCompensationBooking: true,
        product: {
          productnumber: CRMProductNumber.ADIP1,
        },
      }, {
        reference: '003',
        testDate: '2020-11-04T11:40:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }, {
        reference: '001',
        testDate: '2020-11-05T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }]);
      expect(res.compensationEligibleNotificationLink).toEqual('/instructor');
    });

    test('renders the manage booking list, with 2 tests compensation eligible, govUK based, 2 candidate', async () => {
      req.session.manageBooking.bookings.push({
        reference: '005',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        nonStandardAccommodation: false,
        owedCompensationBooking: true,
        governmentAgency: CRMGovernmentAgency.Dvsa,
        product: {
          productnumber: CRMProductNumber.CAR,
        },
      });
      req.session.manageBooking.bookings.push({
        reference: '006',
        testDate: '2020-11-04T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        nonStandardAccommodation: false,
        owedCompensationBooking: true,
        governmentAgency: CRMGovernmentAgency.Dvsa,
        product: {
          productnumber: CRMProductNumber.CAR,
        },
      });
      req.session.target = Target.GB;
      mockSchedulingGateway.getBooking.mockResolvedValue({});

      await controller.get(req, res);

      expect(res.bookings).toEqual([{
        reference: '005',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        owedCompensationBooking: true,
        governmentAgency: CRMGovernmentAgency.Dvsa,
        nonStandardAccommodation: false,
        product: {
          productnumber: CRMProductNumber.CAR,
        },
      }, {
        reference: '006',
        testDate: '2020-11-04T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        owedCompensationBooking: true,
        governmentAgency: CRMGovernmentAgency.Dvsa,
        nonStandardAccommodation: false,
        product: {
          productnumber: CRMProductNumber.CAR,
        },
      }, {
        reference: '003',
        testDate: '2020-11-04T11:40:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }, {
        reference: '001',
        testDate: '2020-11-05T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }]);
      expect(res.compensationEligibleNotificationLink).toEqual('/');
    });

    test('renders the manage booking list, with 2 tests compensation eligible, govUK based, 2 instructor', async () => {
      req.session.manageBooking.bookings.push({
        reference: '005',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        nonStandardAccommodation: false,
        owedCompensationBooking: true,
        governmentAgency: CRMGovernmentAgency.Dvsa,
        product: {
          productnumber: CRMProductNumber.ADIP1,
        },
      });
      req.session.manageBooking.bookings.push({
        reference: '006',
        testDate: '2020-11-04T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        nonStandardAccommodation: false,
        owedCompensationBooking: true,
        governmentAgency: CRMGovernmentAgency.Dvsa,
        product: {
          productnumber: CRMProductNumber.ADIP1,
        },
      });
      req.session.target = Target.GB;
      mockSchedulingGateway.getBooking.mockResolvedValue({});

      await controller.get(req, res);

      expect(res.bookings).toEqual([{
        reference: '005',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        owedCompensationBooking: true,
        governmentAgency: CRMGovernmentAgency.Dvsa,
        nonStandardAccommodation: false,
        product: {
          productnumber: CRMProductNumber.ADIP1,
        },
      }, {
        reference: '006',
        testDate: '2020-11-04T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        owedCompensationBooking: true,
        governmentAgency: CRMGovernmentAgency.Dvsa,
        nonStandardAccommodation: false,
        product: {
          productnumber: CRMProductNumber.ADIP1,
        },
      }, {
        reference: '003',
        testDate: '2020-11-04T11:40:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }, {
        reference: '001',
        testDate: '2020-11-05T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }]);
      expect(res.compensationEligibleNotificationLink).toEqual('/instructor');
    });

    test('renders the manage booking list, with 2 tests compensation eligible, govUK based, 1 instructor and 1 candidate', async () => {
      req.session.manageBooking.bookings.push({
        reference: '005',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        nonStandardAccommodation: false,
        owedCompensationBooking: true,
        governmentAgency: CRMGovernmentAgency.Dvsa,
        product: {
          productnumber: CRMProductNumber.CAR,
        },
      });
      req.session.manageBooking.bookings.push({
        reference: '006',
        testDate: '2020-11-04T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        nonStandardAccommodation: false,
        owedCompensationBooking: true,
        governmentAgency: CRMGovernmentAgency.Dvsa,
        product: {
          productnumber: CRMProductNumber.ADIP1,
        },
      });
      req.session.target = Target.GB;
      mockSchedulingGateway.getBooking.mockResolvedValue({});

      await controller.get(req, res);

      expect(res.bookings).toEqual([{
        reference: '005',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        owedCompensationBooking: true,
        governmentAgency: CRMGovernmentAgency.Dvsa,
        nonStandardAccommodation: false,
        product: {
          productnumber: CRMProductNumber.CAR,
        },
      }, {
        reference: '006',
        testDate: '2020-11-04T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        owedCompensationBooking: true,
        governmentAgency: CRMGovernmentAgency.Dvsa,
        nonStandardAccommodation: false,
        product: {
          productnumber: CRMProductNumber.ADIP1,
        },
      }, {
        reference: '003',
        testDate: '2020-11-04T11:40:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }, {
        reference: '001',
        testDate: '2020-11-05T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }]);
      expect(res.compensationEligibleNotificationLink).toEqual(`${config.landing.gb.citizen.book}`);
    });

    test('renders the manage booking list, with 2 tests compensation eligible, niDirect based, 1 instructor and 1 candidate', async () => {
      req.session.manageBooking.bookings.push({
        reference: '005',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        nonStandardAccommodation: false,
        owedCompensationBooking: true,
        governmentAgency: CRMGovernmentAgency.Dva,
        product: {
          productnumber: CRMProductNumber.CAR,
        },
      });
      req.session.manageBooking.bookings.push({
        reference: '006',
        testDate: '2020-11-04T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        nonStandardAccommodation: false,
        owedCompensationBooking: true,
        governmentAgency: CRMGovernmentAgency.Dva,
        product: {
          productnumber: CRMProductNumber.ADIP1,
        },
      });
      req.session.target = Target.NI;
      mockSchedulingGateway.getBooking.mockResolvedValue({});

      await controller.get(req, res);

      expect(res.bookings).toEqual([{
        reference: '005',
        testDate: '2020-11-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        owedCompensationBooking: true,
        governmentAgency: CRMGovernmentAgency.Dva,
        nonStandardAccommodation: false,
        product: {
          productnumber: CRMProductNumber.CAR,
        },
      }, {
        reference: '006',
        testDate: '2020-11-04T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        owedCompensationBooking: true,
        governmentAgency: CRMGovernmentAgency.Dva,
        nonStandardAccommodation: false,
        product: {
          productnumber: CRMProductNumber.ADIP1,
        },
      }, {
        reference: '003',
        testDate: '2020-11-04T11:40:00.000Z',
        nonStandardAccommodation: false,
        bookingStatus: CRMBookingStatus.Confirmed,
      }, {
        reference: '001',
        testDate: '2020-11-05T11:30:00.000Z',
        nonStandardAccommodation: false,
        bookingStatus: CRMBookingStatus.Confirmed,
      }]);
      expect(res.compensationEligibleNotificationLink).toEqual(`${config.landing.ni.citizen.compensationBook}`);
    });

    test('renders the manage booking list, with test compensation eligible but in the past', async () => {
      req.session.manageBooking.bookings.push({
        reference: '005',
        testDate: '2020-10-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        nonStandardAccommodation: false,
        owedCompensationBooking: true,
        product: {
          productnumber: CRMProductNumber.CAR,
        },
      });
      mockSchedulingGateway.getBooking.mockResolvedValue({});

      await controller.get(req, res);

      expect(res.compensationEligibleNotificationLink).toEqual('/');
      expect(res.bookings).toEqual([{
        reference: '005',
        testDate: '2020-10-04T11:10:00.000Z',
        bookingStatus: CRMBookingStatus.Cancelled,
        owedCompensationBooking: true,
        nonStandardAccommodation: false,
        product: {
          productnumber: CRMProductNumber.CAR,
        },
      }, {
        reference: '003',
        testDate: '2020-11-04T11:40:00.000Z',
        nonStandardAccommodation: false,
        bookingStatus: CRMBookingStatus.Confirmed,
      }, {
        reference: '001',
        testDate: '2020-11-05T11:30:00.000Z',
        nonStandardAccommodation: false,
        bookingStatus: CRMBookingStatus.Confirmed,
      }]);
    });

    test('render the manage booking list, with nsa details if it\'s an nsa booking', async () => {
      req.session.manageBooking.bookings.push(mockNsaBooking);

      await controller.get(req, res);

      expect(res.bookings).toStrictEqual([{
        reference: '003',
        testDate: '2020-11-04T11:40:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }, {
        reference: '001',
        testDate: '2020-11-05T11:30:00.000Z',
        bookingStatus: CRMBookingStatus.Confirmed,
        nonStandardAccommodation: false,
      }, mockNsaBooking]);
      expect(res.nsaBookingDetails).toEqual([
        {
          bookingId: mockNsaBooking.bookingId,
          nsaStatus: NsaStatus.AwaitingCandidateSlotConfirmation,
          canViewSlots: true,
        },
      ]);
    });

    test('render the manage booking list, without nsa details - booking slots if it\'s an nsa booking with less than 3 slots', async () => {
      mockNsaBooking.nsaBookingSlots.pop();
      req.session.manageBooking.bookings.push(mockNsaBooking);

      await controller.get(req, res);

      expect(res.nsaBookingDetails).toEqual([
        {
          bookingId: mockNsaBooking.bookingId,
          nsaStatus: NsaStatus.AwaitingCandidateSlotConfirmation,
          canViewSlots: false,
        },
      ]);
    });

    test('render the manage booking list, with nsa details - booking slots if it\'s an nsa booking with more than 3 slots but one of them has a status of rejected', async () => {
      mockNsaBooking.nsaBookingSlots.push({
        _ftts_bookingid_value: 'mock-id-1',
        ftts_status: CRMNsaBookingSlotStatus.Rejected,
        ftts_reservationid: '004',
        ftts_expirydate: 'mock-expiry-date 4',
        _ftts_organisationid_value: 'mock-organisational-id 4',
        ftts_testdate: 'mock-test-date 4',
      });
      req.session.manageBooking.bookings.push(mockNsaBooking);

      await controller.get(req, res);

      expect(res.nsaBookingDetails).toEqual([
        {
          bookingId: mockNsaBooking.bookingId,
          nsaStatus: NsaStatus.AwaitingCandidateSlotConfirmation,
          canViewSlots: true,
        },
      ]);
    });
  });
});
