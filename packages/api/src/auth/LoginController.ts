import Axios, { AxiosError } from "axios";
import { Context } from "koa";
import { stringify } from "querystring";
import { Repository } from "typeorm";
import { HttpMethod } from "../HttpMethod";
import { User } from "../models";
import { Component } from "../reflection/Component";
import { Route } from "../reflection/Route";
import { AuthenticationService } from "./AuthenticationService";
import { DeviantartApiConsumer } from "./deviantart/DeviantartApiConsumer";

@Component()
export class LoginController {
  private authService: AuthenticationService;
  private userRepository: Repository<User>;
  constructor(
    authenticationService: AuthenticationService,
    userRepository: Repository<User>
  ) {
    this.authService = authenticationService;
    this.userRepository = userRepository;
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
    return {
      token: await this.authService.authenticate(requestBody.authCode)
    };
  }

  @Route("/whoami")
  async whoami(ctx: Context) {
    const token = ctx.get("Authorization").replace("Bearer ", "");
    const payload = await this.authService.authenticateToken(token);
    return this.userRepository.findOne(payload.sub);
  }
}
