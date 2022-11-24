/* istanbul ignore file */
import express from 'express';
import manageBookingLogin from '@pages/manage-booking-login/manage-booking-login';
import manageBookingHome from '@pages/manage-booking-home/manage-booking-home';
import manageBookingChange from '@pages/manage-booking-change/manage-booking-change';
import manageBookingCancel from '@pages/manage-booking-cancel/manage-booking-cancel';
import manageBookingCheckChange from '@pages/manage-booking-check-change/manage-booking-check-change';
import manageBookingRequestRefund from '@pages/manage-booking-request-refund/manage-booking-request-refund';
import voiceover from '@pages/voiceover/voiceover';
import changeLocationTime from '@pages/change-location-time/change-location-time';
import selectDate from '@pages/select-date/select-date';
import chooseAppointment from '@pages/choose-appointment/choose-appointment';
import findTestCentre from '@pages/find-test-centre/find-test-centre';
import selectTestCentre from '@pages/select-test-centre/select-test-centre';
import testLanguage from '@pages/test-language/test-language';
import britishSignLanguage from '@pages/british-sign-language/british-sign-language';
import errorTechnical from '@pages/error-technical/error-technical';
import manageBookingCheckYourDetails from '@pages/manage-booking-check-your-details/manage-booking-check-your-details';
import { setupSession } from '../middleware/setup-session';
import { setContext } from '../middleware/set-context';
import { internationalisation } from '../middleware/internationalisation';
import { setTarget } from '../middleware/set-target';
import { validateRequest } from '../middleware/request-validator';
import { asyncErrorHandler } from '../middleware/error-handler';
import {
  manageReschedulingAuth, manageBookingNsaAuth, manageBookingHomeAuth, manageBookingViewAuth,
} from '../middleware/auth';

export const manageBookingRouter = express.Router();

manageBookingRouter.get(['/', '/login'], setupSession, setTarget, internationalisation, setContext, manageBookingLogin.get);
manageBookingRouter.post(['/login'], validateRequest(manageBookingLogin.postSchemaValidation), asyncErrorHandler(manageBookingLogin.post));
manageBookingRouter.get(['/home'], manageBookingHomeAuth, asyncErrorHandler(manageBookingHome.get));
manageBookingRouter.get(['/manage-change-location-time/:ref'], changeLocationTime.get);
manageBookingRouter.post(['/manage-change-location-time/:ref'], validateRequest(changeLocationTime.postSchema), changeLocationTime.post);
manageBookingRouter.get(['/choose-appointment'], manageReschedulingAuth, validateRequest(chooseAppointment.getSchemaValidation), asyncErrorHandler(chooseAppointment.get));
manageBookingRouter.post(['/choose-appointment'], manageReschedulingAuth, validateRequest(chooseAppointment.postSchemaValidation), asyncErrorHandler(chooseAppointment.post));
manageBookingRouter.get(['/select-date'], manageReschedulingAuth, selectDate.get);
manageBookingRouter.post(['/select-date'], manageReschedulingAuth, validateRequest(selectDate.postSchemaValidation), selectDate.post);
manageBookingRouter.get(['/find-test-centre'], manageReschedulingAuth, findTestCentre.get);
manageBookingRouter.post(['/find-test-centre'], manageReschedulingAuth, validateRequest(findTestCentre.postSchemaValidation), findTestCentre.post);
manageBookingRouter.get(['/select-test-centre'], manageReschedulingAuth, validateRequest(selectTestCentre.getSchemaValidation()), asyncErrorHandler(selectTestCentre.get));
manageBookingRouter.post(['/select-test-centre'], manageReschedulingAuth, validateRequest(selectTestCentre.postSchemaValidation()), selectTestCentre.post);
manageBookingRouter.get(['/check-change'], manageReschedulingAuth, manageBookingCheckChange.get);
manageBookingRouter.post(['/check-change'], manageReschedulingAuth, asyncErrorHandler(manageBookingCheckChange.post));
manageBookingRouter.get(['/check-change/reset'], manageReschedulingAuth, manageBookingCheckChange.reset);
manageBookingRouter.get(['/test-language'], manageReschedulingAuth, testLanguage.get);
manageBookingRouter.post(['/test-language'], manageReschedulingAuth, validateRequest(testLanguage.testLanguagePostSchema()), testLanguage.post);
manageBookingRouter.get(['/change-voiceover'], manageReschedulingAuth, voiceover.get);
manageBookingRouter.post(['/change-voiceover'], manageReschedulingAuth, validateRequest(voiceover.voiceoverPostSchema()), voiceover.post);
manageBookingRouter.get(['/bsl'], manageReschedulingAuth, britishSignLanguage.get);
manageBookingRouter.post(['/bsl'], manageReschedulingAuth, validateRequest(britishSignLanguage.postSchemaValidation), britishSignLanguage.post);
manageBookingRouter.get(['/request-refund'], manageBookingHomeAuth, manageBookingRequestRefund.get);
manageBookingRouter.post(['/request-refund'], manageBookingHomeAuth, asyncErrorHandler(manageBookingRequestRefund.post));
manageBookingRouter.get(['/:ref'], manageBookingViewAuth, asyncErrorHandler(manageBookingChange.get));
manageBookingRouter.get(['/:ref/cancel'], manageBookingViewAuth, manageBookingCancel.get);
manageBookingRouter.post(['/:ref/cancel'], manageBookingViewAuth, asyncErrorHandler(manageBookingCancel.post));
manageBookingRouter.get(['/error-technical'], asyncErrorHandler(errorTechnical.get));

manageBookingRouter.get(['/nsa/check-your-details'], manageBookingNsaAuth, manageBookingCheckYourDetails.get);
manageBookingRouter.post(['/nsa/check-your-details'], manageBookingNsaAuth, manageBookingCheckYourDetails.post);
