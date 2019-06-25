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
  private userRepository: RequestContext["userRepository"];
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
      if (requestBody.principal && requestBody.password) {
        const { principal, password } = validateRequest(requestBody, {
          principal: validators.nonEmptyString,
          password: validators.nonEmptyString
        });
        return {
          token: await this.authService.authenticateCredentials(
            principal,
            password
          )
        };
      }
      return;
    }
    return {
      token: await this.authService.authenticate(requestBody.authCode)
    };
  }

  @Route({
    route: "/register",
    method: HttpMethod.POST,
    roles: ["admin"]
  })
  async createLocalUser({ requestBody }: RequestContext) {
    const { principal, password } = validateRequest(requestBody, {
      principal: validators.nonEmptyString,
      password: validators.nonEmptyString
    });
    return this.authService.registerUser(principal, password);
  }
  /** @inject */
  @Route({
    route: "/whoami",
    method: HttpMethod.GET,
    roles: ["user"]
  })
  async whoami({ ctx, requestBody }: RequestContext): Promise<User> {
    const token = ctx.get("Authorization").replace("Bearer ", "");
    const payload = await this.authService.authenticateToken(token);
    return this.userRepository.findOneOrFail(payload.sub);
  }
}
