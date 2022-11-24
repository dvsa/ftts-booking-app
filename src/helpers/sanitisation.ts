const convertNullUndefinedToEmptyString = (field: string | null | undefined): string => {
  if (field) {
    return field;
  }

  return '';
};

export {
  convertNullUndefinedToEmptyString,
};
