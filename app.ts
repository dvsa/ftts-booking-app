// NPM dependencies
import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Express } from 'express';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import nunjucks from 'nunjucks';
import path from 'path';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';

// Local dependencies
import { PageNames } from '@constants';
import config from './src/config';
import './src/libraries/dayjs-config';
import * as errorHandler from './src/middleware/error-handler';
import { addNunjucksFilters } from './src/nunjucks-filters/filter-manager';

import fttsSession from './src/libraries/ftts-session';
import { XRobotsTagFilter } from './src/middleware/xrobots-tag-filter';
import { internationalisation } from './src/middleware/internationalisation';
import resources from './src/locales';
import { Locale } from './src/domain/enums';
import helmetConfiguration from './src/libraries/helmetConfiguration';
import { setupLocals } from './src/middleware/setup-locals';
import { setGoogleAnalyticsId } from './src/middleware/setup-google-analytics';
import { setAnalyticsCookie } from './src/middleware/set-analytics-cookie';
import {
  candidateRouter, manageBookingRouter, instructorRouter, landingRouter, warmupRouter,
} from './src/routes';
import { logger } from './src/helpers/logger';
import { setupTelemetry } from './src/middleware/setup-telemetry';
import { setupQueueIt } from './src/middleware/queue-it/setup-queue-it';
import { noCache } from './src/middleware/no-cache';

axios.defaults.timeout = config.http.timeout;

// Function returns an express app, which we can't type to due to express being a namespace
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const App = (): Express => {
  const app = express();
  app.use(cors());
  app.use('/public/fonts', express.static(path.join(__dirname, 'assets/fonts')));
  app.use('/public/images', express.static(path.join(__dirname, 'assets/images')));
  app.use('/public/javascripts', express.static(path.join(__dirname, 'assets/javascripts')));
  app.use('/public/langs', express.static(path.join(__dirname, 'assets/langs')));
  app.use('/public/stylesheets', express.static(path.join(__dirname, 'assets/stylesheets')));

  // Setup nonce
  app.use((req, res, next) => {
    res.locals.scriptNonce = Buffer.from(uuidv4()).toString('base64');
    next();
  });

  // Setup Google Analytics
  app.use(setGoogleAnalyticsId);

  // Setup Helmet
  app.use(helmet(helmetConfiguration));

  app.set('trust proxy', 1);

  // Set up App
  const appViews = [
    path.join(__dirname, '/nunjucks-govuk/'),
    path.join(__dirname, '/nunjucks-includes/'),
    path.join(__dirname, '/nunjucks-layouts/'),
    path.join(__dirname, '/nunjucks-macros/'),
    ...Object.values(PageNames)
      .filter(String)
      .map((value) => path.join(__dirname, `/pages/${value}/`)),
  ];

  // Internationalisation
  i18next
    .use(LanguageDetector)
    .init({
      resources,
      initImmediate: false,
      fallbackLng: Locale.GB,
      preload: [Locale.GB, Locale.NI, Locale.CY],
    })
    .catch((e) => {
      logger.error(e, 'Could not instantiate i18next');
    });

  /**
   * Nunjucks environment options
   *
   * _noCache_ - False - use a cache, do not recompile templates each time (server-side);
   * _watch_ - False - do not reload templates when they are changed
   */
  const nunjucksAppEnv = nunjucks.configure(appViews, {
    autoescape: true,
    express: app,
    noCache: process.env.NODE_ENV === 'development',
    watch: process.env.NODE_ENV === 'development',
  });

  // Add Nunjucks filters
  addNunjucksFilters(nunjucksAppEnv);

  // Set views engine
  app.set('view engine', 'njk');

  // Support for parsing data in POSTs
  app.use(bodyParser.urlencoded({
    extended: true,
  }));

  app.use(cookieParser());

  // Set up redis session
  app.use(fttsSession);

  // Add variables that are available in all views
  app.locals = {
    ...app.locals,
    ...config.view,
    assetUrl: config.view.assetPath,
  };
  app.use(XRobotsTagFilter.filter);
  app.use(setupLocals);
  app.use(internationalisation);
  app.use(setAnalyticsCookie);
  app.use(setupQueueIt);
  app.use(noCache);

  // CSRF token setup
  app.use(csrf({ cookie: false }));
  app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
  });

  app.use(setupTelemetry);

  // Setup Routes
  app.use('/', candidateRouter);
  app.use('/instructor', instructorRouter);
  app.use('/manage-booking', manageBookingRouter);
  app.use('/', landingRouter);
  app.use('/admin/warmup', warmupRouter);

  // Display error
  app.use(errorHandler.internalServerError);
  app.use(errorHandler.pageNotFound);

  return app;
};

export default App();
