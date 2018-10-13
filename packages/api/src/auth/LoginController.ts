import Axios, { AxiosError } from "axios";
import { stringify } from "querystring";
import { HttpMethod } from "../HttpMethod";
import { Component } from "../reflection/Component";
import { Route } from "../reflection/Route";
import { DeviantartApiConsumer } from "./deviantart/DeviantartApiConsumer";

@Component()
export class LoginController {
  private client: DeviantartApiConsumer;
  constructor(deviantartApiConsumer: DeviantartApiConsumer) {
    this.client = deviantartApiConsumer;
  }
  @Route({
    route: "/login",
    method: HttpMethod.POST
  })
  async handleLogin(requestBody: { [key: string]: any }) {
    if (!requestBody.authCode) {
      // todo: return a bad request http response
      return;
    }
    // ~~\_o_/~~
    return this.client.authenticate(requestBody.authCode);
  }

  @Route("/oauth2/token")
  dump(requestBody: any) {
    console.log("got token req");
    console.log(requestBody);
    return "ho ho ho";
  }
}
