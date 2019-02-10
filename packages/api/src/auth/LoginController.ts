import { Context } from "koa";
import { Repository } from "typeorm";
import { HttpMethod } from "../HttpMethod";
import { User } from "../models";
import { Component } from "../reflection/Component";
import { Route } from "../reflection/Route";
import { AuthenticationService } from "./AuthenticationService";

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
    method: HttpMethod.POST,
    roles: ["public"]
  })
  async handleLogin(requestBody: { authCode?: string; redirectUri?: string }) {
    if (!requestBody.authCode || !requestBody.redirectUri) {
      // todo: return a bad request http response
      return;
    }
    return {
      token: await this.authService.authenticate(
        requestBody.authCode,
        requestBody.redirectUri
      )
    };
  }

  @Route({
    route: "/whoami",
    method: HttpMethod.GET,
    roles: ["user"]
  })
  async whoami(ctx: Context): Promise<User> {
    const token = ctx.get("Authorization").replace("Bearer ", "");
    const payload = await this.authService.authenticateToken(token);
    return this.userRepository.findOne(payload.sub);
  }
}
