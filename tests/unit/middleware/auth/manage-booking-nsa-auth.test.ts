import { NextFunction, Request, Response } from 'express';
import config from '../../../../src/config';
import { MockRequest } from '../../../mocks/data/session';
import { manageBookingNsaAuth } from '../../../../src/middleware/auth';
import { Locale, Target } from '../../../../src/domain/enums';

describe('manage-booking-nsa-auth', () => {
  let req: MockRequest<any>;
  let res: Response;
  let next: NextFunction;

  const redirectLink = '/timeout?source=/manage-booking&target=gb&lang=gb';
  beforeEach(() => {
    req = {
      originalUrl: '/manage-booking',
      session: {
        target: Target.GB,
        locale: Locale.GB,
        manageBooking: {
          candidate: {
            firstnames: 'mockName',
          },
        },
      },
    } as MockRequest<any>;

    res = {
      redirect: jest.fn(),
    } as unknown as Response;

    next = jest.fn();
  });

  describe('manageBookingNsaAuth', () => {
    beforeEach(() => {
      config.featureToggles.enableViewNsaBookingSlots = false;
    });

    describe('feature toggle is turned on', () => {
      beforeEach(() => {
        config.featureToggles.enableViewNsaBookingSlots = true;
      });

      test('calls the next function if there is candidate data', () => {
        manageBookingNsaAuth(req as unknown as Request, res, next);

        expect(next).toHaveBeenCalled();
      });

      test('redirects to the timeout link if there is no candidate data in the session', () => {
        req.session.manageBooking.candidate = undefined;

        manageBookingNsaAuth(req as unknown as Request, res, next);

        expect(res.redirect).toHaveBeenCalledWith(redirectLink);
      });
    });

    describe('feature toggle is turned off', () => {
      test('redirects to the timeout link', () => {
        manageBookingNsaAuth(req as unknown as Request, res, next);

        expect(res.redirect).toHaveBeenCalledWith(redirectLink);
      });
    });
  });
});
