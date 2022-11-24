import { Request, Response } from 'express';
import { PageNames } from '@constants';
import { translate } from '../../helpers/language';
import { ValidatorSchema } from '../../middleware/request-validator';
import { isCustomSupportInputEmptyOrUnmeaningful } from '../../helpers/custom-support-helper';
import nsaNavigator from '../../helpers/nsa-navigator';
import { isNonStandardSupportSelected, isOnlyCustomSupportSelected } from '../../helpers/support';
import { SupportType } from '../../domain/enums';
import config from '../../config';

interface CustomSupportBody {
  support: string;
}

export class CustomSupportController {
  public get = (req: Request, res: Response): void => this.render(req, res);

  public post = (req: Request, res: Response): void => {
    if (!req.session.journey) {
      throw Error('CustomSupportController::post: No journey set');
    }
    const selectedSupportTypes = req.session.currentBooking?.selectSupportType;
    if (!selectedSupportTypes) {
      throw Error('CustomSupportController::getSkipLink: Missing support types session data');
    }

    const { support } = req.body as CustomSupportBody;
    const { inEditMode } = req.session.journey;
    req.session.currentBooking = {
      ...req.session.currentBooking,
      customSupport: support,
    };

    if (req.hasErrors) {
      return this.render(req, res);
    }

    if (config.featureToggles.enableCustomSupportInputValidation
      && !isNonStandardSupportSelected(selectedSupportTypes)
      && isCustomSupportInputEmptyOrUnmeaningful(support)) {
      req.session.journey.inEditMode = false;
      if (isOnlyCustomSupportSelected(selectedSupportTypes)) {
        return res.redirect('confirm-support');
      }
      return res.redirect('leaving-nsa'); // 'Other' + standard support selected
    }

    return inEditMode ? res.redirect('check-your-details') : res.redirect(nsaNavigator.getNextPage(req));
  };

  private render = (req: Request, res: Response): void => {
    res.render(PageNames.CUSTOM_SUPPORT, {
      errors: req.errors,
      savedCustomSupport: req.session.currentBooking?.customSupport,
      backLink: this.getBackLink(req),
      skipLink: this.getSkipLink(req),
    });
  };

  private getBackLink = (req: Request): string => {
    if (!req.session.journey) {
      throw Error('CustomSupportController::getBackLink: No journey set');
    }
    const { inEditMode } = req.session.journey;
    return inEditMode ? 'check-your-details' : nsaNavigator.getPreviousPage(req);
  };

  private getSkipLink = (req: Request): string => {
    const selectedSupportTypes = req.session.currentBooking?.selectSupportType as SupportType[];
    if (!selectedSupportTypes) {
      throw Error('CustomSupportController::getSkipLink: Missing support types session data');
    }
    if (config.featureToggles.enableCustomSupportInputValidation) {
      if (isOnlyCustomSupportSelected(selectedSupportTypes)) {
        return 'confirm-support';
      }
      if (!isNonStandardSupportSelected(selectedSupportTypes)) {
        return 'leaving-nsa';
      }
    }
    return 'staying-nsa';
  };

  /* istanbul ignore next */
  public postSchemaValidation = (): ValidatorSchema => ({
    support: {
      in: ['body'],
      isLength: {
        options: { max: 4000 },
        errorMessage: (): string => translate('customSupport.errorMessage'),
      },
    },
  });
}

export default new CustomSupportController();
