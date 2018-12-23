import { asValue, AwilixContainer } from "awilix";
import { Context, Middleware } from "koa";
import { Repository } from "typeorm";
import { AuthenticationService } from "../auth/AuthenticationService";
import { hasRole } from "../auth/AuthHelpers";
import { PermissionDeniedError } from "../auth/PermissionDeniedError";
import { getMethod } from "../HttpMethod";
import { User } from "../models";
import { RouteRegistry } from "../web/RouteRegistry";
import { IMiddlewareFactory } from "./IMiddlewareFactory";

/**
 * Authorization middleware responsible for verifying user permissions for a
 * request. Attaches the current user to request-scoped DI container.
 */
export class AuthorizationMiddlewareFactory implements IMiddlewareFactory {
  constructor(
    private userRepository: Repository<User>,
    private routeRegistry: RouteRegistry,
    private authenticationService: AuthenticationService
  ) {}
  create(): Middleware {
    return async (ctx: Context, next: () => Promise<any>) => {
      const { path, method } = ctx;
      const requestContainer: AwilixContainer = ctx.state.requestContainer;
      const { allowedRoles, error } = this.routeRegistry.lookupRoute(
        path,
        getMethod(method)
      );
      if (error) {
        // allow processing to continue
        return await next();
      }
      // parse the token from the authorization header
      const token = ctx.get("Authorization").replace("Bearer ", "");
      let allow = false;
      let user;
      if (token) {
        // try to authenticate
        // let any auth errors bubble up
        const payload = await this.authenticationService.authenticateToken(
          token
        );
        const userid = payload.sub;
        // fetch the user
        user = await this.userRepository.findOneOrFail(userid);
        // check if they have any acceptable roles
        for (const allowedRole of allowedRoles) {
          allow = allow || hasRole(user, allowedRole);
        }
      } else {
        // unauthenticated requests have the public role implicitly
        allow = allowedRoles.includes("public");
      }
      requestContainer.register("user", asValue(user));
      if (!allow) {
        const userRoles = user ? user.roles.join(", ") : "public";
        const message = `Allowed roles: [${allowedRoles.join(
          ", "
        )}], User Roles: [${userRoles}]`;
        throw new PermissionDeniedError(message);
      }
      await next();
    };
  }
}
