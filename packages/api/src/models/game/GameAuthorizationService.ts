import { hasRole } from "../../auth/AuthHelpers";
import { Component } from "../../reflection/Component";
import { User } from "../User";

@Component()
export class GameAuthorizationService {
  async canCreate(user: User) {
    return hasRole(user, "admin");
  }
  async canUpdate(user: User) {
    return hasRole(user, "admin");
  }
  async canReadMultiple(user: User) {
    return hasRole(user, "admin");
  }
}
