import { Request, Response } from 'express';
import { YES_NO } from '../../domain/enums';
import { translate } from '../../helpers/language';
import { ValidatorSchema } from '../../middleware/request-validator';
import { store } from '../../services/session';

interface TelephoneContactBody {
  contactByTelephone: YES_NO;
  telephoneNumber: string;
}

export class TelephoneContactController {
  public get = (req: Request, res: Response): void => {
    const { telephone } = store.candidate.get(req);

    let contactByTelephone;
    if (telephone === false) {
      contactByTelephone = YES_NO.NO;
    } else if (telephone) {
      contactByTelephone = YES_NO.YES;
    }

    return res.render('supported/telephone-contact', {
      contactByTelephone,
      telephoneNumber: telephone,
    });
  };

  public post = (req: Request, res: Response): void => {
    if (req.hasErrors) {
      return res.render('supported/telephone-contact', {
        contactByTelephone: req.body.contactByTelephone,
        telephoneNumber: req.body.telephoneNumber,
        errors: req.errors,
      });
    }

    const { contactByTelephone, telephoneNumber } = req.body as TelephoneContactBody;
    store.candidate.update(req, {
      // Store as false if user says 'no' to being contacted by phone
      telephone: contactByTelephone === YES_NO.NO ? false : telephoneNumber,
    });

    return res.redirect('#');
  };

  public postSchemaValidation = (req: Request): ValidatorSchema => {
    const { contactByTelephone } = req.body as TelephoneContactBody;
    if (contactByTelephone === YES_NO.YES) {
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
          options: YES_NO.NO,
          errorMessage: (): string => translate('telephoneContact.noSelectionError'),
        },
      },
    };
  };
}

export default new TelephoneContactController();
