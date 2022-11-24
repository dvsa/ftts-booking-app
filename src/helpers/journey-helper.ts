import { Request } from 'express';
import { Journey } from '../services/session';

export const isStandardJourney = (req: Request): boolean => {
  if (!req.session.journey) {
    throw Error('isStandardJourney:: No journey set');
  }
  const { support, standardAccommodation } = req.session.journey;
  if (support === undefined || standardAccommodation === undefined) {
    throw Error('isStandardJourney:: No params set');
  }
  return !support && standardAccommodation;
};

export const isSupportedStandardJourney = (req: Request): boolean => {
  if (!req.session.journey) {
    throw Error('isSupportedStandardJourney:: No journey set');
  }
  const { support, standardAccommodation } = req.session.journey;
  if (support === undefined || standardAccommodation === undefined) {
    throw Error('isSupportedStandardJourney:: No params set');
  }
  return support && standardAccommodation;
};

export const isNonStandardJourney = (req: Request): boolean => {
  if (!req.session.journey) {
    throw Error('isNonStandardJourney:: No journey set');
  }
  const { support, standardAccommodation } = req.session.journey;
  if (support === undefined || standardAccommodation === undefined) {
    throw Error('isNonStandardJourney:: No params set');
  }
  return support && !standardAccommodation;
};

export const getJourneyName = (journey: Journey): string => {
  if (journey.inManageBookingMode) {
    return 'reschedule';
  }
  if (journey.isInstructor) {
    if (journey.standardAccommodation) {
      return 'sa-instructor';
    }
    return 'nsa-instructor';
  }
  if (journey.standardAccommodation) {
    return 'sa';
  }
  return 'nsa';
};
