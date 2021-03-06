import { InterceptorDefinition, noOnFulFilled } from "../../types/Axios";
import { isAxiosError, isTokenExpiredResponse } from "../../utils/Utils";
import { AuthenticationService } from "./AuthenticationService";

/**
 * Axios interceptor that catches authentication errors. When an authentication
 * error is caught, the application is logged out and the afterLogout callback
 * is fired.
 * @param afterLogout - Callback invoked after the application is logged out.
 */
export const makeAuthAxiosInterceptor: (
  authenticationService: AuthenticationService,
  afterLogout: () => void
) => InterceptorDefinition = (authenticationService, afterLogout) => {
  return [
    noOnFulFilled,
    err => {
      if (isAxiosError(err) && err.response) {
        if (
          err.response.status === 401 &&
          isTokenExpiredResponse(err.response)
        ) {
          authenticationService.logout();
          afterLogout();
        }
      }
      throw err;
    }
  ];
};
