import { Cookie } from '@azure/functions';
import { Response } from 'express';
import { serialize, CookieSerializeOptions, parse } from 'cookie';

type ParsedCookie = {
  [key: string]: string;
};

type SameSiteHeader = 'Strict' | 'Lax' | 'None' | undefined;

const setCookieHeader = (res: Response, cookieName: string, cookieValue: string, cookieOptions: CookieSerializeOptions): void => {
  // Create Cookie
  const cookie = serialize(cookieName, cookieValue, cookieOptions);

  // Get current 'Set Cookie' Header and amend it
  const previous: string | string[] = res.getHeader('Set-Cookie') as string | string[] || [];
  const header = Array.isArray(previous) ? previous.concat(cookie) : [previous, cookie];

  res.setHeader('Set-Cookie', header);
};

const createAzureCookie = (cookieString: string): Cookie => {
  const parsedCookie = parse((cookieString));

  // Required Fields
  const name = Object.keys(parsedCookie)[0];
  const value = Object.values(parsedCookie)[0];

  // Optional Fields
  const domain = getValueFromParsedCookie(parsedCookie, 'domain');
  const path = getValueFromParsedCookie(parsedCookie, 'path');

  const expiryDateString = getValueFromParsedCookie(parsedCookie, 'expires');
  const expires = expiryDateString ? new Date(expiryDateString) : undefined;

  const maxAgeString = getValueFromParsedCookie(parsedCookie, 'max-age');
  const maxAge = maxAgeString ? Number(maxAgeString) : undefined;

  const sameSite = getValueFromParsedCookie(parsedCookie, 'samesite') as SameSiteHeader;

  const secure = cookieString.toLowerCase().includes('secure');
  const httpOnly = cookieString.toLowerCase().includes('httponly');

  return {
    name,
    value,
    domain,
    path,
    expires,
    maxAge,
    sameSite,
    httpOnly,
    secure,
  };
};

const getValueFromParsedCookie = (parsedCookie: ParsedCookie, searchTerm: string): string | undefined => {
  const validKey = Object.keys(parsedCookie).find((key) => (key.toLowerCase() === searchTerm.toLowerCase()));
  return validKey ? parsedCookie[`${validKey}`] : undefined;
};

export {
  setCookieHeader,
  createAzureCookie,
};
