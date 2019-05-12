import { PartialExcept } from "@clovercoin/constants";
import { AwilixContainer } from "awilix";
import { addSeconds, differenceInSeconds } from "date-fns";
import { Connection, EntityManager, FindManyOptions } from "typeorm";
import { hasRole } from "../../auth/AuthHelpers";
import { PermissionDeniedError } from "../../auth/PermissionDeniedError";
import { ContainerAware, MakeContainerAware } from "../../AwilixHelpers";
import { Component } from "../../reflection/Component";
import { getCurrentTime } from "../../TimeUtils";
import { DrawEvent } from "../DrawEvent";
import { User } from "../User";
import { DrawEventRepository } from "./DrawEventRepository";
import { DrawRateLimitExceededError } from "./DrawRateLimitExceededError";
@Component()
@MakeContainerAware()
export class DrawEventAuthorizationService {
  constructor(public container: AwilixContainer) {}

  /**
   * Determine if a user may create a new draw event.
   * @param createEvent - The partial draw event that will be created.
   * @throws DrawRateLimitExceededError if the user has drawn too recently for
   *  this game.
   * @throws PermissionDeniedError if the user may not create the draw event.
   */
  get canCreate() {
    return this.buildMethod(this.buildCanCreate);
  }
  private buildCanCreate(user: User, orm: Connection | EntityManager) {
    return async (createEvent: PartialExcept<DrawEvent, "user" | "game">) => {
      if (!hasRole(user, "user")) {
        throw new PermissionDeniedError();
      }
      // people can only make draws for themselves
      if (createEvent.user.deviantartUuid !== user.deviantartUuid) {
        throw new PermissionDeniedError();
      }
      if (hasRole(user, "admin")) {
        return true;
      }
      const drawEventRepository = orm.getCustomRepository(DrawEventRepository);
      // draws must be separated by 30 seconds
      const lastDraw = await drawEventRepository.getLastDrawEvent(
        user,
        createEvent.game
      );
      const lastDrawTime = lastDraw ? lastDraw.createDate : undefined;
      if (
        lastDrawTime !== undefined &&
        differenceInSeconds(getCurrentTime(), lastDrawTime) < 30
      ) {
        const tryAgainAt = addSeconds(lastDrawTime, 30);
        throw new DrawRateLimitExceededError(tryAgainAt);
      }
      return true;
    };
  }
  /**
   * Users may only read their own draw events. The incoming filter must include
   * a where.user property.
   * @param findOptions - The query that will be passed to the userRepository's
   *  find many query.
   * @param [user] - The user attempting to read multiple. Defaults to this
   *  container's user.
   * @throws PermissionDeniedError if the user is not allowed to perform this
   *  query.
   */
  get canReadMultiple() {
    return this.buildMethod(this.buildCanReadMultiple);
  }
  buildCanReadMultiple(user: User) {
    const contextUser = user;
    return (
      findOptions: FindManyOptions<DrawEvent>,
      user: User = contextUser
    ) => {
      if (!user || !hasRole(user, "user")) {
        throw new PermissionDeniedError();
      }
      // admins can read anything
      if (hasRole(user, "admin")) {
        return true;
      }
      // users must filter their query down to a specific user
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
    };
  }

  async canDelete(user: User) {
    // DrawEvents cannot be deleted
    throw new PermissionDeniedError("Draw events cannot be deleted.");
  }

  async canRead(user: User, drawEvent: DrawEvent) {
    if (!user) {
      throw new PermissionDeniedError();
    }
    const isAdmin = hasRole(user, "admin");
    const isOwnEvent = drawEvent.user.deviantartUuid === user.deviantartUuid;
    const canRead = isAdmin || isOwnEvent;
    if (!canRead) {
      throw new PermissionDeniedError();
    }
  }

  async canUpdate(user: User, drawEvent: DrawEvent) {
    throw new PermissionDeniedError("Draw events cannot be changed.");
  }
}

// tslint:disable-next-line no-empty-interface
export interface DrawEventAuthorizationService extends ContainerAware {}

declare global {
  interface ApplicationContextMembers {
    /** Service for authenticating actions on DrawEvent models */
    drawEventAuthorizationService: DrawEventAuthorizationService;
  }
}
