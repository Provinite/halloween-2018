import { Repository } from "typeorm";
import { RequestContext } from "../config/context/RequestContext";
import { HttpMethod } from "../HttpMethod";
import { User } from "../models";
import { Component } from "../reflection/Component";
import { Route } from "../reflection/Route";
import { AuthenticationService } from "./AuthenticationService";
import { validateRequest, validators } from "../web/RequestValidationUtils";

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
    const body = validateRequest(requestBody, {
      authCode: validators.string
    });
    return {
      token: await this.authService.authenticate(body.authCode)
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
