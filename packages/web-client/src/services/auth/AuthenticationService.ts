import Axios from "axios";
import { LocalStorageService } from "../LocalStorageService";

export class AuthenticationServiceImpl {
  private apiUrl: string;
  constructor(apiUrl: string) {
    if (apiUrl.endsWith("/")) {
      apiUrl = apiUrl.substr(0, apiUrl.length - 1);
    }
    this.apiUrl = apiUrl;
  }
  async login(
    authCode: string
  ): Promise<{
    iconUrl: string;
    token: string;
    username: string;
    uuid: string;
  }> {
    const loginResponse = await Axios.post("http://localhost:8081/login", {
      authCode
    });
    const token = loginResponse.data.token;
    const userResponse = await Axios.get("http://localhost:8081/whoami", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
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

export let AuthenticationService = new AuthenticationServiceImpl(
  "http://localhost:8081"
);
