# FTTS Booking App

This project is to define an FTTS component responsible for candidate booking

## Runtime

NodeJS >=14.x

## Language

Typescript 3.9.x

## Build and run

### Install packages

```bash
npm install
```

Includes building and installing ftts-payment-api-model

### Clean build the app

```bash
npm run build
```

Compiles ts source and generates frontend assets, copying into `dist` along with the `.njk` views and Azure deploy config

### Run the app locally via Azure CLI tools

Create a local.settings.json by running:

```bash
npm run copy-config
```

```bash
npm run func:start
```

Clean installs, builds and runs the app wrapped in an Azure function, hosted at `http://localhost:8888/`

## Tests

### Run all the unit tests

```bash
npm run test
```

### Generate coverage report

```bash
npm run test:coverage
```

### Integration tests

The CRM integration tests will run in the Booking App deployment pipeline and can also be run manually on a local machine if required. They require the CRM config to be provided in the local .env

```bash
npx jest --setupFiles dotenv/config --verbose integration/crm.test.ts
```

### End to End UI tests

E2E UI tests are run using TestCafe:
`https://devexpress.github.io/testcafe/documentation/getting-started/`

Firstly set the following environment variables so TestCafe knows which environment to test against and which Redis cache instance to use:

```bash
export BOOKING_APP_URL="https://dsuksdvfntendfnc001.azurewebsites.net"
export SESSION_STORAGE_URL="dsuksdvfntendrc001.redis.cache.windows.net"
export SESSION_STORAGE_PORT=6380
export SESSION_STORAGE_PASSWORD="redis_cache_password"
export CRM_API_URL=https://fttsshire.crm11.dynamics.com/api/data/v9.1
export CRM_CLIENT_ID=<crm_client_id>
export CRM_CLIENT_SECRET=<crm_client_secret>
export CRM_SCOPE=https://fttsshire.crm11.dynamics.com/.default
export CRM_TENANT_ID=
export CRM_TOKEN_URL=https://login.microsoftonline.com/6c448d90-4ca1-4caf-ab59-0a2aa67d7801/oauth2/token
export CRM_TEST_CLIENT_ACCOUNT_ID_DVSA=<crm_account_id_dvsa>
export CRM_TEST_CLIENT_ACCOUNT_ID_DVA=<crm_account_id_dva>
export CRM_TEST_CLIENT_TRAINER_BOOKER=<crm_trainer_booker>
export CRM_TEST_CLIENT_SYSTEM_USER=<crm_system_user>
export LOG_LEVEL=error
export RUN_TESTS_LOCALLY=false
export NODE_ENV=development
export APPINSIGHTS_INSTRUMENTATIONKEY=a123b456-1f33-49ed-af11-aef7e9785ea3
```

Then you can run the NPM command:

```bash
npm run test:e2e
```

The above command will run the e2e tests against Chrome in headless mode using a single instance of the browser. If you want to run the tests in parallel using multiple Chrome instances, you can do this by using the following command:

```bash
npx testcafe chrome:headless tests/e2e/ui --hostname 127.0.0.1 --reporter spec,xunit:report.xml,html:report.html --screenshots takeOnFails=true --selector-timeout 90000 --compiler-options typescript.configPath=tsconfig.test.json --skip-js-errors --disable-multiple-windows --assertion-timeout 120000 -c 2
```

Where the `-c` parameter specifies how many concurrent browser instances to run.

There is also added support in TestCafe for running tests against BrowserStack using the following NPM package:
`https://github.com/DevExpress/testcafe-browser-provider-browserstack`

When running against BrowserStack from your local machine, ensure you have set the following environment variables:

```bash
export BROWSERSTACK_USERNAME=my-username
export BROWSERSTACK_ACCESS_KEY=my-access-key
export BROWSERSTACK_FORCE_LOCAL="1"
export BROWSERSTACK_VIDEO="1"
export BROWSERSTACK_PROJECT_NAME="FTTS"
export BROWSERSTACK_BUILD_ID="FTTS Beta"
export BROWSERSTACK_TEST_RUN_NAME="Online candidate booking app"
export BROWSERSTACK_TEST_TIMEOUT=900
export BROWSERSTACK_ACCEPT_SSL_CERTS=true
```

Then you can provide the browser/device/os and version you want to test against, below are some examples:

* Chrome 83 Windows 10: `npx testcafe "browserstack:chrome@83.0:Windows 10" "tests/e2e/ui" --reporter spec,xunit:report.xml,html:report.html --screenshots takeOnFails=true --selector-timeout 120000 --hostname bs-local.com --compiler-options typescript.configPath=tsconfig.test.json --skip-js-errors --disable-multiple-windows --assertion-timeout 120000`
* Edge 81 Windows 10: `npx testcafe "browserstack:edge@81.0:Windows 10" "tests/e2e/ui" --reporter spec,xunit:report.xml,html:report.html --screenshots takeOnFails=true --selector-timeout 120000 --hostname bs-local.com --compiler-options typescript.configPath=tsconfig.test.json --skip-js-errors --disable-multiple-windows --assertion-timeout 120000`
* Firefox 76 Windows 10: `npx testcafe "browserstack:firefox@76.0:Windows 10" "tests/e2e/ui" --reporter spec,xunit:report.xml,html:report.html --screenshots takeOnFails=true --selector-timeout 120000 --hostname bs-local.com --compiler-options typescript.configPath=tsconfig.test.json --skip-js-errors --disable-multiple-windows --assertion-timeout 120000`
* IE11 Windows 7: `npx testcafe "browserstack:ie@11.0:Windows 7" "tests/e2e/ui" --reporter spec,xunit:report.xml,html:report.html --screenshots takeOnFails=true --selector-timeout 120000 --hostname bs-local.com --compiler-options typescript.configPath=tsconfig.test.json --skip-js-errors --disable-multiple-windows --assertion-timeout 120000`
* iPhone 7 iOS 10.3 (specific ports supplied that are needed for Safari to work): `npx testcafe "browserstack:iPhone 7 Plus@10.3" "tests/e2e/ui" --reporter spec,xunit:report.xml,html:report.html --screenshots takeOnFails=true --selector-timeout 120000 --hostname bs-local.com --ports 50208,54134,54136,60778,63342,64000 --compiler-options typescript.configPath=tsconfig.test.json --skip-js-errors --disable-multiple-windows --assertion-timeout 120000`
* Samsung Galaxy S10 Android 9.0: `npx testcafe "browserstack:Samsung Galaxy S10e@9.0" "tests/e2e/ui" --reporter spec,xunit:report.xml,html:report.html --screenshots takeOnFails=true --selector-timeout 120000 --hostname bs-local.com --compiler-options typescript.configPath=tsconfig.test.json --skip-js-errors --disable-multiple-windows --assertion-timeout 120000`

To run tests in parallel against BrowserStack, you can use a command similar to below:

```bash
npx testcafe "browserstack:chrome@83.0:Windows 10,browserstack:edge@81.0:Windows 10,browserstack:firefox@76.0:Windows 10,browserstack:ie@11.0:Windows 7,browserstack:Samsung Galaxy S10e@9.0,browserstack:iPhone 7 Plus@10.3" "tests/e2e/ui" --reporter spec,xunit:report.xml,html:report.html --screenshots takeOnFails=true --hostname bs-local.com --selector-timeout 180000 --ports 38946,49772,50208,54134,54136,60778,63342,64000 --skip-js-errors --compiler-options typescript.configPath=tsconfig.test.json --disable-multiple-windows --assertion-timeout 120000
```

To debug issues in BrowserStack, set the following environment variables to get more logs recorded during the test:

```bash
export BROWSERSTACK_USE_AUTOMATE="1"
export BROWSERSTACK_NETWORK_LOGS="1"
export BROWSERSTACK_CONSOLE="debug"
export BROWSERSTACK_NETWORK_LOGS=true
export BROWSERSTACK_VERBOSE="1"
export BROWSERSTACK_DEBUG="true"
```

The test suite is grouped into 3 main sub test suites to make running all them easier or to target particular areas:

* e2e - as its name suggests, the end-to-end user journeys to book tests
* regression - cover functionality of individual pages in the booking app
* manage-booking - cover functionality of the manage booking pages (login, cancel, rescheduling bookings)
* instructor - cover functionality related to the instructor candidate booking journeys

To filter what sub-suite to run you can add the following command to your testcafe commands above:

```bash
--fixture-meta type=e2e
```

```bash
--fixture-meta type=regression
```

```bash
--fixture-meta type=manage-booking
```

```bash
--fixture-meta type=instructor
```

```bash
--fixture-meta type=bulk-compensation
```

#### UI test data

The UI tests use candidate data which is stored in the Eligibilty API mock to proceed through the various journeys in the Booking App. To avoid an issue with SQL errors appearing in CRM (due to a licence record update), we randomly choose from a pool of candidates to avoid the chances of the same tests using the same candidates when running tests in parallel. The data it uses is as follows.

GB Candidate & Instructor tests:

* Name: Tester Tester
* DOB: 01-01-2000
* Licence Number: Starting with TESTR252244N9 then ending with a number from 2-9 and either a VR or ZZ

NI Candidate & Instructor tests:

* Name: Tester Tester
* DOB: 01-01-2000
* Licence Number: Starting with 9463719 then ending with a number from 0-9

For Bulk Compensation tests, we have a separate list of candidates to avoid clashes in cancelled bookings showing up where they are not expected.

GB Candidate & Instructor bulk compensation tests:

* Name: Tester Tester
* DOB: 01-01-2000
* Licence Number: TESTR252244N92ZX, TESTR252244N93ZX, TESTR252244N94ZX

NI Candidate & Instructor bulk compensation tests:

* Name: Tester Tester
* DOB: 01-01-2000
* Licence Number: 94637180, 94637181, 94637182

NOTE: Its recommended to only run the bulk-compensation fixture with a maximum of 3 parallel tests to avoid issues

### Accessibility tests

Accessibility tests are run using TestCafe and Axe.

## Run accessibility tests with TestCafe & Axe

Firstly set the following environment variables so TestCafe knows which environment to test against:

```bash
export BOOKING_APP_URL="https://dsuksdvfntendfnc001.azurewebsites.net"
export SESSION_STORAGE_URL="dsuksdvfntendrc001.redis.cache.windows.net"
export SESSION_STORAGE_PORT=6380
export SESSION_STORAGE_PASSWORD="redis_cache_password"
export RUN_TESTS_LOCALLY=false
```

Then you can run the NPM command:

```bash
npm run test:accessibility
```

A set of HTML reports will be generated under the `axe-reports` directory for each page tested.

## Local development

Additional scripts to ease local development:

### Host Express server locally

```bash
npm run start
```

### Watch source and template files, recompile and restart server on changes

```bash
nodemon
```

### Debug

```bash
npm run local:debug
```

Attach debugger via VSCode 'Attach locally' configuration in `launch.json`

### Debug tests

> Run 'Debug all tests' configuration in `launch.json`

Runs all the tests with the debugger attached

### Env config for local

If you want to run the Booking App locally, add a `.env` file using .env.example as a base

You will need to download and install Redis - `https://redis.io/download`

If running the app as an Azure function use:
`PAYMENT_REDIRECT_URI=http://localhost:8888`

Or if running the app as an Express server use:
`PAYMENT_REDIRECT_URI=http://localhost:3000`

### Running mock server

A mock server is available that mocks out calls to external APIs without needing to run the APIs locally or connect to them remotely in Azure. This is done through running json-server to host and capture the API calls being sent out from the app. The mock server runs off port 5000 by default.

To view or amend the API data that is being served by json-server, please see `src/tests/mocks/server.ts`

To setup the mock server:

* Configure the .env file using the following settings:

```bash
CRM_API_URL=http://localhost:5000/crm
LOCATION_API_BASE_URL=http://localhost:5000
NOTIFICATION_API_BASE_URL=http://localhost:5000
PAYMENT_API_BASE_URL=http://localhost:5000
PAYMENT_REDIRECT_URI=<base url of the front end booking app> (see above, either http://localhost:3000 or http://localhost:8888)
MAPS_API_KEY=<google maps js api key for local dev>
```

Then start the mock server:

* `npm run start:mock-server`

And then start the app:

* `npm run start` - if using the Express server
OR
* `npm run func:start` = if using the Azure function app

## Running Local Booking App through Docker against json-server mock for testing

Firstly, follow the instructions given in the README of the mono repo on how to get Docker setup.

Once that is complete, all that is required is to run the following command from the root directory of the repo (ftts-beta):

```bash
docker-compose -f docker-compose-testing.yml up --build
```

This will then build and spin up:

* the Booking App (running on localhost:80)
* a redis cache server
* json-server mock server to manage all API requests from the Booking App
### Running Queue It in dev

To run Queue it in the dev env:
1. Firstly ensure Front door is deployed on the env 
2. CUSTOM_DOMAIN_URI value in the configuration window will manually need to be changed to https://dsuksdvfntendfd< env number>.azurefd.net/
3. Ensure queue it implementation is set to either server-side or client-side depending what one you woul like to use. 
