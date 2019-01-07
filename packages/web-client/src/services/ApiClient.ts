import Axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { InterceptorDefinition } from "../types/Axios";
import { ensureTrailingSlash } from "../utils/Utils";
import { makeAuthAxiosInterceptor } from "./auth/AuthAxiosInterceptor";

/**
 * Low-level helper class for communicating with the application's API. Includes
 * interceptor for logging out after receiving an authentication error from
 * the API.
 */
export class ApiClient {
  private axios: AxiosInstance;
  /**
   * Create a new API client.
   * @param baseUrl - The base URL of the API
   * @param afterAuthErrorLogout - Callback invoked after the api client is
   *    logged out due to an auth error.
   * @param token - The token to use (optional).
   */
  constructor(baseUrl: string, token?: string) {
    this.axios = Axios.create({
      baseURL: ensureTrailingSlash(baseUrl)
    });
    this.axios.defaults.headers.common["Content-Type"] = "application/json";
    if (token) {
      this.setToken(token);
    }
  }

  /**
   * Set the access token for this client.
   * @param token - The bearer token to use to authorize access to the api.
   */
  setToken(token: string) {
    this.axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  /**
   * Unset the access token for this client.
   */
  unsetToken() {
    delete this.axios.defaults.headers.common.Authorization;
  }

  /**
   * Perform an HTTP GET request to the given route. Optionally takes
   * configuration for the request.
   * @param route - The route to GET.
   * @param config - Optional axios configuration object.
   */
  get(route: string, config?: AxiosRequestConfig) {
    return this.axios.get(route, config);
  }

  /**
   * Perform an HTTP POST request to the given route, sending `data` as the body.
   * @param route - The route to POST.
   * @param data - Object to be JSONified and used as request body.
   */
  post(route: string, data: any) {
    return this.axios.post(route, data);
  }

  /**
   * Perform an HTTP PUT request to the given route, sending `data` as the body.
   * @param route - The route to PUT.
   * @param data - Object to be JSONified and used as request body.
   */
  put(route: string, data?: any) {
    return this.axios.put(route, data);
  }

  /**
   * Perform an HTTP PATCH request to the given route, sending `data` as the
   * body.
   * @param route - The route to PATCH.
   * @param data - Object to be JSONified and used as request body.
   */
  patch(route: string, data: any) {
    return this.axios.patch(route, data);
  }

  /**
   * Perform an HTTP DELETE request to the given route.
   * @param route - The route to PATCH.
   */
  delete(route: string) {
    return this.axios.delete(route);
  }

  /**
   * Add an axios response interceptor to the client.
   * @return The interceptor ID.
   */
  useResponseInterceptor = (interceptor: InterceptorDefinition) =>
    this.axios.interceptors.response.use(...interceptor);
}
