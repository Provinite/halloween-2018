const MILLISECONDS_PER_HOUR = 1000 * 60 * 60;
const MILLISECONDS_PER_MINUTE = 1000 * 60;
const MILLISECONDS_PER_SECOND = 1000;

export const millisecondsToTimeUnits = (timeInMs: number) => {
  const hours = Math.floor(timeInMs / MILLISECONDS_PER_HOUR);
  timeInMs -= hours * MILLISECONDS_PER_HOUR;
  const minutes = Math.floor(timeInMs / MILLISECONDS_PER_MINUTE);
  timeInMs -= minutes * MILLISECONDS_PER_MINUTE;
  const seconds = Math.floor(timeInMs / MILLISECONDS_PER_SECOND);
  return { hours, minutes, seconds };
};
