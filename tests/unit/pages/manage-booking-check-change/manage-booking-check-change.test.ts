import { CRMVoiceOver } from '@dvsa/ftts-crm-test-client/dist/enums';
import MockDate from 'mockdate';
import {
  CheckChangeViewData, ConfirmChangeViewData,
  ManageBookingCheckChangeController,
} from '@pages/manage-booking-check-change/manage-booking-check-change';
import { PageNames } from '@constants';
import { Booking } from '../../../../src/domain/booking/booking';
import { Booking as BookingSessionObject } from '../../../../src/services/session';
import {
  Locale, Target, Language, TCNRegion, Voiceover, TestType, Origin,
} from '../../../../src/domain/enums';
import { BusinessTelemetryEvents, logger } from '../../../../src/helpers/logger';
import { CRMGateway } from '../../../../src/services/crm-gateway/crm-gateway';
import { SchedulingGateway, SlotUnavailableError } from '../../../../src/services/scheduling/scheduling-gateway';
import { buildBookingRescheduledEmailContent } from '../../../../src/services/notifications/content/builders';
import { NotificationsGateway } from '../../../../src/services/notifications/notifications-gateway';
import { BookingRescheduledDetails } from '../../../../src/services/notifications/types';
import { mockCurrentBooking, mockManageBooking } from '../../../mocks/data/manage-bookings';
import { Centre } from '../../../../src/domain/types';
import { TestLanguage } from '../../../../src/domain/test-language';
import { CRMAdditionalSupport, CRMBookingStatus } from '../../../../src/services/crm-gateway/enums';
import { mockCentres } from '../../../mocks/data/mock-data';
import { BookingManager } from '../../../../src/helpers/booking-manager';
import { translate } from '../../../../src/helpers/language';
import { BookingDetails } from '../../../../src/services/crm-gateway/interfaces';

jest.mock('../../../../src/services/crm-gateway/crm-gateway');
jest.mock('@dvsa/cds-retry');
jest.mock('../../../../src/helpers/language', () => ({
  translate: (key: string): string | undefined => {
    if (key === 'generalContent.yes') {
      return 'Yes';
    }
    if (key === 'generalContent.language.english') {
      return 'English';
    }
    return undefined;
  },
}));
jest.mock('../../../../src/helpers/logger');

describe('Manage booking - check change controller', () => {
  let req: any;
  let res: any;

  // Mocking date as booking.canBeRescheduled relies on comparing current date to 3 working days
  const mockToday = '2020-02-04T12:00:00.000Z';
  MockDate.set(mockToday);

  const mockCandidateEmail = 'candidate@email.com';
  const mockCandidateAddress = {
    line1: 'Line 1',
    line2: 'Line 2 optional',
    line3: 'Line 3 optional',
    line4: 'Line 4 optional',
    city: 'City',
    postcode: 'Postcode',
  };
  const mockRescheduleCount = 2;

  const mockCRMGateway = {
    updateTCNUpdateDate: jest.fn(),
    updateBookingStatus: jest.fn(() => Promise.resolve()),
    updateLanguage: jest.fn(() => Promise.resolve()),
    updateAdditionalSupport: jest.fn(() => Promise.resolve()),
    updateVoiceover: jest.fn(() => Promise.resolve()),
    rescheduleBookingAndConfirm: jest.fn(() => Promise.resolve()),
    getCandidateBookings: jest.fn(() => Promise.resolve()),
    getLicenceAndCandidate: () => ({
      candidate: {
        email: 'test@test.com',
      },
    }),
    getCandidateByLicenceNumber: jest.fn(() => Promise.resolve),
    calculateThreeWorkingDays: jest.fn(() => Promise.resolve('2020-12-04')),
    getRescheduleCount: jest.fn(),
  };

  const mockSchedulingGateway = {
    reserveSlot: jest.fn(),
    deleteBooking: jest.fn(),
    confirmBooking: jest.fn(),
  };

  const mockNotificationsGateway = {
    sendEmail: jest.fn(),
  };

  const mockBookingManager = {
    loadCandidateBookings: jest.fn(),
  };

  const controller = new ManageBookingCheckChangeController(
    mockCRMGateway as unknown as CRMGateway,
    mockSchedulingGateway as unknown as SchedulingGateway,
    mockNotificationsGateway as unknown as NotificationsGateway,
    mockBookingManager as unknown as BookingManager,
  );
  let currentBooking: BookingSessionObject;
  let manageBooking: BookingDetails;

  beforeEach(() => {
    currentBooking = mockCurrentBooking();
    manageBooking = mockManageBooking();
    req = {
      hasErrors: false,
      errors: [],
      params: {
        ref: 'mockRef',
      },
      session: {
        manageBooking: {
          candidate: {
            candidateId: 'mockCandidateId',
            licenceNumber: 'BENTO603026A97BQ',
            firstnames: 'First Names',
            surname: 'Surname',
            email: mockCandidateEmail,
            address: mockCandidateAddress,
            eligibleToBookOnline: true,
            behaviouralMarker: false,
            behaviouralMarkerExpiryDate: undefined,
          },
          bookings: [
            manageBooking,
          ],
          getBooking: () => manageBooking,
        },
        currentBooking,
        journey: {
          inManagedBookingEditMode: true,
        },
        manageBookingEdits: {},
      },
    };

    res = {
      redirect: jest.fn(),
      render: jest.fn(),
    };

    Booking.prototype.canBeCancelled = jest.fn(() => true);
    Booking.prototype.isRefundable = jest.fn(() => true);

    mockCRMGateway.getRescheduleCount.mockResolvedValue(mockRescheduleCount);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {
    test('redirects to the manage booking login page if no candidate in session', () => {
      delete req.session.manageBooking.candidate;

      controller.get(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/manage-booking/login');
    });

    test('redirects to the manage booking login page if there are no bookings', () => {
      delete req.session.manageBooking.bookings;

      controller.get(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/manage-booking/login');
    });

    test('redirects to the manage booking login page if candidate is not eligible to book online', () => {
      req.session.manageBooking.candidate.eligibleToBookOnline = false;

      controller.get(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/manage-booking/login');
    });

    test('renders the check change page with dateTime changes', () => {
      const updatedDateDate = new Date('2010-01-01').toISOString();
      const changeViewData: CheckChangeViewData = {
        booking: {
          testDate: updatedDateDate,
          testCentre: {
            addressLine1: mockCurrentBooking().centre.addressLine1,
            addressLine2: mockCurrentBooking().centre.addressLine2,
            name: mockCurrentBooking().centre.name,
            addressPostalCode: mockCurrentBooking().centre.addressPostalCode,
            addressCity: mockCurrentBooking().centre.addressCity,
            addressCounty: mockCurrentBooking().centre.addressCounty,
          },
        },
      };
      req.session.manageBookingEdits.dateTime = updatedDateDate;

      controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHECK_CHANGE, {
        booking: changeViewData.booking,
      });
    });

    test('renders the check change page with location changes', () => {
      const updatedDateTime = new Date('2010-01-01').toISOString();
      const updatedTestCentre: Partial<Centre> = {
        name: 'new name',
        addressLine1: 'new address line 1',
        addressLine2: 'new address line 2',
        addressCity: 'new city',
        addressPostalCode: 'new post code',
        addressCounty: 'new county',
      };
      req.session.manageBookingEdits.centre = updatedTestCentre;
      req.session.manageBookingEdits.dateTime = updatedDateTime;

      const changeViewData: CheckChangeViewData = {
        booking: {
          testDate: updatedDateTime,
          testCentre: {
            addressLine1: 'new address line 1',
            addressLine2: 'new address line 2',
            name: 'new name',
            addressPostalCode: 'new post code',
            addressCity: 'new city',
            addressCounty: 'new county',
          },
        },
      };

      controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHECK_CHANGE, {
        booking: changeViewData.booking,
      });
    });

    test('renders the check change page without previous test centre leaking', () => {
      const previousTestCentre: Partial<Centre> = {
        name: 'previous name',
        addressLine1: 'previous address line 1',
        addressLine2: 'previous address line 2',
        addressCity: 'previous city',
        addressPostalCode: 'previous post code',
        addressCounty: 'previous county',
      };
      req.session.currentBooking.centre = previousTestCentre;

      const updatedDateTime = new Date('2010-01-01').toISOString();
      const updatedTestCentre: Partial<Centre> = {
        name: 'new name',
        addressLine1: 'new address line 1',
        addressCity: 'new city',
        addressPostalCode: 'new post code',
        addressCounty: 'new county',
      };
      req.session.manageBookingEdits.centre = updatedTestCentre;
      req.session.manageBookingEdits.dateTime = updatedDateTime;

      const changeViewData: CheckChangeViewData = {
        booking: {
          testDate: updatedDateTime,
          testCentre: {
            addressLine1: 'new address line 1',
            name: 'new name',
            addressPostalCode: 'new post code',
            addressCity: 'new city',
            addressCounty: 'new county',
          },
        },
      };

      controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHECK_CHANGE, {
        booking: changeViewData.booking,
      });
    });

    test('renders the check change page with language changes', () => {
      req.session.manageBookingEdits.language = Language.ENGLISH;

      const changeViewData: CheckChangeViewData = {
        booking: {
          language: 'English',
        },
      };

      controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHECK_CHANGE, {
        booking: changeViewData.booking,
      });
    });

    test('renders the check change page with voiceover changes', () => {
      req.session.manageBookingEdits.voiceover = Voiceover.ENGLISH;

      const changeViewData: CheckChangeViewData = {
        booking: {
          voiceover: 'English',
        },
      };

      controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHECK_CHANGE, {
        booking: changeViewData.booking,
      });
    });

    test('renders the check change page with bsl changes', () => {
      req.session.manageBookingEdits.bsl = true;

      const changeViewData: CheckChangeViewData = {
        booking: {
          bsl: 'Yes',
        },
      };

      controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHECK_CHANGE, {
        booking: changeViewData.booking,
      });
    });

    test('throws an error if manage booking is missing from the session', () => {
      delete req.session.manageBooking;

      expect(() => controller.get(req, res)).toThrow('ManageBookingCheckChangeController::get: No manageBooking set');
    });

    test('throws an error if manage booking edits is missing from the session', () => {
      delete req.session.manageBookingEdits;

      expect(() => controller.get(req, res)).toThrow('ManageBookingCheckChangeController::get: No manageBookingEdits set');
    });

    test('can cancel out change', () => {
      const booking = {
        ...req.session.manageBooking.bookings[0],
      };

      controller.reset(req, res);

      expect(res.redirect).toHaveBeenCalledWith(`/manage-booking/${booking.reference}`);
      expect(req.session.currentBooking).toBeUndefined();
      expect(req.session.journey).toStrictEqual(expect.objectContaining({
        inManagedBookingEditMode: false,
      }));
      expect(req.session.testCentreSearch).toBeUndefined();
    });

    test('throws if missing session data - manageBooking', () => {
      req.session.manageBooking = undefined;

      expect(() => controller.get(req, res)).toThrow('ManageBookingCheckChangeController::get: No manageBooking set');
    });

    test('throws if missing session data - manageBookingEdits', () => {
      req.session.manageBookingEdits = undefined;

      expect(() => controller.get(req, res)).toThrow('ManageBookingCheckChangeController::get: No manageBookingEdits set');
    });
  });

  describe('POST', () => {
    describe('if the booking time/location has been changed', () => {
      const mockNewSlot = '2020-12-10T13:15:00.000Z';
      beforeEach(() => {
        req.session.manageBookingEdits = {
          dateTime: mockNewSlot,
        };
      });

      test('calls the scheduling gateway to reserve the new slot', async () => {
        mockSchedulingGateway.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });
        const { centre, testType } = req.session.currentBooking;

        await controller.post(req, res);

        expect(mockSchedulingGateway.reserveSlot).toHaveBeenCalledWith(centre, testType, mockNewSlot);
      });

      test('calls the scheduling gateway to cancel the old slot', async () => {
        mockSchedulingGateway.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });
        mockSchedulingGateway.deleteBooking.mockResolvedValueOnce({});
        const { bookingProductRef } = req.session.currentBooking;

        await controller.post(req, res);

        expect(mockSchedulingGateway.deleteBooking).toHaveBeenCalledWith(bookingProductRef, TCNRegion.A);
      });

      describe('call scheduling api to confirm slot', () => {
        test('calls the scheduling gateway to confirm the new slot', async () => {
          mockSchedulingGateway.reserveSlot.mockResolvedValueOnce({
            reservationId: 'mockReservationId',
          });
          mockSchedulingGateway.deleteBooking.mockResolvedValueOnce({});
          mockSchedulingGateway.confirmBooking.mockResolvedValueOnce({});
          const { bookingProductRef } = req.session.currentBooking;

          await controller.post(req, res);

          expect(mockSchedulingGateway.confirmBooking).toHaveBeenCalledWith([{
            bookingReferenceId: bookingProductRef,
            reservationId: 'mockReservationId',
            notes: '',
            behaviouralMarkers: '',
          }], TCNRegion.A);
        });

        test('calls the scheduling gateway to confirm the new slot with behavioural marker', async () => {
          mockSchedulingGateway.reserveSlot.mockResolvedValueOnce({
            reservationId: 'mockReservationId',
          });
          mockSchedulingGateway.deleteBooking.mockResolvedValueOnce({});
          mockSchedulingGateway.confirmBooking.mockResolvedValueOnce({});
          req.session.manageBooking.candidate.behaviouralMarker = true;
          req.session.manageBooking.candidate.behaviouralMarkerExpiryDate = '2020-12-12';
          const { bookingProductRef } = req.session.currentBooking;

          await controller.post(req, res);

          expect(mockSchedulingGateway.confirmBooking).toHaveBeenCalledWith([{
            bookingReferenceId: bookingProductRef,
            reservationId: 'mockReservationId',
            notes: '',
            behaviouralMarkers: 'Candidate has a behavioural marker',
          }], TCNRegion.A);
        });
      });

      test('throws if booking is cannot be rescheduled e.g. booking within 3 days', async () => {
        req.session.manageBooking.candidate.eligibleToBookOnline = false;

        await expect(controller.post(req, res)).rejects.toEqual(
          new Error('ManageBookingCheckChangeController::post: Candidate is not eligible to book/reschedule online mockCandidateId'),
        );
      });

      test('throws if candidate is not eligible to book online', async () => {
        req.session.manageBooking.candidate.eligibleToBookOnline = false;

        await expect(controller.post(req, res)).rejects.toEqual(
          new Error('ManageBookingCheckChangeController::post: Candidate is not eligible to book/reschedule online mockCandidateId'),
        );
      });

      test('throws if testType is not set on a booking', async () => {
        req.session.currentBooking.testType = undefined;

        await expect(controller.post(req, res))
          .rejects.toEqual(new Error('ManageBookingCheckChangeController::executeDateChange: testType is undefined'));

        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
      });

      test('renders the generic change error page if the scheduling api delete booking call fails with code 401', async () => {
        mockSchedulingGateway.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });
        mockSchedulingGateway.deleteBooking.mockRejectedValueOnce({
          response: {
            status: 401,
          },
        });

        await controller.post(req, res);

        expect(logger.event).toHaveBeenCalledWith(
          BusinessTelemetryEvents.SCHEDULING_AUTH_ISSUE,
          'ManageBookingCheckChangeController::executeDateChange: Failed to authenticate to the scheduling api',
          {
            e: {
              response: {
                status: 401,
              },
            },
            bookingProductRef: 'mockBookingProductRef',
          },
        );
        expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE_ERROR, {
          bookingRef: 'mockRef',
          slotUnavailable: false,
          canRetry: true,
        });
        expect(logger.error).toHaveBeenCalledWith({ response: { status: 401 } }, 'ManageBookingCheckChangeController::executeDateChange: Failed to delete booking');
        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
      });

      test('renders the generic change error page if the scheduling api delete booking call fails with code 402', async () => {
        mockSchedulingGateway.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });
        mockSchedulingGateway.deleteBooking.mockRejectedValueOnce({
          response: {
            status: 402,
          },
        });

        await controller.post(req, res);

        expect(logger.event).toHaveBeenCalledWith(
          BusinessTelemetryEvents.SCHEDULING_REQUEST_ISSUE,
          'ManageBookingCheckChangeController::executeDateChange: Failed to get request from Scheduling api',
          {
            e: {
              response: {
                status: 402,
              },
            },
            bookingProductRef: 'mockBookingProductRef',
          },
        );
        expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE_ERROR, {
          bookingRef: 'mockRef',
          slotUnavailable: false,
          canRetry: true,
        });
        expect(logger.error).toHaveBeenCalledWith({ response: { status: 402 } }, 'ManageBookingCheckChangeController::executeDateChange: Failed to delete booking');
        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
      });

      test('renders the generic change error page if the scheduling api delete booking call fails with code 403', async () => {
        mockSchedulingGateway.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });
        mockSchedulingGateway.deleteBooking.mockRejectedValueOnce({
          response: {
            status: 403,
          },
        });

        await controller.post(req, res);

        expect(logger.event).toHaveBeenCalledWith(
          BusinessTelemetryEvents.SCHEDULING_AUTH_ISSUE,
          'ManageBookingCheckChangeController::executeDateChange: Failed to authenticate to the scheduling api',
          {
            e: {
              response: {
                status: 403,
              },
            },
            bookingProductRef: 'mockBookingProductRef',
          },
        );
        expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE_ERROR, {
          bookingRef: 'mockRef',
          slotUnavailable: false,
          canRetry: true,
        });
        expect(logger.error).toHaveBeenCalledWith({ response: { status: 403 } }, 'ManageBookingCheckChangeController::executeDateChange: Failed to delete booking');
        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
      });

      test('renders the generic change error page if the scheduling api delete booking call fails with code 500', async () => {
        mockSchedulingGateway.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });
        mockSchedulingGateway.deleteBooking.mockRejectedValueOnce({
          response: {
            status: 500,
          },
        });

        await controller.post(req, res);

        expect(logger.event).toHaveBeenCalledWith(
          BusinessTelemetryEvents.SCHEDULING_FAIL_DELETE,
          'ManageBookingCheckChangeController::executeDateChange: Failed to cancel the previous booking during rescheduling with the Scheduling API',
          {
            e: {
              response: {
                status: 500,
              },
            },
            bookingProductRef: 'mockBookingProductRef',
          },
        );
        expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE_ERROR, {
          bookingRef: 'mockRef',
          slotUnavailable: false,
          canRetry: true,
        });
        expect(logger.error).toHaveBeenCalledWith({ response: { status: 500 } }, 'ManageBookingCheckChangeController::executeDateChange: Failed to delete booking');
        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
      });

      test('renders the slot unavailable error page if the call fails with a SlotUnavailableError', async () => {
        mockSchedulingGateway.reserveSlot.mockRejectedValueOnce(new SlotUnavailableError());

        await controller.post(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE_ERROR, {
          bookingRef: 'mockRef',
          slotUnavailable: true,
          canRetry: true,
        });
        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
      });

      test('renders the generic change error page if the scheduling api call fails with any other error', async () => {
        mockSchedulingGateway.reserveSlot.mockRejectedValueOnce(new Error('Something went wrong!'));

        await controller.post(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE_ERROR, {
          bookingRef: 'mockRef',
          slotUnavailable: false,
          canRetry: true,
        });
        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
      });

      test('renders the no retry error page if the scheduling api confirm booking call fails with code 401', async () => {
        mockSchedulingGateway.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });
        mockSchedulingGateway.confirmBooking.mockRejectedValueOnce({
          response: {
            status: 401,
          },
        });
        const { bookingRef } = req.session.currentBooking;

        await controller.post(req, res);

        expect(logger.event).toHaveBeenCalledWith(
          BusinessTelemetryEvents.SCHEDULING_AUTH_ISSUE,
          'ManageBookingCheckChangeController::executeDateChange: Failed to authenticate to the scheduling api',
          {
            e: {
              response: {
                status: 401,
              },
            },
            bookingProductRef: 'mockBookingProductRef',
            reservationId: 'mockReservationId',
          },
        );
        expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE_ERROR, {
          bookingRef,
          slotUnavailable: false,
          canRetry: false,
        });
        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
      });

      test('renders the no retry error page if the scheduling api confirm booking call fails with code 402', async () => {
        mockSchedulingGateway.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });
        mockSchedulingGateway.confirmBooking.mockRejectedValueOnce({
          response: {
            status: 402,
          },
        });
        const { bookingRef } = req.session.currentBooking;

        await controller.post(req, res);

        expect(logger.event).toHaveBeenCalledWith(
          BusinessTelemetryEvents.SCHEDULING_REQUEST_ISSUE,
          'ManageBookingCheckChangeController::executeDateChange: Failed to get request from Scheduling api',
          {
            e: {
              response: {
                status: 402,
              },
            },
            bookingProductRef: 'mockBookingProductRef',
            reservationId: 'mockReservationId',
          },
        );
        expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE_ERROR, {
          bookingRef,
          slotUnavailable: false,
          canRetry: false,
        });
        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
      });

      test('renders the no retry error page if the scheduling api confirm booking call fails with code 403', async () => {
        mockSchedulingGateway.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });
        mockSchedulingGateway.confirmBooking.mockRejectedValueOnce({
          response: {
            status: 403,
          },
        });
        const { bookingRef } = req.session.currentBooking;

        await controller.post(req, res);

        expect(logger.event).toHaveBeenCalledWith(
          BusinessTelemetryEvents.SCHEDULING_AUTH_ISSUE,
          'ManageBookingCheckChangeController::executeDateChange: Failed to authenticate to the scheduling api',
          {
            e: {
              response: {
                status: 403,
              },
            },
            bookingProductRef: 'mockBookingProductRef',
            reservationId: 'mockReservationId',
          },
        );
        expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE_ERROR, {
          bookingRef,
          slotUnavailable: false,
          canRetry: false,
        });
        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
      });

      test('renders the no retry error page if the scheduling api confirm booking call fails with code 500', async () => {
        mockSchedulingGateway.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });
        mockSchedulingGateway.confirmBooking.mockRejectedValueOnce({
          response: {
            status: 500,
          },
        });
        const { bookingRef } = req.session.currentBooking;

        await controller.post(req, res);

        expect(logger.event).toHaveBeenCalledWith(
          BusinessTelemetryEvents.SCHEDULING_ERROR,
          'ManageBookingCheckChangeController::executeDateChange: Failed to communicate with the scheduling API server',
          {
            e: {
              response: {
                status: 500,
              },
            },
            bookingProductRef: 'mockBookingProductRef',
            reservationId: 'mockReservationId',
          },
        );
        expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE_ERROR, {
          bookingRef,
          slotUnavailable: false,
          canRetry: false,
        });
        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
      });

      test('calls the crm gateway and updates the booking status to Change in Progress', async () => {
        mockSchedulingGateway.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });

        await controller.post(req, res);

        expect(mockCRMGateway.updateBookingStatus).toHaveBeenCalledWith(
          'mockBookingId',
          CRMBookingStatus.ChangeInProgress,
          false,
        );
      });

      test('calls the crm gateway and sets the csc booking flag to true when updating booking status if origin is from CSC', async () => {
        mockSchedulingGateway.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });

        req.session.currentBooking.origin = Origin.CustomerServiceCentre;

        await controller.post(req, res);

        expect(mockCRMGateway.updateBookingStatus).toHaveBeenCalledWith(
          'mockBookingId',
          CRMBookingStatus.ChangeInProgress,
          true,
        );
      });

      test('should redirect the user to the error page if the call to crm fails', async () => {
        mockSchedulingGateway.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });
        mockCRMGateway.updateBookingStatus.mockRejectedValue({
          status: 400,
        });

        await controller.post(req, res);

        expect(mockCRMGateway.updateBookingStatus).toHaveBeenCalled();
        expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE_ERROR, {
          bookingRef: 'mockRef',
          slotUnavailable: false,
          canRetry: true,
        });
        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
      });

      test('if call to crm fails for rescheduling the booking, the error is logged', async () => {
        const dateTime = '2021-02-16T09:30:00Z';
        const centre = { ...mockCentres[1] };
        req.session.manageBookingEdits = {
          dateTime,
          centre,
        };
        mockSchedulingGateway.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });
        const error = new Error();
        mockCRMGateway.rescheduleBookingAndConfirm.mockRejectedValue(error);

        await controller.post(req, res);

        expect(logger.error).toHaveBeenCalledWith(
          error,
          'ManageBookingCheckChangeController::updateTimeAndLocationInCrm: Failed to store updated booking location and/or time and date in CRM after max retries',
          {
            bookingRef: 'mockRef',
            centreName: 'MOCKED_DATA Bridgend',
            dateTime: '2021-02-16T09:30:00Z',
            siteId: 'Site024',
          },
        );
        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
      });

      test('if call to crm fails for changing the progress of the booking, the error message is logged', async () => {
        const dateTime = '2021-02-16T09:30:00Z';
        const centre = { ...mockCentres[1] };
        req.session.manageBookingEdits = {
          dateTime,
          centre,
        };
        mockSchedulingGateway.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });
        const error = new Error();
        mockCRMGateway.updateBookingStatus.mockRejectedValue(error);

        await controller.post(req, res);

        expect(logger.error).toHaveBeenCalledWith(error, expect.stringContaining('Failed to set status of Change in Progress in CRM after 3 retries'), {
          bookingRef: 'mockRef',
          bookingId: 'mockBookingId',
        });
        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
      });

      test('if call to crm fails for updating the TCN date, the error message is logged', async () => {
        mockSchedulingGateway.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });

        const error = new Error();
        mockCRMGateway.updateTCNUpdateDate.mockRejectedValue(error);

        await controller.post(req, res);

        expect(logger.error).toHaveBeenCalledWith(
          error,
          'ManageBookingCheckChangeController::updateTCNUpdateDate: Failed to update TCN update date in CRM after max retries',
          {
            bookingRef: 'mockRef',
            bookingProductId: 'mockBookingProductId',
          },
        );
        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
      });

      test('calls the crm gateway to store updated booking time & date & location and sets booking status to Confirmed', async () => {
        const dateTime = '2021-02-16T09:30:00Z';
        const centre = { ...mockCentres[1] };
        req.session.manageBookingEdits = {
          dateTime,
          centre,
        };
        req.session.currentBooking.firstSelectedDate = dateTime;
        req.session.currentBooking.dateAvailableOnOrAfterToday = '2021-02-17T09:30:00Z';
        req.session.currentBooking.dateAvailableOnOrBeforePreferredDate = '2021-02-18T09:30:00Z';
        req.session.currentBooking.dateAvailableOnOrAfterPreferredDate = '2021-02-19T09:30:00Z';
        mockSchedulingGateway.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });

        await controller.post(req, res);

        expect(mockCRMGateway.getRescheduleCount).toHaveBeenCalledWith('mockBookingId');
        expect(mockCRMGateway.rescheduleBookingAndConfirm).toHaveBeenCalledWith(
          'mockBookingId',
          dateTime,
          mockRescheduleCount,
          false,
          centre.accountId,
          dateTime,
          {
            dateAvailableOnOrAfterToday: '2021-02-17T09:30:00Z',
            dateAvailableOnOrBeforePreferredDate: '2021-02-18T09:30:00Z',
            dateAvailableOnOrAfterPreferredDate: '2021-02-19T09:30:00Z',
          },
        );
      });

      test('calls the crm gateway to store updated booking time, date and location and sets CSC flag to true if origin comes from CSC', async () => {
        const dateTime = '2021-02-16T09:30:00Z';
        const centre = { ...mockCentres[1] };
        req.session.currentBooking.firstSelectedDate = dateTime;
        req.session.currentBooking.dateAvailableOnOrAfterToday = '2021-02-17T09:30:00Z';
        req.session.currentBooking.dateAvailableOnOrBeforePreferredDate = '2021-02-18T09:30:00Z';
        req.session.currentBooking.dateAvailableOnOrAfterPreferredDate = '2021-02-19T09:30:00Z';
        req.session.manageBookingEdits = {
          dateTime,
          centre,
        };
        mockSchedulingGateway.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });
        req.session.currentBooking.origin = Origin.CustomerServiceCentre;

        await controller.post(req, res);

        expect(mockCRMGateway.getRescheduleCount).toHaveBeenCalledWith('mockBookingId');
        expect(mockCRMGateway.rescheduleBookingAndConfirm).toHaveBeenCalledWith(
          'mockBookingId',
          dateTime,
          mockRescheduleCount,
          true,
          centre.accountId,
          dateTime,
          {
            dateAvailableOnOrAfterToday: '2021-02-17T09:30:00Z',
            dateAvailableOnOrBeforePreferredDate: '2021-02-18T09:30:00Z',
            dateAvailableOnOrAfterPreferredDate: '2021-02-19T09:30:00Z',
          },
        );
      });

      test('calls the crm gateway and updates the tcn update date', async () => {
        mockSchedulingGateway.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });

        await controller.post(req, res);

        expect(mockCRMGateway.updateTCNUpdateDate).toHaveBeenCalledWith(
          'mockBookingProductId',
        );
      });

      test('calls the crm gateway and updates the tcn update date with CSC flag set to true if origin comes from CSC', async () => {
        mockSchedulingGateway.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });

        req.session.currentBooking.origin = Origin.CustomerServiceCentre;

        await controller.post(req, res);

        expect(mockCRMGateway.updateTCNUpdateDate).toHaveBeenCalledWith(
          'mockBookingProductId',
        );
      });

      test('reloads existing managed bookings', async () => {
        mockSchedulingGateway.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });

        await controller.post(req, res);

        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
        expect(mockCRMGateway.calculateThreeWorkingDays).toHaveBeenCalled();
      });

      test('renders the confirmation page if the updating booking time date and location and setting status to Confirmed call fails', async () => {
        mockSchedulingGateway.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });
        mockCRMGateway.rescheduleBookingAndConfirm
          .mockResolvedValueOnce()
          .mockRejectedValueOnce({
            status: 400,
          });

        await controller.post(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE_CONFIRMATION, expect.anything());
      });
    });

    describe('If BSL has changed', () => {
      beforeEach(() => {
        req.session.manageBookingEdits = {
          bsl: true,
        };
      });

      test('calls the crm gateway to update additional support', async () => {
        await controller.post(req, res);

        expect(mockCRMGateway.updateAdditionalSupport).toHaveBeenCalledWith(
          'mockBookingId',
          'mockBookingProductId',
          CRMAdditionalSupport.BritishSignLanguage,
          false,
        );
      });

      test('calls the crm gateway to update additional support and sets CSC flag to true if origin comes from CSC', async () => {
        req.session.currentBooking.origin = Origin.CustomerServiceCentre;
        await controller.post(req, res);

        expect(mockCRMGateway.updateAdditionalSupport).toHaveBeenCalledWith(
          'mockBookingId',
          'mockBookingProductId',
          CRMAdditionalSupport.BritishSignLanguage,
          true,
        );
      });

      test('reloads the booking on update completion', async () => {
        await controller.post(req, res);

        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
        expect(mockCRMGateway.calculateThreeWorkingDays).toHaveBeenCalled();
      });

      test('if call to crm fails for changing additional support, the error message is logged', async () => {
        const error = new Error();
        mockCRMGateway.updateAdditionalSupport.mockRejectedValue(error);

        await controller.post(req, res);

        expect(logger.error).toHaveBeenCalledWith(
          error,
          'ManageBookingCheckChangeController::updateAdditionalSupportInCrm: Failed to store updated additional support options for booking in CRM after max retries',
          {
            bookingRef: 'mockRef',
            bookingId: 'mockBookingId',
            bookingProductId: 'mockBookingProductId',
          },
        );
        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
      });

      test('renders the error page if calls to the crm fail when updating additional support', async () => {
        mockCRMGateway.updateAdditionalSupport.mockRejectedValue({
          status: 400,
        });

        await controller.post(req, res);

        expect(mockCRMGateway.updateAdditionalSupport).toHaveBeenCalled();
        expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE_ERROR, {
          bookingRef: req.session.currentBooking.bookingRef,
          slotUnavailable: false,
          canRetry: true,
        });
        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
      });

      test('renders the change confirmation page if update is successful', async () => {
        await controller.post(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE_CONFIRMATION, expect.anything());
      });
    });

    describe('If voiceover has changed', () => {
      beforeEach(() => {
        req.session.manageBookingEdits = {
          voiceover: Voiceover.ENGLISH,
        };
      });

      test('calls the crm gateway to update voiceover', async () => {
        await controller.post(req, res);

        expect(mockCRMGateway.updateVoiceover).toHaveBeenCalledWith(
          'mockBookingId',
          'mockBookingProductId',
          CRMVoiceOver.English,
          false,
        );
      });

      test('calls the crm gateway to update voiceover and sets CSC flag to true if origin comes from CSC', async () => {
        req.session.currentBooking.origin = Origin.CustomerServiceCentre;
        await controller.post(req, res);

        expect(mockCRMGateway.updateVoiceover).toHaveBeenCalledWith(
          'mockBookingId',
          'mockBookingProductId',
          CRMVoiceOver.English,
          true,
        );
      });

      test('reloads the booking on update completion', async () => {
        await controller.post(req, res);

        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
        expect(mockCRMGateway.calculateThreeWorkingDays).toHaveBeenCalled();
      });

      test('error throws if loading candidate bookings fail', async () => {
        mockBookingManager.loadCandidateBookings.mockRejectedValue(new Error('failed to load candidate bookings'));

        await expect(controller.post(req, res)).rejects.toThrow();
      });

      test('renders the error page if calls to the crm fail when updating additional support', async () => {
        mockCRMGateway.updateVoiceover.mockRejectedValue({
          status: 400,
        });

        await controller.post(req, res);

        expect(mockCRMGateway.updateVoiceover).toHaveBeenCalled();
        expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE_ERROR, {
          bookingRef: req.session.currentBooking.bookingRef,
          slotUnavailable: false,
          canRetry: true,
        });
        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
      });

      test('renders the change confirmation page if update is successful', async () => {
        await controller.post(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE_CONFIRMATION, expect.anything());
      });
    });

    describe('language changed', () => {
      beforeEach(() => {
        req.session.manageBookingEdits = {
          language: Language.WELSH,
        };
      });

      test('change in language is handled', async () => {
        await controller.post(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE_CONFIRMATION, expect.anything());
      });

      test('error throws if failed to update language', async () => {
        req.session.manageBookingEdits.language = Language.ENGLISH;
        mockCRMGateway.updateLanguage.mockRejectedValue(new Error('failed to update language'));

        await controller.post(req, res);

        const errorViewData = {
          bookingRef: 'mockRef',
          slotUnavailable: false,
          canRetry: true,
        };

        expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE_ERROR, errorViewData);
        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
      });
    });

    test('renders the change confirmation page', async () => {
      const booking = mockCurrentBooking();
      const confirmChangeViewData: ConfirmChangeViewData = {
        booking: {
          reference: booking.bookingRef,
          language: new TestLanguage(booking.language).toString(),
          testType: booking.testType,
          bsl: booking.bsl ? translate('generalContent.yes') : translate('generalContent.no'),
          voiceover: Voiceover.NONE,
          testCentre: {
            name: booking.centre.name,
            addressLine1: booking.centre.addressLine1,
            addressLine2: booking.centre.addressLine2,
            addressPostalCode: booking.centre.addressPostalCode,
            addressCounty: booking.centre.addressCounty,
            addressCity: booking.centre.addressCity,
          },
          testDate: booking.dateTime,
        },
        latestRefundDate: booking.lastRefundDate,
        voiceoverRequested: false,
        voiceoverAvailable: true,
        bslAvailable: true,
        isInstructor: false,
      };

      await controller.post(req, res);

      expect(req.session.currentBooking).toBeUndefined();
      expect(req.session.manageBookingEdits).toBeUndefined();
      expect(req.session.testCentreSearch).toBeUndefined();
      expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE_CONFIRMATION, confirmChangeViewData);
    });

    test('renders the change confirmation page without bsl option for instructor test types', async () => {
      req.session.currentBooking.testType = TestType.ERS;
      const booking = mockCurrentBooking();

      const confirmChangeViewData: ConfirmChangeViewData = {
        booking: {
          reference: booking.bookingRef,
          language: new TestLanguage(booking.language).toString(),
          testType: TestType.ERS,
          bsl: booking.bsl ? translate('generalContent.yes') : translate('generalContent.no'),
          voiceover: Voiceover.NONE,
          testCentre: {
            name: booking.centre.name,
            addressLine1: booking.centre.addressLine1,
            addressLine2: booking.centre.addressLine2,
            addressPostalCode: booking.centre.addressPostalCode,
            addressCounty: booking.centre.addressCounty,
            addressCity: booking.centre.addressCity,
          },
          testDate: booking.dateTime,
        },
        latestRefundDate: booking.lastRefundDate,
        voiceoverRequested: false,
        voiceoverAvailable: true,
        bslAvailable: false,
        isInstructor: false,
      };

      await controller.post(req, res);

      expect(req.session.currentBooking).toBeUndefined();
      expect(req.session.manageBookingEdits).toBeUndefined();
      expect(req.session.testCentreSearch).toBeUndefined();
      expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHANGE_CONFIRMATION, confirmChangeViewData);
    });

    test('sends a rescheduled email', async () => {
      const booking = {
        ...req.session.manageBooking.bookings[0],
      };
      const bookingRescheduledDetails: BookingRescheduledDetails = {
        bookingRef: booking.reference,
        testType: booking.testType,
        testDateTime: booking.testDate,
        testCentre: currentBooking.centre,
        lastRefundDate: currentBooking.lastRefundDate,
      };
      const content = buildBookingRescheduledEmailContent(bookingRescheduledDetails, Target.GB, Locale.GB);

      await controller.post(req, res);

      expect(mockNotificationsGateway.sendEmail).toHaveBeenCalledWith(
        mockCandidateEmail,
        content,
        booking.reference,
        Target.GB,
      );
    });

    test('logs error if sending a rescheduled email fails', async () => {
      const error = new Error('Reschedule email failure');
      mockNotificationsGateway.sendEmail.mockImplementationOnce(() => { throw error; });

      await controller.post(req, res);

      expect(logger.error).toHaveBeenCalledWith(
        error,
        'ManageBookingCheckChangeController::sendRescheduledEmail: Could not send booking reschedule email',
        {
          candidateId: 'mockCandidateId',
        },
      );
    });

    test('throws error if current booking has not been set', async () => {
      delete req.session.currentBooking;

      await expect(controller.post(req, res)).rejects.toThrow('ManageBookingCheckChangeController::post: No currentBooking set');
    });

    test('throws error if manage booking has not been set', async () => {
      delete req.session.manageBooking;

      await expect(controller.post(req, res)).rejects.toThrow('ManageBookingCheckChangeController::post: No manageBooking set');
    });

    test('throws error if required session data is missing', async () => {
      delete req.session.currentBooking.bookingRef;

      await expect(controller.post(req, res)).rejects.toThrow('ManageBookingCheckChangeController::post: Missing required session data');
    });
  });
});
