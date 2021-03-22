import dayjs from 'dayjs';
import { Request, Response } from 'express';
import { ValidatorSchema } from '../../middleware/request-validator';
import { store } from '../../services/session';
import { translate } from '../../helpers/language';
import { DateInput } from './date-input';

class SelectDateController {
  public get = (req: Request, res: Response): void => {
    let selectedDate;
    const dateString = !this.isManagedBookingSession(req) ? store.testCentreSearch.get(req).selectedDate : '';
    const { inEditMode } = store.journey.get(req);

    if (dateString && !inEditMode) {
      selectedDate = DateInput.split(dateString);
    }

    const selectTestCentreLink = this.getBackLink(req);

    return res.render('select-date', {
      ...selectedDate,
      minDate: DateInput.min,
      maxDate: DateInput.max,
      selectTestCentreLink,
    });
  };

  public post = (req: Request, res: Response): void => {
    if (req.hasErrors) {
      // Only want to show one error at a time
      // If multiple fields are empty, show a single invalid date error
      const error = req.errors[0];
      if (req.errors.length > 2) {
        error.param = 'date';
        error.msg = 'dateNotValid';
      }

      error.msg = translate(`selectDate.errorMessages.${error.msg}`);

      const selectTestCentreLink = this.getBackLink(req);

      return res.render('select-date', {
        ...req.body,
        errors: [error],
        minDate: DateInput.min,
        maxDate: DateInput.max,
        selectTestCentreLink,
      });
    }

    const dateString = DateInput.of(req.body).toISOFormat();

    if (this.isManagedBookingSession(req)) {
      store.manageBookingEdits.update(req, {
        dateTime: dateString,
      });

      const selectedDate = dayjs(dateString).startOf('day').toISOString();
      return res.redirect(`/manage-booking/choose-appointment?selectedDate=${selectedDate}`);
    }

    store.testCentreSearch.update(req, {
      selectedDate: dateString,
    });

    return res.redirect('/choose-appointment');
  };

  private isManagedBookingSession(req: Request): boolean {
    return store.journey.get(req).inManagedBookingEditMode;
  }

  private getBackLink(req: Request): string {
    if (!this.isManagedBookingSession(req)) {
      return '/select-test-centre';
    }

    // go back a page or go back to manage booking rescheduling choices
    const bookingReference = store.currentBooking.get(req).bookingRef;
    return req.url.startsWith(store.journey.get(req).managedBookingRescheduleChoice) ? `/manage-change-location-time/${bookingReference}` : '/manage-booking/select-test-centre';
  }

  public postSchemaValidation: ValidatorSchema = {
    day: {
      in: ['body'],
      notEmpty: true,
      errorMessage: 'dayEmpty',
    },
    month: {
      in: ['body'],
      isEmpty: {
        errorMessage: 'monthEmpty',
        negated: true,
      },
    },
    year: {
      in: ['body'],
      isEmpty: {
        errorMessage: 'yearEmpty',
        negated: true,
      },
    },
    date: {
      custom: {
        options: DateInput.isValid,
      },
    },
  };
}

export default new SelectDateController();
