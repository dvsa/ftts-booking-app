// Run before other code to make sure variables from .env are available
import './src/env';

// NPM dependencies
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import nunjucks from 'nunjucks';
import path from 'path';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// Local dependencies
import config from './src/config';
import * as errorHandler from './src/middleware/error-handler';
import { addNunjucksFilters } from './src/nunjucks-filters/filter-manager';
import routes from './src/routes';

import fttsSession from './src/libraries/ftts-session';
import { XRobotsTagFilter } from './src/middleware/xrobots-tag-filter';
import { setTarget } from './src/middleware/set-target';
import { internationalisation } from './src/middleware/internationalisation';
import resources from './src/locales';
import { LOCALE } from './src/domain/enums';
import helmetConfiguration from './src/libraries/helmet';
import { setEditMode } from './src/middleware/set-edit-mode';
import { setSupportMode } from './src/middleware/set-support-mode';

axios.defaults.timeout = config.http.timeout;

// Function returns an express app, which we can't type to due to express being a namespace
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const App = () => {
  const app = express();
  app.use(cors());
  app.use('/public', express.static(path.join(__dirname, 'public')));
  // For development mode. Switch needs moving into config.
  app.use('/public', express.static(path.join(__dirname, 'dist', 'public')));

  // Setup nonce
  app.use((req, res, next) => {
    res.locals.scriptNonce = Buffer.from(uuidv4()).toString('base64');
    next();
  });

  // Setup Helmet
  app.use(helmet(helmetConfiguration));

  app.set('trust proxy', 1);

  // Set up App
  const appViews = [
    path.join(__dirname, '/node_modules/ftts-frontend-assets/node_modules/govuk-frontend/'),
    path.join(__dirname, '/src/views/'),
  ];

  // Internationalisation
  i18next
    .use(LanguageDetector)
    .init({
      resources,
      initImmediate: false,
      fallbackLng: LOCALE.GB,
      preload: [LOCALE.GB, LOCALE.NI, LOCALE.CY],
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

  // Set up redis session
  app.use(fttsSession);

  // Add variables that are available in all views
  app.locals = {
    ...app.locals,
    ...config.view,
    assetUrl: config.view.assetPath,
  };
  app.use(XRobotsTagFilter.filter);
  app.use(setEditMode);
  app.use(setSupportMode);
  app.use(setTarget);
  app.use(internationalisation);

  app.use(routes);

  // Display error
  app.use(errorHandler.pageNotFound);
  app.use(errorHandler.internalServerError);

  return app;
};

export default App();
