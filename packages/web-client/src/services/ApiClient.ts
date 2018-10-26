import Axios, { AxiosInstance } from "axios";
import { ensureTrailingSlash } from "../utils/Utils";

/**
 * Low-level helper class for communicating with the application's API.
 */
export class ApiClient {
  private axios: AxiosInstance;
  /**
   * Create a new API client.
   * @param baseUrl - The base URL of the API
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

  get(route: string) {
    return this.axios.get(route);
  }

  post(route: string, data: any) {
    return this.axios.post(route, data);
  }

  put(route: string, data: any) {
    return this.axios.put(route, data);
  }

  patch(route: string, data: any) {
    return this.axios.patch(route, data);
  }

  delete(route: string) {
    return this.axios.delete(route);
  }
}
