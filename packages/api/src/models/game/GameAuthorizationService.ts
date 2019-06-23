import { hasRole } from "../../auth/AuthHelpers";
import { PermissionDeniedError } from "../../auth/PermissionDeniedError";
import { bind } from "../../AwilixHelpers";
import {
  AnyContext,
  ApplicationContainer
} from "../../config/context/ApplicationContext";
import { RequestContext } from "../../config/context/RequestContext";
import { Component } from "../../reflection/Component";
import { Game } from "../Game";
import { User } from "../User";
import { RequestUser } from "../../middlewares/AuthorizationMiddlewareFactory";

@Component("TRANSIENT")
export class GameAuthorizationService {
  container: ApplicationContainer;
  /** @inject */
  constructor({ container }: AnyContext) {
    this.container = container;
  }
  async canCreate(user: RequestUser) {
    if (!hasRole(user, "admin")) {
      throw new PermissionDeniedError();
    }
  }
  async canUpdate(user: RequestUser) {
    if (!hasRole(user, "admin")) {
      throw new PermissionDeniedError();
    }
  }
  async canReadMultiple(user: RequestUser) {
    const canRead = hasRole(user, "admin") || hasRole(user, "user");
    if (!canRead) {
      throw new PermissionDeniedError();
    }
  }
  get canRead() {
    const authCanRead = this.authCanRead;
    return this.container.build(bind(authCanRead, this));
  }
  /** @inject */
  private authCanRead({ user }: RequestContext) {
    const containerUser = user;
    return async (game: Game, user: User | undefined = containerUser) => {
      if (!hasRole(user, "user")) {
        throw new PermissionDeniedError();
      }
      return true;
    };
  }
}

declare global {
  interface ApplicationContextMembers {
    /** Service for authenticating actions on Game models */
    gameAuthorizationService: GameAuthorizationService;
  }
}
