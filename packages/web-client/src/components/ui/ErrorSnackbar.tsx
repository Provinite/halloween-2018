import { StyleRulesCallback, Typography, withStyles } from "@material-ui/core";
import Slide from "@material-ui/core/Slide";
import Snackbar, { SnackbarProps } from "@material-ui/core/Snackbar";
import { TransitionProps } from "@material-ui/core/transitions/transition";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import * as React from "react";

type ErrorSnackbarProps = SnackbarProps;

function SnackbarTransition(props: TransitionProps) {
  return <Slide {...props} direction="right" />;
}

function FErrorSnackbar(props: ErrorSnackbarProps) {
  const { classes, children, ...other } = props as typeof props & {
    classes: any;
  };
  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left"
      }}
      TransitionComponent={SnackbarTransition}
      ContentProps={{
        classes: {
          root: classes.root
        }
      }}
      color="primary"
      autoHideDuration={1500}
      transitionDuration={200}
      message={
        <>
          <ErrorOutlineIcon className={classes.icon} />
          <Typography variant="body1" className={classes.typography}>
            {"" + children || ""}
          </Typography>
        </>
      }
      {...other}
    />
  );
}

const styles: StyleRulesCallback = theme => {
  return {
    root: {
      background: theme.palette.secondary.main,
      color: theme.palette.primary.dark,
      verticalAlign: "bottom"
    },
    typography: {
      display: "inline-block",
      verticalAlign: "bottom"
    },
    icon: {
      display: "inline-block",
      position: "relative",
      top: "5px",
      marginRight: theme.spacing.unit
    }
  };
};

/**
 * Snackbar styled for error messages. The contents of the error message are
 * controlled via the children prop.
 */
export const ErrorSnackbar = withStyles(styles)(FErrorSnackbar);
