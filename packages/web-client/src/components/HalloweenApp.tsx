import { ROLES } from "@clovercoin/constants";
import * as React from "react";
import { Redirect, Route, RouteComponentProps, Switch } from "react-router-dom";
import { ApiClient } from "../services/ApiClient";
import { makeAuthAxiosInterceptor } from "../services/auth/AuthAxiosInterceptor";
import { AuthenticationError } from "../services/auth/AuthenticationError";
import { AuthenticationService } from "../services/auth/AuthenticationService";
import { GameService } from "../services/GameService";
import { LocalStorageService } from "../services/LocalStorageService";
import { PrizeService } from "../services/PrizeService";
import { RoleService } from "../services/RoleService";
import { UserService } from "../services/UserService";
import * as _env from "../settings.env.json";
import { IEnvConfig } from "../types/IEnvConfig";
import { AdminPage } from "./admin/AdminPage";
import { AppContext, IAppContext } from "./AppContext";
import { LoginLink } from "./login/LoginLink";
import { LoginPage } from "./login/LoginPage";
import { SplashPage } from "./SplashPage";
import { ConfiguredTheme } from "./ui/ConfiguredTheme";
import { ErrorSnackbar } from "./ui/ErrorSnackbar";

const apiBase = process.env.cch2018_api_base;

const SPLASH_KEY = "splash";
interface IHalloweenAppState {
  /** If true, the entire app will on hold to finish bootstrapping. */
  loading: boolean;
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
  errorQueue: string[] = [];

  /** Lifecycle */
  constructor(props) {
    super(props);

    this.handleSplashHide = this.handleSplashHide.bind(this);
    this.handleApiError = this.handleApiError.bind(this);
    this.handleErrorClose = this.handleErrorClose.bind(this);
    this.handleErrorExited = this.handleErrorExited.bind(this);
    this.handleSuccess = this.handleSuccess.bind(this);

    const apiClient = new ApiClient(apiBase!);
    const authenticationService = new AuthenticationService(apiClient);
    const prizeService = new PrizeService(apiClient);
    const userService = new UserService(apiClient);
    const roleService = new RoleService(apiClient);
    const gameService = new GameService(apiClient);

    apiClient.useResponseInterceptor(
      makeAuthAxiosInterceptor(authenticationService, this.handleAuthLogout)
    );

    const context: IAppContext = {
      services: {
        apiClient,
        authenticationService,
        prizeService,
        userService,
        roleService,
        gameService
      },
      onApiError: this.handleApiError,
      onSuccess: this.handleSuccess,
      roles: {
        admin: null!,
        moderator: null!,
        user: null!
      }
    };

    // Default state
    this.state = {
      loading: true,
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

  async componentDidMount() {
    const { pathname } = this.props.location;
    if (!LocalStorageService.get(SPLASH_KEY) || pathname === "/splash") {
      this.setState({
        splash: {
          open: true,
          shown: true
        }
      });
    }
    try {
      // try to log in with a token from local storage
      await this.state.context.services.authenticationService.login();
    } catch (e) {
      if (e instanceof AuthenticationError) {
        // no token, or otherwise expired
      } else {
        this.state.context.onApiError(e);
      }
    }
    const roles = await this.state.context.services.roleService.getAll();
    this.setState(prevState => {
      return {
        loading: false,
        context: {
          ...prevState.context,
          roles: {
            admin: roles.find(role => role.name === ROLES.admin)!,
            moderator: roles.find(role => role.name === ROLES.moderator)!,
            user: roles.find(role => role.name === ROLES.user)!
          }
        }
      };
    });
  }

  // Public Methods

  /**
   * Handler for logout events. Sends the user back to the login page.
   */
  handleAuthLogout = () => this.props.history.push("/login");

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
    let errorMessage: string | null = "" + (error && error.toString());
    if (error && error.response && error.response.data) {
      const response = error.response.data;
      if (response.message) {
        errorMessage = response.message;
      }
      if (response.error === "RequestValidationError") {
        if (response.errors) {
          Object.keys(response.errors).forEach(key =>
            this.errorQueue.push(response.errors[key].message)
          );
          errorMessage = null;
        }
      }
    }
    // tslint:disable
    console.log("*************************");
    console.log("*        API Error      *");
    console.log("*************************");
    console.log(error);
    // tslint:enable
    if (errorMessage) {
      this.errorQueue.push(errorMessage);
    }
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
    if (this.state.loading) {
      return <></>;
    }
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
  // Private Methods

  /**
   * Display the next error in the queue.
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
