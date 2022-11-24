import { unmeaningfulPhrases } from './custom-support-unmeaningful-phrases';

const normalise = (input: string): string => input
  .toUpperCase()
  .replace(/\s/g, '') // Strip all spaces
  .replace(/[^A-Z]/g, ''); // Strip non-letter characters

const normalisedUnmeaningfulPhrases = unmeaningfulPhrases.map(normalise);

export const isCustomSupportInputEmptyOrUnmeaningful = (input: string): boolean => {
  const normalisedInput = normalise(input);
  return normalisedInput === '' || normalisedUnmeaningfulPhrases.includes(normalisedInput);
};
