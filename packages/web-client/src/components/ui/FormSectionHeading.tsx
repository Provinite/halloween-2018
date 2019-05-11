import {
  createStyles,
  StyledComponentProps,
  Theme,
  Typography,
  withStyles
} from "@material-ui/core";
import { TypographyProps } from "@material-ui/core/Typography";
import { SFC } from "react";
import * as React from "react";
import { Omit } from "../../types/Omit";
interface IFormSectionHeadingProps
  extends StyledComponentProps<"root">,
    Omit<TypographyProps, "classes"> {}
export const FormSectionHeadingComponent: SFC<IFormSectionHeadingProps> = ({
  classes,
  children,
  ...rest
}) => (
  <Typography
    variant="subtitle1"
    color="secondary"
    className={classes!.root}
    {...rest}
  >
    {children}
  </Typography>
);

const styles = (theme: Theme) =>
  createStyles<"root">({
    root: {
      marginTop: theme.spacing.unit
    }
  });

/**
 * Component for rendering a form section heading.
 */
export const FormSectionHeading = withStyles(styles)(
  FormSectionHeadingComponent
);
