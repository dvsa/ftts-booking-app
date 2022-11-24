import { Request } from 'express';
import config from '../config';
import { Context, Locale, Target } from '../domain/enums';

export const getBackLinkToStartPage = (req: Request): string => {
  if (req.session.target === Target.NI) {
    return config.landing.ni.citizen.book;
  }
  if (req.session.locale === Locale.CY) {
    return config.landing.cy.citizen.book;
  }
  return config.landing.gb.citizen.book;
};

export const getManageBookingLinkToStartPage = (req: Request): string => {
  if (req.session.context === Context.INSTRUCTOR) {
    if (req.session.target === Target.NI) {
      return config.landing.ni.instructor.manageBooking;
    }
    return config.landing.gb.instructor.manageBooking;
  }

  if (req.session.target === Target.NI) {
    return config.landing.ni.citizen.manageBooking;
  }
  return config.landing.gb.citizen.change;
};

export const getInstructorBackLinkToStartPage = (req: Request): string => {
  if (req.session.target === Target.NI) {
    return config.landing.ni.instructor.book;
  }
  return config.landing.gb.instructor.book;
};
