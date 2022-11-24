import { Request, Response } from 'express';
import { PageNames } from '@constants';
import { TestType } from '../../domain/enums';
import nsaNavigator from '../../helpers/nsa-navigator';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';

export class LeavingNSAController {
  constructor(
    private crm: CRMGateway,
  ) { }

  public get = (req: Request, res: Response): void => {
    // When the user clicks back to leaving nsa page, change standardAccommodation back to false
    req.session.journey = {
      ...req.session.journey,
      standardAccommodation: false,
    };
    return res.render(PageNames.LEAVING_NSA, {
      backLink: req.session.journey.confirmingSupport ? 'confirm-support' : nsaNavigator.getPreviousPage(req),
    });
  };

  public post = async (req: Request, res: Response): Promise<void> => {
    const standardAccommodation = req.body.accommodation === 'standard';
    req.session.journey = {
      ...req.session.journey,
      standardAccommodation,
    };

    const booking = req.session.currentBooking;
    const nsaBookings = await this.crm.getUserDraftNSABookingsIfExist(req.session.candidate?.candidateId as string, booking?.testType as TestType);

    req.session.lastPage = 'nsa/leaving-nsa';

    if (standardAccommodation) {
      if (nsaBookings) {
        if (req.session.journey?.isInstructor) {
          return res.redirect('/instructor/received-support-request');
        }
        return res.redirect('/received-support-request');
      }
      return res.redirect('email-contact');
    }

    if (nsaBookings) {
      return res.redirect('duplicate-support-request');
    }
    return res.redirect('staying-nsa');
  };
}

export default new LeavingNSAController(
  CRMGateway.getInstance(),
);
