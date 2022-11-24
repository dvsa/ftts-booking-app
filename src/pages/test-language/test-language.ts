import { Request, Response } from 'express';

import { PageNames } from '@constants';
import { TestLanguage } from '../../domain/test-language';
import { ValidatorSchema } from '../../middleware/request-validator';
import { Language, Target, TestType } from '../../domain/enums';
import { isStandardJourney, isNonStandardJourney, isSupportedStandardJourney } from '../../helpers/journey-helper';

interface SelectLanguageBody {
  testLanguage: Language;
}

export class TestLanguageController {
  public get = (req: Request, res: Response): void => {
    if (!req.session.journey) {
      throw Error('TestLanguageController::get: No journey set');
    }
    if (!req.session.currentBooking) {
      throw Error('TestLanguageController::get: No currentBooking set');
    }
    const { inManagedBookingEditMode } = req.session.journey;
    // Skip this page in a Northern Ireland Session or ERS Test and set default language to english
    if (req.session.journey.isInstructor) {
      if (!TestLanguage.canChangeTestLanguage(req.session.target || Target.GB, req.session.currentBooking.testType as TestType) && !req.session.journey.receivedSupportRequestPageFlag) {
        req.session.currentBooking = {
          ...req.session.currentBooking,
          language: Language.ENGLISH,
        };
        return res.redirect(isStandardJourney(req) ? 'select-standard-support' : 'select-support-type');
      }
    } else if (req.session.target === Target.NI) {
      req.session.currentBooking = {
        ...req.session.currentBooking,
        language: Language.ENGLISH,
      };
      return res.redirect(isStandardJourney(req) ? 'select-standard-support' : 'select-support-type');
    }

    if (inManagedBookingEditMode) {
      req.session.manageBookingEdits = undefined;
    }
    return this.renderPage(req, res);
  };

  public post = (req: Request, res: Response): void => {
    if (req.hasErrors) {
      return this.renderPage(req, res);
    }
    if (!req.session.journey) {
      throw Error('TestLanguageController::post: No journey set');
    }
    if (!req.session.currentBooking?.testType) {
      throw Error('TestLanguageController::post: No test type set');
    }

    const testType = req.session.currentBooking?.testType;
    const canChangeLanguage = TestLanguage.canChangeTestLanguage(req.session.target || Target.GB, testType);

    if (!canChangeLanguage) {
      throw Error(`TestLanguageController::post: Cannot change test language for test type: ${testType} and target ${req.session.target}`);
    }

    const { testLanguage } = req.body as SelectLanguageBody;
    const language = testLanguage === Language.ENGLISH ? Language.ENGLISH : Language.WELSH;

    const { inEditMode, inManagedBookingEditMode } = req.session.journey;

    if (inManagedBookingEditMode) {
      req.session.manageBookingEdits = {
        ...req.session.manageBookingEdits,
        language,
      };
      return res.redirect('/manage-booking/check-change');
    }

    req.session.currentBooking = {
      ...req.session.currentBooking,
      language,
    };

    if (inEditMode) {
      if (isStandardJourney(req) || isSupportedStandardJourney(req)) {
        return res.redirect('check-your-answers');
      }
      return res.redirect('check-your-details');
    }
    return isNonStandardJourney(req) ? res.redirect('select-support-type') : res.redirect('select-standard-support');
  };

  private renderPage(req: Request, res: Response): void {
    if (!req.session.journey) {
      throw Error('TestLanguageController::renderPage: No journey set');
    }
    const { inManagedBookingEditMode, inEditMode } = req.session.journey;
    const booking = req.session.currentBooking;
    const chosenTestLanguage = inManagedBookingEditMode ? undefined : this.selectedLanguage(req)?.key();
    let backLink;

    if (inEditMode) {
      if (isStandardJourney(req) || isSupportedStandardJourney(req)) {
        backLink = 'check-your-answers';
      } else {
        backLink = 'check-your-details';
      }
    } else if (inManagedBookingEditMode) {
      backLink = booking?.bookingRef;
    } else if (req.session.journey.receivedSupportRequestPageFlag) {
      backLink = 'received-support-request';
    } else {
      backLink = 'test-type';
    }

    return res.render(PageNames.TEST_LANGUAGE, {
      availableLanguages: TestLanguage.availableLanguages(),
      errors: req.errors,
      booking: req.session.currentBooking,
      inManagedBookingEditMode,
      backLink,
      chosenTestLanguage,
    });
  }

  /* istanbul ignore next */
  public testLanguagePostSchema = (): ValidatorSchema => ({
    testLanguage: {
      in: ['body'],
      custom: {
        options: TestLanguage.isValid,
      },
    },
  });

  private selectedLanguage(req: Request): TestLanguage | undefined {
    if (!req.session.currentBooking) {
      throw Error('TestLanguageController::selectedLanguage: No currentBooking set');
    }
    const { language } = req.session.currentBooking;
    return language ? new TestLanguage(language) : undefined;
  }
}

export default new TestLanguageController();
