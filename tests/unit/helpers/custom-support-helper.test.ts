import { isCustomSupportInputEmptyOrUnmeaningful } from '../../../src/helpers/custom-support-helper';

describe('Custom support helper', () => {
  describe('isCustomSupportInputEmptyOrUnmeaningful', () => {
    test.each([
      '',
      '   ',
      '*****!?!?!',
      '999',
      'N/A',
      'NA',
      'N A',
      'NO!',
      'NO THANKS',
      'i\'m fine',
      'No t hanks',
      '  no support needed ',
      'its fine',
      'all good thank s ',
      'I don\'t need support',
      'I don\'t need',
      ' clicked this by accide nt sorry',
      'SELECTED BY MISTAKE',
    ])('returns true for empty/unmeaningful input string \'%s\'', (input: string) => {
      expect(isCustomSupportInputEmptyOrUnmeaningful(input)).toBe(true);
    });

    test.each([
      'I need French translation, thanks!',
      'I don\'t need voiceover but I do need on-screen language',
      'Im not sure ',
      'Good question!',
      'I need to speak to someone about it over the phone',
      'Do you do Italian voiceover?',
      'I have a health condition which...',
      'I\'m good but could do with help reading the questions',
      'Nothing over than a listening aid',
      'I require accessibility support in the test centre',
    ])('returns false for meaningful input string \'%s\'', (input: string) => {
      expect(isCustomSupportInputEmptyOrUnmeaningful(input)).toBe(false);
    });
  });
});
