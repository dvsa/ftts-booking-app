import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Target, Locale } from '../domain/enums';

const setupSession = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.session.init) {
    req.session.init = true;
    req.session.journey = {
      inEditMode: false,
      inManagedBookingEditMode: false,
      managedBookingRescheduleChoice: '',
    };
    req.session.target = req.session.target || Target.GB;
    req.session.locale = req.session.locale || Locale.GB;
    req.session.sessionId = req.session.sessionId || uuidv4();
  }
  if (req.session.journey && !req.originalUrl.startsWith('/instructor')) {
    req.session.journey.isInstructor = false;
  }
  return next();
};

export {
  setupSession,
};
