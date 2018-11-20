import { StyleRulesCallback, withStyles } from "@material-ui/core";
import Button, { ButtonProps } from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import classNames from "classnames";
import * as React from "react";
import { WithSpinner } from "./WithSpinner";
const styles: StyleRulesCallback = theme => ({
  icon: {
    marginRight: theme.spacing.unit
  },
  iconSmall: {
    fontSize: 20
  }
});
interface ISaveButtonProps extends ButtonProps {
  classes: ButtonProps["classes"] & { icon: any; iconSmall: any };
  /** If true, a spinner will be displayed and the button will be disabled */
  saving?: boolean;
}
/** Maps button sizes to spinner sizes */
const spinnerSizeMap = {
  small: 20,
  medium: 20,
  large: 30
};

/** Maps button sizes to widths */
const buttonWidthMap = {
  small: "90px",
  medium: "90px",
  large: "120px"
};

function FSaveButton(props: ISaveButtonProps) {
  const { classes, children, saving, size, ...other } = props;
  return (
    <Button
      type="submit"
      variant="contained"
      size={size}
      disabled={saving}
      {...other}
      style={{ width: buttonWidthMap[size] }}
    >
      <WithSpinner
        color="secondary"
        size={spinnerSizeMap[size]}
        loading={saving}
      >
        <SaveIcon
          className={
            size === "small"
              ? classNames(classes.icon, classes.iconSmall)
              : classes.icon
          }
        />
        Save
      </WithSpinner>
    </Button>
  );
}

/**
 * UI Component for displaying a save button. The `saving` prop can optionally
 * be used to display a spinner.
 */
export const SaveButton = withStyles(styles)(FSaveButton);
