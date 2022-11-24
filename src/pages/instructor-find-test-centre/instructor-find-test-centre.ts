import { Request, Response } from 'express';
import { PageNames } from '@constants';
import { Target } from '../../domain/enums';
import { isNonStandardJourney, isSupportedStandardJourney } from '../../helpers/journey-helper';
import { translate } from '../../helpers/language';
import { RequestValidationError, ValidatorSchema } from '../../middleware/request-validator';

interface FindTestCentreBody {
  searchQuery: string;
}
export class InstructorFindTestCentreController {
  public get = (req: Request, res: Response): void => {
    if (!req.session.journey) {
      throw Error('InstructorFindTestCentreController::get: No journey set');
    }
    if (!req.session.currentBooking) {
      throw Error('InstructorFindTestCentreController::get: No currentBooking set');
    }
    const { testCentreSearch } = req.session;
    const { inEditMode } = req.session.journey;

    if (testCentreSearch?.zeroCentreResults) {
      req.errors = [{
        msg: translate('findTestCentre.errorNotRecognised'),
        param: 'searchQuery',
      } as RequestValidationError];

      // Remove the flag so we don't keep showing the validation
      req.session.testCentreSearch = {
        ...req.session.testCentreSearch,
        zeroCentreResults: false,
      };
    }

    let backLink;
    if (isSupportedStandardJourney(req)) {
      // Back link for coming into the SA journey from NSA
      backLink = 'nsa/email-contact';
    } else if (req.session.target === Target.NI && !isNonStandardJourney(req)) {
      if (req.session.journey.receivedSupportRequestPageFlag) {
        backLink = 'received-support-request';
      } else {
        backLink = 'test-type';
      }
    } else if (req.session.journey.shownVoiceoverPageFlag) {
      backLink = 'change-voiceover';
    } else if (req.session.journey.shownStandardSupportPageFlag) {
      backLink = 'select-standard-support';
    } else {
      backLink = 'test-type';
    }

    res.render(PageNames.INSTRUCTOR_FIND_TEST_CENTRE, {
      errors: req.errors?.length ? req.errors : undefined,
      searchQuery: !inEditMode ? testCentreSearch?.searchQuery : undefined,
      backLink,
      noResultsError: !req.errors?.length,
    });
  };

  public post = (req: Request, res: Response): void => {
    if (!req.session.journey) {
      throw Error('InstructorFindTestCentreController::post: No journey set');
    }
    if (!req.session.currentBooking) {
      throw Error('InstructorFindTestCentreController::post: No currentBooking set');
    }
    const { support, standardAccommodation } = req.session.journey;
    if (req.hasErrors) {
      let backLink = 'test-language';
      if (support && standardAccommodation) {
        backLink = 'email-contact';
      }
      return res.render(PageNames.INSTRUCTOR_FIND_TEST_CENTRE, {
        errors: req.errors,
        backLink,
        noResultsError: !req.errors?.length,
      });
    }

    const { searchQuery } = req.body as FindTestCentreBody;
    req.session.testCentreSearch = {
      ...req.session.testCentreSearch,
      searchQuery,
      numberOfResults: undefined,
    };
    return res.redirect('select-test-centre');
  };

  /* istanbul ignore next */
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

export default new InstructorFindTestCentreController();
