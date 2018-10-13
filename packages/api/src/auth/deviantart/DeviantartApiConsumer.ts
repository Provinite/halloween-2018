import Axios from "axios";
import { stringify } from "querystring";
import { Component } from "../../reflection/Component";
import { IDeviantartApiConsumerConfig } from "./IDeviantartApiConsumerConfig";
@Component()
export class DeviantartApiConsumer {
  private config: IDeviantartApiConsumerConfig;
  constructor(deviantartConfig: IDeviantartApiConsumerConfig) {
    this.config = { ...deviantartConfig };
  }
  async authenticate(authCode: string) {
    const { oauth_endpoint, client_id, client_secret } = this.config;
    const result = await Axios.post(
      oauth_endpoint,
      stringify({
        client_id,
        client_secret,
        grant_type: "authorization_code",
        code: authCode,
        redirect_uri: "http://localhost:8080/login"
      })
    );
    return result.data;
  }
}
