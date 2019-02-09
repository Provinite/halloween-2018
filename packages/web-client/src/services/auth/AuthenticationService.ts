import { ROLES } from "@clovercoin/constants";
import { IRole } from "../../models/IRole";
import { IUser } from "../../models/IUser";
import { isTokenExpiredResponse } from "../../utils/Utils";
import { ApiClient } from "../ApiClient";
import { LocalStorageService } from "../LocalStorageService";
import { AuthenticationError } from "./AuthenticationError";
interface IAuthResult {
  iconUrl: string;
  token: string;
  username: string;
  uuid: string;
}
export class AuthenticationService {
  private apiClient: ApiClient;
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }
  /**
   * Forget the current user's credentials
   */
  logout() {
    LocalStorageService.put("username", null);
    LocalStorageService.put("token", null);
    LocalStorageService.put("iconUrl", null);
    LocalStorageService.put("uuid", null);
    this.apiClient.unsetToken();
  }
  /**
   * Authenticate with the given oauth authcode. Updates the api client's
   * auth token.
   * @param authCode - The DeviantArt oatuh authorization code.
   * @return The user's details and an auth token.
   */
  async login(authCode?: string): Promise<IAuthResult> {
    let token;
    if (!authCode) {
      token = LocalStorageService.get("token");
      if (token === null) {
        throw new AuthenticationError("No auth token.");
      }
    } else {
      const loginResponse = await this.apiClient.post("login", {
        authCode
      });
      token = loginResponse.data.token;
    }
    this.apiClient.setToken(token);
    let userResponse;
    userResponse = await this.apiClient.get("whoami", {
      validateStatus: status => status < 500
    });
    if (isTokenExpiredResponse(userResponse.data)) {
      this.apiClient.unsetToken();
      throw new AuthenticationError("Session expired.");
    }
    const { data } = userResponse;
    if (!data.deviantartName || !data.deviantartUuid || !data.iconUrl) {
      throw new Error("Unexpected response to identity query.");
    }
    const {
      deviantartName: username,
      deviantartUuid: uuid,
      iconUrl
    } = userResponse.data;
    LocalStorageService.put("username", username);
    LocalStorageService.put("token", token);
    LocalStorageService.put("iconUrl", iconUrl);
    LocalStorageService.put("uuid", uuid);
    return {
      iconUrl,
      token,
      username,
      uuid
    };
  }

  /**
   * Check if the provided user has a specific role.
   * @param user - The user to check.
   * @param roleName - The role name to check for.
   */
  hasNamedRole(user: IUser, roleName: string) {
    return user.roles.some(role => role.name === roleName);
  }

  /**
   * Check if the provided user has a specific role.
   */
  hasRole(user: IUser, role: IRole) {
    return user.roles.some(r => r.id === role.id);
  }

  /**
   * Check if the given role is the "admin" role.
   */
  isAdminRole(role: IRole) {
    return role.name === ROLES.admin;
  }
}
