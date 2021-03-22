import { Request, Response } from 'express';
import { TARGET } from '../../domain/enums';
import { translate } from '../../helpers/language';
import { ValidatorSchema } from '../../middleware/request-validator';
import { store } from '../../services/session';

type option = {
  attributes: {
    'data-automation-id': string;
  };
  checked: boolean;
  text: string;
  value: string;
};

type selectSupportTypeBody = {
  selectSupportType: string[];
};

class SelectSupportType {
  options: Map<string, option>;

  constructor() {
    this.options = new Map();
  }

  get = (req: Request, res: Response): void => this.render(req, res);

  post = (req: Request, res: Response): void => {
    const { selectSupportType } = req.body as selectSupportTypeBody;
    store.currentBooking.update(req, {
      selectSupportType,
    });
    return this.render(req, res);
  };

  private render = (req: Request, res: Response): void => {
    this.options.clear();
    [...Array(8).keys()].forEach((val) => {
      const option = `option${val + 1}`;
      this.options.set(option, {
        attributes: {
          'data-automation-id': `support-${option}`,
        },
        checked: false,
        value: option,
        text: translate(`selectSupportType.${option}`),
      });
    });
    if (store.target.get(req) === TARGET.GB) {
      // Remove translator option as it is NI specific
      this.options.delete('option4');
    }
    const { selectSupportType } = store.currentBooking.get(req);

    const options: option[] = [];
    this.options.forEach((value) => options.push(value));

    options.forEach((option) => {
      option.checked = selectSupportType?.includes(option.value) || false;
      return option;
    });
    return res.render('supported/select-support-type', {
      errors: req.errors,
      options,
    });
  };

  public postSchemaValidation = (): ValidatorSchema => ({
    selectSupportType: {
      in: ['body'],
      custom: {
        options: this.supportTypeValidator,
      },
    },
  });

  public supportTypeValidator = (value: string[]): string[] => {
    if (!value) {
      throw new Error(translate('selectSupportType.errors.noneSelected'));
    }
    // Not allowed to select sign language and voiceover together
    if (value.includes('option1') && value.includes('option3')) {
      throw new Error(translate('selectSupportType.errors.badCombination'));
    }
    return value;
  };
}

export default new SelectSupportType();
