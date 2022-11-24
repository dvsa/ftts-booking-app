import { Request, Response } from 'express';
import { PageNames } from '@constants';
import { YesNo } from '../../domain/enums';
import { translate } from '../../helpers/language';
import { ValidatorSchema } from '../../middleware/request-validator';

interface TelephoneContactBody {
  contactByTelephone: YesNo;
  telephoneNumber: string;
}

export class TelephoneContactController {
  public get = (req: Request, res: Response): void => {
    if (!req.session.candidate) {
      throw Error('TelephoneContactController::get: No candidate set');
    }
    this.renderPage(req, res);
  };

  public post = (req: Request, res: Response): void => {
    if (req.hasErrors) {
      return this.renderPage(req, res);
    }

    const { contactByTelephone, telephoneNumber } = req.body as TelephoneContactBody;
    req.session.candidate = {
      ...req.session.candidate,
      // Store as false if user says 'no' to being contacted by phone
      telephone: contactByTelephone === YesNo.NO ? false : telephoneNumber,
    };

    if (contactByTelephone === YesNo.YES) {
      req.session.journey = {
        ...req.session.journey,
        inEditMode: false,
      };
      return res.redirect('voicemail');
    }

    // reset voicemail to undefined if the user selects no to telephone
    if (req.session.currentBooking?.voicemail !== undefined) {
      req.session.currentBooking.voicemail = undefined;
    }

    return res.redirect('check-your-details');
  };

  private renderPage = (req: Request, res: Response): void => {
    if (!req.session.candidate) {
      throw Error('TelephoneContactController::renderPage: No candidate set');
    }
    if (!req.session.journey) {
      throw Error('TelephoneContactController::renderPage: No journey set');
    }
    const { telephone } = req.session.candidate;
    const { inEditMode } = req.session.journey;
    let contactByTelephone;

    if (telephone !== undefined) {
      if (telephone) {
        contactByTelephone = YesNo.YES;
      } else {
        contactByTelephone = YesNo.NO;
      }
    }

    const backLink = inEditMode ? 'check-your-details' : 'email-contact';

    return res.render(PageNames.TELEPHONE_CONTACT, {
      telephoneNumber: req.body.telephoneNumber ?? telephone,
      contactByTelephone: req.body.contactByTelephone ?? contactByTelephone,
      backLink,
      errors: req.errors,
    });
  };

  /* istanbul ignore next */
  public postSchemaValidation = (req: Request): ValidatorSchema => {
    const { contactByTelephone } = req.body as TelephoneContactBody;
    if (contactByTelephone === YesNo.YES) {
      return {
        telephoneNumber: {
          in: ['body'],
          notEmpty: {
            errorMessage: (): string => translate('telephoneContact.noTelephoneError'),
          },
          isLength: {
            options: { max: 50 },
            errorMessage: (): string => translate('telephoneContact.telephoneTooLongError'),
          },
        },
      };
    }
    return {
      contactByTelephone: {
        in: ['body'],
        equals: {
          options: YesNo.NO,
          errorMessage: (): string => translate('telephoneContact.noSelectionError'),
        },
      },
    };
  };
}

export default new TelephoneContactController();
