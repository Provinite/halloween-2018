import { AwilixContainer } from "awilix";
import { hasRole } from "../../auth/AuthHelpers";
import { PermissionDeniedError } from "../../auth/PermissionDeniedError";
import { asClassMethod } from "../../AwilixHelpers";
import { Component } from "../../reflection/Component";
import { Game } from "../Game";
import { User } from "../User";

@Component("TRANSIENT")
export class GameAuthorizationService {
  constructor(public container: AwilixContainer) {}
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
  private authCanRead(user: User) {
    const containerUser = user;
    return async (game: Game, user: User = containerUser) => {
      if (!hasRole(user, "user")) {
        throw new PermissionDeniedError();
      }
      return true;
    };
  }
}
