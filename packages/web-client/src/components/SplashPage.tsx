import * as React from "react";
interface ISplashPageProps {
  show: boolean;
  onHide: () => void;
}

interface ISplashPageState {
  transitioning: boolean;
}

/**
 * A splash page with some neato transition.
 */
export class SplashPage extends React.Component<
  ISplashPageProps,
  ISplashPageState
> {
  constructor(props: ISplashPageProps) {
    super(props);
    this.state = {
      transitioning: false
    };
    this.close = this.close.bind(this);
    this.handleTransitionEnd = this.handleTransitionEnd.bind(this);
  }

  componentDidUpdate(prevProps: ISplashPageProps): void {
    if (!this.props.show && this.props.show !== prevProps.show) {
      this.close();
    }
  }

  close(): void {
    this.setState({
      transitioning: true
    });
  }

  handleTransitionEnd(): void {
    this.props.onHide();
  }

  render(): React.ReactNode {
    return (
      <div className="cc-splash-scene" onClick={this.close}>
        <div
          className={
            "cc-splash-page " +
            (this.state.transitioning ? " cc-splash-page--up" : "")
          }
          onTransitionEnd={this.handleTransitionEnd}
        >
          <div className="cc-splash-page__splash" />
          <div className="cc-splash-page__splash--left" />
          <div className="cc-splash-page__splash--right" />
          <div className="cc-splash-page__table" />
        </div>
      </div>
    );
  }
}
