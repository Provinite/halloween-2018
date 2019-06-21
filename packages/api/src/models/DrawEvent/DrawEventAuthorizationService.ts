import { PartialExcept } from "@clovercoin/constants";
import { addSeconds, differenceInSeconds } from "date-fns";
import { FindManyOptions } from "typeorm";
import { hasRole } from "../../auth/AuthHelpers";
import { PermissionDeniedError } from "../../auth/PermissionDeniedError";
import { ContainerAware, MakeContainerAware } from "../../AwilixHelpers";
import { RequestContext } from "../../config/context/RequestContext";
import { Component } from "../../reflection/Component";
import { getCurrentTime } from "../../TimeUtils";
import { DrawEvent } from "../DrawEvent";
import { DrawEventRepository } from "./DrawEventRepository";
import { DrawRateLimitExceededError } from "./DrawRateLimitExceededError";
import { RequestUser } from "../../middlewares/AuthorizationMiddlewareFactory";
/**
 * @class DrawEventAuthorizationService
 * Service for authorizing users to perform operations on DrawEvent models.
 */
@Component("SCOPED")
@MakeContainerAware()
export class DrawEventAuthorizationService {
  private user: RequestUser;
  private drawEventRepository: DrawEventRepository;
  /** @inject */
  constructor({ user, drawEventRepository }: RequestContext) {
    this.user = user;
    this.drawEventRepository = drawEventRepository;
  }

  /**
   * Determine if a user may create a new draw event.
   * @param createEvent - The partial draw event that will be created.
   * @param [user] - The user doing the creating. Defaults to the request's user.
   * @throws DrawRateLimitExceededError if the user has drawn too recently for
   *  this game.
   * @throws PermissionDeniedError if the user may not create the draw event.
   */
  async canCreate(
    createEvent: PartialExcept<DrawEvent, "user" | "game">,
    user = this.user
  ) {
    if (!hasRole(user, "user")) {
      throw new PermissionDeniedError();
    }
    user = user!;
    // people can only make draws for themselves
    if (
      !createEvent.user ||
      createEvent.user.deviantartUuid !== user.deviantartUuid
    ) {
      throw new PermissionDeniedError();
    }
    // admins don't have to wait
    // TODOD: remove this
    if (hasRole(user, "admin")) {
      return true;
    }
    // draws must be separated by 30 seconds
    // TODO: draws must be separated by the configured game time not 30 seconds
    const lastDraw = await this.drawEventRepository.getLastDrawEvent(
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
  async canReadMultiple(
    findOptions: FindManyOptions<DrawEvent>,
    user: RequestUser = this.user
  ): Promise<true> {
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
  }

  async canDelete(user: RequestUser) {
    // DrawEvents cannot be deleted
    throw new PermissionDeniedError("Draw events cannot be deleted.");
  }

  async canRead(user: RequestUser, drawEvent: DrawEvent): Promise<true> {
    if (!user) {
      throw new PermissionDeniedError();
    }
    const isAdmin = hasRole(user, "admin");
    const isOwnEvent = drawEvent.user.deviantartUuid === user.deviantartUuid;
    const canRead = isAdmin || isOwnEvent;
    if (!canRead) {
      throw new PermissionDeniedError();
    }
    return true;
  }

  async canUpdate(user: RequestUser, drawEvent: DrawEvent) {
    throw new PermissionDeniedError("Draw events cannot be changed.");
  }
}

// tslint:disable-next-line no-empty-interface
export interface DrawEventAuthorizationService extends ContainerAware {}

declare global {
  interface RequestContextMembers {
    /** Service for authenticating actions on DrawEvent models */
    drawEventAuthorizationService: DrawEventAuthorizationService;
  }
}
