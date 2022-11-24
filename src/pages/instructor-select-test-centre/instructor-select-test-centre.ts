import { Request, Response } from 'express';
import escapeHtml from 'escape-html';
import { PageNames } from '@constants';
import config from '../../config';
import { Target } from '../../domain/enums';
import { clamp } from '../../helpers/math-helper';
import { stringToArray } from '../../libraries/request-sanitizer';
import { ValidatorSchema } from '../../middleware/request-validator';
import locationsGateway from '../../services/locations/locations-gateway';
import { Booking } from '../../services/session';
import { distanceUomFrom } from '../../helpers/distance-uom';
import { Centre } from '../../domain/types';

interface InstructorSelectTestCentreBody {
  testCentreId: string;
}

type ViewCentre = Centre & {
  escapedAddress?: {
    name: string;
    line1: string;
    line2: string;
    city: string;
    postalCode: string;
  };
};

export class InstructorSelectTestCentreController {
  public get = async (req: Request, res: Response): Promise<void> => {
    this.updateNumberofResults(req);
    this.loadSavedSearchQuery(req);
    await this.render(req, res);
  };

  public post = async (req: Request, res: Response): Promise<void> => {
    if (req.hasErrors) {
      return this.render(req, res);
    }
    if (!req.session.journey) {
      throw Error('InstructorSelectTestCentreController::post: No journey set');
    }
    if (!req.session.currentBooking) {
      throw Error('InstructorSelectTestCentreController::post: No currentBooking set');
    }
    const { testCentreId } = req.body as InstructorSelectTestCentreBody;
    const centre = req.session.testCentres?.find((item) => item.testCentreId === testCentreId);

    const { inEditMode } = req.session.journey;
    const { firstSelectedCentre } = req.session.currentBooking;

    if (!inEditMode) {
      const updatedCurrentBooking: Partial<Booking> = {
        centre,
      };
      if (!firstSelectedCentre) {
        updatedCurrentBooking.firstSelectedCentre = centre;
      }
      req.session.currentBooking = {
        ...req.session.currentBooking,
        ...updatedCurrentBooking,
      };
    } else {
      req.session.editedLocationTime = {
        ...req.session.editedLocationTime,
        centre,
      };
    }

    return res.redirect('select-date');
  };

  private render = async (req: Request, res: Response): Promise<void> => {
    const { searchQuery } = req.query;
    const { target } = req.session;
    const numberOfResults = Number(req.query.numberOfResults) || config.testCentreIncrementValue;

    let centres;
    let showMore = false;
    try {
      centres = searchQuery ? await locationsGateway.fetchCentres(searchQuery as string, target || Target.GB, clamp(numberOfResults + 1, 5, 50)) : [];
      showMore = centres.length > numberOfResults;
      centres = centres.slice(0, numberOfResults);
    } catch (error) {
      return res.render(PageNames.SELECT_TEST_CENTRE_ERROR, { errors: true });
    }

    const foundSomeResults = Boolean(centres?.length);
    req.session.testCentreSearch = {
      ...req.session.testCentreSearch,
      zeroCentreResults: !foundSomeResults,
    };

    // Content rendered in the frontend js map needs escaping before passing to view
    // Nunjucks auto-escapes on render but client-side js script does not!
    centres.forEach((centre: ViewCentre) => {
      centre.escapedAddress = {
        name: escapeHtml(centre.name),
        line1: centre.addressLine1 ? escapeHtml(centre.addressLine1) : '',
        line2: centre.addressLine2 ? escapeHtml(centre.addressLine2) : '',
        city: centre.addressCity ? escapeHtml(centre.addressCity) : '',
        postalCode: centre.addressPostalCode ? escapeHtml(centre.addressPostalCode) : '',
      };
    });

    if (foundSomeResults) {
      req.session.testCentres = centres;
      return res.render(PageNames.INSTRUCTOR_SELECT_TEST_CENTRE, {
        searchQuery,
        centres,
        selectedCentres: req.query.centre,
        distanceUom: distanceUomFrom(req.query),
        errors: req.errors,
        numberOfResults,
        nextNumberOfResults: clamp(numberOfResults + config.testCentreIncrementValue, 5, 50),
        testCentreIncrementValue: config.testCentreIncrementValue,
        mapsApiKey: config.mapsApiKey,
        showMore,
      });
    }

    return res.redirect('find-test-centre');
  };

  private loadSavedSearchQuery = (req: Request): void => {
    const { testCentreSearch } = req.session;
    if (this.searchQueryIsInSession(req)) {
      req.query.searchQuery = testCentreSearch?.searchQuery;
    }

    if (!req.query.numberOfResults && testCentreSearch?.numberOfResults !== undefined) {
      req.query.numberOfResults = testCentreSearch?.numberOfResults.toString();
    }
  };

  private updateNumberofResults = (req: Request): void => {
    if (req.query.numberOfResults) {
      req.session.testCentreSearch = {
        ...req.session.testCentreSearch,
        numberOfResults: parseInt(String(req.query.numberOfResults), 10),
      };
    }
  };

  private searchQueryIsInSession = (req: Request): boolean => !!req.session.testCentreSearch?.searchQuery;

  /* istanbul ignore next */
  public postSchemaValidation = (): ValidatorSchema => ({
    testCentreId: {
      in: ['body'],
      isEmpty: {
        errorMessage: 'Please choose a centre',
        negated: true,
      },
    },
  });

  /* istanbul ignore next */
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

export default new InstructorSelectTestCentreController();
