import { Request, Response } from 'express';
import { PageNames } from '@constants';
import { isNonStandardJourney, isSupportedStandardJourney } from '../../helpers/journey-helper';

export class ReceivedSupportRequestController {
  public get = (req: Request, res: Response): void => {
    if (!req.session.journey) {
      throw Error('ReceivedSupportRequestController::get: No journey set');
    }

    if (!isNonStandardJourney(req)) {
      req.session.journey.receivedSupportRequestPageFlag = true;
    }

    res.render(PageNames.RECEIVED_SUPPORT_REQUEST, {
      backLink: this.getBackLink(req),
      continueLink: this.getContinueLink(req),
    });
  };

  private getBackLink = (req: Request): string => {
    if (isSupportedStandardJourney(req)) {
      return '/nsa/leaving-nsa';
    }

    return 'test-type';
  };

  private getContinueLink = (req: Request): string => (req.session.lastPage === 'test-type' ? 'test-language' : 'email-contact');
}

export default new ReceivedSupportRequestController();
