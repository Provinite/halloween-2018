import { CSSProperties } from "@material-ui/core/styles/withStyles";
import TextField, { StandardTextFieldProps } from "@material-ui/core/TextField";
import * as React from "react";
import { Omit } from "../../../types/Omit";
const style: (align?: "left" | "right") => CSSProperties = (
  align: "left" | "right" = "left"
) => ({
  textAlign: align,
  width: "100%"
});
export type NumericTextFieldProps = Omit<
  StandardTextFieldProps,
  "value" | "onChange"
> & {
  align?: "left" | "right";
  /**
   * Callback that will be invoked with the event and underlying numeric value.
   * Invoked with null if the value is empty
   */
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    numericVal: number | null
  ) => any;
  value?: string | number;
};
interface IState {
  /** Controls the value of the input. */
  inputText: string;
  /** Used to control what incoming null values will be mapped to. */
  nullTo: "" | ".";
}
export class NumericTextField extends React.Component<
  NumericTextFieldProps,
  IState
> {
  static getDerivedStateFromProps(props: NumericTextFieldProps, state: IState) {
    const numericValue = Number(props.value);
    const numericStateValue = Number(state.inputText);
    if (props.value === null) {
      return { inputText: state.nullTo, nullTo: "" };
    }
    if (!isNaN(numericValue) && numericValue !== numericStateValue) {
      return { inputText: "" + props.value };
    }
    return null;
  }
  state: IState = {
    inputText: "",
    nullTo: ""
  };
  handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { onChange, value: propValue } = this.props;
    const newValue = e.target.value;
    const newNumericVal = Number(newValue);
    const isNumber = !isNaN(Number(newValue));
    const isEmpty = newValue === "";
    const isDot = newValue === ".";
    if (isDot) {
      this.setState({ inputText: newValue, nullTo: "." });
      await onChange(e, null);
    } else if (isEmpty) {
      this.setState({ inputText: newValue });
      await onChange(e, null);
    } else if (isNumber) {
      this.setState({ inputText: newValue });
      // Only notify if the value actually changed
      // this covers cases like typing "1.2" "1" -> "1." no change
      if (newNumericVal !== propValue) {
        await onChange(e, newNumericVal);
      }
    }
    if (newValue === "") {
      onChange(e, null);
    } else if (newValue === ".") {
      onChange(e, null);
    }
  };
  render() {
    const { classes, onChange, align, value, ...rest } = this.props;
    return (
      <TextField
        FormHelperTextProps={{
          style: style(align)
        }}
        onChange={this.handleChange}
        inputProps={{ style: style(align) }}
        value={this.state.inputText}
        {...rest}
      />
    );
  }
}
