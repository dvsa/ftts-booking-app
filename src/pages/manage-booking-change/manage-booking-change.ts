import { Request, Response } from 'express';
import { PageNames } from '@constants';
import { Target, TestSupportNeed, Voiceover } from '../../domain/enums';
import { bslIsAvailable } from '../../domain/bsl';
import { TestLanguage } from '../../domain/test-language';
import { TestVoiceover } from '../../domain/test-voiceover';
import { logger, BusinessTelemetryEvents } from '../../helpers/logger';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';
import { CRMAdditionalSupport, CRMProductNumber } from '../../services/crm-gateway/enums';
import { fromCRMProductNumber } from '../../services/crm-gateway/maps';
import { store } from '../../services/session';
import { setManageBookingEditMode } from '../../helpers/manage-booking-handler';
import { canShowBslChangeButton, canShowVoiceoverChangeButton } from '../../helpers/support';
import { isZeroCostTest } from '../../domain/eligibility';
import { mapToSupportType } from '../../services/crm-gateway/crm-helper';

export class ManageBookingChangeController {
  constructor(
    private crm: CRMGateway,
  ) { }

  public get = async (req: Request, res: Response): Promise<void> => {
    if (!req.session.manageBooking) {
      throw Error('ManageBookingChangeController::get: No manageBooking set');
    }
    const { candidate } = req.session.manageBooking;

    const bookingReference = req.params.ref;
    let booking = store.manageBooking.getBooking(req, bookingReference);

    if (!candidate || !booking || !booking.isViewable()) {
      return res.redirect('login');
    }

    setManageBookingEditMode(req);
    req.session.manageBookingEdits = undefined;

    const voiceover = TestVoiceover.fromCRMVoiceover(booking.details.voiceoverLanguage);
    const voiceoverRequested = voiceover !== Voiceover.NONE;

    const bslRequested = booking.details.additionalSupport === CRMAdditionalSupport.BritishSignLanguage;

    let testLanguage = null;
    try {
      testLanguage = TestLanguage.fromCRMTestLanguage(booking.details.testLanguage);
    } catch (error) {
      logger.error(error, `Test Language was null in booking product ${booking.details.reference}`);
      logger.event(BusinessTelemetryEvents.CDS_FAIL_BOOKING_CANCEL, 'ManageBookingCancelController::setCancelInProgressInCRM: Failed to set status of Cancellation in Progress in CRM after 3 retries', {
        error,
        reference: booking.details.reference,
      });
    }

    const testType = fromCRMProductNumber(booking.details?.product?.productnumber as CRMProductNumber);

    const viewData = {
      booking: booking.details,
      canChangeLanguage: TestLanguage.canChangeTestLanguage(req.session.target || Target.GB, testType),
      testLanguage,
      voiceoverRequested,
      voiceover,
      showVoiceoverChangeButton: canShowVoiceoverChangeButton(voiceover, bslRequested),
      bslAvailable: bslIsAvailable(testType),
      bslRequested,
      showBslChangeButton: canShowBslChangeButton(bslRequested, voiceover),
      eligibleToBookOnline: candidate.eligibleToBookOnline,
      voiceoverAvailable: TestVoiceover.isAvailable(testType),
      isZeroCostBooking: isZeroCostTest(testType),
      testSupportNeeded: mapToSupportType(booking.details.testSupportNeed),
    };

    // If the test is not today and we don't already have the 3 working days date
    // need to call CRM to get it and store on the booking in session
    if (!booking.testIsToday() && !booking.details.testDateMinus3ClearWorkingDays) {
      const { testDate, testCentre: { remit } } = booking.details;
      const result = await this.crm.calculateThreeWorkingDays(testDate as unknown as string, remit);
      if (!result) {
        return res.render(PageNames.MANAGE_BOOKING_CHANGE, {
          ...viewData,
          errorCalculatingWorkingDays: true,
        });
      }
      booking = store.manageBooking.updateBooking(req, bookingReference, {
        testDateMinus3ClearWorkingDays: result,
      });
    }

    return res.render(PageNames.MANAGE_BOOKING_CHANGE, {
      ...viewData,
      testIsToday: booking.testIsToday(),
      createdToday: booking.isCreatedToday(),
      bookingCannotBeCancelled: !booking.canBeCancelled(),
      bookingCannotBeRescheduled: !booking.canBeRescheduled(),
      bookingCannotBeChanged: !booking.canBeChanged(),
      lastRefundOrRescheduleDate: booking.lastRefundOrRescheduleDate,
      hasSupportedBeenRequested: !mapToSupportType(booking.details.testSupportNeed)[0].includes(TestSupportNeed.NoSupport),
    });
  };
}

export default new ManageBookingChangeController(
  CRMGateway.getInstance(),
);
