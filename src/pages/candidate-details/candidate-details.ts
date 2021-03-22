import { Request, Response } from 'express';

import { Candidate } from '../../domain/candidate/candidate';
import IncorrectCandidateDetails from '../../domain/candidate/incorrect-candidate-details-error';
import { LicenceNumber } from '../../domain/licence-number';
import '../../libraries/request';
import { ValidatorSchema } from '../../middleware/request-validator';
import DvlaError from '../../services/dvla-gateway/dvla-error';
import { DvlaGateway } from '../../services/dvla-gateway/dvla-gateway';
import { BirthDay } from '../details/birth-day';
import { Dvla } from '../details/dvla';
import { Details } from '../details/types';
import { translate } from '../../helpers/language';
import { store } from '../../services/session';
import { Voiceover } from '../../domain/enums';

export class CandidateDetailsController {
  constructor(
    private readonly dvla: Dvla,
  ) { }

  public get = (req: Request, res: Response): void => {
    let details: Partial<Details> = {};
    if (typeof req.query?.licenceNum === 'string') {
      const licenceNumber = LicenceNumber.of(req.query.licenceNum, store.target.get(req));
      details = {
        licenceNumber: licenceNumber.toString(),
      };
    }

    return res.render('candidate-details/candidate-details', {
      details,
      support: store.journey.get(req).support,
    });
  };

  public post = async (req: Request, res: Response): Promise<void> => {
    if (req.hasErrors) {
      return this.sendIncorrectDetailsErrorResponse(req, res);
    }

    const details: Details = {
      firstnames: req.body.firstnames,
      surname: req.body.surname,
      licenceNumber: req.body.licenceNumber,
      dobDay: req.body.dobDay,
      dobMonth: req.body.dobMonth,
      dobYear: req.body.dobYear,
    };

    let candidate: Candidate;
    try {
      candidate = await Candidate.fromUserDetails(details, this.dvla, store.target.get(req));
    } catch (err) {
      if (err instanceof IncorrectCandidateDetails || err instanceof DvlaError) {
        return this.sendIncorrectDetailsErrorResponse(req, res);
      }
      throw err;
    }

    const { licence } = candidate;
    const { firstnames, surname, address } = licence;
    store.candidate.update(req, {
      address,
      firstnames,
      surname,
      licenceNumber: licence.num.toString(),
      dateOfBirth: licence.birthDate.toIsoDate(),
      entitlements: licence.entitlements.toString(),
    });
    store.currentBooking.update(req, {
      bsl: false,
      voiceover: Voiceover.NONE,
    });

    const { support } = store.journey.get(req);

    if (support) {
      return res.redirect('test-type');
    }

    return res.redirect('contact-details');
  };

  private sendIncorrectDetailsErrorResponse = (req: Request, res: Response): void => {
    // Errors are overwritten to not provide a clue as to which field contains the error for security reasons
    req.errors = [{
      location: 'body',
      msg: translate('details.errorMessage'),
      param: '',
    }];

    return res.status(400).render('candidate-details/candidate-details', {
      details: req.body,
      errors: req.errors,
      support: store.journey.get(req).support,
    });
  };

  public postSchemaValidation: ValidatorSchema = {
    firstnames: {
      in: ['body'],
      isEmpty: {
        negated: true,
      },
    },
    surname: {
      in: ['body'],
      isEmpty: {
        negated: true,
      },
    },
    licenceNumber: {
      in: ['body'],
      custom: {
        options: LicenceNumber.isValid,
      },
    },
    dobDay: {
      in: ['body'],
      custom: {
        options: BirthDay.isValid,
      },
    },
  };
}

export default new CandidateDetailsController(DvlaGateway.getInstance());
