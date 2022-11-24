// This file will be run by jest whenever a new test file is loaded.
import './src/libraries/dayjs-config';

// Setup Global Mocks
jest.mock('@dvsa/azure-logger');
jest.mock('@dvsa/ftts-auth-client');
