import { Request, Response } from 'express';
import '../../libraries/request';
import { translate } from '../../helpers/language';
import { CHANGE_LOCATION_TIME } from '../../domain/enums';
import { ValidatorSchema } from '../../middleware/request-validator';
import { store } from '../../services/session';
import RadioButtonItem from '../../interfaces/radio-button-item';
import { Booking } from '../../domain/booking/booking';
import { toStartOfDay } from '../../nunjucks-filters/local-date-time-filter';
import { setManageBookingEditMode } from './manage-booking-handler';

interface ChangeLocationTimeBody {
  changeLocationOrTime: CHANGE_LOCATION_TIME;
}

export class ChangeLocationTime {
  public get = (req: Request, res: Response): void => {
    if (store.journey.get(req).inManagedBookingEditMode) {
      store.manageBookingEdits.reset(req);
    }
    this.renderPage(req, res);
  };

  public post = (req: Request, res: Response): void => {
    if (req.hasErrors) {
      return this.renderPage(req, res);
    }
    let booking;
    if (this.isManageBookingSession(req)) {
      booking = store.manageBooking.getBooking(req, req.params.ref);
      setManageBookingEditMode(req);
    } else {
      store.journey.update(req, {
        inEditMode: true,
      });
    }

    const { changeLocationOrTime } = req.body as ChangeLocationTimeBody;

    switch (changeLocationOrTime) {
      case CHANGE_LOCATION_TIME.TIME_ONLY:
        return this.gotoChooseAppointment(req, res, booking as Booking);
      case CHANGE_LOCATION_TIME.TIME_AND_DATE:
        return this.gotoSelectDate(req, res);
      case CHANGE_LOCATION_TIME.LOCATION:
        return this.gotoFindTestCentre(req, res);
      default:
    }

    return res.redirect(this.getCheckAnswersLink(req));
  };

  public postSchema: ValidatorSchema = {
    changeLocationOrTime: {
      in: ['body'],
      isEmpty: {
        errorMessage: (): string => translate('changeLocationTime.validationError'),
        negated: true,
      },
    },
  };

  private renderPage = (req: Request, res: Response): void => {
    res.render('change-location-time', {
      options: this.buildRadioButtonItems(),
      errors: req.errors,
      checkAnswersLink: this.getCheckAnswersLink(req),
    });
  };

  private buildRadioButtonItems(): RadioButtonItem[] {
    return Object.values(CHANGE_LOCATION_TIME).map((option): RadioButtonItem => ({
      value: option,
      text: translate(`changeLocationTime.${option}.label`),
      label: {
        classes: 'govuk-label--s',
      },
      hint: {
        text: translate(`changeLocationTime.${option}.hint`),
      },
      checked: false,
    }));
  }

  private isManageBookingSession(req: Request): boolean {
    return req.url.startsWith('/manage-change-location-time');
  }

  private getCheckAnswersLink(req: Request): string {
    if (this.isManageBookingSession(req)) {
      return `/manage-booking/${req.params.ref}`;
    }

    return '/check-your-answers';
  }

  private gotoChooseAppointment(req: Request, res: Response, booking: Booking): void {
    if (this.isManageBookingSession(req)) {
      store.journey.update(req, { managedBookingRescheduleChoice: '/manage-booking/choose-appointment' });
      return res.redirect(`/manage-booking/choose-appointment?selectedDate=${toStartOfDay(booking.details.testDate)}`);
    }

    return res.redirect('/choose-appointment');
  }

  private gotoSelectDate(req: Request, res: Response): void {
    if (this.isManageBookingSession(req)) {
      store.journey.update(req, { managedBookingRescheduleChoice: '/manage-booking/select-date' });
      return res.redirect('/manage-booking/select-date');
    }

    return res.redirect('/select-date');
  }

  private gotoFindTestCentre(req: Request, res: Response): void {
    if (this.isManageBookingSession(req)) {
      store.journey.update(req, { managedBookingRescheduleChoice: '/manage-booking/find-test-centre' });
      return res.redirect('/manage-booking/find-test-centre');
    }

    return res.redirect('/find-test-centre');
  }
}

export default new ChangeLocationTime();
