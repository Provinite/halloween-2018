import {
  createMuiTheme,
  CssBaseline,
  MuiThemeProvider
} from "@material-ui/core";
import { PaletteOptions } from "@material-ui/core/styles/createPalette";
import { TypographyOptions } from "@material-ui/core/styles/createTypography";
import * as React from "react";
// const themeName = "Mine Shaft Sunshade Horn Shark";
const palette: PaletteOptions = {
  background: {
    default: "#303030",
    paper: "#FFFFFF"
  },
  contrastThreshold: 3,
  primary: { main: "#212121" },
  secondary: { main: "#FFA726" }, // contrastText: "#FAFAFA" },
  text: {
    primary: "#303030"
  }
};
const typography: TypographyOptions = {
  useNextVariants: true
};
const theme = createMuiTheme({ palette, typography });

/**
 * Preconfigured Material-UI theme provider. Also applies a css baseline.
 */
export function ConfiguredTheme(props: {
  children: JSX.Element | JSX.Element[];
}) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {props.children}
    </MuiThemeProvider>
  );
}
