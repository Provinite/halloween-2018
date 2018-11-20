import * as React from "react";
import { Redirect, Route, RouteComponentProps, Switch } from "react-router-dom";
import { ApiClient } from "../services/ApiClient";
import { AuthenticationService } from "../services/auth/AuthenticationService";
import { LocalStorageService } from "../services/LocalStorageService";
import { PrizeService } from "../services/PrizeService";
import * as _env from "../settings.env.json";
import { IEnvConfig } from "../types/IEnvConfig";
import { AdminPage } from "./admin/AdminPage";
import { AppContext, IAppContext } from "./AppContext";
import { LoginLink } from "./login/LoginLink";
import { LoginPage } from "./login/LoginPage";
import { SplashPage } from "./SplashPage";
import { ConfiguredTheme } from "./ui/ConfiguredTheme";
import { ErrorSnackbar } from "./ui/ErrorSnackbar";

const env: IEnvConfig = _env as IEnvConfig;
const SPLASH_KEY = "splash";
interface IHalloweenAppState {
  /** State parameters related to the splash screen. */
  splash: {
    /** False if the splash screen has been shown before */
    shown: boolean;
    /** Controls the splash page component's visibility */
    open: boolean;
  };
  /** The application's global context */
  context: IAppContext;
  /** Stateful data related to errors */
  error: {
    /** The current error */
    currentError: any;
    /** Controls the visibility of the snackbar */
    open: boolean;
  };
}

(window as any).__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true;

export default class HalloweenApp extends React.Component<
  RouteComponentProps & {
    env: IEnvConfig;
  },
  IHalloweenAppState
> {
  /* Error queue */
  errorQueue = [];

  /** Lifecycle */
  constructor(props) {
    super(props);

    this.handleSplashHide = this.handleSplashHide.bind(this);
    this.handleApiError = this.handleApiError.bind(this);
    this.handleErrorClose = this.handleErrorClose.bind(this);
    this.handleErrorExited = this.handleErrorExited.bind(this);
    this.handleSuccess = this.handleSuccess.bind(this);

    const apiClient = new ApiClient("http://localhost:8081");
    const authenticationService = new AuthenticationService(apiClient);
    const prizeService = new PrizeService(apiClient);

    const context: IAppContext = {
      services: {
        apiClient,
        authenticationService,
        prizeService
      },
      onApiError: this.handleApiError,
      onSuccess: this.handleSuccess
    };

    // Default state
    this.state = {
      splash: {
        open: true,
        shown: false
      },
      error: {
        currentError: null,
        open: false
      },
      context
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
  /**
   * Close the error snackbar.
   */
  handleErrorClose(event, reason: string) {
    if (reason === "clickaway") {
      return;
    }
    this.setState(prevState => {
      return {
        error: {
          ...prevState.error,
          open: false
        }
      };
    });
  }

  /**
   * Display the next error if there is one.
   */
  handleErrorExited() {
    this.displayNextError();
  }

  /**
   * Update state and localstorage once the splash page has been hidden.
   */
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
  /**
   * Fallback handler for successful actions. Toast a success message.
   * @param message - The message.
   */
  handleSuccess(message: string): void {
    this.handleApiError(message);
  }

  /**
   * Fallback handler for api errors. Eventually this will cause a snackbar
   * to pop up with the error.
   * @param error - The error.
   */
  handleApiError(error: any): void {
    // tslint:disable
    /*
    console.log("*************************");
    console.log("*        API Error      *");
    console.log("*************************");
    */
    console.log(error);
    // tslint:enable
    this.errorQueue.push(error);
    this.setState(prevState => ({
      error: {
        open: prevState.error.open ? false : true,
        currentError: prevState.error.open
          ? prevState.error.currentError
          : this.errorQueue.shift()
      }
    }));
  }

  /**
   * Render the application.
   */
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
      <AppContext.Provider value={this.state.context}>
        <ConfiguredTheme>
          <ErrorSnackbar
            open={this.state.error.open}
            onClose={this.handleErrorClose}
            onExited={this.handleErrorExited}
            color="primary"
          >
            {this.state.error.currentError}
          </ErrorSnackbar>
          {splash}
          <Switch key="cc-route-switch">
            <Route path="/login" component={LoginPage} />
            <Route path="/admin" component={AdminPage} />
            <Route path="/">
              <LoginLink>Log In</LoginLink>
            </Route>
            <Route>
              <Redirect to="/splash" />
            </Route>
          </Switch>
        </ConfiguredTheme>
      </AppContext.Provider>
    );
  }
  /** Private Methods */
  /**
   * Display the next error.
   */
  private displayNextError() {
    if (this.errorQueue.length) {
      this.setState({
        error: {
          open: true,
          currentError: this.errorQueue.shift()
        }
      });
    }
  }
}
