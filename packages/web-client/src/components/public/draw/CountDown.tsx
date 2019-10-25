import { FunctionComponent, useState } from "react";
import { useInterval } from "../../../hooks/useInterval";
import * as cronParser from "cron-parser";
import { moment } from "../../../moment";
import * as React from "react";
import { millisecondsToTimeUnits } from "../../../utils/TimeUtils";
import { TimeReadout } from "./TimeReadout";
export interface CountDownProps {
  cronExpression: string;
}

export const CountDown: FunctionComponent<CountDownProps> = ({
  cronExpression
}) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useInterval(() => {
    const cron = cronParser.parseExpression(cronExpression);
    const nextTime = moment(cron.next().toDate());
    const diffInMs = nextTime.diff(moment());
    const timeUnits = millisecondsToTimeUnits(diffInMs);
    setTimeLeft(timeUnits);
  }, 500);

  return <TimeReadout {...timeLeft} />;
};
