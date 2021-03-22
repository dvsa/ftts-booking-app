import router from '../../src/routes';

jest.mock('../../src/libraries/ftts-session', () => jest.fn((req, res, next) => next()));

describe('Routes', () => {
  test('Home', () => {
    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/', methods: { get: true } }),
    })]));
  });

  test('Choose Support', () => {
    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/choose-support', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/choose-support', methods: { post: true } }),
    })]));
  });

  test('Voiceover', () => {
    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/voiceover', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/voiceover', methods: { post: true } }),
    })]));
  });

  test('Candidate Details', () => {
    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/candidate-details', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/candidate-details', methods: { post: true } }),
    })]));
  });

  test('Contact Details', () => {
    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/contact-details', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/contact-details', methods: { post: true } }),
    })]));
  });

  test('Test type', () => {
    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/test-type', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/test-type', methods: { post: true } }),
    })]));
  });

  test('Test Language', () => {
    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/test-language', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/test-language', methods: { post: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/test-language', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/test-language', methods: { post: true } }),
    })]));
  });

  test('Finding a test centre', () => {
    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/find-test-centre', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/find-test-centre', methods: { post: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/select-test-centre', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/select-test-centre', methods: { post: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/select-date', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/select-date', methods: { post: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/choose-appointment', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/choose-appointment', methods: { post: true } }),
    })]));
  });

  test('Finalise booking', () => {
    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/check-your-answers', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/check-your-answers', methods: { post: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/change-location-time', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/change-location-time', methods: { post: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/change-voiceover', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/contact-details', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/contact-details', methods: { post: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/payment-confirmation', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/booking-confirmation', methods: { get: true } }),
    })]));
  });

  test('Manage bookings', () => {
    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/login', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/login', methods: { post: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/home', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-change-location-time/:ref', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-change-location-time/:ref', methods: { post: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/choose-appointment', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/choose-appointment', methods: { post: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/select-date', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/select-date', methods: { post: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/find-test-centre', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/find-test-centre', methods: { post: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/select-test-centre', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/select-test-centre', methods: { post: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/check-change', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/check-change', methods: { post: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/check-change/reset', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/test-language', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/test-language', methods: { post: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/voiceover', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/voiceover', methods: { post: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/bsl', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/bsl', methods: { post: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/:ref', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/:ref/cancel', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/:ref/cancel', methods: { post: true } }),
    })]));
  });

  test('British Sign Language', () => {
    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/bsl', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/bsl', methods: { post: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/bsl', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/manage-booking/bsl', methods: { post: true } }),
    })]));
  });

  test('Leaving NSA', () => {
    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/leaving-nsa', methods: { get: true } }),
    })]));
  });

  test('Staying NSA', () => {
    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/staying-nsa', methods: { get: true } }),
    })]));
  });

  test('Select support type', () => {
    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/select-support-type', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/select-support-type', methods: { post: true } }),
    })]));
  });

  test('Custom support', () => {
    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/custom-support', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/custom-support', methods: { post: true } }),
    })]));
  });

  test('Telephone contact', () => {
    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/telephone-contact', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/telephone-contact', methods: { post: true } }),
    })]));
  });

  test('Voicemail', () => {
    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/voicemail', methods: { get: true } }),
    })]));
    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/voicemail', methods: { post: true } }),
    })]));
  });

  test('Preferred Day NSA', () => {
    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/preferred-day', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/preferred-day', methods: { post: true } }),
    })]));
  });

  test('Preferred Location NSA', () => {
    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/preferred-location', methods: { get: true } }),
    })]));

    expect(router.stack).toEqual(expect.arrayContaining([expect.objectContaining({
      route: expect.objectContaining({ path: '/preferred-location', methods: { post: true } }),
    })]));
  });
});
