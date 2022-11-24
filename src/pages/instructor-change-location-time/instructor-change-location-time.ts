import { Request, Response } from 'express';
import { PageNames } from '@constants';
import { translate } from '../../helpers/language';
import { ChangeLocationTimeOptions } from '../../domain/enums';
import { ValidatorSchema } from '../../middleware/request-validator';
import { store } from '../../services/session';
import RadioButtonItem from '../../interfaces/radio-button-item';
import { Booking } from '../../domain/booking/booking';
import { setManageBookingEditMode } from '../../helpers/manage-booking-handler';
import { toISODateString } from '../../domain/utc-date';

interface ChangeLocationTimeBody {
  changeLocationOrTime: ChangeLocationTimeOptions;
}

export class InstructorChangeLocationTime {
  public get = (req: Request, res: Response): void => {
    if (req.session.journey?.inManagedBookingEditMode) {
      req.session.manageBookingEdits = undefined;
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
      req.session.journey = {
        ...req.session.journey,
        inEditMode: true,
      };
    }

    const { changeLocationOrTime } = req.body as ChangeLocationTimeBody;

    switch (changeLocationOrTime) {
      case ChangeLocationTimeOptions.TIME_ONLY:
        return this.gotoChooseAppointment(req, res, booking as Booking);
      case ChangeLocationTimeOptions.TIME_AND_DATE:
        return this.gotoSelectDate(req, res);
      case ChangeLocationTimeOptions.LOCATION:
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
    res.render(PageNames.INSTRUCTOR_CHANGE_LOCATION_TIME, {
      options: this.buildRadioButtonItems(),
      errors: req.errors,
      checkAnswersLink: this.getCheckAnswersLink(req),
    });
  };

  private buildRadioButtonItems(): RadioButtonItem[] {
    return Object.values(ChangeLocationTimeOptions).map((option): RadioButtonItem => ({
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

    return 'check-your-answers';
  }

  private gotoChooseAppointment(req: Request, res: Response, booking: Booking): void {
    if (this.isManageBookingSession(req)) {
      req.session.journey = {
        ...req.session.journey,
        managedBookingRescheduleChoice: '/manage-booking/choose-appointment',
      };
      const isoDateTime = toISODateString(booking.details.testDate as unknown as string);
      return res.redirect(`/manage-booking/choose-appointment?selectedDate=${isoDateTime}`);
    }

    return res.redirect('choose-appointment');
  }

  private gotoSelectDate(req: Request, res: Response): void {
    if (this.isManageBookingSession(req)) {
      req.session.journey = {
        ...req.session.journey,
        managedBookingRescheduleChoice: '/manage-booking/select-date',
      };
      return res.redirect('/manage-booking/select-date');
    }

    return res.redirect('select-date');
  }

  private gotoFindTestCentre(req: Request, res: Response): void {
    if (this.isManageBookingSession(req)) {
      req.session.journey = {
        ...req.session.journey,
        managedBookingRescheduleChoice: '/manage-booking/find-test-centre',
      };
      return res.redirect('/manage-booking/find-test-centre');
    }

    return res.redirect('find-test-centre');
  }
}

export default new InstructorChangeLocationTime();
