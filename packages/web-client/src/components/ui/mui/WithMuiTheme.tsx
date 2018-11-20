import { Theme, withTheme, WithTheme } from "@material-ui/core";
import * as React from "react";
interface IWithMuiThemeProps extends WithTheme {
  children: (theme: Theme, innerRef: React.Ref<any>) => React.ReactNode;
}
function FWithMuiTheme(props: IWithMuiThemeProps) {
  const { theme, innerRef, children } = props;
  return <>{children(theme, innerRef)}</>;
}

export const WithMuiTheme = withTheme()(FWithMuiTheme);
