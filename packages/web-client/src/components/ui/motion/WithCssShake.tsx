import { createStyles, WithStyles, withStyles } from "@material-ui/core";
import { CSSProperties } from "jss/css";
import * as React from "react";
const left = -7;
const right = 7;
const frames = {
  0: 0,
  8: left,
  25: right,
  41: left,
  58: right,
  75: left / 2,
  92: right / 2,
  100: 0
};

function makeFrames<T>(
  keyFrames: { [key: number]: T },
  transform: (value: T) => CSSProperties
) {
  const result = {};
  for (const percent of Object.keys(keyFrames)) {
    result[`${percent}%`] = transform(frames[percent]);
  }
  return result;
}

const styles = createStyles({
  shaker: {
    animation: "cc-with-shake-frames .5s linear infinite"
  },
  "@keyframes cc-with-shake-frames": makeFrames(frames, v => ({
    transform: `translateX(${v}px)`
  }))
});

/**
 * Props for the WithCssShake component.
 */
export interface IWithCssShakeProps extends WithStyles<typeof styles> {
  /** If true, the component will shake. */
  shake: boolean;
  /** Callback invoked each time the shake animation has completed. */
  onComplete: () => void;
}

/**
 * WithCssShake implementaation class.
 */
class WithCssShakeImpl extends React.Component<IWithCssShakeProps> {
  constructor(props) {
    super(props);

    this.handleAnimationIteration = this.handleAnimationIteration.bind(this);
  }

  /**
   * Render the component.
   */
  render() {
    return (
      <div
        onAnimationIteration={this.handleAnimationIteration}
        className={this.props.shake ? this.props.classes.shaker : null}
      >
        {this.props.children}
      </div>
    );
  }

  /**
   * Fired after each round of the animation completes.
   */
  handleAnimationIteration() {
    this.props.onComplete();
  }
}

/**
 * Microinteraction component used for rapid horizontal wiggles.
 */
export const WithCssShake = withStyles(styles)(WithCssShakeImpl);
