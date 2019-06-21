import { asValue } from "awilix";
import { Context, Middleware } from "koa";
import { Repository } from "typeorm";
import { AuthenticationService } from "../auth/AuthenticationService";
import { hasRole } from "../auth/AuthHelpers";
import { PermissionDeniedError } from "../auth/PermissionDeniedError";
import { RoleLiteral } from "../auth/RoleLiteral";
import { ApplicationContext } from "../config/context/ApplicationContext";
import { RequestContainer } from "../config/context/RequestContext";
import { getMethod } from "../HttpMethod";
import { User } from "../models";
import { RouteRegistry } from "../web/RouteRegistry";
import { IMiddlewareFactory } from "./IMiddlewareFactory";

/**
 * Authorization middleware responsible for verifying user permissions for a
 * request. Attaches the current user to request-scoped DI container as "user".
 */
export class AuthorizationMiddlewareFactory implements IMiddlewareFactory {
  userRepository: Repository<User>;
  routeRegistry: RouteRegistry;
  authenticationService: AuthenticationService;
  /** @inject */
  constructor({
    userRepository,
    routeRegistry,
    authenticationService
  }: ApplicationContext) {
    this.userRepository = userRepository;
    this.routeRegistry = routeRegistry;
    this.authenticationService = authenticationService;
  }
  create(): Middleware {
    return async (ctx: Context, next: () => Promise<any>) => {
      const { path, method } = ctx;
      const requestContainer: RequestContainer = ctx.state.requestContainer;
      let allowedRoles: RoleLiteral[];
      try {
        // TODO:
        allowedRoles = this.routeRegistry.lookupRoute(path, getMethod(method)!)
          .allowedRoles;
      } catch (e) {
        // TODO: Relying on a downstream middleware to handle this isn't the best
        // maybe we should have a middleware that handles 404s and such up-front.

        // unable to get permission information for the request, so allow
        // it to continue on.
        return await next();
      }
      // parse the token from the authorization header
      const token = ctx.get("Authorization").replace("Bearer ", "");
      /** if true, allow the request through */
      let allow: boolean = false;
      /** the current user */
      let user: User | undefined;
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
        const userRoles = user
          ? user.roles.map(r => r.name).join(", ")
          : "public";

        const message = `Allowed roles: [${allowedRoles.join(
          ", "
        )}], User Roles: [${userRoles}]`;
        throw new PermissionDeniedError(message);
      }
      await next();
    };
  }
}

declare global {
  interface RequestContextMembers {
    user: User | undefined;
  }
}

export type RequestUser = RequestContextMembers["user"];
