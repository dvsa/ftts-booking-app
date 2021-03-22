import { Centre } from '../domain/types';
import { AppointmentSlot } from '../domain/slot';
import { TCNRegion } from '../domain/enums';

const mockCentres: Centre[] = [
  {
    name: 'MOCKED_DATA Swansea',
    parentOrganisation: 'fde8157f-e156-ea11-a811-000d3a7f128d',
    status: 'ACTIVE',
    region: TCNRegion.A,
    state: 'gb',
    siteId: 'Site042',
    description: 'Rerum architecto iste illum hic ea unde consequatur repellendus et. Ut quo suscipit vel laboriosam accusantium exercitationem quam neque. Illo est facilis accusamus dolore. Laboriosam et dicta quasi et eum atque. At quas vel deserunt distinctio. Id labore eum.',
    accessible: 'Disabled access',
    fullyAccessible: true,
    addressLine1: '2nd Floor, Grove House',
    addressLine2: '3 Grove Place',
    addressCity: 'Swansea',
    addressCounty: 'Swansea',
    addressPostalCode: 'SA1 5DF',
    addressCountryRegion: 'Swansea United Kingdom',
    latitude: 51.62253,
    longitude: -3.94486,
    distance: 0.09159180013642236,
    testCentreId: '0001:Site042',
    accountId: '7af87723-95bd-4efd-9a62-4c76642855af',
    remit: 675030000,
  },
  {
    name: 'MOCKED_DATA Bridgend',
    parentOrganisation: 'fde8157f-e156-ea11-a811-000d3a7f128d',
    status: 'ACTIVE',
    region: TCNRegion.A,
    state: 'gb',
    siteId: 'Site024',
    description: 'Quae aut labore porro consectetur possimus ut voluptas ut. Libero qui magnam aut inventore voluptatem sed quia a. Voluptas delectus vel eos consequatur debitis nam minima. Architecto et voluptatem omnis pariatur et repudiandae culpa.',
    accessible: 'Disabled access',
    fullyAccessible: true,
    addressLine1: 'Brackla House',
    addressLine2: 'Brackla Street',
    addressCity: 'Bridgend',
    addressCounty: 'Bridgend County Borough',
    addressPostalCode: 'CF31 1BZ',
    addressCountryRegion: 'Bridgend County Borough United Kingdom',
    latitude: 51.50499,
    longitude: -3.57513,
    distance: 17.76159949409835,
    testCentreId: '0001:Site024',
    accountId: 'a5043e9e-0cbb-4be0-9885-23a5a8f37814',
    remit: 675030000,

  },
  {
    name: 'MOCKED_DATA Merthyr Tydfill',
    parentOrganisation: 'c5a24e76-1c5d-ea11-a811-000d3a7f128d',
    status: 'ACTIVE',
    region: TCNRegion.A,
    state: 'gb',
    siteId: 'Site107',
    description: 'Eos libero delectus numquam aliquid mollitia non. Quasi temporibus vel tempora ratione ex dolorum provident. Perferendis debitis et non excepturi iste maxime magni qui ab. Sit quia aut aperiam non sapiente debitis cumque sunt nihil. Doloremque enim magni. Optio sequi laborum voluptatem minima est debitis voluptatem dicta.',
    accessible: 'Disabled access',
    fullyAccessible: true,
    addressLine1: '1st Floor, Castle House',
    addressLine2: 'Glebeland Street',
    addressCity: 'Merthyr Tydfill',
    addressCounty: 'Merthyr Tydfil County Borough',
    addressPostalCode: 'CF47 8AT',
    addressCountryRegion: 'Merthyr Tydfil County Borough United Kingdom',
    latitude: 51.74678,
    longitude: -3.37922,
    distance: 25.690793960987378,
    testCentreId: '0001:Site107',
    accountId: 'b6165cf0-e0d3-4ff4-b746-080174bb3053',
    remit: 675030000,
  },
  {
    name: 'MOCKED_DATA Cardiff',
    parentOrganisation: 'fde8157f-e156-ea11-a811-000d3a7f128d',
    status: 'ACTIVE',
    region: TCNRegion.A,
    state: 'gb',
    siteId: 'Site031',
    description: 'Molestiae dolore sapiente ipsum praesentium amet sint. Inventore earum commodi voluptatem dolore minima maxime minus omnis.',
    accessible: 'Disabled access',
    fullyAccessible: false,
    addressLine1: '3rd Floor, Limerick House',
    addressLine2: '23 Churchill Way',
    addressCity: 'Cardiff',
    addressCounty: 'Cardiff',
    addressPostalCode: 'CF10 2HE',
    addressCountryRegion: 'Cardiff United Kingdom',
    latitude: 51.48165,
    longitude: -3.17212,
    distance: 34.53620034998522,
    testCentreId: '0001:Site031',
    accountId: 'c60bc9aa-b9c1-4f05-9c67-f6220a0090b3',
    remit: 675030000,
  },
  {
    name: 'MOCKED_DATA Barnstaple',
    parentOrganisation: 'fde8157f-e156-ea11-a811-000d3a7f128d',
    status: 'ACTIVE',
    region: TCNRegion.A,
    state: 'gb',
    siteId: 'Site097',
    description: 'Autem nobis eum. Hic quaerat ab eaque.',
    accessible: 'Disabled access',
    fullyAccessible: true,
    addressLine1: 'Units 1 and 4, Riverside Court Offices',
    addressLine2: 'Castle Street',
    addressCity: 'Barnstaple',
    addressCounty: 'Devon',
    addressPostalCode: 'EX31 1DR',
    addressCountryRegion: 'Devon United Kingdom',
    latitude: 51.07979,
    longitude: -4.06238,
    distance: 37.78535976013762,
    testCentreId: '0001:Site097',
    accountId: '58c535d5-f51c-4a18-891e-04f44a0f76aa',
    remit: 675030000,
  },
];

const mockSlots: AppointmentSlot[] = [
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T09:00:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T09:15:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T09:30:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T09:45:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T10:00:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T10:15:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T10:30:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T10:45:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T11:00:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T11:15:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T11:30:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T11:45:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T12:00:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T12:15:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T12:30:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T12:45:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T13:15:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T13:30:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T13:45:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T14:00:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T14:15:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T14:30:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T14:45:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T15:00:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T15:15:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T15:30:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T15:45:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T16:00:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T16:15:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T16:30:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T17:00:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T17:15:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T17:30:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-16T17:45:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T09:00:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T09:15:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T09:30:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T09:45:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T10:00:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T10:30:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T11:00:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T11:15:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T11:30:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T11:45:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T12:00:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T12:15:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T12:30:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T12:45:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T13:00:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T13:15:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T13:45:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T14:00:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T14:15:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T14:45:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T15:00:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T15:15:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T15:30:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T15:45:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T16:15:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T16:30:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T16:45:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T17:00:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T17:15:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T17:30:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-17T17:45:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-19T09:00:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-19T09:30:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-19T09:45:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-19T10:00:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-19T10:15:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-19T10:30:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-19T10:45:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-19T11:00:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-19T11:15:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-19T12:45:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-19T13:15:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-19T14:00:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-19T14:30:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-19T15:30:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-19T16:00:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-19T16:15:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-19T17:45:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T09:00:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T09:15:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T09:30:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T09:45:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T10:00:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T10:15:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T10:30:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T10:45:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T11:00:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T11:15:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T11:30:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T11:45:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T12:00:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T12:15:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T12:30:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T12:45:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T13:00:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T13:15:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T13:30:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T13:45:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T14:00:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T14:15:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T14:30:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T14:45:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T15:00:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T15:15:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T15:30:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T15:45:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T16:00:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T16:15:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T16:30:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T16:45:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T17:00:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T17:15:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T17:30:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-20T17:45:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T09:15:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T09:30:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T09:45:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T10:15:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T10:30:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T10:45:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T11:15:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T11:30:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T11:45:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T12:00:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T12:30:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T12:45:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T13:00:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T13:15:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T13:30:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T14:00:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T14:15:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T14:30:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T14:45:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T15:00:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T15:15:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T15:45:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T16:00:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T16:15:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T16:45:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T17:00:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T17:15:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2020-11-21T17:45:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T09:00:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T09:15:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T09:30:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T09:45:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T10:00:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T10:15:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T10:30:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T10:45:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T11:00:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T11:15:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T11:30:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T11:45:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T12:00:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T12:15:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T12:30:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T12:45:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T13:00:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T13:15:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T13:30:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T13:45:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T14:00:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T14:15:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T14:30:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T14:45:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T15:00:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T15:15:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T15:30:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T15:45:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T16:00:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T16:15:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T16:30:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T16:45:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T17:00:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T17:15:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T17:30:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-01T17:45:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-02T09:30:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-02T10:30:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-02T12:00:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-02T14:45:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-02T15:15:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-02T16:15:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-04T09:15:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-04T09:30:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-04T09:45:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-04T11:15:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-04T13:45:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-04T14:45:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-04T15:00:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-04T15:30:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-04T16:45:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-04T17:00:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-04T17:45:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-05T09:00:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-05T10:00:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-05T11:00:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-05T12:00:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-05T14:00:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-05T14:15:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-05T14:45:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-05T17:15:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-07T09:30:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-07T11:00:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-07T12:45:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-07T13:00:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-07T14:30:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-07T15:45:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-07T17:45:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T09:00:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T09:15:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T09:30:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T09:45:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T10:00:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T10:15:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T10:30:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T10:45:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T11:00:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T11:15:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T11:30:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T11:45:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T12:00:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T12:15:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T12:30:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T12:45:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T13:00:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T13:15:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T13:30:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T13:45:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T14:00:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T14:15:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T14:30:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T14:45:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T15:00:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T15:15:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T15:30:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T15:45:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T16:00:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T16:15:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T16:30:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T16:45:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T17:00:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T17:15:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T17:30:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-08T17:45:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-09T09:30:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-09T09:45:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-09T10:00:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-09T10:15:00.000Z',
    quantity: 1,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-09T10:30:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-09T10:45:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-09T11:00:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-09T11:15:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-09T11:45:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-09T12:30:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-09T14:00:00.000Z',
    quantity: 5,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-09T15:00:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-09T15:45:00.000Z',
    quantity: 2,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-09T16:15:00.000Z',
    quantity: 4,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-09T17:30:00.000Z',
    quantity: 3,
  },
  {
    testCentreId: '0001:SITE-0207',
    testTypes: [
      'CAR',
    ],
    startDateTime: '2021-01-09T17:45:00.000Z',
    quantity: 1,
  },
];

export {
  mockCentres,
  mockSlots,
};
