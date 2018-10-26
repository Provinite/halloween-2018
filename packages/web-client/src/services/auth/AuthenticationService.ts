import { ApiClient } from "../ApiClient";
import { LocalStorageService } from "../LocalStorageService";
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
   * Authenticate with the given oauth authcode. Updates the api client's
   * auth token.
   * @param authCode - The DeviantArt oatuh authorization code.
   * @return The user's details and an auth token.
   */
  async login(authCode: string): Promise<IAuthResult> {
    const loginResponse = await this.apiClient.post("login", {
      authCode
    });
    const token = loginResponse.data.token;
    this.apiClient.setToken(token);
    const userResponse = await this.apiClient.get("whoami");
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
}
