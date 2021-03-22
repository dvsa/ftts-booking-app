import { Request, Response } from 'express';
import { translate } from '../../helpers/language';
import { ValidatorSchema, RequestValidationError } from '../../middleware/request-validator';
import { store } from '../../services/session';

interface FindTestCentreBody {
  searchQuery: string;
}
export class FindTestCentreController {
  public get = (req: Request, res: Response): void => {
    const testCentreSearch = store.testCentreSearch.get(req);
    const { inEditMode } = store.journey.get(req);

    if (testCentreSearch.zeroCentreResults) {
      (req.errors || (req.errors = [])).push({
        msg: translate('findTestCentre.errorNotRecognised'),
        param: 'searchQuery',
      } as RequestValidationError);

      // Remove the flag so we don't keep showing the validation
      store.testCentreSearch.update(req, {
        zeroCentreResults: false,
      });
    }

    const backLink = !this.isManagedBookingSession(req) ? '/test-language' : `/manage-change-location-time/${store.currentBooking.get(req).bookingRef}`;

    res.render('find-test-centre', {
      errors: req.errors?.length ? req.errors : undefined,
      searchQuery: !inEditMode ? testCentreSearch.searchQuery : undefined,
      backLink,
    });
  };

  public post = (req: Request, res: Response): void => {
    if (req.hasErrors) {
      const backLink = !this.isManagedBookingSession(req) ? '/test-language' : `/manage-change-location-time/${store.currentBooking.get(req).bookingRef}`;
      return res.render('find-test-centre', {
        errors: req.errors,
        backLink,
      });
    }

    const { searchQuery } = req.body as FindTestCentreBody;
    store.testCentreSearch.update(req, {
      searchQuery,
      numberOfResults: undefined,
    });
    return res.redirect(!this.isManagedBookingSession(req) ? '/select-test-centre' : '/manage-booking/select-test-centre');
  };

  private isManagedBookingSession(req: Request): boolean {
    return store.journey.get(req).inManagedBookingEditMode;
  }

  public postSchemaValidation: ValidatorSchema = {
    searchQuery: {
      in: ['body'],
      isLength: {
        errorMessage: (): string => translate('findTestCentre.errorNotRecognised'),
        options: {
          min: 3,
          max: 512,
        },
      },
    },
  };
}

export default new FindTestCentreController();
