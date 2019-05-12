import { FindManyOptions } from "typeorm";
import { hasRole } from "../../auth/AuthHelpers";
import { PermissionDeniedError } from "../../auth/PermissionDeniedError";
import { ContainerAware, MakeContainerAware } from "../../AwilixHelpers";
import { Component } from "../../reflection/Component";
import { Prize } from "../Prize";
import { User } from "../User";

@Component("TRANSIENT")
@MakeContainerAware()
export class PrizeAuthorizationService {
  /**
   * Determine if the user may read multiple prizes.
   * @param query - The find options that will be used to query for multiple
   *  prizes.
   * @param [user] - The user whose permissions should be used. Defaults to the
   *  current container's user.
   * @throws PermissionDeniedError if the user does not have rights to make the
   *  specified query.
   */
  get canReadMultiple() {
    return this.buildMethod(this.buildCanReadMultiple);
  }
  private buildCanReadMultiple(user: User) {
    const containerUser = user;
    return async (query: FindManyOptions<Prize>, user = containerUser) => {
      if (
        !query ||
        !query.where ||
        typeof query.where !== "object" ||
        !query.where.game
      ) {
        if (!hasRole(user, "admin")) {
          throw new PermissionDeniedError(
            "Unable to query for prizes without a game."
          );
        }
      }
    };
  }

  /**
   * Determine if the user may create a new prize.
   * @param prize - The prize that will be created.
   * @param [user] - The user whose permissions should be used. Defaults to the
   *  current container's user.
   * @throws PermissionDeniedError if the user does not have rights to create
   *  the prize.
   */
  get canCreate() {
    return this.buildMethod(this.buildCanCreate);
  }
  private buildCanCreate(user: User) {
    const containerUser = user;
    return async (prize: Prize, user: User = containerUser) => {
      if (!hasRole(user, "admin")) {
        throw new PermissionDeniedError(
          "Only administrators may create prizes."
        );
      }
    };
  }

  /**
   * Determine if the user may read a specific prize.
   * @param [user] - The user whose permisisons should be used. Defaults to the
   *  current container's user.
   */
  get canRead() {
    return this.buildMethod(this.buildCanRead);
  }
  private buildCanRead(user: User) {
    // TODO: This should be limiting users down by game and prize history.
    const containerUser = user;
    return (user: User = containerUser) => {
      return hasRole(user, "user");
    };
  }

  /**
   * Determine if the user may update a specific prize.
   * @param prize - The prize that is being updated.
   * @param patch - The update that will be applied to the prize.
   * @param [user] - The user whose permissions should be used. Defaults to the
   *  current container's user.
   * @throws PermissionDeniedError if the user does not have rights to perform
   *  the specified update.
   */
  get canUpdate() {
    return this.buildMethod(this.buildCanUpdate);
  }
  private buildCanUpdate(user: User) {
    const containerUser = user;
    return (
      prize: Prize,
      patch: Partial<Prize>,
      user: User = containerUser
    ) => {
      // TODO: This should be limiting users to strictly decrementing the prize
      // total by 1 and verifying it is in their prize history.
      if (!hasRole(user, "user")) {
        throw new PermissionDeniedError("Only users may modify prizes.");
      }
      if (hasRole(user, "admin")) {
        return true;
      }
    };
  }

  /**
   * Determine if the user may delete a specific prize.
   * @param prize - The prize that will be deleted.
   * @param [user] - The user whose permissions should be used. Defaults to the
   *  current container's user.
   * @throws PermissionDeniedError if the user may not delete the prize.
   */
  get canDelete() {
    return this.buildMethod(this.buildCanDelete);
  }
  private buildCanDelete(user: User) {
    // TODO: Needs to recognize roles-per-game once that's a thing. . .
    const containerUser = user;
    return async (prize: Prize, user = containerUser) => {
      if (!hasRole(user, "admin")) {
        throw new PermissionDeniedError("Cannot delete prize.");
      }
    };
  }
}
// tslint:disable-next-line no-empty-interface
export interface PrizeAuthorizationService extends ContainerAware {}
