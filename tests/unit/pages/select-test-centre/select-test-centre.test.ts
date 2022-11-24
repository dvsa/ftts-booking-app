import { SelectTestCentreController } from '@pages/select-test-centre/select-test-centre';
import { PageNames } from '@constants';
import { Target } from '../../../../src/domain/enums';
import { mockCentres } from '../../../mocks/data/mock-data';
import { mockCurrentBooking } from '../../../mocks/data/manage-bookings';
import { DistanceUom } from '../../../../src/helpers/distance-uom';
import locationsGateway from '../../../../src/services/locations/locations-gateway';
import { Centre } from '../../../../src/domain/types';

jest.mock('../../../../src/services/locations/locations-gateway');

describe('SelectTestCentreController', () => {
  let controller: SelectTestCentreController;
  let req;
  let res;

  beforeEach(() => {
    locationsGateway.fetchCentres = jest.fn().mockResolvedValue(mockCentres);
    controller = new SelectTestCentreController();

    req = {
      body: {
        testCentreId: mockCentres[0].testCentreId,
      },
      hasErrors: false,
      errors: [],
      session: {
        currentBooking: {},
        journey: {},
      },
    };

    res = {
      redirect: jest.fn(),
      render: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('get', () => {
    test('should update the number of results in the session if one is provided via query string', async () => {
      req.query = {
        numberOfResults: '20',
        searchQuery: 'mock-search-query',
      };

      req.session.testCentreSearch = {};

      await controller.get(req, res);

      expect(locationsGateway.fetchCentres).toHaveBeenCalledWith('mock-search-query', Target.GB, 21);

      expect(req.session.testCentreSearch).toStrictEqual({
        numberOfResults: 20,
        zeroCentreResults: false,
      });
      expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_TEST_CENTRE, {
        centres: mockCentres,
        distanceUom: DistanceUom.miles,
        errors: [],
        mapsApiKey: '',
        nextNumberOfResults: 25,
        numberOfResults: 20,
        searchQuery: 'mock-search-query',
        selectedCentres: undefined,
        testCentreIncrementValue: 5,
        showMore: false,
      });
    });

    test('should load the search term from the session and store it in query params if exists', async () => {
      req.query = {
        numberOfResults: '20',
      };
      req.session.testCentreSearch = {
        searchQuery: 'mock-search-query',
      };

      await controller.get(req, res);

      expect(locationsGateway.fetchCentres).toHaveBeenCalledWith('mock-search-query', Target.GB, 21);

      expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_TEST_CENTRE, {
        centres: mockCentres,
        distanceUom: DistanceUom.miles,
        errors: [],
        mapsApiKey: '',
        nextNumberOfResults: 25,
        numberOfResults: 20,
        searchQuery: 'mock-search-query',
        selectedCentres: undefined,
        testCentreIncrementValue: 5,
        showMore: false,
      });
      expect(req.query).toStrictEqual({
        numberOfResults: '20',
        searchQuery: 'mock-search-query',
      });
    });

    test('should load the number of results from the session and store it in query params if exists', async () => {
      req.query = {
        searchQuery: 'mock-search-query',
      };
      req.session.testCentreSearch = {
        numberOfResults: '20',
      };
      req.session.target = Target.NI;

      await controller.get(req, res);

      expect(locationsGateway.fetchCentres).toHaveBeenCalledWith('mock-search-query', Target.NI, 21);

      expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_TEST_CENTRE, {
        centres: mockCentres,
        distanceUom: DistanceUom.miles,
        errors: [],
        mapsApiKey: '',
        nextNumberOfResults: 25,
        numberOfResults: 20,
        searchQuery: 'mock-search-query',
        selectedCentres: undefined,
        testCentreIncrementValue: 5,
        showMore: false,
      });
      expect(req.query).toStrictEqual({
        numberOfResults: '20',
        searchQuery: 'mock-search-query',
      });
    });

    test('redirects to select-test-centre-error if locations throws an error', async () => {
      req.query = {
        searchQuery: 'mock-search-query',
        numberOfResults: 20,
      };

      locationsGateway.fetchCentres = jest.fn().mockRejectedValue(new Error());

      await controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_TEST_CENTRE_ERROR, {
        errors: true,
      });
    });

    test('redirects to find-test-centre if no search results are returned', async () => {
      req.query = {
        searchQuery: 'mock-search-query',
        numberOfResults: 20,
      };

      locationsGateway.fetchCentres = jest.fn().mockResolvedValue([]);

      await controller.get(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/find-test-centre');
    });

    test('redirects to manage-booking/find-test-centre if no search results are returned and in manage booking mode', async () => {
      req.query = {
        searchQuery: 'mock-search-query',
        numberOfResults: 20,
      };
      req.session.journey.inManagedBookingEditMode = true;

      locationsGateway.fetchCentres = jest.fn().mockResolvedValue([]);

      await controller.get(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/manage-booking/find-test-centre');
    });

    describe('showMore', () => {
      const exampleCentre = {} as Centre;

      beforeEach(() => {
        jest.resetAllMocks();
      });
      test.each([
        [5, 2, false],
        [5, 5, false],
        [5, 6, true],
        [10, 6, false],
        [10, 10, false],
        [10, 11, true],
        [10, 16, true],
      ])('if numberOfResults=%s and %s centres returned then showMore=%s', async (
        numberOfResults: number, centresLength: number, showMore: boolean,
      ) => {
        req.query = {
          searchQuery: 'mock-search-query',
        };
        req.session.testCentreSearch = {
          numberOfResults,
        };
        req.session.target = Target.NI;
        const centres = Array(centresLength).fill(exampleCentre);
        locationsGateway.fetchCentres = jest.fn().mockResolvedValue(centres);

        await controller.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_TEST_CENTRE,
          expect.objectContaining({
            showMore,
          }));
      });
    });

    describe('html escaping', () => {
      beforeEach(() => {
        req.query = {
          searchQuery: 'mock-search-query',
          numberOfResults: 20,
        };
      });

      test('passes an html-escaped address for the frontend js map to use', async () => {
        mockCentres[0].name = 'B\'ham & Coventry';
        mockCentres[0].addressLine1 = 'Ha this is <strong>unescaped HTML</strong>!';
        mockCentres[0].addressLine2 = null;
        mockCentres[0].addressCity = '<script>evil-js</script>';
        mockCentres[0].addressPostalCode = 'T1 3ST';

        await controller.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_TEST_CENTRE, expect.objectContaining({
          centres: expect.arrayContaining([
            expect.objectContaining({
              escapedAddress: {
                name: 'B&#39;ham &amp; Coventry',
                line1: 'Ha this is &lt;strong&gt;unescaped HTML&lt;/strong&gt;!',
                line2: '',
                city: '&lt;script&gt;evil-js&lt;/script&gt;',
                postalCode: 'T1 3ST',
              },
            }),
          ]),
        }));
      });

      test('sets property to empty string if undefined', async () => {
        mockCentres[0].addressPostalCode = undefined;

        await controller.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_TEST_CENTRE, expect.objectContaining({
          centres: expect.arrayContaining([
            expect.objectContaining({
              escapedAddress: {
                name: 'B&#39;ham &amp; Coventry',
                line1: 'Ha this is &lt;strong&gt;unescaped HTML&lt;/strong&gt;!',
                line2: '',
                city: '&lt;script&gt;evil-js&lt;/script&gt;',
                postalCode: '',
              },
            }),
          ]),
        }));
      });

      test('sets property to empty string if empty', async () => {
        mockCentres[0].addressCity = '';

        await controller.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_TEST_CENTRE, expect.objectContaining({
          centres: expect.arrayContaining([
            expect.objectContaining({
              escapedAddress: {
                name: 'B&#39;ham &amp; Coventry',
                line1: 'Ha this is &lt;strong&gt;unescaped HTML&lt;/strong&gt;!',
                line2: '',
                city: '',
                postalCode: '',
              },
            }),
          ]),
        }));
      });
    });
  });

  describe('post', () => {
    beforeEach(() => {
      req.session.testCentres = mockCentres;
      req.query = {
        searchQuery: 'mock-search-query',
        numberOfResults: 20,
      };
    });

    test('re-renders page if has errors', async () => {
      req.hasErrors = true;

      await controller.post(req, res);

      expect(res.render).toHaveBeenLastCalledWith(PageNames.SELECT_TEST_CENTRE, expect.any(Object));
    });

    test('updates session and redirects to select-date', async () => {
      await controller.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('select-date');
      expect(req.session.currentBooking).toStrictEqual({
        centre: mockCentres[0],
        firstSelectedCentre: mockCentres[0],
      });
    });

    test('when in edit mode updates session and redirects to select-date', async () => {
      req.session.journey.inEditMode = true;

      await controller.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('select-date');
      expect(req.session.editedLocationTime).toStrictEqual({
        centre: mockCentres[0],
      });
    });

    test('when in manage booking mode updates session and redirects to manage-booking/select-date', async () => {
      req.session.journey.inManagedBookingEditMode = true;
      req.session.currentBooking = mockCurrentBooking();

      await controller.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/manage-booking/select-date');
      expect(req.session.manageBookingEdits).toStrictEqual({
        centre: mockCentres[0],
      });
    });

    test('does not override the first selected test centre if it is already set', async () => {
      // eslint-disable-next-line prefer-destructuring
      req.session.currentBooking.firstSelectedCentre = mockCentres[1];

      await controller.post(req, res);

      expect(req.session.currentBooking.firstSelectedCentre).toEqual(mockCentres[1]);
    });

    describe('session checks', () => {
      test('throws if missing journey', async () => {
        req.session.journey = undefined;

        await expect(controller.post(req, res)).rejects.toThrow();
      });

      test('throws if missing currentBooking', async () => {
        req.session.currentBooking = undefined;

        await expect(controller.post(req, res)).rejects.toThrow();
      });
    });
  });
});
