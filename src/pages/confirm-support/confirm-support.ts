import { Request, Response } from 'express';
import { PageNames } from '@constants';
import { existsInEnum } from '../../domain/enums';
import { translate } from '../../helpers/language';
import { ValidatorSchema } from '../../middleware/request-validator';

export enum ConfirmSupportOption {
  TELL_US_WHAT_SUPPORT = '1',
  BOOK_WITHOUT_SUPPORT = '2',
  CONTINUE_WITHOUT_TELLING_US = '3',
}

interface ConfirmSupportBody {
  confirmSupport: ConfirmSupportOption;
}

export class ConfirmSupportController {
  public get = (req: Request, res: Response): void => {
    // When the user clicks back to confirm support page, change standardAccommodation back to false
    req.session.journey = {
      ...req.session.journey,
      standardAccommodation: false,
    };
    this.render(req, res);
  };

  public post = (req: Request, res: Response): void => {
    if (!req.session.journey) {
      throw Error('ConfirmSupportController::post: Missing journey session data');
    }

    if (req.hasErrors) {
      this.render(req, res);
    }

    const { confirmSupport } = req.body as ConfirmSupportBody;

    req.session.journey = {
      ...req.session.journey,
      confirmingSupport: true,
    };

    if (confirmSupport === ConfirmSupportOption.TELL_US_WHAT_SUPPORT) {
      req.session.currentBooking = {
        ...req.session.currentBooking,
        selectSupportType: undefined,
      };
      res.redirect('select-support-type');
    } else if (confirmSupport === ConfirmSupportOption.BOOK_WITHOUT_SUPPORT) {
      res.redirect('leaving-nsa');
    } else if (confirmSupport === ConfirmSupportOption.CONTINUE_WITHOUT_TELLING_US) {
      res.redirect('staying-nsa');
    }
  };

  private render = (req: Request, res: Response): void => res.render(PageNames.CONFIRM_SUPPORT, {
    errors: req.errors,
    backLink: 'select-support-type',
  });

  /* istanbul ignore next */
  public postSchemaValidation = (): ValidatorSchema => ({
    confirmSupport: {
      in: ['body'],
      errorMessage: (): string => translate('confirmSupport.error'),
      custom: {
        options: existsInEnum(ConfirmSupportOption),
      },
    },
  });
}

export default new ConfirmSupportController();
