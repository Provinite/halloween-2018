import * as React from "react";

/**
 * A component with a simple derived state.
 */
export class TestableComponent extends React.Component<
  {
    leftSummand: number;
    rightSummand: number;
  },
  {
    sum: number;
  }
> {
  static getDerivedStateFromProps(props, state) {
    if (state.sum !== TestableComponent.add(props)) {
      return {
        sum: TestableComponent.add(props)
      };
    }
    return null;
  }

  private static add(props): number {
    return props.leftSummand + props.rightSummand;
  }
  constructor(props) {
    super(props);
    this.state = {
      sum: TestableComponent.add(props)
    };
  }

  render() {
    return (
      <span>
        The result of {this.props.leftSummand} + {this.props.rightSummand} is
        {this.state.sum}
      </span>
    );
  }
}
