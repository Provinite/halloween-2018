import { PartialExcept } from "@clovercoin/constants";
import { addSeconds, differenceInSeconds } from "date-fns";
import { Connection, EntityManager, FindManyOptions } from "typeorm";
import { hasRole } from "../../auth/AuthHelpers";
import { IModelAuthorizationService } from "../../auth/IModelAuthorizationService";
import { PermissionDeniedError } from "../../auth/PermissionDeniedError";
import { Component } from "../../reflection/Component";
import { getCurrentTime } from "../../TimeUtils";
import { DrawEvent } from "../DrawEvent";
import { User } from "../User";
import { DrawEventRepository } from "./DrawEventRepository";
import { DrawRateLimitExceededError } from "./DrawRateLimitExceededError";

@Component()
export class DrawEventAuthorizationService
  implements IModelAuthorizationService<DrawEvent> {
  async canCreate(
    user: User,
    createEvent: PartialExcept<DrawEvent, "user">,
    orm: Connection | EntityManager
  ) {
    if (!hasRole(user, "user")) {
      throw new PermissionDeniedError();
    }
    // people can only make draws for themselves
    if (createEvent.user.deviantartUuid !== user.deviantartUuid) {
      throw new PermissionDeniedError();
    }
    const drawEventRepository = orm.getCustomRepository(DrawEventRepository);
    // draws must be separated by 30 seconds
    const lastDraw = await drawEventRepository.getLastDrawEvent(user);
    const lastDrawTime = lastDraw ? lastDraw.createDate : undefined;
    if (
      lastDrawTime !== undefined &&
      differenceInSeconds(getCurrentTime(), lastDrawTime) < 30
    ) {
      const tryAgainAt = addSeconds(lastDrawTime, 30);
      throw new DrawRateLimitExceededError(tryAgainAt);
    }
    return true;
  }

  async canDelete(user: User) {
    // DrawEvents cannot be deleted
    return false;
  }

  async canRead(user: User, drawEvent: DrawEvent) {
    if (!user) {
      return false;
    }
    const isAdmin = hasRole(user, "admin");
    const isOwnEvent = drawEvent.user.deviantartUuid === user.deviantartUuid;
    return isAdmin || isOwnEvent;
  }

  async canUpdate(user: User, drawEvent: DrawEvent) {
    // DrawEvents are immutable
    return false;
  }

  /**
   * Users may only read their own draw events. The incoming filter must include
   * a where.user property.
   * @param user - The user attempting to read multiple.
   * @param findOptions - The query that will be passed to the userRepository's
   *  find many query.
   */
  async canReadMultiple(user: User, findOptions: FindManyOptions<DrawEvent>) {
    if (!user || !hasRole(user, "user")) {
      throw new PermissionDeniedError();
    }
    if (hasRole(user, "admin")) {
      return true;
    }
    if (
      !findOptions ||
      !findOptions.where ||
      typeof findOptions.where !== "object" ||
      !findOptions.where.user
    ) {
      throw new PermissionDeniedError();
    }
    const whereUser = findOptions.where.user;
    let whereUserId: string;
    if (typeof whereUser === "string") {
      whereUserId = whereUser;
    } else {
      whereUserId = whereUser.deviantartUuid;
    }
    if (whereUserId !== user.deviantartUuid) {
      throw new PermissionDeniedError();
    }
    return true;
  }
}
