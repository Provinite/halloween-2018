import { hasRole } from "../../auth/AuthHelpers";
import { PermissionDeniedError } from "../../auth/PermissionDeniedError";
import {
  AnyContext,
  ApplicationContainer
} from "../../config/context/ApplicationContext";
import { Component } from "../../reflection/Component";
import { Game } from "../Game";
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
  async canRead(game: Game) {
    return true;
  }
}

declare global {
  interface ApplicationContextMembers {
    /** Service for authenticating actions on Game models */
    gameAuthorizationService: GameAuthorizationService;
  }
}
