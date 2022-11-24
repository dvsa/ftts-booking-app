import { Response } from 'express';
import { Cookie } from '@azure/functions';
import { serialize } from 'cookie';
import { setCookieHeader, createAzureCookie } from '../../../src/helpers/cookie-helper';

describe('setCookieHeader', () => {
  let res: Response;

  beforeEach(() => {
    res = {
      getHeader: jest.fn(),
      setHeader: jest.fn(),
    } as unknown as Response;
  });

  test('WHEN Set-Cookie header is undefiend THEN cookie should be added successfully', () => {
    res.getHeader = jest.fn().mockReturnValue(undefined);
    setCookieHeader(res, 'ftts', 'abc', {});
    expect(res.setHeader).toHaveBeenCalledWith('Set-Cookie', ['ftts=abc']);
  });

  test('WHEN Set-Cookie header is a string THEN new cookie should be added successfully', () => {
    res.getHeader = jest.fn().mockReturnValue('string-cookie=true');
    setCookieHeader(res, 'ftts', 'abc', {});
    expect(res.setHeader).toHaveBeenCalledWith('Set-Cookie', ['string-cookie=true', 'ftts=abc']);
  });

  test('WHEN Set-Cookie header is an Array THEN new cookie should be added successfully', () => {
    res.getHeader = jest.fn().mockReturnValue(['array-cookie=true']);
    setCookieHeader(res, 'ftts', 'abc', {});
    expect(res.setHeader).toHaveBeenCalledWith('Set-Cookie', ['array-cookie=true', 'ftts=abc']);
  });
});

describe('createAzureCookie', () => {
  test('WHEN creating a cookie with only required values THEN a new Azure Cookie should be created', () => {
    const cookieString = serialize('name', 'value', {});

    expect(createAzureCookie(cookieString)).toStrictEqual({
      name: 'name',
      value: 'value',
      domain: undefined,
      path: undefined,
      expires: undefined,
      maxAge: undefined,
      httpOnly: false,
      secure: false,
      sameSite: undefined,
    } as Cookie);
  });

  test('WHEN creating a cookie with all values defined THEN a new Azure Cookie should be created', () => {
    const expiryDate = new Date('fri, 26 nov 2021 11:41:01 gmt');

    const cookieString = serialize('name', 'value', {
      domain: '/',
      expires: expiryDate,
      httpOnly: true,
      maxAge: 500,
      path: '/',
      sameSite: 'strict',
      secure: true,
    });

    expect(createAzureCookie(cookieString)).toStrictEqual({
      name: 'name',
      value: 'value',
      domain: '/',
      path: '/',
      expires: expiryDate,
      maxAge: 500,
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    } as Cookie);
  });

  test('WHEN creating a cookie with all values defined using mixed case keys THEN a new Azure Cookie should be created', () => {
    const cookieString = 'name=value; max-Age=500; DOmaiN=/; PAth=/; expires=Fri, 26 Nov 2021 11:41:01 GMT; httponly; SECURE; SameSite=Strict';

    expect(createAzureCookie(cookieString)).toStrictEqual({
      name: 'name',
      value: 'value',
      domain: '/',
      path: '/',
      expires: new Date('Fri, 26 Nov 2021 11:41:01 GMT'),
      maxAge: 500,
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    } as Cookie);
  });
});
