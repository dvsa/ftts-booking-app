import { Request, Response } from 'express';
import { SupportType, TestType } from '../../domain/enums';
import { determineEvidenceRoute, isDeafCandidate } from '../../helpers/evidence-helper';
import nsaNavigator from '../../helpers/nsa-navigator';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';
import { hasCRMSupportNeeds } from '../../services/crm-gateway/crm-helper';
import { Candidate } from '../../services/session';

export class StayingNSAController {
  constructor(
    private crm: CRMGateway,
  ) { }

  public get = async (req: Request, res: Response): Promise<void> => {
    if (!req.session.currentBooking) {
      throw Error('StayingNSAController::get: No currentBooking set');
    }
    const booking = req.session.currentBooking;
    const userDraftNsaBookings = await this.crm.getUserDraftNSABookingsIfExist(req.session.candidate?.candidateId as string, booking?.testType as TestType);
    if (userDraftNsaBookings) {
      req.session.lastPage = 'select-support-type';
      return res.redirect('duplicate-support-request');
    }
    const selectedSupportOptions = this.getSelectedSupportOptions(req);
    const hasSupportNeedsInCRM = hasCRMSupportNeeds(req.session.candidate as Candidate);
    req.session.currentBooking.hasSupportNeedsInCRM = hasSupportNeedsInCRM;
    const evidenceRoute = determineEvidenceRoute(selectedSupportOptions, hasSupportNeedsInCRM);
    return res.render(evidenceRoute, {
      showExtraContent: isDeafCandidate(selectedSupportOptions) && selectedSupportOptions.includes(SupportType.EXTRA_TIME),
      backLink: req.session.journey?.confirmingSupport ? 'confirm-support' : nsaNavigator.getPreviousPage(req),
    });
  };

  private getSelectedSupportOptions(req: Request): SupportType[] {
    try {
      const supportTypes = req.session.currentBooking?.selectSupportType;
      if (Array.isArray(supportTypes) && supportTypes.length > 0) {
        return supportTypes;
      }
      throw Error();
    } catch (error) {
      throw new Error('StayingNSAController::getSelectedSupportOptions: No support options provided');
    }
  }
}

export default new StayingNSAController(
  CRMGateway.getInstance(),
);
