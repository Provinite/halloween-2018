import Axios from "axios";
import * as QueryString from "querystring";
import { EnvService } from "../../config/env/EnvService";
import { IDeviantartApiConsumerConfiguration } from "../../config/env/IDeviantartApiConsumerConfig";
import { Component } from "../../reflection/Component";
import { IDeviantartAuthResult } from "./IDeviantartAuthResult";
import { IDeviantartUser } from "./IDeviantartUser";
@Component()
export class DeviantartApiConsumer {
  private config: IDeviantartApiConsumerConfiguration;
  constructor(envService: EnvService) {
    this.config = envService.getDeviantartApiConsumerConfig();
  }
  /**
   * Attempt to authenticate against the API with the provided
   * authorization_code (fetched by the client during login step).
   * @param authCode - The authorization code to use.
   * @param redirectUri - The redirect URI the client is using.
   * @return The login result.
   */
  async authenticate(authCode: string): Promise<IDeviantartAuthResult> {
    const { oauthEndpoint, clientId, clientSecret } = this.config;
    const loginRequest = await Axios.post(
      oauthEndpoint,
      QueryString.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code: authCode,
        redirect_uri: this.config.redirectUri
      })
    );

    // remap snake_case to camelCase fields
    const {
      access_token: accessToken,
      expires_in: expiresIn,
      refresh_token: refreshToken,
      scope,
      status,
      token_type: tokenType
    } = loginRequest.data;
    return {
      accessToken,
      expiresIn,
      refreshToken,
      scope,
      tokenType,
      status
    };
  }

  /**
   * Get the user associated with this access token.
   * @param accessToken - The access token with which to authenticate.
   * @return The current user.
   */
  async getUser({
    accessToken
  }: IDeviantartAuthResult): Promise<IDeviantartUser> {
    const route = `${this.config.baseRoute}user/whoami`;
    const uuidRequest = await Axios.get(route, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const {
      userid: userId,
      username,
      usericon: userIcon,
      type
    } = uuidRequest.data;
    return {
      userId,
      username,
      userIcon,
      type
    };
  }
}
