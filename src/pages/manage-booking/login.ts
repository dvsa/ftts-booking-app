import { Request, Response } from 'express';
import { BookingReference } from '../../domain/booking/booking-reference';
import { LicenceNumber } from '../../domain/licence-number';
import { translate } from '../../helpers/language';
import { ValidatorSchema } from '../../middleware/request-validator';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';
import { store } from '../../services/session';
import { BookingManager } from './booking-manager';

const errorMessages = {
  fieldsLeftBlank: (): string => translate('manageBookingLogin.errorMessages.fieldsLeftBlank'),
  incorrectDetails: (): string => translate('manageBookingLogin.errorMessages.incorrectDetails'),
};

export class ManageBookingLoginController {
  constructor(
    private crm: CRMGateway,
  ) { }

  public get = (req: Request, res: Response): void => {
    store.manageBookingEdits.reset(req);
    store.manageBooking.reset(req);
    store.reset(req);

    return res.render('manage-booking/login');
  };

  public post = async (req: Request, res: Response): Promise<void> => {
    if (req.hasErrors) {
      return this.sendErrorResponse(req, res);
    }

    const { licenceNumber, bookingReference } = req.body;

    const bookingManager = new BookingManager(this.crm);
    const { candidate, bookings } = await bookingManager.loadCandidateBookings(req, licenceNumber);
    if (!candidate) {
      return this.sendErrorResponse(req, res);
    }

    const candidateAndBookingRefMatch = bookings?.find((booking) => booking.reference === bookingReference);
    if (!candidateAndBookingRefMatch) {
      return this.sendErrorResponse(req, res);
    }

    return res.redirect('home');
  };

  private sendErrorResponse = (req: Request, res: Response): void => {
    const errorMessage = req.errors[0]?.msg === 'fieldsLeftBlank'
      ? errorMessages.fieldsLeftBlank() : errorMessages.incorrectDetails();

    req.errors = [{
      location: 'body',
      msg: errorMessage,
      param: '',
    }];

    return res.status(400).render('manage-booking/login', {
      errors: req.errors,
      ...req.body,
    });
  };

  public postSchemaValidation: ValidatorSchema = {
    bookingReference: {
      in: ['body'],
      trim: true,
      isEmpty: {
        errorMessage: 'fieldsLeftBlank',
        negated: true,
      },
      custom: {
        options: BookingReference.isValid,
      },
    },
    licenceNumber: {
      in: ['body'],
      trim: true,
      isEmpty: {
        errorMessage: 'fieldsLeftBlank',
        negated: true,
      },
      custom: {
        options: LicenceNumber.isValid,
      },
    },
  };
}

export default new ManageBookingLoginController(
  CRMGateway.getInstance(),
);
