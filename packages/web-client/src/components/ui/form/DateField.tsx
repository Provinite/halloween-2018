import TextField, { StandardTextFieldProps } from "@material-ui/core/TextField";
import { FunctionComponent } from "react";
import * as React from "react";

interface IDateFieldProps extends StandardTextFieldProps {}

/**
 * A date form field.
 */
export const DateField: FunctionComponent<IDateFieldProps> = props => {
  const { InputLabelProps, ...rest } = props;
  const LabelProps = { ...InputLabelProps, shrink: true };
  return <TextField type="date" InputLabelProps={LabelProps} {...rest} />;
};
