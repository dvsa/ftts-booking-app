import { Request, Response } from 'express';
import { TARGET, Voiceover } from '../../domain/enums';
import { TestLanguage } from '../../domain/test-language';
import { TestVoiceover } from '../../domain/test-voiceover';
import logger from '../../helpers/logger';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';
import { CRMAdditionalSupport } from '../../services/crm-gateway/enums';
import { store } from '../../services/session';
import { setManageBookingEditMode } from '../check-your-answers/manage-booking-handler';

export class ManageBookingChangeController {
  constructor(
    private crm: CRMGateway,
  ) { }

  public get = async (req: Request, res: Response): Promise<void> => {
    const { candidate } = store.manageBooking.get(req);

    const bookingReference = req.params.ref;
    let booking = store.manageBooking.getBooking(req, bookingReference);

    if (!candidate || !booking || !booking.isViewable()) {
      return res.redirect('login');
    }

    setManageBookingEditMode(req);
    store.manageBookingEdits.reset(req);

    // TODO: Future improvement - move this deserialisation to Booking domain object
    // so it's in a single place and can be used in other controllers
    const voiceover = TestVoiceover.fromCRMVoiceover(booking.details.voiceoverLanguage);
    const voiceoverRequested = voiceover !== Voiceover.NONE;
    const voiceoverText = this.getVoiceoverText(req, voiceover);

    const bslRequested = booking.details.additionalSupport === CRMAdditionalSupport.BritishSignLanguage;

    let testLanguage = null;
    try {
      testLanguage = TestLanguage.fromCRMTestLanguage(booking.details.testLanguage);
    } catch (error) {
      logger.error(error, `Test Language was null in booking product ${booking.details.reference}`);
    }

    const viewData = {
      booking: booking.details,
      testLanguage,
      voiceoverRequested,
      voiceover: voiceoverText,
      bslRequested,
    };

    // If the test is not today and we don't already have the 3 working days date
    // need to call CRM to get it and store on the booking in session
    if (!booking.testIsToday() && !booking.details.testDateMinus3ClearWorkingDays) {
      const { testDate, testCentre: { remit } } = booking.details;
      const result = await this.crm.calculateThreeWorkingDays(testDate, remit);
      if (!result) {
        return res.render('manage-booking/change', {
          ...viewData,
          errorCalculatingWorkingDays: true,
        });
      }
      booking = store.manageBooking.updateBooking(req, bookingReference, {
        testDateMinus3ClearWorkingDays: result,
      });
    }

    return res.render('manage-booking/change', {
      ...viewData,
      testIsToday: booking.testIsToday(),
      bookingCannotBeCancelled: !booking.canBeCancelled(),
      bookingCannotBeRescheduled: !booking.canBeRescheduled(),
      lastRefundOrRescheduleDate: booking.lastRefundOrRescheduleDate,
    });
  };

  private getVoiceoverText = (req: Request, voiceover: Voiceover): string => (req?.res?.locals?.target as TARGET === TARGET.NI
    ? TestVoiceover.fromDVAVoiceoverOption(voiceover)
    : TestVoiceover.fromDVSAVoiceoverOption(voiceover)
  );
}

export default new ManageBookingChangeController(
  CRMGateway.getInstance(),
);
