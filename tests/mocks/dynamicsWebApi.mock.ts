import DynamicsWebApi from 'dynamics-web-api';
import { mock } from 'jest-mock-extended';
import { mocked } from 'ts-jest/utils';
import { dynamicsWebApiClient } from '../../src/services/crm-gateway/dynamics-web-api';

jest.mock('../../src/services/crm-gateway/dynamics-web-api');

const mockedNewDynamicsWebApi = mocked(dynamicsWebApiClient);

mockedNewDynamicsWebApi.mockImplementation(
  (): DynamicsWebApi => mockedDynamicsWebApi,
);

export const mockedDynamicsWebApi = mock<DynamicsWebApi>();
