import { CRMVoiceOver } from '@dvsa/ftts-crm-test-client/dist/enums';
import { Booking } from '../../../../src/domain/booking/booking';
import {
  CheckChangeViewData, ConfirmChangeViewData,
  ManageBookingCheckChangeController,
} from '../../../../src/pages/manage-booking/check-change';
import {
  LOCALE, TARGET, LANGUAGE, TCNRegion, Voiceover,
} from '../../../../src/domain/enums';
import logger from '../../../../src/helpers/logger';
import { CRMGateway } from '../../../../src/services/crm-gateway/crm-gateway';
import { Scheduler, SlotUnavailableError } from '../../../../src/services/scheduling/scheduling-service';
import { buildBookingRescheduledEmailContent } from '../../../../src/services/notifications/content/builders';
import { NotificationsGateway } from '../../../../src/services/notifications/notifications-gateway';
import { BookingRescheduledDetails } from '../../../../src/services/notifications/types';
import { mockCurrentBooking, mockManageBooking } from '../../../mocks/data/manage-bookings';
import { Centre } from '../../../../src/domain/types';
import { TestLanguage } from '../../../../src/domain/test-language';
import { CRMAdditionalSupport, CRMBookingStatus } from '../../../../src/services/crm-gateway/enums';
import { mockCentres } from '../../../../src/repository/mock-data';
import { BookingManager } from '../../../../src/pages/manage-booking/booking-manager';
import { translate } from '../../../../src/helpers/language';

jest.mock('../../../../src/services/crm-gateway/crm-gateway');
jest.mock('../../../../src/helpers/logger');
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

describe('Manage booking - check change controller', () => {
  let req: any;
  let res: any;

  const mockCandidateEmail = 'candidate@email.com';
  const mockCandidateAddress = {
    line1: 'Line 1',
    line2: 'Line 2 optional',
    line3: 'Line 3 optional',
    line4: 'Line 4 optional',
    city: 'City',
    postcode: 'Postcode',
  };

  const mockCRMGateway = {
    updateTCNUpdateDate: jest.fn(),
    updateBookingStatus: jest.fn(() => Promise.resolve()),
    updateLanguage: jest.fn(() => Promise.resolve()),
    updateAdditionalSupport: jest.fn(() => Promise.resolve()),
    updateVoiceover: jest.fn(() => Promise.resolve()),
    rescheduleBookingAndConfirm: jest.fn(() => Promise.resolve()),
    getLicenceAndCandidate: () => ({
      candidate: {
        email: 'test@test.com',
      },
    }),
    getCandidateByLicenceNumber: jest.fn(() => Promise.resolve),
    calculateThreeWorkingDays: jest.fn(() => Promise.resolve),
  };

  const mockScheduler = {
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
    mockScheduler as unknown as Scheduler,
    mockNotificationsGateway as unknown as NotificationsGateway,
    mockBookingManager as unknown as BookingManager,
  );
  let currentBooking;
  let manageBooking;

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
          },
          bookings: [
            manageBooking,
          ],
        },
        currentBooking,
        journey: {
          inManagedBookingEditMode: true,
        },
        manageBookingEdits: { },
      },
    };

    res = {
      redirect: jest.fn(),
      render: jest.fn(),
    };

    Booking.prototype.canBeCancelled = jest.fn(() => true);
    Booking.prototype.isRefundable = jest.fn(() => true);
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

      expect(res.render).toHaveBeenCalledWith('manage-booking/check-change', {
        booking: changeViewData.booking,
      });
    });

    test('renders the check change page with location changes', () => {
      const updatedTestCentre: Partial<Centre> = {
        name: 'new name',
        addressLine1: 'new address line 1',
        addressLine2: 'new address line 2',
        addressCity: 'new city',
        addressPostalCode: 'new post code',
        addressCounty: 'new county',
      };
      req.session.manageBookingEdits.centre = updatedTestCentre;

      const changeViewData: CheckChangeViewData = {
        booking: {
          testDate: mockCurrentBooking().dateTime,
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

      expect(res.render).toHaveBeenCalledWith('manage-booking/check-change', {
        booking: changeViewData.booking,
      });
    });

    test('renders the check change page with language changes', () => {
      req.session.manageBookingEdits.language = LANGUAGE.ENGLISH;

      const changeViewData: CheckChangeViewData = {
        booking: {
          language: 'English',
        },
      };

      controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith('manage-booking/check-change', {
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

      expect(res.render).toHaveBeenCalledWith('manage-booking/check-change', {
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

      expect(res.render).toHaveBeenCalledWith('manage-booking/check-change', {
        booking: changeViewData.booking,
      });
    });

    test('can cancel out change', () => {
      const booking = {
        ...req.session.manageBooking.bookings[0],
      };

      controller.reset(req, res);

      expect(res.redirect).toHaveBeenCalledWith(`/manage-booking/${booking.reference}`);
      expect(req.session.currentBooking).toStrictEqual({});
      expect(req.session.journey).toStrictEqual(expect.objectContaining({
        inManagedBookingEditMode: false,
      }));
      expect(req.session.testCentreSearch).toStrictEqual({});
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

      test('calls the scheduler to reserve the new slot', async () => {
        mockScheduler.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });
        const { centre, testType } = req.session.currentBooking;

        await controller.post(req, res);

        expect(mockScheduler.reserveSlot).toHaveBeenCalledWith(centre, testType, mockNewSlot);
      });

      test('calls the scheduler to cancel the old slot', async () => {
        mockScheduler.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });
        mockScheduler.deleteBooking.mockResolvedValueOnce({});
        const { bookingRef } = req.session.currentBooking;

        await controller.post(req, res);

        expect(mockScheduler.deleteBooking).toHaveBeenCalledWith(bookingRef, TCNRegion.A);
      });

      test('calls the scheduler to confirm the new slot', async () => {
        mockScheduler.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });
        mockScheduler.deleteBooking.mockResolvedValueOnce({});
        mockScheduler.confirmBooking.mockResolvedValueOnce({});
        const { bookingRef } = req.session.currentBooking;

        await controller.post(req, res);

        expect(mockScheduler.confirmBooking).toHaveBeenCalledWith([{
          bookingReferenceId: bookingRef,
          reservationId: 'mockReservationId',
          notes: '',
          behaviouralMarkers: '',
        }],
        TCNRegion.A);
      });

      test('renders the generic change error page if the scheduling api delete booking call fails', async () => {
        mockScheduler.deleteBooking.mockRejectedValueOnce(new Error('Something went wrong!'));

        await controller.post(req, res);

        expect(res.render).toHaveBeenCalledWith('manage-booking/change-error', {
          bookingRef: req.session.currentBooking.bookingRef,
          slotUnavailable: false,
          canRetry: true,
        });
      });

      test('renders the slot unavailable error page if the call fails with a SlotUnavailableError', async () => {
        mockScheduler.reserveSlot.mockRejectedValueOnce(new SlotUnavailableError());

        await controller.post(req, res);

        expect(res.render).toHaveBeenCalledWith('manage-booking/change-error', {
          bookingRef: req.session.currentBooking.bookingRef,
          slotUnavailable: true,
          canRetry: true,
        });
      });

      test('renders the generic change error page if the scheduling api call fails with any other error', async () => {
        mockScheduler.reserveSlot.mockRejectedValueOnce(new Error('Something went wrong!'));

        await controller.post(req, res);

        expect(res.render).toHaveBeenCalledWith('manage-booking/change-error', {
          bookingRef: req.session.currentBooking.bookingRef,
          slotUnavailable: false,
          canRetry: true,
        });
      });

      test('renders the no retry error page if the scheduling api confirm booking call fails', async () => {
        mockScheduler.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });
        mockScheduler.confirmBooking.mockRejectedValueOnce(new Error('Something went wrong!'));
        const { bookingRef } = req.session.currentBooking;

        await controller.post(req, res);

        expect(res.render).toHaveBeenCalledWith('manage-booking/change-error', {
          bookingRef,
          slotUnavailable: false,
          canRetry: false,
        });
      });

      test('calls the crm gateway and updates the booking status to Change in Progress', async () => {
        mockScheduler.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });

        await controller.post(req, res);

        expect(mockCRMGateway.updateBookingStatus).toHaveBeenCalledWith(
          'mockBookingId',
          CRMBookingStatus.ChangeInProgress,
        );
      });

      test('should redirect the user to the error page if the call to crm fails', async () => {
        mockScheduler.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });
        mockCRMGateway.updateBookingStatus.mockRejectedValue({
          status: 400,
        });

        await controller.post(req, res);

        expect(mockCRMGateway.updateBookingStatus).toBeCalled();
        expect(res.render).toHaveBeenCalledWith('manage-booking/change-error', {
          bookingRef: req.session.currentBooking.bookingRef,
          slotUnavailable: false,
          canRetry: true,
        });
      });

      test('if call to crm fails for rescheduling the booking, the error is logged', async () => {
        const dateTime = '2021-02-16T09:30:00Z';
        const centre = { ...mockCentres[1] };
        req.session.manageBookingEdits = {
          dateTime,
          centre,
        };
        mockScheduler.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });
        const error = new Error();
        mockCRMGateway.rescheduleBookingAndConfirm.mockRejectedValue(error);

        await controller.post(req, res);

        expect(logger.error).toHaveBeenCalledWith(error, expect.stringContaining('Failed to store updated booking location and/or time and date in CRM after max retries'));
      });

      test('if call to crm fails for changing the progress of the booking, the error message is logged', async () => {
        const dateTime = '2021-02-16T09:30:00Z';
        const centre = { ...mockCentres[1] };
        req.session.manageBookingEdits = {
          dateTime,
          centre,
        };
        mockScheduler.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });
        const error = new Error();
        mockCRMGateway.updateBookingStatus.mockRejectedValue(error);

        await controller.post(req, res);

        expect(logger.error).toHaveBeenCalledWith(error, expect.stringContaining('Failed to set status of Change in Progress in CRM after 3 retries'));
      });

      test('if call to crm fails for updating the TCN date, the error message is logged', async () => {
        mockScheduler.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });

        const error = new Error();
        mockCRMGateway.updateTCNUpdateDate.mockRejectedValue(error);

        await controller.post(req, res);

        expect(logger.error).toHaveBeenCalledWith(error, expect.stringContaining('Failed to update TCN update date in CRM after max retries'));
      });

      test('calls the crm gateway to store updated booking time & date & location and sets booking status to Confirmed', async () => {
        const dateTime = '2021-02-16T09:30:00Z';
        const centre = { ...mockCentres[1] };
        req.session.manageBookingEdits = {
          dateTime,
          centre,
        };
        mockScheduler.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });

        await controller.post(req, res);

        expect(mockCRMGateway.rescheduleBookingAndConfirm).toHaveBeenCalledWith(
          'mockBookingId',
          dateTime,
          centre.accountId,
        );
      });

      test('calls the crm gateway and updates the tcn update date', async () => {
        mockScheduler.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });

        await controller.post(req, res);

        expect(mockCRMGateway.updateTCNUpdateDate).toHaveBeenCalledWith(
          'mockBookingProductId',
        );
      });

      test('reloads existing managed bookings', async () => {
        mockScheduler.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });

        await controller.post(req, res);

        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalled();
        expect(mockCRMGateway.calculateThreeWorkingDays).toHaveBeenCalled();
      });

      test('renders the confirmation page if the updating booking time date and location and setting status to Confirmed call fails', async () => {
        mockScheduler.reserveSlot.mockResolvedValueOnce({
          reservationId: 'mockReservationId',
        });
        mockCRMGateway.rescheduleBookingAndConfirm
          .mockResolvedValueOnce()
          .mockRejectedValueOnce({
            status: 400,
          });

        await controller.post(req, res);

        expect(res.render).toHaveBeenCalledWith('manage-booking/change-confirmation', expect.anything());
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
        );
      });

      test('reloads the booking on update completion', async () => {
        await controller.post(req, res);

        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalled();
        expect(mockCRMGateway.calculateThreeWorkingDays).toHaveBeenCalled();
      });

      test('if call to crm fails for changing additional support, the error message is logged', async () => {
        const error = new Error();
        mockCRMGateway.updateAdditionalSupport.mockRejectedValue(error);

        await controller.post(req, res);

        expect(logger.error).toHaveBeenCalledWith(error, expect.stringContaining('Failed to store updated additional support options for booking in CRM after max retries'));
      });

      test('renders the error page if calls to the crm fail when updating additional support', async () => {
        mockCRMGateway.updateAdditionalSupport.mockRejectedValue({
          status: 400,
        });

        await controller.post(req, res);

        expect(mockCRMGateway.updateAdditionalSupport).toBeCalled();
        expect(res.render).toHaveBeenCalledWith('manage-booking/change-error', {
          bookingRef: req.session.currentBooking.bookingRef,
          slotUnavailable: false,
          canRetry: true,
        });
      });

      test('renders the change confirmation page if update is successful', async () => {
        await controller.post(req, res);

        expect(res.render).toHaveBeenCalledWith('manage-booking/change-confirmation', expect.anything());
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
        );
      });

      test('reloads the booking on update completion', async () => {
        await controller.post(req, res);

        expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalled();
        expect(mockCRMGateway.calculateThreeWorkingDays).toHaveBeenCalled();
      });

      test('renders the error page if calls to the crm fail when updating additional support', async () => {
        mockCRMGateway.updateVoiceover.mockRejectedValue({
          status: 400,
        });

        await controller.post(req, res);

        expect(mockCRMGateway.updateVoiceover).toBeCalled();
        expect(res.render).toHaveBeenCalledWith('manage-booking/change-error', {
          bookingRef: req.session.currentBooking.bookingRef,
          slotUnavailable: false,
          canRetry: true,
        });
      });

      test('renders the change confirmation page if update is successful', async () => {
        await controller.post(req, res);

        expect(res.render).toHaveBeenCalledWith('manage-booking/change-confirmation', expect.anything());
      });
    });

    describe('language changed', () => {
      beforeEach(() => {
        req.session.manageBookingEdits = {
          language: LANGUAGE.WELSH,
        };
      });

      test('change in language is handled', async () => {
        await controller.post(req, res);

        expect(res.render).toHaveBeenCalledWith('manage-booking/change-confirmation', expect.anything());
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
          voiceover: '',
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
      };

      await controller.post(req, res);

      expect(req.session.currentBooking).toStrictEqual({});
      expect(req.session.manageBookingEdits).toStrictEqual({});
      expect(req.session.testCentreSearch).toStrictEqual({});
      expect(res.render).toHaveBeenCalledWith('manage-booking/change-confirmation', confirmChangeViewData);
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
      const content = buildBookingRescheduledEmailContent(bookingRescheduledDetails, TARGET.GB, LOCALE.GB);

      await controller.post(req, res);

      expect(mockNotificationsGateway.sendEmail).toHaveBeenCalledWith(
        mockCandidateEmail,
        content,
        booking.reference,
        TARGET.GB,
      );
    });

    test('logs error if sending a rescheduled email fails', async () => {
      const error = new Error('Reschedule email failure');
      mockNotificationsGateway.sendEmail.mockImplementationOnce(() => { throw error; });

      await controller.post(req, res);

      expect(logger.error).toHaveBeenCalledWith(error, 'Could not send booking reschedule email - candidateId: mockCandidateId');
    });
  });
});
