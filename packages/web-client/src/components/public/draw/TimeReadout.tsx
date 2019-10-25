import { FunctionComponent } from "react";
import { StyledComponentProps, withStyles } from "@material-ui/core";
import * as React from "react";
export type TimeReadoutClassNames = "root" | "separator" | "digitSet";

export interface TimeReadoutProps
  extends StyledComponentProps<TimeReadoutClassNames> {
  days?: number;
  hours?: number;
  minutes: number;
  seconds: number;
}

// Actual TimeReadout component
const _TimeReadout: FunctionComponent<TimeReadoutProps> = ({
  days,
  hours,
  minutes,
  seconds,
  classes: classesOrUndefined
}) => {
  const classes = classesOrUndefined!;
  /**
   * Render the clock html. Takes in any number of numbers as digit sets. Ignores
   * leading falsy values.
   */
  const renderClock = (...args: (number | undefined)[]) => {
    const results = [];
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      // ignore leading falsy values
      if (!arg && !results.length) {
        continue;
      }
      results.push(<div className={classes.digitSet}>{formatNumber(arg)}</div>);
      if (i !== args.length - 1) {
        results.push(<div className={classes.separator}>:</div>);
      }
    }
    return results;
  };

  return (
    <div className={classes.root}>
      {...renderClock(days, hours, minutes, seconds)}
    </div>
  );
};

/**
 * Component for displaying a digital clock-ike readout "DD:HH:MM:SS"
 */
export const TimeReadout = withStyles<TimeReadoutClassNames>(theme => {
  return {
    digitSet: {},
    root: {},
    separator: {}
  };
})(_TimeReadout);

function formatNumber(num: any) {
  if (typeof num !== "number" || isNaN(num)) {
    num = 0;
  }
  let result = "" + num;
  if (result.length === 1) {
    result = "0" + result;
  }
  return result;
}
