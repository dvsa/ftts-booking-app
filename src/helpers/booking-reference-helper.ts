export const isEqualBookingRefs = (ref1: string, ref2: string): boolean => {
  if (!ref1 || !ref2) return false;
  return normaliseBookingRef(ref1) === normaliseBookingRef(ref2);
};

export const normaliseBookingRef = (ref: string): string => {
  if (!ref) return ref;
  return ref.toLocaleLowerCase()
    .replace(/\s/g, ''); // Strip all spaces
};
