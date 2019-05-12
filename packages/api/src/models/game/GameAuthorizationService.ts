import { hasRole } from "../../auth/AuthHelpers";
import { PermissionDeniedError } from "../../auth/PermissionDeniedError";
import { asClassMethod } from "../../AwilixHelpers";
import {
  AnyContext,
  ApplicationContainer
} from "../../config/context/ApplicationContext";
import { RequestContext } from "../../config/context/RequestContext";
import { Component } from "../../reflection/Component";
import { Game } from "../Game";
import { User } from "../User";

@Component("TRANSIENT")
export class GameAuthorizationService {
  container: ApplicationContainer;
  /** @inject */
  constructor({ container }: AnyContext) {
    this.container = container;
  }
  async canCreate(user: User) {
    if (!hasRole(user, "admin")) {
      throw new PermissionDeniedError();
    }
  }
  async canUpdate(user: User) {
    if (!hasRole(user, "admin")) {
      throw new PermissionDeniedError();
    }
  }
  async canReadMultiple(user: User) {
    const canRead = hasRole(user, "admin") || hasRole(user, "user");
    if (!canRead) {
      throw new PermissionDeniedError();
    }
  }
  get canRead() {
    return this.container.build(asClassMethod(this, this.authCanRead));
  }
  /** @inject */
  private authCanRead({ user }: RequestContext) {
    const containerUser = user;
    return async (game: Game, user: User = containerUser) => {
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
