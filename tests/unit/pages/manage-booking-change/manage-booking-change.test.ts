import { PageNames } from '@constants';
import { ManageBookingChangeController } from '@pages/manage-booking-change/manage-booking-change';
import { Booking } from '../../../../src/domain/booking/booking';
import {
  Language, TCNRegion, TestSupportNeed, Voiceover,
} from '../../../../src/domain/enums';
import {
  CRMBookingStatus, CRMFinanceTransactionStatus, CRMGovernmentAgency, CRMProductNumber, CRMRemit, CRMTestLanguage, CRMTransactionType, CRMVoiceOver,
} from '../../../../src/services/crm-gateway/enums';
import { mockManageBooking } from '../../../mocks/data/manage-bookings';

describe('Manage booking - change controller', () => {
  let req: any;
  let res: any;

  const mockBookingRef = 'mockRef';
  const mockTestDate = mockManageBooking().testDate;
  const mockRemit = mockManageBooking().testCentre.remit;
  jest.mock('../../../../src/services/crm-gateway/crm-helper', () => ({
    mapToSupportType: jest.fn(),
  }));

  const mockCrmGateway = {
    calculateThreeWorkingDays: jest.fn(),
  };

  const controller = new ManageBookingChangeController(mockCrmGateway as any);

  beforeEach(() => {
    req = {
      hasErrors: false,
      errors: [],
      params: {
        ref: mockBookingRef,
      },
      session: {
        manageBooking: {
          candidate: {
            candidateId: 'mockCandidateId',
            eligibleToBookOnline: true,
          },
          bookings: [
            mockManageBooking(),
          ],
        },
        journey: {
          inEditMode: false,
        },
      },
    };

    res = {
      redirect: jest.fn(),
      render: jest.fn(),
    };

    Booking.prototype.isViewable = jest.fn(() => true);
    Booking.prototype.testIsToday = jest.fn(() => true);
    Booking.prototype.isCreatedToday = jest.fn(() => true);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {
    test('redirects to the manage booking login page if no candidate in session', async () => {
      delete req.session.manageBooking.candidate;

      await controller.get(req, res);

      expect(res.redirect).toHaveBeenCalledWith('login');
    });

    test('redirects to the manage booking login page if reference no is not a candidates booking', async () => {
      const testReq = {
        ...req,
        params: {
          ref: 'anotherRef',
        },
      };

      await controller.get(testReq, res);

      expect(res.redirect).toHaveBeenCalledWith('login');
    });

    test('redirects to the manage booking login page if there are no bookings', async () => {
      delete req.session.manageBooking.bookings;

      await controller.get(req, res);

      expect(res.redirect).toHaveBeenCalledWith('login');
    });

    test('renders the change booking page', async () => {
      await controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE, {
        booking: req.session.manageBooking.bookings[0],
        bookingCannotBeCancelled: true,
        bookingCannotBeRescheduled: true,
        bslAvailable: true,
        bslRequested: false,
        eligibleToBookOnline: true,
        bookingCannotBeChanged: true,
        canChangeLanguage: true,
        showBslChangeButton: true,
        showVoiceoverChangeButton: true,
        testLanguage: {
          testLanguage: Language.ENGLISH,
        },
        voiceover: Voiceover.NONE,
        voiceoverRequested: false,
        createdToday: true,
        testIsToday: true,
        lastRefundOrRescheduleDate: undefined,
        voiceoverAvailable: true,
        isZeroCostBooking: false,
        testSupportNeeded: [TestSupportNeed.NoSupport],
        hasSupportedBeenRequested: false,
      });
    });

    test('renders the change booking page with support requested', async () => {
      req.session.manageBooking.bookings = [{
        bookingProductId: 'mockBookingProductId',
        reference: 'mockRef',
        bookingId: 'mockBookingId',
        bookingProductRef: 'mockBookingProductRef',
        bookingStatus: CRMBookingStatus.Confirmed,
        testDate: '2020-12-08T09:45:00.000Z',
        testLanguage: CRMTestLanguage.English,
        voiceoverLanguage: CRMVoiceOver.None,
        additionalSupport: null,
        paymentStatus: null,
        price: 23,
        salesReference: 'mockSalesRef',
        testDateMinus3ClearWorkingDays: '2020-12-04T09:45:00.000Z',
        nonStandardAccommodation: false,
        governmentAgency: CRMGovernmentAgency.Dvsa,
        enableEligibilityBypass: false,
        compensationAssigned: null,
        compensationRecognised: null,
        owedCompensationBooking: false,
        isZeroCostBooking: false,
        origin: 1,
        testCentre: {
          siteId: 'mockSiteId',
          ftts_tcntestcentreid: 'mockTcnTestCentreId',
          name: 'mockTestCentreName',
          addressLine1: 'mockTestCentreAddress1',
          addressLine2: 'mockTestCentreAddress2',
          addressCity: 'mockTestCentreCity',
          addressCounty: 'mockTestAddressCounty',
          addressPostalCode: 'mockTestCentrePostcode',
          remit: CRMRemit.England,
          region: TCNRegion.A,
        },
        testSupportNeed: [675030005, 675030009],
        foreignlanguageselected: 'Spanish',
        financeTransaction: {
          financeTransactionId: 'mockFinanceTransactionId',
          transactionType: CRMTransactionType.Booking,
          transactionStatus: CRMFinanceTransactionStatus.Recognised,
        },
        product: {
          productid: '001',
          _parentproductid_value: '002',
          productnumber: CRMProductNumber.CAR,
        },
        createdOn: '2021-04-04',
      },
      ];

      await controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE, {
        booking: req.session.manageBooking.bookings[0],
        bookingCannotBeCancelled: true,
        bookingCannotBeRescheduled: true,
        bslAvailable: true,
        bslRequested: false,
        eligibleToBookOnline: true,
        bookingCannotBeChanged: true,
        canChangeLanguage: true,
        showBslChangeButton: true,
        showVoiceoverChangeButton: true,
        testLanguage: {
          testLanguage: Language.ENGLISH,
        },
        voiceover: Voiceover.NONE,
        voiceoverRequested: false,
        createdToday: true,
        testIsToday: true,
        lastRefundOrRescheduleDate: undefined,
        voiceoverAvailable: true,
        isZeroCostBooking: false,
        testSupportNeeded: ['foreignLanguageInterpreter', 'oralLanguageModifier'],
        hasSupportedBeenRequested: true,
      });
    });

    test.each([
      ['ADI P1', CRMProductNumber.ADIP1DVA],
      ['AMI P1', CRMProductNumber.AMIP1],
    ])('when the test is a DVA %s instructor test then it renders the change booking page without the voiceover option present', async (_, testProductNumber) => {
      req.session.manageBooking.bookings[0].product.productnumber = testProductNumber;

      await controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE, expect.objectContaining({
        voiceoverAvailable: false,
      }));
    });

    test.each([
      ['ADI P1', CRMProductNumber.ADIP1DVA],
      ['AMI P1', CRMProductNumber.AMIP1],
    ])('when the test is a DVA %s instructor test then it renders the change booking page with zero cost booking flag set to true', async (_, testProductNumber) => {
      req.session.manageBooking.bookings[0].product.productnumber = testProductNumber;

      await controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE, expect.objectContaining({
        isZeroCostBooking: true,
      }));
    });

    test('throws an error if no manage booking is set in session', async () => {
      delete req.session.manageBooking;

      await expect(controller.get(req, res)).rejects.toEqual(new Error('ManageBookingChangeController::get: No manageBooking set'));
    });

    describe('CRM working days calculation', () => {
      describe('if the booking is for today', () => {
        test('does not call CRM as the working days calculation is not needed', async () => {
          Booking.prototype.testIsToday = jest.fn(() => true);

          await controller.get(req, res);

          expect(mockCrmGateway.calculateThreeWorkingDays).not.toHaveBeenCalled();
        });
      });

      describe('if the booking is for a day other than today', () => {
        beforeEach(() => {
          Booking.prototype.testIsToday = jest.fn(() => false);
        });

        test('calls CRM to get the date 3 clear working days prior to the test date and stores it in the session', async () => {
          mockCrmGateway.calculateThreeWorkingDays.mockResolvedValueOnce('2020-12-12');
          req.session.manageBooking.bookings[0].testDateMinus3ClearWorkingDays = undefined;

          await controller.get(req, res);

          expect(mockCrmGateway.calculateThreeWorkingDays).toHaveBeenCalledWith(mockTestDate, mockRemit);
          expect(req.session.manageBooking.bookings[0]).toStrictEqual(expect.objectContaining({
            testDateMinus3ClearWorkingDays: '2020-12-12',
          }));
        });

        describe('if the CRM 3 working days value already exists in the session', () => {
          test('uses the stored value without needing to call CRM again', async () => {
            req.session.manageBooking.bookings[0].testDateMinus3ClearWorkingDays = '2020-10-25';

            await controller.get(req, res);

            expect(mockCrmGateway.calculateThreeWorkingDays).not.toHaveBeenCalled();
          });
        });

        describe('if the CRM call fails with an empty result', () => {
          test('renders the page with an error warning', async () => {
            req.session.manageBooking.bookings[0].testDateMinus3ClearWorkingDays = undefined;
            mockCrmGateway.calculateThreeWorkingDays.mockResolvedValueOnce('');

            await controller.get(req, res);

            expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE, {
              booking: req.session.manageBooking.bookings[0],
              bslAvailable: true,
              bslRequested: false,
              canChangeLanguage: true,
              eligibleToBookOnline: true,
              errorCalculatingWorkingDays: true,
              showBslChangeButton: true,
              showVoiceoverChangeButton: true,
              testLanguage: {
                testLanguage: Language.ENGLISH,
              },
              voiceover: Voiceover.NONE,
              voiceoverRequested: false,
              voiceoverAvailable: true,
              isZeroCostBooking: false,
              testSupportNeeded: [TestSupportNeed.NoSupport],
            });
          });
        });
      });
    });
  });
});
