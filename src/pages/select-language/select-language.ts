import { Request, Response } from 'express';
import { TestLanguage } from '../../domain/test-language';
import '../../libraries/request';
import { ValidatorSchema } from '../../middleware/request-validator';
import { store } from '../../services/session';
import { LANGUAGE, TARGET } from '../../domain/enums';

interface SelectLanguageBody {
  testLanguage: LANGUAGE;
}

export class SelectLanguageController {
  public get = (req: Request, res: Response): void => {
    // Skip this page in a Northern Ireland Session and set default language to english
    if (res.locals.target === TARGET.NI) {
      store.currentBooking.update(req, {
        language: LANGUAGE.ENGLISH,
      });

      return res.redirect('find-test-centre');
    }

    if (store.journey.get(req).inManagedBookingEditMode) {
      store.manageBookingEdits.reset(req);
    }

    return this.renderPage(req, res);
  };

  public post = (req: Request, res: Response): void => {
    if (req.hasErrors) {
      return this.renderPage(req, res);
    }
    const { testLanguage } = req.body as SelectLanguageBody;
    const language = testLanguage === LANGUAGE.ENGLISH ? LANGUAGE.ENGLISH : LANGUAGE.WELSH;

    const { inEditMode, inManagedBookingEditMode } = store.journey.get(req);

    if (inManagedBookingEditMode) {
      store.manageBookingEdits.update(req, { language });
      return res.redirect('/manage-booking/check-change');
    }

    store.currentBooking.update(req, {
      language,
    });

    if (inEditMode) {
      return res.redirect('check-your-answers');
    }
    return res.redirect('find-test-centre');
  };

  private renderPage(req: Request, res: Response): void {
    const { inManagedBookingEditMode } = store.journey.get(req);
    const chosenTestLanguage = inManagedBookingEditMode ? undefined : this.selectedLanguage(req)?.key();
    return res.render('test-language', {
      chosenTestLanguage,
      availableLanguages: TestLanguage.availableLanguages(),
      errors: req.errors,
      inManagedBookingEditMode,
      booking: store.currentBooking.get(req),
    });
  }

  public testLanguagePostSchema = (): ValidatorSchema => ({
    testLanguage: {
      in: ['body'],
      custom: {
        options: TestLanguage.isValid,
      },
    },
  });

  private selectedLanguage(req: Request): TestLanguage | undefined {
    const { language } = store.currentBooking.get(req);
    return language ? new TestLanguage(language) : undefined;
  }
}

export default new SelectLanguageController();
