import { Request, Response } from 'express';
import { Voiceover } from '../../domain/enums';
import { TestLanguage } from '../../domain/test-language';
import { translate } from '../../helpers/language';
import { store } from '../../services/session';

export class BookingConfirmation {
  public get = (req: Request, res: Response): void => {
    const {
      bookingRef, dateTime, centre, testType, lastRefundDate, language, bsl, voiceover,
    } = store.currentBooking.get(req);

    const { support } = store.journey.get(req);

    const mockRef = 'HDJ2123F'; // TODO FTT-6801 Replace with actual reference from booking.

    if (support) {
      return res.render('supported/booking-confirmation', {
        bookingRef: mockRef,
        inSupportMode: support,
      });
    }

    return res.render('create/booking-confirmation', {
      centre,
      bookingRef,
      testType,
      dateTime,
      latestRefundDate: lastRefundDate,
      language: TestLanguage.from(language).toString(),
      bsl: bsl ? translate('generalContent.yes') : translate('generalContent.no'),
      voiceover: voiceover === Voiceover.NONE ? translate('generalContent.no') : voiceover,
    });
  };
}

export default new BookingConfirmation();
