import { Repository } from "typeorm";
import { RequestContext } from "../config/context/RequestContext";
import { HttpMethod } from "../HttpMethod";
import { User } from "../models";
import { Component } from "../reflection/Component";
import { Route } from "../reflection/Route";
import { AuthenticationService } from "./AuthenticationService";

@Component()
export class LoginController {
  private authService: AuthenticationService;
  private userRepository: Repository<User>;
  /** @inject */
  constructor({ authenticationService, userRepository }: RequestContext) {
    this.authService = authenticationService;
    this.userRepository = userRepository;
  }
  /** @inject */
  @Route({
    route: "/login",
    method: HttpMethod.POST,
    roles: ["public"]
  })
  async handleLogin({ requestBody }: RequestContext) {
    if (!requestBody.authCode) {
      // todo: return a bad request http response
      return;
    }
    return {
      token: await this.authService.authenticate(requestBody.authCode)
    };
  }
  /** @inject */
  @Route({
    route: "/whoami",
    method: HttpMethod.GET,
    roles: ["user"]
  })
  async whoami({ ctx }: RequestContext): Promise<User> {
    const token = ctx.get("Authorization").replace("Bearer ", "");
    const payload = await this.authService.authenticateToken(token);
    return this.userRepository.findOne(payload.sub);
  }
}
