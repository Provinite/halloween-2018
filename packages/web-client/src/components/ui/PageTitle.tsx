import Typography, { TypographyProps } from "@material-ui/core/Typography";
import * as React from "react";
import { FunctionComponent } from "react";
export const PageTitle: FunctionComponent<TypographyProps> = props => (
  <Typography variant="h3" color="secondary" {...props} />
);
