import { BookingResponse, BookingRequest, BookingFullResponse } from '../../../src/domain/booking/types';

const listPayload = [{
  testCentreId: '123',
  testTypes: [
    'CAR',
  ],
  startDateTime: '2020-06-29T08:15:00.000Z',
  quantity: 1,
},
{
  testCentreId: '123',
  testTypes: [
    'CAR',
  ],
  startDateTime: '2020-06-29T10:15:00.000Z',
  quantity: 5,
},
{
  testCentreId: '123',
  testTypes: [
    'CAR',
  ],
  startDateTime: '2020-06-29T11:45:00.000Z',
  quantity: 2,
},
{
  testCentreId: '123',
  testTypes: [
    'CAR',
  ],
  startDateTime: '2020-06-29T12:15:00.000Z',
  quantity: 4,
},
{
  testCentreId: '123',
  testTypes: [
    'CAR',
  ],
  startDateTime: '2020-06-29T14:15:00.000Z',
  quantity: 5,
},
{
  testCentreId: '123',
  testTypes: [
    'CAR',
  ],
  startDateTime: '2020-06-30T08:00:00.000Z',
  quantity: 5,
}];

export {
  listPayload,
};

export const BookingRequestMock: BookingRequest[] = [
  {
    bookingReferenceId: '1234567890',
    reservationId: '123456-789',
    behaviouralMarkers: '',
    notes: '',
  },
  {
    bookingReferenceId: '0987654321',
    reservationId: '123456-987',
    behaviouralMarkers: '',
    notes: '',
  },
];

export const BookingResponseMock: BookingResponse[] = [
  {
    reservationId: '123456-789',
    message: 'Success',
    status: '200',
  },
  {
    reservationId: '123456-987',
    message: 'Success',
    status: '200',
  },
];

export const BookingResponseFullMock: BookingFullResponse = {
  bookingReferenceId: '123456-789',
  reservationId: '123456',
  testCentreId: '9876543',
  startDateTime: '020-06-29T11:45:00.000Z',
  testTypes: ['Car'],
  notes: '',
  behaviouralMarkers: '',
};
