import { Theme, withTheme } from "@material-ui/core";
import { ThemedComponentProps } from "@material-ui/core/styles/withTheme";
import * as React from "react";
interface IWithMuiThemeProps extends ThemedComponentProps {
  children: (
    theme: Theme | undefined,
    innerRef: React.Ref<any> | undefined
  ) => React.ReactNode;
}
function FWithMuiTheme(props: IWithMuiThemeProps) {
  const { theme, innerRef, children } = props;
  return <>{children(theme, innerRef)}</>;
}

export const WithMuiTheme = withTheme()(FWithMuiTheme);
