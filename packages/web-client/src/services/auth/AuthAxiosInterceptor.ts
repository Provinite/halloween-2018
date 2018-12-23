import Axios, { AxiosError } from "axios";
import { ArgumentTypes } from "../../types/ArgumentTypes";
import { ApiClient } from "../ApiClient";
import { AuthenticationService } from "./AuthenticationService";

type InterceptorDefinition = ArgumentTypes<
  typeof Axios.interceptors.response.use
>;
const noOnFulFilled = result => result;
/**
 * Axios interceptor that catches authentication errors. When an authentication
 * error is caught, the authentication service is logged out, the apiClient
 * has its token removed, and the user is redirected to the login page.
 * @param apiClient - The api client to forget the token for.
 */
export const makeAuthAxiosInterceptor: (
  apiClient: ApiClient,
  afterLogout: () => void
) => InterceptorDefinition = (apiClient, afterLogout) => {
  return [
    noOnFulFilled,
    err => {
      if (err.response) {
        const axiosError = err as AxiosError;
        if (axiosError.response.status === 401) {
          AuthenticationService.logout();
          apiClient.unsetToken();
          afterLogout();
          throw err;
        }
      }
    }
  ];
};
