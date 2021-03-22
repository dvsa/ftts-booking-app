import { Request, Response } from 'express';
import '../../libraries/request';
import { stringToArray } from '../../libraries/request-sanitizer';
import { ValidatorSchema } from '../../middleware/request-validator';
import { fetchCentres } from '../../services/centre-gateway';
import { distanceUomFrom } from './distance-uom';
import config from '../../config';
import { clamp } from '../../helpers/math-helper';
import { store } from '../../services/session';
import { Centre } from '../../domain/types';

export class SelectTestCentreController {
  public get = async (req: Request, res: Response): Promise<void> => {
    this.saveSearchQuery(req);
    this.loadSavedSearchQuery(req);
    await this.render(req, res);
  };

  public post = (req: Request, res: Response): void => {
    if (req.hasErrors) {
      this.render(req, res);
    }
    const centre = JSON.parse(req.body.centre) as Centre;

    if (this.isManagedBookingSession(req)) {
      store.manageBookingEdits.update(req, { centre });

      return res.redirect('/manage-booking/select-date');
    }

    const { inEditMode } = store.journey.get(req);

    if (!inEditMode) {
      store.currentBooking.update(req, { centre });
    } else {
      store.editedLocationTime.update(req, { centre });
    }

    return res.redirect('select-date');
  };

  private render = async (req: Request, res: Response): Promise<void> => {
    const { searchQuery } = req.query;
    const target = store.target.get(req);
    const numberOfResults = Number(req.query.numberOfResults) || config.testCentreIncrementValue;

    let centres;
    try {
      centres = searchQuery ? await fetchCentres(searchQuery as string, target, clamp(numberOfResults, 5, 50)) : [];
    } catch (error) {
      return res.render('select-test-centre-error', { errors: true });
    }

    const foundSomeResults = Boolean(centres?.length);
    store.testCentreSearch.update(req, {
      zeroCentreResults: !foundSomeResults,
    });

    if (foundSomeResults) {
      return res.render('select-test-centre', {
        searchQuery,
        centres,
        selectedCentres: req.query.centre,
        distanceUom: distanceUomFrom(req.query),
        errors: req.errors,
        numberOfResults,
        nextNumberOfResults: clamp(numberOfResults + config.testCentreIncrementValue, 5, 50),
        testCentreIncrementValue: config.testCentreIncrementValue,
        mapsApiKey: config.mapsApiKey,
      });
    }

    return res.redirect(!this.isManagedBookingSession(req) ? '/find-test-centre' : '/manage-booking/find-test-centre');
  };

  private loadSavedSearchQuery = (req: Request): void => {
    const testCentreSearch = store.testCentreSearch.get(req);
    if (this.searchQueryIsInSession(req)) {
      req.query.searchQuery = testCentreSearch.searchQuery;
    }

    if (!req.query.numberOfResults && testCentreSearch.numberOfResults !== undefined) {
      req.query.numberOfResults = testCentreSearch.numberOfResults.toString();
    }
  };

  private saveSearchQuery = (req: Request): void => {
    if (req.query.numberOfResults) {
      store.testCentreSearch.update(req, {
        numberOfResults: parseInt(String(req.query.numberOfResults), 10),
      });
    }
  };

  private searchQueryIsInSession = (req: Request): boolean => !!store.testCentreSearch.get(req).searchQuery;

  private isManagedBookingSession = (req: Request): boolean => store.journey.get(req).inManagedBookingEditMode;

  public postSchemaValidation = (): ValidatorSchema => ({
    centre: {
      in: ['body'],
      isEmpty: {
        errorMessage: 'Please choose a centre',
        negated: true,
      },
    },
  });

  public getSchemaValidation = (): ValidatorSchema => ({
    centre: {
      in: ['query'],
      optional: true,
      customSanitizer: {
        options: stringToArray,
      },
    },
  });
}

export default new SelectTestCentreController();
