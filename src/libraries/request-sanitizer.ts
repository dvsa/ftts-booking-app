import xssFilters from 'xss-filters';

export function stringToArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value as string[];
  }

  if (typeof value === 'string') {
    return [value];
  }

  return [];
}

export function xssSanitise(searchTerm: string): string {
  // allow spaces, alphanumeric chars along with some punctuation
  const allowedChars = /[^A-Za-zÀ-ÖØ-öø-ÿ0-9,.\- ]/g;
  const xssFilteredSearchTerm = xssFilters.inHTMLData(searchTerm);
  return xssFilteredSearchTerm
    .replace(allowedChars, '')
    .replace(/\\/g, '');
}
