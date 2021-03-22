/* eslint-disable @typescript-eslint/brace-style */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/ban-ts-ignore */
import dayjs, { OpUnitType } from 'dayjs';
import jsonServer from 'json-server';
import querystring, { ParsedUrlQuery } from 'querystring';
import { TARGET } from '../../src/domain/enums';
import { CRMBookingStatus } from '../../src/services/crm-gateway/enums';
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

function getFutureDate(unit: OpUnitType, value: number) {
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

  if (futureDate.format('dddd') === 'Sunday') {
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
// @ts-ignore
router.render = (req, res) => {
  const url = req.originalUrl;

  // Location API
  if (url.includes('/test-centres') === true && req.method === 'GET') {
    const parsedQuery: ParsedUrlQuery = querystring.parse(req._parsedOriginalUrl.query);
    const numOfResults = Number(parsedQuery.numberOfResults);
    const { region } = parsedQuery;
    const searchTerm = parsedQuery.term;
    let testCentresClone;
    if (region === TARGET.GB) {
      testCentresClone = JSON.parse(JSON.stringify(mockData.testCentresGb));
    } else if (region === TARGET.NI) {
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
  // Scheduling API - confirm booking a slot
  } else if (url.includes('/bookings') && req.method === 'POST') {
    res.status(200).jsonp(
      [
        {
          reservationId: '1111-2222-3333-4444-5555',
          message: 'Success',
          status: 200,
        },
      ],
    );
  }
  // Scheduling API - get a booking a slot
  else if (url.includes('/bookings') && req.method === 'GET') {
    res.setHeader('Retry-After', '1');
    if (url.includes('A-000-000-004')) {
      res.status(500).jsonp({});
    } else {
      res.status(204).jsonp({});
    }
  }
  // Scheduling API - delete booking a slot
  else if (url.includes('/bookings') && req.method === 'DELETE') {
    res.setHeader('Retry-After', '1');
    if (url.includes('A-000-000-002')) {
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
    res.status(200).jsonp({});
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
  // CRM - create person information
  } else if (url.includes('/crm/contacts') && req.method === 'POST') {
    res.setHeader('odata-entityid', '1115e591-75ca-ea11-a812-00224801cecd');
    res.status(200).jsonp({});
  // CRM - create license information
  } else if (url.includes('/crm/ftts_licences') && req.method === 'POST') {
    res.setHeader('odata-entityid', '1115e591-75ca-ea11-a812-00224801cecd');
    res.status(200).jsonp({});
  // CRM - create booking
  } else if (url.includes('/crm/ftts_bookings') && req.method === 'POST') {
    res.status(200).jsonp({
      ftts_bookingid: '1115e591-75ca-ea11-a812-00224801cecd',
      ftts_reference: 'A-000-000-001',
    });
  // CRM - update booking
  } else if (url.includes('/crm/ftts_bookings') && req.method === 'PATCH') {
    const bookingStatus = req.body.ftts_bookingstatus;
    if (bookingStatus === CRMBookingStatus.Confirmed) { // change response code to throw an error when updating booking status
      res.status(204).jsonp({});
    } else {
      res.status(204).jsonp({});
    }
  // CRM - update booking for change language
  // } else if (url.includes('/crm/ftts_bookingproducts') && req.method === 'PATCH') {
  //   console.log(req.body)
  //   if (req.body.ftts_testlanguage === CRMTestLanguage.Welsh) { // change response code to throw an error when updating booking status
  //     res.status(500).jsonp({});
  //   } else {
  //     res.status(204).jsonp({});
  //   }
    // CRM - create booking product
  } else if (url.includes('/crm/ftts_bookingproducts') && req.method === 'POST') {
    res.status(200).jsonp('1115e591-75ca-ea11-a812-00224801cecd');
  // CRM - get clear working days
  } else if (url.includes('/crm/ftts_GetClearWorkingDay') && req.method === 'POST') {
    const { TestDate } = req.body;
    const { NoOfDays } = req.body;
    const testDate = new Date(TestDate);
    const dueDate = testDate.setDate(testDate.getDate() + NoOfDays);
    res.status(200).jsonp({
      DueDate: dueDate,
    });
  // CRM - batch call
  } else if (url.includes('/crm/$batch') && req.method === 'POST') {
    if (req.body.includes('ftts_licences') && req.body.includes('contacts')) {
      res.status(200).jsonp([
        {
          value: [
            {
              ftts_licenceid: '111111',
              _ftts_person_value: '222222',
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
              _ftts_person_value: '222222',
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
    } else if (req.body.includes('ftts_bookingproducts') && req.body.includes('ftts_testlanguage')) {
      console.log('req.body', req.body);
      res.status(204).jsonp({});
    } else if (req.body.includes('ftts_bookingproducts') && req.body.includes('ftts_additionalsupportoptions')) {
      console.log('req.body', req.body);
      res.status(204).jsonp({});
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
    } else if (drivingLicence && (drivingLicence[1] === 'AAAAA061102W97YT' || drivingLicence[1] === 'JONES061102W97YT')) { // existing licence retrieved
      res.status(200).jsonp({
        value: [
          {
            ftts_licenceid: 'GB-111111',
            ftts_licence: drivingLicence[1],
            ftts_Person: {
              ftts_firstandmiddlenames: 'First',
              lastname: 'Last',
              birthdate: '2000-01-01',
              emailaddress1: 'test@test.com',
              ftts_title: 'Mr',
              contactid: 'GB-111111',
            },
          },
        ],
      });
    } else if (drivingLicence && drivingLicence[1] === 'BBBBB061102W97YT') { // existing licence retrieved
      res.status(200).jsonp({
        value: [
          {
            ftts_licenceid: 'GB-222222',
            ftts_licence: drivingLicence[1],
            ftts_Person: {
              ftts_firstandmiddlenames: 'First',
              lastname: 'Last',
              birthdate: '2000-01-01',
              emailaddress1: 'test@test.com',
              ftts_title: 'Mr',
              contactid: 'GB-222222',
            },
          },
        ],
      });
    } else if (drivingLicence && drivingLicence[1] === 'CCCCC061102W97YT') { // existing licence retrieved
      res.status(200).jsonp({
        value: [
          {
            ftts_licenceid: 'GB-333333',
            ftts_licence: drivingLicence[1],
            ftts_Person: {
              ftts_firstandmiddlenames: 'First',
              lastname: 'Last',
              birthdate: '2000-01-01',
              emailaddress1: 'test@test.com',
              ftts_title: 'Mr',
              contactid: 'GB-333333',
            },
          },
        ],
      });
    } else if (drivingLicence && drivingLicence[1] === 'DDDDD061102W97YT') { // existing licence retrieved
      res.status(200).jsonp({
        value: [
          {
            ftts_licenceid: 'GB-444444',
            ftts_licence: drivingLicence[1],
            ftts_Person: {
              ftts_firstandmiddlenames: 'First',
              lastname: 'Last',
              birthdate: '2000-01-01',
              emailaddress1: 'test@test.com',
              ftts_title: 'Mr',
              contactid: 'GB-444444',
            },
          },
        ],
      });
    } else if (drivingLicence && drivingLicence[1] === 'EEEEE061102W97YT') { // existing licence retrieved
      res.status(200).jsonp({
        value: [
          {
            ftts_licenceid: 'GB-555555',
            ftts_licence: drivingLicence[1],
            ftts_Person: {
              ftts_firstandmiddlenames: 'First',
              lastname: 'Last',
              birthdate: '2000-01-01',
              emailaddress1: 'test@test.com',
              ftts_title: 'Mr',
              contactid: 'GB-555555',
            },
          },
        ],
      });
    } else if (drivingLicence && drivingLicence[1] === 'FFFFF061102W97YT') { // existing licence retrieved
      res.status(200).jsonp({
        value: [
          {
            ftts_licenceid: 'GB-666666',
            ftts_licence: drivingLicence[1],
            ftts_Person: {
              ftts_firstandmiddlenames: 'First',
              lastname: 'Last',
              birthdate: '2000-01-01',
              emailaddress1: 'test@test.com',
              ftts_title: 'Mr',
              contactid: 'GB-666666',
            },
          },
        ],
      });
    } else if (drivingLicence && drivingLicence[1] === 'GGGGG061102W97YT') { // existing licence retrieved
      res.status(200).jsonp({
        value: [
          {
            ftts_licenceid: 'GB-777777',
            ftts_licence: drivingLicence[1],
            ftts_Person: {
              ftts_firstandmiddlenames: 'First',
              lastname: 'Last',
              birthdate: '2000-01-01',
              emailaddress1: 'test@test.com',
              ftts_title: 'Mr',
              contactid: 'GB-777777',
            },
          },
        ],
      });
    } else if (drivingLicence && drivingLicence[1] === '17874131') { // existing NI licence retrieved
      res.status(200).jsonp({
        value: [
          {
            ftts_licenceid: 'NI-111111',
            ftts_licence: drivingLicence[1],
            ftts_Person: {
              ftts_firstandmiddlenames: 'First',
              lastname: 'Last',
              birthdate: '2000-01-01',
              emailaddress1: 'test@test.com',
              ftts_title: 'Mr',
              contactid: 'NI-111111',
            },
          },
        ],
      });
    } else if (drivingLicence && drivingLicence[1] === '55667788') { // existing NI licence retrieved
      res.status(200).jsonp({
        value: [
          {
            ftts_licenceid: 'NI-222222',
            ftts_licence: drivingLicence[1],
            ftts_Person: {
              ftts_firstandmiddlenames: 'First',
              lastname: 'Last',
              birthdate: '2000-01-01',
              emailaddress1: 'test@test.com',
              ftts_title: 'Mr',
              contactid: 'NI-222222',
            },
          },
        ],
      });
    } else {
      res.status(200).jsonp({
        value: [],
      });
    }
  // CRM - get booking products information
  } else if (url.includes('/crm/ftts_bookingproducts') && req.method === 'GET') {
    const parsedQuery: ParsedUrlQuery = querystring.parse(req._parsedOriginalUrl.query);
    const filter = String(parsedQuery.$filter);
    const candidateId = RegExp('_ftts_candidateid_value eq (.*) and').exec(filter);

    if (candidateId && candidateId[1] === 'GB-111111') {
      mockData.bookingsSingleFutureGB.value[0].ftts_testdate = getFutureDate('month', 1).toISOString();
      res.status(200).jsonp(mockData.bookingsSingleFutureGB);
    } else if (candidateId && candidateId[1] === 'NI-111111') {
      mockData.bookingsSingleFutureNI.value[0].ftts_testdate = getFutureDate('month', 1).toISOString();
      res.status(200).jsonp(mockData.bookingsSingleFutureNI);
    } else if (candidateId && candidateId[1] === 'GB-222222') {
      mockData.bookingsMultipleFutureGB.value[0].ftts_testdate = getFutureDate('day', 1).toISOString();
      mockData.bookingsMultipleFutureGB.value[1].ftts_testdate = getFutureDate('day', 3).toISOString();
      mockData.bookingsMultipleFutureGB.value[2].ftts_testdate = getFutureDate('hour', 1).toISOString();
      res.status(200).jsonp(mockData.bookingsMultipleFutureGB);
    } else if (candidateId && candidateId[1] === 'NI-222222') {
      mockData.bookingsMultipleFutureNI.value[0].ftts_testdate = getFutureDate('day', 1).toISOString();
      mockData.bookingsMultipleFutureNI.value[1].ftts_testdate = getFutureDate('day', 3).toISOString();
      mockData.bookingsMultipleFutureNI.value[2].ftts_testdate = getFutureDate('hour', 1).toISOString();
      res.status(200).jsonp(mockData.bookingsMultipleFutureNI);
    } else if (candidateId && candidateId[1] === 'GB-333333') {
      mockData.bookingsCSCPaymentSuccess.value[0].ftts_testdate = getFutureDate('month', 1).toISOString();
      res.status(200).jsonp(mockData.bookingsCSCPaymentSuccess);
    } else if (candidateId && candidateId[1] === 'GB-444444') {
      mockData.bookingsCSCPaymentFailure.value[0].ftts_testdate = getFutureDate('month', 1).toISOString();
      res.status(200).jsonp(mockData.bookingsCSCPaymentFailure);
    } else if (candidateId && candidateId[1] === 'GB-555555') {
      res.status(200).jsonp(mockData.bookingsPrevPassed);
    } else if (candidateId && candidateId[1] === 'GB-666666') {
      res.status(200).jsonp(mockData.bookingsPrevFailed);
    } else if (candidateId && candidateId[1] === 'GB-777777') {
      mockData.bookingsErrorHandling.value[0].ftts_testdate = getFutureDate('month', 1).toISOString();
      res.status(200).jsonp(mockData.bookingsErrorHandling);
    }
  } else { // Default response
    res.status(200).jsonp({});
  }
};

server.listen(port, () => {
  console.log('JSON Server is running');
});
