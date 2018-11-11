import { Backdrop, CssBaseline, Toolbar, Typography } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import * as React from "react";
import { Redirect, Route, RouteComponentProps, Switch } from "react-router-dom";
import { ApiClient } from "../services/ApiClient";
import { AuthenticationService } from "../services/auth/AuthenticationService";
import { LocalStorageService } from "../services/LocalStorageService";
import { PrizeService } from "../services/PrizeService";
import * as _env from "../settings.env.json";
import { IEnvConfig } from "../types/IEnvConfig";
import { AdminPage } from "./admin/AdminPage";
import { AppHeader } from "./AppHeader";
import { ConfiguredTheme } from "./ui/ConfiguredTheme";
import { LoginLink } from "./login/LoginLink";
import { LoginPage } from "./login/LoginPage";
import { SplashPage } from "./SplashPage";

const env: IEnvConfig = _env as IEnvConfig;
const SPLASH_KEY = "splash";

(window as any).__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true;

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
  /** Private Properties */
  private apiClient: ApiClient;
  private prizeService: PrizeService;
  private authenticationService: AuthenticationService;

  /** Lifecycle */
  constructor(props) {
    super(props);

    this.handleSplashHide = this.handleSplashHide.bind(this);
    this.createLoginPage = this.createLoginPage.bind(this);
    this.createAdminPage = this.createAdminPage.bind(this);

    // TODO: environmentally dependent
    this.apiClient = new ApiClient("http://localhost:8081");

    this.authenticationService = new AuthenticationService(this.apiClient);
    this.prizeService = new PrizeService(this.apiClient);

    // Default state
    this.state = {
      splash: {
        open: true,
        shown: false
      }
    };
  }

  componentWillMount(): void {
    const { pathname } = this.props.location;
    if (!LocalStorageService.get(SPLASH_KEY) || pathname === "/splash") {
      this.setState({
        splash: {
          open: true,
          shown: true
        }
      });
    }
  }

  /** Public Methods */
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
    return (
      <ConfiguredTheme>
        {splash}
        <Switch key="cc-route-switch">
          <Route path="/login" render={this.createLoginPage} />
          <Route path="/admin" render={this.createAdminPage} />
          <Route path="/">
            <LoginLink>Log In</LoginLink>
          </Route>
          <Route>
            <Redirect to="/splash" />
          </Route>
        </Switch>
      </ConfiguredTheme>
    );
  }

  /** Private Methods */
  private createLoginPage(routeProps: RouteComponentProps) {
    return (
      <LoginPage
        {...routeProps}
        authenticationService={this.authenticationService}
      />
    );
  }

  private createAdminPage(routeProps: RouteComponentProps) {
    return (
      <AdminPage
        {...routeProps}
        apiClient={this.apiClient}
        prizeService={this.prizeService}
      />
    );
  }
}
