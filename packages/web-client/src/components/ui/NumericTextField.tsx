import { CSSProperties } from "@material-ui/core/styles/withStyles";
import TextField, { TextFieldProps } from "@material-ui/core/TextField";
import * as React from "react";
const style: CSSProperties = { textAlign: "right", width: "100%" };
export function NumericTextField(props: TextFieldProps) {
  const { classes, className, ...other } = props;
  return <TextField inputProps={{ style }} {...other} />;
}
