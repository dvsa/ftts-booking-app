import { NextFunction, Request, Response } from 'express';
import config from '../config';
import { Locale, Target } from '../domain/enums';
import { getJourneyName } from '../helpers/journey-helper';
import { getSessionExpiryInfo } from '../helpers/session-helper';

const setupLocals = (req: Request, res: Response, next: NextFunction): void => {
  const { journey, target, locale } = req.session;

  let inEditMode: boolean | undefined;
  let standardAccommodation: boolean | undefined;
  let inSupportMode: boolean | undefined;
  let inManageBookingMode: boolean | undefined;
  let isInstructor: boolean | undefined;
  let journeyName: string | undefined;

  if (journey) {
    inEditMode = Boolean(journey.inEditMode);
    standardAccommodation = Boolean(journey.standardAccommodation);
    inSupportMode = Boolean(journey.support);
    inManageBookingMode = Boolean(journey.inManageBookingMode);
    journeyName = getJourneyName(journey);
    isInstructor = journey.isInstructor;
  }

  let headerLink = config.landing.gb.citizen.book;

  if (locale === Locale.CY) {
    headerLink = config.landing.cy.citizen.book;
  }

  const sessionInfo = getSessionExpiryInfo(req);

  res.locals = {
    ...res.locals,
    target: target || Target.GB,
    imgRoot: target === Target.NI ? 'images/ni/' : 'images/',
    inEditMode,
    standardAccommodation,
    inSupportMode,
    inManageBookingMode,
    ...sessionInfo,
    source: req.path,
    headerLink,
    journeyName,
    organisation: req.session.target === Target.NI ? 'dva' : 'dvsa',
    isInstructor,
  };

  return next();
};

export {
  setupLocals,
};
