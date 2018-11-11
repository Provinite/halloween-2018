import { CircularProgress } from "@material-ui/core";
import { CircularProgressProps } from "@material-ui/core/CircularProgress";
import * as React from "react";
interface IWithSpinnerProps extends CircularProgressProps {
  children: React.ReactNode;
  loading: boolean;
}

export function WithSpinner(props: IWithSpinnerProps) {
  const { loading, children, ...other } = props;
  return loading ? <CircularProgress {...other} /> : <>{children}</>;
}
