import { PageNames } from '@constants';
import { TestTypeController } from '@pages/test-type/test-type';
import {
  PreferredDay, PreferredLocation, Target, TestType, Context,
} from '../../../../src/domain/enums';
import { PriceListItem } from '../../../../src/domain/types';
import * as journeyHelper from '../../../../src/helpers/journey-helper';
import { CRMProductNumber } from '../../../../src/services/crm-gateway/enums';

jest.mock('../../../../src/helpers/journey-helper', () => ({
  isStandardJourney: jest.fn(),
  isNonStandardJourney: jest.fn(),
  isSupportedStandardJourney: jest.fn(),
  isZeroCostTest: jest.fn().mockImplementation((testType) => {
    if (testType === 'adip1dva' || testType === 'amip1') {
      return true;
    }
    return false;
  }),
}));

const mockJourneyHelper = journeyHelper as jest.Mocked<typeof journeyHelper>;

describe('Test type controller', () => {
  let controller: TestTypeController;
  let req: any;
  let res: any;

  const mockCrmGateway = {
    getPriceList: jest.fn(),
    getCandidateCompensatedBookings: jest.fn(),
    doesUserHaveDraftNSABooking: jest.fn(),
    getUserDraftNSABookingsIfExist: jest.fn(),
  };

  const mockPriceList: PriceListItem[] = [
    {
      testType: TestType.CAR,
      price: 23,
      product: {
        name: 'product1',
        productId: 'product-id-1',
        parentId: 'parent-id-1',
      },
    },
    {
      testType: TestType.MOTORCYCLE,
      price: 23,
      product: {
        name: 'product2',
        productId: 'product-id-2',
        parentId: 'parent-id-2',
      },
    },
    {
      testType: TestType.TAXI,
      price: 12,
      product: {
        name: 'product5',
        productId: 'product-id-5',
        parentId: 'parent-id-5',
      },
    },
  ];

  const mockSelectedEligibility = {
    testType: TestType.CAR,
    eligible: true,
    eligibleFrom: '2020-01-01',
    eligibleTo: '2030-01-01',
  };

  const instructorMockPriceList: PriceListItem[] = [
    {
      testType: TestType.ADIP1,
      price: 64,
      product: {
        productId: 'product-id-1',
        parentId: 'parent-id-1',
        name: 'adip1',
      },
    },
    {
      testType: TestType.ADIHPT,
      price: 66,
      product: {
        productId: 'product-id-2',
        parentId: 'parent-id-2',
        name: 'adihpt',
      },
    },
    {
      testType: TestType.ADIP1DVA,
      price: 66,
      product: {
        productId: 'product-id-5',
        parentId: 'parent-id-5',
        name: 'dva',
      },
    },
  ];

  const mockADIP1Eligibility = {
    testType: TestType.ADIP1,
    eligible: true,
    eligibleFrom: '2020-01-01',
    eligibleTo: '2030-01-01',
    personalReferenceNumber: '123456',
  };

  beforeEach(() => {
    req = {
      body: {
        testType: TestType.CAR,
      },
      session: {
        target: Target.GB,
        candidate: {
          candidateId: 'mockCandidateId',
          eligibilities: [
            {
              testType: TestType.CAR,
              eligible: true,
              eligibleFrom: '2020-01-01',
              eligibleTo: '2030-01-01',
            },
            {
              testType: TestType.MOTORCYCLE,
              eligible: true,
              eligibleFrom: '2020-01-01',
              eligibleTo: '2030-01-01',
            },
            {
              testType: TestType.TAXI, // DVA only
              eligible: true,
              eligibleFrom: '2020-01-01',
              eligibleTo: '2030-01-01',
            },
            {
              testType: TestType.ERS, // Not bookable online
              eligible: true,
              eligibleFrom: '2020-01-01',
              eligibleTo: '2030-01-01',
            },
            {
              testType: TestType.LGVCPC,
              eligible: false,
            },
          ],
        },
        priceLists: mockPriceList,
        currentBooking: {},
        journey: {
          support: false,
          standardAccommodation: true,
          inEditMode: false,
          inManagedBookingEditMode: false,
        },
        lastPage: '',
      },
      query: {
        context: Context.CITIZEN,
      },
    };

    res = {
      redirect: jest.fn(),
      render: jest.fn(),
    };

    mockCrmGateway.getPriceList.mockResolvedValue(mockPriceList);
    controller = new TestTypeController(mockCrmGateway as any);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET request', () => {
    describe('required session data', () => {
      test('throws if journey is missing', async () => {
        req.session.journey = undefined;

        await expect(controller.get(req, res)).rejects.toThrow();
      });

      test('throws if currentBooking is missing', async () => {
        req.session.currentBooking = undefined;

        await expect(controller.get(req, res)).rejects.toThrow();
      });

      test('throws if candidate is missing', async () => {
        req.session.candidate = undefined;

        await expect(controller.get(req, res)).rejects.toThrow();
      });
    });

    test('renders the page with correct view data', async () => {
      req.session.journey.support = false;
      req.session.journey.standardAccommodation = true;
      mockJourneyHelper.isStandardJourney.mockReturnValue(false);

      const tests = new Map();
      tests.set(TestType.CAR, {
        key: TestType.CAR,
        price: 23,
        isCompensationBooking: false,
        isZeroCostBooking: false,
      });
      tests.set(TestType.MOTORCYCLE, {
        key: TestType.MOTORCYCLE,
        price: 23,
        isCompensationBooking: false,
        isZeroCostBooking: false,
      });

      await controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.TEST_TYPE, {
        backLink: 'email-contact',
        errors: undefined,
        chosenTestType: undefined,
        tests,
      });
    });

    test('back link is check-your-answers when in edit mode', async () => {
      req.session.journey.support = false;
      req.session.journey.standardAccommodation = true;
      req.session.journey.inEditMode = true;
      mockJourneyHelper.isStandardJourney.mockReturnValue(true);

      await controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.TEST_TYPE, expect.objectContaining({
        backLink: 'check-your-answers',
      }));
    });

    test('back link is check-your-details when in edit mode and in non-standard accommodation journey', async () => {
      req.session.journey.support = true;
      req.session.journey.standardAccommodation = false;
      req.session.journey.inEditMode = true;
      mockJourneyHelper.isNonStandardJourney.mockReturnValue(true);

      await controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.TEST_TYPE, expect.objectContaining({
        backLink: 'check-your-details',
      }));
    });

    test('back link is invisible when in non-standard accommodation journey', async () => {
      req.session.journey.support = true;
      req.session.journey.standardAccommodation = false;
      mockJourneyHelper.isNonStandardJourney.mockReturnValue(true);

      await controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.TEST_TYPE, expect.objectContaining({
        backLink: undefined,
      }));
    });

    test('includes DVA-only test types in NI service', async () => {
      req.session.target = Target.NI;

      const tests = new Map();
      tests.set(TestType.CAR, {
        key: TestType.CAR,
        price: 23,
      });
      tests.set(TestType.MOTORCYCLE, {
        key: TestType.MOTORCYCLE,
        price: 23,
      });
      tests.set(TestType.TAXI, {
        key: TestType.TAXI,
        price: 12,
      });

      await controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.TEST_TYPE, expect.objectContaining({
        tests,
      }));
    });

    test('preselects chosen test type if set in session', async () => {
      req.session.currentBooking.testType = TestType.MOTORCYCLE;

      await controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.TEST_TYPE, expect.objectContaining({
        chosenTestType: TestType.MOTORCYCLE,
      }));
    });

    test('renders compensation bookings', async () => {
      mockCrmGateway.getCandidateCompensatedBookings.mockResolvedValue([
        {
          ftts_bookingstatus: 675030008,
          ftts_selected: true,
          bookingId: '42bcf7e8-43fc-eb11-94ef-000d3ad6739c',
          bookingProductReference: 'B-000-193-849-01',
          bookingReference: 'B-000-193-849',
          productNumber: CRMProductNumber.CAR,
          compensationAssigned: '2021-08-13T15:00:02.000Z',
          candidateName: 'Wendy',
          bookingStatus: 675030008,
          candidateId: '4ddab30e-f90e-eb11-a813-000d3a7f128d',
          bookingProductId: '9afee4ea-43fc-eb11-94ef-000d3ad67a18',
        },
      ]);
      const tests = new Map();
      tests.set(TestType.CAR, {
        key: TestType.CAR,
        price: 23,
        isCompensationBooking: true,
        isZeroCostBooking: false,
      });
      tests.set(TestType.MOTORCYCLE, {
        key: TestType.MOTORCYCLE,
        price: 23,
        isCompensationBooking: false,
        isZeroCostBooking: false,
      });

      await controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.TEST_TYPE, {
        backLink: 'email-contact',
        chosenTestType: undefined,
        errors: undefined,
        tests,
      });
      expect(req.session.compensationBookings).toStrictEqual([
        {
          ftts_bookingstatus: 675030008,
          ftts_selected: true,
          bookingId: '42bcf7e8-43fc-eb11-94ef-000d3ad6739c',
          bookingProductReference: 'B-000-193-849-01',
          bookingReference: 'B-000-193-849',
          productNumber: '1001',
          compensationAssigned: '2021-08-13T15:00:02.000Z',
          candidateName: 'Wendy',
          bookingStatus: 675030008,
          candidateId: '4ddab30e-f90e-eb11-a813-000d3a7f128d',
          bookingProductId: '9afee4ea-43fc-eb11-94ef-000d3ad67a18',
        },
      ]);
    });

    test('for instructor journey, do not render test types without a matched PRN', async () => {
      mockCrmGateway.getPriceList.mockResolvedValue(instructorMockPriceList);
      const tests = new Map();
      req.session.journey.isInstructor = true;
      req.session.target = Target.NI;
      req.session.candidate.paymentReceiptNumber = '22222222222';
      req.session.candidate.eligibilities = [
        mockADIP1Eligibility,
        {
          testType: TestType.ADIHPT,
          eligible: true,
          eligibleFrom: '2020-01-01',
          eligibleTo: '2030-01-01',
          personalReferenceNumber: '987654',
        },
        {
          testType: TestType.ADIP1DVA, // DVA only
          eligible: true,
          eligibleFrom: '2020-01-01',
          eligibleTo: '2030-01-01',
          paymentReceiptNumber: '1234567890123456',
        },
      ];

      await controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.TEST_TYPE, {
        backLink: 'email-contact',
        chosenTestType: undefined,
        errors: undefined,
        tests,
      });
    });

    test('for instructor journey, do not render test types without a matched PRN - undefined PRN', async () => {
      mockCrmGateway.getPriceList.mockResolvedValue(instructorMockPriceList);
      const tests = new Map();
      req.session.journey.isInstructor = true;
      req.session.target = Target.NI;
      req.session.candidate.paymentReceiptNumber = undefined;
      req.session.candidate.eligibilities = [
        mockADIP1Eligibility,
        {
          testType: TestType.ADIHPT,
          eligible: true,
          eligibleFrom: '2020-01-01',
          eligibleTo: '2030-01-01',
          personalReferenceNumber: '987654',
        },
        {
          testType: TestType.ADIP1DVA, // DVA only
          eligible: true,
          eligibleFrom: '2020-01-01',
          eligibleTo: '2030-01-01',
          paymentReceiptNumber: '1234567890123456',
        },
      ];

      await controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.TEST_TYPE, {
        backLink: 'email-contact',
        chosenTestType: undefined,
        errors: undefined,
        tests,
      });
    });

    test('renders zero cost bookings', async () => {
      mockCrmGateway.getPriceList.mockResolvedValue(instructorMockPriceList);
      const tests = new Map();
      tests.set(TestType.ADIP1DVA, {
        key: TestType.ADIP1DVA,
        price: 66,
        isCompensationBooking: false,
        isZeroCostBooking: true,
      });
      req.session.journey.isInstructor = true;
      req.session.target = Target.NI;
      req.session.candidate.paymentReceiptNumber = '1234567890123456';
      req.session.candidate.eligibilities = [
        mockADIP1Eligibility,
        {
          testType: TestType.ADIHPT,
          eligible: true,
          eligibleFrom: '2020-01-01',
          eligibleTo: '2030-01-01',
          personalReferenceNumber: '987654',
        },
        {
          testType: TestType.ADIP1DVA, // DVA only
          eligible: true,
          eligibleFrom: '2020-01-01',
          eligibleTo: '2030-01-01',
          paymentReceiptNumber: '1234567890123456',
        },
      ];

      await controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.TEST_TYPE, {
        backLink: 'email-contact',
        chosenTestType: undefined,
        errors: undefined,
        tests,
      });
    });
  });

  describe('POST request', () => {
    describe('required session data', () => {
      test('throws if journey is missing', async () => {
        req.session.journey = undefined;

        await expect(controller.post(req, res)).rejects.toThrow();
      });
    });

    test('re-renders the page with errors if validation fails', async () => {
      req.hasErrors = true;
      req.errors = [{ msg: 'Test error', location: {}, param: '' }];
      req.session.journey.standardAccommodation = true;
      req.session.journey.support = true;
      mockJourneyHelper.isStandardJourney.mockReturnValue(true);

      const tests = new Map();
      tests.set(TestType.CAR, {
        key: TestType.CAR,
        price: 23,
        isCompensationBooking: false,
        isZeroCostBooking: false,
      });
      tests.set(TestType.MOTORCYCLE, {
        key: TestType.MOTORCYCLE,
        price: 23,
        isCompensationBooking: false,
        isZeroCostBooking: false,
      });

      await controller.post(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.TEST_TYPE, {
        backLink: 'email-contact',
        errors: req.errors,
        chosenTestType: undefined,
        tests,
      });
    });

    test('throws if selected test type has missing price list', async () => {
      const priceList = [
        {
          testType: TestType.MOTORCYCLE,
          price: 66,
          product: {
            productId: 'product-id-2',
            parentId: 'parent-id-2',
            name: 'motorcycle',
          },
        },
      ];
      mockCrmGateway.getPriceList.mockResolvedValue(priceList);
      req.session.priceLists = priceList;
      req.body.testType = TestType.CAR;

      await expect(() => controller.post(req, res))
        .rejects
        .toThrow(Error('TestTypeController::post: priceList missing for test type: car'));
    });

    test('stores the chosen test type and eligibility in session', async () => {
      req.body.testType = TestType.MOTORCYCLE;

      await controller.post(req, res);

      expect(req.session.currentBooking.testType).toBe(TestType.MOTORCYCLE);
      expect(req.session.currentBooking.eligibility).toStrictEqual({
        testType: TestType.MOTORCYCLE,
        eligible: true,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      });
    });

    describe('if user has draft NSA booking', () => {
      test('and user is in standard journey then last page is test type and redirect to received support request page', async () => {
        mockJourneyHelper.isNonStandardJourney.mockReturnValue(false);
        mockCrmGateway.getUserDraftNSABookingsIfExist.mockResolvedValue(true);

        await controller.post(req, res);

        expect(req.session.lastPage).toEqual('test-type');
        expect(res.redirect).toHaveBeenCalledWith('received-support-request');
      });
    });

    test('stores the selected compensation booking', async () => {
      req.session.compensationBookings = [{
        ftts_bookingstatus: 675030008,
        ftts_selected: true,
        bookingId: '42bcf7e8-43fc-eb11-94ef-000d3ad6739c',
        bookingProductReference: 'B-000-193-849-01',
        bookingReference: 'B-000-193-849',
        productNumber: CRMProductNumber.MOTORCYCLE,
        compensationAssigned: '2021-08-13T15:00:02.000Z',
        candidateName: 'Wendy',
        bookingStatus: 675030008,
        candidateId: '4ddab30e-f90e-eb11-a813-000d3a7f128d',
        bookingProductId: '9afee4ea-43fc-eb11-94ef-000d3ad67a18',
      }];
      req.body.testType = TestType.MOTORCYCLE;

      await controller.post(req, res);

      expect(req.session.currentBooking.testType).toBe(TestType.MOTORCYCLE);
      expect(req.session.currentBooking.compensationBooking).toStrictEqual({
        ftts_bookingstatus: 675030008,
        ftts_selected: true,
        bookingId: '42bcf7e8-43fc-eb11-94ef-000d3ad6739c',
        bookingProductReference: 'B-000-193-849-01',
        bookingReference: 'B-000-193-849',
        productNumber: CRMProductNumber.MOTORCYCLE,
        compensationAssigned: '2021-08-13T15:00:02.000Z',
        candidateName: 'Wendy',
        bookingStatus: 675030008,
        candidateId: '4ddab30e-f90e-eb11-a813-000d3a7f128d',
        bookingProductId: '9afee4ea-43fc-eb11-94ef-000d3ad67a18',
      });
    });

    test('redirects to test-language', async () => {
      await controller.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('test-language');
    });

    describe('if journey edit mode is set and in the non-standard journey', () => {
      test('clears the existing booking session data except support text and switches off edit mode', async () => {
        req.session.journey.inEditMode = true;
        req.session.currentBooking.preferredDay = 'Sundays...';
        req.session.currentBooking.preferredDayOption = PreferredDay.ParticularDay;
        req.session.currentBooking.preferredLocation = 'Dudley';
        req.session.currentBooking.preferredLocationOption = PreferredLocation.ParticularLocation;
        req.session.currentBooking.customSupport = 'I need support';
        mockJourneyHelper.isNonStandardJourney.mockReturnValue(true);

        await controller.post(req, res);

        expect(req.session.journey.inEditMode).toBe(false);
        expect(req.session.currentBooking.preferredDay).toBe('Sundays...');
        expect(req.session.currentBooking.preferredDayOption).toBe(PreferredDay.ParticularDay);
        expect(req.session.currentBooking.preferredLocation).toBe('Dudley');
        expect(req.session.currentBooking.preferredLocationOption).toBe(PreferredLocation.ParticularLocation);
        expect(req.session.currentBooking.customSupport).toBe('I need support');
        expect(req.session.currentBooking.testType).toBe(TestType.CAR);
        expect(req.session.currentBooking.language).toBeUndefined();
        expect(req.session.testCentreSearch).toBeUndefined();
      });
    });

    describe('if journey edit mode is set and in the standard journey', () => {
      test('clears the existing booking session data and switches off edit mode', async () => {
        req.session.journey.inEditMode = true;
        mockJourneyHelper.isNonStandardJourney.mockReturnValue(false);

        await controller.post(req, res);

        expect(req.session.journey.inEditMode).toBe(false);
        expect(req.session.currentBooking).toStrictEqual({
          compensationBooking: undefined,
          testType: TestType.CAR,
          priceList: mockPriceList[0],
          eligibility: mockSelectedEligibility,
        });
        expect(req.session.testCentreSearch).toBeUndefined();
      });
    });
  });
});
