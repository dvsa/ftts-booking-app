interface ViewError {
  location: string;
  msg: string;
  param: string;
  value: string;
}

export class ErrorFilter {
  public static existsAsAnErrorIn(fieldName: string, errors: ViewError[]): boolean {
    if (errors === undefined) {
      return false;
    }

    return errors.some((err: ViewError) => err.param === fieldName);
  }

  public static fieldErrorMessage(fieldName: string, errors: ViewError[]): string {
    if (errors === undefined) {
      return '';
    }

    const errorsForParam = errors.filter((err: ViewError) => err.param === fieldName);

    if (errorsForParam.length === 0) {
      return '';
    }

    return errorsForParam[0].msg || '';
  }

  public static fieldErrorObject(fieldName: string, errors: ViewError[]): undefined | Record<string, unknown> {
    if (!errors) {
      return undefined;
    }

    const errorsForParam = errors.filter((err: ViewError) => err.param === fieldName);

    if (!errorsForParam.length || !errorsForParam[0].msg.length) {
      return undefined;
    }

    return {
      text: errorsForParam[0].msg,
    };
  }
}
