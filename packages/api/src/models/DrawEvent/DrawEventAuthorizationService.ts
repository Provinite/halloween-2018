import { PartialExcept } from "@clovercoin/constants";
import { FindManyOptions } from "typeorm";
import { hasRole } from "../../auth/AuthHelpers";
import { PermissionDeniedError } from "../../auth/PermissionDeniedError";
import { ContainerAware, MakeContainerAware } from "../../AwilixHelpers";
import { RequestContext } from "../../config/context/RequestContext";
import { Component } from "../../reflection/Component";
import { DrawEvent } from "../DrawEvent";
import { DrawEventRepository } from "./DrawEventRepository";
import { DrawRateLimitExceededError } from "./DrawRateLimitExceededError";
import { RequestUser } from "../../middlewares/AuthorizationMiddlewareFactory";
import * as cronParser from "cron-parser";
import moment = require("moment");
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
    if (!createEvent.user || createEvent.user.id !== user.id) {
      throw new PermissionDeniedError();
    }
    // draws must be separated by 30 seconds
    // TODO: draws must be separated by the configured game time not 30 seconds
    const lastDraw = await this.drawEventRepository.getLastDrawEvent(
      user,
      createEvent.game
    );
    if (!lastDraw) {
      // never drawn before on this game
      return true;
    }
    const lastDrawTime = lastDraw.createDate;

    const { drawResetSchedule } = createEvent.game;
    const cronExpression = cronParser.parseExpression(drawResetSchedule);
    const lastReset = moment(cronExpression.prev().toISOString());
    const nextReset = moment(cronExpression.next().toISOString());

    if (lastReset.isBefore(lastDrawTime)) {
      // alreaedy drew this reset
      throw new DrawRateLimitExceededError(nextReset.toDate());
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
    let whereUserId: number;
    if (typeof whereUser === "number") {
      whereUserId = whereUser;
    } else {
      whereUserId = whereUser.deviantartUuid;
    }
    if (whereUserId !== user.id) {
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
    const isOwnEvent = drawEvent.user.id === user.id;
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
