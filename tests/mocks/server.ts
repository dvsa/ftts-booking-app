/* eslint-disable no-underscore-dangle */
import dayjs from 'dayjs';
import jsonServer from 'json-server';
import querystring, { ParsedUrlQuery } from 'querystring';
import { Target } from '../../src/domain/enums';
import { CRMBookingDetails } from '../../src/services/crm-gateway/interfaces';
import mockData from './data/index';

const server = jsonServer.create();
const router = jsonServer.router(mockData);
const middlewares = jsonServer.defaults();
const port = 5000;
const receiptReference = '123-456-789';

server.use(middlewares);
// Have all URLS prefixed with a /api
server.use(
  jsonServer.rewriter({
    '/api/*': '/$1',
  }),
);

function getFutureDate(unit: dayjs.OpUnitType, value: number, adjustSunday = true) {
  let futureDate: dayjs.Dayjs;
  if (unit === 'hour') {
    futureDate = dayjs().add(value, unit)
      .set('minute', 0)
      .set('second', 0)
      .set('millisecond', 0);
  } else {
    futureDate = dayjs().add(value, unit)
      .set('hour', 10)
      .set('minute', 0)
      .set('second', 0)
      .set('millisecond', 0);
  }

  if (futureDate.format('dddd') === 'Sunday' && adjustSunday) {
    futureDate = futureDate.add(1, 'day');
  }
  return futureDate;
}

// required to parse the batched CRM calls later on
function multipartMixedMiddleware(req: any, res: any, next: any) {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/mixed')) {
    let data = '';
    req.on('data', (chunk: any) => { data += chunk; });
    req.on('end', () => {
      req.rawBody = data;
      req.body = req.rawBody;
      console.log('multipartMixedMiddleware', req.body);
    });
  }
  next();
}

server.use(multipartMixedMiddleware);
server.use(router);
(router as any).render = (req: any, res: any) => {
  const url = req.originalUrl;

  // Location API
  if (url.includes('/test-centres') === true && req.method === 'GET') {
    const parsedQuery: ParsedUrlQuery = querystring.parse(req._parsedOriginalUrl.query);
    const numOfResults = Number(parsedQuery.numberOfResults);
    const { region } = parsedQuery;
    const searchTerm = parsedQuery.term;
    let testCentresClone;
    if (region === Target.GB) {
      testCentresClone = JSON.parse(JSON.stringify(mockData.testCentresGb));
    } else if (region === Target.NI) {
      testCentresClone = JSON.parse(JSON.stringify(mockData.testCentresNi));
    }
    if (searchTerm === 'errorUnknownError') {
      res.status(500).jsonp({
        status: 500,
        message: 'Internal Server Error!!!',
      });
    } else if (searchTerm && (searchTerm.includes('<script>') === true || searchTerm.includes('warningZeroResults') === true)) {
      const testCentreData = testCentresClone;
      testCentreData.testCentres = [];
      res.status(200).jsonp(testCentreData);
    } else {
      const testCentreData = testCentresClone;
      testCentreData.testCentres = testCentresClone.testCentres.slice(0, numOfResults);
      res.status(200).jsonp(testCentreData);
    }
    // Notifications API
  } else if (url.includes('/email') && req.method === 'POST') {
    if (req.body.email_address.includes('error')) {
      res.status(500).jsonp({
        status: 500,
        message: 'Internal Server Error!!!',
      });
    } else {
      res.status(201).jsonp(mockData.notification);
    }
    // Scheduling API - find slots
  } else if (url.includes('/slots') && req.method === 'GET') {
    const parsedQuery: ParsedUrlQuery = querystring.parse(req._parsedOriginalUrl.query);
    const dateFrom = String(parsedQuery.dateFrom);
    const dateTo = String(parsedQuery.dateTo);
    const testTypesArray = String(parsedQuery.testTypes);
    const testCentre = RegExp('/testCentres/(.*)/slots').exec(url);
    const testCentreSlotsResponse = [];
    let startDateTime = new Date(dateFrom);
    const endDateTime = new Date(dateTo);
    const days = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24) + 1;
    let i = 0;

    if (testCentre) {
      while (i < days) {
        let slotTime = new Date(startDateTime.setHours(9));
        const dayOfTheWeek = slotTime.toLocaleString('en-gb', { weekday: 'long' });
        const slots = Math.floor(Math.random() * 37) + 2;
        // skip sundays to match tcn stub
        if (dayOfTheWeek !== 'Sunday') {
          for (let j = 0; j < slots; j++) {
            testCentreSlotsResponse.push({
              testCentreId: testCentre[1],
              testTypes: JSON.parse(testTypesArray),
              startDateTime: slotTime,
              quantity: 1,
            });
            slotTime = new Date(slotTime.setMinutes(slotTime.getMinutes() + 15));
          }
        }
        startDateTime = new Date(startDateTime.setDate(startDateTime.getDate() + 1));
        i++;
      }
    }
    res.status(200).jsonp(testCentreSlotsResponse);
    // Scheduling API - reserve slot
  } else if (url.includes('/reservations') && req.method === 'POST') {
    const { testCentreId } = req.body[0];
    const { startDateTime } = req.body[0];
    const { testTypes } = req.body[0];
    const slotTime = new Date(startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (slotTime === '11:00') {
      res.status(409).jsonp(
        [
          {
            message: 'This slot is no longer available',
            status: 409,
          },
        ],
      );
    } else {
      res.status(200).jsonp(
        [
          {
            testCentreId,
            testTypes,
            startDateTime,
            reservationId: '1111-2222-3333-4444-5555',
          },
        ],
      );
    }
    // Scheduling API - Deleting a reservation from the TCN
  } else if (url.includes('/reservations') && req.method === 'DELETE') {
    res.status(200).jsonp({});
    // Scheduling API - confirm booking a slot
  } else if (url.includes('/bookings') && req.method === 'POST') {
    res.status(200).jsonp(
      [
        {
          message: 'Success',
          status: 200,
        },
      ],
    );
  // Scheduling API - get a booking a slot
  } else if (url.includes('/bookings') && req.method === 'GET') {
    res.setHeader('Retry-After', '1');
    if (url.includes('B-000-010-004')) {
      res.status(500).jsonp({});
    } else {
      res.status(204).jsonp({});
    }
  // Scheduling API - delete booking a slot
  } else if (url.includes('/bookings') && req.method === 'DELETE') {
    res.setHeader('Retry-After', '1');
    if (url.includes('B-000-010-002')) {
      res.status(500).jsonp({});
    } else {
      res.status(204).jsonp({});
    }
  // Payments API - initiate card payment
  } else if (url.includes('/payment/card') && req.method === 'POST') {
    if (req.body.customerName.includes('Williams')) {
      res.status(500).jsonp({
        status: 500,
        message: 'Internal Server Error!!!',
      });
    } else if (req.body.receiptReference) {
      res.status(200).jsonp(mockData.payment);
    } else {
      const { redirectUri } = req.body;
      res.status(200).jsonp({
        gatewayUrl: `http://localhost:${port}/cpms?redirect=${redirectUri}`,
        redirectionData: '[]',
        receiptReference,
        apiVersion: 1,
      });
    }
    // Payments API - complete card payment
  } else if (url.includes(`/gateway/${receiptReference}/complete`) && req.method === 'PUT') {
    res.status(200).jsonp({
      code: 801,
      message: 'Payment completed successfully',
    });
    // Payments API - complete refund
  } else if (url.includes('/candidate/refund') && req.method === 'POST') {
    res.setHeader('Retry-After', '1');
    res.status(200).jsonp({});
    // Payments API - Income
  } else if (url.includes('/finance/recognitions') && req.method === 'POST') {
    res.setHeader('Retry-After', '1');
    res.status(200).jsonp({});
    // CPMS API
  } else if (url.includes('/cpms')) {
    const parsedQuery: ParsedUrlQuery = querystring.parse(req._parsedOriginalUrl.query);
    res.redirect(303, parsedQuery.redirect);
    // Oauth API
  } else if (url.includes('/oauth') && req.method === 'POST') {
    res.status(200).jsonp(mockData.token);
  } else if (url.includes('/identity') && req.method === 'GET') {
    res.status(401).jsonp({});
    // CRM - create person information
  } else if (url.includes('/crm/contacts') && req.method === 'POST') {
    res.setHeader('odata-entityid', '1115e591-75ca-ea11-a812-00224801cecd');
    res.status(200).jsonp({});
    // CRM - create license information
  } else if (url.includes('/crm/ftts_licences') && req.method === 'POST') {
    res.setHeader('odata-entityid', '1115e591-75ca-ea11-a812-00224801cecd');
    res.status(200).jsonp({});
    // CRM - update booking
  } else if (url.includes('/crm/ftts_bookings') && req.method === 'PATCH') {
    res.status(204).jsonp({});
    // CRM - update booking product
  } else if (url.includes('/crm/ftts_bookingproducts') && req.method === 'PATCH') {
    res.status(204).jsonp({});
    // CRM - create booking product
  } else if (url.includes('/crm/ftts_bookingproducts') && req.method === 'POST') {
    res.status(200).jsonp(
      {
        ftts_bookingproductid: '1115e591-75ca-ea11-a812-00224801cecd',
      },
    );
  } else if (url.includes('/crm/ftts_bookings') && req.method === 'POST') {
    res.status(200).jsonp(
      {
        ftts_bookingid: '1115e591-75ca-ea11-a812-00224801cecd',
        ftts_reference: 'B-000-010-001',
        _ftts_candidateid_value: '11111111-75ca-ea11-a812-00224801cecd',
        _ftts_licenceid_value: '11111111-75ca-ea11-a812-00224801cecd',
        ftts_firstname: 'Tester',
        ftts_lastname: 'Tester',
      },
    );
    // CRM - get clear working days
  } else if (url.includes('/crm/ftts_GetClearWorkingDay') && req.method === 'POST') {
    const { TestDate } = req.body;
    const { NoOfDays } = req.body;
    const testDate = new Date(TestDate);
    const dueDate = testDate.setDate(testDate.getDate() + Number(NoOfDays));
    res.status(200).jsonp({
      DueDate: dueDate,
    });
    // CRM - batch call
  } else if (url.includes('/crm/$batch') && req.method === 'POST') {
    // CRM - create booking
    if (req.body.includes('/crm/ftts_bookings')) {
      res.status(200).jsonp([
        {
          contactid: '111111',
        },
        {
          ftts_bookingid: '1115e591-75ca-ea11-a812-00224801cecd',
          ftts_reference: 'B-000-010-001',
          _ftts_candidateid_value: '11111111-75ca-ea11-a812-00224801cecd',
          _ftts_licenceid_value: '11111111-75ca-ea11-a812-00224801cecd',
        },
      ]);
    } else if (req.body.includes('ftts_licences') && req.body.includes('contacts')) {
      res.status(200).jsonp([
        {
          value: [
            {
              ftts_licenceid: '1115e591-75ca-ea11-a812-00224801cecd',
              _ftts_person_value: '1115e591-75ca-ea11-a812-00224801cecd',
              ftts_licence: 'JONES061102W97YT',
            },
          ],
        },
        {
          value: [
            {
              ftts_firstandmiddlenames: 'First',
              lastname: 'Last',
              birthdate: '2000-01-01',
              emailaddress1: 'test@test.com',
              ftts_title: 'Mr',
              contactid: '111111',
            },
          ],
        },
      ]);
    } else if (req.body.includes('ftts_licences') && req.body.includes('products')) {
      res.status(200).jsonp([
        {
          value: [
            {
              ftts_licenceid: '111111',
              _ftts_person_value: '1115e591-75ca-ea11-a812-00224801cecd',
              ftts_licence: 'JONES061102W97YT',
            },
          ],
        },
        {
          value: [
            {
              productid: '111111',
              _parentproductid_value: '222222',
            },
          ],
        },
      ]);
    } else if (req.body.includes('ftts_licences')) {
      res.status(200).jsonp({
        value: [
          {
            ftts_licenceid: '11111111-75ca-ea11-a812-00224801cecd',
            ftts_licence: 'JONES061102W97YT',
            ftts_address1_street1: 'Address Line 1',
            ftts_address1_street2: 'Address Line 2',
            ftts_address1street3: 'Address Line 3',
            ftts_address1street4: 'Address Line 4',
            ftts_address1_city: 'City',
            ftts_address1_postalcode: 'PO3T CDE',
            firstnames: 'First',
            surname: 'Last',
            dateOfBirth: '2000-01-01',
            email: 'test@test.com',
            title: 'Mr',
            candidateId: '11111111-75ca-ea11-a812-00224801cecd',
            personReference: '1115e591-75ca-ea11-a812-00224801cecd',
          },
        ],
      });
    } else if (req.body.includes('ftts_bookingproducts') && req.body.includes('ftts_testlanguage')) {
      console.log('req.body', req.body);
      res.status(204).jsonp({});
    } else if (req.body.includes('ftts_bookingproducts') && req.body.includes('ftts_additionalsupportoptions')) {
      console.log('req.body', req.body);
      res.status(204).jsonp({});
    } else if (req.body.includes('ftts_bookingproducts') && req.body.includes('ftts_voiceoverlanguage')) {
      console.log('req.body', req.body);
      res.status(204).jsonp({});
    } else {
      res.status(200).jsonp([
        {
          value: [
            {},
          ],
        },
      ]);
    }
    // CRM - get license information
  } else if (url.includes('/crm/ftts_licences') && req.method === 'GET') {
    const parsedQuery: ParsedUrlQuery = querystring.parse(req._parsedOriginalUrl.query);
    const filter = String(parsedQuery.$filter);
    const drivingLicence = RegExp('ftts_licence eq \'(.*)\'').exec(filter);

    if (drivingLicence && drivingLicence[1] === 'ZZZZZ061102W97YT') { // no existing licence
      res.status(200).jsonp({
        value: [],
      });
    } else if (drivingLicence && (drivingLicence[1] === 'AAAAA061102W97YT' || drivingLicence[1].startsWith('TESTR252244N9'))) { // existing licence retrieved
      res.status(200).jsonp({
        value: [
          {
            ftts_licenceid: '11111111-75ca-ea11-a812-00224801cecd',
            ftts_licence: drivingLicence[1],
            ftts_address1_street1: 'Address Line 1',
            ftts_address1_street2: 'Address Line 2',
            ftts_address1street3: 'Address Line 3',
            ftts_address1street4: 'Address Line 4',
            ftts_address1_city: 'City',
            ftts_address1_postalcode: 'PO3T CDE',
            firstnames: 'First',
            surname: 'Last',
            dateOfBirth: '2000-01-01',
            email: 'test@test.com',
            title: 'Mr',
            candidateId: '11111111-75ca-ea11-a812-00224801cecd',
            personReference: '1115e591-75ca-ea11-a812-00224801cecd',
          },
        ],
      });
    } else if (drivingLicence && drivingLicence[1] === 'BBBBB061102W97YT') { // existing licence retrieved
      res.status(200).jsonp({
        value: [
          {
            ftts_licenceid: '22222222-75ca-ea11-a812-00224801cecd',
            ftts_licence: drivingLicence[1],
            ftts_address1_street1: 'Address Line 1',
            ftts_address1_street2: 'Address Line 2',
            ftts_address1street3: 'Address Line 3',
            ftts_address1street4: 'Address Line 4',
            ftts_address1_city: 'City',
            ftts_address1_postalcode: 'PO3T CDE',
            firstnames: 'First',
            surname: 'Last',
            dateOfBirth: '2000-01-01',
            email: 'test@test.com',
            title: 'Mr',
            candidateId: '22222222-75ca-ea11-a812-00224801cecd',
            personReference: '1115e591-75ca-ea11-a812-00224801cecd',
          },
        ],
      });
    } else if (drivingLicence && drivingLicence[1] === 'JONES061102W97YT') { // existing licence retrieved
      res.status(200).jsonp({
        value: [
          {
            ftts_licenceid: '22222222-75ca-ea11-a812-00224801cecd',
            ftts_licence: drivingLicence[1],
            ftts_address1_street1: 'Address Line 1',
            ftts_address1_street2: 'Address Line 2',
            ftts_address1street3: 'Address Line 3',
            ftts_address1street4: 'Address Line 4',
            ftts_address1_city: 'City',
            ftts_address1_postalcode: 'PO3T CDE',
            firstnames: 'Wendy',
            surname: 'Jones',
            dateOfBirth: '2002-11-10',
            email: 'test@test.com',
            title: 'Mr',
            candidateId: '4ddab30e-f90e-eb11-a813-000d3a7f128d',
            personReference: '1115e591-75ca-ea11-a812-00224801cecd',
          },
        ],
      });
    } else if (drivingLicence && drivingLicence[1] === '06159200') { // existing licence retrieved
      res.status(200).jsonp({
        value: [
          {
            ftts_licenceid: 'ad31c12a-b208-eb11-a813-000d3a7f128d',
            ftts_licence: drivingLicence[1],
            ftts_address1_street1: 'Address Line 1',
            ftts_address1_street2: 'Address Line 2',
            ftts_address1street3: 'Address Line 3',
            ftts_address1street4: 'Address Line 4',
            ftts_address1_city: 'City',
            ftts_address1_postalcode: 'PO3T CDE',
            firstnames: 'Wendier',
            surname: 'Jones',
            dateOfBirth: '2002-11-10',
            email: 'test@test.com',
            title: 'Mr',
            candidateId: '2afcbc24-b208-eb11-a813-000d3a7f128d',
            personReference: '1115e591-75ca-ea11-a812-00224801cecd',
          },
        ],
      });
    } else if (drivingLicence && drivingLicence[1] === 'CCCCC061102W97YT') { // existing licence retrieved
      res.status(200).jsonp({
        value: [
          {
            ftts_licenceid: '33333333-75ca-ea11-a812-00224801cecd',
            ftts_licence: drivingLicence[1],
            ftts_address1_street1: 'Address Line 1',
            ftts_address1_street2: 'Address Line 2',
            ftts_address1street3: 'Address Line 3',
            ftts_address1street4: 'Address Line 4',
            ftts_address1_city: 'City',
            ftts_address1_postalcode: 'PO3T CDE',
            firstnames: 'First',
            surname: 'Last',
            dateOfBirth: '2002-11-10',
            email: 'test@test.com',
            title: 'Mr',
            candidateId: '33333333-75ca-ea11-a812-00224801cecd',
            personReference: '1115e591-75ca-ea11-a812-00224801cecd',
          },
        ],
      });
    } else if (drivingLicence && drivingLicence[1] === 'DDDDD061102W97YT') { // existing licence retrieved
      res.status(200).jsonp({
        value: [
          {
            ftts_licenceid: '44444444-75ca-ea11-a812-00224801cecd',
            ftts_licence: drivingLicence[1],
            ftts_address1_street1: 'Address Line 1',
            ftts_address1_street2: 'Address Line 2',
            ftts_address1street3: 'Address Line 3',
            ftts_address1street4: 'Address Line 4',
            ftts_address1_city: 'City',
            ftts_address1_postalcode: 'PO3T CDE',
            firstnames: 'First',
            surname: 'Last',
            dateOfBirth: '2002-11-10',
            email: 'test@test.com',
            title: 'Mr',
            candidateId: '44444444-75ca-ea11-a812-00224801cecd',
            personReference: '1115e591-75ca-ea11-a812-00224801cecd',
          },
        ],
      });
    } else if (drivingLicence && drivingLicence[1] === 'EEEEE061102W97YT') { // existing licence retrieved
      res.status(200).jsonp({
        value: [
          {
            ftts_licenceid: '55555555-75ca-ea11-a812-00224801cecd',
            ftts_licence: drivingLicence[1],
            ftts_address1_street1: 'Address Line 1',
            ftts_address1_street2: 'Address Line 2',
            ftts_address1street3: 'Address Line 3',
            ftts_address1street4: 'Address Line 4',
            ftts_address1_city: 'City',
            ftts_address1_postalcode: 'PO3T CDE',
            firstnames: 'First',
            surname: 'Last',
            dateOfBirth: '2002-11-10',
            email: 'test@test.com',
            title: 'Mr',
            candidateId: '55555555-75ca-ea11-a812-00224801cecd',
            personReference: '1115e591-75ca-ea11-a812-00224801cecd',
          },
        ],
      });
    } else if (drivingLicence && drivingLicence[1] === 'FFFFF061102W97YT') { // existing licence retrieved
      res.status(200).jsonp({
        value: [
          {
            ftts_licenceid: '66666666-75ca-ea11-a812-00224801cecd',
            ftts_licence: drivingLicence[1],
            ftts_address1_street1: 'Address Line 1',
            ftts_address1_street2: 'Address Line 2',
            ftts_address1street3: 'Address Line 3',
            ftts_address1street4: 'Address Line 4',
            ftts_address1_city: 'City',
            ftts_address1_postalcode: 'PO3T CDE',
            firstnames: 'First',
            surname: 'Last',
            dateOfBirth: '2002-11-10',
            email: 'test@test.com',
            title: 'Mr',
            candidateId: '66666666-75ca-ea11-a812-00224801cecd',
            personReference: '1115e591-75ca-ea11-a812-00224801cecd',
          },
        ],
      });
    } else if (drivingLicence && drivingLicence[1] === 'GGGGG061102W97YT') { // existing licence retrieved
      res.status(200).jsonp({
        value: [
          {
            ftts_licenceid: '77777777-75ca-ea11-a812-00224801cecd',
            ftts_licence: drivingLicence[1],
            ftts_address1_street1: 'Address Line 1',
            ftts_address1_street2: 'Address Line 2',
            ftts_address1street3: 'Address Line 3',
            ftts_address1street4: 'Address Line 4',
            ftts_address1_city: 'City',
            ftts_address1_postalcode: 'PO3T CDE',
            firstnames: 'First',
            surname: 'Last',
            dateOfBirth: '2002-11-10',
            email: 'test@test.com',
            title: 'Mr',
            candidateId: '77777777-75ca-ea11-a812-00224801cecd',
            personReference: '1115e591-75ca-ea11-a812-00224801cecd',
          },
        ],
      });
    } else if (drivingLicence && drivingLicence[1].startsWith('9463719')) { // existing NI licence retrieved
      res.status(200).jsonp({
        value: [
          {
            ftts_licenceid: '11111111-75ca-ea11-a812-00224801cecd',
            ftts_licence: drivingLicence[1],
            ftts_address1_street1: 'Address Line 1',
            ftts_address1_street2: 'Address Line 2',
            ftts_address1street3: 'Address Line 3',
            ftts_address1street4: 'Address Line 4',
            ftts_address1_city: 'City',
            ftts_address1_postalcode: 'PO3T CDE',
            firstnames: 'First',
            surname: 'Last',
            dateOfBirth: '2002-11-10',
            email: 'test@test.com',
            title: 'Mr',
            candidateId: '11111111-75ca-ea11-a812-00224801cecd',
            personReference: '1115e591-75ca-ea11-a812-00224801cecd',
          },
        ],
      });
    } else if (drivingLicence && drivingLicence[1] === '55667788') { // existing NI licence retrieved
      res.status(200).jsonp({
        value: [
          {
            ftts_licenceid: '99999999-75ca-ea11-a812-00224801cecd',
            ftts_licence: drivingLicence[1],
            ftts_address1_street1: 'Address Line 1',
            ftts_address1_street2: 'Address Line 2',
            ftts_address1street3: 'Address Line 3',
            ftts_address1street4: 'Address Line 4',
            ftts_address1_city: 'City',
            ftts_address1_postalcode: 'PO3T CDE',
            firstnames: 'First',
            surname: 'Last',
            dateOfBirth: '2002-11-10',
            email: 'test@test.com',
            title: 'Mr',
            candidateId: '99999999-75ca-ea11-a812-00224801cecd',
            personReference: '1115e591-75ca-ea11-a812-00224801cecd',
          },
        ],
      });
    } else if (drivingLicence && drivingLicence[1] === '74563326') { // instructor NI driving licence
      res.status(200).jsonp({
        value: [
          {
            ftts_licenceid: '33334444-75ca-ea11-a812-00224801cecd',
            ftts_licence: drivingLicence[1],
            ftts_address1_street1: 'Address Line 1',
            ftts_address1_street2: 'Address Line 2',
            ftts_address1street3: 'Address Line 3',
            ftts_address1street4: 'Address Line 4',
            ftts_address1_city: 'City',
            ftts_address1_postalcode: 'PO3T CDE',
            firstnames: 'First',
            surname: 'Last',
            dateOfBirth: '2002-11-10',
            email: 'test@test.com',
            title: 'Mr',
            candidateId: '7e8409fe-18a8-eb11-9442-002248016fni',
            personReference: '1115e591-75ca-ea11-a812-00224801cecd',
          },
        ],
      });
    } else if (drivingLicence && drivingLicence[1] === 'PAULF152143RS8IV') { // instructor GB driving licence
      res.status(200).jsonp({
        value: [
          {
            ftts_licenceid: '11112222-75ca-ea11-a812-00224801cecd',
            ftts_licence: drivingLicence[1],
            ftts_address1_street1: 'Address Line 1',
            ftts_address1_street2: 'Address Line 2',
            ftts_address1street3: 'Address Line 3',
            ftts_address1street4: 'Address Line 4',
            ftts_address1_city: 'City',
            ftts_address1_postalcode: 'PO3T CDE',
            firstnames: 'First',
            surname: 'Last',
            dateOfBirth: '2002-11-10',
            email: 'test@test.com',
            title: 'Mr',
            candidateId: '7e8409fe-18a8-eb11-9442-002248016fgb',
            personReference: '1115e591-75ca-ea11-a812-00224801cecd',
          },
        ],
      });
    }
    // CRM - update contact
  } else if (url.includes('/crm/contacts') && req.method === 'PATCH') {
    res.setHeader('odata-entityid', '1115e591-75ca-ea11-a812-00224801cecd');
    res.status(200).jsonp({
      ftts_firstandmiddlenames: 'First',
      lastname: 'Last',
      birthdate: '2000-01-01',
      emailaddress1: 'test@test.com',
      ftts_personreference: '1115e591-75ca-ea11-a812-00224801cecd',
      address: {
        ftts_address1_street1: 'Address Line 1',
        ftts_address1_street2: 'Address Line 2',
        ftts_address1street3: 'Address Line 3',
        ftts_address1street4: 'Address Line 4',
        ftts_address1_city: 'City',
        ftts_address1_postalcode: 'PO3T CDE',
      },
    });
  // CRM - update licence
  } else if (url.includes('/crm/ftts_licences') && req.method === 'PATCH') {
    res.setHeader('odata-entityid', '1115e591-75ca-ea11-a812-00224801cecd');
    res.status(204).jsonp();
  } else if (url.includes('/crm/ftts_bookingproducts?fetchXml')) {
    res.status(200).jsonp([
      {
        value: [
          {},
        ],
      },
    ]);
    // CRM - get booking products information
  } else if (url.includes('/crm/ftts_bookingproducts') && req.method === 'GET') {
    const parsedQuery: ParsedUrlQuery = querystring.parse(req._parsedOriginalUrl.query);
    const filter = String(parsedQuery.$filter);
    const candidateId = RegExp('_ftts_candidateid_value eq (.*) and').exec(filter);

    if (candidateId && candidateId[1].startsWith('11111111')) {
      const singleFutureGbBooking = mockData.bookingsSingleFutureGB.value as CRMBookingDetails[];
      singleFutureGbBooking[0].ftts_testdate = getFutureDate('month', 4).toISOString();
      res.status(200).jsonp(mockData.bookingsSingleFutureGB);
    } else if (candidateId && candidateId[1].startsWith('88888888')) {
      const singleFutureNiBooking = mockData.bookingsSingleFutureNI.value as CRMBookingDetails[];
      singleFutureNiBooking[0].ftts_testdate = getFutureDate('month', 4).toISOString();
      res.status(200).jsonp(mockData.bookingsSingleFutureNI);
    } else if (candidateId && candidateId[1].startsWith('22222222')) {
      const multipleFutureGbBookings = mockData.bookingsMultipleFutureGB.value as CRMBookingDetails[];
      multipleFutureGbBookings[0].ftts_testdate = getFutureDate('day', 1).toISOString();
      multipleFutureGbBookings[1].ftts_testdate = getFutureDate('day', 3).toISOString();
      multipleFutureGbBookings[2].ftts_testdate = getFutureDate('hour', 1).toISOString();
      multipleFutureGbBookings[3].ftts_testdate = getFutureDate('month', 4).toISOString();
      res.status(200).jsonp(mockData.bookingsMultipleFutureGB);
    } else if (candidateId && candidateId[1].startsWith('99999999')) {
      const multipleFutureBookingsNi = mockData.bookingsMultipleFutureNI.value as CRMBookingDetails[];
      multipleFutureBookingsNi[0].ftts_testdate = getFutureDate('day', 1).toISOString();
      multipleFutureBookingsNi[1].ftts_testdate = getFutureDate('day', 3).toISOString();
      multipleFutureBookingsNi[2].ftts_testdate = getFutureDate('hour', 1).toISOString();
      multipleFutureBookingsNi[3].ftts_testdate = getFutureDate('month', 4).toISOString();
      res.status(200).jsonp(mockData.bookingsMultipleFutureNI);
    } else if (candidateId && candidateId[1].startsWith('33333333')) {
      const cscPaymentSuccessBooking = mockData.bookingsCSCPaymentSuccess.value as CRMBookingDetails[];
      cscPaymentSuccessBooking[0].ftts_testdate = getFutureDate('month', 4).toISOString();
      res.status(200).jsonp(mockData.bookingsCSCPaymentSuccess);
    } else if (candidateId && candidateId[1].startsWith('44444444')) {
      const cscPaymentFailureBooking = mockData.bookingsCSCPaymentFailure.value as CRMBookingDetails[];
      cscPaymentFailureBooking[0].ftts_testdate = getFutureDate('month', 4).toISOString();
      res.status(200).jsonp(mockData.bookingsCSCPaymentFailure);
    } else if (candidateId && candidateId[1].startsWith('55555555')) {
      res.status(200).jsonp(mockData.bookingsPrevPassed);
    } else if (candidateId && candidateId[1].startsWith('66666666')) {
      res.status(200).jsonp(mockData.bookingsPrevFailed);
    } else if (candidateId && candidateId[1].startsWith('77777777')) {
      const errorHandlingBooking = mockData.bookingsErrorHandling.value as CRMBookingDetails[];
      errorHandlingBooking[0].ftts_testdate = getFutureDate('month', 4).toISOString();
      res.status(200).jsonp(mockData.bookingsErrorHandling);
    } else if (candidateId && candidateId[1].startsWith('11112222')) {
      const multipleFutureGbInstructorBooking = mockData.bookingsMultipleFutureInstructorGB.value as CRMBookingDetails[];
      multipleFutureGbInstructorBooking[0].ftts_testdate = getFutureDate('month', 4).toISOString();
      multipleFutureGbInstructorBooking[1].ftts_testdate = getFutureDate('month', 4).toISOString();
      multipleFutureGbInstructorBooking[2].ftts_testdate = getFutureDate('month', 4).toISOString();
      res.status(200).jsonp(mockData.bookingsMultipleFutureInstructorGB);
    } else if (candidateId && candidateId[1].startsWith('33334444')) {
      const multipleFutureNiInstructorBooking = mockData.bookingsMultipleFutureInstructorNI.value as CRMBookingDetails[];
      multipleFutureNiInstructorBooking[0].ftts_testdate = getFutureDate('month', 4).toISOString();
      multipleFutureNiInstructorBooking[1].ftts_testdate = getFutureDate('month', 4).toISOString();
      res.status(200).jsonp(mockData.bookingsMultipleFutureInstructorNI);
    }
    // CRM - get price list
  } else if (url.includes('/crm/productpricelevels') && req.method === 'GET') {
    res.status(200).jsonp(mockData.productpricelist);
    // Eligibility API
  } else if (url.includes('/eligibility') && req.method === 'POST') {
    const { drivingLicenceNumber } = req.body;
    let response: any;
    if (drivingLicenceNumber.includes('JONES061102W97YT')) {
      response = mockData.eligWendyJonesGb;
    } else if (drivingLicenceNumber.startsWith('TESTR252244N9')) {
      response = mockData.eligTesterTesterGb;
    } else if (drivingLicenceNumber.includes('AVILA760082T93DE')) {
      response = mockData.eligTasneemAvilaGb;
    } else if (drivingLicenceNumber.includes('WILLI912119D94LQ')) {
      response = mockData.eligDavidWilliamsGb;
    } else if (drivingLicenceNumber.includes('17874131')) {
      // Car - test elgibleTo in 2 months
      mockData.eligGlenWilliamNi.eligibilities[0].eligibleTo = getFutureDate('month', 2, false).format('YYYY-MM-DD');
      response = mockData.eligGlenWilliamNi;
    } else if (drivingLicenceNumber.startsWith('9463719')) {
      response = mockData.eligTesterTesterNi;
    } else if (drivingLicenceNumber.includes('69062660')) {
      response = mockData.eligCarolineFirthNi;
    } else if (drivingLicenceNumber.includes('BENTO603026A97BQ')) {
      // Motorcycle - test elgibleFrom in 3 months
      mockData.eligAbdurRahmanBentonGb.eligibilities[0].eligibleFrom = getFutureDate('month', 3, false).format('YYYY-MM-DD');
      mockData.eligAbdurRahmanBentonGb.eligibilities[0].eligibleTo = getFutureDate('year', 5, false).format('YYYY-MM-DD');
      response = mockData.eligAbdurRahmanBentonGb;
    } else if (drivingLicenceNumber.includes('AAAAA061102W97YT')) {
      response = mockData.eligTesterTesterGb;
    } else if (drivingLicenceNumber.includes('BBBBB061102W97YT')) {
      response = mockData.eligTesterTester2Gb;
    } else if (drivingLicenceNumber.includes('CCCCC061102W97YT')) {
      response = mockData.eligTesterTester3Gb;
    } else if (drivingLicenceNumber.includes('DDDDD061102W97YT')) {
      response = mockData.eligTesterTester4Gb;
    } else if (drivingLicenceNumber.includes('EEEEE061102W97YT')) {
      response = mockData.eligTesterTester5Gb;
    } else if (drivingLicenceNumber.includes('FFFFF061102W97YT')) {
      response = mockData.eligTesterTester6Gb;
    } else if (drivingLicenceNumber.includes('GGGGG061102W97YT')) {
      response = mockData.eligTesterTester7Gb;
    } else if (drivingLicenceNumber.includes('PAULF152143RS8IV')) {
      response = mockData.eligPaulDriveInstructorGb;
    } else if (drivingLicenceNumber.includes('74563326')) {
      response = mockData.eligPaulDriveInstructorNi;
    } else if (drivingLicenceNumber.includes('55667788')) {
      response = mockData.eligTesterTester9Ni;
    } else if (drivingLicenceNumber.includes('40100000')) {
      res.status(401).jsonp({ message: 'Unauthorised' });
    } else if (drivingLicenceNumber.includes('40300000')) {
      res.status(403).jsonp({ message: 'Forbidden' });
    } else if (drivingLicenceNumber.includes('40900000')) {
      res.status(409).jsonp({ message: 'Conflict' });
    } else if (drivingLicenceNumber.includes('40000000')) {
      res.status(400).jsonp({ message: 'Bad Request' });
    } else if (drivingLicenceNumber.includes('40400000')) {
      res.status(404).jsonp({ message: 'Not Found' });
    } else if (drivingLicenceNumber.includes('50000000')) {
      res.status(500).jsonp({ message: 'Internal server error' });
    } else if (drivingLicenceNumber.includes('42900000')) {
      res.status(429).jsonp({ message: 'Too many requests' });
    } else {
      response = mockData.eligWendyJonesGb;
    }
    res.status(200).jsonp(response);
  } else { // Default response
    res.status(200).jsonp({});
  }
};

server.listen(port, () => {
  console.log('JSON Server is running');
});
