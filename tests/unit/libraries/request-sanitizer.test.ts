import { stringToArray, xssSanitise } from '../../../src/libraries/request-sanitizer';

describe('Request custom sanitizer', () => {
  describe('stringToArray', () => {
    test('sanitizes string to an array with given string', () => {
      const sanitizedValue = stringToArray('someString');
      expect(sanitizedValue).toStrictEqual(['someString']);
    });

    test('passes on value already an array', () => {
      const stringArr = ['string'];
      const sanitizedValue = stringToArray(stringArr);
      expect(sanitizedValue).toStrictEqual(stringArr);
    });

    test('none string or array types returns empty array', () => {
      const sanitizedValue = stringToArray(123345);
      expect(sanitizedValue).toStrictEqual([]);
    });
  });

  describe('xssSanitise', () => {
    test('sanitises string containing only allowed characters', () => {
      const searchQuery = '23 Four Oaks House, Birmingham, B15 1TT';
      const sanitizedValue = xssSanitise(searchQuery);
      expect(sanitizedValue).toStrictEqual(searchQuery);
    });

    test('removes characters which are not permitted (1)', () => {
      const searchQuery = '<img src="http://url.to.file.which/not.exist" onerror=alert(document.cookie);>';
      const expectedResult = 'ltimg srchttpurl.to.file.whichnot.exist onerroralertdocument.cookie';
      const sanitizedValue = xssSanitise(searchQuery);
      expect(sanitizedValue).toStrictEqual(expectedResult);
    });

    test('removes characters which are not permitted (2)', () => {
      const searchQuery = "<b onmouseover=alert('Gotcha@!-')>click me!</b>";
      const expectedResult = 'ltb onmouseoveralertGotcha-click meltb';
      const sanitizedValue = xssSanitise(searchQuery);
      expect(sanitizedValue).toStrictEqual(expectedResult);
    });

    test('handles encoded characters bypassing', () => {
      const searchQuery = "<IMG SRC=j&#X41vascript:alert('%test2')>";
      const expectedResult = 'ltIMG SRCjX41vascriptalerttest2';
      const sanitizedValue = xssSanitise(searchQuery);
      expect(sanitizedValue).toStrictEqual(expectedResult);
    });

    test('removes a sequence of forward and backslashes', () => {
      const searchQuery = '////// \\\\\\';
      const sanitizedValue = xssSanitise(searchQuery);
      expect(sanitizedValue).toStrictEqual(' ');
    });
  });
});
