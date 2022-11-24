interface RadioButtonItem {
  value: string;
  text: string;
  label?: {
    classes: string;
  };
  hint?: {
    text: string;
  };
  checked: boolean;
}

export default RadioButtonItem;
