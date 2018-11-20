import { withStyles } from "@material-ui/core";
import classNames from "classnames";
import * as React from "react";
function FPre(props: any) {
  const { classes, className, ...other } = props;
  return <pre className={classNames(className, classes.root)} {...other} />;
}
export const Pre = withStyles({
  root: {
    display: "inline-block"
  }
})(FPre);
