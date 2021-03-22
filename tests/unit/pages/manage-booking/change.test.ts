import { Booking } from '../../../../src/domain/booking/booking';
import { TestType } from '../../../../src/domain/enums';
import { ManageBookingChangeController } from '../../../../src/pages/manage-booking/change';
import {
  CRMBookingStatus, CRMRemit, CRMTestLanguage, CRMVoiceOver,
} from '../../../../src/services/crm-gateway/enums';

describe('Manage booking - change controller', () => {
  let req: any;
  let res: any;

  const mockBookingRef = 'mockRef';
  const mockTestDate = '2020-10-29T14:00:00.000Z';
  const mockRemit = CRMRemit.England;

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
          },
          bookings: [
            {
              bookingProductId: 'mockBookingProductId',
              reference: mockBookingRef,
              bookingId: 'mockBookingId',
              bookingStatus: CRMBookingStatus.Confirmed,
              testDate: mockTestDate,
              testLanguage: CRMTestLanguage.English,
              voiceoverLanguage: CRMVoiceOver.None,
              additionalSupport: null,
              paymentStatus: null,
              testType: TestType.Car,
              origin: 1,
              testCentre: {
                name: 'mockTestCentreName',
                addressLine1: 'mockTestCentreAddress1',
                addressLine2: 'mockTestCentreAddress2',
                city: 'mockTestCentreCity',
                postcode: 'mockTestCentrePostcode',
                remit: mockRemit,
              },
            },
          ],
        },
      },
    };

    res = {
      redirect: jest.fn(),
      render: jest.fn(),
    };

    Booking.prototype.isViewable = jest.fn(() => true);
    Booking.prototype.testIsToday = jest.fn(() => true);
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

      expect(res.render).toHaveBeenCalledWith('manage-booking/change', expect.objectContaining({
        booking: req.session.manageBooking.bookings[0],
      }));
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
          mockCrmGateway.calculateThreeWorkingDays.mockResolvedValueOnce('2020-10-25');

          await controller.get(req, res);

          expect(mockCrmGateway.calculateThreeWorkingDays).toHaveBeenCalledWith(mockTestDate, mockRemit);
          expect(req.session.manageBooking.bookings[0]).toStrictEqual(expect.objectContaining({
            testDateMinus3ClearWorkingDays: '2020-10-25',
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
            mockCrmGateway.calculateThreeWorkingDays.mockResolvedValueOnce('');

            await controller.get(req, res);

            expect(res.render).toHaveBeenCalledWith('manage-booking/change', expect.objectContaining({
              errorCalculatingWorkingDays: true,
            }));
          });
        });
      });
    });
  });
});
