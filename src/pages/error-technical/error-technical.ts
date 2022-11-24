import { Request, Response } from 'express';
import { PageNames } from '@constants';
import { Target } from '../../domain/enums';
import { setCorrectLanguage } from '../../helpers/language';
import { getStartAgainLink } from '../../helpers/links';
import { store } from '../../services/session';

export class TechnicalErrorController {
  public get = async (req: Request, res: Response): Promise<void> => {
    store.reset(req, res);
    const target = req?.query?.target === Target.NI ? Target.NI : Target.GB;
    res.locals.target = target;
    const lang = await setCorrectLanguage(req, res, target);
    const source = String(req?.query?.source);

    return res.render(PageNames.ERROR_TECHNICAL, {
      startAgainLink: getStartAgainLink(target, lang, source),
    });
  };
}

export default new TechnicalErrorController();
