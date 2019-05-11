import { StyledComponentProps, withStyles } from "@material-ui/core";
import * as React from "react";

export interface IPageBodyProps
  extends React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >,
    StyledComponentProps<"root"> {}
export const PageBodyComponent: React.FunctionComponent<IPageBodyProps> = ({
  classes,
  ...rest
}) => <div className={classes!.root} {...rest} />;

export const PageBody = withStyles<"root">(({ spacing }) => ({
  root: {
    paddingLeft: spacing.unit,
    paddingRight: spacing.unit
  }
}))(PageBodyComponent);
