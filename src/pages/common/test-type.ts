import { Request, Response } from 'express';
import '../../libraries/request';
import { ValidatorSchema } from '../../middleware/request-validator';
import config from '../../config';
import RadioButtonItem from '../../interfaces/radio-button-item';
import { translate } from '../../helpers/language';
import { store } from '../../services/session';
import { existsInEnum, TestType } from '../../domain/enums';

export class TestTypeController {
  public get = async (req: Request, res: Response): Promise<void> => this.renderPage(req, res);

  public post = async (req: Request, res: Response): Promise<void> => {
    if (req.hasErrors) {
      return this.renderPage(req, res);
    }

    const { inEditMode } = store.journey.get(req);
    if (inEditMode) {
      store.resetBooking(req);
      store.journey.update(req, {
        inEditMode: false,
      });
    }

    store.currentBooking.update(req, {
      testType: req.body.testType,
    });

    return res.redirect('test-language');
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  private async renderPage(req: Request, res: Response): Promise<void> {
    // TODO: Get available tests via eligibility API
    const availableTestTypes = [TestType.Car, TestType.Motorcycle];
    const chosenTestType = store.currentBooking.get(req).testType;
    const { support } = store.journey.get(req);

    return res.render('common/test-type', {
      backLink: support ? undefined : 'contact-details',
      tests: this.buildRadioButtonItems(availableTestTypes, chosenTestType),
      errors: req.errors,
    });
  }

  private buildRadioButtonItems(availableTestTypes: TestType[], chosenTestType: TestType | undefined): RadioButtonItem[] {
    return availableTestTypes.map((testType): RadioButtonItem => ({
      value: testType,
      text: translate(`generalContent.testTypes.${testType}`),
      label: {
        classes: 'govuk-label--s',
      },
      hint: {
        text: `£${config.view.theoryTestPriceInGbp.split('.')[0]}`,
      },
      checked: chosenTestType === testType,
    }));
  }

  public postSchemaValidation: ValidatorSchema = {
    testType: {
      in: ['body'],
      errorMessage: (): string => translate('testType.validationError'),
      custom: {
        options: existsInEnum(TestType),
      },
    },
  };
}

export default new TestTypeController();
