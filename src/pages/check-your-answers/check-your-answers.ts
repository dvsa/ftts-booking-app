import { Request, Response } from 'express';
import '../../libraries/request';
import { Scheduler } from '../../services/scheduling/scheduling-service';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';
import { BookingHandler } from './booking-handler';
import { Booking, store } from '../../services/session';
import { translate } from '../../helpers/language';
import { TestLanguage } from '../../domain/test-language';
import { Voiceover } from '../../domain/enums';
import { PaymentHandler } from '../../services/payments/payment-handler';
import logger from '../../helpers/logger';

export class CheckYourAnswers {
  constructor(
    private scheduling: Scheduler,
    private crmGateway: CRMGateway,
    private paymentHandler: PaymentHandler,
  ) { }

  public get = (req: Request, res: Response): void => {
    store.journey.update(req, {
      inEditMode: true,
    });

    this.renderCheckYourAnswers(req, res);
  };

  public post = async (req: Request, res: Response): Promise<void> => {
    store.journey.update(req, {
      inEditMode: false,
    });

    try {
      const handler = new BookingHandler(this.scheduling, this.crmGateway, req);
      await handler.createBooking();
    } catch (error) {
      logger.error(error, 'BOOKING-APP::CHECK-YOUR-ANSWERS: Error creating booking entity in CRM');
      throw error;
    }

    try {
      const gatewayUrl = await this.paymentHandler.handlePayment(req);
      return res.redirect(gatewayUrl);
    } catch (error) {
      logger.error(error, 'BOOKING-APP::CHECK-YOUR-ANSWERS: Error performing payment');
      return this.renderCheckYourAnswers(req, res);
    }
  };

  private renderCheckYourAnswers(req: Request, res: Response): void {
    const candidate = store.candidate.get(req);
    const { centre, dateTime } = store.editedLocationTime.get(req);

    const updatedLocationTime: Partial<Booking> = {};
    if (dateTime) {
      updatedLocationTime.dateTime = dateTime;
      if (centre) {
        updatedLocationTime.centre = centre;
      }
      store.currentBooking.update(req, updatedLocationTime);
    }
    store.editedLocationTime.reset(req);

    const booking = store.currentBooking.get(req);
    const testLanguage = TestLanguage.from(booking.language).toString();
    const voiceover = booking.voiceover ?? Voiceover.NONE;

    return res.render('check-your-answers', {
      firstNames: candidate.firstnames,
      surname: candidate.surname,
      dateOfBirth: candidate.dateOfBirth,
      licenceNumber: candidate.licenceNumber,
      emailAddress: candidate.email,
      testLanguage,
      dateTime: booking.dateTime,
      testCentre: booking.centre,
      testType: booking.testType,
      additionalSupport: this.getYesNoLabel(store.journey.get(req).support),
      bsl: this.getYesNoLabel(booking.bsl),
      voiceover: voiceover === Voiceover.NONE ? this.getYesNoLabel(false) : booking.voiceover,
      errors: req.errors,
    });
  }

  private getYesNoLabel(value: boolean): string {
    return value ? translate('generalContent.yes') : translate('generalContent.no');
  }
}

export default new CheckYourAnswers(
  Scheduler.getInstance(),
  CRMGateway.getInstance(),
  PaymentHandler.getInstance(),
);
