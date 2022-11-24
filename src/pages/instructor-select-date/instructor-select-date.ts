import { Request, Response } from 'express';
import { PageNames } from '@constants';
import { ValidatorSchema } from '../../middleware/request-validator';
import { translate } from '../../helpers/language';
import { DateInput } from '../../domain/date-input';
import { Eligibility } from '../../domain/types';

class InstructorSelectDateController {
  public get = (req: Request, res: Response): void => {
    if (!req.session.journey) {
      throw Error('InstructorSelectDateController::get: No journey set');
    }
    if (!req.session.currentBooking) {
      throw Error('InstructorSelectDateController::get: No currentBooking set');
    }
    if (!req.session.candidate && !req.session.manageBooking?.candidate) {
      throw Error('InstructorSelectDateController::get: No candidate set');
    }
    let selectedDate;
    const dateString = req.session.testCentreSearch?.selectedDate;
    const { inEditMode } = req.session.journey;

    if (dateString && !inEditMode) {
      selectedDate = DateInput.split(dateString);
    }
    const candidateEligibilities = req.session.candidate?.eligibilities || req.session.manageBooking?.candidate?.eligibilities;
    const test = candidateEligibilities?.find((eligibility: Eligibility) => eligibility.testType === req.session.currentBooking?.testType);

    if (!test) {
      throw new Error('InstructorSelectDateController::get: Test type mismatch');
    }

    return res.render(PageNames.INSTRUCTOR_SELECT_DATE, {
      ...selectedDate,
      minDate: DateInput.min,
      maxDate: DateInput.max,
      selectTestCentreLink: 'select-test-centre',
      isManagedBookingSession: this.isManagedBookingSession(req),
    });
  };

  public post = (req: Request, res: Response): void => {
    if (!req.session.candidate && !req.session.manageBooking?.candidate) {
      throw Error('InstructorSelectDateController::post: No candidate set');
    }
    if (req.hasErrors) {
      // Only want to show one error at a time
      // If multiple fields are empty, show a single invalid date error
      const error = req.errors[0];
      if (req.errors.length > 2) {
        error.param = 'date';
        error.msg = 'dateNotValid';
      }

      error.msg = translate(`selectDate.errorMessages.${error.msg}`);
      const candidateEligibilities = req.session.candidate?.eligibilities || req.session.manageBooking?.candidate?.eligibilities;
      const test = candidateEligibilities?.find((eligibility: Eligibility) => eligibility.testType === req.session.currentBooking?.testType);

      if (!test) {
        throw new Error('InstructorSelectDateController::post: Test type mismatch');
      }

      return res.render(PageNames.INSTRUCTOR_SELECT_DATE, {
        ...req.body,
        errors: [error],
        minDate: DateInput.min,
        maxDate: DateInput.max,
        selectTestCentreLink: 'select-test-centre',
        isManagedBookingSession: this.isManagedBookingSession(req),
      });
    }
    if (!req.session.currentBooking) {
      throw Error('InstructorSelectDateController::post: No currentBooking set');
    }

    const { firstSelectedDate } = req.session.currentBooking;

    const dateString = DateInput.of(req.body).toISOFormat();

    if (!firstSelectedDate) {
      req.session.currentBooking = {
        ...req.session.currentBooking,
        firstSelectedDate: dateString,
      };
    }

    req.session.testCentreSearch = {
      ...req.session.testCentreSearch,
      selectedDate: dateString,
    };

    return res.redirect('choose-appointment');
  };

  private isManagedBookingSession(req: Request): boolean {
    return req.session.journey?.inManagedBookingEditMode || false;
  }

  /* istanbul ignore next */
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

export default new InstructorSelectDateController();
