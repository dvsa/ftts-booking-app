/* eslint-disable jest/no-conditional-expect, jest/no-try-expect */
import { Meta } from 'express-validator';
import MockDate from 'mockdate';
import { v4 as uuid4 } from 'uuid';
import DynamicsWebApi from 'dynamics-web-api';
import { CandidateService } from '../../../../src/services/candidates/candidate-service';
import { Locale, Target, TestType } from '../../../../src/domain/enums';
import { logger } from '../../../../src/helpers/logger';
import { EligibilityLicenceNotFoundError } from '../../../../src/domain/errors/eligibility/EligibilityLicenceNotFoundError';
import { EligbilityCandidateMismatchError } from '../../../../src/domain/errors/eligibility/EligbilityCandidateMismatchError';
import { CrmCreateUpdateCandidateError } from '../../../../src/domain/errors/crm/CrmCreateUpdateCandidateError';
import { mockSessionCandidate } from '../../../mocks/data/session-types';
import { MultipleCandidateMismatchError } from '../../../../src/domain/errors/MultipleCandidateMatchError';
import { CRMGovernmentAgency } from '../../../../src/services/crm-gateway/enums';
import { AgencyMismatchError } from '../../../../src/domain/errors/login/AgencyMismatchError';

describe('CandidateService', () => {
  const mockToday = '2020-05-01T12:00:00.000Z';
  MockDate.set(mockToday);

  let mockCrmGateway = {
    updateCandidate: jest.fn(),
    getLicenceNumberRecordsByCandidateId: jest.fn(),
    updateLicence: jest.fn(),
    createLicence: jest.fn(),
    createCandidate: jest.fn(),
  };
  let mockEligibilityGateway = {
    getEligibility: jest.fn(),
  };
  const mockPrn = 'mock-reference-number';
  let globalCandidateService: CandidateService;
  const mockLicenceId = uuid4();
  const mockCandidateId = uuid4();
  const mockLicenceNumber = 'JONES061102W97YT';
  const mockCandidateResponse = {
    candidateId: mockCandidateId,
    firstnames: 'Wendy',
    surname: 'Jones',
    email: 'wendyjones@gmail.com',
    dateOfBirth: '2002-11-10',
    licenceId: mockLicenceId,
    licenceNumber: mockLicenceNumber,
    eligibleToBookOnline: true,
    address: {
      line1: '42 Somewhere Street',
      line2: 'This Village',
      line3: 'This County',
      line4: 'Nowhere',
      line5: 'Birmingham',
      postcode: 'B5 1AA',
    },
    eligibilities: [
      {
        testType: TestType.CAR,
        eligible: true,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2020-06-01',
        paymentReceiptNumber: 'mock-receipt-number',
        personalReferenceNumber: 'mock-reference-number',
      },
    ],
  };

  const otherAddress = {
    line1: '42 Some Other Street',
    line2: 'This Village',
    line3: 'This County',
    line4: 'Nowhere',
    line5: 'Birmingham',
    postcode: 'B5 1AA',
  };

  const expectedError: DynamicsWebApi.RequestError = {
    name: 'name',
    status: 500,
    message: 'error message',
  };

  let meta = {
    req: {
      res: {
        locals: {
          target: Target.GB,
          locale: Locale.GB,
        },
      },
    },
  };

  const candidateDetails = {
    firstnames: 'Wendy',
    surname: 'Jones',
    licenceNumber: mockLicenceNumber,
    dobDay: '10',
    dobMonth: '11',
    dobYear: '2002',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    meta = {
      req: {
        res: {
          locals: {
            target: Target.GB,
            locale: Locale.GB,
          },
        },
      },
    };

    mockCrmGateway = {
      updateCandidate: jest.fn(),
      getLicenceNumberRecordsByCandidateId: jest.fn(),
      updateLicence: jest.fn(),
      createLicence: jest.fn(),
      createCandidate: jest.fn(),
    };

    mockEligibilityGateway = {
      getEligibility: jest.fn(),
    };

    globalCandidateService = new CandidateService(mockCrmGateway as any, mockEligibilityGateway as any);
  });

  describe('alignCandidateDataInCRM', () => {
    describe('candidate has existing licence in CRM', () => {
      describe('and nothing has to be updated', () => {
        test('then candidate and licence are not updated', async () => {
          mockCrmGateway.getLicenceNumberRecordsByCandidateId = jest.fn().mockResolvedValueOnce(mockCandidateResponse);
          mockCrmGateway.updateCandidate = jest.fn().mockResolvedValueOnce(mockCandidateResponse);

          const result = await globalCandidateService.alignCandidateDataInCRM(mockCandidateResponse, mockLicenceNumber);

          expect(result.crmCandidate).toStrictEqual(mockCandidateResponse);
          expect(result.licenceId).toEqual(mockLicenceId);
          expect(mockCrmGateway.updateLicence).not.toHaveBeenCalled();
          expect(mockCrmGateway.updateCandidate).not.toHaveBeenCalled();
          expect(mockCrmGateway.createLicence).not.toHaveBeenCalled();
        });
      });

      describe('and crm licence address has nulls while eligibility licence address has empty strings', () => {
        test('then candidate and licence are not updated', async () => {
          const eligibilityCandidate = {
            ...mockCandidateResponse,
            address: {
              line1: '',
              line2: '',
              line3: 'This County',
              line4: 'Nowhere',
              line5: '',
              postcode: '',
            },
          };
          const mockCrmCandidate = {
            ...mockCandidateResponse,
            address: {
              line1: null,
              line2: null,
              line3: 'This County',
              line4: 'Nowhere',
              line5: null,
              postcode: null,
            },
          };
          mockCrmGateway.getLicenceNumberRecordsByCandidateId = jest.fn().mockResolvedValueOnce(mockCrmCandidate);

          const result = await globalCandidateService.alignCandidateDataInCRM(eligibilityCandidate, mockLicenceNumber);

          expect(result.crmCandidate).toStrictEqual(mockCrmCandidate);
          expect(result.licenceId).toEqual(mockLicenceId);
          expect(mockCrmGateway.updateLicence).not.toHaveBeenCalled();
          expect(mockCrmGateway.updateCandidate).not.toHaveBeenCalled();
          expect(mockCrmGateway.createLicence).not.toHaveBeenCalled();
        });
      });

      describe('and crm candidate has nulls while eligibility candidate has empty strings', () => {
        test('then candidate and licence are not updated', async () => {
          const eligibilityCandidate = {
            ...mockCandidateResponse,
            firstnames: '',
            surname: '',
            dateOfBirth: '',
            title: '',
          };
          const mockCrmCandidate = {
            ...mockCandidateResponse,
            firstnames: null,
            surname: null,
            dateOfBirth: null,
            title: null,
          };
          mockCrmGateway.getLicenceNumberRecordsByCandidateId = jest.fn().mockResolvedValueOnce(mockCrmCandidate);

          const result = await globalCandidateService.alignCandidateDataInCRM(eligibilityCandidate, mockLicenceNumber);

          expect(result.crmCandidate).toStrictEqual(mockCrmCandidate);
          expect(result.licenceId).toEqual(mockLicenceId);
          expect(mockCrmGateway.updateLicence).not.toHaveBeenCalled();
          expect(mockCrmGateway.updateCandidate).not.toHaveBeenCalled();
          expect(mockCrmGateway.createLicence).not.toHaveBeenCalled();
        });
      });

      describe('and licence has to be updated', () => {
        test('then licence and candidate are updated', async () => {
          mockCrmGateway.getLicenceNumberRecordsByCandidateId = jest.fn().mockResolvedValueOnce({
            ...mockCandidateResponse,
            address: otherAddress,
          });
          mockCrmGateway.updateCandidate = jest.fn().mockResolvedValueOnce(mockCandidateResponse);

          const result = await globalCandidateService.alignCandidateDataInCRM(mockCandidateResponse, mockLicenceNumber);

          expect(result.crmCandidate).toStrictEqual(mockCandidateResponse);
          expect(result.licenceId).toEqual(mockLicenceId);
          expect(mockCrmGateway.updateLicence).toHaveBeenCalledTimes(1);
          expect(mockCrmGateway.updateLicence).toHaveBeenCalledWith(mockLicenceId, mockCandidateId, mockCandidateResponse.address);
          expect(mockCrmGateway.updateCandidate).toHaveBeenCalledTimes(1);
          expect(mockCrmGateway.updateCandidate).toHaveBeenCalledWith(mockCandidateId, mockCandidateResponse);
          expect(mockCrmGateway.createLicence).not.toHaveBeenCalled();
        });

        test('and crmGateway.updateLicence cause errors then error is thrown', async () => {
          mockCrmGateway.getLicenceNumberRecordsByCandidateId = jest.fn().mockResolvedValueOnce({
            ...mockCandidateResponse,
            address: otherAddress,
          });
          mockCrmGateway.updateLicence.mockRejectedValueOnce(expectedError);

          const promise = globalCandidateService.alignCandidateDataInCRM(mockCandidateResponse, mockLicenceNumber);

          await expect(promise).rejects.toEqual(expectedError);
          expect(mockCrmGateway.updateLicence).toHaveBeenCalledTimes(1);
          expect(mockCrmGateway.updateLicence).toHaveBeenCalledWith(mockLicenceId, mockCandidateId, mockCandidateResponse.address);
          expect(mockCrmGateway.updateCandidate).not.toHaveBeenCalled();
          expect(mockCrmGateway.createLicence).not.toHaveBeenCalled();
        });

        test('and crmGateway.updateCandidate cause errors then error is thrown', async () => {
          mockCrmGateway.getLicenceNumberRecordsByCandidateId = jest.fn().mockResolvedValueOnce({
            ...mockCandidateResponse,
            address: otherAddress,
          });
          mockCrmGateway.updateCandidate.mockRejectedValueOnce(expectedError);

          const promise = globalCandidateService.alignCandidateDataInCRM(mockCandidateResponse, mockLicenceNumber);

          await expect(promise).rejects.toEqual(expectedError);
          expect(mockCrmGateway.updateLicence).toHaveBeenCalledTimes(1);
          expect(mockCrmGateway.updateLicence).toHaveBeenCalledWith(mockLicenceId, mockCandidateId, mockCandidateResponse.address);
          expect(mockCrmGateway.updateCandidate).toHaveBeenCalledTimes(1);
          expect(mockCrmGateway.updateCandidate).toHaveBeenCalledWith(mockCandidateId, mockCandidateResponse);
          expect(mockCrmGateway.createLicence).not.toHaveBeenCalled();
        });
      });

      describe('and candidate has to be updated', () => {
        test('then candidate is updated and licence is not', async () => {
          mockCrmGateway.getLicenceNumberRecordsByCandidateId = jest.fn().mockResolvedValueOnce({
            ...mockCandidateResponse,
            surname: 'different one',
          });
          mockCrmGateway.updateCandidate = jest.fn().mockResolvedValueOnce(mockCandidateResponse);

          const result = await globalCandidateService.alignCandidateDataInCRM(mockCandidateResponse, mockLicenceNumber);

          expect(result.crmCandidate).toStrictEqual(mockCandidateResponse);
          expect(result.licenceId).toEqual(mockLicenceId);
          expect(mockCrmGateway.updateLicence).not.toHaveBeenCalled();
          expect(mockCrmGateway.updateCandidate).toHaveBeenCalledTimes(1);
          expect(mockCrmGateway.updateCandidate).toHaveBeenCalledWith(mockCandidateId, mockCandidateResponse);
          expect(mockCrmGateway.createLicence).not.toHaveBeenCalled();
        });

        test('and crmGateway.updateCandidate cause errors then error is thrown', async () => {
          mockCrmGateway.getLicenceNumberRecordsByCandidateId = jest.fn().mockResolvedValueOnce({
            ...mockCandidateResponse,
            surname: 'different one',
          });
          mockCrmGateway.updateCandidate.mockRejectedValueOnce(expectedError);

          const promise = globalCandidateService.alignCandidateDataInCRM(mockCandidateResponse, mockLicenceNumber);

          await expect(promise).rejects.toEqual(expectedError);
          expect(mockCrmGateway.updateLicence).not.toHaveBeenCalled();
          expect(mockCrmGateway.updateCandidate).toHaveBeenCalledTimes(1);
          expect(mockCrmGateway.updateCandidate).toHaveBeenCalledWith(mockCandidateId, mockCandidateResponse);
          expect(mockCrmGateway.createLicence).not.toHaveBeenCalled();
        });
      });
    });

    describe('candidate do not have existing licence in CRM', () => {
      test('then new licence is created and candidate is updated', async () => {
        mockCrmGateway.getLicenceNumberRecordsByCandidateId = jest.fn().mockResolvedValueOnce(undefined);
        mockCrmGateway.createLicence = jest.fn().mockResolvedValueOnce(mockLicenceId);
        mockCrmGateway.updateCandidate = jest.fn().mockResolvedValueOnce(mockCandidateResponse);

        const result = await globalCandidateService.alignCandidateDataInCRM(mockCandidateResponse, mockLicenceNumber);

        expect(result.crmCandidate).toStrictEqual(mockCandidateResponse);
        expect(result.licenceId).toEqual(mockLicenceId);
        expect(mockCrmGateway.createLicence).toHaveBeenCalledTimes(1);
        expect(mockCrmGateway.createLicence).toHaveBeenCalledWith(mockLicenceNumber, mockCandidateResponse.address, mockCandidateId);
        expect(mockCrmGateway.updateCandidate).toHaveBeenCalledTimes(1);
        expect(mockCrmGateway.updateCandidate).toHaveBeenCalledWith(mockCandidateId, mockCandidateResponse);
        expect(mockCrmGateway.updateLicence).not.toHaveBeenCalled();
      });

      test('and crmGateway.createLicence cause errors then error is thrown', async () => {
        mockCrmGateway.getLicenceNumberRecordsByCandidateId = jest.fn().mockResolvedValueOnce(undefined);
        mockCrmGateway.createLicence.mockRejectedValueOnce(expectedError);

        const promise = globalCandidateService.alignCandidateDataInCRM(mockCandidateResponse, mockLicenceNumber);

        await expect(promise).rejects.toEqual(expectedError);
        expect(mockCrmGateway.createLicence).toHaveBeenCalledTimes(1);
        expect(mockCrmGateway.createLicence).toHaveBeenCalledWith(mockLicenceNumber, mockCandidateResponse.address, mockCandidateId);
        expect(mockCrmGateway.updateCandidate).not.toHaveBeenCalled();
        expect(mockCrmGateway.updateLicence).not.toHaveBeenCalled();
      });

      test('and crmGateway.updateCandidate cause errors then error is thrown', async () => {
        mockCrmGateway.getLicenceNumberRecordsByCandidateId = jest.fn().mockResolvedValueOnce(undefined);
        mockCrmGateway.createLicence = jest.fn().mockResolvedValueOnce(mockLicenceId);
        mockCrmGateway.updateCandidate.mockRejectedValueOnce(expectedError);

        const promise = globalCandidateService.alignCandidateDataInCRM(mockCandidateResponse, mockLicenceNumber);

        await expect(promise).rejects.toEqual(expectedError);
        expect(mockCrmGateway.createLicence).toHaveBeenCalledTimes(1);
        expect(mockCrmGateway.createLicence).toHaveBeenCalledWith(mockLicenceNumber, mockCandidateResponse.address, mockCandidateId);
        expect(mockCrmGateway.updateCandidate).toHaveBeenCalledTimes(1);
        expect(mockCrmGateway.updateCandidate).toHaveBeenCalledWith(mockCandidateId, mockCandidateResponse);
        expect(mockCrmGateway.updateLicence).not.toHaveBeenCalled();
      });
    });
  });

  describe('isDrivingLicenceValid', () => {
    test('valid driving licence returns true', () => {
      const result = CandidateService.isDrivingLicenceValid('JONES061102W97YT', meta as any as Meta);

      expect(result).toStrictEqual(true);
    });

    test('valid NI driving licence returns true', () => {
      const customMeta = {
        ...meta,
      };
      customMeta.req.res.locals.target = Target.NI;
      customMeta.req.res.locals.locale = Locale.NI;

      const result = CandidateService.isDrivingLicenceValid('69062660', customMeta as any as Meta);

      expect(result).toStrictEqual(true);
    });

    test('valid driving licence with spaces returns true', () => {
      const result = CandidateService.isDrivingLicenceValid('JONE S061102W9 7YT', meta as any as Meta);

      expect(result).toStrictEqual(true);
    });

    test('valid driving licence with lowercase returns true', () => {
      const result = CandidateService.isDrivingLicenceValid('joNes061102W97yt', meta as any as Meta);

      expect(result).toStrictEqual(true);
    });

    test('incorrect format driving licences are not valid', () => {
      expect(() => CandidateService.isDrivingLicenceValid('JONES06110', meta as any as Meta))
        .toThrow(new Error('Driving Licence Number is invalid'));

      expect(logger.debug).toHaveBeenCalledWith('CandidateService::isDrivingLicenceValid: Driving Licence Number is invalid', {
        target: Target.GB,
        locale: Locale.GB,
        message: 'not a valid GB or NI licence number',
        licenceNumberLength: 10,
      });
    });

    test('incorrect format driving licences are not valid - NI only', () => {
      const customMeta = {
        ...meta,
      };
      customMeta.req.res.locals.target = Target.NI;
      customMeta.req.res.locals.locale = Locale.NI;

      expect(() => CandidateService.isDrivingLicenceValid('69062', customMeta as any as Meta))
        .toThrow(new Error('Driving Licence Number is invalid'));

      expect(logger.debug).toHaveBeenCalledWith('CandidateService::isDrivingLicenceValid: Driving Licence Number is invalid', {
        target: Target.NI,
        locale: Locale.NI,
        message: 'not a valid NI licence number',
        licenceNumberLength: 5,
      });
    });

    test('blank driving licences are not valid', () => {
      expect(() => CandidateService.isDrivingLicenceValid('', meta as any as Meta))
        .toThrow(new Error('Driving Licence Number is empty'));
    });

    test('blank driving licences with spaces are not valid', () => {
      expect(() => CandidateService.isDrivingLicenceValid('  ', meta as any as Meta))
        .toThrow(new Error('Driving Licence Number is empty'));
    });
  });

  describe('doesCandidateMatchEligibility', () => {
    test('valid candidate details is eligible', () => {
      const result = globalCandidateService.doesCandidateMatchEligibility(candidateDetails, mockCandidateResponse, Target.GB, Locale.GB);

      expect(result).toStrictEqual(true);
    });

    test('valid candidate details is eligible if first name is empty', () => {
      const candidateDetailsInput = {
        ...candidateDetails,
        firstnames: '',
      };

      const eligibilityResponseInput = {
        ...mockCandidateResponse,
        firstnames: '---',
      };

      const result = globalCandidateService.doesCandidateMatchEligibility(candidateDetailsInput, eligibilityResponseInput, Target.GB, Locale.GB);

      expect(result).toStrictEqual(true);
    });

    test('valid candidate details is eligible if first name is hyphen', () => {
      const candidateDetailsInput = {
        ...candidateDetails,
        firstnames: '-',
      };

      const eligibilityResponseInput = {
        ...mockCandidateResponse,
        firstnames: '---',
      };

      const result = globalCandidateService.doesCandidateMatchEligibility(candidateDetailsInput, eligibilityResponseInput, Target.GB, Locale.GB);

      expect(result).toStrictEqual(true);
    });

    test('valid instructor candidate details is eligible', () => {
      const insutrctorCandidateDetails = {
        ...candidateDetails,
        personalReference: mockPrn,
      };

      const result = globalCandidateService.doesCandidateMatchEligibility(insutrctorCandidateDetails, mockCandidateResponse, Target.GB, Locale.GB, true);

      expect(result).toStrictEqual(true);
    });

    test('valid NI instructor candidate details is eligible', () => {
      const instructorCandidateDetails = {
        ...candidateDetails,
        personalReference: 'mock-receipt-number',
      };

      const result = globalCandidateService.doesCandidateMatchEligibility(instructorCandidateDetails, mockCandidateResponse, Target.NI, Locale.NI, true);

      expect(result).toStrictEqual(true);
    });

    test('firstnames not matching is invalid', () => {
      expect.assertions(1);
      const fieldError = new Error('First name did not match eligibility response');

      const candidateDetailsInput = {
        ...candidateDetails,
        firstnames: 'diff firstname',
      };

      try {
        globalCandidateService.doesCandidateMatchEligibility(candidateDetailsInput, mockCandidateResponse, Target.GB, Locale.GB);
      } catch (error) {
        expect((error as MultipleCandidateMismatchError).errors).toStrictEqual([fieldError]);
      }
    });

    test('surname not matching is invalid', () => {
      expect.assertions(1);
      const fieldError = new Error('Surname did not match eligibility response');
      const candidateDetailsInput = {
        ...candidateDetails,
        surname: 'different surname',
      };

      try {
        globalCandidateService.doesCandidateMatchEligibility(candidateDetailsInput, mockCandidateResponse, Target.GB, Locale.GB);
      } catch (error) {
        expect((error as MultipleCandidateMismatchError).errors).toStrictEqual([fieldError]);
      }
    });

    test('DOB day not matching is invalid', () => {
      expect.assertions(1);
      const fieldError = new Error('Date of birth did not match eligibility response');
      const candidateDetailsInput = {
        ...candidateDetails,
        dobDay: '8',
      };

      try {
        globalCandidateService.doesCandidateMatchEligibility(candidateDetailsInput, mockCandidateResponse, Target.GB, Locale.GB);
      } catch (error) {
        expect((error as MultipleCandidateMismatchError).errors).toStrictEqual([fieldError]);
      }
    });

    test('DOB month not matching is invalid', () => {
      expect.assertions(1);
      const fieldError = new Error('Date of birth did not match eligibility response');
      const candidateDetailsInput = {
        ...candidateDetails,
        dobMonth: '5',
      };

      try {
        globalCandidateService.doesCandidateMatchEligibility(candidateDetailsInput, mockCandidateResponse, Target.GB, Locale.GB);
      } catch (error) {
        expect((error as MultipleCandidateMismatchError).errors).toStrictEqual([fieldError]);
      }
    });

    test('DOB year not matching is invalid', () => {
      expect.assertions(1);
      const fieldError = new Error('Date of birth did not match eligibility response');
      const candidateDetailsInput = {
        ...candidateDetails,
        dobYear: '2010',
      };

      try {
        globalCandidateService.doesCandidateMatchEligibility(candidateDetailsInput, mockCandidateResponse, Target.GB, Locale.GB);
      } catch (error) {
        expect((error as MultipleCandidateMismatchError).errors).toStrictEqual([fieldError]);
      }
    });

    test('PRN not matching is invalid', () => {
      expect.assertions(1);
      const fieldError = new Error('Instructor PRN did not match eligibility response');
      const candidateDetailsInput = {
        ...candidateDetails,
        personalReference: '7424',
      };

      try {
        globalCandidateService.doesCandidateMatchEligibility(candidateDetailsInput, mockCandidateResponse, Target.GB, Locale.GB, true);
      } catch (error) {
        expect((error as MultipleCandidateMismatchError).errors).toStrictEqual([fieldError]);
      }
    });
  });

  describe('createOrUpdateCandidate', () => {
    describe('creating a candidate', () => {
      test('creates candidate in CRM', async () => {
        const eligibilityResponse = {
          ...mockCandidateResponse,
          candidateId: undefined,
        };
        const newCandidateId = 'newCandidateId';
        const newLicenceId = 'newLicenceId';
        mockCrmGateway.createCandidate.mockResolvedValue(newCandidateId);
        mockCrmGateway.createLicence.mockResolvedValue(newLicenceId);

        const result = await globalCandidateService.createOrUpdateCandidate(eligibilityResponse, mockLicenceNumber);

        expect(result).toStrictEqual({
          ...eligibilityResponse,
          candidateId: newCandidateId,
          licenceId: newLicenceId,
        });
      });

      test('throws error if CRM call fails to create candidate in CRM', async () => {
        const eligibilityResponse = {
          ...mockCandidateResponse,
          candidateId: undefined,
        };
        const error = new Error('crm error');
        mockCrmGateway.createCandidate.mockRejectedValue(error);

        await expect(globalCandidateService.createOrUpdateCandidate(eligibilityResponse, mockLicenceNumber))
          .rejects.toThrow(error);
      });

      test('throws error if CRM call fails to create licence in CRM', async () => {
        const eligibilityResponse = {
          ...mockCandidateResponse,
          candidateId: undefined,
        };
        const error = new Error('crm error');
        mockCrmGateway.createLicence.mockRejectedValue(error);

        await expect(globalCandidateService.createOrUpdateCandidate(eligibilityResponse, mockLicenceNumber))
          .rejects.toThrow(error);
      });
    });

    describe('retrieving a candidate', () => {
      test('if candidate exists in CRM, align candidate details', async () => {
        const eligibilityResponse = {
          ...mockCandidateResponse,
        };
        jest.spyOn(globalCandidateService, 'alignCandidateDataInCRM').mockResolvedValue({
          licenceId: mockLicenceId,
          crmCandidate: mockSessionCandidate(),
        });

        const result = await globalCandidateService.createOrUpdateCandidate(eligibilityResponse, mockLicenceNumber);

        expect(result).toStrictEqual({
          ...eligibilityResponse,
          licenceId: mockLicenceId,
        });
      });

      test('throw error if align candidate details fails', async () => {
        const eligibilityResponse = {
          ...mockCandidateResponse,
        };
        const error = new Error('crm error');
        jest.spyOn(globalCandidateService, 'alignCandidateDataInCRM').mockRejectedValue(error);

        await expect(globalCandidateService.createOrUpdateCandidate(eligibilityResponse, mockLicenceNumber))
          .rejects.toThrow(error);
      });
    });
  });

  describe('getEligibility', () => {
    test('calls eligbility api with details', async () => {
      mockEligibilityGateway.getEligibility.mockResolvedValue(mockCandidateResponse);
      const updateCandidateMock = jest.spyOn(globalCandidateService, 'createOrUpdateCandidate').mockResolvedValue(mockCandidateResponse);

      const result = await globalCandidateService.getEligibility(mockLicenceNumber, candidateDetails, Target.GB, Locale.GB);

      expect(result).toStrictEqual(mockCandidateResponse);
      expect(updateCandidateMock).toHaveBeenCalledWith(mockCandidateResponse, mockLicenceNumber);
    });

    test('throws EligibilityLicenceNotFoundError if licence is not found', async () => {
      const error = new EligibilityLicenceNotFoundError();
      mockEligibilityGateway.getEligibility.mockRejectedValue(error);

      await expect(globalCandidateService.getEligibility(mockLicenceNumber, candidateDetails, Target.GB, Locale.GB))
        .rejects.toThrow(error);
    });

    test('throws EligbilityCandidateMismatchError if candidate does not match eligibility response', async () => {
      jest.spyOn(globalCandidateService, 'doesCandidateMatchEligibility').mockReturnValue(false);

      mockEligibilityGateway.getEligibility.mockResolvedValue(mockCandidateResponse);

      await expect(globalCandidateService.getEligibility(mockLicenceNumber, candidateDetails, Target.GB, Locale.GB))
        .rejects.toThrow(EligbilityCandidateMismatchError);
    });

    test('if the call to create or update candidate in CRM fails, throw CrmCreateUpdateCandidateError', async () => {
      const error = new CrmCreateUpdateCandidateError();
      mockEligibilityGateway.getEligibility.mockResolvedValue(mockCandidateResponse);
      jest.spyOn(globalCandidateService, 'createOrUpdateCandidate').mockRejectedValue(error);

      await expect(globalCandidateService.getEligibility(mockLicenceNumber, candidateDetails, Target.GB, Locale.GB))
        .rejects.toThrow(error);
    });
  });

  describe('getManageBookingEligibility', () => {
    test('calls eligbility api with details', async () => {
      mockEligibilityGateway.getEligibility.mockResolvedValue(mockCandidateResponse);

      const result = await globalCandidateService.getManageBookingEligibility(mockLicenceNumber, Target.GB, Locale.GB);

      expect(result).toStrictEqual(mockCandidateResponse);
      expect(mockEligibilityGateway.getEligibility).toHaveBeenCalledWith('JONES061102W97YT', true, Target.GB, Locale.GB);
    });

    test('throws EligibilityLicenceNotFoundError if licence is not found', async () => {
      const error = new EligibilityLicenceNotFoundError();
      mockEligibilityGateway.getEligibility.mockRejectedValue(error);

      await expect(globalCandidateService.getManageBookingEligibility(mockLicenceNumber, Target.GB, Locale.GB))
        .rejects.toThrow(error);
    });
  });

  describe('checkAgencyMatchesTarget', () => {
    test('returns true if dvsa agency matches gb target', () => {
      expect(() => CandidateService.checkAgencyMatchesTarget(CRMGovernmentAgency.Dvsa, Target.GB)).not.toThrow();
    });

    test('returns true if dva agency matches ni target', () => {
      expect(() => CandidateService.checkAgencyMatchesTarget(CRMGovernmentAgency.Dva, Target.NI)).not.toThrow();
    });

    test('throws agency mismatch error if dvsa agency booking used for ni target', () => {
      expect(() => CandidateService.checkAgencyMatchesTarget(CRMGovernmentAgency.Dvsa, Target.NI))
        .toThrow(new AgencyMismatchError());
    });

    test('throws agency mismatch error if dva agency booking used for gb target', () => {
      expect(() => CandidateService.checkAgencyMatchesTarget(CRMGovernmentAgency.Dva, Target.GB))
        .toThrow(new AgencyMismatchError());
    });
  });

  describe('replaceFirstnameWithThreeDashesIfEmptyGB', () => {
    test('returns dash if firstname is empty and target is GB', () => {
      expect(globalCandidateService.replaceFirstnameWithThreeDashesIfEmptyGB(Target.GB, '')).toStrictEqual('---');
    });

    test('returns three dashes if firstname is dash and target is GB', () => {
      expect(globalCandidateService.replaceFirstnameWithThreeDashesIfEmptyGB(Target.GB, '-')).toStrictEqual('---');
    });

    test('returns firstname unchanged if it is not empty', () => {
      expect(globalCandidateService.replaceFirstnameWithThreeDashesIfEmptyGB(Target.GB, 'Wendy')).toStrictEqual('Wendy');
    });

    test('returns firstname as dash if firstname contains only spaces and target is GB', () => {
      expect(globalCandidateService.replaceFirstnameWithThreeDashesIfEmptyGB(Target.GB, '   ')).toStrictEqual('---');
    });

    test('returns firstname unchanged if target is not GB', () => {
      expect(globalCandidateService.replaceFirstnameWithThreeDashesIfEmptyGB(Target.NI, 'Mark')).toStrictEqual('Mark');
    });

    test('returns firstname as it is if firstname is empty and target is not GB', () => {
      expect(globalCandidateService.replaceFirstnameWithThreeDashesIfEmptyGB(Target.NI, '')).toStrictEqual('');
    });
  });
});
