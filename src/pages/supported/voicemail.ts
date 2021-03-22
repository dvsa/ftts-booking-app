import { Request, Response } from 'express';
import { YES_NO } from '../../domain/enums';
import { translate } from '../../helpers/language';
import { ValidatorSchema } from '../../middleware/request-validator';
import { store } from '../../services/session';
import { YesOrNo } from '../../value-objects/yes-or-no';

interface VoicemailBody {
  voicemail: YES_NO;
}

export class VoicemailController {
  public get = (req: Request, res: Response): void => res.render('supported/voicemail');

  public post = (req: Request, res: Response): void => {
    if (req.hasErrors) {
      req.errors.forEach((error) => {
        error.msg = translate('voicemail.errorBannerNotification');
      });
      return res.render('supported/voicemail', { errors: req.errors });
    }

    const { voicemail } = req.body as VoicemailBody;

    store.currentBooking.update(req, {
      voicemail: voicemail === YES_NO.YES,
    });

    return res.redirect('#');
  };

  public postSchemaValidation = (): ValidatorSchema => ({
    voicemail: {
      in: ['body'],
      custom: {
        options: YesOrNo.isValid,
      },
    },
  });
}

export default new VoicemailController();
