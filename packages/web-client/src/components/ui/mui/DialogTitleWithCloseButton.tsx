import {
  createStyles,
  DialogTitle,
  IconButton,
  StyledComponentProps,
  Theme,
  withStyles
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { Component } from "react";
import * as React from "react";
type ClassNames = "closeButton";
export interface IDialogTitleWithCloseButtonProps
  extends StyledComponentProps<ClassNames> {
  onCloseClick: () => any;
}
export class DialogTitleWithCloseButtonComponent extends Component<
  IDialogTitleWithCloseButtonProps
> {
  render() {
    const { classes, onCloseClick, children } = this.props;
    return (
      <DialogTitle>
        <>{children}</>
        <IconButton className={classes!.closeButton} onClick={onCloseClick}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
    );
  }
}

const styles = (theme: Theme) =>
  createStyles<ClassNames>({
    closeButton: {
      position: "absolute",
      right: theme.spacing.unit,
      top: theme.spacing.unit
    }
  });

export const DialogTitleWithCloseButton = withStyles(styles)(
  DialogTitleWithCloseButtonComponent
);
