import * as React from "react";
import { Redirect, Route, RouteComponentProps, Switch } from "react-router-dom";
import { LocalStorageService } from "../services/LocalStorageService";
import * as _env from "../settings.env.json";
import { IEnvConfig } from "../types/IEnvConfig";
import { LoginLink } from "./login/LoginLink";
import { LoginPage } from "./login/LoginPage";
import { SplashPage } from "./SplashPage";

const env: IEnvConfig = _env as IEnvConfig;
const SPLASH_KEY = "splash";

export default class HalloweenApp extends React.Component<
  RouteComponentProps & {
    env: IEnvConfig;
  },
  {
    /**
     * @member splash State parameters related to the splash screen.
     */
    splash: {
      /**
       * @member shown False if the splash screen has been shown before
       */
      shown: boolean;
      /**
       * @member open Controls the splash page component's visibility
       */
      open: boolean;
    };
  }
> {
  constructor(props) {
    super(props);

    this.handleSplashHide = this.handleSplashHide.bind(this);

    this.state = {
      splash: {
        open: true,
        shown: false
      }
    };
  }

  componentWillMount(): void {
    if (
      !LocalStorageService.get(SPLASH_KEY) ||
      this.props.location.pathname === "/splash"
    ) {
      this.setState({
        splash: {
          open: true,
          shown: true
        }
      });
    }
  }

  handleSplashHide(): void {
    this.setState({
      splash: {
        open: false,
        shown: false
      }
    });
    // Mark that the splash screen has been seen
    LocalStorageService.put(SPLASH_KEY, true);

    // Leave the splash route if we are on it
    if (this.props.location.pathname === "/splash") {
      this.props.history.push("/");
    }
  }

  render() {
    const createRedirect = to => () => <Redirect to={to} />;
    let splash;
    if (this.state.splash.shown) {
      splash = (
        <SplashPage
          key="cc-splash-page"
          show={this.state.splash.open}
          onHide={this.handleSplashHide}
        />
      );
    }
    return [
      splash,
      <Switch key="cc-route-switch">
        <Route path="/login" component={LoginPage} />
        <Route path="/">
          <LoginLink>Log In</LoginLink>
        </Route>
        <Route component={createRedirect("/splash")} />
      </Switch>
    ];
  }
}
